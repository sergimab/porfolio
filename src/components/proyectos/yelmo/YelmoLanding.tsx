import BackCapsule from "@/components/shared/BackCapsule";
import ProjectHeroTitle from "@/components/shared/ProjectHeroTitle";
import LangText from "@/components/shared/LangText";
import ToolIcons from "@/components/shared/ToolIcons";
import Branding from "./Branding";

// Rebranding de Yelmo Cines: el proyecto de Proyectos LAB de la ESD Madrid, en
// el que a cada uno le tocaba una marca de cine y había que resolverla en tres
// disciplinas —prototipado web, branding y animación—.
//
// De momento, solo la cabecera y la entradilla. Los apartados van llegando
// después; la estructura es la misma que la de Espacio vacío para que se le
// pueda ir añadiendo sin rehacer nada.
export default function YelmoLanding() {
  return (
    <main className="project-main">
      {/* --hero-hue en el contenedor: lo heredan el cuadro de cabecera y las
          cajas de medios, para que todo vaya del color de la categoría. El 330
          es el rosa de Branding; sale de la cápsula, no de un color elegido
          aquí, así que si allí cambia hay que cambiarlo también aquí. */}
      <div className="project-content-wrap" style={{ ["--hero-hue" as string]: 330 }}>
        <div
          className="hover-trail-target project-hero-box"
          data-trail-hue="330"
          data-tint-color="#DB2777"
        >
          <span className="project-back">
            <BackCapsule category="branding" />
          </span>

          {/* Sin fila de equipo: este lo hice solo, y una fila que dijera «1
              diseñador» es ruido. */}
          <div className="project-meta">
            <div className="project-meta-row">
              <span className="project-meta-key"><LangText es="Tipo" en="Type" /></span>
              <span>
                <LangText es="Rebranding" en="Rebranding" />
              </span>
            </div>
            <div className="project-meta-row">
              <span className="project-meta-key"><LangText es="Asignatura" en="Course" /></span>
              <span>
                <LangText es="Proyectos LAB · ESD Madrid" en="LAB Projects · ESD Madrid" />
              </span>
            </div>
          </div>
        </div>

        <ProjectHeroTitle es="Rebranding Yelmo Cines" en="Yelmo Cines rebranding" />

        {/* La entradilla y los programas en la misma fila, como las páginas de
            Iberdrola: el texto a la izquierda con su propio papel —ya lo trae
            `.project-intro`— y los iconos en columna contra el margen derecho. */}
        <div className="project-introrow">
          <p className="project-intro">
            <LangText
              es="En este proyecto de la universidad se planteaba el **rebranding de una marca de cine**, y a mí me tocó **Yelmo**. La propuesta tenía que resolverse en **tres disciplinas**: prototipado web, branding y animación."
              en="This university project asked for the **rebranding of a cinema brand**, and I was given **Yelmo**. The proposal had to work across **three disciplines**: web prototyping, branding and animation."
            />
          </p>
          <ToolIcons tools={["Photoshop", "Illustrator", "After Effects", "Figma"]} />
        </div>

        <Branding />
      </div>
    </main>
  );
}
