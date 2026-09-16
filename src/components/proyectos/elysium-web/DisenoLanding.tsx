import fs from "node:fs";
import path from "node:path";
import BackCapsule from "@/components/shared/BackCapsule";
import ProjectHeroTitle from "@/components/shared/ProjectHeroTitle";
import LangText from "@/components/shared/LangText";
import ToolIcons from "@/components/shared/ToolIcons";
import DropcapTitle from "@/components/shared/DropcapTitle";
import BotonEntregable from "@/components/shared/BotonEntregable";
import BotonRuta from "@/components/shared/BotonRuta";

// Enlace público al archivo de Figma. Mientras esté vacío, el botón no se
// pinta: más vale que no haya botón a que haya uno que no lleva a ningún sitio.
const FIGMA = "";

// Las pantallas del diseño se leen de la carpeta, igual que los iconos de fans
// en la página de Elysium: al soltar más archivos figma-*.webp aparecen solas,
// en orden, sin tocar el código.
function pantallasFigma(): string[] {
  const dir = path.join(process.cwd(), "public/proyectos/elysium-web");
  try {
    return fs
      .readdirSync(dir)
      .filter((f) => /^figma-.*\.(webp|png|jpg)$/i.test(f))
      .sort((a, b) => a.localeCompare(b, "es", { numeric: true }))
      .map((f) => `/proyectos/elysium-web/${f}`);
  } catch {
    return [];
  }
}

// El caso: cómo se diseñó la web y cómo se prototipó. La otra mitad —la web
// funcionando— vive en /elysium/web, a pantalla completa.
export default function DisenoLanding() {
  const pantallas = pantallasFigma();

  return (
    <main className="project-main">
      <div className="project-content-wrap" style={{ ["--hero-hue" as string]: 175 }}>
        <div
          className="hover-trail-target project-hero-box"
          data-trail-hue="175"
          data-tint-color="#0D9488"
        >
          <span className="project-back">
            {/* Vuelve al proyecto, no a la categoría: esta página es una parte
                de la Web de Elysium, y saltar a la parrilla de UI/UX se saltaría
                el escalón intermedio. */}
            <BackCapsule category="uiux" href="/elysium/web" rotulo="Web de Elysium" />
          </span>

          <div className="project-meta">
            <div className="project-meta-row">
              <span className="project-meta-key"><LangText es="Fase" en="Stage" /></span>
              <span><LangText es="Diseño y prototipo" en="Design and prototype" /></span>
            </div>
            <div className="project-meta-row">
              <span className="project-meta-key"><LangText es="Herramienta" en="Tool" /></span>
              <span>Figma</span>
            </div>
          </div>
        </div>

        <ProjectHeroTitle es="El diseño" en="The design" />

        <div className="project-introrow">
          <p className="project-intro">
            <LangText
              es="Antes de que nada se moviera, la web se diseñó entera en **Figma**: la retícula, la tipografía, el recorrido de la home al test y la pantalla donde nace el símbolo."
              en="Before anything moved, the whole site was designed in **Figma**: the grid, the typography, the journey from the home page to the test, and the screen where the symbol is born."
            />
          </p>
          <ToolIcons tools={["Figma"]} />
        </div>

        <h2 className="project-h2">
          <DropcapTitle es="La retícula y el tono" en="Grid and tone" />
        </h2>

        <div className="project-text">
          <p>
            <LangText
              es="El archivo mantiene la misma tensión que el álbum —**mucho negro, mucho aire y el metal como único color**— para que pasar del disco a la pantalla no se sienta como cambiar de proyecto. La tipografía y los márgenes son los del impreso, reescalados: lo que en el desplegable era un pliego de setenta centímetros, aquí es una columna que respira igual."
              en="The file keeps the same tension as the album — **lots of black, lots of air and metal as the only colour** — so that going from the record to the screen never feels like changing project. The type and the margins are the printed ones, rescaled: what was a seventy-centimetre fold-out becomes a column that breathes the same way."
            />
          </p>
        </div>

        <h2 className="project-h2">
          <DropcapTitle es="El prototipo" en="The prototype" />
        </h2>

        <div className="project-text">
          <p>
            <LangText
              es="El prototipo de Figma sirvió para probar el **recorrido**: cuántas pantallas hay entre llegar y tener tu símbolo, y en qué momento aparece el test. Lo que Figma no podía resolver era lo importante —que el símbolo **se genere de verdad** con tus respuestas—, y por eso el paso siguiente no fue otra pantalla, sino código."
              en="The Figma prototype was there to test the **journey**: how many screens sit between arriving and having your symbol, and when the test appears. What Figma could not solve was the important part — that the symbol is **actually generated** from your answers — and so the next step was not another screen, but code."
            />
          </p>
        </div>

        {pantallas.length > 0 && (
          <div className="project-pila">
            {pantallas.map((src) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={src}
                className="es-redondeada"
                src={src}
                alt="Pantalla del diseño de la web de Elysium en Figma"
                loading="lazy"
              />
            ))}
          </div>
        )}

        {FIGMA && (
          <div className="project-boton-fila">
            <BotonEntregable href={FIGMA} es="Ver en Figma" en="View in Figma" />
          </div>
        )}

        {/* El paso natural al terminar de leer el caso: ver aquello de lo que
            habla el último párrafo. */}
        <div className="project-accesos">
          <BotonRuta
            href="/elysium/web"
            es="Abrir la web"
            en="Open the website"
            nota="Lo que el prototipo no podía hacer: el símbolo generándose de verdad."
            notaEn="What the prototype couldn't do: the symbol actually being generated."
          />
        </div>
      </div>
    </main>
  );
}
