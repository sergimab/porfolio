import LangText from "@/components/shared/LangText";
import "./Marca.css";

// Las láminas de marca del manual: la construcción del logotipo, la del
// isotipo, el área de seguridad y el estampado.
//
// Van dibujadas y no como capturas, y esto no es purismo: son láminas de
// CONSTRUCCIÓN, o sea que lo que enseñan son líneas de un píxel sobre las que
// se apoya la forma. Una captura las convierte en un gris borroso en cuanto
// alguien amplía, que es justo cuando alguien mira una lámina de construcción.
// Dibujadas se leen a cualquier tamaño y pesan unos pocos kilobytes.
//
// El isotipo se reutiliza en las cuatro, así que vive en un solo sitio.

// Los cuatro cuartos del isotipo, en el orden en que vienen en el archivo:
// abajo-derecha, abajo-izquierda, arriba-izquierda y arriba-derecha.
const CUARTOS = [
  "M61.72,45.7v16.02h-15.33c1.54,5.36,6.47,9.28,12.33,9.28,7.09,0,12.83-5.75,12.83-12.83,0-6.05-4.19-11.11-9.83-12.47Z",
  "M9.28,61.72v-15.88c-5.36,1.54-9.28,6.47-9.28,12.33,0,7.09,5.75,12.83,12.83,12.83,5.86,0,10.78-3.93,12.33-9.28h-15.88Z",
  "M9.28,9.28h15.88C23.62,3.93,18.69,0,12.83,0,5.75,0,0,5.75,0,12.83c0,5.86,3.93,10.78,9.28,12.33v-15.88Z",
  "M58.71,0c-5.86,0-10.78,3.93-12.33,9.28h15.33v16.02c5.64-1.35,9.83-6.41,9.83-12.47,0-7.09-5.75-12.83-12.83-12.83Z",
];

// En la versión a color, cada cuarto lleva el suyo. El orden sigue al de los
// paths, no al de lectura: morado arriba-izquierda, verde arriba-derecha,
// naranja abajo-izquierda y rosa abajo-derecha, que es como está en el manual.
const CUARTOS_COLOR = ["#FF5C5C", "#FFAE11", "#A484FF", "#A1F08D"];

function Isotipo({ colores }: { colores?: string[] }) {
  return (
    <g>
      {CUARTOS.map((d, i) => (
        <path key={i} d={d} fill={colores ? colores[i] : "currentColor"} />
      ))}
    </g>
  );
}

