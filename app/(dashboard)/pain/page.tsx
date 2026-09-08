'use client';

import React, { useState } from 'react';
import { usePainLogs } from '@/lib/hooks/use-pain';
import { PainMeter } from '@/components/pain/pain-meter';
import { PainLocationSelector } from '@/components/pain/pain-location-selector';
import { PainTypeSelector } from '@/components/pain/pain-type-selector';
import { PainLocationKey, PainTypeKey, formatBodyAreas, formatPainTypes, getSeverityDescriptor } from '@/lib/types/pain';
import { HeartPulse, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

export default function PainPage() {
  const [severity, setSeverity] = useState<number>(4);
  const [locations, setLocations] = useState<PainLocationKey[]>(['lower_abdomen']);
  const [types, setTypes] = useState<PainTypeKey[]>(['cramping']);
  const [notes, setNotes] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { addPainLog, isAdding } = usePainLogs();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addPainLog({
        date: format(new Date(), 'yyyy-MM-dd'),
        severity,
        body_area: formatBodyAreas(locations),
        pain_type: formatPainTypes(types),
        notes: notes.trim() || null,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to log pain entry:', err);
    }
  };

  const descriptor = getSeverityDescriptor(severity);

  return (
    <div className="space-y-5 pb-10 max-w-2xl mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <HeartPulse className="w-5 h-5 text-primary" />
          <span>Pain & Discomfort Check-In</span>
        </h1>
        <p className="text-xs sm:text-sm text-muted-fg">
          Log how your body feels right now to personalize your comfort plan.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs flex items-center gap-2.5 shadow-soft">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <div>
            <span className="font-bold block text-emerald-950">Pain log saved</span>
            <span>Your check-in has been stored securely in your private health log.</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        {/* 1. TACTILE PAIN METER */}
        <div className="card-depth-primary p-5 sm:p-6 space-y-4 rounded-2xl">
          <div className="border-b border-border/60 pb-3">
            <h2 className="text-sm font-bold text-foreground">1. How intense is your discomfort?</h2>
            <p className="text-xs text-muted-fg">Slide from 0 (No pain) to 10 (Very severe)</p>
          </div>

          <PainMeter value={severity} onChange={setSeverity} />

          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/70 text-xs space-y-0.5">
            <span className={descriptor.colorClass}>{descriptor.label} ({severity}/10)</span>
            <p className="text-muted-fg leading-relaxed">{descriptor.description}</p>
          </div>
        </div>

        {/* 2. BODY LOCATION SELECTOR */}
        <div className="card-depth-primary p-5 sm:p-6 space-y-4 rounded-2xl">
          <div className="border-b border-border/60 pb-3">
            <h2 className="text-sm font-bold text-foreground">2. Where are you feeling it?</h2>
            <p className="text-xs text-muted-fg">Select all areas where you feel body discomfort</p>
          </div>

          <PainLocationSelector selectedKeys={locations} onChange={setLocations} />
        </div>

        {/* 3. PAIN TYPE SELECTOR */}
        <div className="card-depth-primary p-5 sm:p-6 space-y-4 rounded-2xl">
          <div className="border-b border-border/60 pb-3">
            <h2 className="text-sm font-bold text-foreground">3. What does it feel like?</h2>
            <p className="text-xs text-muted-fg">Select sensation characteristics</p>
          </div>

          <PainTypeSelector selectedKeys={types} onChange={setTypes} />
        </div>

        {/* 4. NOTES */}
        <div className="card-depth-primary p-5 sm:p-6 space-y-3 rounded-2xl">
          <h2 className="text-sm font-bold text-foreground">4. Additional Notes (Optional)</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Log details like heat therapy used, hot tea, or symptoms..."
            rows={3}
            className="w-full p-3 rounded-xl bg-muted/20 border border-border text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none leading-relaxed"
          />

          <button
            type="submit"
            disabled={isAdding}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-primary text-white text-xs font-bold shadow-soft hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 tactile-button"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isAdding ? 'Saving...' : 'Save Check-in'}</span>
          </button>
        </div>
      </form>

      {/* Safety Notice */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-300/80 space-y-1.5">
        <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
          <span>Care & Safety Guidance</span>
        </div>
        <p className="text-[11px] text-amber-900/90 leading-relaxed">
          Lunara pain check-ins are for personal comfort tracking. If your pain is unusually severe, sudden, or persistent, please consult a healthcare professional.
        </p>
      </div>
    </div>
  );
}
