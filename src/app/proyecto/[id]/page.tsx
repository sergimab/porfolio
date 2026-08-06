import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BackCapsule from "@/components/shared/BackCapsule";
import IlustracionesSistema from "@/components/proyectos/iberdrola/IlustracionesSistema";
import ProjectHeroTitle from "@/components/shared/ProjectHeroTitle";
import LangText from "@/components/shared/LangText";
import InfografiasViewer from "@/components/proyectos/iberdrola/InfografiasViewer";
import IconoConstruccion from "@/components/proyectos/iberdrola/IconoConstruccion";
import IconoGifs from "@/components/proyectos/iberdrola/IconoGifs";
import IconosGaleria from "@/components/proyectos/iberdrola/IconosGaleria";
import fs from "node:fs";
import path from "node:path";
import ToolIcons from "@/components/shared/ToolIcons";
import PhoneMockup from "@/components/proyectos/iberdrola/PhoneMockup";
import BackToTop from "@/components/layout/BackToTop";
import "../../page.css";
import "@/components/home/SkillDrop.css";

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

// Infografías: módulos HTML interactivos de la web corporativa de Iberdrola.
function InfografiasLanding() {
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

        <ProjectHeroTitle es="Infografías" en="Infographics" />

        <div className="project-introrow">
          <p className="project-intro">
            <LangText
              es="Esto es solo una muestra: unas pocas de las más de 160 infografías que he diseñado para la web corporativa de Iberdrola. En todas he intentado darle una vuelta a los conceptos y transformar lo estático en movimiento, para explicar procesos, instalaciones y tecnología de forma visual e interactiva."
              en="This is just a sample: a few of the 160-plus infographics I've designed for Iberdrola's corporate site. In every one I've tried to rethink the concept and turn the static into movement, explaining processes, facilities and technology in a visual, interactive way."
            />
          </p>
          <ToolIcons tools={["Figma", "Visual Studio Code", "After Effects", "Illustrator", "Blender"]} />
        </div>

        <p className="project-tagline">
          <LangText es="｡ ₊°  No solo se miran — se tocan  °₊ ｡" en="｡ ₊°  Not just for looking — for touching  °₊ ｡" />
        </p>

        <InfografiasViewer />
      </div>
    </main>
  );
}

function IlustracionesLanding() {
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

        <ProjectHeroTitle es="Sistema de ilustraciones" en="Illustration system" />

        <div className="project-introrow">
          <p className="project-intro">
            <LangText
              es="Diseñamos en equipo un sistema visual para Iberdrola que pusiera orden en el caos: qué estilo, qué piezas, para qué contexto. Infografías, banners, web. Y dentro de eso, una distinción clara entre la identidad corporativa de Iberdrola y la de su subholding Iberdrola España."
              en="As a team, we designed a visual system for Iberdrola to bring order to the chaos: which style, which pieces, for which context. Infographics, banners, web. And within that, a clear distinction between Iberdrola's corporate identity and that of its subholding Iberdrola España."
            />
          </p>
          <ToolIcons tools={["Figma", "Illustrator"]} />
        </div>

        <p className="project-tagline">
          <LangText es="｡ ₊°  No solo ilustraciones — un lenguaje  °₊ ｡" en="｡ ₊°  Not just illustrations — a language  °₊ ｡" />
        </p>

        <div style={{ marginTop: "48px" }}>
          <IlustracionesSistema />
        </div>
      </div>
    </main>
  );
}

// Newsletters: piezas de email para Iberdrola (en construcción).
function NewslettersLanding() {
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

        <ProjectHeroTitle es="Newsletters" en="Newsletters" />

        <div className="project-introrow">
          <p className="project-intro">
            <LangText
              es="Diseño y maquetación de newsletters para Iberdrola: piezas de email que combinan la identidad de marca con una jerarquía clara, pensadas para leerse bien en cualquier cliente de correo y dispositivo."
              en="Design and build of newsletters for Iberdrola: email pieces that pair the brand identity with a clear hierarchy, built to read well across any email client and device."
            />
          </p>
          <ToolIcons tools={["Figma", "Illustrator", "After Effects", "Stripo"]} />
        </div>

        {/* Vídeo de la animación final, justo debajo de la descripción */}
        <div className="nwl-video">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            src="/proyectos/iberdrola/newsletters/newsletters.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            controls
          />
        </div>

        {/* Dos newsletters navegables en mockup de móvil */}
        <div className="nwl-phones">
          <PhoneMockup src="/proyectos/iberdrola/newsletters/nwl-29-12-es.html" title="Newsletter Iberdrola — 12 hitos" />
          <PhoneMockup src="/proyectos/iberdrola/newsletters/nwl-20-08-es.html" title="Newsletter Iberdrola — verano" />
        </div>
      </div>
    </main>
  );
}

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
function IconografiaLanding() {
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

// Elysium: proyecto 3D. De momento solo la cabecera; el contenido llegará después.
function ElysiumLanding() {
  return (
    <main className="project-main">
      {/* --hero-hue en el contenedor: lo heredan el cuadro de cabecera y las
          cajas de medios, para que todo vaya del color de la categoría. */}
      <div className="project-content-wrap" style={{ ["--hero-hue" as string]: 262 }}>
        <div
          className="hover-trail-target project-hero-box"
          data-trail-hue="262"
          data-tint-color="#5D21C4"
        >
          <span className="project-back">
            <BackCapsule category="3d" />
          </span>

          <div className="project-meta">
            <div className="project-meta-row">
              <span className="project-meta-key"><LangText es="Tipo" en="Type" /></span>
              <span><LangText es="TFG" en="Final degree project" /></span>
            </div>
            <div className="project-meta-row">
              <span className="project-meta-key"><LangText es="Rol" en="Role" /></span>
              <span><LangText es="Dirección de arte y 3D" en="Art direction and 3D" /></span>
            </div>
          </div>
        </div>

        <ProjectHeroTitle es="Elysium" en="Elysium" />

        <div className="project-introrow">
          <p className="project-intro">
            <LangText
              es="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
              en="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
            />
          </p>
          <ToolIcons tools={["Blender", "After Effects", "Photoshop", "Illustrator", "Figma"]} />
        </div>

        <p className="project-tagline">
          <LangText es="｡ ₊°  Texto provisional — pendiente de escribir  °₊ ｡" en="｡ ₊°  Placeholder copy — still to be written  °₊ ｡" />
        </p>

        {/* Animación del logo: franja a todo el ancho. El 16:9 original se
            recorta a 350px de alto (el logo va centrado, así que no se pierde). */}
        <div className="project-media" style={{ ["--media-h" as string]: "350px" }}>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            src="/proyectos/elysium/logo.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
        </div>
      </div>
    </main>
  );
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const title = titles[id] ?? "Proyecto";

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />

      {id === "i5" ? (
        <IlustracionesLanding />
      ) : id === "i1" ? (
        <InfografiasLanding />
      ) : id === "i3" ? (
        <NewslettersLanding />
      ) : id === "i4" ? (
        <IconografiaLanding />
      ) : id === "d1" ? (
        <ElysiumLanding />
      ) : (
        <main className="project-soon">
          <BackCapsule category={catFromId(id)} />
          <span className="project-soon-note">Próximamente</span>
          <h1 className="project-soon-title">{title}</h1>
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
