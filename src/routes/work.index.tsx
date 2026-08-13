import { createFileRoute, Link } from "@tanstack/react-router";
import { Filter, Inbox } from "lucide-react";
import { WorkRow } from "@/components/work-bits";
import { statusMeta, workItems, type WorkStatus } from "@/lib/hr-data";
import { cn } from "@/lib/utils";

type StatusFilter = WorkStatus | "all";

export const Route = createFileRoute("/work/")({
  validateSearch: (search: Record<string, unknown>): { status: StatusFilter } => {
    const raw = search["status"];
    const valid = ["needs_approval", "running", "queued", "blocked", "completed"];
    return {
      status: (typeof raw === "string" && valid.includes(raw) ? raw : "all") as StatusFilter,
    };
  },
  head: () => ({
    meta: [
      { title: "Work queue — HR Copilot" },
      {
        name: "description",
        content:
          "Every ticket, hiring event, attendance exception and ad hoc HR request the Copilot is handling, in one queue.",
      },
      { property: "og:title", content: "Work queue — HR Copilot" },
      {
        property: "og:description",
        content: "Filter HR work by state: approvals, running, queued, blocked, completed.",
      },
    ],
  }),
  component: WorkQueue,
});

const filters: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All work" },
  { key: "needs_approval", label: statusMeta.needs_approval.label },
  { key: "running", label: statusMeta.running.label },
  { key: "queued", label: statusMeta.queued.label },
  { key: "blocked", label: statusMeta.blocked.label },
  { key: "completed", label: statusMeta.completed.label },
];

function WorkQueue() {
  const { status } = Route.useSearch();
  const items = status === "all" ? workItems : workItems.filter((w) => w.status === status);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <Inbox className="size-5 text-primary" />
            Work queue
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Work created by other HR systems, plus ad hoc requests, executed by the Copilot.
          </p>
        </div>
        <Link
          to="/chat"
          className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          New task
        </Link>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Filter className="size-3.5 text-muted-foreground" />
        {filters.map((f) => {
          const count =
            f.key === "all" ? workItems.length : workItems.filter((w) => w.status === f.key).length;
          return (
            <Link
              key={f.key}
              to="/work"
              search={{ status: f.key }}
              className={cn(
                "rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:border-border-strong",
                status === f.key && "border-primary/40 bg-primary/10 text-primary",
              )}
            >
              {f.label}
              <span className="ml-1.5 opacity-70">{count}</span>
            </Link>
          );
        })}
      </div>

      <div className="panel mt-4 overflow-hidden">
        {items.length ? (
          items.map((item) => <WorkRow key={item.id} item={item} />)
        ) : (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            Nothing in this state right now.
          </p>
        )}
      </div>
    </div>
  );
}
