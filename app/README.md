# Workday Time Tracker

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
- **Daily summary** — time per task, plus the day's total.
- **Activity history** — every session today with start, end, task and duration.
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
| `src/components/` | one component per panel |

`tracker.ts` is deliberately free of React and of imports with runtime side
effects, so the timer rules can be exercised directly.

## Notes

- Sessions belong to the day they *started* on, so a task running past midnight
  stays in one piece instead of being split across two days.
- The clock ticks once a second while a task is running and once a minute while
  idle — idle totals are made only of closed sessions, so a slow tick costs
  nothing and still lets "today" roll over in a tab left open overnight.
- Light and dark follow the OS via the PDS `scheme-light-dark` class; there is
  no theme prop in PDS v4.
