"use client";

import LangText from "@/components/shared/LangText";
import RotuloSeccion from "@/components/shared/RotuloSeccion";
import DropcapTitle from "@/components/shared/DropcapTitle";
import BackCapsule from "@/components/shared/BackCapsule";
import ToolIcons from "@/components/shared/ToolIcons";
import TextoPapel from "@/components/shared/TextoPapel";
import Pieza from "./Pieza";

// LAS MOLÉCULAS: dos o tres átomos juntos haciendo un trabajo.
//
// Todas las de aquí abajo son las piezas de verdad, importadas de la carpeta
// compartida. Las dos únicas que se dibujan a mano son las pastillas de la
// cabecera y las pestañas, porque viven dentro de componentes grandes y no
// existen sueltas; en su ficha se dice.
export default function Moleculas() {
  return (
    <div className="sd-piezas">
      <Pieza
        nombre="Cápsula de volver"
        nombreEn="Back capsule"
        de="Pastilla + flecha + tono de su categoría."
        deEn="Pill + chevron + its category hue."
      >
        <BackCapsule category="uiux" muestra />
      </Pieza>

      <Pieza
        nombre="Rótulo de apartado"
        nombreEn="Section label"
        de="Pastilla + línea a todo el ancho. Abre cada apartado."
        deEn="Pill + a rule across the width. It opens every section."
      >
        <RotuloSeccion es="Componentes" en="Components" />
      </Pieza>

      <Pieza
        nombre="Titular con capitular"
        nombreEn="Drop-cap title"
        de="Caligráfica en la primera letra + versales en el resto."
        deEn="Script on the first letter + small caps on the rest."
      >
        <span className="sd-muestra-titular"><DropcapTitle es="Proyectos" en="Projects" /></span>
      </Pieza>

      <Pieza
        nombre="Hecho con"
        nombreEn="Made with"
        de="Rótulo + iconos de 24 a trazo 1,5. Toman su color de marca al acercarse."
        deEn="Label + 24px icons at 1.5 stroke. Brand-coloured on hover."
      >
        <ToolIcons tools={["Figma", "Photoshop", "After Effects"]} />
      </Pieza>

      <Pieza
        nombre="Fila de ficha"
        nombreEn="Meta row"
        de="Clave en sans + valor en cursiva."
        deEn="Key in sans + value in italic."
      >
        <div className="project-meta sd-muestra-meta">
          <div className="project-meta-row">
            <span className="project-meta-key"><LangText es="Tipo" en="Type" /></span>
            <span><LangText es="Disciplina del proyecto" en="Project discipline" /></span>
          </div>
          <div className="project-meta-row">
            <span className="project-meta-key"><LangText es="Cliente" en="Client" /></span>
            <span><LangText es="Nombre del cliente" en="Client name" /></span>
          </div>
        </div>
      </Pieza>

      <Pieza
        nombre="Caja de papel"
        nombreEn="Paper box"
        de="Papel opaco para que la trama del fondo no compita con la lectura."
        deEn="Opaque paper so the background pattern does not compete with reading."
        ancha
      >
        <TextoPapel>
          <p>
            <LangText
              es="Este párrafo va dentro de la pieza, no dentro de una copia suya."
              en="This paragraph sits inside the component, not inside a copy of it."
            />
          </p>
        </TextoPapel>
      </Pieza>

      <Pieza
        nombre="Pastillas de la cabecera"
        nombreEn="Header toggles"
        de="Dos estados en una pastilla: lo activo va en tinta y lo demás en apagado. Dibujadas."
        deEn="Two states in one pill: active in ink, the rest muted. Drawn here."
      >
        <div className="sd-muestra-toggles">
          <span className="sd-toggle-tema"><span className="sd-toggle-bola" /></span>
          <span className="sd-toggle-idioma">
            <b>ES</b><i>/</i><span>EN</span>
          </span>
        </div>
      </Pieza>

      <Pieza
        nombre="Pestañas"
        nombreEn="Tabs"
        de="La activa pierde el redondeo de esa esquina y se une a la caja. Dibujadas."
        deEn="The active one drops that corner and joins the box. Drawn here."
        ancha
      >
        <div className="sd-muestra-tabs">
          <span className="sd-muestra-tabs-fila">
            <span className="sd-tab es-activa"><LangText es="Título 1" en="Title 1" /></span>
            <span className="sd-tab"><LangText es="Título 2" en="Title 2" /></span>
          </span>
          <span className="sd-tab-caja" />
        </div>
      </Pieza>
    </div>
  );
}
