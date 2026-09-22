import { redirect } from "next/navigation";
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
import DiscoElysiumLanding from "@/components/proyectos/disco-elysium/DiscoElysiumLanding";
import EspacioVacioLanding from "@/components/proyectos/espacio-vacio/EspacioVacioLanding";
import AppEspacioVacioLanding from "@/components/proyectos/app-espacio-vacio/AppLanding";
import YelmoLanding from "@/components/proyectos/yelmo/YelmoLanding";
import MotionLanding from "@/components/proyectos/yelmo-motion/MotionLanding";
// «El Arte del Miedo»: un mismo proyecto en tres categorías. Las tres páginas
// comparten componente; lo único que cambia es la disciplina que se le pasa.
import ArteMiedoBranding from "@/components/proyectos/arte-del-miedo/BrandingLanding";
import ArteMiedoMotion from "@/components/proyectos/arte-del-miedo/MotionLanding";
import ArteMiedoUiux from "@/components/proyectos/arte-del-miedo/UiuxLanding";
import SalaEquisLanding from "@/components/proyectos/sala-equis/SalaEquisLanding";
import AficheTokioLanding from "@/components/proyectos/orquesta-tokio/AficheLanding";

const LANDINGS: Record<string, React.ComponentType> = {
  m1: MotionLanding,
  i1: InfografiasLanding,
  i3: NewslettersLanding,
  i4: IconografiaLanding,
  i5: IlustracionesLanding,
  u2: AppEspacioVacioLanding,
  d1: ElysiumLanding,
  e1: DiscoElysiumLanding,
  b1: EspacioVacioLanding,
  b2: YelmoLanding,
  b3: ArteMiedoBranding,
  m2: ArteMiedoMotion,
  u3: ArteMiedoUiux,
  f1: AficheTokioLanding,
  b4: SalaEquisLanding,
};

function catFromId(id: string): string {
  switch (id[0]) {
    case "m": return "motion";
    case "b": return "branding";
    case "f": return "fotografia";
    case "u": return "uiux";
    case "d": return "3d";
    case "e": return "editorial";
    default:  return "iberdrola";
  }
}

const titles: Record<string, string> = {
  m1: "Motion Yelmo Cines", m2: "Motion El Arte del Miedo",
  b1: "Espacio vacío", b2: "Rebranding Yelmo Cines", b3: "El Arte del Miedo", b4: "Rebranding Sala Equis",
  f1: "Afiche Orquesta Tokio",
  i1: "Infografías", i2: "Sistema de diseño", i3: "Newsletters", i4: "Iconografía", i5: "Sistema de ilustraciones",
  u1: "Web de Elysium", u2: "App Espacio vacío", u3: "App El Arte del Miedo",
  d1: "Elysium",
  e1: "Disco Elysium",
};

// La web de Elysium no tiene página de proyecto: al pulsarla se abre la web.
// Aquí solo se redirige, para que los enlaces de siempre —la tarjeta de la
// home, la franja de la página de 3D— sigan valiendo sin tocarlos uno a uno.
const REDIRECCIONES: Record<string, string> = {
  u1: "/elysium/web",
};

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const destino = REDIRECCIONES[id];
  if (destino) redirect(destino);
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
