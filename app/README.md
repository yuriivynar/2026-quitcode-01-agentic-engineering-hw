# Workday Time Tracker

**Live:** https://yuriivynar.github.io/2026-quitcode-01-agentic-engineering-hw/

A small personal tool for tracking how a workday is actually spent. Type a task
name, press Start, and the clock runs until you pause it, finish it, or start
something else.

Built with **Next.js 16** (App Router) and the **[Porsche Design System
v4](https://designsystem.porsche.com/v4/)** — every control on screen is a PDS
component, and the layout CSS uses only PDS design tokens.

## Running it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
npm run lint
```

Node 22+ is required. PDS loads its component implementations from the Porsche
CDN at runtime, so the first render needs a network connection.

## What it does

- **One timer, always.** Starting a task stops whichever task was running, in
  the same click — switching never needs a pause first.
- **Live active task** with a large running timer and the current session's
  start time.
- **Today's tasks** with per-task totals and a derived status
  (`Not started` / `Running` / `Paused` / `Done`).
- **Daily summary** — time per task plus the day's total, in **decimal hours**
  (`2.50 h`), the way timesheets and invoices want them; hover for HH:MM:SS.
- **Activity history grouped by date** — `Today` / `Yesterday` / the weekday,
  each day with its own session table and day total.
- **Theme switch** — System / Light / Dark, remembered between visits and
  applied before first paint so there is no flash.
- **Persistent** — tasks, sessions and the running timer survive a refresh.
- **Clear data** behind a confirmation dialog.

## How the state works

The interesting decision is that **the running timer is just an open session**:

```ts
type Session = {
  id: string;
  taskId: string;
  startedAt: number;
  endedAt: number | null; // null => this is the timer that is running
};
```

There is no `activeTaskId` field. "Only one task at a time" is the single
invariant *at most one session has `endedAt === null`*, and everything else is
derived from the data rather than stored alongside it:

| Question | Answer |
| --- | --- |
| What's running? | the session with `endedAt === null` |
| How long has task X taken? | sum of its sessions' durations |
| Is task X paused or idle? | does it have any sessions yet? |
| Does it survive a refresh? | the open session was already persisted |

Because status and totals are computed, they cannot drift out of sync with the
sessions the way a stored `status` field would.

Pausing closes the open session; resuming opens a new one — which is what makes
the activity history a truthful record of the day rather than a single blurred
range per task.

## Layout

| Path | Purpose |
| --- | --- |
| `src/lib/types.ts` | `Task`, `Session`, `TrackerState` |
| `src/lib/tracker.ts` | pure reducer + derivations (no React) |
| `src/lib/storage.ts` | `localStorage` read/write, validates untrusted input |
| `src/lib/trackerStore.ts` | `useSyncExternalStore` bridge to `localStorage` |
| `src/lib/useTracker.ts` | the hook the UI talks to, plus the tick |
| `src/lib/time.ts` | duration/clock formatting |
| `src/lib/theme.ts` | scheme classes + the pre-paint init script |
| `src/lib/themeStore.ts` | `useSyncExternalStore` bridge for the theme choice |
| `src/components/` | one component per panel |

`tracker.ts` is deliberately free of React and of imports with runtime side
effects, so the timer rules can be exercised directly.

## Notes

- Sessions belong to the day they *started* on, so a task running past midnight
- Every figure on the page is scoped to **one day**: a task worked on across
  several days shows today's time in the task list, not its all-time total,
  so the task list and the daily summary can never disagree.
  stays in one piece instead of being split across two days.
- The clock ticks once a second while a task is running and once a minute while
  idle — idle totals are made only of closed sessions, so a slow tick costs
  nothing and still lets "today" roll over in a tab left open overnight.
- Light and dark follow the OS via the PDS `scheme-light-dark` class; there is
  no theme prop in PDS v4.
