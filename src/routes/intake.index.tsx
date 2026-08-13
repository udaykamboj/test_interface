import { createFileRoute, Link } from "@tanstack/react-router";
import { Inbox, LayoutGrid, ListFilter, Radar, ShieldCheck, Zap } from "lucide-react";
import { ClusterCard, IntakeRow } from "@/components/intake-bits";
import {
  dispositionMeta,
  intakeClusters,
  intakeItems,
  intakeStats,
  type IntakeDisposition,
} from "@/lib/intake-data";
import { cn } from "@/lib/utils";

type View = "decide" | "clusters" | "stream";

export const Route = createFileRoute("/intake/")({
  validateSearch: (search: Record<string, unknown>): { view: View } => {
    const raw = search["view"];
    const valid = ["decide", "clusters", "stream"];
    return { view: (typeof raw === "string" && valid.includes(raw) ? raw : "decide") as View };
  },
  head: () => ({
    meta: [
      { title: "Intake — HR Copilot" },
      {
        name: "description",
        content:
          "Everything arriving for HR — tickets, hiring events, attendance exceptions, leave, and requests that fit no category — triaged by decision instead of stacked in an inbox.",
      },
      { property: "og:title", content: "Intake — HR Copilot" },
      {
        property: "og:description",
        content:
          "Triage incoming HR demand by the decision it needs, with clusters that adapt as new kinds of requests appear.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: IntakePage,
});

const views: { key: View; label: string; icon: typeof LayoutGrid }[] = [
  { key: "decide", label: "By decision", icon: Zap },
  { key: "clusters", label: "By cluster", icon: LayoutGrid },
  { key: "stream", label: "Full stream", icon: ListFilter },
];

const lanes: { key: IntakeDisposition; accent: string }[] = [
  { key: "human", accent: "border-warning/40" },
  { key: "assist", accent: "border-primary/40" },
  { key: "auto", accent: "border-success/40" },
];

function IntakePage() {
  const { view } = Route.useSearch();
  const open = intakeItems.filter((i) => i.state !== "handled");

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <Inbox className="size-5 text-primary" />
            Intake
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Everything arriving for HR, from every system and every channel. Sorted by the decision
            it needs from you — not by when it landed.
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-md border border-border p-1">
          {views.map((v) => (
            <Link
              key={v.key}
              to="/intake"
              search={{ view: v.key }}
              className={cn(
                "inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground",
                view === v.key && "bg-surface-raised text-foreground",
              )}
            >
              <v.icon className="size-3.5" />
              {v.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Arrived today" value={String(intakeStats.arrivedToday)} sub="all channels" />
        <Stat
          label="Absorbed by Copilot"
          value={String(intakeStats.autoAbsorbed)}
          sub="no human touch"
          tone="success"
        />
        <Stat
          label="Open for HR"
          value={String(intakeStats.open)}
          sub={`${intakeStats.needsJudgement} need your judgement`}
          tone="warning"
        />
        <Stat
          label="New patterns"
          value={String(intakeStats.newPatterns)}
          sub="clusters with no playbook"
          tone="warning"
        />
      </div>

      {view === "decide" && (
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {lanes.map((lane) => {
            const meta = dispositionMeta[lane.key];
            const items = open.filter((i) => i.disposition === lane.key);
            return (
              <section key={lane.key} className={cn("panel overflow-hidden border-t-2", lane.accent)}>
                <div className="border-b border-border px-4 py-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{meta.label}</p>
                    <span className="rounded bg-muted px-1.5 text-xs text-muted-foreground">
                      {items.length}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{meta.blurb}</p>
                </div>
                {items.length ? (
                  items.map((item) => <IntakeRow key={item.id} item={item} />)
                ) : (
                  <p className="px-4 py-8 text-center text-xs text-muted-foreground">
                    Nothing waiting here.
                  </p>
                )}
              </section>
            );
          })}
        </div>
      )}

      {view === "clusters" && (
        <>
          <div className="mt-6 flex items-center gap-2">
            <Radar className="size-4 text-warning" />
            <h2 className="text-sm font-medium">Emerging — no playbook yet</h2>
            <p className="text-xs text-muted-foreground">
              Grouped automatically from requests that didn&apos;t fit an existing category.
            </p>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {intakeClusters
              .filter((c) => c.discovered)
              .map((c) => (
                <ClusterCard
                  key={c.id}
                  cluster={c}
                  count={open.filter((i) => i.clusterId === c.id).length}
                />
              ))}
          </div>

          <div className="mt-7 flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            <h2 className="text-sm font-medium">Known streams</h2>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {intakeClusters
              .filter((c) => !c.discovered)
              .map((c) => (
                <ClusterCard
                  key={c.id}
                  cluster={c}
                  count={open.filter((i) => i.clusterId === c.id).length}
                />
              ))}
          </div>
        </>
      )}

      {view === "stream" && (
        <div className="panel mt-5 overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <p className="text-xs text-muted-foreground">
              Newest first · every channel · {intakeItems.length} items
            </p>
            <p className="text-[11px] text-muted-foreground">Age</p>
          </div>
          {[...intakeItems]
            .sort((a, b) => a.ageMinutes - b.ageMinutes)
            .map((item) => (
              <IntakeRow key={item.id} item={item} dense />
            ))}
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  tone = "muted",
}: {
  label: string;
  value: string;
  sub: string;
  tone?: "muted" | "success" | "warning";
}) {
  return (
    <div className="panel p-4">
      <p className="label-caps">{label}</p>
      <p
        className={cn(
          "mt-1.5 text-2xl font-semibold",
          tone === "success" && "text-success",
          tone === "warning" && "text-warning",
        )}
      >
        {value}
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}
