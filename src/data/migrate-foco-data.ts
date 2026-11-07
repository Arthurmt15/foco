import type { FocoData, Goal } from "@/domain/foco-types";
import { toDateKey } from "@/domain/progress";

type StoredFocoData = Omit<FocoData, "version"> & { version: number };

function monthlyGoal(startsAt: string): Goal {
  return {
    id: "budget-review",
    environmentId: "finance",
    name: "Revisar o orçamento",
    unit: "revisões",
    featured: true,
    schedule: {
      periodicity: "monthly",
      target: 4,
      monthDays: [5, 12, 19, 26],
      startsAt,
    },
  };
}

// A migração acrescenta a dimensão mensal sem descartar ambientes ou check-ins locais.
export function migrateFocoData(stored: StoredFocoData, today = new Date()): FocoData {
  if (stored.version >= 2) return stored as FocoData;

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const environments = stored.environments.some((item) => item.id === "finance")
    ? stored.environments
    : [...stored.environments, { id: "finance", name: "Finanças", color: "#8f6b55" }];
  const adjustedGoals = stored.goals.map((goal) =>
    goal.id === "reading"
      ? { ...goal, schedule: { ...goal.schedule, target: 20 } }
      : goal,
  );
  const goals = adjustedGoals.some((goal) => goal.id === "budget-review")
    ? adjustedGoals
    : [...adjustedGoals, monthlyGoal(toDateKey(monthStart))];

  return { ...stored, version: 2, environments, goals };
}
