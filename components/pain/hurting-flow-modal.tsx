'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  ChevronLeft,
  ChevronRight,
  HeartPulse,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Flame,
  Coffee,
  BedDouble,
  ShieldAlert,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  PainLocationKey,
  PainTypeKey,
  formatBodyAreas,
  formatPainTypes,
  getSeverityDescriptor,
} from '@/lib/types/pain';
import { PainMeter } from './pain-meter';
import { PainLocationSelector } from './pain-location-selector';
import { PainTypeSelector } from './pain-type-selector';
import { usePainLogs } from '@/lib/hooks/use-pain';

interface HurtingFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HurtingFlowModal({ isOpen, onClose }: HurtingFlowModalProps) {
  const router = useRouter();
  const { addPainLog, isAdding } = usePainLogs();

  const [step, setStep] = useState<number>(1);
  const [selectedLocations, setSelectedLocations] = useState<PainLocationKey[]>(['lower_abdomen']);
  const [severity, setSeverity] = useState<number>(5);
  const [selectedTypes, setSelectedTypes] = useState<PainTypeKey[]>(['cramping']);
  const [notes, setNotes] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    // Reset wizard state without creating any pain record
    setStep(1);
    setSelectedLocations(['lower_abdomen']);
    setSeverity(5);
    setSelectedTypes(['cramping']);
    setNotes('');
    setErrorMessage(null);
    onClose();
  };

  const handleNext = () => {
    setErrorMessage(null);
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    setErrorMessage(null);
    if (step > 1) setStep(step - 1);
  };

  const handleSave = async () => {
    setErrorMessage(null);
    try {
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      await addPainLog({
        date: todayStr,
        body_area: formatBodyAreas(selectedLocations),
        severity,
        pain_type: formatPainTypes(selectedTypes),
        notes: notes.trim() || null,
      });

      handleClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to save pain log to Supabase. Please try again.');
      }
    }
  };

  const descriptor = getSeverityDescriptor(severity);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4 overflow-y-auto">
      {/* Mobile focused full-screen container / Desktop dialog container */}
      <div className="bg-background w-full h-full sm:h-auto sm:max-w-xl sm:rounded-2xl shadow-comfort border border-border flex flex-col justify-between p-5 sm:p-6 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header & Step Counter */}
        <div>
          <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-700 flex items-center justify-center font-bold">
                <HeartPulse className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">I&apos;m Hurting Right Now</h2>
                <span className="text-xs text-primary font-semibold">Step {step} of 4</span>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="p-2 rounded-full text-muted-fg hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="Cancel and close"
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

          {/* STEP 1: WHERE DOES IT HURT? */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">Where does it hurt?</h3>
                <p className="text-xs text-muted-fg mt-0.5">
                  Select one or more areas experiencing discomfort.
                </p>
              </div>
              <PainLocationSelector
                selectedKeys={selectedLocations}
                onChange={setSelectedLocations}
              />
            </div>
          )}

          {/* STEP 2: HOW BAD IS IT? */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">How bad is it?</h3>
                <p className="text-xs text-muted-fg mt-0.5">
                  Slide or tap to select pain level on a scale from 0 to 10.
                </p>
              </div>
              <PainMeter value={severity} onChange={setSeverity} />
            </div>
          )}

          {/* STEP 3: WHAT DOES IT FEEL LIKE? */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">What does it feel like?</h3>
                <p className="text-xs text-muted-fg mt-0.5">
                  Choose pain characteristics and add optional notes.
                </p>
              </div>

              <PainTypeSelector
                selectedKeys={selectedTypes}
                onChange={setSelectedTypes}
              />

              <div className="pt-2">
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Optional Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Anything else you want Lunara to remember?"
                  rows={3}
                  className="w-full p-3 rounded-2xl bg-muted/30 border border-border text-xs text-foreground placeholder:text-muted-fg focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                />
              </div>
            </div>
          )}

          {/* STEP 4: WHAT MIGHT HELP RIGHT NOW? */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">What might help right now?</h3>
                <p className="text-xs text-muted-fg mt-0.5">
                  Gentle comfort suggestions tailored for your logged discomfort level ({severity}/10).
                </p>
              </div>

              {/* Dynamic Comfort Cards */}
              <div className="space-y-2.5">
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-200 flex items-start gap-3">
                  <Flame className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-rose-900">Gentle Soothing Heat</h4>
                    <p className="text-[11px] text-rose-800 mt-0.5 leading-relaxed">
                      A heating pad or warm compress on your lower abdomen or lower back may feel soothing. (Avoid sleeping with an active heating pad).
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-200 flex items-start gap-3">
                  <Coffee className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-blue-900">Warm Hydration</h4>
                    <p className="text-[11px] text-blue-800 mt-0.5 leading-relaxed">
                      Sipping warm water or herbal chamomile tea may help relax tense muscles.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-200 flex items-start gap-3">
                  <BedDouble className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-purple-900">Rest & Supported Position</h4>
                    <p className="text-[11px] text-purple-800 mt-0.5 leading-relaxed">
                      Resting on your side in a curled fetal position with a pillow between your knees may reduce pelvic pressure.
                    </p>
                  </div>
                </div>
              </div>

              {/* Safety notice for severe pain */}
              {severity >= 7 && (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-300 text-amber-900 text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    Your pain is marked as severe. If pain is sudden, persistent, or worsening, please consult a medical professional.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between gap-3 pt-6 border-t border-border/60 mt-6">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={isAdding}
              className="px-4 py-2.5 rounded-2xl bg-muted/60 hover:bg-muted text-foreground text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer min-h-[44px]"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 rounded-2xl bg-muted/40 text-muted-fg hover:text-foreground text-xs font-medium transition-all cursor-pointer min-h-[44px]"
            >
              Cancel
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-2xl bg-primary text-primary-fg text-xs font-bold shadow-soft hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer min-h-[44px]"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  handleSave();
                  router.push('/relief');
                }}
                disabled={isAdding}
                className="px-3.5 py-2.5 rounded-2xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold transition-all cursor-pointer min-h-[44px]"
              >
                Go to Relief Center
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={isAdding}
                className="px-5 py-2.5 rounded-2xl bg-primary text-primary-fg text-xs font-bold shadow-comfort hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 min-h-[44px]"
              >
                {isAdding ? (
                  <span className="animate-pulse">Saving...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save Log</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
