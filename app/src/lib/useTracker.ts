'use client';

import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { clearState, loadState, saveState } from './storage';
import {
  EMPTY_STATE,
  findOpenSession,
  findRunningTask,
  sessionsForDay,
  taskElapsed,
  tasksForDay,
  taskStatus,
  totalsForDay,
  trackedTotalForDay,
  trackerReducer,
} from './tracker';
import { createId } from './time';

const RUNNING_TICK_MS = 1_000;
/** Idle still ticks, slowly, so "today" rolls over if the tab is left open. */
const IDLE_TICK_MS = 60_000;

export function useTracker() {
  const [state, dispatch] = useReducer(trackerReducer, EMPTY_STATE);

  // localStorage is only readable after mount, so the first client render must
  // match the server's empty render. `hydrated` gates the UI until then.
  const [hydrated, setHydrated] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    dispatch({ type: 'hydrate', state: loadState() });
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  const openSession = findOpenSession(state);
  const tickMs = openSession ? RUNNING_TICK_MS : IDLE_TICK_MS;

  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), tickMs);
    return () => clearInterval(timer);
  }, [tickMs]);

  const addTask = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    dispatch({ type: 'addTask', taskId: createId(), name: trimmed, now: Date.now() });
  }, []);

  const startTask = useCallback((taskId: string) => {
    dispatch({ type: 'start', taskId, sessionId: createId(), now: Date.now() });
  }, []);

  const pause = useCallback(() => {
    dispatch({ type: 'pause', now: Date.now() });
  }, []);

  const completeTask = useCallback((taskId: string) => {
    dispatch({ type: 'complete', taskId, now: Date.now() });
  }, []);

  const reset = useCallback(() => {
    clearState();
    dispatch({ type: 'reset' });
  }, []);

  const today = useMemo(
    () => ({
      tasks: tasksForDay(state, now),
      sessions: sessionsForDay(state, now),
      totals: totalsForDay(state, now, now),
      tracked: trackedTotalForDay(state, now, now),
    }),
    [state, now],
  );

  const runningTask = findRunningTask(state);

  return {
    hydrated,
    now,
    state,
    today,
    runningTask,
    runningSince: openSession?.startedAt ?? null,
    runningElapsed: runningTask ? taskElapsed(state, runningTask.id, now) : 0,
    statusOf: (taskId: string) => taskStatus(state, taskId),
    elapsedOf: (taskId: string) => taskElapsed(state, taskId, now),
    addTask,
    startTask,
    pause,
    completeTask,
    reset,
  };
}

export type Tracker = ReturnType<typeof useTracker>;
