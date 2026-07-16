"use client";

import { useLang } from "./useLang";

// Título del proyecto que cambia con el idioma. La primera letra va como
// capitular decorativa (.project-hero-cap).
export default function ProjectHeroTitle({ es, en }: { es: string; en: string }) {
  const lang = useLang();
  const text = lang === "en" ? en : es;
  return (
    <h1 className="project-hero-title" style={{ marginTop: "24px" }}>
      <span className="project-hero-cap">{text.charAt(0)}</span>
      <span className="project-hero-rest">{text.slice(1)}</span>
    </h1>
  );
}
