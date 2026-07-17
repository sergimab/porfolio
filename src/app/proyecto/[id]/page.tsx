import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackCapsule from "@/components/BackCapsule";
import IlustracionesSistema from "@/components/IlustracionesSistema";
import ProjectHeroTitle from "@/components/ProjectHeroTitle";
import LangText from "@/components/LangText";
import InfografiasViewer from "@/components/InfografiasViewer";
import ToolIcons from "@/components/ToolIcons";
import BackToTop from "@/components/BackToTop";
import "../../page.css";
import "@/components/SkillDrop.css";

function catFromId(id: string): string {
  switch (id[0]) {
    case "m": return "motion";
    case "b": return "branding";
    case "f": return "fotografia";
    case "u": return "uiux";
    case "d": return "3d";
    default:  return "iberdrola";
  }
}

const titles: Record<string, string> = {
  m1: "Proyecto Motion 01", m2: "Proyecto Motion 02", m3: "Proyecto Motion 03",
  b1: "Proyecto Branding 01", b2: "Proyecto Branding 02", b3: "Proyecto Branding 03",
  f1: "Proyecto Foto 01", f2: "Proyecto Foto 02", f3: "Proyecto Foto 03",
  i1: "Infografías", i2: "Sistema de diseño", i3: "Newsletters", i4: "Iconografía", i5: "Sistema de ilustraciones",
  u1: "Proyecto UI/UX 01", u2: "Proyecto UI/UX 02", u3: "Proyecto UI/UX 03",
  d1: "Proyecto 3D 01", d2: "Proyecto 3D 02", d3: "Proyecto 3D 03",
};

// Infografías: módulos HTML interactivos de la web corporativa de Iberdrola.
function InfografiasLanding() {
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

        <div className="ig-introrow">
          <p className="project-intro">
            <LangText
              es="Esto es solo una muestra: unas pocas de las más de 160 infografías que he diseñado para la web corporativa de Iberdrola. En todas he intentado darle una vuelta a los conceptos y transformar lo estático en movimiento, para explicar procesos, instalaciones y tecnología de forma visual e interactiva."
              en="This is just a sample: a few of the 160-plus infographics I've designed for Iberdrola's corporate site. In every one I've tried to rethink the concept and turn the static into movement, explaining processes, facilities and technology in a visual, interactive way."
            />
          </p>
          <ToolIcons />
        </div>

        <p className="project-tagline">
          <LangText es="｡ ₊°  No solo se miran — se tocan  °₊ ｡" en="｡ ₊°  Not just for looking — for touching  °₊ ｡" />
        </p>

        <InfografiasViewer />
      </div>
    </main>
  );
}

function IlustracionesLanding() {
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

        <p className="project-intro">
          <LangText
            es="Diseñamos en equipo un sistema visual para Iberdrola que pusiera orden en el caos: qué estilo, qué piezas, para qué contexto. Infografías, banners, web. Y dentro de eso, una distinción clara entre la identidad corporativa de Iberdrola y la de su subholding Iberdrola España."
            en="As a team, we designed a visual system for Iberdrola to bring order to the chaos: which style, which pieces, for which context. Infographics, banners, web. And within that, a clear distinction between Iberdrola's corporate identity and that of its subholding Iberdrola España."
          />
        </p>

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

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const title = titles[id] ?? "Proyecto";

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--background)" }}>
      <Header />

      {id === "i5" ? (
        <IlustracionesLanding />
      ) : id === "i1" ? (
        <InfografiasLanding />
      ) : (
        <main className="project-soon">
          <BackCapsule category={catFromId(id)} />
          <span className="project-soon-note">Próximamente</span>
          <h1 className="project-soon-title">{title}</h1>
          <p className="project-soon-note">
            Esta página está en construcción. Aquí se mostrará el proyecto completo.
          </p>
        </main>
      )}

      <div className="header-wrap">
        <Footer />
      </div>

      <BackToTop />
    </div>
  );
}
