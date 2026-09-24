"use client";

import TextoPapel from "@/components/shared/TextoPapel";
import LangText from "@/components/shared/LangText";
import RotuloSeccion from "@/components/shared/RotuloSeccion";
import DropcapTitle from "@/components/shared/DropcapTitle";
import BackCapsule from "@/components/shared/BackCapsule";
import ToolIcons from "@/components/shared/ToolIcons";
import MeshGradient from "@/components/shared/MeshGradient";
import { CATEGORIAS } from "@/components/shared/proyectos";
import Moleculas from "./Moleculas";
import Organismos from "./Organismos";
import { paletaLegible, paletaClara, degradadoLegible, degradadoClaro, CAPSULE_DRIFT_SIZE, drift } from "@/components/shared/organico";

// LAS MUESTRAS SE PINTAN CON EL SISTEMA, no lo describen.
//
// Cada muestra de color es un cuadrado con la variable de verdad puesta como
// fondo; cada componente es el componente, no una copia. Así el muestrario no
// puede quedarse desfasado: si alguien cambia un token o retoca una pieza, esta
// página lo enseña al recargar.

// Los cinco tokens de color. El texto de cada uno explica para qué sirve, que
// es lo que de verdad hace falta saber: el valor se ve al lado.
// LOS DOS COLORES BASE, que son el sitio entero. Dark y Light no son «el fondo»
// y «el texto»: son los dos colores en los que está hecha la web, y lo que
// cambia al pasar de un modo a otro es cuál de los dos hace de papel y cuál de
// tinta. Por eso se enseñan juntos y con su valor delante.
const BASE = [
  { nombre: "Dark", valor: "#1C1A16", contra: "#F2EEE2", es: "Papel en modo oscuro, tinta en modo claro", en: "Paper in dark mode, ink in light mode" },
  { nombre: "Light", valor: "#F2EEE2", contra: "#1C1A16", es: "Tinta en modo oscuro, papel en modo claro", en: "Ink in dark mode, paper in light mode" },
];

// Los tres que derivan de esos dos. Cada uno tiene un trabajo distinto y por eso
// son tres y no uno: uno es texto, otro es línea y el tercero es relleno.
const TOKENS = [
  { v: "--muted", es: "Apagado", en: "Muted", uso: { es: "Lo secundario: la hora, los pies, las etiquetas.", en: "Secondary matter: the clock, captions, labels." } },
  { v: "--border", es: "Filo", en: "Border", uso: { es: "Línea. Los 26 sitios donde algo separa sin pesar.", en: "A line. The 26 places where something separates without weight." } },
  // Contado uno a uno: de sus ocho usos fuera de esta página, los ocho son el
  // hueco donde va una imagen. Es lo que hace de verdad, y el muestrario tiene
  // que decir eso y no lo que nos gustaría que hiciera.
  { v: "--surface", es: "Hueco", en: "Slot", uso: { es: "Relleno. Las 8 veces que se ve el sitio de una imagen que aún no está.", en: "A fill. The 8 times you see where an image is not yet." } },
];

// La escala de letra que se usa de verdad, contada de la hoja de estilos.
const LETRA = [
  { px: 34, es: "Titular de proyecto", en: "Project title" },
  { px: 17, es: "Entradilla", en: "Lead paragraph" },
  { px: 15, es: "Texto de lectura", en: "Body copy" },
  { px: 14, es: "Interfaz", en: "Interface" },
  { px: 13, es: "Texto corrido de apartado", en: "Section copy" },
  { px: 12, es: "Rótulos y pies", en: "Labels and captions" },
];

// Las tres esquinas. Se pintan con la variable puesta, así que si un día cambia
// el valor, esta muestra cambia con el sitio.
const RADIOS = [
  { v: "--r-pieza", px: "12", es: "Lo que va dentro: imágenes, campos, cajas de papel", en: "What goes inside: images, fields, paper boxes" },
  { v: "--r-caja", px: "16", es: "Lo que enmarca: cabecera, pie, tarjetas, marcos", en: "What frames: header, footer, cards, frames" },
  { v: "--r-pastilla", px: "999", es: "Lo que tiene forma de pastilla", en: "Anything pill-shaped" },
];

// Los tres huecos, dibujados a su tamaño real: la barra mide lo que dice.
const HUECOS = [
  { px: 56, es: "Entre apartados", en: "Between sections" },
  { px: 28, es: "Del rótulo a su pieza", en: "Label to its piece" },
  { px: 16, es: "Entre piezas de una fila", en: "Between pieces in a row" },
];

