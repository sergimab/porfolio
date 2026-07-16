"use client";

import { useLang } from "./useLang";

// Texto que cambia con el idioma. Se usa dentro de elementos server (p. ej.
// los párrafos de las páginas de proyecto).
export default function LangText({ es, en }: { es: string; en: string }) {
  const lang = useLang();
  return <>{lang === "en" ? en : es}</>;
}
