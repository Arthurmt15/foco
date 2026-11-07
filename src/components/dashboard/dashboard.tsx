"use client";

import { useState, type CSSProperties } from "react";
import { addCheckIn } from "@/data/foco-store";
import type { GoalProgress, Periodicity, ProgressState } from "@/domain/foco-types";
import { calculateProgress } from "@/domain/progress";
import { useFocoData } from "@/hooks/use-foco-data";
import { PwaManager } from "@/components/pwa/pwa-manager";
import { CreateItemDialog, type CreateMode } from "@/components/create/create-item-dialog";
import { PeriodFilter, type PeriodSelection } from "./period-filter";
import styles from "./dashboard.module.css";

const STATE_LABEL: Record<ProgressState, string> = {
  "on-track": "No ritmo",
  attention: "Atenção leve",
  behind: "Hora de retomar",
  neutral: "Sem dados",
};

const STATE_MESSAGE: Record<ProgressState, string> = {
  "on-track": "Você está acompanhando bem o plano.",
  attention: "Um pequeno passo hoje mantém o ritmo.",
  behind: "Recomeçar com calma também é progresso.",
  neutral: "Adicione metas para começar a acompanhar.",
};

const PERIOD_META: Record<Periodicity, { title: string; detail: string }> = {
  daily: { title: "Metas diárias", detail: "Reiniciam todos os dias" },
  weekly: { title: "Metas semanais", detail: "De segunda a domingo" },
  monthly: { title: "Metas mensais", detail: "Acompanham o calendário do mês" },
};

function clampPercentage(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function ProgressBar({ progress }: { progress: GoalProgress }) {
  const width = clampPercentage(progress.percentage);
  const expected = clampPercentage(progress.expectedPercentage);
  return (
    <div className={styles.track} aria-label={`${width}% realizado, ${expected}% esperado`}>
      <span className={styles.fill} style={{ width: `${width}%` }} />
      <span className={styles.expected} style={{ left: `${expected}%` }} />
    </div>
  );
}

export function Dashboard() {
  const { data, setData } = useFocoData();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodSelection>("all");
  const [createMode, setCreateMode] = useState<CreateMode | null>(null);

  if (!data) {
    return <main className={styles.loading}>Organizando seu progresso...</main>;
  }

  const summary = calculateProgress(data);
  const percent = clampPercentage(summary.percentage);
  const ringStyle = { "--progress": `${percent * 3.6}deg` } as CSSProperties;
  const featured = summary.goals.filter((item) => item.goal.featured);
  const periods = (Object.keys(PERIOD_META) as Periodicity[]).filter(
    (period) => selectedPeriod === "all" || selectedPeriod === period,
  );

  function register(progress: GoalProgress) {
    const amount = progress.goal.increment ?? 1;
    setData(addCheckIn(data!, progress.goal.id, amount));
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a className={styles.brand} href="#top" aria-label="Foco, início">
          <span>F.</span>
          <strong>Foco</strong>
        </a>
        <div className={styles.headerActions}>
          <div className={styles.weekLabel}>
            <small>Visão atual</small>
            <strong>Todos os períodos</strong>
          </div>
          <button className={styles.addButton} type="button" onClick={() => setCreateMode("goal")}>+ Adicionar</button>
        </div>
      </header>

      <section className={styles.hero} id="top">
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>Painel de progresso</span>
          <h1>Clareza no plano.<br />Ritmo na prática.</h1>
          <p>{STATE_MESSAGE[summary.state]}</p>
          <span className={`${styles.status} ${styles[summary.state]}`}>
            <i /> {STATE_LABEL[summary.state]}
          </span>
        </div>
        <div className={styles.ring} style={ringStyle} aria-label={`${percent}% concluído`}>
          <div>
            <strong>{percent}%</strong>
            <span>progresso geral</span>
          </div>
        </div>
      </section>

      <section className={styles.metrics} aria-label="Resumo dos períodos ativos">
        <article><strong>{summary.completed}</strong><span>metas cumpridas</span></article>
        <article><strong>{summary.pending}</strong><span>metas pendentes</span></article>
        <article><strong>{summary.streak}</strong><span>dias em sequência</span></article>
        <article><strong>{clampPercentage(summary.expectedPercentage)}%</strong><span>esperado até hoje</span></article>
      </section>

      <section className={styles.section} aria-labelledby="objectives-title">
        <div className={styles.sectionTitle}>
          <div>
            <span className={styles.eyebrow}>Seu plano</span>
            <h2 id="objectives-title">Objetivos principais</h2>
          </div>
          <div className={styles.sectionActions}>
            <span className={styles.hint}>A marca indica o esperado hoje</span>
            <button className={styles.secondaryAdd} type="button" onClick={() => setCreateMode("goal")}>Nova meta</button>
          </div>
        </div>
        <PeriodFilter selected={selectedPeriod} onSelect={setSelectedPeriod} />
        {periods.map((period) => {
          const goals = featured.filter((item) => item.goal.schedule.periodicity === period);
          if (goals.length === 0) return null;
          return (
            <div className={styles.periodGroup} key={period}>
              <div className={styles.periodHeading}>
                <h3>{PERIOD_META[period].title}</h3>
                <span>{PERIOD_META[period].detail}</span>
              </div>
              <div className={styles.goalGrid}>
                {goals.map((progress) => (
                  <article className={styles.goalCard} data-state={progress.state} key={progress.goal.id}>
                    <div className={styles.goalTop}>
                      <span className={`${styles.dot} ${styles[progress.state]}`} />
                      <span>{STATE_LABEL[progress.state]}</span>
                      <strong>{clampPercentage(progress.percentage)}%</strong>
                    </div>
                    <h3>{progress.goal.name}</h3>
                    <p>{progress.actual} de {progress.target} {progress.goal.unit}</p>
                    <ProgressBar progress={progress} />
                    <button type="button" onClick={() => register(progress)}>+ Registrar avanço</button>
                  </article>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <section className={styles.section} aria-labelledby="environments-title">
        <div className={styles.sectionTitle}>
          <div>
            <span className={styles.eyebrow}>Mapa de vida</span>
            <h2 id="environments-title">Ambientes</h2>
          </div>
          <button className={styles.secondaryAdd} type="button" onClick={() => setCreateMode("environment")}>Novo ambiente</button>
        </div>
        <div className={styles.environmentList}>
          {summary.environments.map((item) => (
            <article key={item.environment.id}>
              <span className={styles.environmentIcon} style={{ background: item.environment.color }} />
              <div><strong>{item.environment.name}</strong><small>{STATE_LABEL[item.state]}</small></div>
              <b>{item.eligibleGoals > 0 ? `${clampPercentage(item.percentage)}%` : "—"}</b>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.settings} aria-labelledby="settings-title">
        <div className={styles.sectionTitle}>
          <div>
            <span className={styles.eyebrow}>Aplicativo</span>
            <h2 id="settings-title">Configurações</h2>
          </div>
        </div>
        <PwaManager />
      </section>
      {createMode && (
        <CreateItemDialog
          data={data}
          initialMode={createMode}
          onClose={() => setCreateMode(null)}
          onDataChange={setData}
        />
      )}
    </main>
  );
}
