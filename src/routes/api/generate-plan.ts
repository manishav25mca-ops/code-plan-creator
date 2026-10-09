import { createFileRoute } from "@tanstack/react-router";
import { handleGeneratePlan } from "@/lib/plan.server";

export const Route = createFileRoute("/api/generate-plan")({
  server: { handlers: { POST: ({ request }) => handleGeneratePlan(request) } },
});
