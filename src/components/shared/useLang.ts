"use client";

import { useEffect, useState } from "react";

export type Lang = "es" | "en";

// Idioma actual: lee "lang" de localStorage y escucha el evento "langchange"
// que emite el Header al pulsar ES/EN.
export function useLang(): Lang {
  const [lang, setLang] = useState<Lang>("es");

  useEffect(() => {
    const stored = localStorage.getItem("lang") as Lang | null;
    if (stored) setLang(stored);
    const onLang = (e: Event) => {
      const l = (e as CustomEvent).detail;
      if (l === "es" || l === "en") setLang(l);
    };
    window.addEventListener("langchange", onLang);
    return () => window.removeEventListener("langchange", onLang);
  }, []);

  return lang;
}
