import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/intake", search: { view: "decide" }, replace: true });
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
  component: () => null,
});
