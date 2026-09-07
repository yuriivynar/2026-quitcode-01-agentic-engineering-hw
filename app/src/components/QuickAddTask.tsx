'use client';

import { PButton, PInputText } from '@porsche-design-system/components-react/ssr';
import { type FormEvent, useState } from 'react';

type Props = {
  onAdd: (name: string) => void;
};

export function QuickAddTask({ onAdd }: Props) {
  const [name, setName] = useState('');

  // A real <form> means Enter submits for free, which is the whole point of a
  // one-field quick-add.
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    onAdd(trimmed);
    setName('');
  };

  return (
    <form className="quickAdd" onSubmit={handleSubmit}>
      <div className="quickAdd__field">
        <PInputText
          name="task-name"
          label="Task name"
          hideLabel
          placeholder="What are you working on?"
          value={name}
          maxLength={120}
          onInput={(event) => setName((event.target as HTMLInputElement).value)}
        />
      </div>
      <PButton type="submit" icon="plus" disabled={name.trim().length === 0}>
        Add task
      </PButton>
    </form>
  );
}
