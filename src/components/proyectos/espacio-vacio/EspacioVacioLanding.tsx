import BackCapsule from "@/components/shared/BackCapsule";
import ProjectHeroTitle from "@/components/shared/ProjectHeroTitle";
import LangText from "@/components/shared/LangText";
import "@/components/shared/papel.css";
import ToolIcons from "@/components/shared/ToolIcons";
import EscenaInicio from "./EscenaInicio";
import PaletaCromatica from "./PaletaCromatica";
import Tipografia from "./Tipografia";
import Marca from "./Marca";
import Mockups from "./Mockups";
import Recomendados from "@/components/shared/Recomendados";
import DropcapTitle from "@/components/shared/DropcapTitle";

// Espacio vacío: la campaña de concienciación sobre la adicción a las redes
// sociales, de la asignatura Proyectos Experimentales de la ESD Madrid.
//
// De momento solo la introducción. El resto de la página —la app, las piezas
// de campaña, las conclusiones— va llegando después, y esta estructura es la
// misma que la de los otros proyectos para que se le pueda ir añadiendo sin
// rehacer nada.
export default function EspacioVacioLanding() {
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

          <div className="project-meta">
            <div className="project-meta-row">
              <span className="project-meta-key"><LangText es="Tipo" en="Type" /></span>
              <span>
                <LangText es="Campaña de concienciación" en="Awareness campaign" />
              </span>
            </div>
            <div className="project-meta-row">
              <span className="project-meta-key"><LangText es="Asignatura" en="Course" /></span>
              <span>
                <LangText
                  es="Proyectos · ESD Madrid"
                  en="Projects · ESD Madrid"
                />
              </span>
            </div>
            <div className="project-meta-row">
              <span className="project-meta-key"><LangText es="Equipo" en="Team" /></span>
              <span>
                <LangText es="3 diseñadores" en="3 designers" />
              </span>
            </div>
          </div>
        </div>

        <ProjectHeroTitle es="Espacio vacío" en="Empty space" />

        {/* Sin entradilla destacada: los tres párrafos van seguidos y al mismo
            ancho. El dato de la asignatura y la escuela tampoco está aquí, vive
            en la ficha de arriba, que es donde el resto de proyectos pone el
            contexto. */}
        {/* Papel opaco SOLO bajo el texto. El fondo de la página lleva una
            trama animada, y donde cae sobre un párrafo compite con lo que hay
            que leer; sobre una lámina, en cambio, no molesta y quitarla de toda
            la página era apagar el fondo entero. */}
        <div className="papel-texto project-text">
          <p>
            <LangText
              es="Este proyecto tiene como punto de partida **concretar un problema social**. Nuestra elección fue tratar el tema de la **adicción a las redes sociales**, y de este problema hacer una **campaña de concienciación**."
              en="The project starts from **pinning down a social problem**. We chose to deal with **social media addiction**, and to build an **awareness campaign** out of it."
            />
          </p>
          <p>
            <LangText
              es="Mediante una **app**, el usuario se podrá crear un perfil donde a lo largo del año, diariamente, irá registrando de manera **automática** el tiempo que consume en las redes sociales, y de manera **manual** las actividades importantes para él."
              en="Through an **app**, you create a profile and, day by day over the course of a year, it logs **automatically** the time you spend on social media, and **manually** the activities that matter to you."
            />
          </p>
          <p>
            <LangText
              es="La finalidad de esta app es que el usuario, al acabar el año, sea **consciente de la cantidad de tiempo que ha desperdiciado** consumiendo estas redes sociales, y pueda poner en contraste este tiempo con el invertido en **actividades que son mucho más importantes**."
              en="The point is that by the end of the year you become **aware of how much time you have wasted** on those networks, and can set it against the time you put into the **things that matter far more**."
            />
          </p>
        </div>

        <div className="caja-herramientas">
          <ToolIcons tools={["Photoshop", "Illustrator"]} />
        </div>

        <EscenaInicio />

        <PaletaCromatica />

        <Tipografia />

        <Marca />

        <hr className="ev-divisor" />
        <Mockups />

        {/* El diseño de la app tiene página propia, en UI/UX: aquí va la marca,
            allí el producto. Se pasa de una a otra con la misma franja que
            enlaza las páginas de Elysium.
            La versión estrecha es la MISMA imagen recortada por el centro, como
            las de Elysium: a ancho de móvil, la franja entera se queda en 48 px
            de alto y los dos aparatos no se distinguen. */}
        <hr className="ev-divisor" />
        <Recomendados ids={["u2"]} />
      </div>
    </main>
  );
}
