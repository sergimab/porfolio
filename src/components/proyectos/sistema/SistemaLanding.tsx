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
              es="El portfolio no se maquetó página a página: se construyó con **un sistema de piezas** que se repiten. Esta página lo enseña **desde dentro del propio sitio**, así que lo que se ve aquí no son capturas, son **los componentes de verdad**: si mañana cambia un color, esta página cambia con él. Y al ponerlo todo junto salen a la luz las **incoherencias**, que es la otra mitad del trabajo."
              en="This portfolio was not laid out page by page: it was built from **a system of repeating parts**. This page shows it **from inside the site itself**, so what you see here are not screenshots but **the real components**: change a colour tomorrow and this page changes with it. Putting it all together also surfaces the **inconsistencies**, which is the other half of the job."
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
