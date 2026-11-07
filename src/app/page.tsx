import { PwaManager } from "@/components/pwa/pwa-manager";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <span className={styles.logo}>F.</span>
        <strong>Foco</strong>
      </header>
      <section className={styles.intro}>
        <span>Seu progresso, com clareza</span>
        <h1>Objetivos no ritmo da sua vida.</h1>
        <p>Seu painel semanal está sendo preparado.</p>
      </section>
      <PwaManager />
    </main>
  );
}