export default function Marca() {
  return (
    <div className="ev-marca">
      {/* ── Composición del logotipo ─────────────────────────────────────── */}
      <section className="ev-lamina">
        <h2 className="ev-lamina-titulo es-sobre-oscuro">
          <LangText es="Composición logotipo" en="Logotype construction" />
        </h2>
        <div className="ev-lamina-partida">
          <div className="ev-lamina-mitad es-oscura">
            {/* La retícula sobre la que se apoya el logotipo. Las líneas de
                puntos marcan las alturas —de mayúscula, de la x, la base— y los
                cortes verticales de cada letra. */}
            <svg className="ev-lamina-pieza es-apaisada" viewBox="0 0 470 170" aria-hidden="true">
              <g className="ev-guias">
                {/* Horizontales: las tres alturas de cada línea del logotipo. */}
                {[22, 80, 88, 146].map((y) => (
                  <line key={y} x1="10" y1={y} x2="460" y2={y} />
                ))}
                {/* Verticales: por donde cae el arranque y el final de cada
                    palabra, y el desplazamiento entre las dos líneas. */}
                {[24, 140, 256, 372, 446].map((x) => (
                  <line key={x} x1={x} y1="8" x2={x} y2="160" />
                ))}
                {/* Las diagonales de la A y la V, que son las que fijan la
                    inclinación del conjunto. */}
                <line x1="140" y1="146" x2="186" y2="88" />
                <line x1="186" y1="88" x2="232" y2="146" />
              </g>
              <image
                href="/proyectos/espacio-vacio/espacio-vacio-logo.svg"
                x="24"
                y="22"
                width="422"
                height="126"
                className="ev-lamina-logo-fantasma"
              />
            </svg>
          </div>
          <div className="ev-lamina-mitad es-clara">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="ev-lamina-logo"
              src="/proyectos/espacio-vacio/espacio-vacio-logo.svg"
              alt="Logotipo de Espacio vacío"
            />
          </div>
        </div>
      </section>

      {/* ── Composición del isotipo ──────────────────────────────────────── */}
      <section className="ev-lamina">
        <h2 className="ev-lamina-titulo es-sobre-oscuro">
          <LangText es="Composición isotipo" en="Icon construction" />
        </h2>
        <div className="ev-lamina-partida">
          <div className="ev-lamina-mitad es-oscura">
            {/* La geometría de la que sale el isotipo: el cuadrado exterior, el
                superóvalo que lo redondea, los cuatro círculos de las esquinas
                y el cuadrado interior con sus diagonales. */}
            <svg className="ev-lamina-pieza" viewBox="-14 -14 100 100" aria-hidden="true">
              <g className="ev-guias">
                <rect x="-11" y="-11" width="94" height="94" rx="26" />
                <rect x="-4" y="-4" width="80" height="80" rx="22" />
                <rect x="0" y="0" width="71.55" height="71" />
                <rect x="12.8" y="12.8" width="46" height="45.4" />
                <line x1="-14" y1="35.5" x2="86" y2="35.5" />
                <line x1="35.8" y1="-14" x2="35.8" y2="86" />
                <line x1="0" y1="0" x2="71.55" y2="71" />
                <line x1="71.55" y1="0" x2="0" y2="71" />
                <line x1="-14" y1="-14" x2="12.8" y2="12.8" />
                <line x1="85.5" y1="-14" x2="58.7" y2="12.8" />
                <line x1="-14" y1="85" x2="12.8" y2="58.2" />
                <line x1="85.5" y1="85" x2="58.7" y2="58.2" />
                {/* Los cuatro círculos de los que nace cada cuarto. */}
                <circle cx="12.8" cy="12.8" r="12.8" className="es-relleno" />
                <circle cx="58.7" cy="12.8" r="12.8" className="es-relleno" />
                <circle cx="12.8" cy="58.2" r="12.8" className="es-relleno" />
                <circle cx="58.7" cy="58.2" r="12.8" className="es-relleno" />
              </g>
            </svg>
          </div>
          <div className="ev-lamina-mitad es-clara">
            <svg className="ev-lamina-pieza es-isotipo-color" viewBox="0 0 71.55 71" aria-hidden="true">
              <Isotipo colores={CUARTOS_COLOR} />
            </svg>
          </div>
        </div>
      </section>

      {/* ── Área de seguridad ────────────────────────────────────────────── */}
      <section className="ev-lamina">
        <h2 className="ev-lamina-titulo es-sobre-oscuro">
          <LangText es="Área de seguridad" en="Clear space" />
        </h2>
        <div className="ev-lamina-entera es-oscura">
          <div className="ev-seguridad">
            {/* El margen que hay que dejar alrededor de cada versión. Se mide
                con una parte de la propia marca —el alto de la E en el
                logotipo, el de un cuarto en el isotipo—, que es lo que hace que
                el margen crezca con ella en vez de ser una medida fija que deja
                de valer al reducir. */}
            <div className="ev-seguridad-caja">
              <span className="ev-seguridad-marco" aria-hidden="true" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="ev-seguridad-logo"
                src="/proyectos/espacio-vacio/espacio-vacio-logo.svg"
                alt="Área de seguridad del logotipo"
              />
            </div>
            <div className="ev-seguridad-caja es-cuadrada">
              <span className="ev-seguridad-marco" aria-hidden="true" />
              <svg className="ev-seguridad-iso" viewBox="0 0 71.55 71" aria-hidden="true">
                <Isotipo />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ── El estampado ─────────────────────────────────────────────────── */}
      <section className="ev-lamina">
        <h2 className="ev-lamina-titulo">
          <LangText es="Estampado" en="Pattern" />
        </h2>
        <div className="ev-lamina-entera es-clara">
          {/* Un patrón SVG en vez de una imagen repetida: el motivo es el mismo
              isotipo, así que se define una vez y el navegador lo repite sin
              descargar nada. Y el ejemplar a color va encima, que es el guiño
              de la lámina: en el estampado entero hay un solo isotipo de la
              marca y el resto son marcas de recorte vacías. */}
          <svg className="ev-estampado" viewBox="0 0 1200 660" aria-hidden="true">
            <defs>
              <pattern id="ev-trama" width="100" height="100" patternUnits="userSpaceOnUse">
                <g transform="translate(14 14) scale(1)">
                  <Isotipo />
                </g>
              </pattern>
            </defs>
            <rect width="1200" height="660" fill="url(#ev-trama)" className="ev-trama-color" />
            <g transform="translate(714 314)">
              <Isotipo colores={CUARTOS_COLOR} />
            </g>
          </svg>
        </div>
      </section>
    </div>
  );
}
