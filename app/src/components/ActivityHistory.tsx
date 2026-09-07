'use client';

import {
  PTable,
  PTableBody,
  PTableCell,
  PTableHead,
  PTableHeadCell,
  PTableHeadRow,
  PTableRow,
  PText,
} from '@porsche-design-system/components-react/ssr';
import { sessionDuration } from '@/lib/tracker';
import { formatClock, formatDuration } from '@/lib/time';
import type { Session, Task } from '@/lib/types';

type Props = {
  sessions: Session[];
  tasks: Task[];
  now: number;
};

export function ActivityHistory({ sessions, tasks, now }: Props) {
  if (sessions.length === 0) {
    return (
      <PText className="empty" color="contrast-medium">
        Work sessions will show up here as soon as you start a task.
      </PText>
    );
  }

  const nameById = new Map(tasks.map((task) => [task.id, task.name]));

  return (
    <div className="tableScroll">
      <PTable caption="Today's work sessions" compact>
        <PTableHead>
          <PTableHeadRow>
            <PTableHeadCell>Start</PTableHeadCell>
            <PTableHeadCell>End</PTableHeadCell>
            <PTableHeadCell>Task</PTableHeadCell>
            <PTableHeadCell>Duration</PTableHeadCell>
          </PTableHeadRow>
        </PTableHead>
        <PTableBody>
          {sessions.map((session) => (
            <PTableRow key={session.id}>
              <PTableCell>
                <span className="numeric">{formatClock(session.startedAt)}</span>
              </PTableCell>
              <PTableCell>
                {session.endedAt === null ? (
                  <PText size="small" color="success">
                    running
                  </PText>
                ) : (
                  <span className="numeric">{formatClock(session.endedAt)}</span>
                )}
              </PTableCell>
              <PTableCell multiline>{nameById.get(session.taskId) ?? 'Removed task'}</PTableCell>
              <PTableCell>
                <span className="numeric">{formatDuration(sessionDuration(session, now))}</span>
              </PTableCell>
            </PTableRow>
          ))}
        </PTableBody>
      </PTable>
    </div>
  );
}
