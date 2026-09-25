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
import Movil from "@/components/shared/Movil";

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
          de="Caja tintada + cápsula + ficha + titular + entradilla + hecho con. Los discos cambian de categoría."
          deEn="Tinted box + capsule + meta + title + lead + made-with. The discs switch category."
          ancha
        >
          <div className="sd-hero-fila">
            <div className="sd-hero" style={{ ["--hero-hue" as string]: cat.hue }}>
              <div className="project-hero-box">
                <span className="project-back"><BackCapsule category={cat.id} muestra /></span>
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
          de="Cuadrada contando la banda, así la portada es siempre 5:4. El aro va de degradado, que es lo que distingue una categoría de otra."
          deEn="Square counting the band, so the cover is always 5:4. The ring is a gradient, which is what tells one category from another."
          ancha
        >
          <div className="sd-abanico">
            <BounceCards items={CARDS} lang="es" hue={175} muestra animationDelay={0} />
          </div>
        </Pieza>
        <Pieza
          nombre="Banner de destacados"
          nombreEn="Featured banner"
          de="Apaisado, solo para «Proyectos recomendados». Lo que cambia con el número es el reparto."
          deEn="Landscape, only for «Featured projects». What changes with the count is how they share the width."
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
            <Recomendados ids={[]} muestra={reparto} className="sd-rec" />
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
          de="Esquema. Trazo de 1,5 y redondeo solo abajo, porque cuelga del filo de la ventana."
          deEn="A schematic. 1.5 stroke, rounded only at the bottom, because it hangs from the window's edge."
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
          de="Esquema. La misma barra del revés, redondeada solo por arriba."
          deEn="A schematic. The same bar inverted, rounded only on top."
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
          nombre="Mockup de móvil"
          nombreEn="Phone mockup"
          de="Dibujado en CSS, no una imagen. Uno solo para las newsletters y las dos apps; cada una le pasa su ancho, su proporción y su muesca."
          deEn="Drawn in CSS, not an image. One for the newsletters and both apps; each passes its own width, ratio and notch."
        >
          <div className="sd-movil">
            <Movil />
          </div>
        </Pieza>

        <Pieza
          nombre="Caja de cápsulas"
          nombreEn="Capsule box"
          de="Esquema: la de verdad lleva física y se arrastra. Siete cápsulas, una zona de soltar y el botón que la cambia a menú."
          deEn="A schematic: the real one runs physics and is dragged. Seven capsules, a drop zone and the button that switches it to a menu."
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
          de="La misma caja sin física. No es un repuesto: es la puerta para quien no puede arrastrar."
          deEn="The same box without physics. Not a fallback: the door for anyone who cannot drag."
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
          de="Tres fichas altas. La activa invierte papel y tinta."
          deEn="Three tall tiles. The active one swaps paper and ink."
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
          de="Titular + los dos atajos + tres campos y enviar."
          deEn="Title + the two shortcuts + three fields and send."
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
