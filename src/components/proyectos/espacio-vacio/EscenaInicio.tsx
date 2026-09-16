"use client";

import { useEffect, useRef, useState } from "react";
import "./EscenaInicio.css";

// La escena de cabecera de Espacio vacío: el móvil en la mano, el logotipo
// detrás y las esferas de color colocándose a su sitio con el scroll.
//
// Las esferas no están puestas a ojo: sus posiciones salen de medir el
// fotograma de referencia y pasarlas a fracción del cuadro, y el cuadro es 16:9
// fijo. Por eso la composición se conserva igual en cualquier ancho en vez de
// descuadrarse en cuanto cambia la ventana.
//
// `x`, `y` y `d` van en porcentaje del ancho y del alto del cuadro. `dx` es de
// dónde viene cada una en horizontal, apuntando hacia fuera para que converjan
// sobre el móvil en vez de deslizarse todas en la misma dirección.
//
// El vertical NO se escribe: sale de la propia altura de cada esfera —ver
// SALIDA—, porque si se pone a mano acaba contradiciéndola.
// Lo que sube el conjunto entero respecto a lo medido, en puntos de alto del
// cuadro. Va aparte y se aplica a todas por igual: mover el grupo es un solo
// número, y las posiciones de la lista siguen siendo las de la referencia en
// vez de quedar retocadas una a una y sin saber ya de dónde salieron.
const SUBIDA = 5;

const ESFERAS = [
  { x: 61.5, y: 11.8, d: 4.4, color: "#FF5C5C", dx: 6 },
  { x: 61.5, y: 28.1, d: 4.4, color: "#A484FF", dx: -9 },
  { x: 71.5, y: 28.1, d: 4.4, color: "#FFAE11", dx: 4 },
  { x: 81.4, y: 28.1, d: 4.4, color: "#FF5C5C", dx: 13 },
  { x: 76.9, y: 43.5, d: 4.1, color: "#A1F08D", dx: 14 },
  { x: 62.2, y: 57.1, d: 3.6, color: "#A1F08D", dx: 8 },
  { x: 14.6, y: 71.9, d: 4.4, color: "#FFAE11", dx: -13 },
  { x: 23.0, y: 79.2, d: 4.0, color: "#FF5C5C", dx: -8 },
];

// Cuánto se aleja cada esfera en vertical antes de colocarse, por cada punto
// que esté separada del centro del cuadro.
//
// Con esto, la que está arriba viene BAJANDO y la que está abajo viene
// SUBIENDO: cada una entra por su lado y se juntan hacia el medio. Sale de la
// propia altura en vez de escribirse a mano por una razón práctica: a mano hay
// que acordarse de darle la vuelta al signo cada vez que una esfera se mueve
// de sitio, y basta olvidarlo una vez para que esa entre al revés que sus
// vecinas sin que se vea el motivo en el código.
const SALIDA = 0.55;

const limitar = (v: number) => Math.min(1, Math.max(0, v));
const suave = (t: number) => t * t * (3 - 2 * t);

export default function EscenaInicio() {
  const cajaRef = useRef<HTMLDivElement>(null);
  const [avance, setAvance] = useState(0);

  useEffect(() => {
    // Sin movimiento, la escena aparece montada. Para quien pide menos
    // animación, la composición ES el resultado y colocarse es el adorno.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setAvance(1);
      return;
    }
    const caja = cajaRef.current;
    if (!caja) return;

    let raf = 0;
    const medir = () => {
      raf = 0;
      const r = caja.getBoundingClientRect();
      // Cero cuando la escena asoma por abajo del todo, uno cuando ya está
      // centrada en la ventana. Se lee de la posición y no se acumula, así que
      // subir deshace el recorrido sin llevar ninguna cuenta.
      const desde = window.innerHeight;
      const hasta = (window.innerHeight - r.height) / 2;
      const recorrido = desde - hasta || 1;
      setAvance(suave(limitar((desde - r.top) / recorrido)));
    };
    const alMover = () => {
      if (!raf) raf = requestAnimationFrame(medir);
    };
    medir();
    window.addEventListener("scroll", alMover, { passive: true });
    window.addEventListener("resize", alMover);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", alMover);
      window.removeEventListener("resize", alMover);
    };
  }, []);

  return (
    <div
      className="ev-escena"
      ref={cajaRef}
      style={{ ["--avance" as string]: avance }}
    >
      {/* El logotipo, de fondo. Va como imagen y se le da la vuelta en oscuro
          con un filtro en vez de guardar dos archivos: el SVG trae el color
          escrito dentro, así que desde fuera no se le puede cambiar el relleno.
          eslint-disable-next-line @next/next/no-img-element */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="ev-logo"
        src="/proyectos/espacio-vacio/espacio-vacio-logo.svg"
        alt=""
        aria-hidden="true"
      />

      {/* Las esferas van ENTRE el logotipo y el móvil: en la referencia unas
          cuantas quedan tapadas a medias por la mano, y es eso lo que da la
          sensación de profundidad. */}
      {ESFERAS.map((e, i) => (
        <span
          key={i}
          className="ev-esfera"
          aria-hidden="true"
          style={{
            left: `${e.x}%`,
            top: `${e.y - SUBIDA}%`,
            width: `${e.d}%`,
            background: e.color,
            ["--dx" as string]: `${e.dx}%`,
            // Hacia arriba las de arriba y hacia abajo las de abajo, medido
            // desde el centro del cuadro.
            ["--dy" as string]: `${(e.y - SUBIDA - 50) * SALIDA}%`,
            // Escalonadas por ALTURA, no por el orden de la lista: el recorrido
            // se lee de arriba abajo, así que las de arriba llegan antes y las
            // de abajo cierran. Por orden de lista el escalonado saltaba de un
            // lado a otro del cuadro sin ninguna lógica visible.
            ["--turno" as string]: ((e.y - SUBIDA) / 100) * 0.45,
          }}
        />
      ))}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="ev-mockup"
        src="/proyectos/espacio-vacio/mockup-isotipo.png"
        alt="Una mano sosteniendo un móvil con el isotipo de Espacio vacío en pantalla"
      />
    </div>
  );
}
