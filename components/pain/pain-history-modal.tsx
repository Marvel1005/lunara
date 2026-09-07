'use client';

import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import {
  X,
  Trash2,
  Edit3,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HeartPulse,
} from 'lucide-react';
import {
  PainLog,
  parseBodyAreas,
  parsePainTypes,
  formatBodyAreas,
  formatPainTypes,
  getLocationLabel,
  getPainTypeLabel,
  getSeverityDescriptor,
  PainLocationKey,
  PainTypeKey,
} from '@/lib/types/pain';
import { usePainLogs } from '@/lib/hooks/use-pain';
import { usePeriods } from '@/lib/hooks/use-periods';
import { useCycleSettings } from '@/lib/hooks/use-cycle';
import { calculateCycleSummary } from '@/lib/cycle/engine';
import { PainMeter } from './pain-meter';
import { PainLocationSelector } from './pain-location-selector';
import { PainTypeSelector } from './pain-type-selector';

interface PainHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PainHistoryModal({ isOpen, onClose }: PainHistoryModalProps) {
  const { painLogs, updatePainLogAsync, deletePainLog, isUpdating, isDeleting } = usePainLogs();
  const { periods } = usePeriods();
  const { settings } = useCycleSettings();

  const [editingLog, setEditingLog] = useState<PainLog | null>(null);
  const [editLocations, setEditLocations] = useState<PainLocationKey[]>([]);
  const [editSeverity, setEditSeverity] = useState<number>(5);
  const [editTypes, setEditTypes] = useState<PainTypeKey[]>([]);
  const [editNotes, setEditNotes] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const cycleSummary = calculateCycleSummary(periods, settings);

  const handleStartEdit = (log: PainLog) => {
    setEditingLog(log);
    setEditLocations(parseBodyAreas(log.body_area));
    setEditSeverity(log.severity);
    setEditTypes(parsePainTypes(log.pain_type));
    setEditNotes(log.notes || '');
    setErrorMessage(null);
  };

  const handleSaveEdit = async () => {
    if (!editingLog) return;
    setErrorMessage(null);
    try {
      await updatePainLogAsync({
        id: editingLog.id,
        body_area: formatBodyAreas(editLocations),
        severity: editSeverity,
        pain_type: formatPainTypes(editTypes),
        notes: editNotes.trim() || null,
      });
      setEditingLog(null);
    } catch (err: unknown) {
      if (err instanceof Error) setErrorMessage(err.message);
      else setErrorMessage('Failed to update pain log in Supabase.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this pain log entry?')) {
      try {
        await deletePainLog(id);
      } catch (err: unknown) {
        if (err instanceof Error) setErrorMessage(err.message);
        else setErrorMessage('Failed to delete pain log from Supabase.');
      }
    }
  };

  // Helper to dynamically calculate cycle day/phase for a pain log date
  const getDynamicCycleContext = (logDateStr: string) => {
    if (!periods || periods.length === 0) return null;
    const logDate = parseISO(logDateStr);
    const lastPeriodStart = parseISO(periods[0].start_date);
    
    // Check if log date falls on/after period start
    const diffDays = Math.floor((logDate.getTime() - lastPeriodStart.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays >= 0 && diffDays < (settings?.average_cycle_length || 28)) {
      const cycleDay = diffDays + 1;
      let phaseLabel = 'Follicular Phase';
      if (cycleDay <= (settings?.average_period_length || 5)) phaseLabel = 'Menstrual Phase';
      else if (cycleDay === (settings?.average_cycle_length || 28) - 14) phaseLabel = 'Ovulation Day';
      else if (cycleDay > (settings?.average_cycle_length || 28) - 14) phaseLabel = 'Luteal Phase';
      return `Cycle Day ${cycleDay} (${phaseLabel})`;
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-background w-full h-full sm:h-auto sm:max-w-2xl sm:rounded-4xl shadow-comfort border border-border flex flex-col justify-between p-5 sm:p-7 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Pain History & Comfort Logs</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-muted-fg hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* EDIT FORM VIEW */}
          {editingLog ? (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-primary" />
                <span>Editing Pain Log ({editingLog.date})</span>
              </h3>

              <PainMeter value={editSeverity} onChange={setEditSeverity} />
              <PainLocationSelector selectedKeys={editLocations} onChange={setEditLocations} />
              <PainTypeSelector selectedKeys={editTypes} onChange={setEditTypes} />

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Notes</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={2}
                  className="w-full p-3 rounded-2xl bg-muted/30 border border-border text-xs text-foreground placeholder:text-muted-fg focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingLog(null)}
                  className="px-4 py-2 rounded-xl bg-muted text-foreground text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={isUpdating}
                  className="px-5 py-2 rounded-xl bg-primary text-primary-fg text-xs font-semibold shadow-soft flex items-center gap-1.5"
                >
                  {isUpdating ? 'Saving...' : 'Update Log'}
                </button>
              </div>
            </div>
          ) : (
            /* LIST VIEW */
            <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
              {painLogs.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-3xl bg-muted/20 border border-dashed border-border space-y-2">
                  <Sparkles className="w-8 h-8 text-muted-fg mx-auto opacity-50" />
                  <h3 className="text-sm font-bold text-foreground">No Pain Logs Recorded</h3>
                  <p className="text-xs text-muted-fg max-w-xs mx-auto">
                    Tap &quot;I&apos;m Hurting&quot; on your dashboard whenever you want Lunara to remember your discomfort patterns.
                  </p>
                </div>
              ) : (
                painLogs.map((log) => {
                  const descriptor = getSeverityDescriptor(log.severity);
                  const locations = parseBodyAreas(log.body_area);
                  const types = parsePainTypes(log.pain_type);
                  const dynamicCycleContext = getDynamicCycleContext(log.date);

                  return (
                    <div
                      key={log.id}
                      className="p-4 rounded-3xl bg-muted/30 border border-border/80 space-y-3 shadow-soft hover:border-border transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-foreground flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-primary" />
                              {format(parseISO(log.date), 'MMM d, yyyy')}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${descriptor.badgeBg}`}>
                              {log.severity}/10 • {descriptor.label}
                            </span>
                          </div>

                          {dynamicCycleContext && (
                            <span className="inline-block text-[10px] font-semibold text-primary px-2 py-0.5 rounded-md bg-primary-soft">
                              ✨ {dynamicCycleContext}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleStartEdit(log)}
                            className="p-2 rounded-xl text-muted-fg hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                            title="Edit log"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(log.id)}
                            disabled={isDeleting}
                            className="p-2 rounded-xl text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Delete log"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Locations Badges */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-semibold text-muted-fg">Areas:</span>
                        {locations.map((locKey) => (
                          <span
                            key={locKey}
                            className="px-2 py-0.5 rounded-lg bg-background border border-border text-[11px] font-medium text-foreground"
                          >
                            {getLocationLabel(locKey)}
                          </span>
                        ))}
                      </div>

                      {/* Types Badges */}
                      {types.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-semibold text-muted-fg">Sensations:</span>
                          {types.map((typeKey) => (
                            <span
                              key={typeKey}
                              className="px-2 py-0.5 rounded-lg bg-primary/10 border border-primary/20 text-[11px] font-medium text-primary"
                            >
                              {getPainTypeLabel(typeKey)}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Notes */}
                      {log.notes && (
                        <p className="text-xs text-muted-fg bg-background/60 p-2.5 rounded-xl border border-border/50 italic">
                          &quot;{log.notes}&quot;
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {!editingLog && (
          <div className="pt-4 border-t border-border/60 mt-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl bg-muted text-foreground text-xs font-semibold transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
