import LangText from "@/components/shared/LangText";
import RotuloSeccion from "@/components/shared/RotuloSeccion";
import { RUTA, TINTAS, GRADACIONES, SUBMARCAS } from "./marca";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import LaminaGuias from "./LaminaGuias";
import Tipografia from "./Tipografia";
import Aplicaciones from "./Aplicaciones";
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
        {/* Los cuatro iconos juntos y en fila, que es donde se ve que son una
            misma familia. El archivo es de un solo color, así que va como
            máscara: recorta, y el color lo pone la página. Así vale el mismo
            para los dos modos del sitio —claro sobre oscuro y al revés— en vez
            del morado de origen, que contra el papel oscuro no se veía. */}
        <span className="ym-iconos" aria-hidden="true" />

        {/* El margen de aplicación: cuánto aire pide el icono al lado de la
            marca. Se dibuja al llegar, como la lámina de construcción. */}
        <LaminaGuias markup={margen} ancho={190} />

        {/* Cada línea con su icono y su color, y debajo el nombre y la
            gradación de la que sale ese color. Las cuatro Y vienen en un solo
            archivo, así que cada celda enseña su cuarto: el fondo se amplía
            hasta que una Y ocupa la casilla y se corre a la que le toca. Es lo
            que permite ponerles nombre sin trocear el archivo. */}
        <ul className="ym-ys">
          {SUBMARCAS.map((s, i) => (
            <li key={s.id}>
              <span className="ym-y" style={{ ["--ym-i" as string]: i }} aria-hidden="true" />
              <h3 className="ym-y-nombre">{s.nombre}</h3>
              <span
                className="ym-barra es-y"
                style={{ background: `linear-gradient(90deg, ${s.degradado.join(", ")})` }}
                aria-hidden="true"
              />
            </li>
          ))}
        </ul>
      </section>

      {/* ── Las aplicaciones ─────────────────────────────────────────────── */}
      <Aplicaciones />
    </div>
  );
}
