"use client";

import Link from "next/link";
import { useLang } from "./useLang";

// Botón que lleva a otra página del sitio. Es el hermano de BotonEntregable,
// que abre un PDF fuera; este navega por dentro, así que usa Link y no <a>: con
// <a> el navegador recargaría la aplicación entera y se perdería el estado.
export default function BotonRuta({
  href,
  es,
  en,
  nota,
  notaEn,
}: {
  href: string;
  es: string;
  en: string;
  // Línea pequeña bajo el rótulo, para decir qué hay al otro lado cuando el
  // rótulo solo no basta.
  nota?: string;
  notaEn?: string;
}) {
  const lang = useLang();
  const ingles = lang === "en";
  return (
    <Link className="project-boton es-grande" href={href}>
      <span className="project-boton-texto">
        <span className="project-boton-rotulo">{ingles ? en : es}</span>
        {nota && (
          <span className="project-boton-nota">{ingles ? notaEn ?? nota : nota}</span>
        )}
      </span>
      {/* Galón: el mismo de la franja que cierra las páginas de proyecto. */}
      <svg viewBox="0 0 14 14" fill="none" aria-hidden="true" focusable="false">
        <path
          d="M5 2.5 9.5 7 5 11.5"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  );
}
