import type { Session, Task, TaskStatus, TrackerState } from './types';

export const EMPTY_STATE: TrackerState = { version: 1, tasks: [], sessions: [] };

/* ------------------------------------------------------------------ *
 * Derivations — the UI reads everything through these, so the rendered
 * state can never drift from the stored state.
 * ------------------------------------------------------------------ */

/** The one session being timed right now, if any. */
export function findOpenSession(state: TrackerState): Session | null {
  return state.sessions.find((session) => session.endedAt === null) ?? null;
}

export function findRunningTask(state: TrackerState): Task | null {
  const open = findOpenSession(state);
  if (!open) return null;
  return state.tasks.find((task) => task.id === open.taskId) ?? null;
}

/** `now` is passed in so an open session grows on every tick. */
export function sessionDuration(session: Session, now: number): number {
  return Math.max(0, (session.endedAt ?? now) - session.startedAt);
}

export function taskElapsed(state: TrackerState, taskId: string, now: number): number {
  return state.sessions
    .filter((session) => session.taskId === taskId)
    .reduce((total, session) => total + sessionDuration(session, now), 0);
}

export function taskStatus(state: TrackerState, taskId: string): TaskStatus {
  const task = state.tasks.find((candidate) => candidate.id === taskId);
  if (!task) return 'idle';

  // Running wins over done: an open session is the strongest evidence of state.
  if (findOpenSession(state)?.taskId === taskId) return 'running';
  if (task.completedAt !== null) return 'done';
  return state.sessions.some((session) => session.taskId === taskId) ? 'paused' : 'idle';
}

/** A session belongs to the day it started on, so a run past midnight stays whole. */
export function sessionsForDay(state: TrackerState, day: number): Session[] {
  const dayStart = startOfDayMs(day);
  const dayEnd = dayStart + 86_400_000;
  return state.sessions
    .filter((session) => session.startedAt >= dayStart && session.startedAt < dayEnd)
    .sort((a, b) => b.startedAt - a.startedAt);
}

/** Tasks created today, plus any older task actually worked on today. */
export function tasksForDay(state: TrackerState, day: number): Task[] {
  const dayStart = startOfDayMs(day);
  const dayEnd = dayStart + 86_400_000;
  const workedOnToday = new Set(
    sessionsForDay(state, day).map((session) => session.taskId),
  );

  return state.tasks
    .filter(
      (task) =>
        workedOnToday.has(task.id) ||
        (task.createdAt >= dayStart && task.createdAt < dayEnd),
    )
    .sort((a, b) => b.createdAt - a.createdAt);
}

/** Time tracked today per task — only counts the portion of each session in `day`. */
export function totalsForDay(
  state: TrackerState,
  day: number,
  now: number,
): { task: Task; total: number }[] {
  const totals = new Map<string, number>();

  for (const session of sessionsForDay(state, day)) {
    const previous = totals.get(session.taskId) ?? 0;
    totals.set(session.taskId, previous + sessionDuration(session, now));
  }

  return [...totals.entries()]
    .map(([taskId, total]) => ({
      task: state.tasks.find((task) => task.id === taskId),
      total,
    }))
    .filter((entry): entry is { task: Task; total: number } => entry.task !== undefined)
    .sort((a, b) => b.total - a.total);
}

export function trackedTotalForDay(state: TrackerState, day: number, now: number): number {
  return sessionsForDay(state, day).reduce(
    (total, session) => total + sessionDuration(session, now),
    0,
  );
}

function startOfDayMs(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/* ------------------------------------------------------------------ *
 * Transitions — pure. Ids and `now` are supplied by the caller so the
 * reducer stays deterministic and easy to reason about.
 * ------------------------------------------------------------------ */

export type TrackerAction =
  | { type: 'hydrate'; state: TrackerState }
  | { type: 'addTask'; taskId: string; name: string; now: number }
  | { type: 'start'; taskId: string; sessionId: string; now: number }
  | { type: 'pause'; now: number }
  | { type: 'complete'; taskId: string; now: number }
  | { type: 'reset' };

export function trackerReducer(state: TrackerState, action: TrackerAction): TrackerState {
  switch (action.type) {
    case 'hydrate':
      return action.state;

    case 'addTask': {
      const name = action.name.trim();
      if (!name) return state;

      const task: Task = {
        id: action.taskId,
        name,
        createdAt: action.now,
        completedAt: null,
      };
      return { ...state, tasks: [...state.tasks, task] };
    }

    case 'start': {
      if (!state.tasks.some((task) => task.id === action.taskId)) return state;
      if (findOpenSession(state)?.taskId === action.taskId) return state;

      // Stopping whatever was running and starting the new task is one
      // transition, which is what makes switching a single click.
      const base = closeOpenSession(state, action.now);
      const session: Session = {
        id: action.sessionId,
        taskId: action.taskId,
        startedAt: action.now,
        endedAt: null,
      };

      return {
        ...base,
        // Working on a task again reopens it.
        tasks: base.tasks.map((task) =>
          task.id === action.taskId ? { ...task, completedAt: null } : task,
        ),
        sessions: [...base.sessions, session],
      };
    }

    case 'pause':
      return closeOpenSession(state, action.now);

    case 'complete': {
      // Only stop the clock if the task being completed is the one running.
      const isRunning = findOpenSession(state)?.taskId === action.taskId;
      const base = isRunning ? closeOpenSession(state, action.now) : state;

      return {
        ...base,
        tasks: base.tasks.map((task) =>
          task.id === action.taskId ? { ...task, completedAt: action.now } : task,
        ),
      };
    }

    case 'reset':
      return EMPTY_STATE;

    default:
      return state;
  }
}

function closeOpenSession(state: TrackerState, now: number): TrackerState {
  const open = findOpenSession(state);
  if (!open) return state;

  return {
    ...state,
    sessions: state.sessions.map((session) =>
      session.id === open.id
        ? // Guard against a backwards clock producing a negative duration.
          { ...session, endedAt: Math.max(now, session.startedAt) }
        : session,
    ),
  };
}