// Los cuatro anchos donde la página cambia de forma, y no hay más. Antes eran
// doce valores distintos, cada uno salido de mirar una pieza suelta.
const CORTES = [
  { px: 1024, es: "Las cuadrículas anchas se parten", en: "Wide grids break up" },
  { px: 900, es: "Una fila de tres pasa a dos", en: "A row of three becomes two" },
  { px: 700, es: "Todo a una sola columna", en: "Everything to one column" },
  { px: 560, es: "Lo que se arrastra pasa a menú", en: "What drags becomes a menu" },
];

// Los cinco momentos de cualquier pieza que se pueda tocar. Se pintan a la vez
// y quietos, que es la única manera de compararlos: de uno en uno y con el
// ratón encima, nunca se ven dos juntos.
const ESTADOS = [
  { clase: "es-reposo", es: "Reposo", en: "Rest", de: "Filo fino y nada más", deEn: "A thin border, nothing more" },
  { clase: "es-hover", es: "Al acercarse", en: "Hover", de: "Se rellena: papel y tinta cambian de sitio", deEn: "It fills: paper and ink swap" },
  { clase: "es-activo", es: "Al pulsar", en: "Pressed", de: "Lo mismo, un punto más apagado", deEn: "The same, a notch duller" },
  { clase: "es-foco", es: "Con el teclado", en: "Focus", de: "Aro de 2, separado otros 2", deEn: "A 2px ring, offset by 2" },
  { clase: "es-apagado", es: "Desactivado", en: "Disabled", de: "Sin relleno y en gris", deEn: "Unfilled and grey" },
];

