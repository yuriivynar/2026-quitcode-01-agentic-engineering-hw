'use client';

import { PButton, PHeading, PTag, PText } from '@porsche-design-system/components-react/ssr';
import { formatClock, formatDuration } from '@/lib/time';
import type { Task } from '@/lib/types';

type Props = {
  task: Task | null;
  elapsed: number;
  startedAt: number | null;
  onPause: () => void;
  onComplete: (taskId: string) => void;
};

export function ActiveTaskPanel({ task, elapsed, startedAt, onPause, onComplete }: Props) {
  if (!task) {
    return (
      <section className="active" aria-label="Currently tracking">
        <div className="active__main">
          <PTag compact>Not tracking</PTag>
          <p className="active__timer active__timer--idle">00:00:00</p>
          <PText size="small" color="contrast-medium">
            Pick a task below to start the clock.
          </PText>
        </div>
      </section>
    );
  }

  return (
    <section className="active active--running" aria-label="Currently tracking">
      <div className="active__main">
        <PTag compact variant="success" icon="play">
          Tracking
        </PTag>
        <PHeading tag="h2" size="medium">
          {task.name}
        </PHeading>
        {/* aria-live so a screen reader is told the timer is running without
            announcing every single tick. */}
        <p className="active__timer" role="timer" aria-live="off">
          {formatDuration(elapsed)}
        </p>
        {startedAt !== null && (
          <PText size="small" color="contrast-medium">
            This session started at {formatClock(startedAt)}
          </PText>
        )}
      </div>

      <div className="active__actions">
        <PButton type="button" variant="secondary" icon="pause" onClick={onPause}>
          Pause
        </PButton>
        <PButton type="button" icon="check" onClick={() => onComplete(task.id)}>
          Done
        </PButton>
      </div>
    </section>
  );
}
