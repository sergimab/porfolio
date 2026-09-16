import Link from "next/link";
import BackCapsule from "@/components/shared/BackCapsule";
import ProjectHeroTitle from "@/components/shared/ProjectHeroTitle";
import LangText from "@/components/shared/LangText";
import ToolIcons from "@/components/shared/ToolIcons";
import Prototipo from "./Prototipo";
import "./Marca.css";

// App Espacio vacío: el diseño de producto del proyecto, en su propia página de
// UI/UX.
//
// Vive en la carpeta de Espacio vacío y no en una suya porque comparte todo con
// la marca —las pantallas salen del mismo Figma, y el papel y los divisores del
// mismo CSS—; lo que cambia es la categoría en la que se enseña. Las dos
// páginas se enlazan entre sí al final.
export default function AppLanding() {
  return (
    <main className="project-main">
      {/* El 175 es el verde azulado de UI/UX. Sale de la lista de categorías,
          así que si allí cambia, aquí también. */}
      <div className="project-content-wrap" style={{ ["--hero-hue" as string]: 175 }}>
        <div
          className="hover-trail-target project-hero-box"
          data-trail-hue="175"
          data-tint-color="#0D9488"
        >
          <span className="project-back">
            <BackCapsule category="uiux" />
          </span>

          <div className="project-meta">
            <div className="project-meta-row">
              <span className="project-meta-key"><LangText es="Tipo" en="Type" /></span>
              <span>
                <LangText es="Diseño de producto" en="Product design" />
              </span>
            </div>
            <div className="project-meta-row">
              <span className="project-meta-key"><LangText es="Herramienta" en="Tool" /></span>
              <span>Figma</span>
            </div>
          </div>
        </div>

        <ProjectHeroTitle es="App Espacio vacío" en="Empty space app" />

        {/* La entradilla destacada con los programas al lado, como en el resto
            de páginas de proyecto. */}
        <div className="project-introrow ev-papel">
          <p className="project-intro">
            <LangText
              es="La app es el centro de la campaña: es donde la persona ve cuánto tiempo se le va en las redes sociales y lo pone al lado del que dedica a lo que de verdad le importa. El alta son diez pantallas, y está aquí entera y navegable."
              en="The app is the heart of the campaign: it's where you see how much time is going into social media and set it against the time you give to what actually matters. Onboarding is ten screens, and here it is in full, playable."
            />
          </p>
          <ToolIcons tools={["Figma"]} />
        </div>

        <Prototipo />

        <hr className="ev-divisor" />

        {/* Y de vuelta a la marca, que es de donde sale todo esto. */}
        <div className="ev-papel ev-salto">
          <p>
            <LangText
              es="La marca, la paleta y la tipografía de la app son las del proyecto de branding:"
              en="The app's brand, palette and typography come from the branding project:"
            />{" "}
            <Link href="/proyecto/b1">
              <LangText es="ver Espacio vacío" en="see Empty space" />
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
