import { EMPTY_STATE } from './tracker';
import type { Session, Task, TrackerState } from './types';

const STORAGE_KEY = 'workday-time-tracker:v1';

export function loadState(): TrackerState {
  if (typeof window === 'undefined') return EMPTY_STATE;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    return normalize(JSON.parse(raw));
  } catch {
    // Unparseable or unreadable (private mode, quota, hand-edited storage):
    // start clean rather than crashing the app on boot.
    return EMPTY_STATE;
  }
}

export function saveState(state: TrackerState): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked — the in-memory session keeps working.
  }
}

export function clearState(): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing useful to do; the caller has already reset in-memory state.
  }
}

/**
 * localStorage is user-writable, so treat anything read back as untrusted:
 * drop malformed records and re-establish the one-open-session invariant the
 * rest of the app relies on.
 */
function normalize(value: unknown): TrackerState {
  if (!isRecord(value)) return EMPTY_STATE;

  const tasks = asArray(value.tasks).filter(isTask);
  const knownTaskIds = new Set(tasks.map((task) => task.id));
  const sessions = asArray(value.sessions)
    .filter(isSession)
    .filter((session) => knownTaskIds.has(session.taskId))
    .sort((a, b) => a.startedAt - b.startedAt);

  // Keep only the newest open session; close any earlier ones at their own
  // start so a corrupted file can't leave two timers apparently running.
  const lastOpenIndex = sessions.map((session) => session.endedAt === null).lastIndexOf(true);
  const repaired = sessions.map((session, index) =>
    session.endedAt === null && index !== lastOpenIndex
      ? { ...session, endedAt: session.startedAt }
      : session,
  );

  return { version: 1, tasks, sessions: repaired };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function isTask(value: unknown): value is Task {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.createdAt === 'number' &&
    (value.completedAt === null || typeof value.completedAt === 'number')
  );
}

function isSession(value: unknown): value is Session {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.taskId === 'string' &&
    typeof value.startedAt === 'number' &&
    (value.endedAt === null || typeof value.endedAt === 'number')
  );
}
