import fs from "node:fs";
import path from "node:path";
import BackCapsule from "@/components/shared/BackCapsule";
import ProjectHeroTitle from "@/components/shared/ProjectHeroTitle";
import LangText from "@/components/shared/LangText";
import ToolIcons from "@/components/shared/ToolIcons";
import PosesFusion from "./PosesFusion";
import LienzoFluido from "./LienzoFluido";

// La figura final es opcional: mientras el archivo no esté en su sitio, las
// poses se quedan fusionadas y no se intenta pintar una imagen que no existe.
function siExiste(ruta: string): string | null {
  return fs.existsSync(path.join(process.cwd(), "public", ruta)) ? ruta : null;
}

// Elysium: TFG de Diseño Gráfico (categoría 3D).
// Todo el contenido y los textos de la página viven aquí.
export default function ElysiumLanding() {
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
              es="Un proyecto de diseño gráfico conceptual que convierte a Lady Gaga en una **deidad**, su discografía en un **santuario**, y a cada fan en el **creador de su propio legado**. A través de una experiencia interactiva, cada usuario construye su **álbum recopilatorio personal**, con una portada única generada a partir de sus canciones favoritas. TFG de Diseño Gráfico."
              en="A conceptual graphic design project that turns Lady Gaga into a **deity**, her discography into a **sanctuary**, and every fan into the **creator of their own legacy**. Through an interactive experience, each user builds their own **personal compilation album**, with a unique cover generated from their favourite songs. Final degree project in Graphic Design."
            />
          </p>
          <ToolIcons tools={["Blender", "Figma", "Daz Studio", "After Effects", "Photoshop", "Illustrator"]} />
        </div>

        <p className="project-tagline">
          <LangText
            es="｡ ₊°  El álbum que Lady Gaga nunca sacó (pero yo sí diseñé)  °₊ ｡"
            en="｡ ₊°  The album Lady Gaga never released (but I did design)  °₊ ｡"
          />
        </p>

        {/* Animación del logo: franja a todo el ancho. El 16:9 original se
            recorta a 280px de alto (el logo va centrado, así que no se pierde). */}
        <div className="project-media" style={{ ["--media-h" as string]: "280px" }}>
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

        {/* Primer párrafo, a todo el ancho. */}
        <div className="project-text">
          <p>
            <LangText
              es="Antes de ser una portada, Elysium fue una **figura**. Un cuerpo construido pieza a pieza para condensar quince años de carrera en un único alter ego: **parte humano, parte símbolo, parte deidad**."
              en="Before it was a cover, Elysium was a **figure**. A body built piece by piece to condense fifteen years of a career into a single alter ego: **part human, part symbol, part deity**."
            />
          </p>
        </div>

        {/* Debajo: el resto del texto a la izquierda y el modelo base del
            avatar a la derecha. */}
        <div className="project-row">
          <div className="project-text">
            <p>
              <LangText
                es="El rostro y el cuerpo de Lady Gaga se modelaron en 3D con precisión, combinando **Face Tracker** y **FaceGen** para capturar sus rasgos reales, **Daz Studio** para construir el cuerpo y las poses, y **Blender** para dar forma final a la figura. **No buscaba el fotorrealismo**, sino algo más elevado: una versión de Lady Gaga transformada en **representación casi sagrada** de todo lo que ha significado para quienes la han seguido. Esta es la figura que sostiene el resto del proyecto, y así es como se construyó."
                en="Lady Gaga's face and body were modelled in 3D with precision, combining **Face Tracker** and **FaceGen** to capture her real features, **Daz Studio** to build the body and the poses, and **Blender** to give the figure its final shape. **I wasn't after photorealism**, but something more elevated: a version of Lady Gaga turned into an **almost sacred representation** of everything she has meant to those who have followed her. This is the figure the rest of the project rests on, and this is how it was built."
              />
            </p>
          </div>

          <div className="project-media">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/proyectos/elysium/avatar.webp"
              alt="Modelo base del avatar de Elysium girando sobre sí mismo"
              loading="lazy"
            />
          </div>
        </div>

        {/* Las tres poses: entran en fila y se fusionan al verse. */}
        <PosesFusion
          imagenFinal={siExiste("/proyectos/elysium/figura-final.webp")}
          imagenPareja={siExiste("/proyectos/elysium/portada1-notexture.webp")}
          relevoIzquierda={siExiste("/proyectos/elysium/portada-2.webp")}
          relevoDerecha={siExiste("/proyectos/elysium/portada-1.webp")}
        />

        {/* Lienzo interactivo: trazos que se funden como metaballs, guiño al
            sistema de Geometry Nodes con el que se construyó la figura. */}
        <LienzoFluido />
      </div>
    </main>
  );
}
