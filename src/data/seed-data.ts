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
    version: 1,
    environments: [
      { id: "health", name: "Saúde", color: "#3d7d5c" },
      { id: "growth", name: "Crescimento", color: "#d98b35" },
      { id: "work", name: "Trabalho", color: "#566d91" },
      { id: "home", name: "Casa", color: "#8c8174" },
    ],
    goals: [
      {
        id: "movement",
        environmentId: "health",
        name: "Movimentar o corpo",
        unit: "treinos",
        featured: true,
        schedule: {
          periodicity: "weekly",
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
        featured: true,
        schedule: {
          periodicity: "daily",
          target: 140,
          startsAt: startedAt,
        },
      },
      {
        id: "deep-work",
        environmentId: "work",
        name: "Sessões de foco",
        unit: "sessões",
        featured: true,
        schedule: {
          periodicity: "weekly",
          target: 4,
          weekdays: [1, 2, 4, 5],
          startsAt: startedAt,
        },
      },
    ],
    checkIns,
  };
}
