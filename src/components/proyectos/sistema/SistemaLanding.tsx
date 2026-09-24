import BackCapsule from "@/components/shared/BackCapsule";
import ProjectHeroTitle from "@/components/shared/ProjectHeroTitle";
import LangText from "@/components/shared/LangText";
import ToolIcons from "@/components/shared/ToolIcons";
import RotuloSeccion from "@/components/shared/RotuloSeccion";
import Recomendados from "@/components/shared/Recomendados";
import Muestrario from "./Muestrario";
import "./Sistema.css";

// El turquesa de UI/UX, el mismo que el de su cápsula en la home.
const HUE = 175;
const TINTE = "#0D9488";

// EL SISTEMA DE DISEÑO DEL PROPIO SITIO, contado dentro del sitio.
//
// Es un proyecto raro y por eso conviene decirlo de entrada: la página no
// enseña capturas de un sistema, está HECHA con el sistema. Los colores que se
// ven son las variables de verdad, los componentes son los mismos que usa el
// resto del portfolio, y si mañana cambia un token, esta página cambia con él.
// Un muestrario que se pinta solo no puede mentir; uno hecho a mano envejece en
// la primera semana.
export default function SistemaLanding() {
  return (
    <main className="project-main">
      <div className="project-content-wrap" style={{ ["--hero-hue" as string]: HUE }}>
        <div
          className="hover-trail-target project-hero-box"
          data-trail-hue={String(HUE)}
          data-tint-color={TINTE}
        >
          <span className="project-back">
            <BackCapsule category="uiux" />
          </span>

          <div className="project-meta">
            <div className="project-meta-row">
              <span className="project-meta-key"><LangText es="Tipo" en="Type" /></span>
              <span><LangText es="Sistema de diseño" en="Design system" /></span>
            </div>
            <div className="project-meta-row">
              <span className="project-meta-key"><LangText es="Proyecto" en="Project" /></span>
              <span><LangText es="Este mismo portfolio" en="This portfolio" /></span>
            </div>
          </div>
        </div>

        <ProjectHeroTitle es="Sistema de diseño" en="Design system" />

        <div className="project-introrow">
          <p className="project-intro">
            <LangText
              es="Esto empezó como algo simple para enseñar unos pocos proyectos y se me fue creciendo hasta ser **un archivo de trabajos ordenado por categorías**, y con él me metí de lleno en **la programación y los sistemas de diseño**. Esta página es lo que quedó de ese camino, y va **hecha con el propio sistema**, así que lo que se ve no son capturas sino **los componentes de verdad**."
              en="This started as something simple to show a handful of projects and kept growing into **an archive of work sorted by discipline**, and with it I went properly into **coding and design systems**. This page is what came out of that, and it is **built with the system itself**, so what you see are not screenshots but **the real components**."
            />
          </p>
          <ToolIcons tools={["Figma", "Visual Studio Code"]} />
        </div>

        <Muestrario />

        <Recomendados ids={["u2", "u3", "u1"]} />
      </div>
    </main>
  );
}
