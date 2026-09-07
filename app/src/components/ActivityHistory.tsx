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
import { formatClock, formatDayLabel, formatDecimalHours, formatDuration } from '@/lib/time';
import type { Session, Task } from '@/lib/types';

type Props = {
  days: { day: number; sessions: Session[] }[];
  tasks: Task[];
  now: number;
};

export function ActivityHistory({ days, tasks, now }: Props) {
  if (days.length === 0) {
    return (
      <PText className="empty" color="contrast-medium">
        Work sessions will show up here as soon as you start a task.
      </PText>
    );
  }

  const nameById = new Map(tasks.map((task) => [task.id, task.name]));

  return (
    <div className="history">
      {days.map(({ day, sessions }) => {
        const dayTotal = sessions.reduce(
          (total, session) => total + sessionDuration(session, now),
          0,
        );

        return (
          <section key={day} className="history__day">
            <div className="history__dayHead">
              <PText weight="semibold" size="small">
                {formatDayLabel(day, now)}
              </PText>
              <PText size="small" color="contrast-medium" className="numeric">
                <span title={formatDuration(dayTotal)}>
                  {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'} ·{' '}
                  {formatDecimalHours(dayTotal)} h
                </span>
              </PText>
            </div>

            <div className="tableScroll">
              <PTable caption={`Work sessions on ${formatDayLabel(day, now)}`} compact>
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
                      <PTableCell multiline>
                        {nameById.get(session.taskId) ?? 'Removed task'}
                      </PTableCell>
                      <PTableCell>
                        <span className="numeric">
                          {formatDuration(sessionDuration(session, now))}
                        </span>
                      </PTableCell>
                    </PTableRow>
                  ))}
                </PTableBody>
              </PTable>
            </div>
          </section>
        );
      })}
    </div>
  );
}
