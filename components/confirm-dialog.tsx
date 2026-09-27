'use client';

import React, { useEffect } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Shared delete-confirmation dialog. Replaces all native confirm()/alert()
 * calls so destructive actions match the app's glass-panel styling.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={onCancel}
        className="absolute inset-0 bg-foreground/30 backdrop-blur-sm cursor-default"
      />
      <div className="glass-panel relative w-full max-w-xs rounded-3xl shadow-soft border border-border p-5 space-y-3 text-center">
        <p className="text-sm font-bold text-foreground">{title}</p>
        <p className="text-xs text-muted-fg leading-relaxed">{message}</p>
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-3 py-2.5 rounded-xl bg-muted text-foreground text-xs font-semibold hover:opacity-90 transition-all cursor-pointer min-h-[44px]"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            autoFocus
            className="flex-1 px-3 py-2.5 rounded-xl bg-rose-500 text-white text-xs font-semibold hover:opacity-90 transition-all cursor-pointer min-h-[44px]"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
