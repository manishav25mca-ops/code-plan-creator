import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: () =>
        Response.json({ status: "ok", aiConfigured: Boolean(process.env["LOVABLE_API_KEY"]) }),
    },
  },
});
