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
        de="Pastilla + flecha + tono de categoría. Al acercarse se rellena del degradado de su disciplina."
        deEn="Pill + chevron + category hue. On hover it fills with its discipline's gradient."
      >
        <BackCapsule category="uiux" />
      </Pieza>

      <Pieza
        nombre="Rótulo de apartado"
        nombreEn="Section label"
        de="Pastilla + línea que cruza el ancho. Abre cada apartado de una página de proyecto."
        deEn="Pill + a rule across the width. It opens every section of a project page."
      >
        <RotuloSeccion es="Componentes" en="Components" />
      </Pieza>

      <Pieza
        nombre="Titular con capitular"
        nombreEn="Drop-cap title"
        de="Caligráfica en la primera letra + versales en el resto. Es el único sitio donde aparece la tercera letra."
        deEn="Script on the first letter + small caps on the rest. The only place the third typeface appears."
      >
        <span className="sd-muestra-titular"><DropcapTitle es="Proyectos" en="Projects" /></span>
      </Pieza>

      <Pieza
        nombre="Hecho con"
        nombreEn="Made with"
        de="Rótulo + iconos de 24 con trazo de 1,5. En reposo van del gris apagado y al acercarse toman el color de su marca."
        deEn="Label + 24px icons at 1.5 stroke. Muted at rest, brand-coloured on hover."
      >
        <ToolIcons tools={["Figma", "Photoshop", "After Effects"]} />
      </Pieza>

      <Pieza
        nombre="Fila de ficha"
        nombreEn="Meta row"
        de="Clave en sans + valor en la cursiva. Es lo que llena la ficha de la cabecera de cada proyecto."
        deEn="Key in sans + value in italic. It fills the meta block of every project header."
      >
        <div className="project-meta sd-muestra-meta">
          <div className="project-meta-row">
            <span className="project-meta-key"><LangText es="Tipo" en="Type" /></span>
            <span><LangText es="Sistema de diseño" en="Design system" /></span>
          </div>
          <div className="project-meta-row">
            <span className="project-meta-key"><LangText es="Cliente" en="Client" /></span>
            <span>Orquesta Tokio</span>
          </div>
        </div>
      </Pieza>

      <Pieza
        nombre="Caja de papel"
        nombreEn="Paper box"
        de="Papel opaco + relleno + margen negativo. Impide que la trama del fondo compita con la lectura sin desalinear el texto."
        deEn="Opaque paper + padding + negative margin. Stops the background pattern competing with reading without pushing the text out of line."
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
        de="Dibujadas aquí a mano: viven dentro de la cabecera y no existen sueltas. Una pastilla con dos estados —claro y oscuro, español e inglés— donde lo activo es la tinta y lo inactivo el gris apagado."
        deEn="Drawn by hand here: they live inside the header and do not exist on their own. A pill with two states — light and dark, Spanish and English — where the active one is ink and the inactive one muted grey."
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
        de="Dibujadas a mano, del menú de Ilustraciones. La activa se une a la caja de abajo quitándole el redondeo de esa esquina: se lee como una carpeta y no como un botón."
        deEn="Drawn by hand, from the Illustrations menu. The active one joins the box below by dropping that corner's radius: it reads as a folder tab, not a button."
        ancha
      >
        <div className="sd-muestra-tabs">
          <span className="sd-tab es-activa"><LangText es="Holding" en="Holding" /></span>
          <span className="sd-tab"><LangText es="Subholding" en="Subholding" /></span>
          <span className="sd-tab-caja" />
        </div>
      </Pieza>
    </div>
  );
}
