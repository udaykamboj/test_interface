import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  Sparkles,
  TicketCheck,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  sourceMeta,
  statusMeta,
  type WorkItem,
  type WorkSource,
  type WorkStatus,
} from "@/lib/hr-data";

export const sourceIcons: Record<WorkSource, typeof TicketCheck> = {
  ticketing: TicketCheck,
  recruiting: UserPlus,
  attendance: Clock,
  leave: CalendarClock,
  documents: FileText,
  adhoc: Sparkles,
};

const toneClasses: Record<string, string> = {
  warning: "bg-warning/15 text-warning border-warning/30",
  primary: "bg-primary/15 text-primary border-primary/30",
  muted: "bg-muted text-muted-foreground border-border",
  destructive: "bg-destructive/15 text-destructive border-destructive/30",
  success: "bg-success/15 text-success border-success/30",
};

export function StatusPill({ status, className }: { status: WorkStatus; className?: string }) {
  const meta = statusMeta[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        toneClasses[meta.tone],
        className,
      )}
    >
      {status === "running" ? (
        <Loader2 className="size-3 animate-spin" />
      ) : status === "needs_approval" ? (
        <AlertTriangle className="size-3" />
      ) : status === "completed" ? (
        <CheckCircle2 className="size-3" />
      ) : (
        <span className="size-1.5 rounded-full bg-current" />
      )}
      {meta.label}
    </span>
  );
}

export function SourceTag({ source }: { source: WorkSource }) {
  const Icon = sourceIcons[source];
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
      <Icon className="size-3.5" />
      {sourceMeta[source].label}
      <span className="text-border-strong">·</span>
      {sourceMeta[source].system}
    </span>
  );
}

export function WorkRow({ item }: { item: WorkItem }) {
  return (
    <Link
      to="/work/$workId"
      params={{ workId: item.id }}
      className="group flex flex-col gap-2 border-b border-border px-4 py-3 transition-colors last:border-0 hover:bg-surface-raised/60 md:flex-row md:items-center md:gap-4"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-muted-foreground">{item.id}</span>
          {item.priority !== "normal" && (
            <span
              className={cn(
                "rounded px-1.5 text-[10px] font-semibold uppercase tracking-wide",
                item.priority === "urgent"
                  ? "bg-destructive/15 text-destructive"
                  : "bg-warning/15 text-warning",
              )}
            >
              {item.priority}
            </span>
          )}
        </div>
        <p className="truncate text-sm font-medium text-foreground group-hover:text-primary">
          {item.title}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          <SourceTag source={item.source} />
          <span className="text-[11px] text-muted-foreground">{item.externalRef}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 md:w-[420px] md:justify-end">
        <div className="hidden text-right lg:block">
          <p className="text-xs text-foreground">{item.subject.name}</p>
          <p className="text-[11px] text-muted-foreground">{item.subject.role}</p>
        </div>
        <div className="hidden w-28 sm:block">
          <div className="h-1 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full",
                item.status === "blocked" ? "bg-destructive" : "bg-primary",
              )}
              style={{ width: `${item.progress}%` }}
            />
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground">{item.sla}</p>
        </div>
        <StatusPill status={item.status} />
      </div>
    </Link>
  );
}
