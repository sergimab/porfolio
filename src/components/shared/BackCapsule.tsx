"use client";

import Link from "next/link";
import MeshGradient from "./MeshGradient";
import { paletaLegible, paletaClara } from "./organico";
import "./BackCapsule.css";

const CATS: Record<string, { label: string; hue: number; claro?: boolean }> = {
  // Los tonos son los mismos que los de las cápsulas de la home, y de ahí
  // salen: Motion azul y Fotografía ámbar desde que se los cambiaron.
  motion:     { label: "Motion Graphics", hue: 217 },
  branding:   { label: "Branding",        hue: 330 },
  // Clara, igual que su cápsula de la home: ver LUMINANCIA_CLARA en organico.
  // El naranja es el único tono que al oscurecerse se vuelve marrón, así que
  // esta lleva el fondo encendido y el rótulo en tinta.
  fotografia: { label: "Fotografía",      hue: 32, claro: true },
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
  muestra,
}: {
  category: string;
  href?: string;
  rotulo?: string;
  /** Sin enlace: en el muestrario del sistema la cápsula se enseña, no se usa,
   *  y pulsarla sacaría de la página a quien solo quería mirarla. */
  muestra?: boolean;
}) {
  const cat = CATS[category] ?? CATS.iberdrola;
  const texto = rotulo ?? cat.label;
  const comun = {
    className: "back-capsule",
    "data-claro": cat.claro ? "" : undefined,
    style: { "--cap-hue": cat.hue } as React.CSSProperties,
  };
  const dentro = (
    <>
      {/* El mismo degradado de malla que las cápsulas de la home, con la paleta
          legible: el rótulo va en blanco encima y así da 5,1:1 en cualquier
          punto. Se enciende al pasar por encima —el ratón lo escucha este mismo
          enlace, que es el padre del lienzo— y en reposo se queda parado. */}
      <MeshGradient
        colores={cat.claro ? paletaClara(cat.hue) : paletaLegible(cat.hue)}
        velocidadReposo={0}
        velocidadHover={0.4}
        suavizado={0.45}
        escala={0.85}
        className="back-capsule-malla"
      />
      <svg className="back-capsule-chev" width="8" height="14" viewBox="0 0 8 14" fill="none"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6.5 1 1.5 7l5 6" />
      </svg>
      <span className="mesh-encima">{texto}</span>
    </>
  );
  // En el muestrario se enseña, no se usa: pulsarla sacaría de la página a
  // quien solo quería mirarla.
  return muestra ? (
    <span {...comun}>{dentro}</span>
  ) : (
    <Link {...comun} href={href ?? `/?cat=${category}`} aria-label={`Volver a ${texto}`}>
      {dentro}
    </Link>
  );
}
