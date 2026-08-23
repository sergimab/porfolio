import BackCapsule from "@/components/shared/BackCapsule";
import ProjectHeroTitle from "@/components/shared/ProjectHeroTitle";
import LangText from "@/components/shared/LangText";
import ToolIcons from "@/components/shared/ToolIcons";

// Disco Elysium: el diseño editorial del álbum — el desplegable acordeón, el
// inlay y los artes finales. Es el destino de la franja que cierra la página
// de Elysium, y va en su propia categoría porque el trabajo es editorial y no
// 3D, aunque las piezas salgan de allí.
export default function DiscoElysiumLanding() {
  return (
    <main className="project-main">
      {/* --hero-hue en el contenedor: lo heredan el cuadro de cabecera y las
          cajas de medios, para que todo vaya del color de la categoría. */}
      <div className="project-content-wrap" style={{ ["--hero-hue" as string]: 84 }}>
        <div
          className="hover-trail-target project-hero-box"
          data-trail-hue="84"
          data-tint-color="#68A50D"
        >
          <span className="project-back">
            <BackCapsule category="editorial" />
          </span>

          <div className="project-meta">
            <div className="project-meta-row">
              <span className="project-meta-key"><LangText es="Tipo" en="Type" /></span>
              <span><LangText es="Diseño editorial" en="Editorial design" /></span>
            </div>
            <div className="project-meta-row">
              <span className="project-meta-key"><LangText es="Rol" en="Role" /></span>
              <span><LangText es="Diseño y artes finales" en="Design and final artwork" /></span>
            </div>
          </div>
        </div>

        <ProjectHeroTitle es="Disco Elysium" en="Disco Elysium" />

        <div className="project-introrow">
          <p className="project-intro">
            <LangText
              es="Texto provisional. Aquí irá la introducción del proyecto: qué es el desplegable acordeón, cómo se resolvió el inlay y qué papel juegan los artes finales dentro del conjunto de Elysium."
              en="Placeholder text. The project introduction goes here: what the accordion fold-out is, how the inlay was resolved and what part the final artwork plays within the Elysium set."
            />
          </p>
          <ToolIcons tools={["Illustrator", "Photoshop", "Blender"]} />
        </div>

        <p className="project-tagline">
          <LangText
            es="｡ ₊°  Texto provisional para la frase de apertura  °₊ ｡"
            en="｡ ₊°  Placeholder for the opening line  °₊ ｡"
          />
        </p>
      </div>
    </main>
  );
}
