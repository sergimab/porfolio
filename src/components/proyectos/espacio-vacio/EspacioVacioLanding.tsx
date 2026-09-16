import BackCapsule from "@/components/shared/BackCapsule";
import ProjectHeroTitle from "@/components/shared/ProjectHeroTitle";
import LangText from "@/components/shared/LangText";
import EscenaInicio from "./EscenaInicio";
import PaletaCromatica from "./PaletaCromatica";
import Tipografia from "./Tipografia";
import Marca from "./Marca";

// Las piezas acabadas, en el orden de las mesas de trabajo del archivo
// original. Se mantienen numeradas en vez de bautizarlas por su contenido
// porque así se puede volver al archivo y encontrarlas.
const MOCKUPS = [
  { src: "/proyectos/espacio-vacio/mockup-1.webp", alt: "Pantallas de la app de Espacio vacío en perspectiva" },
  { src: "/proyectos/espacio-vacio/mockup-2.webp", alt: "La app abierta sobre el perfil de una usuaria" },
  { src: "/proyectos/espacio-vacio/mockup-3.webp", alt: "Publicación de Instagram de la campaña" },
  { src: "/proyectos/espacio-vacio/mockup-4.webp", alt: "Piezas de la campaña en redes sociales" },
  { src: "/proyectos/espacio-vacio/mockup-5.webp", alt: "Perfil de Instagram de Espacio vacío" },
  { src: "/proyectos/espacio-vacio/mockup-6.webp", alt: "Los tres carteles de la campaña y una historia de Instagram" },
  { src: "/proyectos/espacio-vacio/mockup-7.webp", alt: "Aplicación de la marca sobre soportes" },
  { src: "/proyectos/espacio-vacio/mockup-8.webp", alt: "Detalle de las piezas de la campaña" },
];

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
                  es="Proyectos Experimentales · ESD Madrid"
                  en="Experimental Projects · ESD Madrid"
                />
              </span>
            </div>
          </div>
        </div>

        <ProjectHeroTitle es="Espacio vacío" en="Empty space" />

        {/* Sin entradilla destacada: los tres párrafos van seguidos y al mismo
            ancho. El dato de la asignatura y la escuela tampoco está aquí, vive
            en la ficha de arriba, que es donde el resto de proyectos pone el
            contexto. */}
        <div className="project-text">
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

        <EscenaInicio />

        <PaletaCromatica />

        <Tipografia />

        <Marca />

        {/* Las piezas acabadas: la app, la campaña en redes y los carteles.
            Apilados y a ancho completo, en el mismo orden que las mesas de
            trabajo del archivo original. */}
        <div className="ev-mockups">
          {MOCKUPS.map((m) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={m.src} src={m.src} alt={m.alt} loading="lazy" />
          ))}
        </div>
      </div>
    </main>
  );
}
