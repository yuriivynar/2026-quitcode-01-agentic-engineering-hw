'use client';

import { PButton, PButtonPure, PHeading, PModal, PText } from '@porsche-design-system/components-react/ssr';
import { useState } from 'react';

type Props = {
  onConfirm: () => void;
  disabled?: boolean;
};

export function ResetDataButton({ onConfirm, disabled }: Props) {
  const [open, setOpen] = useState(false);

  const confirm = () => {
    onConfirm();
    setOpen(false);
  };

  return (
    <>
      <PButtonPure
        type="button"
        icon="delete"
        color="contrast-medium"
        disabled={disabled}
        aria={{ 'aria-haspopup': 'dialog' }}
        onClick={() => setOpen(true)}
      >
        Clear data
      </PButtonPure>

      <PModal
        open={open}
        // Wiping tracked time is irreversible, so it takes a deliberate choice:
        // no backdrop click, and the destructive action is not the default.
        disableBackdropClick
        aria={{ role: 'alertdialog' }}
        onDismiss={() => setOpen(false)}
      >
        <PHeading slot="header" tag="h2" size="medium">
          Clear all tracked data?
        </PHeading>
        <PText>
          This permanently deletes every task, work session and the running timer from this
          browser. It cannot be undone.
        </PText>
        <div slot="footer" role="group" className="modalActions">
          <PButton type="button" variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </PButton>
          <PButton type="button" icon="delete" onClick={confirm}>
            Delete everything
          </PButton>
        </div>
      </PModal>
    </>
  );
}
