import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { CornerDownLeft, Paperclip, Sparkles, Workflow, Zap } from "lucide-react";
import { automations, getAutomation, workItems } from "@/lib/hr-data";

type Msg = { id: string; role: "user" | "agent"; body: string; suggestion?: string | undefined };

export const Route = createFileRoute("/chat")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { automation?: string; prompt?: string } => {
    const raw = search["automation"];
    const prompt = search["prompt"];
    return {
      ...(typeof raw === "string" ? { automation: raw } : {}),
      ...(typeof prompt === "string" ? { prompt } : {}),
    };
  },
  head: () => ({
    meta: [
      { title: "New task — HR Copilot" },
      {
        name: "description",
        content:
          "Ask the HR Copilot to run an automation or handle an ad hoc HR task, with the run visible side by side.",
      },
      { property: "og:title", content: "New task — HR Copilot" },
      {
        property: "og:description",
        content: "Start an automation or an ad hoc HR task from one prompt.",
      },
    ],
  }),
  component: NewTaskChat,
});

const starters = [
  "Onboard Joe Marchetti, start date Sep 1",
  "Draft an employment verification letter for Sarah Chen",
  "Reconcile the Seattle missing punches before payroll cutoff",
  "Explain PTO carryover for our Dublin contractors",
];

function NewTaskChat() {
  const { automation, prompt } = Route.useSearch();
  const preset = automation ? getAutomation(automation) : undefined;
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState(
    prompt ?? (preset ? `Run ${preset.name.toLowerCase()} for ` : ""),
  );
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
  }, []);

  const send = (text: string) => {
    const value = text.trim();
    if (!value) return;
    setDraft("");
    const match = automations.find((a) =>
      value.toLowerCase().includes(a.name.split(" ")[0]!.toLowerCase()),
    );
    setMessages((m) => [
      ...m,
      { id: `u${m.length}`, role: "user", body: value },
      {
        id: `a${m.length}`,
        role: "agent",
        body: match
          ? `That matches the “${match.name}” automation (${match.steps} steps, ${match.approvals} approval point${match.approvals === 1 ? "" : "s"}). I'll open the run so you can watch the canvas and approve as needed.`
          : "No existing automation matches this, so I'll handle it as an ad hoc task: I'll gather what I need from the shared data layer, work on the canvas, and check with you before anything leaves our systems.",
        suggestion: match?.id,
      },
    ]);
    inputRef.current?.focus();
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-49px)] max-w-3xl flex-col px-4 py-6">
      {messages.length === 0 ? (
        <div className="flex flex-1 flex-col justify-center">
          <div className="flex size-10 items-center justify-center rounded-md bg-primary/15">
            <Sparkles className="size-5 text-primary" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold">What needs doing?</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Name a process and I'll run the automation. Anything without an automation I'll execute
            as an ad hoc task — with your approval before any action leaves our systems.
          </p>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {starters.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-md border border-border bg-surface px-3 py-2.5 text-left text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="scroll-slim min-h-0 flex-1 space-y-4 overflow-y-auto py-2">
          {messages.map((m) =>
            m.role === "user" ? (
              <div key={m.id} className="flex justify-end">
                <p className="max-w-[85%] rounded-lg rounded-br-sm bg-accent px-3 py-2 text-sm">
                  {m.body}
                </p>
              </div>
            ) : (
              <div key={m.id} className="space-y-2">
                <p className="text-[11px] text-muted-foreground">HR Copilot</p>
                <p className="text-sm leading-relaxed text-foreground/90">{m.body}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Link
                    to="/work/$workId"
                    params={{ workId: m.suggestion ? matchWork(m.suggestion) : workItems[6]!.id }}
                    className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
                  >
                    <Zap className="size-3" />
                    Open run
                  </Link>
                  {!m.suggestion && (
                    <Link
                      to="/automations"
                      className="inline-flex items-center gap-1.5 rounded-md border border-border-strong px-3 py-1.5 text-xs hover:bg-surface-raised"
                    >
                      <Workflow className="size-3" />
                      Turn into automation
                    </Link>
                  )}
                </div>
              </div>
            ),
          )}
        </div>
      )}

      <div className="mt-4 rounded-lg border border-border bg-surface p-2">
        <textarea
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(draft);
            }
          }}
          rows={2}
          placeholder="Onboard Joe Marchetti, start date Sep 1…"
          className="w-full resize-none bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground"
        />
        <div className="flex items-center gap-2 px-1">
          <Paperclip className="size-3.5 text-muted-foreground" />
          <span className="text-[11px] text-muted-foreground">
            Execution chat — not a general HR helpdesk
          </span>
          <button
            onClick={() => send(draft)}
            className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground hover:opacity-90"
          >
            Send <CornerDownLeft className="size-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

function matchWork(automationId: string) {
  return (workItems.find((w) => w.automation === automationId) ?? workItems[0]!).id;
}
