"use client";

import { useEffect, useState } from "react";

// Título del proyecto que cambia con el idioma (lee "lang" de localStorage y
// escucha el evento "langchange" emitido por el Header). La primera letra va
// como capitular decorativa (.project-hero-cap).
export default function ProjectHeroTitle({ es, en }: { es: string; en: string }) {
  const [lang, setLang] = useState<"es" | "en">("es");

  useEffect(() => {
    const stored = localStorage.getItem("lang") as "es" | "en" | null;
    if (stored) setLang(stored);
    const onLang = (e: Event) => {
      const l = (e as CustomEvent).detail;
      if (l === "es" || l === "en") setLang(l);
    };
    window.addEventListener("langchange", onLang);
    return () => window.removeEventListener("langchange", onLang);
  }, []);

  const text = lang === "en" ? en : es;
  return (
    <h1 className="project-hero-title" style={{ marginTop: "24px" }}>
      <span className="project-hero-cap">{text.charAt(0)}</span>
      <span className="project-hero-rest">{text.slice(1)}</span>
    </h1>
  );
}
