import LangText from "@/components/shared/LangText";
import RotuloSeccion from "@/components/shared/RotuloSeccion";
import { RUTA, TINTAS, GRADACIONES, SUBMARCAS } from "./marca";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import Construccion from "./Construccion";
import "./Branding.css";

// Una pieza de la marca, recortada con su archivo y pintada con lo que se le
// pase: un color plano o un degradado. Ver marca.ts para por qué va como
// máscara y no como imagen.
function Pieza({
  archivo,
  ratio,
  tinta,
  ancho,
}: {
  archivo: string;
  ratio: number;
  tinta: string;
  ancho: string;
}) {
  return (
    <span
      className="ym-pieza"
      style={{
        ["--ym-archivo" as string]: `url(${RUTA}/${archivo})`,
        ["--ym-tinta" as string]: tinta,
        ["--ym-ratio" as string]: String(ratio),
        width: ancho,
      }}
      aria-hidden="true"
    />
  );
}

const MORADO = "#3C1F71";

// Un degradado de abajo arriba a partir de la lista de paradas de la submarca.
const degradar = (paradas: string[]) => `linear-gradient(0deg, ${paradas.join(", ")})`;

// El archivo se lee una vez, al construir la página.
const construccion = readFileSync(
  join(process.cwd(), "public/proyectos/yelmo/branding/composicion-logo-alt.svg"),
  "utf8"
);

export default function Branding() {
  return (
    <div className="ym-branding">
      {/* ── El logotipo ──────────────────────────────────────────────────── */}
      <section className="ym-seccion">
        <RotuloSeccion es="Construcción del logotipo" en="Logotype construction" />
        {/* La construcción, dibujándose al llegar. El SVG se lee aquí —en el
            servidor— y se le pasa al componente, que es quien lo anima: así la
            fuente sigue siendo el archivo de la carpeta del proyecto. */}
        <Construccion markup={construccion} />
      </section>

      {/* ── La paleta ────────────────────────────────────────────────────── */}
      <section className="ym-seccion">
        <RotuloSeccion es="Paleta de color" en="Colour palette" />
        <ul className="ym-tintas">
          {TINTAS.map((t) => (
            <li key={t.hex}>
              <span className="ym-tinta" style={{ background: t.hex }} />
              <p className="ym-valores">
                CMYK: {t.cmyk}
                <br />
                RGB: {t.rgb}
                <br />
                WEB: {t.hex}
              </p>
            </li>
          ))}
        </ul>

        <h3 className="ym-subrotulo">
          <LangText es="Gradación cromática" en="Colour gradation" />
        </h3>
        {/* Cada gradación con sus dos extremos en un disco a los lados, como en
            el manual: la barra dice cómo pasa de uno a otro y los discos, de
            dónde a dónde. */}
        <ul className="ym-gradaciones">
          {GRADACIONES.map((g) => (
            <li key={g.de + g.a}>
              <span className="ym-barra" style={{ background: `linear-gradient(90deg, ${g.de}, ${g.a})` }} />
              <span className="ym-punto es-izq" style={{ background: g.de }} />
              <span className="ym-punto es-der" style={{ background: g.a }} />
            </li>
          ))}
        </ul>
      </section>

      {/* ── Las submarcas ────────────────────────────────────────────────── */}
      <section className="ym-seccion">
        <RotuloSeccion es="Submarcas" en="Sub-brands" />
        <p className="ym-entradilla">
          <LangText
            es="Cuatro líneas dentro de la misma marca. El logotipo no cambia: solo se le añade el descriptor y su icono, que sale de la misma familia de formas."
            en="Four lines inside the same brand. The logotype does not change: it only gains the descriptor and its icon, drawn from the same family of shapes."
          />
        </p>
        <ul className="ym-submarcas">
          {SUBMARCAS.map((s) => (
            <li key={s.id}>
              <Pieza archivo={s.archivo} ratio={s.ratio} ancho="100%" tinta={MORADO} />
            </li>
          ))}
        </ul>
      </section>

      {/* ── La inclusión dinámica ────────────────────────────────────────── */}
      <section className="ym-seccion">
        <RotuloSeccion es="Inclusión dinámica" en="Dynamic inclusion" />
        <p className="ym-entradilla">
          <LangText
            es="Cada línea se queda con la marca y cambia de color. El degradado va del tono vivo abajo al profundo arriba, y de ahí salen las tintas de cada una."
            en="Each line keeps the brand and changes colour. The gradient runs from the bright tone at the bottom to the deep one at the top, and each line's inks come from it."
          />
        </p>
        <ul className="ym-lineas">
          {SUBMARCAS.map((s) => (
            <li key={s.id}>
              <h3 className="ym-linea-nombre">{s.nombre}</h3>
              <div className="ym-linea-pieza">
                <Pieza archivo={s.archivo} ratio={s.ratio} ancho="100%" tinta={degradar(s.degradadoPieza ?? s.degradado)} />
              </div>
              <span className="ym-barra es-linea" style={{ background: `linear-gradient(90deg, ${s.degradado.join(", ")})` }} />
              <ul className="ym-linea-tintas">
                {s.tintas.map((t) => (
                  <li key={t.hex}>
                    <span className="ym-bolita" style={{ background: t.hex }} />
                    <p className="ym-valores">
                      CMYK: {t.cmyk}
                      <br />
                      RGB: {t.rgb}
                      <br />
                      WEB: {t.hex}
                    </p>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
