import BackCapsule from "@/components/shared/BackCapsule";
import ProjectHeroTitle from "@/components/shared/ProjectHeroTitle";
import LangText from "@/components/shared/LangText";
import ToolIcons from "@/components/shared/ToolIcons";
import IlustracionesSistema from "./IlustracionesSistema";

// Sistema de ilustraciones para Iberdrola y su subholding.
export default function IlustracionesLanding() {
  return (
    <main className="project-main">
      <div className="project-content-wrap">
        <div className="hover-trail-target project-hero-box" data-trail-hue="142">
          <span className="project-back">
            <BackCapsule category="iberdrola" />
          </span>

          <div className="project-meta">
            <div className="project-meta-row">
              <span className="project-meta-key"><LangText es="Agencia" en="Agency" /></span>
              <span>Prodigioso Volcán</span>
            </div>
            <div className="project-meta-row">
              <span className="project-meta-key"><LangText es="Equipo" en="Team" /></span>
              <span><LangText es="Cuatro diseñadores" en="Four designers" /></span>
            </div>
          </div>
        </div>

        <ProjectHeroTitle es="Sistema de ilustraciones" en="Illustration system" />

        <div className="project-introrow">
          <p className="project-intro">
            <LangText
              es="Diseñamos en equipo un sistema visual para Iberdrola que pusiera orden en el caos: qué estilo, qué piezas, para qué contexto. Infografías, banners, web. Y dentro de eso, una distinción clara entre la identidad corporativa de Iberdrola y la de su subholding Iberdrola España."
              en="As a team, we designed a visual system for Iberdrola to bring order to the chaos: which style, which pieces, for which context. Infographics, banners, web. And within that, a clear distinction between Iberdrola's corporate identity and that of its subholding Iberdrola España."
            />
          </p>
          <ToolIcons tools={["Figma", "Illustrator"]} />
        </div>

        <p className="project-tagline">
          <LangText es="｡ ₊°  No solo ilustraciones — un lenguaje  °₊ ｡" en="｡ ₊°  Not just illustrations — a language  °₊ ｡" />
        </p>

        <div style={{ marginTop: "48px" }}>
          <IlustracionesSistema />
        </div>
      </div>
    </main>
  );
}
