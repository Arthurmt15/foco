"use client";

import { useEffect, useState } from "react";
import styles from "./pwa-manager.module.css";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type InstallState = "installed" | "ios" | "available" | "unsupported";

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos() {
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (/macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1)
  );
}

export function PwaManager() {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [installState, setInstallState] = useState<InstallState>("unsupported");
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setInstallState(isStandalone() ? "installed" : isIos() ? "ios" : "unsupported");
    });

    const capturePrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
      setInstallState("available");
    };
    const markInstalled = () => setInstallState("installed");
    const checkForUpdate = () => {
      if ("serviceWorker" in navigator) {
        void navigator.serviceWorker
          .getRegistration()
          .then((registration) => registration?.update())
          .catch(() => undefined);
      }
    };
    window.addEventListener("beforeinstallprompt", capturePrompt);
    window.addEventListener("appinstalled", markInstalled);

    if ("serviceWorker" in navigator) {
      // O registro ocorre no cliente para não interferir na renderização da Vercel.
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          if (registration.waiting) setWaitingWorker(registration.waiting);
          registration.addEventListener("updatefound", () => {
            const worker = registration.installing;
            worker?.addEventListener("statechange", () => {
              if (worker.state === "installed" && navigator.serviceWorker.controller) {
                setWaitingWorker(worker);
              }
            });
          });
        })
        .catch(() => undefined);
      window.addEventListener("online", checkForUpdate);
      document.addEventListener("visibilitychange", checkForUpdate);
    }

    return () => {
      active = false;
      window.removeEventListener("beforeinstallprompt", capturePrompt);
      window.removeEventListener("appinstalled", markInstalled);
      window.removeEventListener("online", checkForUpdate);
      document.removeEventListener("visibilitychange", checkForUpdate);
    };
  }, []);

  async function install() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") setInstallState("installed");
    setInstallPrompt(null);
  }

  function update() {
    if (!waitingWorker) return;
    waitingWorker.postMessage({ type: "SKIP_WAITING" });
    navigator.serviceWorker.addEventListener("controllerchange", () => window.location.reload(), {
      once: true,
    });
  }

  return (
    <section className={styles.card} aria-labelledby="install-title">
      <div>
        <span className={styles.eyebrow}>Aplicativo</span>
        <h2 id="install-title">Instalar Foco</h2>
        {installState === "installed" && <p>O Foco já está instalado neste dispositivo.</p>}
        {installState === "ios" && (
          <p>No Safari, toque em Compartilhar e depois em “Adicionar à Tela de Início”.</p>
        )}
        {installState === "available" && <p>Acesse seus objetivos direto da tela inicial.</p>}
        {installState === "unsupported" && (
          <p>Use as opções do navegador para instalar, caso ele ofereça esse recurso.</p>
        )}
      </div>
      {installState === "available" && (
        <button type="button" onClick={install}>Instalar aplicativo</button>
      )}
      {waitingWorker && (
        <button type="button" className={styles.update} onClick={update}>Atualizar agora</button>
      )}
    </section>
  );
}