export default function Muestrario() {
  return (
    <>
      <RotuloSeccion className="sd-nivel" es="Átomos" en="Atoms" />
      {/* ── Color ───────────────────────────────────────────────────────── */}
      <section className="sd-seccion">
        <h3 className="sd-rotulo"><LangText es="Color" en="Colour" /></h3>
        <TextoPapel>
          <p>
            <LangText
              es="**Dos colores y tres derivados.** La web entera está hecha en Dark y Light, y lo que cambia al pasar de modo no es la paleta sino cuál de los dos hace de papel y cuál de tinta. De ahí salen los otros tres, que no son tonos sino trabajos: uno escribe, otro traza una línea y el tercero rellena."
              en="**Two colours and three derived.** The whole site is made of Dark and Light, and what changes between modes is not the palette but which of the two is the paper and which the ink. The other three come from those, and they are not shades but jobs: one writes, one draws a line and one fills."
            />
          </p>
        </TextoPapel>
        <div className="sd-base">
          {BASE.map(b => (
            <div
              className="sd-base-color"
              key={b.nombre}
              /* El contrario del propio color, que es justo lo que cuenta la
                 muestra: los dos se leen siempre el uno sobre el otro. */
              style={{ background: b.valor, color: b.contra }}
            >
              <span className="sd-base-nombre">{b.nombre}</span>
              <code>{b.valor}</code>
              <span className="sd-base-uso"><LangText es={b.es} en={b.en} /></span>
            </div>
          ))}
        </div>
        <div className="sd-tokens">
          {TOKENS.map(t => (
            <div className="sd-token" key={t.v}>
              <span className="sd-token-muestra" style={{ background: `var(${t.v})` }} />
              <span className="sd-token-texto">
                <strong><LangText es={t.es} en={t.en} /></strong>
                <code>{t.v}</code>
                <span className="sd-token-uso"><LangText es={t.uso.es} en={t.uso.en} /></span>
              </span>
            </div>
          ))}
        </div>

        <h4 className="sd-subrotulo"><LangText es="Los siete colores de categoría" en="The seven category colours" /></h4>
        <TextoPapel>
          <p>
            <LangText
              es="Cada disciplina tiene su tono, y de ahí salen su cápsula, su tarjeta y la cabecera de sus páginas. No son colores planos: cada uno se abre en **cinco manchas que derivan**, y las cinco están igualadas de luminancia para que el nombre en blanco encima dé **5,1:1 en cualquier punto y en cualquier momento** de la animación."
              en="Each discipline has its hue, and from it come its capsule, its cards and the header of its pages. They are not flat colours: each opens into **five drifting blobs**, all matched in luminance so that white text on top gives **5.1:1 at any point and any moment** of the animation."
            />
          </p>
        </TextoPapel>
        <div className="sd-tonos">
          {CATEGORIAS.map(c => (
            <div className="sd-tono" key={c.id}>
              <span
                className="sd-tono-banda"
                style={{
                  backgroundImage: c.claro ? degradadoClaro(c.hue) : degradadoLegible(c.hue),
                  backgroundSize: CAPSULE_DRIFT_SIZE,
                  ...drift(c.id),
                }}
              >
                <MeshGradient
                  colores={c.claro ? paletaClara(c.hue) : paletaLegible(c.hue)}
                  selectorEscucha=".sd-tono"
                  velocidadReposo={0}
                  velocidadHover={0.35}
                  suavizado={0.5}
                  escala={0.8}
                />
                <span className="mesh-encima">{c.label}</span>
              </span>
              <span className="sd-tono-dato">{c.hue}°</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tipografía ──────────────────────────────────────────────────── */}
      <section className="sd-seccion">
        <h3 className="sd-rotulo"><LangText es="Tipografía" en="Typography" /></h3>
        <TextoPapel>
          <p>
            <LangText
              es="**Tres letras con tres trabajos.** Una sans para todo lo que se lee y se usa, una cursiva para lo que es una nota sobre el contenido —pies, valores de ficha, anotaciones— y una caligráfica que solo aparece en **la capitular de los titulares**, nunca en un texto."
              en="**Three typefaces, three jobs.** A sans for everything you read and use, an italic for notes about the content — captions, meta values, annotations — and a script that only shows up in **the drop cap of titles**, never in running text."
            />
          </p>
        </TextoPapel>
        <div className="sd-letras">
          <div className="sd-letra">
            <span className="sd-letra-muestra sd-sans">Aa</span>
            <strong>Geist</strong>
            <span><LangText es="Interfaz y lectura" en="Interface and reading" /></span>
          </div>
          <div className="sd-letra">
            <span className="sd-letra-muestra sd-serif">Aa</span>
            <strong>Cormorant Garamond</strong>
            <span><LangText es="Pies y anotaciones, en cursiva" en="Captions and notes, italic" /></span>
          </div>
          <div className="sd-letra">
            <span className="sd-letra-muestra sd-script">Aa</span>
            <strong>Kapakana</strong>
            <span><LangText es="Solo la capitular" en="The drop cap only" /></span>
          </div>
        </div>

        <h4 className="sd-subrotulo"><LangText es="La escala" en="The scale" /></h4>
        <ul className="sd-escala">
          {LETRA.map(l => (
            <li key={l.px}>
              <span className="sd-escala-px">{l.px}</span>
              <span className="sd-escala-muestra" style={{ fontSize: `${Math.min(l.px, 22)}px` }}>
                <LangText es={l.es} en={l.en} />
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Espacio y forma ─────────────────────────────────────────────── */}
      <section className="sd-seccion">
        <h3 className="sd-rotulo"><LangText es="Espacio" en="Space" /></h3>
        <div className="sd-huecos">
          {HUECOS.map(h => (
            <div className="sd-hueco" key={h.px}>
              <span className="sd-hueco-barra" style={{ height: h.px }} />
              <span className="sd-hueco-px">{h.px}</span>
              <span className="sd-hueco-de"><LangText es={h.es} en={h.en} /></span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Forma ───────────────────────────────────────────────────────── */}
      <section className="sd-seccion">
        <h3 className="sd-rotulo"><LangText es="Forma" en="Shape" /></h3>
        <p className="sd-regla">
          <LangText
            es="El continente es más redondo que lo que contiene"
            en="The container is rounder than what it contains"
          />
        </p>
        <div className="sd-radios">
          {RADIOS.map(r => (
            <div className="sd-radio" key={r.v}>
              <span className="sd-radio-caja" style={{ borderRadius: `var(${r.v})` }}>
                <span className="sd-radio-px">{r.px}</span>
              </span>
              <code>{r.v}</code>
              <span><LangText es={r.es} en={r.en} /></span>
            </div>
          ))}
        </div>
        <div className="sd-anidado">
          <span className="sd-anidado-fuera">
            <span className="sd-anidado-cota">16</span>
            <span className="sd-anidado-dentro"><span className="sd-anidado-cota">12</span></span>
          </span>
        </div>
      </section>

      {/* ── Rejilla ─────────────────────────────────────────────────────── */}
      <section className="sd-seccion">
        <h3 className="sd-rotulo"><LangText es="Rejilla" en="Grid" /></h3>
        {/* COTAS, COMO EN UN PLANO. La medida va escrita sobre la línea que la
            mide, no en un párrafo aparte: es la manera de que se entienda de
            qué distancia se está hablando sin tener que decirlo. */}
        <div className="sd-plano">
          <div className="sd-plano-cota es-total">
            <span className="sd-plano-linea" />
            <span className="sd-plano-medida">1072 máx.</span>
            <span className="sd-plano-linea" />
          </div>
          <div className="sd-plano-cuerpo">
            <span className="sd-plano-aire">
              <span className="sd-plano-medida es-vertical">24</span>
            </span>
            <span className="sd-plano-caja">
              <span className="sd-plano-pieza" />
              <span className="sd-plano-pieza" />
              <span className="sd-plano-pieza" />
            </span>
            <span className="sd-plano-aire">
              <span className="sd-plano-medida es-vertical">24</span>
            </span>
          </div>
        </div>
        <h4 className="sd-subrotulo"><LangText es="Los tres cortes" en="The three breakpoints" /></h4>
        <div className="sd-cortes">
          {CORTES.map(c => (
            <div className="sd-corte" key={c.px}>
              <span className="sd-corte-px">{c.px}</span>
              <span className="sd-corte-de"><LangText es={c.es} en={c.en} /></span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Trazo ───────────────────────────────────────────────────────── */}
      <section className="sd-seccion sd-atomo">
        <h3 className="sd-rotulo"><LangText es="Trazo" en="Stroke" /></h3>
        {/* Dos líneas y sus medidas. El medio píxel de diferencia no se explica,
            se pone una encima de otra y se ve. */}
        <div className="sd-trazos">
          <div className="sd-trazo">
            <span className="sd-trazo-linea" style={{ height: 1 }} />
            <span className="sd-trazo-px">1 px</span>
            <span className="sd-trazo-de"><LangText es="Filo de dentro: cajas, campos, separadores" en="Inner edge: boxes, fields, rules" /></span>
          </div>
          <div className="sd-trazo">
            <span className="sd-trazo-linea" style={{ height: 1.5 }} />
            <span className="sd-trazo-px">1,5 px</span>
            <span className="sd-trazo-de"><LangText es="Marco de la página: cabecera, pie, cápsula de volver" en="Page frame: header, footer, back capsule" /></span>
          </div>
        </div>
      </section>

      {/* ── Estados ─────────────────────────────────────────────────────── */}
      <section className="sd-seccion">
        <h3 className="sd-rotulo"><LangText es="Estados" en="States" /></h3>
        <div className="sd-estados">
          {ESTADOS.map(e => (
            <div className="sd-estado" key={e.clase}>
              <span className={`sd-estado-muestra ${e.clase}`}>
                <LangText es="Botón" en="Button" />
              </span>
              <span className="sd-estado-nombre"><LangText es={e.es} en={e.en} /></span>
            </div>
          ))}
        </div>
      </section>

      <RotuloSeccion className="sd-nivel" es="Moléculas" en="Molecules" />

      <section className="sd-seccion">
        <Moleculas />
      </section>

      <RotuloSeccion className="sd-nivel" es="Organismos" en="Organisms" />

      <section className="sd-seccion">
        <Organismos />
      </section>

      <RotuloSeccion className="sd-nivel" es="Plantillas" en="Templates" />

      {/* ── Plantillas ──────────────────────────────────────────────────── */}
      <section className="sd-seccion">
        <div className="sd-plantillas">
          <div className="sd-plantilla">
            <span className="sd-plantilla-nombre"><LangText es="Página de proyecto" en="Project page" /></span>
            <span className="sd-fila es-cabecera"><LangText es="Cabecera de proyecto" en="Project header" /></span>
            <span className="sd-fila"><LangText es="Rótulo + caja de papel + piezas" en="Label + paper box + pieces" /></span>
            <span className="sd-fila"><LangText es="Rótulo + caja de papel + piezas" en="Label + paper box + pieces" /></span>
            <span className="sd-fila es-recomendados"><LangText es="Proyectos recomendados" en="Featured projects" /></span>
          </div>
          <div className="sd-plantilla">
            <span className="sd-plantilla-nombre">Home</span>
            <span className="sd-fila es-cabecera"><LangText es="Cabecera del sitio" en="Site header" /></span>
            <span className="sd-fila-doble">
              <span className="sd-fila"><LangText es="Cápsulas" en="Capsules" /></span>
              <span className="sd-fila"><LangText es="Paneles" en="Panels" /></span>
            </span>
            <span className="sd-fila es-alta"><LangText es="Panel abierto" en="Open panel" /></span>
            <span className="sd-fila es-recomendados"><LangText es="Proyectos recomendados" en="Featured projects" /></span>
          </div>
        </div>
      </section>

    </>
  );
}
