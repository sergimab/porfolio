"use client";

import TextoPapel from "@/components/shared/TextoPapel";
import LangText from "@/components/shared/LangText";
import RotuloSeccion from "@/components/shared/RotuloSeccion";
import DropcapTitle from "@/components/shared/DropcapTitle";
import BackCapsule from "@/components/shared/BackCapsule";
import ToolIcons from "@/components/shared/ToolIcons";
import MeshGradient from "@/components/shared/MeshGradient";
import { CATEGORIAS } from "@/components/shared/proyectos";
import { paletaLegible, paletaClara, degradadoLegible, degradadoClaro, CAPSULE_DRIFT_SIZE, drift } from "@/components/shared/organico";

// LAS MUESTRAS SE PINTAN CON EL SISTEMA, no lo describen.
//
// Cada muestra de color es un cuadrado con la variable de verdad puesta como
// fondo; cada componente es el componente, no una copia. Así el muestrario no
// puede quedarse desfasado: si alguien cambia un token o retoca una pieza, esta
// página lo enseña al recargar.

// Los cinco tokens de color. El texto de cada uno explica para qué sirve, que
// es lo que de verdad hace falta saber: el valor se ve al lado.
const TOKENS = [
  { v: "--background", es: "Papel", en: "Paper", uso: { es: "El fondo de todo. Cambia entero en modo oscuro.", en: "The background of everything. Flips in dark mode." } },
  { v: "--foreground", es: "Tinta", en: "Ink", uso: { es: "El texto y los trazos. Es el contrario del papel.", en: "Text and strokes. The opposite of the paper." } },
  { v: "--muted", es: "Apagado", en: "Muted", uso: { es: "Lo secundario: la hora, los pies, las etiquetas.", en: "Secondary matter: the clock, captions, labels." } },
  { v: "--border", es: "Filo", en: "Border", uso: { es: "Las líneas que separan sin llamar la atención.", en: "Lines that separate without calling attention." } },
  // Contado uno a uno: de sus diez usos, nueve son el hueco de una imagen. Es
  // lo que hace de verdad, y el muestrario tiene que decir eso y no lo que nos
  // gustaría que hiciera.
  { v: "--surface", es: "Relieve", en: "Surface", uso: { es: "El hueco de una imagen mientras carga, para que no destelle en blanco.", en: "An image's slot while it loads, so it does not flash white." } },
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

export default function Muestrario() {
  return (
    <>
      {/* ── Color ───────────────────────────────────────────────────────── */}
      <section className="sd-seccion">
        <RotuloSeccion es="Color" en="Colour" />
        <TextoPapel>
          <p>
            <LangText
              es="Cinco tokens y ni uno más. El sitio entero se pinta con **papel, tinta, apagado, filo y relieve**, y el modo oscuro no es otra paleta: son **los mismos cinco nombres con otros valores**, así que ninguna pieza necesita saber en qué modo está."
              en="Five tokens and not one more. The whole site is painted with **paper, ink, muted, border and surface**, and dark mode is not another palette: it is **the same five names with different values**, so no component needs to know which mode it is in."
            />
          </p>
        </TextoPapel>
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

        <h3 className="sd-subrotulo"><LangText es="Los siete colores de categoría" en="The seven category colours" /></h3>
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
        <RotuloSeccion es="Tipografía" en="Typography" />
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

        <h3 className="sd-subrotulo"><LangText es="La escala" en="The scale" /></h3>
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
        <RotuloSeccion es="Espacio y forma" en="Space and shape" />
        <TextoPapel>
          <p>
            <LangText
              es="Entre apartados van **56 píxeles**; entre un rótulo y su pieza, **28**; entre piezas de una misma fila, **14 o 16**. Y el redondeo tiene un sentido: **12** para las cajas de papel, **14 y 16** para las tarjetas y los marcos, y **999** para todo lo que es una pastilla."
              en="Between sections, **56 pixels**; between a label and its piece, **28**; between pieces in a row, **14 or 16**. Radii carry meaning too: **12** for paper boxes, **14 and 16** for cards and frames, **999** for anything shaped like a pill."
            />
          </p>
        </TextoPapel>
        <div className="sd-radios">
          {[12, 14, 16, 999].map(r => (
            <div className="sd-radio" key={r}>
              <span className="sd-radio-caja" style={{ borderRadius: r === 999 ? "999px" : `${r}px` }} />
              <span>{r === 999 ? "999" : r}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Componentes ─────────────────────────────────────────────────── */}
      <section className="sd-seccion">
        <RotuloSeccion es="Componentes" en="Components" />
        <TextoPapel>
          <p>
            <LangText
              es="Los de aquí abajo **no son dibujos de los componentes, son los componentes**, traídos de la misma carpeta que los usa el resto del sitio. Cualquier retoque en ellos se ve aquí sin tocar esta página."
              en="The ones below **are not drawings of the components, they are the components**, pulled from the same folder the rest of the site uses. Any tweak to them shows up here without touching this page."
            />
          </p>
        </TextoPapel>
        <div className="sd-piezas">
          <div className="sd-pieza">
            <span className="sd-pieza-nombre"><LangText es="Cápsula de volver" en="Back capsule" /></span>
            <BackCapsule category="uiux" />
          </div>
          <div className="sd-pieza">
            <span className="sd-pieza-nombre"><LangText es="Rótulo de apartado" en="Section label" /></span>
            <RotuloSeccion es="Componentes" en="Components" />
          </div>
          <div className="sd-pieza">
            <span className="sd-pieza-nombre"><LangText es="Titular con capitular" en="Drop-cap title" /></span>
            <span className="sd-pieza-titular"><DropcapTitle es="Proyectos" en="Projects" /></span>
          </div>
          <div className="sd-pieza">
            <span className="sd-pieza-nombre"><LangText es="Programas" en="Tools" /></span>
            <ToolIcons tools={["Figma", "Photoshop", "After Effects"]} />
          </div>
        </div>
      </section>

      {/* ── Movimiento ──────────────────────────────────────────────────── */}
      <section className="sd-seccion">
        <RotuloSeccion es="Movimiento" en="Motion" />
        <TextoPapel>
          <p>
            <LangText
              es="Tres duraciones para casi todo: **0,2 s** para un cambio de color, **0,3 a 0,45** para algo que se mueve o crece, y **de 7 s en adelante** para lo que respira en bucle. La curva de las dos primeras es siempre la misma, una salida suave; las de bucle van **lineales**, porque cualquier aceleración delata el punto donde la animación vuelve a empezar."
              en="Three durations for nearly everything: **0.2 s** for a colour change, **0.3 to 0.45** for something that moves or grows, and **7 s upwards** for anything breathing on a loop. The first two always use the same easing; loops run **linear**, because any acceleration gives away the point where the animation restarts."
            />
          </p>
          <p>
            <LangText
              es="Y una regla de fondo: **si el sistema pide que nada se mueva, nada se mueve**. La única excepción de todo el sitio es el carrusel de la galería de Tokio, donde el movimiento no es un adorno sobre el contenido sino el contenido mismo."
              en="And one rule underneath: **if the system asks for no motion, nothing moves**. The single exception in the whole site is the Tokio gallery carousel, where motion is not decoration over the content but the content itself."
            />
          </p>
        </TextoPapel>
      </section>

      {/* ── Lo que no cuadra ────────────────────────────────────────────── */}
      <section className="sd-seccion">
        <RotuloSeccion es="Lo que no cuadra" en="What does not add up" />
        <TextoPapel>
          <p>
            <LangText
              es="Poner el sistema junto sirve sobre todo para ver dónde se ha ido de las manos. Esto es lo que hay hoy, contado de la hoja de estilos y sin maquillar:"
              en="Putting the system together is above all a way to see where it got away from us. This is what there is today, counted from the stylesheet and not dressed up:"
            />
          </p>
        </TextoPapel>
        <ul className="sd-fallos">
          <li className="es-resuelto">
            <strong><LangText es="Nueve redondeos distintos · resuelto" en="Nine different radii · fixed" /></strong>
            <LangText
              es="Andaban sueltos el 8, el 9, el 10, el 14 y el 99 además de los buenos. Ya no: todo lo que era 10 o menos pasó a **12** y todo lo que era 14 pasó a **16**, así que la escala son **59 doces, 38 dieciséis y 20 pastillas**. Quedan fuera a propósito los mockups de teléfono —44 y 34 son el redondeo de un aparato de verdad— y la web de Elysium, que es la interfaz de otra marca dentro del sitio."
              en="8, 9, 10, 14 and 99 were floating around alongside the real ones. Not any more: everything at 10 or below became **12** and everything at 14 became **16**, so the scale is now **59 twelves, 38 sixteens and 20 pills**. Deliberately outside it: the phone mockups — 44 and 34 are a real device's radius — and the Elysium website, another brand's interface living inside this site."
            />
          </li>
          <li>
            <strong><LangText es="Medios píxeles en la escala de letra" en="Half pixels in the type scale" /></strong>
            <LangText
              es="Junto a los tamaños de la escala conviven un 13,5, un 12,5, un 11,5 y un 10,5. Salieron de ajustar a ojo un bloque concreto, y cada uno es una excepción que alguien tendrá que recordar."
              en="Alongside the scale sizes live a 13.5, a 12.5, an 11.5 and a 10.5. Each came from eyeballing one particular block, and each is an exception someone will have to remember."
            />
          </li>
          <li className="es-resuelto">
            <strong><LangText es="La caja de papel, escrita cuatro veces · resuelto" en="The paper box, written four times · fixed" /></strong>
            <LangText
              es="El texto sobre papel opaco —el que impide que la trama del fondo compita con la lectura— estaba copiado en cuatro sitios con cuatro nombres, las mismas medidas y el mismo comentario. Ahora es **un componente**, y el texto que estás leyendo va dentro de él."
              en="The text-on-opaque-paper treatment — the one that stops the background pattern competing with reading — was copied in four places under four names, same measurements and same comment. It is now **one component**, and the text you are reading sits inside it."
            />
          </li>
          <li>
            <strong><LangText es="Dos maneras de recomendar" en="Two ways of recommending" /></strong>
            <LangText
              es="Hasta hace poco, la home enseñaba proyectos con un abanico de tarjetas y las páginas con banners anchos. Eran dos piezas para el mismo trabajo. Ya es una sola, y es el ejemplo de lo que esta página viene a provocar."
              en="Until recently the home showed projects as a fan of cards and the project pages as wide banners: two pieces doing one job. It is now a single one, and it is the example of what this page is meant to provoke."
            />
          </li>
        </ul>
      </section>
    </>
  );
}
