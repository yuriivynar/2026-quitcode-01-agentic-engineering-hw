'use client';

import { PButtonPure, PTag, PText } from '@porsche-design-system/components-react/ssr';
import { formatDuration } from '@/lib/time';
import type { Task, TaskStatus } from '@/lib/types';

type Props = {
  tasks: Task[];
  statusOf: (taskId: string) => TaskStatus;
  elapsedOf: (taskId: string) => number;
  onStart: (taskId: string) => void;
  onPause: () => void;
  onComplete: (taskId: string) => void;
};

const STATUS_TAG: Record<TaskStatus, { label: string; variant: 'success' | 'warning' | 'secondary' }> = {
  running: { label: 'Running', variant: 'success' },
  paused: { label: 'Paused', variant: 'warning' },
  done: { label: 'Done', variant: 'secondary' },
  idle: { label: 'Not started', variant: 'secondary' },
};

/** The label for starting depends on whether there is history to continue. */
const START_LABEL: Record<TaskStatus, string> = {
  idle: 'Start',
  paused: 'Resume',
  done: 'Restart',
  running: 'Start',
};

export function TaskList({ tasks, statusOf, elapsedOf, onStart, onPause, onComplete }: Props) {
  if (tasks.length === 0) {
    return (
      <PText className="empty" color="contrast-medium">
        No tasks yet. Add the first one above and press Start.
      </PText>
    );
  }

  return (
    <ul className="taskList">
      {tasks.map((task) => {
        const status = statusOf(task.id);
        const isRunning = status === 'running';
        const tag = STATUS_TAG[status];

        return (
          <li key={task.id} className={`taskRow${isRunning ? ' taskRow--running' : ''}`}>
            <PTag compact variant={tag.variant}>
              {tag.label}
            </PTag>

            <PText
              className={`taskRow__name${status === 'done' ? ' taskRow__name--done' : ''}`}
              weight={isRunning ? 'semibold' : 'regular'}
            >
              {task.name}
            </PText>

            <span className="taskRow__time">{formatDuration(elapsedOf(task.id))}</span>

            <span className="taskRow__actions">
              {isRunning ? (
                <PButtonPure type="button" icon="pause" onClick={onPause}>
                  Pause
                </PButtonPure>
              ) : (
                // Starting any other task stops this one automatically, so
                // switching tasks is a single click.
                <PButtonPure type="button" icon="play" onClick={() => onStart(task.id)}>
                  {START_LABEL[status]}
                </PButtonPure>
              )}

              {status !== 'done' && (
                <PButtonPure
                  type="button"
                  icon="check"
                  hideLabel
                  color="contrast-medium"
                  onClick={() => onComplete(task.id)}
                >
                  {`Mark "${task.name}" as done`}
                </PButtonPure>
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
