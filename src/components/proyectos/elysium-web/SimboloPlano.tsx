"use client";

import { useEffect, useMemo, useRef } from "react";
import { ERAS, figuraDeEras } from "./simbolo";
import { contarPorEra } from "./canciones";

// EL SÍMBOLO EN PLANO, de una tinta.
//
// El de la portada va con el lienzo de metal, que es un campo de distancia con
// su material, su luz y su relieve. Aquí no hace falta nada de eso: esto es lo
// que iría IMPRESO en una camiseta, y una serigrafía es una mancha de un color.
//
// Se dibuja por el mismo camino que el metal —una bola por punto, con su radio,
// y la unión de todas es la figura— pero rellenando en negro en vez de
// levantando una normal. Sale la misma silueta exacta, que es lo que importa:
// la camiseta enseña el símbolo que esa persona acaba de construir.
export default function SimboloPlano({
  seleccion,
  className,
  style,
  tinta = "#111",
}: {
  seleccion: Set<string>;
  className?: string;
  style?: React.CSSProperties;
  /** El color de la tinta. Negro por defecto, que es como se imprime. */
  tinta?: string;
}) {
  const lienzo = useRef<HTMLCanvasElement>(null);
  const trazos = useMemo(
    () => figuraDeEras(contarPorEra(seleccion, ERAS)),
    [seleccion]
  );

  useEffect(() => {
    const c = lienzo.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    // El lienzo se dibuja al doble para que la silueta no salga con el filo
    // dentado en pantallas normales; el tamaño de presentación lo pone el CSS.
    const LADO = 512;
    c.width = LADO;
    c.height = LADO;
    ctx.clearRect(0, 0, LADO, LADO);
    if (!trazos.length) return;

    // La figura viene en el espacio en que la dejó el generador. Se mide su
    // caja aquí en vez de dar por hecho un 0..1: así esto sigue funcionando
    // aunque el encaje cambie de convenio.
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const t of trazos) {
      for (const p of t.puntos) {
        x0 = Math.min(x0, p.x - p.r);
        y0 = Math.min(y0, p.y - p.r);
        x1 = Math.max(x1, p.x + p.r);
        y1 = Math.max(y1, p.y + p.r);
      }
    }
    const ancho = x1 - x0;
    const alto = y1 - y0;
    if (!(ancho > 0) || !(alto > 0)) return;

    // Encajada y centrada, con un pelo de aire para que las puntas no toquen el
    // filo del lienzo.
    const escala = (LADO * 0.94) / Math.max(ancho, alto);
    const dx = (LADO - ancho * escala) / 2 - x0 * escala;
    const dy = (LADO - alto * escala) / 2 - y0 * escala;

    ctx.fillStyle = tinta;
    for (const t of trazos) {
      for (const p of t.puntos) {
        ctx.beginPath();
        ctx.arc(p.x * escala + dx, p.y * escala + dy, Math.max(p.r * escala, 0.5), 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, [trazos, tinta]);

  return <canvas ref={lienzo} className={className} style={style} aria-hidden="true" />;
}
