/** A unit of work the user tracks time against. */
export type Task = {
  id: string;
  name: string;
  createdAt: number;
  /** Epoch ms when the task was marked done, or `null` while it is still open. */
  completedAt: number | null;
};

/**
 * A single continuous stretch of work on a task.
 *
 * A session with `endedAt === null` is the one currently being timed. That open
 * session *is* the running timer — there is no separate "activeTaskId" field to
 * keep in sync, which is what makes "only one task at a time" and "survives a
 * refresh" fall out of the data model instead of needing their own bookkeeping.
 */
export type Session = {
  id: string;
  taskId: string;
  startedAt: number;
  endedAt: number | null;
};

/** Everything the app persists. `version` lets us migrate the shape later. */
export type TrackerState = {
  version: number;
  tasks: Task[];
  sessions: Session[];
};

/** Derived from the data — never stored, so it can never disagree with it. */
export type TaskStatus = 'idle' | 'running' | 'paused' | 'done';
