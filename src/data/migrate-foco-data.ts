import type { FocoData, Goal, ScheduleMode } from "@/domain/foco-types";
import { toDateKey } from "@/domain/progress";

type StoredFocoData = Omit<FocoData, "version"> & { version: number };

function monthlyGoal(startsAt: string): Goal {
  return {
    id: "budget-review",
    environmentId: "finance",
    name: "Revisar o orçamento",
    unit: "revisões",
    increment: 1,
    featured: true,
    schedule: {
      periodicity: "monthly",
      scheduleMode: "fixed",
      target: 4,
      monthDays: [5, 12, 19, 26],
      startsAt,
    },
  };
}

function inferScheduleMode(goal: Goal): ScheduleMode | undefined {
  if (goal.schedule.periodicity === "daily") return undefined;
  if (goal.schedule.scheduleMode) return goal.schedule.scheduleMode;
  const configuredDays = goal.schedule.periodicity === "weekly"
    ? goal.schedule.weekdays
    : goal.schedule.monthDays;
  return configuredDays && configuredDays.length > 0 ? "fixed" : "flexible";
}

// A migração acrescenta a dimensão mensal sem descartar ambientes ou check-ins locais.
export function migrateFocoData(stored: StoredFocoData, today = new Date()): FocoData {
  if (stored.version >= 4) return stored as FocoData;

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const environments = stored.version >= 2 || stored.environments.some((item) => item.id === "finance")
    ? stored.environments
    : [...stored.environments, { id: "finance", name: "Finanças", color: "#8f6b55" }];
  const adjustedGoals = stored.goals.map((goal) =>
    ({
      ...goal,
      increment: goal.increment ?? (goal.unit === "min" ? 20 : 1),
      schedule: {
        ...goal.schedule,
        ...(inferScheduleMode(goal) ? { scheduleMode: inferScheduleMode(goal) } : {}),
        ...(stored.version < 2 && goal.id === "reading" ? { target: 20 } : {}),
      },
    }),
  );
  const goals = stored.version >= 2 || adjustedGoals.some((goal) => goal.id === "budget-review")
    ? adjustedGoals
    : [...adjustedGoals, monthlyGoal(toDateKey(monthStart))];

  return { ...stored, version: 4, environments, goals };
}
