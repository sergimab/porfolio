import fs from "node:fs";
import path from "node:path";
import BackCapsule from "@/components/shared/BackCapsule";
import ProjectHeroTitle from "@/components/shared/ProjectHeroTitle";
import LangText from "@/components/shared/LangText";
import ToolIcons from "@/components/shared/ToolIcons";
import IconoConstruccion from "./IconoConstruccion";
import IconoGifs from "./IconoGifs";
import IconosGaleria from "./IconosGaleria";

// Las listas de iconos se leen del disco en cada render del servidor, en vez de
// mantener un listado a mano: al soltar SVG nuevos en la carpeta aparecen solos.
function listarSvg(carpeta: string): string[] {
  const dir = path.join(process.cwd(), "public/proyectos/iberdrola/iconografia", carpeta);
  try {
    return fs
      .readdirSync(dir)
      .filter((f) => f.toLowerCase().endsWith(".svg"))
      .sort((a, b) => a.localeCompare(b, "es"));
  } catch {
    return [];
  }
}

// Iconografía: sistema de iconos para la web corporativa de Iberdrola.
export default function IconografiaLanding() {
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

        <ProjectHeroTitle es="Iconografía" en="Iconography" />

        <div className="project-introrow">
          <p className="project-intro">
            <LangText
              es="Un sistema de más de 500 iconos para la web corporativa de Iberdrola: una familia coherente en trazo, peso y rejilla, pensada para funcionar igual de bien a tamaño pequeño dentro de una tabla que ampliada en una infografía."
              en="An icon system comprising more than 500 icons for Iberdrola’s corporate website: a cohesive family with consistent stroke, weight and grid, designed to work equally well at small sizes within a table and at larger scales in an infographic."
            />
          </p>
          <ToolIcons tools={["Figma", "Illustrator", "After Effects"]} />
        </div>

        <p className="project-tagline">
          <LangText es="｡ ₊°  Mil ideas — un mismo trazo  °₊ ｡" en="｡ ₊°  A thousand ideas — one single stroke  °₊ ｡" />
        </p>

        <IconoConstruccion />
        <IconoGifs />
        {/* svg-oscuro solo contiene los iconos con partes blancas, teñidas del
            fondo oscuro; la galería elige la variante según el tema activo. */}
        <IconosGaleria iconos={listarSvg("svg")} conBlanco={listarSvg("svg-oscuro")} />
      </div>
    </main>
  );
}
