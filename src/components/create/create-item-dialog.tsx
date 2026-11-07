"use client";

import { useEffect, useState, type FormEvent, type MouseEvent } from "react";
import { addEnvironment, addGoal } from "@/data/foco-store";
import type { FocoData, Periodicity } from "@/domain/foco-types";
import { toDateKey } from "@/domain/progress";
import styles from "./create-item-dialog.module.css";

export type CreateMode = "goal" | "environment";

interface CreateItemDialogProps {
  data: FocoData;
  initialMode: CreateMode;
  onClose: () => void;
  onDataChange: (data: FocoData) => void;
}

const COLORS = ["#7357ff", "#39c981", "#ff8a5b", "#3b82f6", "#e05287", "#8f6b55"];
const WEEKDAYS = [
  { value: 1, label: "S" },
  { value: 2, label: "T" },
  { value: 3, label: "Q" },
  { value: 4, label: "Q" },
  { value: 5, label: "S" },
  { value: 6, label: "S" },
  { value: 0, label: "D" },
];

export function CreateItemDialog({ data, initialMode, onClose, onDataChange }: CreateItemDialogProps) {
  const [mode, setMode] = useState<CreateMode>(initialMode);
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [environmentId, setEnvironmentId] = useState(data.environments[0]?.id ?? "");
  const [periodicity, setPeriodicity] = useState<Periodicity>("weekly");
  const [target, setTarget] = useState("1");
  const [unit, setUnit] = useState("vezes");
  const [increment, setIncrement] = useState("1");
  const [weekdays, setWeekdays] = useState([1, 2, 3, 4, 5]);
  const [monthDays, setMonthDays] = useState("");
  const [startsAt, setStartsAt] = useState(toDateKey(new Date()));
  const [endsAt, setEndsAt] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  function closeFromBackdrop(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onClose();
  }

  function toggleWeekday(day: number) {
    setWeekdays((current) =>
      current.includes(day) ? current.filter((item) => item !== day) : [...current, day],
    );
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const cleanName = name.trim();
    if (!cleanName) return setError("Informe um nome para continuar.");

    if (mode === "environment") {
      onDataChange(addEnvironment(data, { name: cleanName, color }));
      onClose();
      return;
    }

    if (!environmentId) return setError("Crie um ambiente antes de adicionar uma meta.");
    if (periodicity === "weekly" && weekdays.length === 0) {
      return setError("Selecione pelo menos um dia da semana.");
    }
    const parsedMonthDays = [...new Set(
      monthDays.split(",").map(Number).filter((day) => Number.isInteger(day) && day >= 1 && day <= 31),
    )];
    if (periodicity === "monthly" && monthDays.trim() && parsedMonthDays.length === 0) {
      return setError("Use dias válidos entre 1 e 31, separados por vírgula.");
    }

    const updated = addGoal(data, {
      environmentId,
      name: cleanName,
      unit: unit.trim() || "vezes",
      increment: Number(increment),
      featured: true,
      schedule: {
        periodicity,
        target: Number(target),
        startsAt,
        ...(endsAt ? { endsAt } : {}),
        ...(periodicity === "weekly" ? { weekdays } : {}),
        ...(periodicity === "monthly" ? { monthDays: parsedMonthDays } : {}),
      },
    });
    onDataChange(updated);
    onClose();
  }

  return (
    <div className={styles.backdrop} onMouseDown={closeFromBackdrop}>
      <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="create-title">
        <header>
          <div>
            <span>Novo item</span>
            <h2 id="create-title">Adicionar ao Foco</h2>
          </div>
          <button className={styles.close} type="button" onClick={onClose} aria-label="Fechar">×</button>
        </header>

        <div className={styles.tabs} aria-label="Tipo de item">
          <button type="button" aria-pressed={mode === "goal"} onClick={() => setMode("goal")}>Meta</button>
          <button type="button" aria-pressed={mode === "environment"} onClick={() => setMode("environment")}>Ambiente</button>
        </div>

        <form onSubmit={submit}>
          <label className={styles.full}>
            <span>{mode === "goal" ? "Nome da meta" : "Nome do ambiente"}</span>
            <input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder={mode === "goal" ? "Ex.: Caminhar 30 minutos" : "Ex.: Família"} />
          </label>

          {mode === "environment" ? (
            <fieldset className={styles.colors}>
              <legend>Cor do ambiente</legend>
              {COLORS.map((option) => (
                <button key={option} type="button" aria-label={`Selecionar cor ${option}`} aria-pressed={color === option} style={{ background: option }} onClick={() => setColor(option)} />
              ))}
            </fieldset>
          ) : (
            <>
              <label className={styles.full}>
                <span>Ambiente</span>
                <select value={environmentId} onChange={(event) => setEnvironmentId(event.target.value)} required>
                  {data.environments.map((environment) => <option key={environment.id} value={environment.id}>{environment.name}</option>)}
                </select>
              </label>
              <fieldset className={`${styles.full} ${styles.periods}`}>
                <legend>Periodicidade</legend>
                {(["daily", "weekly", "monthly"] as Periodicity[]).map((period) => (
                  <button key={period} type="button" aria-pressed={periodicity === period} onClick={() => setPeriodicity(period)}>
                    {period === "daily" ? "Diária" : period === "weekly" ? "Semanal" : "Mensal"}
                  </button>
                ))}
              </fieldset>
              <label><span>Meta do período</span><input type="number" min="0.01" step="0.01" value={target} onChange={(event) => setTarget(event.target.value)} required /></label>
              <label><span>Unidade</span><input value={unit} onChange={(event) => setUnit(event.target.value)} placeholder="vezes, km, min" required /></label>
              <label><span>Valor por check-in</span><input type="number" min="0.01" step="0.01" value={increment} onChange={(event) => setIncrement(event.target.value)} required /></label>
              <label><span>Começa em</span><input type="date" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} required /></label>
              {periodicity === "weekly" && (
                <fieldset className={`${styles.full} ${styles.weekdays}`}>
                  <legend>Dias planejados</legend>
                  {WEEKDAYS.map((day, index) => <button key={index} type="button" aria-pressed={weekdays.includes(day.value)} onClick={() => toggleWeekday(day.value)}>{day.label}</button>)}
                </fieldset>
              )}
              {periodicity === "monthly" && (
                <label className={styles.full}><span>Dias do mês (opcional)</span><input value={monthDays} onChange={(event) => setMonthDays(event.target.value)} placeholder="Ex.: 5, 12, 19, 26" /><small>Sem dias definidos, o progresso é distribuído pelo mês.</small></label>
              )}
              <label className={styles.full}><span>Termina em (opcional)</span><input type="date" min={startsAt} value={endsAt} onChange={(event) => setEndsAt(event.target.value)} /></label>
            </>
          )}

          {error && <p className={styles.error} role="alert">{error}</p>}
          <footer>
            <button type="button" onClick={onClose}>Cancelar</button>
            <button type="submit">Adicionar {mode === "goal" ? "meta" : "ambiente"}</button>
          </footer>
        </form>
      </section>
    </div>
  );
}
