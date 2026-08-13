import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Plug, RefreshCw } from "lucide-react";
import { connectedSystems } from "@/lib/hr-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/systems")({
  head: () => ({
    meta: [
      { title: "Connected systems — HR Copilot" },
      {
        name: "description",
        content:
          "The HR platforms that feed work into the Copilot: ticketing, recruiting, attendance, leave, employee portal and payroll.",
      },
      { property: "og:title", content: "Connected systems — HR Copilot" },
      {
        property: "og:description",
        content: "Where HR work comes from and where the Copilot writes back.",
      },
    ],
  }),
  component: Systems,
});

function Systems() {
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6 md:px-6">
      <h1 className="flex items-center gap-2 text-2xl font-semibold">
        <Plug className="size-5 text-primary" />
        Connected systems
      </h1>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        We don't replace your HRIS or ticketing tools. They create and expose the work; the Copilot
        reads it from the shared data layer, executes it with your HR team, and writes results back.
      </p>

      <div className="panel mt-6 flex flex-wrap items-center gap-3 p-4 text-xs text-muted-foreground">
        <span className="rounded-md border border-border px-2 py-1 text-foreground">
          HR systems
        </span>
        <ArrowRight className="size-3.5" />
        <span className="rounded-md border border-border px-2 py-1">requests · events · tasks</span>
        <ArrowRight className="size-3.5" />
        <span className="rounded-md border border-primary/40 bg-primary/10 px-2 py-1 text-primary">
          HR Copilot execution layer
        </span>
        <ArrowRight className="size-3.5" />
        <span className="rounded-md border border-border px-2 py-1">HR team action & approval</span>
      </div>

      <div className="panel mt-4 overflow-hidden">
        {connectedSystems.map((s) => (
          <div
            key={s.name}
            className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3 last:border-0"
          >
            <span
              className={cn(
                "size-2 rounded-full",
                s.status === "live" ? "bg-success" : "bg-warning",
              )}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{s.name}</p>
              <p className="text-[11px] text-muted-foreground">{s.kind}</p>
            </div>
            <p className="text-xs text-muted-foreground">{s.inbound}</p>
            <p className="flex items-center gap-1.5 w-28 justify-end text-[11px] text-muted-foreground">
              <RefreshCw className="size-3" />
              {s.lastSync}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Integrations and MCP connections are configured here in the real product; this view is
        read-only in the demo.
      </p>
    </div>
  );
}
