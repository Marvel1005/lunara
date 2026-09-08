'use client';

import React, { useState, useEffect } from 'react';
import { format, parseISO, isValid } from 'date-fns';
import { Calendar as CalendarIcon, Droplets, Trash2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { Period, FlowType } from '@/lib/cycle/types';
import { usePeriods } from '@/lib/hooks/use-periods';

interface PeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  periodToEdit?: Period | null;
  initialStartDate?: string;
}

export function PeriodModal({
  isOpen,
  onClose,
  periodToEdit,
  initialStartDate,
}: PeriodModalProps) {
  const { addPeriod, updatePeriod, deletePeriod } = usePeriods();

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const [startDate, setStartDate] = useState<string>(initialStartDate || todayStr);
  const [endDate, setEndDate] = useState<string>('');
  const [flow, setFlow] = useState<FlowType>('medium');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (periodToEdit) {
      setStartDate(periodToEdit.start_date);
      setEndDate(periodToEdit.end_date || '');
      setFlow(periodToEdit.flow || 'medium');
      setNotes(periodToEdit.notes || '');
    } else {
      setStartDate(initialStartDate || todayStr);
      setEndDate('');
      setFlow('medium');
      setNotes('');
    }
  }, [periodToEdit, initialStartDate, todayStr, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const pStart = parseISO(startDate);
    if (!isValid(pStart)) {
      setError('Please select a valid start date.');
      return;
    }

    if (endDate) {
      const pEnd = parseISO(endDate);
      if (!isValid(pEnd)) {
        setError('Please select a valid end date.');
        return;
      }
      if (pEnd < pStart) {
        setError('Period end date cannot be earlier than start date.');
        return;
      }
    }

    setLoading(true);

    try {
      if (periodToEdit) {
        await updatePeriod({
          id: periodToEdit.id,
          start_date: startDate,
          end_date: endDate || null,
          flow,
          notes: notes.trim() || null,
        });
      } else {
        await addPeriod({
          start_date: startDate,
          end_date: endDate || null,
          flow,
          notes: notes.trim() || null,
        });
      }
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to save period record.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!periodToEdit) return;
    if (!confirm('Are you sure you want to delete this period entry?')) return;

    setLoading(true);
    try {
      await deletePeriod(periodToEdit.id);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to delete period entry.');
      }
    } finally {
      setLoading(false);
    }
  };

  const flowOptions: { type: FlowType; label: string; bg: string }[] = [
    { type: 'spotting', label: 'Spotting', bg: 'bg-pink-100 border-pink-300 text-pink-800' },
    { type: 'light', label: 'Light', bg: 'bg-rose-100 border-rose-300 text-rose-800' },
    { type: 'medium', label: 'Medium', bg: 'bg-rose-200 border-rose-400 text-rose-900' },
    { type: 'heavy', label: 'Heavy', bg: 'bg-red-200 border-red-400 text-red-950' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md glass-panel p-5 rounded-2xl shadow-comfort border border-white/60 text-foreground relative space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-lunara-rose/30 flex items-center justify-center text-primary">
              <Droplets className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-foreground">
              {periodToEdit ? 'Edit Period Entry' : 'Log Period Day'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-muted-fg hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Start Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-muted/60 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                End Date <span className="text-muted-fg font-normal">(Optional)</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-muted/60 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Flow Intensity</label>
            <div className="grid grid-cols-4 gap-2">
              {flowOptions.map((opt) => (
                <button
                  type="button"
                  key={opt.type}
                  onClick={() => setFlow(opt.type)}
                  className={`py-2 px-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center ${
                    flow === opt.type
                      ? `${opt.bg} shadow-soft ring-2 ring-primary/40`
                      : 'bg-muted/40 border-border text-muted-fg hover:text-foreground'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Optional Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Mild cramps, extra hydration needed"
              className="w-full px-3 py-2 rounded-xl bg-muted/60 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            {periodToEdit ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-muted-fg hover:text-foreground transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-primary text-primary-fg text-xs font-semibold shadow-comfort hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span className="animate-pulse">Saving...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{periodToEdit ? 'Update Period' : 'Save Period'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
