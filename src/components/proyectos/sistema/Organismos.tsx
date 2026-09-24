"use client";

import { useState } from "react";
import LangText from "@/components/shared/LangText";
import BackCapsule from "@/components/shared/BackCapsule";
import DropcapTitle from "@/components/shared/DropcapTitle";
import ToolIcons from "@/components/shared/ToolIcons";
import Recomendados from "@/components/shared/Recomendados";
import BounceCards from "@/components/home/BounceCards";
import { CATEGORIAS } from "@/components/shared/proyectos";
import { degradadoLegible, degradadoClaro } from "@/components/shared/organico";
import Pieza from "./Pieza";

// LOS ORGANISMOS: moléculas montadas en una pieza que ya hace algo por sí sola.
//
// La cabecera de proyecto se enseña VIVA y con sus clases de verdad —las mismas
// que usan las catorce páginas—, así que lo que se ve aquí es exactamente lo
// que se ve allí. Las que no se pueden traer enteras —la cabecera del sitio, el
// pie, la caja de cápsulas— se cuentan en un esquema con las medidas reales, y
// su ficha lo dice para que nadie las tome por una captura.

// Tres tarjetas genéricas para la muestra, cada una con el tono de una
// disciplina distinta: es lo que hace ver que el aro es lo que las separa.
// Los tres repartos que tiene el banner, con lo que cambia en cada uno.
const REPARTOS = [
  { n: 1, es: "Uno", en: "One", de: "Uno solo se queda con el ancho entero. El alto de la portada no cambia, así que se lee como una franja ancha en vez de como una tarjeta estirada.", deEn: "A single one takes the whole width. Cover height does not change, so it reads as a wide strip rather than a stretched card." },
  { n: 2, es: "Dos", en: "Two", de: "Hasta tres, los banners se reparten el ancho de la página: el alto es fijo y el ancho, lo que toque.", deEn: "Up to three, banners share the page width: height is fixed and width is whatever is left." },
  { n: 3, es: "Tres", en: "Three", de: "Tres es el tope del reparto. El alto de la portada no cambia con el número, y por eso uno solo y tres seguidos se leen como la misma pieza.", deEn: "Three is the limit. Cover height does not change with the count, which is why one and three read as the same piece." },
  { n: 6, es: "Más de tres", en: "More than three", de: "De cuatro en adelante todos miden lo mismo y la fila se desplaza de lado, con su barra a la vista. Repartir seis en el ancho de una página los dejaría en nada.", deEn: "From four on, all are the same width and the row scrolls sideways with a visible bar. Sharing six across a page would leave them as nothing." },
];

const CARDS = [
  { id: "card-1", title: "Nombre del proyecto", titleEn: "Project name", hue: 175 },
  { id: "card-2", title: "Nombre del proyecto", titleEn: "Project name", hue: 330 },
  { id: "card-3", title: "Nombre del proyecto", titleEn: "Project name", hue: 217 },
];

