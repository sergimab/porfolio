import BackCapsule from "@/components/shared/BackCapsule";
import ProjectHeroTitle from "@/components/shared/ProjectHeroTitle";
import LangText from "@/components/shared/LangText";
import ToolIcons from "@/components/shared/ToolIcons";
import DropcapTitle from "@/components/shared/DropcapTitle";
import CtaBanner from "@/components/shared/CtaBanner";

// La pata de animación del proyecto de Yelmo: el vídeo promocional y las demás
// piezas en movimiento.
//
// Va en página aparte y no dentro de la de branding porque son dos disciplinas
// distintas del mismo encargo, y en el portfolio cada una vive en su
// categoría: la marca en Branding, esto en Motion. Las dos se enlazan con la
// franja del final.
//
// De momento solo la cabecera; los vídeos van llegando después, y la
// estructura es la misma que la de la página de branding para que se le pueda
// ir añadiendo sin rehacer nada.
export default function MotionLanding() {
  return (
    <main className="project-main">
      {/* --hero-hue en el contenedor: lo heredan el cuadro de cabecera y las
          cajas de medios, para que todo vaya del color de la categoría. El 32
          es el naranja de Motion Graphics; sale de la cápsula, no de un color
          elegido aquí, así que si allí cambia hay que cambiarlo también aquí.
          El tinte es ese mismo tono con el brillo y la saturación del rosa de
          Branding, para que las dos páginas del proyecto pesen igual. */}
      <div className="project-content-wrap" style={{ ["--hero-hue" as string]: 32 }}>
        <div
          className="hover-trail-target project-hero-box"
          data-trail-hue="32"
          data-tint-color="#DB8727"
        >
          <span className="project-back">
            <BackCapsule category="motion" />
          </span>

          {/* Sin fila de equipo: este lo hice solo, como el branding. */}
          <div className="project-meta">
            <div className="project-meta-row">
              <span className="project-meta-key"><LangText es="Tipo" en="Type" /></span>
              <span>
                <LangText es="Motion graphics" en="Motion graphics" />
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

        <ProjectHeroTitle es="Motion Yelmo Cines" en="Yelmo Cines motion" />

        <div className="project-introrow">
          <p className="project-intro">
            <LangText
              es="La **tercera pata** del rebranding de Yelmo: poner la marca en movimiento. De aquí salió el **vídeo promocional** de la propuesta, junto a otras piezas animadas que llevan el sistema gráfico al terreno del **tiempo y el ritmo**."
              en="The **third strand** of the Yelmo rebrand: setting the brand in motion. It produced the **promo video** for the proposal, along with other animated pieces that take the graphic system into the realm of **time and rhythm**."
            />
          </p>
          <ToolIcons tools={["After Effects", "Illustrator", "Photoshop"]} />
        </div>

        {/* La marca tiene página propia, en Branding: allí está el sistema del
            que sale todo lo que aquí se mueve. */}
        <section>
          <h2 className="project-h2">
            <DropcapTitle es="Páginas recomendadas" en="Recommended pages" />
          </h2>
          <CtaBanner
            href="/proyecto/b2"
            es="Ver el rebranding de la marca"
            en="See the brand rebrand"
          />
        </section>
      </div>
    </main>
  );
}
