import LangText from "@/components/shared/LangText";
import RotuloSeccion from "@/components/shared/RotuloSeccion";
import { RUTA, TINTAS, GRADACIONES } from "./marca";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import LaminaGuias from "./LaminaGuias";
import Tipografia from "./Tipografia";
import "./Branding.css";

// Los SVG que van incrustados se leen una vez, al construir la página.
//
// Y se les cambia el nombre a sus clases e ids: los archivos de Illustrator los
// llaman a todos igual —`cls-1`, `Degradado_sin_nombre`—, y como el `<style>`
// que traen dentro vale para toda la página, dos láminas juntas se pisaban los
// colores y los degradados entre ellas. Con un prefijo por archivo cada una se
// queda con lo suyo, y de paso se le puede hablar desde el CSS de fuera.
const leer = (archivo: string, prefijo: string) => {
  const bruto = readFileSync(
    join(process.cwd(), "public/proyectos/yelmo/branding", archivo),
    "utf8"
  );
  return bruto
    .replace(/cls-(\d+)/g, `${prefijo}-cls-$1`)
    .replace(/(id=")([^"]+)(")/g, `$1${prefijo}-$2$3`)
    .replace(/url\(#([^)]+)\)/g, `url(#${prefijo}-$1)`)
    .replace(/(xlink:href="#)([^"]+)(")/g, `$1${prefijo}-$2$3`);
};

const construccion = leer("composicion-logo-alt.svg", "ym-cons");
const margen = leer("margen-submarca.svg", "ym-marg");

export default function Branding() {
  return (
    <div className="ym-branding">
      {/* ── El logotipo ──────────────────────────────────────────────────── */}
      <section className="ym-seccion">
        <RotuloSeccion es="Construcción del logotipo" en="Logotype construction" />
        {/* La construcción, dibujándose al llegar. El SVG se lee aquí —en el
            servidor— y se le pasa al componente, que es quien lo anima: así la
            fuente sigue siendo el archivo de la carpeta del proyecto. */}
        <LaminaGuias markup={construccion} />
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

      {/* ── La tipografía ─────────────────────────────────────────────────── */}
      <Tipografia />

      {/* ── Las submarcas ────────────────────────────────────────────────── */}
      <section className="ym-seccion">
        <RotuloSeccion es="Submarcas" en="Sub-brands" />
        <p className="ym-entradilla">
          <LangText
            es="Cuatro líneas dentro de la misma marca. El logotipo no cambia: solo se le añade el descriptor y su icono, que sale de la misma familia de formas."
            en="Four lines inside the same brand. The logotype does not change: it only gains the descriptor and its icon, drawn from the same family of shapes."
          />
        </p>
        {/* Los cuatro iconos juntos y en fila, que es donde se ve que son una
            misma familia. No valen ni la máscara ni un archivo único: llevan
            detalles en negativo —el interior de la estrella, la contra de la
            e—, así que hay una versión por modo, con el icono del color del
            texto y esos huecos del color del papel. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="ym-iconos es-oscuro"
          src={`${RUTA}/iconos-submarcas-oscuro.svg`}
          alt="Los iconos de las cuatro submarcas de Yelmo"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="ym-iconos es-claro"
          src={`${RUTA}/iconos-submarcas-claro.svg`}
          alt=""
          aria-hidden="true"
        />

        {/* El margen de aplicación: cuánto aire pide el icono al lado de la
            marca. Se dibuja al llegar, como la lámina de construcción. */}
        <LaminaGuias markup={margen} ancho={190} />

        {/* Y cada línea con su icono y su color sobre el isotipo. Aquí el color
            ES el dato, así que va tal cual sale del archivo. */}
        {/* Como los iconos: los detalles que el archivo dibuja en blanco pasan
            a ser del color del papel, para que se lean como huecos y no como
            una mancha clara. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="ym-submarcas-y es-oscuro"
          src={`${RUTA}/submarcas-Y-oscuro.svg`}
          alt="El isotipo de Yelmo en las cuatro submarcas, cada una con su icono y su color"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="ym-submarcas-y es-claro"
          src={`${RUTA}/submarcas-Y-claro.svg`}
          alt=""
          aria-hidden="true"
        />
      </section>

    </div>
  );
}
