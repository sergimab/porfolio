"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import "./IconoConstruccion.css";

// Cómo se construye un icono, en un ÚNICO lienzo donde las tres fases se
// suceden encima de la anterior:
//   1. la retícula se dibuja sola, de fuera hacia dentro
//   2. sobre esa misma retícula, el trazo del icono se traza como un trim paths
//   3. la retícula se retira y el icono pasa a relleno, alternando color
//
// Antes eran tres tarjetas en fila con flechas entre ellas. Al superponerlas se
// lee como un proceso continuo —la retícula no se repite, se queda— y de paso
// el lienzo puede ocupar todo el ancho en vez de un tercio.
//
// El "trim paths" es stroke-dasharray/stroke-dashoffset con pathLength="1", así
// que el progreso va de 1 a 0 sin medir la longitud real de cada trazado.
// IMPORTANTE: al acabar, el panel pasa a estado "done" y deja de aplicarse el
// guion. Los cuatro trazos del icono son cerrados (Z) y, mientras hay un patrón
// de guiones activo, el navegador remata el punto de cierre con extremos planos
// en vez del stroke-linejoin, dejando una muesca en el vértice (se veía en la
// punta del rayo). Sin guion, el cierre se une correctamente.

// En qué fase va la secuencia. Una sola cuenta, en vez de un estado por panel:
// ahora no hay paneles independientes, hay capas de un mismo lienzo.
//   0 · en blanco   1 · retícula   2 · trazo   3 · color
type Fase = 0 | 1 | 2 | 3;

// Retícula de 32x32 sobre un lienzo de 210 (celda = 6.5625). Las coordenadas se
// conservan tal cual vienen del original para que rejilla e icono encajen al
// píxel; NO se regeneran por fórmula.
const CELL = 6.5625;

const V_LINES = [
  6.3877, 12.9502, 19.5117, 26.0742, 32.6377, 39.2002, 45.7617, 52.3252,
  58.8877, 65.4492, 72.0127, 78.5752, 85.1367, 91.7002, 98.2627, 104.824,
  111.388, 117.95, 124.512, 131.075, 137.638, 144.199, 150.762, 157.325,
  163.888, 170.449, 177.013, 183.575, 190.137, 196.7, 203.263, 210,
];

const H_LINES = [
  6.91248, 13.475, 20.0375, 26.6, 33.1625, 39.725, 46.2875, 52.85,
  59.4125, 65.975, 72.5374, 79.0999, 85.6624, 92.2249, 98.7874, 105.35,
  111.912, 118.475, 125.037, 131.6, 138.162, 144.725, 151.288, 157.85,
  164.413, 170.975, 177.538, 184.1, 190.663, 197.225, 203.788, 210,
];

const RECTS = [
  "M163.888 177.537V33.1625L45.7627 33.1625L45.7627 177.537H163.888Z",
  "M32.6377 164.412L177.013 164.412L177.013 46.2875L32.6377 46.2875L32.6377 164.412Z",
];

const SAFE_AREA =
  "M173.73 26.6H26.0742V184.1H183.574V26.6H173.73ZM177.012 177.537H32.6367V33.1625H177.012V177.537Z";

const ICON_PATHS = [
  "M95.0033 49.5906H88.2877V43.0281C88.2877 39.3968 85.3564 36.4656 81.7471 36.4656H62.1033C58.4939 36.4656 55.5627 39.3968 55.5627 43.0281V49.5906H49.0221C41.7814 49.5906 35.9189 55.475 35.9189 62.7375V161.022C35.9189 168.284 41.7814 174.169 49.0221 174.169H95.0252C102.266 174.169 108.128 168.284 108.128 161.022V62.7156C108.128 55.4531 102.266 49.5687 95.0252 49.5687L95.0033 49.5906Z",
  "M94.9814 102.069H49.0439V121.756H94.9814V102.069Z",
  "M94.9814 134.881H49.0439V154.569H94.9814V134.881Z",
  "M147.481 36.5093L147.241 36.4437L121.231 88.9437H147.481V124.447C156.275 106.641 164.981 86.9749 173.731 69.2562H147.481V36.5093Z",
];

