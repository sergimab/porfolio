import BackCapsule from "@/components/shared/BackCapsule";
import ProjectHeroTitle from "@/components/shared/ProjectHeroTitle";
import LangText from "@/components/shared/LangText";
import ToolIcons from "@/components/shared/ToolIcons";
import PliegoAncho from "./PliegoAncho";

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
              es="El diseño de Elysium no se queda en la pantalla ni en la portada. Quería que **todo lo que llegara a las manos** de quien comprara el álbum, desde el primer pliego hasta el propio disco, hablara el **mismo idioma visual**."
              en="The design of Elysium doesn't stop at the screen or the cover. I wanted **everything that reached the hands** of whoever bought the album, from the first fold to the disc itself, to speak the **same visual language**."
            />
          </p>
          <ToolIcons tools={["InDesign", "Photoshop"]} />
        </div>

        <p className="project-tagline">
          <LangText
            es="｡ ₊°  Setenta centímetros que caben en la palma de la mano  °₊ ｡"
            en="｡ ₊°  Seventy centimetres that fold into the palm of a hand  °₊ ｡"
          />
        </p>

        {/* El desplegable */}
        <div className="project-text">
          <p>
            <LangText
              es="En vez del cuadernillo de siempre, el álbum incluye un **desplegable acordeón de seis cuerpos** que se abre hasta casi **setenta centímetros**. Por un lado aparecen distintas versiones del alter ego de Gaga en 3D, cada una explorando una faceta distinta del personaje. Al desplegarlo del todo, el reverso revela un collage con el nombre **GAGA** a gran formato y los símbolos de cada una de sus eras. Y donde normalmente irían las letras de las canciones, hay **un poema para cada una**, algo que la propia Gaga ha dicho que le gustaría explorar en su música."
              en="Instead of the usual booklet, the album comes with a **six-panel accordion fold-out** that opens to almost **seventy centimetres**. One side shows different versions of Gaga's alter ego in 3D, each exploring a different facet of the character. Opened out in full, the reverse reveals a collage with the name **GAGA** at large scale and the symbols of every one of her eras. And where the lyrics would normally go, there is **a poem for each song** — something Gaga herself has said she would like to explore in her music."
            />
          </p>
        </div>

        <PliegoAncho
          src="/proyectos/disco-elysium/desplegable-aff-1.webp"
          alt="El desplegable acordeón abierto: versiones del alter ego de Gaga en 3D"
        />
        <PliegoAncho
          src="/proyectos/disco-elysium/desplegable-aff-2.webp"
          alt="El reverso del desplegable: collage con el nombre GAGA y los símbolos de cada era"
        />

        {/* El disco: texto a la izquierda y la galleta a la derecha. La pieza
            es cuadrada, así que se le da algo más de ancho que los 340 por
            defecto de la fila, pensados para piezas apaisadas. */}
        <div className="project-row" style={{ ["--row-media-w" as string]: "380px" }}>
          <div className="project-text">
            <p>
              <LangText
                es="Y luego está el disco en sí. Fondo negro profundo, con el símbolo principal de Elysium en el centro, pero **sin imprimir directamente encima, en transparencia**. Eso deja que se vea el propio material del CD por debajo, que ya de por sí es semitransparente y con **reflejos iridiscentes**. El resultado cambia según le da la luz, como si el símbolo **respirara** sobre la superficie en vez de estar pegado a ella."
                en="And then there's the disc itself. A deep black background with the main Elysium symbol at the centre, though **not printed straight onto it — left transparent**. That lets the CD's own material show through underneath, which is already semi-transparent and full of **iridescent reflections**. The result shifts with the light, as if the symbol were **breathing** on the surface rather than stuck to it."
              />
            </p>
          </div>

          <div className="project-media">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/proyectos/disco-elysium/galleta-cd.webp"
              alt="Diseño de la galleta del CD: el símbolo de Elysium en transparencia sobre fondo negro"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
