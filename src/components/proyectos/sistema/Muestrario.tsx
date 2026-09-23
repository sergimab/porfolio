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

// Las tres esquinas. Se pintan con la variable puesta, así que si un día cambia
// el valor, esta muestra cambia con el sitio.
const RADIOS = [
  { v: "--r-pieza", es: "Lo que va dentro: imágenes, campos, cajas de papel", en: "What goes inside: images, fields, paper boxes" },
  { v: "--r-caja", es: "Lo que enmarca: cabecera, pie, tarjetas, marcos", en: "What frames: header, footer, cards, frames" },
  { v: "--r-pastilla", es: "Lo que tiene forma de pastilla. No es un radio, es «del todo»", en: "Anything pill-shaped. Not a radius, but «all the way»" },
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
      <h2 className="sd-nivel"><LangText es="Átomos" en="Atoms" /></h2>
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
              es="Entre apartados van **56 píxeles**; entre un rótulo y su pieza, **28**; entre piezas de una misma fila, **16**. Eran 14 en unos sitios y 16 en otros, que es la clase de diferencia que nadie ve pero que obliga a mirar el código cada vez: ahora es un solo número."
              en="Between sections, **56 pixels**; between a label and its piece, **28**; between pieces in a row, **16**. It used to be 14 in some places and 16 in others, the kind of difference nobody sees but that sends you back to the code every time: now it is one number."
            />
          </p>
          <p>
            <LangText
              es="Del redondeo había nueve medidas sueltas y ninguna regla, así que cada pieza nueva elegía la suya a ojo. Ahora son **tres tokens y una frase**, que es lo que hace que se puedan aplicar sin pensar: **el continente es más redondo que lo que contiene**. Una imagen dentro de una tarjeta lleva menos radio que la tarjeta; un campo dentro de la caja de contacto, menos que la caja."
              en="Radii were nine loose values and no rule, so every new piece picked one by eye. Now there are **three tokens and one sentence**, which is what makes them applicable without thinking: **the container is rounder than what it contains**. An image inside a card takes less radius than the card; a field inside the contact box, less than the box."
            />
          </p>
          <p>
            <LangText
              es="Queda una excepción, y a conciencia. Lo que dibuja **la interfaz de otro producto** —los mockups de teléfono, el prototipo de Elysium, el de El arte del miedo— conserva su forma, porque ahí el redondeo no es decisión de este sitio sino parte de lo que se está enseñando."
              en="One exception remains, deliberately. Anything drawing **another product's interface** — the phone mockups, the Elysium prototype, the one for El arte del miedo — keeps its own shape, because there the radius is not this site's decision but part of what is being shown."
            />
          </p>
        </TextoPapel>
        <div className="sd-radios">
          {RADIOS.map(r => (
            <div className="sd-radio" key={r.v}>
              <span className="sd-radio-caja" style={{ borderRadius: `var(${r.v})` }} />
              <code>{r.v}</code>
              <span><LangText es={r.es} en={r.en} /></span>
            </div>
          ))}
        </div>
        <div className="sd-anidado">
          <span className="sd-anidado-fuera">
            <span className="sd-anidado-dentro" />
          </span>
          <span className="sd-anidado-pie">
            <LangText
              es="Caja de 16 con una pieza de 12 dentro. Al mismo radio, la de dentro parece más cuadrada de lo que es."
              en="A 16 box with a 12 piece inside. At the same radius, the inner one looks squarer than it is."
            />
          </span>
        </div>
      </section>

      {/* ── Rejilla ─────────────────────────────────────────────────────── */}
      <section className="sd-seccion">
        <RotuloSeccion es="Rejilla" en="Grid" />
        <TextoPapel>
          <p>
            <LangText
              es="El contenido vive en una caja de **1072 píxeles como mucho**, centrada, con **24 de aire a cada lado** que no se tocan nunca. Ese aire es lo que hace que en un teléfono el texto no llegue pegado al filo del cristal, y por eso es lo único que no se recorta cuando falta sitio."
              en="Content lives in a box of **1072 pixels at most**, centred, with **24 of air on each side** that is never touched. That air is what keeps text off the edge of the glass on a phone, which is why it is the one thing that never gets trimmed when space runs short."
            />
          </p>
          <p>
            <LangText
              es="Dentro no hay una rejilla de doce columnas ni falta, porque casi nada se alinea a columnas fijas. Lo que hay son **filas que se reparten solas**: una cuadrícula que decide cuántas caben según el ancho mínimo de cada pieza. La regla al montar un apartado nuevo es esa, decir cuánto mide la pieza más estrecha y dejar que el reparto salga de ahí."
              en="Inside there is no twelve-column grid, and none is needed, because almost nothing aligns to fixed columns. What there is are **rows that share themselves out**: a grid that works out how many fit from each piece's minimum width. That is the rule when building a new section — say how narrow a piece may get and let the split follow."
            />
          </p>
          <p>
            <LangText
              es="Y **tres cortes de pantalla**, no más. **900** es donde una fila de tres pasa a dos, **700** donde el contenido se pone en una sola columna y **560** donde lo que se puede arrastrar deja de poder arrastrarse y se convierte en menú."
              en="And **three breakpoints**, no more. **900** is where a row of three becomes two, **700** where content goes to a single column, and **560** where anything draggable stops being draggable and turns into a menu."
            />
          </p>
        </TextoPapel>
        <div className="sd-rejilla">
          <span className="sd-rejilla-aire" />
          <span className="sd-rejilla-caja">
            <span className="sd-rejilla-pieza" />
            <span className="sd-rejilla-pieza" />
            <span className="sd-rejilla-pieza" />
          </span>
          <span className="sd-rejilla-aire" />
        </div>
        <span className="sd-anidado-pie">
          <LangText
            es="24 de aire, la caja del contenido y, dentro, las piezas repartiéndose lo que hay."
            en="24 of air, the content box and, inside it, the pieces sharing what there is."
          />
        </span>
      </section>

      {/* ── Trazo ───────────────────────────────────────────────────────── */}
      <section className="sd-seccion sd-atomo">
        <RotuloSeccion es="Trazo" en="Stroke" />
        <TextoPapel>
          <p>
            <LangText
              es="Dos grosores y cada uno dice una cosa. **1 px** es el filo de dentro: separa sin pesar, y lo llevan las cajas, los campos y las líneas de una tabla. **1,5 px** es el filo de fuera, el del marco que sostiene la página: la cabecera, el pie y la cápsula de volver. La diferencia es medio píxel y se nota: con 1 px, el marco se leía como una caja más de las de dentro."
              en="Two weights, each saying something. **1 px** is the inner edge: it separates without weight, and it belongs to boxes, fields and table rules. **1.5 px** is the outer edge, the frame that holds the page: header, footer and back capsule. The difference is half a pixel and it shows: at 1 px the frame read as just another inner box."
            />
          </p>
        </TextoPapel>
        <div className="sd-trazos">
          <div className="sd-trazo">
            <span className="sd-trazo-caja" style={{ borderWidth: "1px" }} />
            <span>1 px · <LangText es="filo de dentro" en="inner edge" /></span>
          </div>
          <div className="sd-trazo">
            <span className="sd-trazo-caja" style={{ borderWidth: "1.5px" }} />
            <span>1,5 px · <LangText es="marco de la página" en="page frame" /></span>
          </div>
        </div>
      </section>

      {/* ── Estados ─────────────────────────────────────────────────────── */}
      <section className="sd-seccion">
        <RotuloSeccion es="Estados" en="States" />
        <TextoPapel>
          <p>
            <LangText
              es="Todo lo que se puede tocar tiene cuatro momentos y los cuatro se dicen igual en todo el sitio. **En reposo**, filo fino y nada más. **Al acercarse**, la pieza se rellena: o se invierten papel y tinta, o se enciende el degradado de su categoría. **Al pulsar**, lo mismo un punto más apagado. Y **desactivado**, sin relleno y con el texto en gris, que es lo que hace que se lea como algo que ahora no toca."
              en="Anything you can touch has four moments, and all four are said the same way across the site. **At rest**, a thin border and nothing else. **On hover**, the piece fills: either paper and ink swap, or its category gradient lights up. **On press**, the same a notch duller. And **disabled**, unfilled with grey text, which is what makes it read as something that does not apply right now."
            />
          </p>
          <p>
            <LangText
              es="El quinto es el que más importa y el que más se olvida: **el foco**. Cuando alguien recorre el sitio con el tabulador, la pieza en la que está lleva un **aro de 2 píxeles del color de la tinta**, separado otros 2 para que se vea también sobre lo que ya tiene filo. Va puesto de serie para todo, así que una pieza nueva lo tiene sin hacer nada, y se enciende solo con el teclado, nunca al pinchar con el ratón."
              en="The fifth matters most and gets forgotten most: **focus**. When someone moves through the site with the keyboard, the piece they are on carries a **2 pixel ring in the ink colour**, offset by another 2 so it shows even over something that already has a border. It is on by default for everything, so a new piece gets it for free, and it only lights up for the keyboard, never for a mouse click."
            />
          </p>
        </TextoPapel>
        <div className="sd-estados">
          {ESTADOS.map(e => (
            <div className="sd-estado" key={e.clase}>
              <span className={`sd-estado-muestra ${e.clase}`}>
                <LangText es="Botón" en="Button" />
              </span>
              <span className="sd-estado-nombre"><LangText es={e.es} en={e.en} /></span>
              <span className="sd-estado-de"><LangText es={e.de} en={e.deEn} /></span>
            </div>
          ))}
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

      <h2 className="sd-nivel"><LangText es="Moléculas" en="Molecules" /></h2>

      <section className="sd-seccion">
        <RotuloSeccion es="Piezas de dos o tres átomos" en="Pieces of two or three atoms" />
        <TextoPapel>
          <p>
            <LangText
              es="Aquí ya hay trabajo: una pastilla con una flecha dentro **es** la cápsula de volver, y un rótulo con una línea que lo cruza **es** el que abre cada apartado. Ninguna de estas piezas decide nada por su cuenta; todas esperan a que alguien las coloque."
              en="Here there is a job being done: a pill with a chevron **is** the back capsule, and a label with a rule across **is** what opens every section. None of these decides anything on its own; they all wait to be placed."
            />
          </p>
        </TextoPapel>
        <Moleculas />
      </section>

      <h2 className="sd-nivel"><LangText es="Organismos" en="Organisms" /></h2>

      <section className="sd-seccion">
        <RotuloSeccion es="Piezas que ya funcionan solas" en="Pieces that work on their own" />
        <TextoPapel>
          <p>
            <LangText
              es="Un organismo es un conjunto de moléculas que **ya se sostiene**: se puede poner en una página y hace su trabajo sin nada más alrededor. La cabecera de un proyecto es el ejemplo claro —lleva cápsula, ficha, titular, entradilla y programas— y se repite igual en las catorce páginas."
              en="An organism is a set of molecules that **stands up by itself**: drop it on a page and it does its job with nothing else around. A project header is the clear example — capsule, meta, title, lead and tools — and it repeats identically across fourteen pages."
            />
          </p>
        </TextoPapel>
        <Organismos />
      </section>

      <h2 className="sd-nivel"><LangText es="Plantillas" en="Templates" /></h2>

      {/* ── Plantillas ──────────────────────────────────────────────────── */}
      <section className="sd-seccion">
        <RotuloSeccion es="Las dos formas de página" en="The two page shapes" />
        <TextoPapel>
          <p>
            <LangText
              es="Con los organismos ya montados, el sitio entero son **dos plantillas**. La **página de proyecto** encadena cabecera, apartados y proyectos recomendados, y cada apartado es siempre lo mismo: rótulo, caja de papel y piezas. La **home** es la otra: cabecera del sitio, caja de cápsulas con su menú de paneles al lado, el panel abierto debajo y los proyectos recomendados al final."
              en="With the organisms in place, the whole site is **two templates**. The **project page** chains header, sections and featured projects, and every section is always the same: label, paper box and pieces. The **home** is the other one: site header, capsule box with the panel menu beside it, the open panel below and featured projects at the end."
            />
          </p>
        </TextoPapel>
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

      {/* ── Accesibilidad ───────────────────────────────────────────────── */}
      <section className="sd-seccion">
        <RotuloSeccion es="Accesibilidad" en="Accessibility" />
        <TextoPapel>
          <p>
            <LangText
              es="Esto no es un apartado aparte del sistema, es lo que obliga a que varias piezas sean como son. Va junto porque suelto parecen anécdotas y junto es una decisión."
              en="This is not a section apart from the system; it is what forces several pieces to be the way they are. It goes together because apart it reads as trivia, and together it reads as a decision."
            />
          </p>
        </TextoPapel>
        <ul className="sd-fallos">
          <li>
            <strong><LangText es="El contraste manda sobre el color" en="Contrast outranks colour" /></strong>
            <LangText
              es="Las cinco manchas de cada categoría están **igualadas de luminancia**, así que el nombre en blanco encima da 5,1:1 en cualquier punto y en cualquier momento de la animación. Fotografía llevaba un ocre que no llegaba, y se resolvió cambiando la banda, no bajando la exigencia. El gris apagado se subió por lo mismo."
              en="Each category's five blobs are **matched in luminance**, so white text on top gives 5.1:1 at any point and any moment of the animation. Photography had an ochre that did not reach it, and it was fixed by changing the band, not by lowering the bar. The muted grey was raised for the same reason."
            />
          </li>
          <li>
            <strong><LangText es="Nada depende solo del color" en="Nothing depends on colour alone" /></strong>
            <LangText
              es="La categoría de un proyecto va escrita, no solo teñida. La pestaña activa además pierde el redondeo de una esquina, la ficha activa del menú invierte papel y tinta, y el proyecto en el que estás lleva su nombre en la cápsula de volver."
              en="A project's category is written, not only tinted. The active tab also drops one corner's radius, the active menu tile swaps paper and ink, and the project you are on carries its name in the back capsule."
            />
          </li>
          <li>
            <strong><LangText es="Todo se puede hacer sin ratón" en="Everything works without a mouse" /></strong>
            <LangText
              es="La caja de cápsulas hay que arrastrarla, y arrastrar no es una manera de moverse que todo el mundo tenga. Por eso existe **la variante en menú**, que no es un modo de repuesto sino la misma puerta por otro lado. La galería se abre con Intro y se cierra con Escape, y al cerrarse el foco vuelve a la foto desde la que se abrió."
              en="The capsule box has to be dragged, and dragging is not a way of moving everyone has. That is why **the menu variant** exists — not a fallback but the same door from another side. The gallery opens with Enter and closes with Escape, and on closing the focus returns to the photo it opened from."
            />
          </li>
          <li>
            <strong><LangText es="Si el sistema pide quietud, hay quietud" en="If the system asks for stillness, there is stillness" /></strong>
            <LangText
              es="Con el ajuste de reducir movimiento puesto, las transiciones se cortan y los bucles se paran. La única excepción del sitio es el carrusel de Tokio, donde el movimiento no es un adorno encima del contenido sino el contenido mismo, y pararlo sería dejar la mitad de las fotos sin enseñar."
              en="With reduced motion on, transitions are cut and loops stop. The site's single exception is the Tokio carousel, where motion is not decoration over the content but the content itself, and stopping it would leave half the photos unseen."
            />
          </li>
          <li>
            <strong><LangText es="Las imágenes no dicen lo que ya está escrito" en="Images do not repeat what is already written" /></strong>
            <LangText
              es="La portada de una tarjeta va **sin texto alternativo a propósito**, porque el nombre del proyecto está escrito justo debajo y un lector de pantalla lo diría dos veces. Lo decorativo se marca como decorativo; lo que aporta algo, se describe."
              en="A card's cover carries **no alt text on purpose**, because the project name is written right below it and a screen reader would say it twice. Decorative things are marked as decorative; anything that adds meaning is described."
            />
          </li>
        </ul>
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
            <strong><LangText es="Doce cortes de pantalla para tres sitios" en="Twelve breakpoints for three places" /></strong>
            <LangText
              es="El sistema dice **900, 700 y 560**, y la hoja de estilos tiene además 1024, 900, 860, 820, 768, 760, 720, 640, 600 y 520. Ninguno está mal por sí solo —cada uno salió de mirar una pieza concreta—, pero significa que dos cosas que deberían cambiar a la vez cambian con veinte píxeles de diferencia, y eso sí se ve."
              en="The system says **900, 700 and 560**, and the stylesheets also hold 1024, 900, 860, 820, 768, 760, 720, 640, 600 and 520. None is wrong on its own — each came from looking at one piece — but it means two things that should change together change twenty pixels apart, and that does show."
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
