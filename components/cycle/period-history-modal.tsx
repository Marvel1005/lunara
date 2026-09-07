'use client';

import React, { useState } from 'react';
import { format, parseISO, isValid } from 'date-fns';
import { Calendar as CalendarIcon, Edit3, Trash2, Plus, X, Droplets } from 'lucide-react';
import { Period } from '@/lib/cycle/types';
import { usePeriods } from '@/lib/hooks/use-periods';
import { PeriodModal } from './period-modal';

interface PeriodHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PeriodHistoryModal({ isOpen, onClose }: PeriodHistoryModalProps) {
  const { periods, deletePeriod } = usePeriods();
  const [selectedPeriod, setSelectedPeriod] = useState<Period | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (!isOpen) return null;

  const formatDateLabel = (dateStr: string) => {
    const parsed = parseISO(dateStr);
    return isValid(parsed) ? format(parsed, 'MMM d, yyyy') : dateStr;
  };

  const handleEdit = (p: Period) => {
    setSelectedPeriod(p);
    setIsEditModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedPeriod(null);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this period record?')) return;
    try {
      await deletePeriod(id);
    } catch (err) {
      console.error('Delete period error:', err);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="w-full max-w-lg glass-panel p-6 rounded-4xl shadow-comfort border border-white/60 text-foreground relative space-y-5 max-h-[85vh] flex flex-col">
          <div className="flex items-center justify-between border-b border-border/60 pb-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-lunara-rose/30 flex items-center justify-center text-primary">
                <CalendarIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Period History</h3>
                <p className="text-xs text-muted-fg">Logged periods in your private sanctuary</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-muted-fg hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between shrink-0">
            <span className="text-xs font-semibold text-muted-fg">
              {periods.length} {periods.length === 1 ? 'record' : 'records'} logged
            </span>
            <button
              onClick={handleAddNew}
              className="px-3 py-1.5 rounded-xl bg-primary text-primary-fg text-xs font-semibold shadow-soft hover:opacity-95 transition-all flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Period</span>
            </button>
          </div>

          <div className="overflow-y-auto space-y-3 pr-1 flex-1">
            {periods.length === 0 ? (
              <div className="p-8 text-center rounded-3xl bg-muted/30 border border-border/60 space-y-2">
                <Droplets className="w-8 h-8 text-muted-fg mx-auto opacity-50" />
                <p className="text-xs font-semibold text-foreground">No periods recorded yet</p>
                <p className="text-[11px] text-muted-fg">Log your first period to start cycle tracking.</p>
              </div>
            ) : (
              periods.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-between gap-3 hover:bg-muted/60 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">
                        {formatDateLabel(p.start_date)}
                      </span>
                      <span className="text-xs text-muted-fg">→</span>
                      <span className="text-xs font-bold text-foreground">
                        {p.end_date ? formatDateLabel(p.end_date) : 'Ongoing'}
                      </span>
                      {p.flow && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-700 uppercase tracking-wider">
                          {p.flow}
                        </span>
                      )}
                    </div>
                    {p.notes && <p className="text-xs text-muted-fg italic">{p.notes}</p>}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleEdit(p)}
                      className="p-1.5 rounded-xl text-muted-fg hover:text-primary hover:bg-primary-soft transition-colors cursor-pointer"
                      title="Edit entry"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-1.5 rounded-xl text-muted-fg hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <PeriodModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        periodToEdit={selectedPeriod}
      />
    </>
  );
}
