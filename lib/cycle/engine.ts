import {
  addDays,
  subDays,
  differenceInDays,
  parseISO,
  startOfDay,
  isValid,
  isBefore,
  isAfter,
  isSameDay,
} from 'date-fns';
import {
  Period,
  CycleSettings,
  CyclePhase,
  CycleCalculationResult,
} from './types';

export const DISCLAIMER_TEXT =
  'Cycle predictions are mathematical estimates based on your logged history and average cycle lengths. They are not guaranteed biological determinations.';

/**
 * Calculates the current 1-based cycle day given a period start date.
 */
export function calculateCycleDay(lastPeriodStart: Date, currentDate: Date = new Date()): number {
  const start = startOfDay(lastPeriodStart);
  const target = startOfDay(currentDate);

  if (!isValid(start) || !isValid(target)) return 1;
  const diff = differenceInDays(target, start);

  return diff >= 0 ? diff + 1 : 1;
}

/**
 * Determines the cycle phase based on cycle day, cycle length, and period length.
 */
export function calculateCyclePhase(
  dayInCycle: number,
  cycleLength: number = 28,
  periodLength: number = 5
): { phase: CyclePhase; phaseName: string; phaseDescription: string } {
  const ovulationDay = Math.max(1, cycleLength - 14);

  if (dayInCycle <= periodLength) {
    return {
      phase: 'menstrual',
      phaseName: 'Menstrual Phase',
      phaseDescription: 'Your body is resetting. Prioritize rest, warm tea, and gentle self-care.',
    };
  }

  if (dayInCycle < ovulationDay - 1) {
    return {
      phase: 'follicular',
      phaseName: 'Follicular Phase',
      phaseDescription: 'Energy is naturally building up. A great time for new ideas and light activity.',
    };
  }

  if (dayInCycle >= ovulationDay - 1 && dayInCycle <= ovulationDay + 1) {
    return {
      phase: 'ovulation',
      phaseName: 'Estimated Ovulation',
      phaseDescription: 'Peak vitality window based on historical cycle timing.',
    };
  }

  return {
    phase: 'luteal',
    phaseName: 'Luteal Phase',
    phaseDescription: 'Winding down toward your next cycle. Focus on grounding and comfort.',
  };
}

/**
 * Estimates the start date of the next period.
 */
export function estimateNextPeriod(lastPeriodStart: Date, averageCycleLength: number = 28): Date {
  return addDays(startOfDay(lastPeriodStart), averageCycleLength);
}

/**
 * Estimates the end date of a period given its start date.
 */
export function estimatePeriodEnd(periodStart: Date, averagePeriodLength: number = 5): Date {
  return addDays(startOfDay(periodStart), Math.max(1, averagePeriodLength - 1));
}

/**
 * Estimates the ovulation date for a given cycle.
 */
export function estimateOvulation(lastPeriodStart: Date, averageCycleLength: number = 28): Date {
  const ovulationDayOffset = Math.max(1, averageCycleLength - 14);
  return addDays(startOfDay(lastPeriodStart), ovulationDayOffset);
}

/**
 * Estimates the fertile window (5 days prior to estimated ovulation through ovulation day).
 */
export function estimateFertileWindow(ovulationDate: Date): { start: Date; end: Date } {
  const end = startOfDay(ovulationDate);
  const start = subDays(end, 5);
  return { start, end };
}

/**
 * Comprehensive cycle calculation aggregator that produces a complete CycleCalculationResult from real Supabase records.
 */
