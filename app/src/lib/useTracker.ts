'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { dispatch, useIsHydrated, useTrackerState } from './trackerStore';
import {
  findOpenSession,
  findRunningTask,
  sessionsForDay,
  taskElapsed,
  tasksForDay,
  taskStatus,
  totalsForDay,
  trackedTotalForDay,
} from './tracker';
import { createId } from './time';

const RUNNING_TICK_MS = 1_000;
/** Idle still ticks, slowly, so "today" rolls over if the tab is left open. */
const IDLE_TICK_MS = 60_000;

export function useTracker() {
  const state = useTrackerState();
  const hydrated = useIsHydrated();
  const [now, setNow] = useState(() => Date.now());

  const openSession = findOpenSession(state);
  const tickMs = openSession ? RUNNING_TICK_MS : IDLE_TICK_MS;

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), tickMs);
    return () => clearInterval(timer);
  }, [tickMs]);

  // While idle, `now` is only used for day-bucketing — every elapsed total is
  // made of closed sessions — so a stale value between slow ticks is harmless.
  // Starting a task switches to the 1s tick, so the live timer is never stale.

  const addTask = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    dispatch({ type: 'addTask', taskId: createId(), name: trimmed, now: Date.now() });
  }, []);

  const startTask = useCallback((taskId: string) => {
    dispatch({ type: 'start', taskId, sessionId: createId(), now: Date.now() });
    setNow(Date.now());
  }, []);

  const pause = useCallback(() => {
    dispatch({ type: 'pause', now: Date.now() });
  }, []);

  const completeTask = useCallback((taskId: string) => {
    dispatch({ type: 'complete', taskId, now: Date.now() });
  }, []);

  const reset = useCallback(() => {
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
