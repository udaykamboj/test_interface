import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  Layers,
  Loader2,
  Paperclip,
  Send,
  ShieldQuestion,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { SourceTag, StatusPill } from "@/components/work-bits";
import {
  getAutomation,
  getWorkItem,
  type ChatMessage,
  type RunStep,
  type WorkItem,
} from "@/lib/hr-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/work/$workId")({
  loader: ({ params }) => {
    const item = getWorkItem(params.workId);
    if (!item) throw notFound();
    return { item };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Unavailable — HR Copilot" }, { name: "robots", content: "noindex" }],
      };
    }
    return {
      meta: [
        { title: `${loaderData.item.id} · ${loaderData.item.title} — HR Copilot` },
        { name: "description", content: loaderData.item.summary.slice(0, 155) },
        { property: "og:title", content: `${loaderData.item.id} — HR Copilot` },
        { property: "og:description", content: loaderData.item.summary.slice(0, 155) },
      ],
    };
  },
  component: WorkDetail,
});

function stepIcon(state: RunStep["state"]) {
  if (state === "done") return <CheckCircle2 className="size-3.5 text-success" />;
  if (state === "active") return <Loader2 className="size-3.5 animate-spin text-primary" />;
  if (state === "approval") return <ShieldQuestion className="size-3.5 text-warning" />;
  if (state === "failed") return <XCircle className="size-3.5 text-destructive" />;
  return <CircleDashed className="size-3.5 text-muted-foreground" />;
}

