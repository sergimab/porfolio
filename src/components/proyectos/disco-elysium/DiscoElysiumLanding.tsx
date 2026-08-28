import BackCapsule from "@/components/shared/BackCapsule";
import ProjectHeroTitle from "@/components/shared/ProjectHeroTitle";
import LangText from "@/components/shared/LangText";
import ToolIcons from "@/components/shared/ToolIcons";
import BotonEntregable from "@/components/shared/BotonEntregable";
import PliegoAncho from "./PliegoAncho";
import TiraDeslizante from "./TiraDeslizante";

// Ancho de las piezas que van junto a un texto. En un solo sitio porque lo
// comparten el inlay y el disco: si se cambia, tienen que cambiar las dos.
const ANCHO_PIEZA = "440px";

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
        <div className="project-boton-fila">
          <BotonEntregable href="/proyectos/disco-elysium/entregable-desplegable.pdf" />
        </div>

        {/* El inlay: las dos caras turnándose a la izquierda y el texto a la
            derecha. La pieza va primero en el orden del documento, así que al
            apilarse en móvil queda encima del texto. */}
        <div className="project-row" style={{ ["--row-media-w" as string]: ANCHO_PIEZA }}>
          <div className="project-media" style={{ border: "none", padding: 0 }}>
            <TiraDeslizante
              imagenes={[
                {
                  src: "/proyectos/disco-elysium/inlay-disco-elysium-1.webp",
                  alt: "Inlay del álbum: la vista trasera del avatar de Elysium",
                },
                {
                  src: "/proyectos/disco-elysium/inlay-disco-elysium-2.webp",
                  alt: "Inlay del álbum: el lettering de Elysium sobre el reverso",
                },
              ]}
            />
          </div>

          <div className="project-text">
            <p>
              <LangText
                es="Para el reverso se usó la **vista trasera de ese mismo avatar**, con la misma iluminación que en portada para que ambas caras se sientan como parte de una **sola pieza**. Lo único que se añade aquí es el **lettering de «Elysium»**, construido también con el mismo sistema de **Geometry Nodes** que da forma a todo lo demás en el proyecto."
                en="For the reverse I used the **back view of that same avatar**, lit exactly as it is on the cover so that both faces read as parts of a **single piece**. The only addition here is the **“Elysium” lettering**, built with the same **Geometry Nodes** system that shapes everything else in the project."
              />
            </p>
          </div>
        </div>
        <div className="project-boton-fila">
          <BotonEntregable href="/proyectos/disco-elysium/entregable-inlay.pdf" />
        </div>

        {/* El disco: texto a la izquierda y la galleta a la derecha, al mismo
            ancho que la pieza del inlay para que las dos filas se lean como un
            par y no como dos bloques sueltos. */}
        <div className="project-row" style={{ ["--row-media-w" as string]: ANCHO_PIEZA }}>
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

        {/* El de esta sección va bajo la galleta, no bajo el texto: acompaña a
            la pieza, y así los tres botones quedan a la misma altura de la
            columna derecha. */}
        <div className="project-boton-fila">
          <BotonEntregable href="/proyectos/disco-elysium/entregable-disco.pdf" />
        </div>

        {/* Cierre: el conjunto montado. */}
        <div className="project-duo">
          <div className="project-media">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/proyectos/disco-elysium/mockup-1.webp"
              alt="El álbum de Elysium montado, con el desplegable y el disco"
              loading="lazy"
            />
          </div>
          <div className="project-media">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/proyectos/disco-elysium/mockup-2.webp"
              alt="Otra vista del álbum de Elysium montado"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
