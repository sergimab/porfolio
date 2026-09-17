import BackCapsule from "@/components/shared/BackCapsule";
import ProjectHeroTitle from "@/components/shared/ProjectHeroTitle";
import LangText from "@/components/shared/LangText";
import ToolIcons from "@/components/shared/ToolIcons";
import DropcapTitle from "@/components/shared/DropcapTitle";
import CtaBanner from "@/components/shared/CtaBanner";
import Branding from "./Branding";

// Rebranding de Yelmo Cines: el proyecto de Proyectos LAB de la ESD Madrid, en
// el que a cada uno le tocaba una marca de cine y había que resolverla en tres
// disciplinas —prototipado web, branding y animación—.
//
// Aquí vive la pata de branding; la de animación tiene su propia página en
// Motion, y las dos se enlazan con la franja del final. La estructura es la
// misma que la de Espacio vacío.
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

        {/* La animación tiene página propia, en Motion: aquí está la marca,
            allí el vídeo promocional y las demás piezas en movimiento. Se pasa
            de una a otra con la misma franja que enlaza Espacio vacío con su
            app.
            La versión estrecha no es la misma imagen encogida, sino el recorte
            central a más tamaño, con la medida que llevan todas las del sitio.
            Encogida entera, la franja se quedaba en 48 px de alto y no se
            distinguía nada. */}
        <section className="ym-seccion">
          {/* El título va con la capitular script, como el de las demás
              páginas: el rótulo-pastilla es de los apartados del proyecto, y
              esto no es uno más, es el pie de página. */}
          <h2 className="project-h2">
            <DropcapTitle es="Páginas recomendadas" en="Recommended pages" />
          </h2>
          <CtaBanner
            href="/proyecto/m1"
            es="Ver la animación del proyecto"
            en="See the project's motion work"
            imagen="/banners/motion-yelmo.webp"
            imagenMovil="/banners/motion-yelmo-movil.webp"
            alt="Tres fotogramas de la animación: manos sobre discos de color"
          />
        </section>
      </div>
    </main>
  );
}
