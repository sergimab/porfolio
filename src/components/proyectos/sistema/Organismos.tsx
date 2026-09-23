"use client";

import LangText from "@/components/shared/LangText";
import BackCapsule from "@/components/shared/BackCapsule";
import ToolIcons from "@/components/shared/ToolIcons";
import Recomendados from "@/components/shared/Recomendados";
import Pieza from "./Pieza";

// LOS ORGANISMOS: moléculas montadas en una pieza que ya hace algo por sí sola.
//
// La cabecera de proyecto se enseña VIVA y con sus clases de verdad —las mismas
// que usan las catorce páginas—, así que lo que se ve aquí es exactamente lo
// que se ve allí. Las que no se pueden traer enteras —la cabecera del sitio, el
// pie, la caja de cápsulas— se cuentan en un esquema con las medidas reales, y
// su ficha lo dice para que nadie las tome por una captura.
export default function Organismos() {
  return (
    <>
      <div className="sd-piezas">
        <Pieza
          nombre="Cabecera de proyecto"
          nombreEn="Project header"
          de="Caja con el tinte de la categoría + cápsula de volver + ficha + titular con capitular + entradilla + hecho con. Es la pieza que abre las catorce páginas de proyecto, y va con sus clases de verdad."
          deEn="Tinted box + back capsule + meta + drop-cap title + lead + made-with. It opens all fourteen project pages, and it runs on its real classes."
          ancha
        >
          <div className="sd-hero" style={{ ["--hero-hue" as string]: 32 }}>
            <div className="project-hero-box">
              <span className="project-back"><BackCapsule category="fotografia" /></span>
              <div className="project-meta">
                <div className="project-meta-row">
                  <span className="project-meta-key"><LangText es="Tipo" en="Type" /></span>
                  <span><LangText es="Disciplina del proyecto" en="Project discipline" /></span>
                </div>
              </div>
            </div>
            <p className="sd-hero-titulo"><LangText es="Nombre del proyecto" en="Project name" /></p>
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
        </Pieza>

        <Pieza
          nombre="Tarjeta de proyecto"
          nombreEn="Project card"
          de="Portada de alto fijo + banda con el degradado de su categoría. La banda va DEBAJO y no encima, para que la portada se vea entera y no haya que componerla dejando hueco. La foto y el nombre de aquí son genéricos, para que se mire la forma y no el proyecto."
          deEn="Fixed-height cover + a band with its category gradient. The band sits BELOW, not over, so the cover is seen whole and need not be composed around it. The photo and name here are placeholders, so what is read is the shape and not the project."
          ancha
        >
          <Recomendados ids={[]} muestra titulo={{ es: "", en: "" }} className="sd-sin-titulo" />
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
