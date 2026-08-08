import BackCapsule from "@/components/shared/BackCapsule";
import ProjectHeroTitle from "@/components/shared/ProjectHeroTitle";
import LangText from "@/components/shared/LangText";
import ToolIcons from "@/components/shared/ToolIcons";
import PhoneMockup from "./PhoneMockup";

// Newsletters: piezas de email para Iberdrola.
export default function NewslettersLanding() {
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

        <ProjectHeroTitle es="Newsletters" en="Newsletters" />

        <div className="project-introrow">
          <p className="project-intro">
            <LangText
              es="Diseño y maquetación de newsletters para Iberdrola: piezas de email que combinan la identidad de marca con una jerarquía clara, pensadas para leerse bien en cualquier cliente de correo y dispositivo."
              en="Design and build of newsletters for Iberdrola: email pieces that pair the brand identity with a clear hierarchy, built to read well across any email client and device."
            />
          </p>
          <ToolIcons tools={["Figma", "Illustrator", "After Effects", "Stripo"]} />
        </div>

        {/* Vídeo de la animación final, justo debajo de la descripción */}
        <div className="nwl-video">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            src="/proyectos/iberdrola/newsletters/newsletters.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            controls
          />
        </div>

        {/* Dos newsletters navegables en mockup de móvil */}
        <div className="nwl-phones">
          <PhoneMockup src="/proyectos/iberdrola/newsletters/nwl-29-12-es.html" title="Newsletter Iberdrola — 12 hitos" />
          <PhoneMockup src="/proyectos/iberdrola/newsletters/nwl-20-08-es.html" title="Newsletter Iberdrola — verano" />
        </div>
      </div>
    </main>
  );
}
