'use client';

import { PHeading, PSpinner, PText } from '@porsche-design-system/components-react/ssr';
import { ActiveTaskPanel } from '@/components/ActiveTaskPanel';
import { ActivityHistory } from '@/components/ActivityHistory';
import { DailySummary } from '@/components/DailySummary';
import { QuickAddTask } from '@/components/QuickAddTask';
import { ResetDataButton } from '@/components/ResetDataButton';
import { TaskList } from '@/components/TaskList';
import { ThemeSwitch } from '@/components/ThemeSwitch';
import { useTracker } from '@/lib/useTracker';
import { formatDay, formatDecimalHours, formatDuration } from '@/lib/time';

export default function Home() {
  const tracker = useTracker();
  const { today, hydrated } = tracker;

  return (
    <main className="page">
      <header className="page__header">
        <div className="page__headerText">
          <PHeading tag="h1" size="large">
            Workday Time Tracker
          </PHeading>
          {/* Rendered only after hydration: the date and totals come from
              localStorage, which the server cannot know. */}
          <PText size="small" color="contrast-medium">
            {hydrated ? formatDay(tracker.now) : ' '}
          </PText>
        </div>
        <div className="page__headerActions">
          <ThemeSwitch />
          <ResetDataButton
            onConfirm={tracker.reset}
            disabled={!hydrated || tracker.state.tasks.length === 0}
          />
        </div>
      </header>

      {!hydrated ? (
        <section className="panel" aria-busy="true">
          <PSpinner size="medium" aria={{ 'aria-label': 'Loading your tracked time' }} />
        </section>
      ) : (
        <>
          <ActiveTaskPanel
            task={tracker.runningTask}
            elapsed={tracker.runningElapsed}
            startedAt={tracker.runningSince}
            onPause={tracker.pause}
            onComplete={tracker.completeTask}
          />

          <section className="panel">
            <QuickAddTask onAdd={tracker.addTask} />
          </section>

          <div className="columns">
            <section className="panel">
              <div className="panel__head">
                <PHeading tag="h2" size="small">
                  Today&apos;s tasks
                </PHeading>
                <PText size="small" color="contrast-medium">
                  {today.tasks.length} {today.tasks.length === 1 ? 'task' : 'tasks'}
                </PText>
              </div>
              <TaskList
                tasks={today.tasks}
                statusOf={tracker.statusOf}
                elapsedOf={tracker.elapsedOf}
                onStart={tracker.startTask}
                onPause={tracker.pause}
                onComplete={tracker.completeTask}
              />
            </section>

            <section className="panel">
              <div className="panel__head">
                <PHeading tag="h2" size="small">
                  Daily summary
                </PHeading>
                <PText size="small" color="contrast-medium" className="numeric">
                  <span title={formatDuration(today.tracked)}>
                    {formatDecimalHours(today.tracked)}
                    <span className="summary__unit"> h</span>
                  </span>
                </PText>
              </div>
              <DailySummary totals={today.totals} tracked={today.tracked} />
            </section>
          </div>

          <section className="panel">
            <div className="panel__head">
              <PHeading tag="h2" size="small">
                Activity history
              </PHeading>
              <PText size="small" color="contrast-medium">
                {tracker.history.length === 1
                  ? '1 day'
                  : `${tracker.history.length} days`}
              </PText>
            </div>
            <ActivityHistory days={tracker.history} tasks={tracker.state.tasks} now={tracker.now} />
          </section>
        </>
      )}
    </main>
  );
}
