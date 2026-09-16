"use client";

import { useEffect, useRef, useState } from "react";
import LangText from "@/components/shared/LangText";
import "./Marca.css";

// Las láminas de marca del manual: la construcción del logotipo, la del
// isotipo, el área de seguridad y el estampado.
//
// EL FONDO OSCURO SOLO EN MODO CLARO. En oscuro no se pinta ninguno y las
// láminas van directamente sobre el papel de la página. Ese fondo no es
// decoración: existe para que se vean unas guías claras. Si la página ya es
// oscura, repetirlo mete un recuadro dentro de otro casi del mismo color, que
// se lee como un parche mal recortado. Todo lo de dentro va en `currentColor`,
// así que el mismo dibujo sirve para los dos casos.

// Los cuatro cuartos del isotipo, en el orden en que vienen en el archivo:
// abajo-derecha, abajo-izquierda, arriba-izquierda y arriba-derecha.
const CUARTOS = [
  "M61.72,45.7v16.02h-15.33c1.54,5.36,6.47,9.28,12.33,9.28,7.09,0,12.83-5.75,12.83-12.83,0-6.05-4.19-11.11-9.83-12.47Z",
  "M9.28,61.72v-15.88c-5.36,1.54-9.28,6.47-9.28,12.33,0,7.09,5.75,12.83,12.83,12.83,5.86,0,10.78-3.93,12.33-9.28h-15.88Z",
  "M9.28,9.28h15.88C23.62,3.93,18.69,0,12.83,0,5.75,0,0,5.75,0,12.83c0,5.86,3.93,10.78,9.28,12.33v-15.88Z",
  "M58.71,0c-5.86,0-10.78,3.93-12.33,9.28h15.33v16.02c5.64-1.35,9.83-6.41,9.83-12.47,0-7.09-5.75-12.83-12.83-12.83Z",
];

// En la versión a color, cada cuarto lleva el suyo, siguiendo el orden de los
// paths: rosa abajo-derecha, naranja abajo-izquierda, morado arriba-izquierda y
// verde arriba-derecha, que es como está en el manual.
const CUARTOS_COLOR = ["#FF5C5C", "#FFAE11", "#A484FF", "#A1F08D"];

function Isotipo({ colores }: { colores?: string[] }) {
  return (
    <g>
      {CUARTOS.map((d, i) => (
        <path
          key={i}
          d={d}
          fill={colores ? colores[i] : "currentColor"}
          // El color que le tocaría a este cuarto viaja siempre, aunque se
          // pinte en el color del texto: en móvil la lámina del isotipo no
          // enseña la versión a color aparte —no cabe—, así que la de la
          // izquierda se enciende al terminar de girar y necesita saber cuál es
          // el suyo.
          style={{ ["--color" as string]: CUARTOS_COLOR[i] }}
        />
      ))}
    </g>
  );
}

// Avisa cuando su elemento entra en pantalla, una sola vez.
//
// Con IntersectionObserver y no leyendo la posición en cada scroll: aquí no
// hace falta saber CUÁNTO se ha avanzado, solo si ya toca empezar, y para eso
// el observador no gasta un fotograma por cada rueda del ratón.
function useAlAparecer<T extends HTMLElement>(margen = "-18%") {
  const ref = useRef<T>(null);
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
      { rootMargin: `0px 0px ${margen} 0px` }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [margen]);
  return { ref, visible };
}

