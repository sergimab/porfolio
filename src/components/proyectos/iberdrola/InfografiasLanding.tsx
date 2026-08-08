import BackCapsule from "@/components/shared/BackCapsule";
import ProjectHeroTitle from "@/components/shared/ProjectHeroTitle";
import LangText from "@/components/shared/LangText";
import ToolIcons from "@/components/shared/ToolIcons";
import InfografiasViewer from "./InfografiasViewer";

// Infografías: módulos HTML interactivos de la web corporativa de Iberdrola.
export default function InfografiasLanding() {
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

        <ProjectHeroTitle es="Infografías" en="Infographics" />

        <div className="project-introrow">
          <p className="project-intro">
            <LangText
              es="Esto es solo una muestra: unas pocas de las más de 160 infografías que he diseñado para la web corporativa de Iberdrola. En todas he intentado darle una vuelta a los conceptos y transformar lo estático en movimiento, para explicar procesos, instalaciones y tecnología de forma visual e interactiva."
              en="This is just a sample: a few of the 160-plus infographics I've designed for Iberdrola's corporate site. In every one I've tried to rethink the concept and turn the static into movement, explaining processes, facilities and technology in a visual, interactive way."
            />
          </p>
          <ToolIcons tools={["Figma", "Visual Studio Code", "After Effects", "Illustrator", "Blender"]} />
        </div>

        <p className="project-tagline">
          <LangText es="｡ ₊°  No solo se miran — se tocan  °₊ ｡" en="｡ ₊°  Not just for looking — for touching  °₊ ｡" />
        </p>

        <InfografiasViewer />
      </div>
    </main>
  );
}
