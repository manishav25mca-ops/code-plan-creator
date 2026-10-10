// Server-only: builds the prompt and streams a plan from Lovable AI,
// falling back to Google Gemini when LOVABLE_API_KEY is unavailable (e.g. Vercel).
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText, type LanguageModel } from "ai";
import { z } from "zod";

export const ERROR_MARKER = "\u0000ERROR:";

export const planInputSchema = z.object({
  title: z.string().trim().min(3, "Please enter a project idea (at least 3 characters).").max(200),
  description: z.string().trim().max(3000).optional().default(""),
  projectType: z.enum(["Web Application", "Mobile Application", "AI/ML Project", "Other"]).optional(),
  techStack: z.string().trim().max(300).optional().default(""),
  teamSize: z.coerce.number().int().min(1).max(50).optional(),
  duration: z.string().trim().max(100).optional().default(""),
  experience: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
});
export type PlanInput = z.infer<typeof planInputSchema>;

const SYSTEM_PROMPT = `You are an intelligent Project Planning Agent for student software projects. Analyze the project idea and develop a complete, practical project plan.

Perform the following tasks:
- Identify the project objectives.
- Divide the project into suitable modules and describe their functions.
- Identify the required technologies, frameworks, libraries, and tools.
- Break development into small, manageable tasks.
- Arrange the tasks in the correct order and identify dependencies.
- Define milestones and realistic estimated completion times based on the available duration, team size, and experience level.
- Prepare a testing plan with test cases, expected results, and relevant modules.
- Identify possible technical, scheduling, and implementation challenges and suggest practical solutions.

Adapt the recommendations to the project details provided by the user. Avoid unnecessary technologies and unrealistic timelines. Clearly distinguish estimates from fixed deadlines. Do not invent completed work or claim that tests have been executed.

Return a well-organized project plan with clear headings, tables, numbered lists, and actionable development steps.

OUTPUT FORMAT (strict): GitHub-flavored Markdown. Use EXACTLY these nine level-2 headings, in this order, and no other level-2 headings:
## 1. Project Overview
(Project title, problem statement, objectives as a list, expected outcome)
## 2. Module Breakdown
(table: Module | Main Functions | Tasks Involved)
## 3. Technology Requirements
(table: Technology / Tool | Purpose | Where Used)
## 4. Development Tasks
(table: Task ID | Task Description | Estimated Duration | Dependency | Priority — IDs like T1, T2)
## 5. Task Sequence
(numbered order of work, plus a list of tasks that can run in parallel)
## 6. Milestones and Timeline
(table: Milestone | Deliverables | Estimated Completion — must fit the stated duration; label all times as estimates)
## 7. Testing Plan
(table: Test Case ID | Module | Test Scenario | Expected Result)
## 8. Risks and Solutions
(table: Risk | Impact | Prevention / Solution)
## 9. Final Development Roadmap
(concise ordered checklist using "- [ ]" items)
Do not add any text before the first heading.`;

function buildUserPrompt(d: PlanInput) {
  const lines = [
    `Project idea: ${d.title}`,
    `Description: ${d.description || "Not provided"}`,
    `Project type: ${d.projectType ?? "Not specified"}`,
    `Preferred technology stack: ${d.techStack || "No preference — recommend a suitable, minimal stack"}`,
    `Team size: ${d.teamSize ?? "Not specified (assume 1-2 students)"}`,
    `Available duration: ${d.duration || "Not specified (assume about 8 weeks)"}`,
    `Experience level: ${d.experience ?? "Not specified (assume Intermediate)"}`,
  ];
  return `Create a project plan for this student project.\n\n${lines.join("\n")}`;
}

/** Turn a gateway/SDK error into a safe, friendly message. */
function friendlyError(err: unknown): string {
  const e = err as { statusCode?: number; status?: number; message?: string };
  const status = e?.statusCode ?? e?.status;
  if (status === 429) return "The AI service is busy right now. Please wait a moment and try again.";
  if (status === 402) return "AI credits have run out for this workspace. Please add credits and try again.";
  if (status === 401) return "The AI service is not configured correctly. Please contact the app owner.";
  if (status === 403) return "AI access is currently blocked for this workspace.";
  if (status && status >= 500) return "The AI service had a temporary problem. Please try again shortly.";
  return "Something went wrong while generating the plan. Please try again.";
}

export async function handleGeneratePlan(request: Request): Promise<Response> {
  const json = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json(400, { error: "Invalid request body." });
  }
  const parsed = planInputSchema.safeParse(body);
  if (!parsed.success) {
    return json(400, { error: parsed.error.issues[0]?.message ?? "Invalid input." });
  }

  const lovableKey = process.env["LOVABLE_API_KEY"];
  const geminiKey = process.env["GEMINI_API_KEY"];
  if (!lovableKey && !geminiKey) {
    return json(500, { error: "The AI service is not configured (missing API key)." });
  }

  let model: LanguageModel;
  let openaiOptions:
    | {
        forceReasoning: true;
        reasoningEffort: "low";
        reasoningSummary: "auto";
        store: false;
        include: ["reasoning.encrypted_content"];
      }
    | undefined;
  if (lovableKey) {
    const provider = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey: lovableKey,
      headers: { "Lovable-API-Key": lovableKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    });
    model = provider.responses("openai/gpt-6-astra");
    openaiOptions = {
      forceReasoning: true,
      reasoningEffort: "low",
      reasoningSummary: "auto",
      store: false,
      include: ["reasoning.encrypted_content"],
    };
  } else {
    const google = createGoogleGenerativeAI({ apiKey: geminiKey! });
    model = google("gemini-2.5-flash");
  }

  const result = streamText({
    model,
    instructions: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserPrompt(parsed.data) }],
    abortSignal: request.signal,
    ...(openaiOptions ? { providerOptions: { openai: openaiOptions } } : {}),
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let gotText = false;
      try {
        for await (const part of result.fullStream) {
          if (part.type === "text-delta") {
            gotText = true;
            controller.enqueue(encoder.encode(part.text));
          } else if (part.type === "error") {
            throw part.error;
          }
        }
        if (!gotText) controller.enqueue(encoder.encode(ERROR_MARKER + "The AI returned an empty response. Please try again."));
      } catch (err) {
        if (!request.signal.aborted) {
          console.error("generate-plan failed", (err as Error)?.message);
          controller.enqueue(encoder.encode(ERROR_MARKER + friendlyError(err)));
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" } });
}
