'use client';

import { PDivider, PText } from '@porsche-design-system/components-react/ssr';
import { formatDuration, formatDurationCompact } from '@/lib/time';
import type { Task } from '@/lib/types';

type Props = {
  totals: { task: Task; total: number }[];
  tracked: number;
};

export function DailySummary({ totals, tracked }: Props) {
  if (totals.length === 0) {
    return (
      <PText className="empty" color="contrast-medium">
        Nothing tracked yet today.
      </PText>
    );
  }

  // Bars are relative to the largest task, not to the day, so the split stays
  // readable even when only a few minutes have been tracked so far.
  const longest = Math.max(...totals.map((entry) => entry.total), 1);

  return (
    <div className="summary">
      {totals.map(({ task, total }) => (
        <div key={task.id}>
          <div className="summary__row">
            <PText size="small">{task.name}</PText>
            <PText size="small" color="contrast-high" className="numeric">
              {formatDurationCompact(total)}
            </PText>
          </div>
          <div
            className="summary__bar"
            role="presentation"
            title={`${task.name}: ${formatDuration(total)}`}
          >
            <div
              className="summary__barFill"
              style={{ width: `${Math.round((total / longest) * 100)}%` }}
            />
          </div>
        </div>
      ))}

      <PDivider />

      <div className="summary__total">
        <PText weight="semibold">Total tracked</PText>
        <PText weight="semibold">{formatDuration(tracked)}</PText>
      </div>
    </div>
  );
}
