import type { Periodicity } from "@/domain/foco-types";
import styles from "./period-filter.module.css";

export type PeriodSelection = "all" | Periodicity;

const OPTIONS: Array<{ value: PeriodSelection; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "daily", label: "Diárias" },
  { value: "weekly", label: "Semanais" },
  { value: "monthly", label: "Mensais" },
];

interface PeriodFilterProps {
  selected: PeriodSelection;
  onSelect: (period: PeriodSelection) => void;
}

// O controle filtra a apresentação sem alterar o calendário ou os dados das metas.
export function PeriodFilter({ selected, onSelect }: PeriodFilterProps) {
  return (
    <div className={styles.filter} aria-label="Filtrar objetivos por período">
      {OPTIONS.map((option) => (
        <button
          type="button"
          key={option.value}
          aria-pressed={selected === option.value}
          onClick={() => onSelect(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
