"use client";

import { useEffect, useMemo, useRef } from "react";
import { ERAS, figuraDeEras } from "./simbolo";
import { contarPorEra } from "./canciones";

// EL SÍMBOLO EN PLANO, de una tinta, para lo que iría serigrafiado.
//
// No es el lienzo de metal: es la MISMA FIGURA rellena de negro. El lienzo
// levanta un campo, lo desenfoca y lo corta por un umbral, y todo eso se mide
// en píxeles; a 50 px de estampa la figura se deshacía en manchas. Aquí se
// rellena la geometría directamente, así que la forma es la misma a cualquier
// tamaño y sale limpia.
//
// CADA TRAZO SE RELLENA COMO UN CUERPO, no se pinta como una línea. Se toma el
// recorrido y se separa a un lado y a otro la mitad de su grosor en cada punto,
// lo que da un contorno cerrado que se rellena de una vez. Dos consecuencias, y
// las dos son las que se buscaban: el trazo tiene cuerpo —la extrusión, no un
// hilo— y donde el grosor se va a cero el contorno se cierra en PUNTA, que es
// como acaba una aguja y no como acaba una cápsula redondeada.
const LADO = 512;
const ENCAJE = 0.92;

export default function SimboloPlano({
  seleccion,
  className,
  style,
}: {
  seleccion: Set<string>;
  className?: string;
  style?: React.CSSProperties;
}) {
  const lienzo = useRef<HTMLCanvasElement>(null);
  const trazos = useMemo(
    () => figuraDeEras(contarPorEra(seleccion, ERAS), ENCAJE),
    [seleccion]
  );

  useEffect(() => {
    const c = lienzo.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx || !trazos.length) return;
    c.width = LADO;
    c.height = LADO;
    ctx.clearRect(0, 0, LADO, LADO);

    // La caja de la figura se mide aquí en vez de dar por hecho un 0..1: así
    // esto sigue valiendo aunque el encaje cambie de convenio.
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const t of trazos) {
      for (const p of t.puntos) {
        x0 = Math.min(x0, p.x - p.r); y0 = Math.min(y0, p.y - p.r);
        x1 = Math.max(x1, p.x + p.r); y1 = Math.max(y1, p.y + p.r);
      }
    }
    const ancho = x1 - x0, alto = y1 - y0;
    if (!(ancho > 0) || !(alto > 0)) return;
    const k = (LADO * 0.94) / Math.max(ancho, alto);
    const dx = (LADO - ancho * k) / 2 - x0 * k;
    const dy = (LADO - alto * k) / 2 - y0 * k;
    const X = (p: { x: number }) => p.x * k + dx;
    const Y = (p: { y: number }) => p.y * k + dy;

    ctx.fillStyle = "#000";
    for (const t of trazos) {
      const ps = t.puntos;
      if (ps.length < 2) continue;

      // La normal en cada punto, para separar el contorno a los dos lados. En
      // los extremos se toma la dirección del tramo que hay; dentro, la media
      // de los dos, que es lo que evita el pellizco en las curvas cerradas.
      const normal = (i: number): [number, number] => {
        const a = ps[Math.max(0, i - 1)], b = ps[Math.min(ps.length - 1, i + 1)];
        const ux = X(b) - X(a), uy = Y(b) - Y(a);
        const d = Math.hypot(ux, uy) || 1;
        return [-uy / d, ux / d];
      };

      ctx.beginPath();
      for (let i = 0; i < ps.length; i++) {
        const [nx, ny] = normal(i);
        const r = ps[i].r * k;
        const x = X(ps[i]) + nx * r, y = Y(ps[i]) + ny * r;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      for (let i = ps.length - 1; i >= 0; i--) {
        const [nx, ny] = normal(i);
        const r = ps[i].r * k;
        ctx.lineTo(X(ps[i]) - nx * r, Y(ps[i]) - ny * r);
      }
      ctx.closePath();
      ctx.fill();
    }
  }, [trazos]);

  if (!trazos.length) return null;
  return <canvas ref={lienzo} className={className} style={style} aria-hidden="true" />;
}
