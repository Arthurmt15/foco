import type {
  CheckIn,
  Environment,
  EnvironmentProgress,
  FocoData,
  Goal,
  GoalProgress,
  ProgressState,
  ProgressSummary,
} from "./foco-types";

const DAY_MS = 86_400_000;

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fromDateKey(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function atStartOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

export function weekBounds(today: Date): { start: Date; end: Date } {
  const current = atStartOfDay(today);
  const mondayOffset = current.getDay() === 0 ? -6 : 1 - current.getDay();
  const start = addDays(current, mondayOffset);
  return { start, end: addDays(start, 6) };
}

function periodBounds(goal: Goal, today: Date): { start: Date; end: Date } {
  if (goal.schedule.periodicity === "daily") {
    const current = atStartOfDay(today);
    return { start: current, end: current };
  }
  if (goal.schedule.periodicity === "monthly") {
    return {
      start: new Date(today.getFullYear(), today.getMonth(), 1),
      end: new Date(today.getFullYear(), today.getMonth() + 1, 0),
    };
  }
  return weekBounds(today);
}

function isScheduled(goal: Goal, date: Date): boolean {
  if (goal.schedule.periodicity === "daily") return true;
  if (goal.schedule.scheduleMode === "flexible") return true;
  if (goal.schedule.periodicity === "monthly") {
    const days = goal.schedule.monthDays ?? [];
    return days.length === 0 || days.includes(date.getDate());
  }
  const weekdays = goal.schedule.weekdays ?? [];
  return weekdays.length === 0 || weekdays.includes(date.getDay());
}

function eligibleDates(goal: Goal, periodStart: Date, periodEnd: Date): Date[] {
  const activeStart = fromDateKey(goal.schedule.startsAt);
  const activeEnd = goal.schedule.endsAt ? fromDateKey(goal.schedule.endsAt) : periodEnd;
  const start = activeStart > periodStart ? activeStart : periodStart;
  const end = activeEnd < periodEnd ? activeEnd : periodEnd;
  if (start > end) return [];

  const dates: Date[] = [];
  for (let date = start; date <= end; date = addDays(date, 1)) {
    if (isScheduled(goal, date)) dates.push(date);
  }
  return dates;
}

export function stateFromPlan(actual: number, expected: number, eligible: boolean): ProgressState {
  if (!eligible || expected <= 0) return "neutral";
  const ratio = actual / expected;
  if (ratio >= 0.9) return "on-track";
  if (ratio >= 0.65) return "attention";
  return "behind";
}

function goalProgress(goal: Goal, checkIns: CheckIn[], today: Date): GoalProgress {
  const { start, end } = periodBounds(goal, today);
  const dates = eligibleDates(goal, start, end);
  const elapsed = dates.filter((date) => date <= atStartOfDay(today)).length;
  const expected = dates.length > 0 ? (goal.schedule.target * elapsed) / dates.length : 0;
  const actual = checkIns
    .filter((item) => {
      const date = fromDateKey(item.date);
      return item.goalId === goal.id && date >= start && date <= end;
    })
    .reduce((sum, item) => sum + item.amount, 0);
  const percentage = goal.schedule.target > 0 ? (actual / goal.schedule.target) * 100 : 0;
  const expectedPercentage = goal.schedule.target > 0 ? (expected / goal.schedule.target) * 100 : 0;

  return {
    goal,
    actual,
    expected,
    target: goal.schedule.target,
    percentage,
    expectedPercentage,
    state: stateFromPlan(actual, expected, dates.length > 0),
    eligible: dates.length > 0,
  };
}

function environmentProgress(
  environment: Environment,
  goals: GoalProgress[],
): EnvironmentProgress {
  const eligible = goals.filter(
    (item) => item.goal.environmentId === environment.id && item.eligible,
  );
  // Normalizar evita que unidades grandes, como minutos, dominem o ambiente.
  const actual = eligible.reduce((sum, item) => sum + item.actual / item.target, 0);
  const expected = eligible.reduce((sum, item) => sum + item.expected / item.target, 0);
  const target = eligible.length;

  return {
    environment,
    actual,
    expected,
    target,
    percentage: target > 0 ? (actual / target) * 100 : 0,
    state: stateFromPlan(actual, expected, eligible.length > 0),
    eligibleGoals: eligible.length,
  };
}

function calculateStreak(checkIns: CheckIn[], today: Date): number {
  const days = new Set(checkIns.filter((item) => item.amount > 0).map((item) => item.date));
  let cursor = atStartOfDay(today);
  if (!days.has(toDateKey(cursor))) cursor = addDays(cursor, -1);

  let streak = 0;
  while (days.has(toDateKey(cursor))) {
    streak += 1;
    cursor = new Date(cursor.getTime() - DAY_MS);
  }
  return streak;
}

export function calculateProgress(data: FocoData, today = new Date()): ProgressSummary {
  const goals = data.goals.map((goal) => goalProgress(goal, data.checkIns, today));
  const environments = data.environments.map((environment) =>
    environmentProgress(environment, goals),
  );
  const eligible = goals.filter((item) => item.eligible);
  const actual = eligible.reduce((sum, item) => sum + item.actual / item.target, 0);
  const expected = eligible.reduce((sum, item) => sum + item.expected / item.target, 0);
  const target = eligible.length;

  return {
    goals,
    environments,
    actual,
    expected,
    target,
    percentage: target > 0 ? (actual / target) * 100 : 0,
    expectedPercentage: target > 0 ? (expected / target) * 100 : 0,
    state: stateFromPlan(actual, expected, eligible.length > 0),
    completed: eligible.filter((item) => item.actual >= item.target).length,
    pending: eligible.filter((item) => item.actual < item.target).length,
    streak: calculateStreak(data.checkIns, today),
  };
}
