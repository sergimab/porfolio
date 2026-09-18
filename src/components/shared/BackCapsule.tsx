"use client";

import Link from "next/link";
import "./BackCapsule.css";

const CATS: Record<string, { label: string; hue: number }> = {
  // Los tonos son los mismos que los de las cápsulas de la home, y de ahí
  // salen: Motion azul y Fotografía ámbar desde que se los cambiaron.
  motion:     { label: "Motion Graphics", hue: 217 },
  branding:   { label: "Branding",        hue: 330 },
  fotografia: { label: "Fotografía",      hue: 32  },
  iberdrola:  { label: "Iberdrola",       hue: 142 },
  uiux:       { label: "UI / UX",         hue: 175 },
  "3d":       { label: "3D",              hue: 262 },
  editorial:  { label: "Editorial",       hue: 1   },
};

// `category` da el color y, por defecto, el destino: la parrilla de esa
// categoría. Las páginas que cuelgan de un proyecto —una fase, un apartado—
// pueden cambiar el destino y el rótulo para volver AL PROYECTO y no a la
// parrilla, que se saltaría el escalón intermedio. El color sigue siendo el de
// la categoría, que es lo que mantiene la cápsula reconocible.
export default function BackCapsule({
  category,
  href,
  rotulo,
}: {
  category: string;
  href?: string;
  rotulo?: string;
}) {
  const cat = CATS[category] ?? CATS.iberdrola;
  const texto = rotulo ?? cat.label;
  return (
    <Link
      href={href ?? `/?cat=${category}`}
      className="back-capsule"
      style={{ "--cap-hue": cat.hue } as React.CSSProperties}
      aria-label={`Volver a ${texto}`}
    >
      <svg className="back-capsule-chev" width="8" height="14" viewBox="0 0 8 14" fill="none"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6.5 1 1.5 7l5 6" />
      </svg>
      {texto}
    </Link>
  );
}
