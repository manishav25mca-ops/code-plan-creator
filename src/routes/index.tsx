import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ProjectForm, EXAMPLES } from "@/components/ProjectForm";
import { PlanView } from "@/components/PlanView";
import { planToMarkdown, streamPlan, type ProjectDetails } from "@/lib/plan-api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Project Planning Agent — AI plans for student software projects" },
      { name: "description", content: "Turn a software project idea into modules, tasks, milestones, a testing plan and risks in seconds." },
      { property: "og:title", content: "Project Planning Agent" },
      { property: "og:description", content: "Turn a student software project idea into a complete, practical project plan with AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const EMPTY: ProjectDetails = { title: "", description: "", projectType: "", techStack: "", teamSize: "", duration: "", experience: "" };

function Index() {
  const [details, setDetails] = useState<ProjectDetails>(EMPTY);
  const [planFor, setPlanFor] = useState<ProjectDetails | null>(null);
  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(true);
  const abortRef = useRef<AbortController | null>(null);

  async function generate(input: ProjectDetails) {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    setError(null);
    setPlan("");
    setPlanFor(input);
    setEditing(false);
    try {
      const full = await streamPlan(input, setPlan, ctrl.signal);
      setPlan(full);
    } catch (e) {
      if (ctrl.signal.aborted) return;
      setError((e as Error).message);
      setPlan("");
      setPlanFor(null);
      setEditing(true);
    } finally {
      if (abortRef.current === ctrl) setLoading(false);
    }
  }

  function stop() {
    abortRef.current?.abort();
    setLoading(false);
  }

  const fullMd = planFor ? planToMarkdown(planFor, plan) : "";

  async function copy() {
    try {
      await navigator.clipboard.writeText(fullMd);
      toast.success("Plan copied to clipboard");
    } catch {
      toast.error("Could not copy — your browser blocked clipboard access.");
    }
  }

  function download() {
    const blob = new Blob([fullMd], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(planFor?.title || "project").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-plan.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const showPlan = planFor && !editing;

  return (
    <div className="min-h-screen">
      <header className="blueprint">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:py-14">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">AI · Student projects</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-6xl">Project Planning Agent</h1>
          <p className="mt-4 max-w-2xl text-base opacity-80 sm:text-lg">
            Describe your software project idea. Get objectives, modules, tasks, dependencies, milestones, a testing plan and risks — tailored to your team and timeline.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8 sm:py-10">
        {!showPlan && (
          <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
            <ProjectForm value={details} onChange={setDetails} onSubmit={() => generate(details)} loading={loading} error={error} />
            <div>
              <h3 className="text-lg font-semibold">Try an example</h3>
              <div className="mt-3 space-y-3">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex.title}
                    type="button"
                    onClick={() => setDetails({ ...EMPTY, ...ex })}
                    className="block w-full rounded-lg border bg-card p-4 text-left transition hover:-translate-y-0.5 hover:border-accent hover:shadow-md"
                  >
                    <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{ex.projectType}</span>
                    <span className="mt-1 block font-semibold">{ex.title}</span>
                    <span className="mt-1 line-clamp-2 block text-sm text-muted-foreground">{ex.description}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {showPlan && (
          <>
            <div className="mb-6 flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Plan for</p>
                <p className="truncate text-lg font-semibold">{planFor.title}</p>
                <p className="text-xs text-muted-foreground">
                  {[planFor.projectType, planFor.teamSize && `${planFor.teamSize} members`, planFor.duration, planFor.experience].filter(Boolean).join(" · ") || "No extra details"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {loading ? (
                  <Button variant="outline" onClick={stop}>Stop</Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={copy}>Copy</Button>
                    <Button variant="outline" onClick={download}>Download .md</Button>
                    <Button variant="outline" onClick={() => { setDetails(planFor); setEditing(true); }}>Edit details</Button>
                    <Button onClick={() => generate(planFor)}>Regenerate Plan</Button>
                  </>
                )}
              </div>
            </div>
            <PlanView markdown={plan} loading={loading} />
            {!loading && (
              <p className="mt-6 text-center text-xs text-muted-foreground">AI-generated plan. All durations are estimates, not fixed deadlines — review before use.</p>
            )}
          </>
        )}
      </main>
    </div>
  );
}