function WorkDetail() {
  const { item } = Route.useLoaderData() as { item: WorkItem };
  const automation = item.automation ? getAutomation(item.automation) : undefined;
  const [messages, setMessages] = useState<ChatMessage[]>(item.messages);
  const [resolved, setResolved] = useState<Record<string, "approved" | "declined">>({});
  const [draft, setDraft] = useState("");

  const decide = (msg: ChatMessage, decision: "approved" | "declined") => {
    setResolved((r) => ({ ...r, [msg.id]: decision }));
    setMessages((m) => [
      ...m,
      {
        id: `${msg.id}-result`,
        role: "agent",
        time: "now",
        body:
          decision === "approved"
            ? `Approved — dispatching to ${msg.approval?.target}. I'll report back as soon as it lands and continue with the remaining steps.`
            : `Declined. I've paused this step and left the run open. Tell me what to change and I'll redo it.`,
      },
    ]);
    toast[decision === "approved" ? "success" : "message"](
      decision === "approved" ? "Action approved" : "Action declined",
      { description: msg.approval?.title },
    );
  };

  const send = () => {
    if (!draft.trim()) return;
    const text = draft.trim();
    setDraft("");
    setMessages((m) => [
      ...m,
      { id: `u-${m.length}`, role: "user", time: "now", body: text },
      {
        id: `a-${m.length}`,
        role: "agent",
        time: "now",
        body: "Noted — this is a demo run, so I'm not calling live systems yet. In production I'd apply this to the current step and update the canvas.",
      },
    ]);
  };

  return (
    <div className="flex h-[calc(100vh-49px)] min-w-0 flex-col">
      <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3 md:px-6">
        <Link
          to="/work"
          search={{ status: "all" }}
          className="flex size-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-surface-raised"
          aria-label="Back to work queue"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-muted-foreground">{item.id}</span>
            <SourceTag source={item.source} />
          </div>
          <h1 className="truncate text-sm font-semibold">{item.title}</h1>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {automation && (
            <Link
              to="/automations"
              className="hidden items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-surface-raised sm:flex"
            >
              <Sparkles className="size-3 text-primary" />
              {automation.name}
              <ChevronRight className="size-3" />
            </Link>
          )}
          <StatusPill status={item.status} />
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)_260px]">
        {/* Chat */}
        <section className="flex min-h-0 flex-col border-border lg:border-r">
          <div className="flex items-center gap-2 border-b border-border px-4 py-2">
            <Sparkles className="size-3.5 text-primary" />
            <p className="text-xs font-medium">Copilot chat</p>
            <span className="ml-auto text-[11px] text-muted-foreground">
              automation & execution only
            </span>
          </div>
          <div className="scroll-slim min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {messages.map((m) => (
              <div key={m.id}>
                {m.role === "user" ? (
                  <div className="flex justify-end">
                    <p className="max-w-[85%] rounded-lg rounded-br-sm bg-accent px-3 py-2 text-sm">
                      {m.body}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[11px] text-muted-foreground">
                      HR Copilot · <span className="font-mono">{m.time}</span>
                    </p>
                    <p className="max-w-[92%] text-sm leading-relaxed text-foreground/90">
                      {m.body}
                    </p>
                    {m.approval && (
                      <div className="max-w-[92%] rounded-lg border border-warning/40 bg-warning/5 p-3">
                        <p className="flex items-center gap-1.5 text-xs font-semibold text-warning">
                          <ShieldQuestion className="size-3.5" />
                          Approval required
                        </p>
                        <p className="mt-1.5 text-sm font-medium">{m.approval.title}</p>
                        <p className="text-xs text-muted-foreground">{m.approval.description}</p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          Destination: {m.approval.target}
                        </p>
                        {resolved[m.id] ? (
                          <p
                            className={cn(
                              "mt-3 flex items-center gap-1.5 text-xs font-medium",
                              resolved[m.id] === "approved" ? "text-success" : "text-muted-foreground",
                            )}
                          >
                            {resolved[m.id] === "approved" ? (
                              <Check className="size-3.5" />
                            ) : (
                              <X className="size-3.5" />
                            )}
                            {resolved[m.id] === "approved" ? "Approved by you" : "Declined by you"}
                          </p>
                        ) : (
                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={() => decide(m, "approved")}
                              className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
                            >
                              Approve & send
                            </button>
                            <button
                              onClick={() => decide(m, "declined")}
                              className="rounded-md border border-border-strong px-3 py-1.5 text-xs hover:bg-surface-raised"
                            >
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="border-t border-border p-3">
            <div className="rounded-lg border border-border bg-surface p-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                rows={2}
                placeholder={`Reply to the Copilot about ${item.id}…`}
                className="w-full resize-none bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground"
              />
              <div className="flex items-center gap-2 px-1">
                <button className="text-muted-foreground hover:text-foreground" aria-label="Attach">
                  <Paperclip className="size-3.5" />
                </button>
                <span className="text-[11px] text-muted-foreground">Scoped to this run</span>
                <button
                  onClick={send}
                  className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground hover:opacity-90"
                >
                  <Send className="size-3" />
                  Send
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Canvas */}
        <section className="flex min-h-0 flex-col border-border lg:border-r">
          <div className="flex items-center gap-2 border-b border-border px-4 py-2">
            <Layers className="size-3.5 text-primary" />
            <p className="text-xs font-medium">Canvas</p>
            <span className="ml-auto text-[11px] text-muted-foreground">
              {item.canvas.kind === "documents"
                ? "Document packet"
                : item.canvas.kind === "record"
                  ? "Employee record view"
                  : "Task checklist"}
            </span>
          </div>
          <div className="scroll-slim min-h-0 flex-1 overflow-y-auto p-4">
            <div className="panel p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-md bg-accent text-sm font-semibold">
                  {item.subject.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold">{item.subject.name}</p>
                  <p className="text-xs text-muted-foreground">{item.subject.role}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="label-caps">{item.category}</p>
                  <p className="text-xs text-muted-foreground">{item.sla}</p>
                </div>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{item.summary}</p>
            </div>

            <div className="mt-4 space-y-2">
              {item.canvas.items.map((c) => (
                <div
                  key={c.label}
                  className={cn(
                    "flex items-center gap-3 rounded-md border bg-surface px-3 py-2.5",
                    c.state === "warn" ? "border-warning/40" : "border-border",
                  )}
                >
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      c.state === "ok"
                        ? "bg-success"
                        : c.state === "warn"
                          ? "bg-warning"
                          : "bg-muted-foreground",
                    )}
                  />
                  <p className="text-sm">{c.label}</p>
                  <p className="ml-auto text-right text-xs text-muted-foreground">{c.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 panel p-4">
              <p className="label-caps">Workflow</p>
              <div className="mt-3 space-y-3">
                {item.steps.map((s, i) => (
                  <div key={s.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      {stepIcon(s.state)}
                      {i < item.steps.length - 1 && (
                        <span className="mt-1 w-px flex-1 bg-border" style={{ minHeight: 14 }} />
                      )}
                    </div>
                    <div className="pb-1">
                      <p
                        className={cn(
                          "text-sm",
                          s.state === "pending" ? "text-muted-foreground" : "text-foreground",
                        )}
                      >
                        {s.label}
                      </p>
                      {s.detail && (
                        <p className="text-[11px] text-muted-foreground">{s.detail}</p>
                      )}
                      <div className="mt-0.5 flex gap-2 text-[10px] text-muted-foreground">
                        {s.system && <span>{s.system}</span>}
                        {s.duration && <span className="font-mono">{s.duration}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Run context */}
        <aside className="scroll-slim hidden min-h-0 overflow-y-auto p-4 lg:block">
          <p className="label-caps">Run</p>
          <div className="mt-2 space-y-2 text-xs">
            <Row k="Status" v={<StatusPill status={item.status} />} />
            <Row k="Source" v={item.externalRef} />
            <Row k="Automation" v={automation ? automation.name : "None (ad hoc)"} />
            <Row k="Approvals" v={`${item.steps.filter((s) => s.state === "approval").length} pending`} />
            <Row k="Priority" v={item.priority} />
            <Row k="Updated" v={item.updated} />
          </div>

          <p className="label-caps mt-6">Progress</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full",
                item.status === "blocked" ? "bg-destructive" : "bg-primary",
              )}
              style={{ width: `${item.progress}%` }}
            />
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {item.steps.filter((s) => s.state === "done").length} of {item.steps.length} steps done
          </p>

          {!item.automation && (
            <div className="mt-6 rounded-md border border-primary/30 bg-primary/5 p-3">
              <p className="text-xs font-semibold text-primary">No automation yet</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                This ran as an ad hoc task. If it repeats, turn it into an automation.
              </p>
              <Link
                to="/automations"
                className="mt-2 inline-block text-[11px] font-medium text-primary hover:underline"
              >
                Create automation →
              </Link>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-border pb-2">
      <span className="text-muted-foreground">{k}</span>
      <span className="text-right capitalize">{v}</span>
    </div>
  );
}
