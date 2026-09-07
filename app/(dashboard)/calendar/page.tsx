'use client';

import React, { useState } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
  addDays,
} from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Droplets,
  Calendar as CalendarIcon,
  Info,
  Plus,
} from 'lucide-react';
import { usePeriods } from '@/lib/hooks/use-periods';
import { useCycleSettings } from '@/lib/hooks/use-cycle';
import { calculateCycleSummary } from '@/lib/cycle/engine';
import { PeriodModal } from '@/components/cycle/period-modal';
import { ThemeCornerDecor, ThemeBadge } from '@/components/theme/theme-decorations';

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const { periods, isLoading: isLoadingPeriods } = usePeriods();
  const { settings, isLoading: isLoadingSettings } = useCycleSettings();

  // Log/Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  const summary = calculateCycleSummary(periods, settings);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const resetToToday = () => setCurrentMonth(new Date());

  const handleDayClick = (day: Date) => {
    setSelectedDateStr(format(day, 'yyyy-MM-dd'));
    setIsModalOpen(true);
  };

  // Helper checks for day rendering
  const getDayStatus = (day: Date) => {
    const dayStr = format(day, 'yyyy-MM-dd');

    // 1. Recorded period check
    for (const p of periods) {
      const pStart = parseISO(p.start_date);
      const pEnd = p.end_date ? parseISO(p.end_date) : addDays(pStart, (settings?.average_period_length || 5) - 1);

      if ((isSameDay(day, pStart) || day > pStart) && (isSameDay(day, pEnd) || day < pEnd)) {
        return {
          isRecordedPeriod: true,
          flow: p.flow,
          periodRecord: p,
        };
      }
    }

    // 2. Predicted upcoming period check
    const avgCycle = settings?.average_cycle_length || 28;
    const avgPeriod = settings?.average_period_length || 5;

    // Check multiple projected future period cycles
    let projStart = summary.nextPeriodStartDate;
    for (let i = 0; i < 6; i++) {
      const projEnd = addDays(projStart, avgPeriod - 1);
      if ((isSameDay(day, projStart) || day > projStart) && (isSameDay(day, projEnd) || day < projEnd)) {
        return { isPredictedPeriod: true };
      }
      projStart = addDays(projStart, avgCycle);
    }

    // 3. Estimated Ovulation check
    if (isSameDay(day, summary.estimatedOvulationDate)) {
      return { isOvulation: true };
    }

    // 4. Estimated Fertile Window check
    if (
      (isSameDay(day, summary.estimatedFertileWindow.start) || day > summary.estimatedFertileWindow.start) &&
      (isSameDay(day, summary.estimatedFertileWindow.end) || day < summary.estimatedFertileWindow.end)
    ) {
      return { isFertile: true };
    }

    return {};
  };

  return (
    <div className="space-y-8 pb-12">
      <PeriodModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialStartDate={selectedDateStr}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <CalendarIcon className="w-6 h-6 text-primary" />
            <span>Cycle Calendar</span>
          </h1>
          <p className="text-sm text-muted-fg mt-1">
            Visualizing recorded period history and mathematical predictions.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedDateStr(format(new Date(), 'yyyy-MM-dd'));
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-primary-fg text-xs font-semibold shadow-comfort hover:opacity-95 transition-all cursor-pointer shrink-0 tactile-button"
        >
          <Plus className="w-4 h-4" />
          <span>Log Period for Today</span>
        </button>
      </div>

      {/* Calendar Card Container */}
      <div className="card-depth-primary p-6 sm:p-8 space-y-6 relative overflow-hidden">
        <ThemeCornerDecor size="lg" className="top-0 right-0" />

        {/* Month Navigation & Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border/60 pb-5">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <span>{format(currentMonth, 'MMMM yyyy')}</span>
            <ThemeBadge>
              {periods.length} logged
            </ThemeBadge>
          </h2>

          <div className="flex items-center gap-2">
            <button
              onClick={resetToToday}
              className="px-3.5 py-1.5 rounded-xl bg-muted/60 hover:bg-muted border border-border text-xs font-semibold text-foreground transition-all cursor-pointer tactile-button"
            >
              Today
            </button>
            <button
              onClick={prevMonth}
              className="p-2 rounded-xl bg-muted/60 hover:bg-muted border border-border text-foreground transition-all cursor-pointer tactile-button"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 rounded-xl bg-muted/60 hover:bg-muted border border-border text-foreground transition-all cursor-pointer tactile-button"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted-fg bg-muted/30 p-3.5 rounded-2xl border border-border/50">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-primary shadow-soft inline-block" />
            <span className="text-foreground font-semibold">Recorded Period</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md border-2 border-dashed border-primary/60 bg-primary-soft/40 inline-block" />
            <span>Predicted Period</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-amber-200 text-amber-800 text-[10px] flex items-center justify-center font-bold">
              ✨
            </span>
            <span>Estimated Ovulation</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-purple-100 border border-purple-200 inline-block" />
            <span>Fertile Window</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div>
          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center">
            {weekDays.map((day) => (
              <div key={day} className="text-xs font-bold text-muted-fg py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {days.map((day) => {
              const isSelectedMonth = isSameMonth(day, monthStart);
              const isTodayDay = isToday(day);
              const status = getDayStatus(day);

              let cellStyle = 'bg-muted/20 hover:bg-muted/60 text-foreground';

              if (status.isRecordedPeriod) {
                cellStyle = 'bg-primary text-primary-fg font-bold shadow-soft border border-primary/40';
              } else if (status.isPredictedPeriod) {
                cellStyle = 'bg-primary-soft/30 border-2 border-dashed border-primary/60 text-foreground font-semibold';
              } else if (status.isOvulation) {
                cellStyle = 'bg-amber-100 border border-amber-300 text-amber-900 font-bold shadow-soft';
              } else if (status.isFertile) {
                cellStyle = 'bg-purple-100/70 border border-purple-200 text-purple-900 font-medium';
              }

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => handleDayClick(day)}
                  disabled={!isSelectedMonth}
                  className={`h-16 sm:h-20 p-1.5 rounded-2xl flex flex-col transition-all cursor-pointer text-left relative ${cellStyle} ${
                    !isSelectedMonth ? 'opacity-30 cursor-default pointer-events-none' : ''
                  } ${isTodayDay ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                >
                  {/* Day number + icon row — always top */}
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-semibold leading-none ${
                        isTodayDay
                          ? 'w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[11px]'
                          : ''
                      }`}
                    >
                      {format(day, 'd')}
                    </span>
                    {status.isOvulation && (
                      <Sparkles className="w-3 h-3 text-amber-600" />
                    )}
                    {status.isRecordedPeriod && (
                      <Droplets className="w-3 h-3 text-white" />
                    )}
                  </div>

                  {/* Status label — always bottom, fixed space */}
                  <div className="mt-auto">
                    {status.isRecordedPeriod && status.flow && (
                      <span className="text-[8px] font-extrabold uppercase tracking-wide px-1 py-0.5 rounded-full bg-white/30 text-white">
                        {status.flow}
                      </span>
                    )}
                    {status.isPredictedPeriod && (
                      <span className="text-[8px] font-semibold text-primary block leading-none">Predicted</span>
                    )}
                    {status.isOvulation && (
                      <span className="text-[8px] font-bold text-amber-800 block leading-none">Ovulation</span>
                    )}
                    {status.isFertile && !status.isOvulation && (
                      <span className="text-[8px] font-medium text-purple-700 block leading-none">Fertile</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Disclaimer Footer */}
        <div className="pt-4 border-t border-border/50 flex items-center gap-2 text-xs text-muted-fg">
          <Info className="w-4 h-4 text-primary shrink-0" />
          <span>
            Calendar predictions are mathematical estimates based on your logged history and average cycle length ({settings?.average_cycle_length || 28} days).
          </span>
        </div>
      </div>
    </div>
  );
}