export default function Marca() {
  const grid = useAlAparecer<HTMLDivElement>();

  return (
    <div className="ev-marca">
      {/* ── Composición del logotipo ─────────────────────────────────────── */}
      <section className="ev-lamina">
        <h2 className="ev-lamina-titulo ev-rotulo-fila">
          <span className="ev-rotulo"><LangText es="Composición logotipo" en="Logotype construction" /></span>
        </h2>
        <div className="ev-lamina-partida">
          <div className="ev-lamina-mitad es-fondo">
            {/* La lámina de construcción tal cual sale del archivo original, con
                sus cotas y sus líneas de puntos. Antes esto era una retícula
                reconstruida a ojo desde una captura; ahora es la de verdad. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="ev-lamina-pieza es-apaisada"
              src="/proyectos/espacio-vacio/composicion-logotipo.svg"
              alt="Construcción del logotipo de Espacio vacío, con sus proporciones acotadas"
            />
          </div>
          <div className="ev-lamina-mitad">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="ev-lamina-logo es-sigue-papel"
              src="/proyectos/espacio-vacio/espacio-vacio-logo.svg"
              alt="Logotipo de Espacio vacío"
            />
          </div>
        </div>
      </section>

      {/* ── Composición del isotipo ──────────────────────────────────────── */}
      <section className="ev-lamina">
        <h2 className="ev-lamina-titulo ev-rotulo-fila">
          <span className="ev-rotulo"><LangText es="Composición isotipo" en="Icon construction" /></span>
        </h2>
        {/* El observador va en la lámina ENTERA y no en una mitad: el grid se
            dibuja a la izquierda y el isotipo gira a la derecha, así que las dos
            cosas tienen que arrancar del mismo aviso. */}
        <div
          className={`ev-lamina-partida ev-grid${grid.visible ? " es-visible" : ""}`}
          ref={grid.ref}
        >
          <div className="ev-lamina-mitad es-fondo">
            {/* La geometría de la que sale el isotipo, dibujándose al llegar.
                Cada guía entra con su retardo, de fuera hacia dentro —primero la
                caja, luego los ejes, al final los círculos—, que es el orden en
                el que se construiría a mano.

                Y EL ISOTIPO DENTRO, que es lo que faltaba: las cuatro
                circunferencias son de donde salen sus esquinas, así que sin la
                pieza encima la lámina enseñaba un andamio sin nada construido. */}
            <svg className="ev-lamina-pieza" viewBox="-26 -26 123.55 123" aria-hidden="true">
              <g className="ev-guias">
                {/* La caja redondeada de la que cuelga todo, y el círculo que
                    pasa por las cuatro esquinas de la caja del isotipo —el
                    mismo que queda inscrito en las marcas de corte—. */}
                <rect x="-21.4" y="-21.7" width="114.4" height="114.4" rx="36" style={{ animationDelay: "0ms" }} />
                <circle cx="35.77" cy="35.5" r="50.6" style={{ animationDelay: "90ms" }} />
                {/* Las marcas de corte: cuatro líneas sueltas y no un rectángulo,
                    porque lo que las hace marcas es justamente que se pasen de
                    largo por las esquinas. */}
                <line x1="-24" y1="-15" x2="95.5" y2="-15" style={{ animationDelay: "180ms" }} />
                <line x1="-24" y1="86" x2="95.5" y2="86" style={{ animationDelay: "180ms" }} />
                <line x1="-15" y1="-24" x2="-15" y2="95" style={{ animationDelay: "180ms" }} />
                <line x1="86.55" y1="-24" x2="86.55" y2="95" style={{ animationDelay: "180ms" }} />
                {/* Los ejes, de lado a lado. */}
                <line x1="-24" y1="35.5" x2="95.5" y2="35.5" style={{ animationDelay: "260ms" }} />
                <line x1="35.77" y1="-24" x2="35.77" y2="95" style={{ animationDelay: "260ms" }} />
                {/* La caja del isotipo y sus diagonales, que siguen hasta cruzarse
                    con las marcas de corte. */}
                <rect x="0" y="0" width="71.55" height="71" style={{ animationDelay: "340ms" }} />
                <line x1="-24" y1="-23.8" x2="95.5" y2="94.8" style={{ animationDelay: "420ms" }} />
                <line x1="95.5" y1="-23.8" x2="-24" y2="94.8" style={{ animationDelay: "420ms" }} />
                {/* Las cuatro circunferencias de las esquinas van MACIZAS: son de
                    donde sale el radio de la pieza, y en trazo se confundían con
                    una guía más de las muchas que cruzan por ahí. */}
                <circle className="es-disco" cx="12.83" cy="12.83" r="12.83" style={{ animationDelay: "500ms" }} />
                <circle className="es-disco" cx="58.72" cy="12.83" r="12.83" style={{ animationDelay: "560ms" }} />
                <circle className="es-disco" cx="12.83" cy="58.17" r="12.83" style={{ animationDelay: "620ms" }} />
                <circle className="es-disco" cx="58.72" cy="58.17" r="12.83" style={{ animationDelay: "680ms" }} />
              </g>
              <g className="ev-grid-iso">
                <Isotipo />
              </g>
              {/* El cuadrado que une los centros de las cuatro circunferencias va
                  DESPUÉS del isotipo, y no con las demás guías, porque sus cuatro
                  esquinas caen dentro de la pieza: dibujado debajo, se le comían
                  las esquinas y el cuadrado no llegaba a verse.
                  Encima tampoco bastaba —hilo blanco sobre blanco—, así que se
                  pinta por diferencia: claro sobre el fondo oscuro y oscuro sobre
                  el isotipo. */}
              <g className="ev-guias es-diferencia">
                <rect x="12.83" y="12.83" width="45.89" height="45.34" style={{ animationDelay: "420ms" }} />
                {/* Y el círculo inscrito en él, que cae de lleno sobre la pieza:
                    por eso viene aquí y no con las demás. */}
                <circle cx="35.77" cy="35.5" r="22.95" style={{ animationDelay: "740ms" }} />
              </g>
            </svg>
          </div>
          <div className="ev-lamina-mitad">
            <svg className="ev-lamina-pieza es-isotipo-color" viewBox="0 0 71.55 71" aria-hidden="true">
              <Isotipo colores={CUARTOS_COLOR} />
            </svg>
          </div>
        </div>
      </section>

      {/* ── Área de seguridad ────────────────────────────────────────────── */}
      <section className="ev-lamina">
        <h2 className="ev-lamina-titulo ev-rotulo-fila">
          <span className="ev-rotulo"><LangText es="Área de seguridad" en="Clear space" /></span>
        </h2>
        <div className="ev-lamina-entera es-fondo">
          <div className="ev-seguridad">
            {/* El margen que hay que respetar alrededor de cada versión, medido
                con una parte de la propia marca: los cuadraditos de las esquinas
                SON esa unidad. Medido así, el margen crece con la marca en vez
                de ser una cifra en milímetros que deja de valer al reducir.
                Las dos piezas comparten unidad —34 sobre un cuadro de 176—, que
                es lo que hace que las dos láminas se lean como una sola regla. */}
            <svg className="ev-seguridad-pieza" viewBox="0 0 470 206" aria-hidden="true">
              {/* El logotipo se lleva a blanco con un filtro SVG y no con
                  `filter` de CSS, y esto salió en un móvil: Safari no aplica el
                  filtro CSS a un <image> dentro de un SVG, así que el logotipo
                  se quedaba en su negro original sobre el fondo oscuro de la
                  lámina y desaparecía. La matriz fuerza el color a blanco y
                  respeta el canal alfa, y esa sí la entienden todos. */}
              <defs>
                <filter id="ev-a-blanco">
                  <feColorMatrix
                    type="matrix"
                    values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0"
                  />
                </filter>
              </defs>
              <g className="ev-guias es-quietas">
                <rect x="0.5" y="0.5" width="469" height="205" />
                <rect x="0.5" y="0.5" width="34" height="34" />
                <rect x="435.5" y="0.5" width="34" height="34" />
                <rect x="0.5" y="171.5" width="34" height="34" />
                <rect x="435.5" y="171.5" width="34" height="34" />
                <line x1="34.5" y1="0.5" x2="34.5" y2="205.5" />
                <line x1="435.5" y1="0.5" x2="435.5" y2="205.5" />
                <line x1="0.5" y1="34.5" x2="469.5" y2="34.5" />
                <line x1="0.5" y1="171.5" x2="469.5" y2="171.5" />
              </g>
              {/* El alto sale de la proporción real del logotipo (456,56 x
                  155,27 = 2,94), no de un número redondo. Estaba en 107 y el
                  logotipo, al conservar su forma, se encogía hasta caber en esa
                  franja y dejaba 43 de aire a cada lado: las líneas parecían muy
                  separadas de la marca cuando en realidad la marca no llegaba a
                  ellas. */}
              <image
                href="/proyectos/espacio-vacio/espacio-vacio-logo.svg"
                x="34.5"
                y="34.5"
                width="401"
                height="137"
                filter="url(#ev-a-blanco)"
              />
            </svg>

            <svg className="ev-seguridad-pieza es-cuadrada" viewBox="0 0 176 176" aria-hidden="true">
              <g className="ev-guias es-quietas">
                <rect x="0.5" y="0.5" width="175" height="175" />
                <rect x="0.5" y="0.5" width="34" height="34" />
                <rect x="141.5" y="0.5" width="34" height="34" />
                <rect x="0.5" y="141.5" width="34" height="34" />
                <rect x="141.5" y="141.5" width="34" height="34" />
                <line x1="34.5" y1="0.5" x2="34.5" y2="175.5" />
                <line x1="141.5" y1="0.5" x2="141.5" y2="175.5" />
                <line x1="0.5" y1="34.5" x2="175.5" y2="34.5" />
                <line x1="0.5" y1="141.5" x2="175.5" y2="141.5" />
              </g>
              <g transform="translate(34.5 35.3) scale(1.4947)">
                <Isotipo />
              </g>
            </svg>
          </div>
        </div>
      </section>

      {/* ── El estampado ─────────────────────────────────────────────────── */}
      <section className="ev-lamina">
        <h2 className="ev-lamina-titulo ev-rotulo-fila">
          <span className="ev-rotulo"><LangText es="Estampado" en="Pattern" /></span>
        </h2>
        {/* Sin fondo: la trama se pinta sobre el papel de la página, así que en
            claro sale oscura y en oscuro sale clara. */}
        <div className="ev-lamina-entera es-estampado">
          {/* Un patrón SVG en vez de una imagen repetida: el motivo es el mismo
              isotipo, se define una vez y el navegador lo repite sin descargar
              nada. El ejemplar a color va encima del hueco que le tocaría a uno
              de la trama, no en medio de ninguna parte: ese es el guiño de la
              lámina, que en todo el estampado hay un solo isotipo de la marca y
              el resto son marcas de recorte vacías. */}
          {/* `slice`: la trama LLENA la caja y lo que sobra se recorta, en vez
              de encogerse hasta caber y dejar franjas vacías. Un estampado no
              tiene encuadre que respetar —sigue en todas direcciones—, así que
              la caja puede tener la forma que quiera: apaisada en ancho,
              cuadrada en móvil. */}
          <svg
            className="ev-estampado"
            viewBox="0 0 1200 660"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            <defs>
              {/* MEDIO SALTO, no cuadrícula. Las columnas se alinean —todas
                  caen en la misma vertical— y lo que se descoloca es el alto:
                  una columna sí y otra no baja media altura, así que las filas
                  dejan de leerse en línea. Es lo que hace el archivo original.

                  La columna bajada asoma por debajo del azulejo, y lo que se
                  sale se corta en la costura: por eso va DOS VECES, la segunda
                  desplazada un azulejo hacia arriba, que es la mitad que
                  reaparece por el borde de arriba. */}
              <pattern id="ev-trama" width="200" height="200" patternUnits="userSpaceOnUse">
                <g transform="translate(14 14)">
                  <Isotipo />
                </g>
                <g transform="translate(14 114)">
                  <Isotipo />
                </g>
                <g transform="translate(114 64)">
                  <Isotipo />
                </g>
                <g transform="translate(114 164)">
                  <Isotipo />
                </g>
                <g transform="translate(114 -36)">
                  <Isotipo />
                </g>
              </pattern>
            </defs>
            <rect width="1200" height="660" fill="url(#ev-trama)" />
            {/* El de color cae EXACTAMENTE sobre uno de la trama —columna sin
                bajar, azulejo (600, 200)—, así que no se añade uno más: se
                enciende el que ya estaba. */}
            <g transform="translate(614 214)">
              <Isotipo colores={CUARTOS_COLOR} />
            </g>
          </svg>
        </div>
      </section>
    </div>
  );
}
