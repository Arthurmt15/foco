"use client";

import { useEffect, useState } from "react";
import type { FocoData } from "@/domain/foco-types";
import { DATA_CHANGED_EVENT, loadFocoData } from "@/data/foco-store";

export function useFocoData() {
  const [data, setData] = useState<FocoData | null>(null);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) setData(loadFocoData());
    });
    const syncData = (event: Event) => {
      const updated = (event as CustomEvent<FocoData>).detail;
      setData(updated ?? loadFocoData());
    };
    window.addEventListener(DATA_CHANGED_EVENT, syncData);
    window.addEventListener("storage", syncData);
    return () => {
      active = false;
      window.removeEventListener(DATA_CHANGED_EVENT, syncData);
      window.removeEventListener("storage", syncData);
    };
  }, []);

  return { data, setData };
}
