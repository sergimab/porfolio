import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BackToTop from "@/components/layout/BackToTop";
import DisenoLanding from "@/components/proyectos/elysium-web/DisenoLanding";
import "../../page.css";
import "@/components/home/SkillDrop.css";

export const metadata = {
  title: "El diseño · Web de Elysium",
  description:
    "Cómo se diseñó la web de Elysium en Figma: la retícula, el tono y el prototipo del recorrido.",
};

// Lleva la misma cabecera y pie que las páginas de proyecto: esto es el CASO,
// se lee dentro del portfolio. La otra mitad —la web funcionando— va sin ellos.
export default function Page() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <DisenoLanding />
      <div className="header-wrap">
        <Footer />
      </div>
      <BackToTop />
    </div>
  );
}
