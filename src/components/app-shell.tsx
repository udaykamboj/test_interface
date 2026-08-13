import { Link, useRouterState } from "@tanstack/react-router";
import {
  Boxes,
  Inbox,
  LayoutGrid,
  MessageSquarePlus,
  Plug,
  Radar,
  Sparkles,
  Workflow,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { inboxCounts } from "@/lib/hr-data";
import { intakeStats } from "@/lib/intake-data";

const nav = [
  { to: "/intake", label: "Intake", icon: Radar, badge: String(intakeStats.open) },
  { to: "/work", label: "Work queue", icon: Inbox, badge: String(inboxCounts.needsApproval) },
  { to: "/automations", label: "Automations", icon: Workflow, badge: null },
  { to: "/systems", label: "Connected systems", icon: Plug, badge: null },
  { to: "/", label: "Command center", icon: LayoutGrid, badge: null as string | null },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        <div className="flex items-center gap-2.5 px-4 py-4">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary/15 text-primary">
            <Sparkles className="size-4" />
          </div>
          <div className="leading-tight">
            <p className="font-display text-sm font-semibold text-sidebar-foreground">HR Copilot</p>
            <p className="text-[11px] text-muted-foreground">Execution layer</p>
          </div>
        </div>

        <div className="px-3 pb-3">
          <Link
            to="/chat"
            className={cn(
              "flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90",
            )}
          >
            <MessageSquarePlus className="size-4" />
            New task
          </Link>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 px-2">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive(item.to) && "bg-sidebar-accent text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="size-4" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="rounded bg-warning/20 px-1.5 text-[11px] font-semibold text-warning">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}

          <div className="mt-6 px-2.5">
            <p className="label-caps">Coverage</p>
          </div>
          <div className="space-y-2 px-2.5 pt-2 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Auto-resolved</span>
              <span className="text-primary">{inboxCounts.autoResolved}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>HR hours saved</span>
              <span className="text-foreground">{inboxCounts.hoursSaved}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Systems feeding in</span>
              <span className="text-foreground">6</span>
            </div>
          </div>
        </nav>

        <div className="m-3 rounded-md border border-sidebar-border bg-surface p-3">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-full bg-accent text-xs font-semibold">
              PN
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-xs font-medium">Priya Nair</p>
              <p className="truncate text-[11px] text-muted-foreground">HR Business Partner</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur md:px-6">
          <Boxes className="size-4 text-muted-foreground md:hidden" />
          <p className="text-xs text-muted-foreground">
            Work arrives from ticketing, recruiting, attendance and leave systems — executed here.
          </p>
          <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-1">
              <span className="size-1.5 rounded-full bg-primary" />
              Shared data layer live
            </span>
          </div>
        </header>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
