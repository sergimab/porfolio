"use client";

import { useLang } from "./useLang";
import "./CtaBanner.css";

// Llamada a la acción a todo el ancho: una franja estrecha con una imagen
// dentro y la etiqueta encajada abajo a la derecha, con la esquina interior
// redondeada. Es el mismo gesto que el botón de borrar del lienzo, girado a la
// otra punta: parece recortado del propio marco en vez de puesto encima.
//
// Toda la franja es el enlace, no solo la etiqueta: el objetivo de pulsación
// es enorme, que es lo que conviene en móvil.
export default function CtaBanner({
  href,
  es,
  en,
  imagen,
  alt = "",
}: {
  /** Destino. Sin él la franja se pinta igual pero no navega. */
  href?: string;
  es: string;
  en: string;
  imagen?: string;
  alt?: string;
}) {
  const lang = useLang();
  const contenido = (
    <>
      {imagen ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="cta-banner-img" src={imagen} alt={alt} loading="lazy" />
      ) : null}
      <span className="cta-banner-label">
        {lang === "en" ? en : es}
        {/* Galón dibujado, no el carácter ">": el signo de texto se apoya en la
            línea base y queda bajo respecto a las mayúsculas, y su grosor
            depende de la tipografía. Así va centrado y con el mismo trazo que
            el borde. Hereda currentColor, de modo que se invierte en el hover
            junto al texto. */}
        <svg
          className="cta-banner-galon"
          viewBox="0 0 8 12"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M1.5 1 L6.5 6 L1.5 11"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </>
  );

  // Sin destino no se pinta un enlace: un <a> sin href no es pulsable con el
  // teclado y anunciarlo como enlace cuando no lleva a ninguna parte engaña.
  if (!href) return <div className="cta-banner">{contenido}</div>;

  return (
    <a className="cta-banner" href={href}>
      {contenido}
    </a>
  );
}
