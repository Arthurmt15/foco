import type { Environment, FocoData, Goal } from "@/domain/foco-types";
import { toDateKey } from "@/domain/progress";
import { widgetSummaryService } from "@/services/widget-summary-service";
import { migrateFocoData } from "./migrate-foco-data";
import { createSeedData } from "./seed-data";

const STORAGE_KEY = "foco:data:v1";
export const DATA_CHANGED_EVENT = "foco:data-changed";

export function loadFocoData(): FocoData {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seed = createSeedData();
    saveFocoData(seed);
    return seed;
  }

  try {
    const stored = JSON.parse(raw) as FocoData;
    const data = migrateFocoData(stored);
    if (stored.version !== data.version) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
    widgetSummaryService.writeCache(data);
    return data;
  } catch {
    // Um valor inválido não apaga a chave original; apenas mantém o app utilizável.
    return createSeedData();
  }
}

export function saveFocoData(data: FocoData): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  // O cache desacoplado fica pronto para sincronização por uma bridge nativa futura.
  widgetSummaryService.writeCache(data);
  window.dispatchEvent(new CustomEvent(DATA_CHANGED_EVENT, { detail: data }));
}

export function addCheckIn(data: FocoData, goalId: string, amount: number): FocoData {
  const updated: FocoData = {
    ...data,
    checkIns: [
      ...data.checkIns,
      {
        id: crypto.randomUUID(),
        goalId,
        date: toDateKey(new Date()),
        amount,
      },
    ],
  };
  saveFocoData(updated);
  return updated;
}

export function addEnvironment(
  data: FocoData,
  input: Pick<Environment, "name" | "color">,
): FocoData {
  const updated: FocoData = {
    ...data,
    environments: [...data.environments, { id: crypto.randomUUID(), ...input }],
  };
  saveFocoData(updated);
  return updated;
}

export function addGoal(
  data: FocoData,
  input: Omit<Goal, "id">,
): FocoData {
  const updated: FocoData = {
    ...data,
    goals: [...data.goals, { id: crypto.randomUUID(), ...input }],
  };
  saveFocoData(updated);
  return updated;
}