// Paso 3 · el icono ya vectorizado (contorno convertido a relleno). Los cinco
// SVG de variantes comparten exactamente la misma geometría y solo cambian de
// color, así que se guarda una única copia y lo que rota es la variante. Los
// colores viven en el CSS (.icb-panel-3[data-variante="n"]).
const VARIANTE_PATHS = {
  rayo: "M148.04 128.136C147.798 128.136 147.535 128.114 147.294 128.048C145.801 127.697 144.748 126.38 144.748 124.844V92.7606H121.618C120.477 92.7606 119.424 92.1681 118.831 91.2026C118.239 90.237 118.173 89.03 118.678 87.9986L144.77 35.0897C145.45 33.7072 147.03 32.983 148.545 33.3561L148.786 33.4219C150.234 33.795 151.266 35.1117 151.266 36.6039V68.3141H174.308C175.449 68.3141 176.502 68.9067 177.095 69.8722C177.687 70.8378 177.753 72.0448 177.248 73.0762L151.002 126.314C150.432 127.455 149.291 128.158 148.04 128.158V128.136ZM126.907 86.1772H148.018C149.839 86.1772 151.31 87.6475 151.31 89.4689V110.733L168.975 74.9195H147.93C146.109 74.9195 144.638 73.4492 144.638 71.6278V50.2097L126.885 86.1772H126.907Z",
  cuerpo: "M95.4594 177.841H49.1998C40.1147 177.841 32.7412 170.467 32.7412 161.382V62.8938C32.7412 53.8086 40.1147 46.4352 49.1998 46.4352H52.4915V43.1435C52.4915 37.7012 56.9244 33.2683 62.3667 33.2683H82.117C87.5593 33.2683 91.9921 37.7012 91.9921 43.1435V46.4352H95.4594C104.545 46.4352 111.918 53.8086 111.918 62.8938V161.382C111.918 170.467 104.545 177.841 95.4594 177.841ZM49.1998 53.0186C43.7575 53.0186 39.3246 57.4515 39.3246 62.8938V161.382C39.3246 166.824 43.7575 171.257 49.1998 171.257H95.4594C100.902 171.257 105.335 166.824 105.335 161.382V62.8938C105.335 57.4515 100.902 53.0186 95.4594 53.0186H88.7004C86.879 53.0186 85.4087 51.5483 85.4087 49.7269V43.1435C85.4087 41.3221 83.9384 39.8517 82.117 39.8517H62.3667C60.5453 39.8517 59.075 41.3221 59.075 43.1435V49.7269C59.075 51.5483 57.6047 53.0186 55.7832 53.0186H49.1998Z",
  barra1: "M95.2621 125.436H49.2439C47.4224 125.436 45.9521 123.966 45.9521 122.145V102.394C45.9521 100.573 47.4224 99.1027 49.2439 99.1027H95.2621C97.0835 99.1027 98.5538 100.573 98.5538 102.394V122.145C98.5538 123.966 97.0835 125.436 95.2621 125.436ZM52.5136 118.853H91.9484V105.686H52.5136V118.853Z",
  barra2: "M95.2621 158.354H49.2439C47.4224 158.354 45.9521 156.883 45.9521 155.062V135.312C45.9521 133.49 47.4224 132.02 49.2439 132.02H95.2621C97.0835 132.02 98.5538 133.49 98.5538 135.312V155.062C98.5538 156.883 97.0835 158.354 95.2621 158.354ZM52.5136 151.77H91.9484V138.603H52.5136V151.77Z",
};

const N_VARIANTES = 5;
const MS_POR_VARIANTE = 1400;

// Las líneas entran desde los bordes hacia el centro: el retardo depende de lo
// cerca que esté la línea del borde más próximo.
const edgeOrder = (coord: number) => Math.round(Math.min(coord, 210 - coord) / CELL);

