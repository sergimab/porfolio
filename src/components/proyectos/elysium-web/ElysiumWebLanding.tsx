import fs from "node:fs";
import path from "node:path";
import BackCapsule from "@/components/shared/BackCapsule";
import ProjectHeroTitle from "@/components/shared/ProjectHeroTitle";
import LangText from "@/components/shared/LangText";
import ToolIcons from "@/components/shared/ToolIcons";
import DropcapTitle from "@/components/shared/DropcapTitle";
import BotonEntregable from "@/components/shared/BotonEntregable";
import VisorEra from "./VisorEra";
import TestSimbolo from "./TestSimbolo";

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

// Web de Elysium: el proyecto de UI/UX. Dos apartados —el diseño en Figma y la
// simulación de la web funcionando— porque son las dos mitades del mismo
// trabajo: lo que se dibujó y lo que hace cuando se mueve.
export default function ElysiumWebLanding() {
  const pantallas = pantallasFigma();

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

        {/* ── 1. El diseño ── */}
        <h2 className="project-h2">
          <DropcapTitle es="El diseño en Figma" en="The design in Figma" />
        </h2>

        <div className="project-text">
          <p>
            <LangText
              es="Antes de que nada se moviera, la web se diseñó entera en **Figma**: la retícula, la tipografía, el recorrido de la home al test y la pantalla donde nace el símbolo. El archivo mantiene la misma tensión que el álbum —mucho negro, mucho aire y el metal como único color— para que pasar del disco a la pantalla no se sienta como cambiar de proyecto."
              en="Before anything moved, the whole site was designed in **Figma**: the grid, the typography, the journey from the home page to the test, and the screen where the symbol is born. The file keeps the same tension as the album — lots of black, lots of air and metal as the only colour — so that going from the record to the screen never feels like changing project."
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

        {/* ── 2. La simulación ── */}
        <h2 className="project-h2">
          <DropcapTitle es="La web funcionando" en="The website running" />
        </h2>

        <div className="project-text">
          <p>
            <LangText
              es="Y esto ya no es una maqueta: es la web **funcionando de verdad**, aquí dentro. Los símbolos de cada era son los **modelos 3D que salieron de Blender**, cargados en el navegador y girando. El test es el test. Y el símbolo del final se genera en vivo mientras eliges, con el **mismo motor de metal** que dibuja el lienzo de la página de Elysium."
              en="And this is no longer a mockup: it's the website **actually running**, right here. The era symbols are the **3D models exported from Blender**, loaded in the browser and turning. The test is the test. And the final symbol is generated live as you choose, with the **same metal engine** that draws the canvas on the Elysium page."
            />
          </p>
        </div>

        <VisorEra />

        <div className="project-text">
          <p>
            <LangText
              es="El test pregunta lo mismo que preguntó el proyecto: **qué canciones te representan**. Cuantas más elijas de un disco, más se estira la figura hacia su punta. La línea sale del centro, visita los álbumes **del más votado al menos votado** y se cierra sobre sí misma — y como las puntas están repartidas por orden de discografía y el recorrido va por número de votos, la línea **se cruza consigo misma**. De esos cruces nacen las masas."
              en="The test asks what the project asked: **which songs represent you**. The more you pick from a record, the further the figure stretches towards its point. The line leaves the centre, visits the albums **from most to least voted** and closes on itself — and because the points are laid out in discography order while the route follows the vote count, the line **crosses itself**. Those crossings are where the mass comes from."
            />
          </p>
        </div>

        <TestSimbolo />
      </div>
    </main>
  );
}
