"use client";

import { useEffect, useMemo, useRef } from "react";
import { AJUSTE_BASE, POR_POLIGONO, construirForma, type Ajuste } from "./formaGaga";
import { ERAS } from "./simbolo";
import { fraccionPorEra } from "./canciones";

// EL SÍMBOLO EN PLANO, de una tinta, para lo que iría serigrafiado.
//
// La misma figura que levanta el volumen, rellena de negro. Y ahora es la misma
// de verdad: el generador entrega polígonos convexos, así que aquí basta con
// pintarlos. Antes había que reconstruir el contorno a mano porque el motor
// vivía en un campo de píxeles que a 50 px de estampa se deshacía en manchas.
//
// Lo único que no lleva es el cierre líquido de los rincones, que se hace en la
// tarjeta gráfica. Para una estampa de una tinta eso juega a favor: el pico sale
// más seco.
const LADO = 512;

export default function SimboloPlano({
  seleccion,
  // PROVISIONAL: la forma afinada desde el panel de mandos, para que la estampa
  // siga a la pieza mientras se afina en vez de quedarse con la de serie.
  ajuste,
  className,
  style,
}: {
  seleccion: Set<string>;
  ajuste?: Ajuste;
  className?: string;
  style?: React.CSSProperties;
}) {
  const lienzo = useRef<HTMLCanvasElement>(null);
  const forma = useMemo(() => {
    const f = construirForma(fraccionPorEra(seleccion, ERAS), ajuste ?? AJUSTE_BASE);
    // El buffer se reescribe en cada llamada, así que se copia lo que toca:
    // guardarse la referencia sería guardarse la siguiente figura.
    return f && { piezas: Array.from(f.poligonos.slice(0, f.cuantos * POR_POLIGONO)), caja: f.caja, cuantos: f.cuantos };
  }, [seleccion, ajuste]);

  useEffect(() => {
    const c = lienzo.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx || !forma) return;
    c.width = LADO;
    c.height = LADO;
    ctx.clearRect(0, 0, LADO, LADO);

    const [[x0, y0], [x1, y1]] = forma.caja;
    const ancho = x1 - x0, alto = y1 - y0;
    if (!(ancho > 0) || !(alto > 0)) return;
    const k = (LADO * 0.94) / Math.max(ancho, alto);
    const dx = (LADO - ancho * k) / 2 - x0 * k;
    // La y del generador va hacia arriba y la del lienzo hacia abajo.
    const dy = (LADO + alto * k) / 2 + y0 * k;

    ctx.fillStyle = "#000";
    ctx.beginPath();
    for (let p = 0; p < forma.cuantos; p++) {
      const b = p * POR_POLIGONO;
      for (let v = 0; v < 6; v++) {
        const x = forma.piezas[b + v * 2] * k + dx;
        const y = -forma.piezas[b + v * 2 + 1] * k + dy;
        if (v === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
    }
    // Sin «evenodd»: las piezas se solapan en las uniones y con esa regla los
    // solapes saldrían en hueco, con la figura calada por dentro.
    ctx.fill("nonzero");
  }, [forma]);

  if (!forma) return null;
  return <canvas ref={lienzo} className={className} style={style} aria-hidden="true" />;
}
