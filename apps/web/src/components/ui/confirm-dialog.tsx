'use client';

import { useState, type ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogTrigger } from '@/components/ui/dialog';

export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  onConfirm,
  variant = 'primary',
  trigger,
}: {
  title: string;
  description?: string;
  confirmLabel: string;
  onConfirm: () => void | Promise<void>;
  variant?: 'primary' | 'destructive';
  trigger: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent title={title} description={description}>
        <div className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant={variant === 'destructive' ? 'destructive' : 'primary'}
            disabled={loading}
            onClick={() => void handleConfirm()}
          >
            {loading ? '…' : confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