export default function Organismos() {
  // La categoría de la muestra. Se puede cambiar porque la cabecera es la MISMA
  // pieza en las catorce páginas y lo único que la diferencia es el tono: verlo
  // cambiar es entender de golpe qué parte del sistema es el color.
  const [cat, setCat] = useState(CATEGORIAS.find(c => c.id === "uiux") ?? CATEGORIAS[0]);
  // Cuántos banners se enseñan. Son tres piezas distintas de mirar pero una
  // sola de código, así que van en una ficha con un conmutador y no en tres.
  const [reparto, setReparto] = useState(1);

  return (
    <>
      <div className="sd-piezas">
        <Pieza
          nombre="Cabecera de proyecto"
          nombreEn="Project header"
          de="Caja con el tinte de la categoría + cápsula de volver + ficha + titular con capitular + entradilla + hecho con. Es la pieza que abre las catorce páginas de proyecto, y va con sus clases de verdad. Los discos de al lado cambian la categoría: lo que se mueve con ella es el tinte de la caja y la cápsula de volver, nada más."
          deEn="Tinted box + back capsule + meta + drop-cap title + lead + made-with. It opens all fourteen project pages, and it runs on its real classes. The discs beside it switch category: what moves with it is the box tint and the back capsule, nothing else."
          ancha
        >
          <div className="sd-hero-fila">
            <div className="sd-hero" style={{ ["--hero-hue" as string]: cat.hue }}>
              <div className="project-hero-box">
                <span className="project-back"><BackCapsule category={cat.id} /></span>
                <div className="project-meta">
                  <div className="project-meta-row">
                    <span className="project-meta-key"><LangText es="Tipo" en="Type" /></span>
                    <span><LangText es="Disciplina del proyecto" en="Project discipline" /></span>
                  </div>
                </div>
              </div>
              <h4 className="sd-hero-titulo">
                <DropcapTitle es="Nombre del proyecto" en="Project name" />
              </h4>
              <div className="project-introrow">
                <p className="project-intro">
                  <LangText
                    es="La entradilla va en **columna corta y renglón apretado**, que es lo que hace que se lea de un golpe de vista."
                    en="The lead sits in a **short column with tight leading**, which is what makes it read in one go."
                  />
                </p>
                <ToolIcons tools={["Photoshop", "Illustrator"]} />
              </div>
            </div>
            <div className="sd-discos" role="group" aria-label="Categoría">
              {CATEGORIAS.map(c => (
                <button
                  key={c.id}
                  type="button"
                  className={`sd-disco${c.id === cat.id ? " es-activo" : ""}`}
                  style={{ backgroundImage: c.claro ? degradadoClaro(c.hue) : degradadoLegible(c.hue) }}
                  aria-pressed={c.id === cat.id}
                  onClick={() => setCat(c)}
                >
                  <span className="sr-only">{c.label}</span>
                </button>
              ))}
            </div>
          </div>
        </Pieza>

        <Pieza
          nombre="Tarjeta de proyecto"
          nombreEn="Project card"
          de="La tarjeta de verdad, la que sale al elegir una disciplina en la home, con su abanico y su empuje al pasar por encima. Es cuadrada contando la banda, así que la portada es siempre 5:4, y el filo va de degradado y no de color plano porque en la parrilla hay varias juntas y el aro es lo que las distingue de un vistazo. Aquí se enseña reducida, pero es el mismo componente."
          deEn="The real card, the one that appears when you pick a discipline on the home, with its fan and its push on hover. It is square counting the band, so the cover is always 5:4, and its border is a gradient rather than a flat colour because in the grid there are several together and the ring is what tells them apart. Shown scaled down here, but it is the same component."
          ancha
        >
          <div className="sd-abanico">
            <BounceCards items={CARDS} lang="es" hue={175} muestra animationDelay={0} />
          </div>
        </Pieza>
        <Pieza
          nombre="Banner de destacados"
          nombreEn="Featured banner"
          de="Otra pieza, no la tarjeta: esto solo aparece en «Proyectos recomendados», al pie de la home y de cada página de proyecto. Es apaisado, con la portada de alto fijo, el filo del color de su categoría y la banda con su degradado debajo. Lo que cambia con el número es el reparto, y por eso se elige aquí."
          deEn="A different piece, not the card: this only appears under «Featured projects», at the foot of the home and of every project page. It is landscape, with a fixed-height cover, a border in its category colour and the gradient band below. What changes with the count is how they share the width, which is why it is picked here."
          ancha
        >
          <div className="sd-conmutador">
            <div className="sd-botones" role="group">
              {REPARTOS.map(r => (
                <button
                  key={r.n}
                  type="button"
                  className={`sd-boton${r.n === reparto ? " es-activo" : ""}`}
                  aria-pressed={r.n === reparto}
                  onClick={() => setReparto(r.n)}
                >
                  <LangText es={r.es} en={r.en} />
                </button>
              ))}
            </div>
            <Recomendados
              ids={[]}
              muestra={reparto}
              titulo={{ es: "", en: "" }}
              className="sd-sin-titulo"
            />
            <span className="sd-conmutador-pie">
              <LangText es={REPARTOS.find(r => r.n === reparto)!.de} en={REPARTOS.find(r => r.n === reparto)!.deEn} />
            </span>
          </div>
        </Pieza>

      </div>

      <div className="sd-piezas">
        <Pieza
          nombre="Cabecera del sitio"
          nombreEn="Site header"
          de="Esquema, no la pieza: la de verdad va pegada arriba y aquí se saldría de su marco. Barra con trazo de 1,5 y redondeo solo abajo, porque cuelga del filo de la ventana: saludo con la máquina de escribir a la izquierda, hora y fecha en el centro y las dos pastillas a la derecha."
          deEn="A schematic, not the piece: the real one sticks to the top and would escape this frame. A 1.5 stroke bar rounded only at the bottom, because it hangs from the window's edge: typewriter greeting on the left, time and date in the middle, the two toggles on the right."
          ancha
        >
          <div className="sd-esquema sd-esquema-cabecera">
            <span className="sd-bloque" style={{ width: 132 }} />
            <span className="sd-esquema-centro">
              <span className="sd-bloque" style={{ width: 54 }} />
              <span className="sd-bloque es-suave" style={{ width: 78 }} />
            </span>
            <span className="sd-esquema-dcha">
              <span className="sd-bloque es-pastilla" style={{ width: 56 }} />
              <span className="sd-bloque es-pastilla" style={{ width: 70 }} />
            </span>
          </div>
        </Pieza>

        <Pieza
          nombre="Pie"
          nombreEn="Footer"
          de="Esquema. La misma barra que la cabecera pero del revés —redondeada solo por arriba— con el aviso legal, los tres iconos sociales y los derechos."
          deEn="A schematic. The same bar as the header but inverted — rounded only on top — with the legal note, the three social icons and the rights line."
          ancha
        >
          <div className="sd-esquema sd-esquema-pie">
            <span className="sd-bloque es-suave" style={{ width: 118 }} />
            <span className="sd-esquema-centro">
              <span className="sd-bloque es-icono" />
              <span className="sd-bloque es-icono" />
              <span className="sd-bloque es-icono" />
            </span>
            <span className="sd-bloque es-suave" style={{ width: 96 }} />
          </div>
        </Pieza>

        <Pieza
          nombre="Caja de cápsulas"
          nombreEn="Capsule box"
          de="Esquema: la de verdad lleva un motor de física y hay que arrastrarla. Siete cápsulas que caen y se apilan, una zona de soltar marcada con línea de puntos y, arriba a la izquierda, el botón que cambia a la variante de menú."
          deEn="A schematic: the real one runs a physics engine and has to be dragged. Seven capsules that fall and pile up, a dashed drop zone, and the button top-left that switches to the menu variant."
        >
          <div className="sd-esquema sd-esquema-capsulas">
            <span className="sd-capsula" style={{ transform: "rotate(-4deg)" }}>Branding</span>
            <span className="sd-capsula" style={{ transform: "rotate(3deg)" }}>Motion</span>
            <span className="sd-capsula" style={{ transform: "rotate(-2deg)" }}>3D</span>
            <span className="sd-soltar"><LangText es="Arrastra aquí" en="Drop here" /></span>
          </div>
        </Pieza>

        <Pieza
          nombre="Variante en menú"
          nombreEn="Menu variant"
          de="La misma caja sin física: una cuadrícula de dos columnas donde cada casilla se pinta entera del color de su categoría al pasar por encima. No es un modo de repuesto, es la puerta para quien no puede arrastrar."
          deEn="The same box without physics: a two-column grid where each cell fills with its category colour on hover. Not a fallback, but the door for anyone who cannot drag."
        >
          <div className="sd-esquema sd-esquema-menu">
            <span className="sd-casilla">Branding</span>
            <span className="sd-casilla es-viva">Motion</span>
            <span className="sd-casilla">3D</span>
            <span className="sd-casilla">UI / UX</span>
          </div>
        </Pieza>

        <Pieza
          nombre="Menú de paneles"
          nombreEn="Panel menu"
          de="Tres fichas altas —sobre mí, currículum y contacto— dentro del mismo marco que la caja de cápsulas. La activa se invierte: papel y tinta cambian de sitio."
          deEn="Three tall tiles — about, CV and contact — inside the same frame as the capsule box. The active one inverts: paper and ink swap."
        >
          <div className="sd-esquema sd-esquema-paneles">
            <span className="sd-ficha"><LangText es="Sobre mí" en="About" /></span>
            <span className="sd-ficha">CV</span>
            <span className="sd-ficha es-activa"><LangText es="Contacto" en="Contact" /></span>
          </div>
        </Pieza>

        <Pieza
          nombre="Caja de contacto"
          nombreEn="Contact box"
          de="Titular con capitular + los dos atajos que se abren al acercarse + tres campos y el botón de enviar. Los campos llevan filo fino y el mismo redondeo que las cajas de papel."
          deEn="Drop-cap title + the two shortcuts that open on hover + three fields and the send button. Fields use the thin border and the same radius as paper boxes."
        >
          <div className="sd-esquema sd-esquema-contacto">
            <span className="sd-esquema-fila">
              <span className="sd-bloque" style={{ width: 96 }} />
              <span className="sd-esquema-dcha">
                <span className="sd-bloque es-disco" />
                <span className="sd-bloque es-disco" />
              </span>
            </span>
            <span className="sd-campo" />
            <span className="sd-campo" />
            <span className="sd-campo es-alto" />
            <span className="sd-bloque es-pastilla" style={{ width: 74, height: 30 }} />
          </div>
        </Pieza>
      </div>
    </>
  );
}