export function calculateCycleSummary(
  periods: Period[],
  settings?: CycleSettings | null,
  currentDate: Date = new Date()
): CycleCalculationResult {
  const cycleLength = settings?.average_cycle_length || 28;
  const periodLength = settings?.average_period_length || 5;

  const today = startOfDay(currentDate);

  // If no period records exist
  if (!periods || periods.length === 0) {
    const fallbackStart = today;
    const nextStart = estimateNextPeriod(fallbackStart, cycleLength);
    const nextEnd = estimatePeriodEnd(nextStart, periodLength);
    const ovulation = estimateOvulation(fallbackStart, cycleLength);
    const fertile = estimateFertileWindow(ovulation);

    return {
      currentCycleDay: 1,
      totalCycleLength: cycleLength,
      averagePeriodLength: periodLength,
      phase: 'follicular',
      phaseName: 'Follicular Phase',
      phaseDescription: 'Set up your first period to receive personalized cycle estimates.',
      isPeriod: false,
      daysUntilNextPeriod: cycleLength,
      nextPeriodStartDate: nextStart,
      nextPeriodEndDate: nextEnd,
      estimatedOvulationDate: ovulation,
      estimatedFertileWindow: fertile,
      lastPeriodStartDate: null,
      hasCycleData: false,
      activePeriod: null,
      disclaimer: DISCLAIMER_TEXT,
    };
  }

  // Sort periods chronologically descending (newest first)
  const sortedPeriods = [...periods].sort(
    (a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
  );

  const latestPeriod = sortedPeriods[0];
  const lastPeriodStart = startOfDay(parseISO(latestPeriod.start_date));

  // Determine if there is an active period today
  let activePeriod: Period | null = null;
  let isPeriod = false;
  let periodDay: number | undefined = undefined;
  let daysRemainingInPeriod: number | undefined = undefined;

  // Check if today falls within any recorded period
  for (const p of sortedPeriods) {
    const pStart = startOfDay(parseISO(p.start_date));
    const pEnd = p.end_date ? startOfDay(parseISO(p.end_date)) : estimatePeriodEnd(pStart, periodLength);

    if (
      (isSameDay(today, pStart) || isAfter(today, pStart)) &&
      (isSameDay(today, pEnd) || isBefore(today, pEnd))
    ) {
      activePeriod = p;
      isPeriod = true;
      periodDay = differenceInDays(today, pStart) + 1;

      const totalDaysInPeriod = p.end_date
        ? differenceInDays(pEnd, pStart) + 1
        : periodLength;

      daysRemainingInPeriod = Math.max(0, totalDaysInPeriod - periodDay);
      break;
    }
  }

  // Calculate cycle day relative to last period start
  let currentCycleDay = calculateCycleDay(lastPeriodStart, today);

  // Next period estimation
  let nextPeriodStart = estimateNextPeriod(lastPeriodStart, cycleLength);

  // If current date has passed the estimated next period date, project forward
  while (isBefore(nextPeriodStart, today) && !isSameDay(nextPeriodStart, today)) {
    nextPeriodStart = addDays(nextPeriodStart, cycleLength);
  }

  const nextPeriodEnd = estimatePeriodEnd(nextPeriodStart, periodLength);
  const daysUntilNextPeriod = Math.max(0, differenceInDays(nextPeriodStart, today));

  // Calculate phase
  const phaseInfo = calculateCyclePhase(currentCycleDay, cycleLength, periodLength);

  // Calculate ovulation & fertile window relative to current cycle
  const currentCycleStart = subDays(nextPeriodStart, cycleLength);
  const estimatedOvulation = estimateOvulation(currentCycleStart, cycleLength);
  const estimatedFertile = estimateFertileWindow(estimatedOvulation);

  return {
    currentCycleDay,
    totalCycleLength: cycleLength,
    averagePeriodLength: periodLength,
    phase: isPeriod ? 'menstrual' : phaseInfo.phase,
    phaseName: isPeriod ? 'Menstrual Phase' : phaseInfo.phaseName,
    phaseDescription: isPeriod
      ? 'Your body is resetting. Prioritize rest, warm tea, and gentle self-care.'
      : phaseInfo.phaseDescription,
    isPeriod,
    periodDay,
    daysRemainingInPeriod,
    daysUntilNextPeriod,
    nextPeriodStartDate: nextPeriodStart,
    nextPeriodEndDate: nextPeriodEnd,
    estimatedOvulationDate: estimatedOvulation,
    estimatedFertileWindow: estimatedFertile,
    lastPeriodStartDate: lastPeriodStart,
    hasCycleData: true,
    activePeriod,
    disclaimer: DISCLAIMER_TEXT,
  };
}
