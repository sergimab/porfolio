import fs from "node:fs";
import path from "node:path";
import BackCapsule from "@/components/shared/BackCapsule";
import ProjectHeroTitle from "@/components/shared/ProjectHeroTitle";
import LangText from "@/components/shared/LangText";
import ToolIcons from "@/components/shared/ToolIcons";
import Recomendados from "@/components/shared/Recomendados";
import DropcapTitle from "@/components/shared/DropcapTitle";
import SimboloScroll, { GaleriaSimbolos } from "./SimboloScroll";
import PosesFusion from "./PosesFusion";
import LienzoMetal from "./LienzoMetal";

// La figura final es opcional: mientras el archivo no esté en su sitio, las
// poses se quedan fusionadas y no se intenta pintar una imagen que no existe.
function siExiste(ruta: string): string | null {
  return fs.existsSync(path.join(process.cwd(), "public", ruta)) ? ruta : null;
}

// Los símbolos de fans se leen de la carpeta en cada render del servidor: al
// soltar más archivos icono-fan-*, aparecen en la galería sin tocar el código.
function iconosDeFans(): string[] {
  const dir = path.join(process.cwd(), "public/proyectos/elysium");
  try {
    return fs
      .readdirSync(dir)
      .filter((f) => /^icono-fan-.*\.webp$/i.test(f))
      .sort((a, b) => a.localeCompare(b, "es", { numeric: true }))
      .map((f) => `/proyectos/elysium/${f}`);
  } catch {
    return [];
  }
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

        {/* Cómo nace cada símbolo: tres pasos con el bloque fijo en
            pantalla, y después la galería de símbolos de fans. */}
        <SimboloScroll />
        <GaleriaSimbolos iconos={iconosDeFans()} />

        {/* Lienzo interactivo, con su explicación delante. */}
        <div className="project-text">
          <p>
            <LangText
              es="Lo que viene ahora es una **simulación** del sistema que monté en **Blender** para desarrollar las formas y las texturas: allí, unos **Geometry Nodes** convertían cada trazo en volumen y lo fundían con los de al lado. Aquí puedes probarlo tú."
              en="What comes next is a **simulation** of the system I built in **Blender** to develop the shapes and textures: there, a **Geometry Nodes** setup turned each stroke into volume and merged it with the ones beside it. Here you can try it yourself."
            />
          </p>
        </div>
        <LienzoMetal />

        {/* Los iconos de cada era, rehechos con el mismo sistema. */}
        <div className="project-text">
          <p>
            <LangText
              es="Antes de generar símbolos nuevos, había un lenguaje ya construido que llevaba **quince años** ahí. Cada era de Lady Gaga tiene su propio icono, el **rayo de The Fame**, el **triángulo invertido de Born This Way**, la **esfera de ARTPOP**, la **onda de Chromatica**, entre otros que fueron apareciendo con cada disco."
              en="Before generating any new symbols, there was already a language in place that had been there for **fifteen years**. Every Lady Gaga era has its own icon: the **lightning bolt of The Fame**, the **inverted triangle of Born This Way**, the **ARTPOP sphere**, the **Chromatica wave**, among others that appeared with each record."
            />
          </p>
          <p>
            <LangText
              es="En vez de dejarlos fuera del proyecto, los pasé por el mismo sistema que da forma a todo Elysium. Usando **Geometry Nodes** en Blender, cada icono se reconstruyó **desde cero**, conservando lo que lo hace reconocible pero hablando ahora en **formas orgánicas**, **texturas metálicas** y esa sensación de algo vivo que define el resto del universo."
              en="Rather than leaving them out of the project, I ran them through the same system that shapes all of Elysium. Using **Geometry Nodes** in Blender, each icon was rebuilt **from scratch**, keeping what makes it recognisable but now speaking in **organic shapes**, **metallic textures** and that sense of something alive that defines the rest of the universe."
            />
          </p>
        </div>

        <div className="project-media">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            src="/proyectos/elysium/simbolos-home-video.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="Los iconos de cada era de Lady Gaga, rehechos con el lenguaje de Elysium"
          />
        </div>

        {/* ── Bloque: creación del avatar ──────────────────────────────
            Va después del contenido nuevo. Son cuatro piezas seguidas
            (texto, texto + gif, secuencia de poses y lienzo) que se mueven
            juntas si hace falta reordenar. */}

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

        {/* ── Fin del bloque: creación del avatar ─────────────────────── */}

        {/* Cierre: las otras dos páginas del universo Elysium. */}
        <Recomendados ids={["e1", "u1"]} />
      </div>
    </main>
  );
}
