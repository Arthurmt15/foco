export type ProgressState = "on-track" | "attention" | "behind" | "neutral";
export type Periodicity = "daily" | "weekly" | "monthly";

export interface Environment {
  id: string;
  name: string;
  color: string;
}

export interface GoalSchedule {
  periodicity: Periodicity;
  target: number;
  weekdays?: number[];
  monthDays?: number[];
  startsAt: string;
  endsAt?: string;
}

export interface Goal {
  id: string;
  environmentId: string;
  name: string;
  unit: string;
  featured?: boolean;
  schedule: GoalSchedule;
}

export interface CheckIn {
  id: string;
  goalId: string;
  date: string;
  amount: number;
}

export interface FocoData {
  version: 2;
  environments: Environment[];
  goals: Goal[];
  checkIns: CheckIn[];
}

export interface GoalProgress {
  goal: Goal;
  actual: number;
  expected: number;
  target: number;
  percentage: number;
  expectedPercentage: number;
  state: ProgressState;
  eligible: boolean;
}

export interface EnvironmentProgress {
  environment: Environment;
  actual: number;
  expected: number;
  target: number;
  percentage: number;
  state: ProgressState;
  eligibleGoals: number;
}

export interface ProgressSummary {
  goals: GoalProgress[];
  environments: EnvironmentProgress[];
  actual: number;
  expected: number;
  target: number;
  percentage: number;
  expectedPercentage: number;
  state: ProgressState;
  completed: number;
  pending: number;
  streak: number;
}
