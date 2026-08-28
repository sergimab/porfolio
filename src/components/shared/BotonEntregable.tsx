"use client";

import { useLang } from "./useLang";

// Enlace a un entregable de imprenta. Se abre en una pestaña nueva porque es
// un PDF pesado: si sustituyera a la página, volver atrás obligaría a recargar
// todo el proyecto.
//
// rel="noopener" no es opcional al abrir en otra pestaña: sin él, el documento
// abierto recibe una referencia a esta ventana y podría redirigirla.
export default function BotonEntregable({
  href,
  es = "Entregables imprenta",
  en = "Print deliverables",
}: {
  href: string;
  es?: string;
  en?: string;
}) {
  const lang = useLang();
  return (
    <a className="project-boton" href={href} target="_blank" rel="noopener noreferrer">
      {lang === "en" ? en : es}
      {/* Marca de "se abre fuera": una flecha saliendo de su caja. */}
      <svg viewBox="0 0 14 14" fill="none" aria-hidden="true" focusable="false">
        <path
          d="M5.5 2.5H2.5v9h9v-3M8.5 2.5h3v3M11.5 2.5 6 8"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="sr-only">
        {lang === "en" ? " (opens in a new tab)" : " (se abre en una pestaña nueva)"}
      </span>
    </a>
  );
}