// El último trazo en terminar de cada panel; al acabar él, avanza la secuencia.
const ULTIMA_LINEA = RECTS.length - 1;
const ULTIMO_TRAZO = ICON_PATHS.length - 1;

function Reticula({ onFin }: { onFin?: () => void }) {
  return (
    <>
      {/* La translucidez va por fill-opacity en el CSS, para dejar libre
          la propiedad opacity, que es la que usa la animación de entrada. */}
      <path className="icb-safe" d={SAFE_AREA} />

      {H_LINES.map((y) => (
        <path
          key={`h${y}`}
          className="icb-line"
          style={{ ["--i" as string]: edgeOrder(y) }}
          d={`M0 ${y}H210`}
          pathLength={1}
        />
      ))}

      {V_LINES.map((x) => (
        <path
          key={`v${x}`}
          className="icb-line"
          style={{ ["--i" as string]: edgeOrder(x) }}
          d={`M${x} 0V210`}
          pathLength={1}
        />
      ))}

      {RECTS.map((d, i) => (
        <path
          key={`r${i}`}
          className="icb-rect"
          style={{ ["--i" as string]: i }}
          d={d}
          pathLength={1}
          onAnimationEnd={i === ULTIMA_LINEA ? onFin : undefined}
        />
      ))}
    </>
  );
}

export default function IconoConstruccion() {
  const ref = useRef<HTMLDivElement>(null);
  const [fase, setFase] = useState<Fase>(0);
  const [variante, setVariante] = useState(0);

  const reiniciar = useCallback(() => {
    setFase(0);
    setVariante(0);
  }, []);

  // Una vez llega a la fase de color, las variantes se alternan en bucle
  // mientras el bloque siga en pantalla.
  useEffect(() => {
    if (fase < 3) return;
    const id = setInterval(
      () => setVariante((v) => (v + 1) % N_VARIANTES),
      MS_POR_VARIANTE
    );
    return () => clearInterval(id);
  }, [fase]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Sin animación: se muestra directamente el resultado final.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setFase(3);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setFase((f) => (f === 0 ? 1 : f));
        } else {
          reiniciar(); // se rearma para volver a verla al bajar de nuevo
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reiniciar]);

  return (
    <div className="icb" ref={ref}>
      <div className="icb-panel" data-fase={fase} data-variante={variante}>
        {/* Un solo SVG con las tres capas superpuestas. El orden importa: la
            retícula al fondo, y encima el trazo y el icono relleno, que se
            relevan por fundido. */}
        <svg viewBox="0 0 210 210" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          {/* 1 · la retícula se construye sola, y se queda durante el trazo */}
          <g className="icb-capa-reticula">
            <Reticula onFin={() => setFase(2)} />
          </g>

          {/* 2 · el trazo del icono, sobre esa misma retícula */}
          <g className="icb-capa-trazo icb-icon">
            {ICON_PATHS.map((d, i) => (
              <path
                key={i}
                style={{ ["--i" as string]: i }}
                d={d}
                pathLength={1}
                onAnimationEnd={i === ULTIMO_TRAZO ? () => setFase(3) : undefined}
              />
            ))}
          </g>

          {/* 3 · el icono ya vectorizado, que releva al trazo sin moverse.
              Va en un SVG anidado con su propio viewBox: estas coordenadas se
              exportaron sobre un lienzo de 211 y las del trazo sobre uno de
              210. Metidas sin más en el de 210 se agrandarían un 0,5%, y a todo
              el ancho eso ya es un salto visible justo en el relevo. */}
          <svg
            className="icb-capa-color icb-variantes"
            x="0"
            y="0"
            width="210"
            height="210"
            viewBox="0 0 211 211"
          >
            <path className="icb-v-rayo" d={VARIANTE_PATHS.rayo} />
            <path className="icb-v-cuerpo" d={VARIANTE_PATHS.cuerpo} />
            <path className="icb-v-barra" d={VARIANTE_PATHS.barra1} />
            <path className="icb-v-barra" d={VARIANTE_PATHS.barra2} />
          </svg>
        </svg>
      </div>
    </div>
  );
}
