import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BackCapsule from "@/components/shared/BackCapsule";
import BackToTop from "@/components/layout/BackToTop";
import "../../page.css";
import "@/components/home/SkillDrop.css";

// Páginas de proyecto. El contenido de cada una vive en su propia carpeta
// dentro de src/components/proyectos/<proyecto>/; aquí solo se decide cuál
// pintar según el id de la URL (/proyecto/d1 → Elysium).
import InfografiasLanding from "@/components/proyectos/iberdrola/InfografiasLanding";
import IlustracionesLanding from "@/components/proyectos/iberdrola/IlustracionesLanding";
import NewslettersLanding from "@/components/proyectos/iberdrola/NewslettersLanding";
import IconografiaLanding from "@/components/proyectos/iberdrola/IconografiaLanding";
import ElysiumLanding from "@/components/proyectos/elysium/ElysiumLanding";

const LANDINGS: Record<string, React.ComponentType> = {
  i1: InfografiasLanding,
  i3: NewslettersLanding,
  i4: IconografiaLanding,
  i5: IlustracionesLanding,
  d1: ElysiumLanding,
};

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
  d1: "Elysium", d2: "Proyecto 3D 02", d3: "Proyecto 3D 03",
};

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const Landing = LANDINGS[id];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />

      {Landing ? (
        <Landing />
      ) : (
        <main className="project-soon">
          <BackCapsule category={catFromId(id)} />
          <span className="project-soon-note">Próximamente</span>
          <h1 className="project-soon-title">{titles[id] ?? "Proyecto"}</h1>
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
