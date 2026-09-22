"use client";

import { useEffect, useState } from "react";

export type Lamina = {
  src: string;
  alt: string;
  /** Un filtro de CSS para esa lámina. El logotipo viejo llega en negro sobre
   *  blanco y aquí va sobre negro, así que se invierte en vez de pedir otro
   *  archivo que sería el mismo dibujo del revés. */
  filtro?: string;
};

// Una pila de láminas que se van fundiendo una en otra, en bucle.
//
// ES UN GIF, PERO SIN GIF. Lo que hay que enseñar son láminas quietas que se
// relevan, y para eso un gif o un vídeo serían cientos de kilos de fotogramas
// intermedios que no existen: entre una y la siguiente no pasa nada, solo se
// cambia. Con las imágenes sueltas y una fundida de CSS pesa lo que pesan las
// láminas, cada una se ve nítida —un gif las dejaría en 256 colores y estas son
// degradados— y además se puede parar cuando el sistema pide que nada se mueva.
//
// TODAS ESTÁN SIEMPRE EN EL SITIO, en absoluto una encima de otra, y lo que
// cambia es la opacidad. Por eso la caja necesita que le digan su proporción:
// sin nada en el flujo normal, no tendría alto. A cambio, el relevo es una
// fundida de verdad y la página no pega un salto al cambiar de lámina.
export default function Alterna({
  laminas,
  proporcion,
  segundos = 2.6,
  fundido = 0.8,
  fondo,
  relleno,
  className,
}: {
  laminas: Lamina[];
  /** La proporción de la caja, en formato de CSS: "3 / 2". */
  proporcion: string;
  /** Lo que se queda cada lámina antes de dar paso a la siguiente. */
  segundos?: number;
  /** Lo que tarda el relevo. */
  fundido?: number;
  /** El color de la caja. Las de este proyecto van sobre negro. */
  fondo?: string;
  /** Aire por dentro, para lo que no llena su caja, como un logotipo. */
  relleno?: string;
  className?: string;
}) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (laminas.length < 2) return;
    // Quien tenga pedido que no se mueva nada ve la primera y se queda ahí:
    // esto es una imagen que cambia sola, justo lo que ese ajuste pide evitar.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI(n => (n + 1) % laminas.length), segundos * 1000);
    return () => clearInterval(t);
  }, [laminas.length, segundos]);

  return (
    <div
      className={`se-alterna${className ? ` ${className}` : ""}`}
      style={{ aspectRatio: proporcion, background: fondo, padding: relleno }}
    >
      {laminas.map((l, n) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={l.src}
          src={l.src}
          alt={n === 0 ? l.alt : ""}
          aria-hidden={n !== 0}
          style={{
            opacity: n === i ? 1 : 0,
            transitionDuration: `${fundido}s`,
            filter: l.filtro,
          }}
          loading={n === 0 ? "eager" : "lazy"}
        />
      ))}
    </div>
  );
}
