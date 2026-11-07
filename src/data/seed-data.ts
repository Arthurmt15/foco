import type { FocoData } from "@/domain/foco-types";
import { toDateKey, weekBounds } from "@/domain/progress";

function addDays(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

// A demonstração só é usada quando não existe nenhum dado local salvo.
export function createSeedData(today = new Date()): FocoData {
  const { start } = weekBounds(today);
  const startedAt = toDateKey(addDays(start, -35));
  const checkIns: FocoData["checkIns"] = [];
  const recentDays = [0, -1, -2];

  recentDays.forEach((offset, index) => {
    const date = toDateKey(addDays(today, offset));
    checkIns.push({ id: `movement-${index}`, goalId: "movement", date, amount: 1 });
    if (index < 2) checkIns.push({ id: `reading-${index}`, goalId: "reading", date, amount: 20 });
  });

  return {
    version: 4,
    environments: [
      { id: "health", name: "Saúde", color: "#3d7d5c" },
      { id: "growth", name: "Crescimento", color: "#d98b35" },
      { id: "work", name: "Trabalho", color: "#566d91" },
      { id: "home", name: "Casa", color: "#8c8174" },
      { id: "finance", name: "Finanças", color: "#8f6b55" },
    ],
    goals: [
      {
        id: "movement",
        environmentId: "health",
        name: "Movimentar o corpo",
        unit: "treinos",
        increment: 1,
        featured: true,
        schedule: {
          periodicity: "weekly",
          scheduleMode: "fixed",
          target: 5,
          weekdays: [1, 2, 3, 4, 5],
          startsAt: startedAt,
        },
      },
      {
        id: "reading",
        environmentId: "growth",
        name: "Leitura com calma",
        unit: "min",
        increment: 20,
        featured: true,
        schedule: {
          periodicity: "daily",
          target: 20,
          startsAt: startedAt,
        },
      },
      {
        id: "deep-work",
        environmentId: "work",
        name: "Sessões de foco",
        unit: "sessões",
        increment: 1,
        featured: true,
        schedule: {
          periodicity: "weekly",
          scheduleMode: "fixed",
          target: 4,
          weekdays: [1, 2, 4, 5],
          startsAt: startedAt,
        },
      },
      {
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
          startsAt: startedAt,
        },
      },
    ],
    checkIns,
  };
}
