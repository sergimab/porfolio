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
  imagenMovil,
  alt = "",
}: {
  /** Destino. Sin él la franja se pinta igual pero no navega. */
  href?: string;
  es: string;
  en: string;
  /** Imagen de escritorio. Se ve a 1024 × 150; diséñala a 2048 × 300. */
  imagen?: string;
  /**
   * Imagen para pantallas estrechas (hasta 700px). No es la de escritorio
   * encogida, sino un TROZO de ella a más tamaño: el recorte centrado de
   * 1024 × 300 —la mitad del ancho del original—, que a 327 px de pantalla deja
   * la franja en 96 de alto en vez de en 48. Todas las del sitio van con esa
   * misma medida, para que la franja pese igual en todas las páginas.
   */
  imagenMovil?: string;
  alt?: string;
}) {
  const lang = useLang();
  const contenido = (
    <>
      {imagen ? (
        // <picture> y no dos <img> con CSS: así el navegador se descarga UNA
        // sola, la que le toca. Con dos imágenes y display:none, muchos
        // navegadores bajan las dos y en móvil pagarías el peso de la de
        // escritorio sin llegar a verla.
        <picture>
          {imagenMovil ? (
            <source media="(max-width: 700px)" srcSet={imagenMovil} />
          ) : null}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="cta-banner-img" src={imagen} alt={alt} loading="lazy" />
        </picture>
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
  const clase = `cta-banner${imagen ? " con-imagen" : ""}`;
  if (!href) return <div className={clase}>{contenido}</div>;

  return (
    <a className={clase} href={href}>
      {contenido}
    </a>
  );
}
