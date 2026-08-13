import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Pause, Play, Plus, Sparkles, Workflow, X } from "lucide-react";
import { sourceIcons } from "@/components/work-bits";
import { automations, sourceMeta } from "@/lib/hr-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/automations")({
  head: () => ({
    meta: [
      { title: "Automations — HR Copilot" },
      {
        name: "description",
        content:
          "The library of HR automations the Copilot can execute: onboarding, verification letters, attendance reconciliation and more.",
      },
      { property: "og:title", content: "Automations — HR Copilot" },
      {
        property: "og:description",
        content: "Browse, run, pause and create the HR processes your Copilot executes.",
      },
    ],
  }),
  component: Automations,
});

const statusTone = {
  live: "bg-success/15 text-success border-success/30",
  draft: "bg-info/15 text-info border-info/30",
  paused: "bg-muted text-muted-foreground border-border",
};

function Automations() {
  const [creating, setCreating] = useState(false);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <Workflow className="size-5 text-primary" />
            Automations
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Standardised HR processes the Copilot can execute end to end. Anything not here still
            gets done through chat.
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="size-4" />
          Create automation
        </button>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {automations.map((a) => {
          const Icon = sourceIcons[a.source];
          return (
            <article key={a.id} className="panel flex flex-col p-4">
              <div className="flex items-start gap-3">
                <div className="flex size-9 items-center justify-center rounded-md bg-accent">
                  <Icon className="size-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-sm font-semibold">{a.name}</h2>
                  <p className="text-[11px] text-muted-foreground">
                    Trigger: {a.trigger} · {sourceMeta[a.source].system}
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase",
                    statusTone[a.status],
                  )}
                >
                  {a.status}
                </span>
              </div>

              <p className="mt-3 flex-1 text-xs leading-relaxed text-muted-foreground">
                {a.description}
              </p>

              <dl className="mt-4 grid grid-cols-4 gap-2 border-t border-border pt-3 text-center">
                {[
                  { k: "Steps", v: a.steps },
                  { k: "Approvals", v: a.approvals },
                  { k: "Runs 30d", v: a.runs30d },
                  { k: "Clean", v: a.successRate ? `${a.successRate}%` : "—" },
                ].map((s) => (
                  <div key={s.k}>
                    <dd className="font-display text-sm font-semibold">{s.v}</dd>
                    <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      {s.k}
                    </dt>
                  </div>
                ))}
              </dl>

              <div className="mt-3 flex items-center gap-2">
                <Link
                  to="/chat"
                  search={{ automation: a.id }}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border-strong px-3 py-1.5 text-xs font-medium hover:bg-surface-raised"
                >
                  <Play className="size-3" />
                  Run
                </Link>
                <button
                  className="rounded-md border border-border p-1.5 text-muted-foreground hover:bg-surface-raised"
                  aria-label={a.status === "paused" ? "Resume automation" : "Pause automation"}
                >
                  {a.status === "paused" ? (
                    <Play className="size-3.5" />
                  ) : (
                    <Pause className="size-3.5" />
                  )}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {creating && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm">
          <div className="panel w-full max-w-lg p-5">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 size-4 text-primary" />
              <div className="flex-1">
                <h2 className="text-sm font-semibold">Create automation</h2>
                <p className="text-xs text-muted-foreground">
                  Describe the process. The Copilot drafts the steps, picks the source system and
                  marks where a human must approve.
                </p>
              </div>
              <button
                onClick={() => setCreating(false)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>
            <textarea
              rows={4}
              placeholder="e.g. When a badge reissue ticket arrives, verify identity, open a facilities request and notify the employee."
              className="mt-4 w-full resize-none rounded-md border border-border bg-surface p-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50"
            />
            <p className="mt-2 text-[11px] text-muted-foreground">
              Demo only — drafting isn't wired up yet.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setCreating(false)}
                className="rounded-md border border-border-strong px-3 py-1.5 text-xs hover:bg-surface-raised"
              >
                Cancel
              </button>
              <button className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90">
                Draft steps
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
