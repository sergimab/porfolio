import BackCapsule from "@/components/shared/BackCapsule";
import ProjectHeroTitle from "@/components/shared/ProjectHeroTitle";
import LangText from "@/components/shared/LangText";
import ToolIcons from "@/components/shared/ToolIcons";
import BotonRuta from "@/components/shared/BotonRuta";

// Web de Elysium: la entrada al proyecto de UI/UX.
//
// Esta página no cuenta el proyecto, lo reparte. Son dos cosas distintas —cómo
// se diseñó y qué hace cuando se mueve— y meterlas en un mismo scroll obligaba
// a elegir cuál iba antes; puestas como dos accesos, cada quien entra por donde
// le interesa. La web funcionando además pide pantalla entera: dentro de una
// página de portfolio, con su cabecera y su pie, se lee como una captura y no
// como una web.
export default function ElysiumWebLanding() {
  return (
    <main className="project-main">
      {/* --hero-hue en el contenedor: lo heredan el cuadro de cabecera y las
          cajas de medios, para que todo vaya del color de la categoría. */}
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
              <span><LangText es="Diseño de producto" en="Product design" /></span>
            </div>
            <div className="project-meta-row">
              <span className="project-meta-key"><LangText es="Rol" en="Role" /></span>
              <span><LangText es="Diseño UI/UX y prototipo" en="UI/UX design and prototype" /></span>
            </div>
          </div>
        </div>

        <ProjectHeroTitle es="Web de Elysium" en="Elysium website" />

        <div className="project-introrow">
          <p className="project-intro">
            <LangText
              es="Elysium no termina en el álbum. La web es donde el proyecto **se vuelve de quien lo visita**: eliges las canciones que te representan y el sistema te devuelve **un símbolo que no existía antes**, generado con tus respuestas y con el mismo lenguaje que da forma a todo lo demás."
              en="Elysium doesn't end with the album. The website is where the project **becomes the visitor's own**: you pick the songs that represent you and the system returns **a symbol that didn't exist before**, generated from your answers with the same language that shapes everything else."
            />
          </p>
          <ToolIcons tools={["Figma"]} />
        </div>

        <p className="project-tagline">
          <LangText
            es="｡ ₊°  Nadie se lleva el mismo símbolo a casa  °₊ ｡"
            en="｡ ₊°  No two people leave with the same symbol  °₊ ｡"
          />
        </p>

        <div className="project-accesos">
          <BotonRuta
            href="/elysium/diseno"
            es="El diseño y el prototipo"
            en="The design and prototype"
            nota="Cómo se pensó la web: la retícula, el recorrido y el archivo de Figma."
            notaEn="How the site was designed: the grid, the journey and the Figma file."
          />
          <BotonRuta
            href="/elysium/web"
            es="Abrir la web"
            en="Open the website"
            nota="La web funcionando: los modelos 3D, el test y tu símbolo generado en vivo."
            notaEn="The site running: the 3D models, the test and your symbol generated live."
          />
        </div>
      </div>
    </main>
  );
}
