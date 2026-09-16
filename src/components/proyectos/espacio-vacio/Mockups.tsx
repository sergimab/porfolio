"use client";

import { useEffect, useRef, useState } from "react";

// Las piezas acabadas, montadas como en el archivo original: el 2 montando
// sobre el 1, y el 3, el 4 y el 5 en una fila.
//
// Cada una entra colocándose cuando le llega el turno en el scroll. El
// desplazamiento de salida es distinto por pieza —unas vienen de un lado, otras
// del otro—, porque si todas suben lo mismo no se lee como piezas colocándose
// sino como un bloque entero desplazándose.

type Pieza = {
  src: string;
  alt: string;
  clase?: string;
  // La proporción del archivo. Hace dos cosas, y la segunda no es obvia:
  // reserva el hueco para que la página no pegue un salto al cargar cada
  // imagen, y le da ALTO al elemento desde el primer momento. Sin eso, una
  // imagen diferida mide cero cuando el observador la mira, no llega a cruzar
  // el borde de la pantalla y se queda invisible para siempre: era lo que
  // dejaba el montaje entero en blanco.
  ratio: number;
  // De dónde viene, en píxeles, y cuánto tarda en arrancar.
  sx?: number;
  sy?: number;
  se?: number;
  retraso?: number;
};

// Se observa cada pieza por separado y no el bloque entero: así la de abajo
// espera a que se llegue a ella en vez de haberse colocado hace tres pantallas.
function Mock({ p }: { p: Pieza }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      // Empieza cuando asoma una franja de verdad, no con el primer píxel: si
      // no, las piezas altas se colocan mientras siguen fuera de la pantalla.
      { rootMargin: "0px 0px -14% 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`ev-mock${visible ? " es-visible" : ""}${p.clase ? ` ${p.clase}` : ""}`}
      style={{
        aspectRatio: p.ratio,
        ["--sx" as string]: `${p.sx ?? 0}px`,
        ["--sy" as string]: `${p.sy ?? 44}px`,
        ["--se" as string]: p.se ?? 0.96,
        ["--retraso" as string]: `${p.retraso ?? 0}ms`,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={p.src} alt={p.alt} loading="lazy" />
    </div>
  );
}

const SOLAS: Pieza[] = [
  {
    src: "/proyectos/espacio-vacio/mockup-1.webp",
    ratio: 1.25,
    alt: "Pantallas de la app de Espacio vacío en perspectiva",
    sy: 56,
  },
  {
    src: "/proyectos/espacio-vacio/mockup-2.webp",
    ratio: 1.4289,
    alt: "La app abierta sobre el perfil de una usuaria",
    clase: "ev-mock-solapado",
    sy: 70,
    se: 0.94,
  },
];

// La fila del medio: el 4 y el 5 apilados a la izquierda y el 3 a su derecha,
// más grande. El 3 lleva el móvil de pie, así que necesita más alto que los dos
// cuadrados; dándoles a todos el mismo ancho, el móvil salía diminuto.
const APILADOS: Pieza[] = [
  {
    src: "/proyectos/espacio-vacio/mockup-4.webp",
    ratio: 1,
    alt: "Piezas de la campaña en redes sociales",
    sx: -34,
    sy: 30,
  },
  {
    src: "/proyectos/espacio-vacio/mockup-5.webp",
    ratio: 1,
    alt: "Perfil de Instagram de Espacio vacío",
    sx: -34,
    sy: 30,
    retraso: 120,
  },
];

const GRANDE: Pieza = {
  src: "/proyectos/espacio-vacio/mockup-3.webp",
  ratio: 1.3746,
  alt: "Publicación de Instagram de la campaña",
  sx: 34,
  sy: 40,
  retraso: 60,
};

const RESTO: Pieza[] = [
  {
    src: "/proyectos/espacio-vacio/mockup-6.webp",
    ratio: 1.7778,
    alt: "Los tres carteles de la campaña y una historia de Instagram",
    sy: 52,
  },
  {
    src: "/proyectos/espacio-vacio/mockup-7.webp",
    ratio: 1.9028,
    alt: "Aplicación de la marca sobre soportes",
    sy: 52,
  },
  {
    src: "/proyectos/espacio-vacio/mockup-8.webp",
    ratio: 1.5,
    alt: "Detalle de las piezas de la campaña",
    sy: 52,
  },
];

export default function Mockups() {
  return (
    <div className="ev-mockups">
      {SOLAS.map((p) => (
        <Mock key={p.src} p={p} />
      ))}

      <div className="ev-mock-fila">
        <div className="ev-mock-columna">
          {APILADOS.map((p) => (
            <Mock key={p.src} p={p} />
          ))}
        </div>
        <Mock p={GRANDE} />
      </div>

      <div className="ev-mock-resto">
        {RESTO.map((p) => (
          <Mock key={p.src} p={p} />
        ))}
      </div>
    </div>
  );
}
