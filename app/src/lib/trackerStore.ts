'use client';

import { useSyncExternalStore } from 'react';
import { clearState, loadState, saveState } from './storage';
import { EMPTY_STATE, trackerReducer, type TrackerAction } from './tracker';
import type { TrackerState } from './types';

/**
 * `localStorage` is one external store shared by the whole page, so the app
 * reads it through `useSyncExternalStore` instead of mirroring it into
 * component state on mount.
 *
 * React uses `getServerSnapshot` for SSR *and* for the first hydration render,
 * then switches to `getSnapshot`. That is what keeps the server and client
 * markup identical without a hand-rolled "have we mounted yet" flag, and it is
 * why persistence needs no effect at all.
 */

// Runs once per client page load. On the server `loadState` returns EMPTY_STATE.
let snapshot: TrackerState = loadState();
const listeners = new Set<() => void>();

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Must stay referentially stable between dispatches or React will loop. */
export function getSnapshot(): TrackerState {
  return snapshot;
}

export function getServerSnapshot(): TrackerState {
  return EMPTY_STATE;
}

export function dispatch(action: TrackerAction): void {
  const next = trackerReducer(snapshot, action);

  if (action.type === 'reset') {
    clearState();
  } else if (next === snapshot) {
    return; // A no-op action (e.g. blank name) — nothing to persist or notify.
  } else {
    saveState(next);
  }

  if (next !== snapshot) {
    snapshot = next;
    for (const listener of listeners) listener();
  }
}

export function useTrackerState(): TrackerState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

const noOpUnsubscribe = () => {};
const subscribeToNothing = () => noOpUnsubscribe;

/**
 * `false` during SSR and the first hydration render, `true` from then on — the
 * gate for anything locale-formatted, which the build-time render cannot match.
 */
export function useIsHydrated(): boolean {
  return useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
}
