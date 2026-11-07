import type { FocoData, Periodicity, ProgressState } from "@/domain/foco-types";
import { calculateProgress } from "@/domain/progress";

export interface WidgetGoalSummary {
  environmentId: string;
  objectiveName: string;
  periodicity: Periodicity;
  realizedPercentage: number;
  expectedPercentage: number;
  state: ProgressState;
  currentStreak: number;
  updatedAt: string;
}

export interface WidgetSummaryCache {
  version: 2;
  goals: WidgetGoalSummary[];
}

const WIDGET_CACHE_KEY = "foco:widget-summary:v2";

function compactPercentage(value: number): number {
  return Math.max(0, Math.min(999, Math.round(value)));
}

/**
 * Converte o domínio em um contrato pequeno e estável para qualquer apresentação.
 * Futuras bridges do Capacitor podem copiar este JSON para SharedPreferences/App Groups.
 */
export class WidgetSummaryService {
  generate(data: FocoData, now = new Date()): WidgetSummaryCache {
    const progress = calculateProgress(data, now);
    const updatedAt = now.toISOString();

    return {
      version: 2,
      goals: progress.goals.map((item) => ({
        environmentId: item.goal.environmentId,
        objectiveName: item.goal.name,
        periodicity: item.goal.schedule.periodicity,
        realizedPercentage: compactPercentage(item.percentage),
        expectedPercentage: compactPercentage(item.expectedPercentage),
        state: item.state,
        currentStreak: progress.streak,
        updatedAt,
      })),
    };
  }

  writeCache(data: FocoData, now = new Date()): WidgetSummaryCache {
    const summary = this.generate(data, now);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(WIDGET_CACHE_KEY, JSON.stringify(summary));
    }
    return summary;
  }

  readCache(): WidgetSummaryCache | null {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(WIDGET_CACHE_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as WidgetSummaryCache;
    } catch {
      return null;
    }
  }
}

export const widgetSummaryService = new WidgetSummaryService();
