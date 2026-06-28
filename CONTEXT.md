# Brainbox — Context & Glossary

Brainbox is an embeddable in-app feedback widget. A customer's end-user reports a
broken UI area by highlighting it and talking; Brainbox turns that into a
structured ticket routed to the customer's tools.

The product has three distinct surfaces — keep them separate:
**the widget**, **the dashboard**, **the backend**.

## Glossary

- **Customer** — the SaaS founder who buys Brainbox and embeds the widget in
  their own app. Our ICP. (Not the person filing feedback.)
- **End-user** — a user of the *customer's* app, the person who actually files
  feedback through the widget.
- **Host app** — the customer's web app that the widget is embedded into. The
  widget runs inside the host's document.
- **Widget** — the embeddable surface the end-user interacts with. Ships first as
  a script-tag IIFE bundle, later as an npm package. Isolated from the host via
  Shadow DOM.
- **Dashboard** — the SaaS we sell: where the customer signs up, gets their
  snippet, and reads incoming tickets. (Out of scope for the widget build.)
- **Backend** — receives feedback from every customer's widget, stores it
  per-account, feeds the dashboard, routes to integrations. (Built later.)
- **Capture flow** — the end-user's 5-step sequence: open → highlight region →
  screenshot → compose (talk/type) → submit.
- **Trigger** — whatever opens the widget. Two modes:
  - **Floating trigger** — the bottom-right button the widget renders itself
    (default).
  - **Manual trigger** — the customer's own element, wired via
    `window.Brainbox.open()` or a `[data-brainbox-trigger]` attribute.
- **Project key** — a project's public identifier passed to the widget
  (`data-project`), scoping captured feedback to that project.

## Data hierarchy

```
Account ──< Project ──< Issue
```

- **Account** — a customer's login (email/password). Owns many projects.
- **Project** — one per SaaS the customer owns. Has a unique project key used in
  the widget snippet. Owns many issues.
- **Issue** — one feedback submission: screenshot, audio, text, region coords,
  and auto-captured metadata. Filed under the project named by the project key
  on the widget's POST.
