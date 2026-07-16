import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackCapsule from "@/components/BackCapsule";
import IlustracionesSistema from "@/components/IlustracionesSistema";
import ProjectHeroTitle from "@/components/ProjectHeroTitle";
import LangText from "@/components/LangText";
import InfografiasViewer from "@/components/InfografiasViewer";
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
    <main style={{ flex: 1, paddingBottom: "64px" }}>
      <div className="project-content-wrap">
        <div
          className="hover-trail-target"
          data-trail-hue="142"
          style={{
            height: "220px",
            marginTop: "-24px",
            borderRadius: "0 0 16px 16px",
            border: "1.5px solid rgba(22,163,74,0.6)",
            borderTop: "none",
            display: "flex", alignItems: "flex-end", justifyContent: "space-between",
            gap: "16px", padding: "20px", boxSizing: "border-box",
          }}
        >
          <span style={{ position: "relative", zIndex: 6 }}>
            <BackCapsule category="iberdrola" />
          </span>

          <div style={{
            position: "relative", zIndex: 6,
            border: "1px solid var(--foreground)", borderRadius: "12px",
            padding: "14px 20px", background: "var(--background)",
            display: "flex", flexDirection: "column", gap: "6px",
          }}>
            <div style={{ display: "flex", gap: "24px", fontSize: "13px" }}>
              <span style={{ fontWeight: 700, minWidth: "64px" }}><LangText es="Agencia" en="Agency" /></span>
              <span>Prodigioso Volcán</span>
            </div>
            <div style={{ display: "flex", gap: "24px", fontSize: "13px" }}>
              <span style={{ fontWeight: 700, minWidth: "64px" }}><LangText es="Equipo" en="Team" /></span>
              <span><LangText es="Cuatro diseñadores" en="Four designers" /></span>
            </div>
          </div>
        </div>

        <ProjectHeroTitle es="Infografías" en="Infographics" />

        <p style={{ fontSize: "14px", color: "var(--foreground)", maxWidth: "520px", lineHeight: 1.6, marginTop: "20px" }}>
          <LangText
            es="Infografías interactivas hechas en HTML, CSS y JavaScript para la web corporativa de Iberdrola: piezas que explican procesos, instalaciones y tecnología de forma visual y responden al usuario."
            en="Interactive infographics built with HTML, CSS and JavaScript for Iberdrola's corporate site: pieces that explain processes, facilities and technology visually — and respond to the user."
          />
        </p>

        <p style={{ fontSize: "14px", color: "var(--muted)", maxWidth: "520px", marginTop: "20px", fontStyle: "italic" }}>
          <LangText es="｡ ₊°  No solo se miran — se tocan  °₊ ｡" en="｡ ₊°  Not just for looking — for touching  °₊ ｡" />
        </p>

        <InfografiasViewer />
      </div>
    </main>
  );
}

function IlustracionesLanding() {
  return (
    <main style={{ flex: 1, paddingBottom: "64px" }}>
      <div className="project-content-wrap">
        <div
          className="hover-trail-target"
          data-trail-hue="142"
          style={{
            height: "220px",
            marginTop: "-24px",
            borderRadius: "0 0 16px 16px",
            border: "1.5px solid rgba(22,163,74,0.6)",
            borderTop: "none",
            display: "flex", alignItems: "flex-end", justifyContent: "space-between",
            gap: "16px", padding: "20px", boxSizing: "border-box",
          }}
        >
          <span style={{ position: "relative", zIndex: 6 }}>
            <BackCapsule category="iberdrola" />
          </span>

          <div style={{
            position: "relative", zIndex: 6,
            border: "1px solid var(--foreground)", borderRadius: "12px",
            padding: "14px 20px", background: "var(--background)",
            display: "flex", flexDirection: "column", gap: "6px",
          }}>
            <div style={{ display: "flex", gap: "24px", fontSize: "13px" }}>
              <span style={{ fontWeight: 700, minWidth: "64px" }}><LangText es="Agencia" en="Agency" /></span>
              <span>Prodigioso Volcán</span>
            </div>
            <div style={{ display: "flex", gap: "24px", fontSize: "13px" }}>
              <span style={{ fontWeight: 700, minWidth: "64px" }}><LangText es="Equipo" en="Team" /></span>
              <span><LangText es="Cuatro diseñadores" en="Four designers" /></span>
            </div>
          </div>
        </div>

        <ProjectHeroTitle es="Sistema de ilustraciones" en="Illustration system" />

        <p style={{ fontSize: "14px", color: "var(--foreground)", maxWidth: "520px", lineHeight: 1.6, marginTop: "20px" }}>
          <LangText
            es="Diseñamos en equipo un sistema visual para Iberdrola que pusiera orden en el caos: qué estilo, qué piezas, para qué contexto. Infografías, banners, web. Y dentro de eso, una distinción clara entre la identidad corporativa de Iberdrola y la de su subholding Iberdrola España."
            en="As a team, we designed a visual system for Iberdrola to bring order to the chaos: which style, which pieces, for which context. Infographics, banners, web. And within that, a clear distinction between Iberdrola's corporate identity and that of its subholding Iberdrola España."
          />
        </p>

        <p style={{ fontSize: "14px", color: "var(--muted)", maxWidth: "520px", marginTop: "20px", fontStyle: "italic" }}>
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
        <main style={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: "16px",
          color: "var(--foreground)", padding: "24px", textAlign: "center",
        }}>
          <BackCapsule category={catFromId(id)} />
          <span style={{ fontSize: "13px", color: "var(--muted)" }}>Próximamente</span>
          <h1 style={{ fontSize: "22px", fontWeight: 500 }}>{title}</h1>
          <p style={{ fontSize: "13px", color: "var(--muted)", maxWidth: "360px" }}>
            Esta página está en construcción. Aquí se mostrará el proyecto completo.
          </p>
        </main>
      )}

      <div className="header-wrap">
        <Footer />
      </div>
    </div>
  );
}
