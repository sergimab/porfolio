import BackCapsule from "@/components/shared/BackCapsule";
import CtaBanner from "@/components/shared/CtaBanner";
import DropcapTitle from "@/components/shared/DropcapTitle";
import ProjectHeroTitle from "@/components/shared/ProjectHeroTitle";
import LangText from "@/components/shared/LangText";
import "@/components/shared/papel.css";
import ToolIcons from "@/components/shared/ToolIcons";
import Apartados from "./Apartados";
// El papel y los divisores son los mismos que los de la página de marca: las
// dos páginas son el mismo proyecto visto desde dos categorías.
import "../espacio-vacio/Marca.css";

// App Espacio vacío: el diseño de producto del proyecto, en su propia página de
// UI/UX.
//
// Vive en la carpeta de Espacio vacío y no en una suya porque comparte todo con
// la marca —las pantallas salen del mismo Figma, y el papel y los divisores del
// mismo CSS—; lo que cambia es la categoría en la que se enseña. Las dos
// páginas se enlazan entre sí al final.
export default function AppLanding() {
  return (
    <main className="project-main">
      {/* El 175 es el verde azulado de UI/UX. Sale de la lista de categorías,
          así que si allí cambia, aquí también. */}
      <div className="project-content-wrap" style={{ ["--hero-hue" as string]: 175 }}>
        <div
          className="hover-trail-target project-hero-box"
          data-trail-hue="175"
          data-tint-color="#0D9488"
        >
          <span className="project-back">
            <BackCapsule category="uiux" />
          </span>

          {/* La misma ficha que la página de branding: es el mismo proyecto, y
              tenerla distinta en cada una lo partía en dos trabajos. */}
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
            <div className="project-meta-row">
              <span className="project-meta-key"><LangText es="Equipo" en="Team" /></span>
              <span>
                <LangText es="3 diseñadores" en="3 designers" />
              </span>
            </div>
          </div>
        </div>

        {/* El mismo título que en branding: es el mismo proyecto. Lo que
            distingue a una página de otra es la categoría, no el nombre. */}
        <ProjectHeroTitle es="Espacio vacío" en="Empty space" />

        {/* Los mismos tres párrafos que la página de branding, y con el mismo
            papel: entrando por una o por otra, el proyecto se presenta igual.
            Los programas van aparte, en su propia caja. */}
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

        {/* Los programas, en su caja y a la derecha: la caja ya la trae el
            componente —fondo de la página, sin borde—, y fuera del papel se ve
            como tal, que es como está en las demás páginas del sitio. */}
        <div className="caja-herramientas">
          <ToolIcons tools={["Figma"]} />
        </div>

        <Apartados />

        {/* Y de vuelta a la marca, que es de donde sale todo esto. La versión
            estrecha es la misma imagen recortada por el centro, donde está la
            construcción del isotipo. */}
        <hr className="ev-divisor" />
        <h2 className="project-h2">
          <DropcapTitle es="Páginas recomendadas" en="Recommended pages" />
        </h2>
        <CtaBanner
          href="/proyecto/b1"
          es="Ver la marca de Espacio vacío"
          en="See the Empty space brand"
          imagen="/banners/espacio-vacio.webp"
          imagenMovil="/banners/espacio-vacio-movil.webp"
          alt="La construcción del isotipo de Espacio vacío sobre su retícula"
        />
      </div>
    </main>
  );
}
