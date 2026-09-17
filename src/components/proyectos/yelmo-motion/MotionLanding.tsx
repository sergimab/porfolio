import BackCapsule from "@/components/shared/BackCapsule";
import ProjectHeroTitle from "@/components/shared/ProjectHeroTitle";
import LangText from "@/components/shared/LangText";
import ToolIcons from "@/components/shared/ToolIcons";
import DropcapTitle from "@/components/shared/DropcapTitle";
import CtaBanner from "@/components/shared/CtaBanner";
import RotuloSeccion from "@/components/shared/RotuloSeccion";
import VideoPromo from "./VideoPromo";
// De la carpeta de branding: es el mismo proyecto y el mismo trato para una
// pieza muda en bucle, así que no hay por qué tener dos componentes iguales.
import VideoMarca from "../yelmo/VideoMarca";
import "./MotionLanding.css";

// La pata de animación del proyecto de Yelmo: el vídeo promocional y las demás
// piezas en movimiento.
//
// Va en página aparte y no dentro de la de branding porque son dos disciplinas
// distintas del mismo encargo, y en el portfolio cada una vive en su
// categoría: la marca en Branding, esto en Motion. Las dos se enlazan con la
// franja del final.
//
// El promocional abre, y detrás van las piezas cortas: el cartel del menú y el
// cartel vertical de mupi.
//
// Falta la intro de tráileres. Estaba montada con el reproductor de Vimeo y no
// llegaba a verse, así que se ha quitado: una caja con un error dentro es peor
// que no tenerla. Vuelve en cuanto haya archivo, como las demás. La estructura es la misma
// que la de la página de branding, así que se le pueden ir añadiendo más sin
// rehacer nada.
export default function MotionLanding() {
  return (
    <main className="project-main">
      {/* --hero-hue en el contenedor: lo heredan el cuadro de cabecera y las
          cajas de medios, para que todo vaya del color de la categoría. El 32
          es el naranja de Motion Graphics; sale de la cápsula, no de un color
          elegido aquí, así que si allí cambia hay que cambiarlo también aquí.
          El tinte es ese mismo tono con el brillo y la saturación del rosa de
          Branding, para que las dos páginas del proyecto pesen igual. */}
      <div className="project-content-wrap" style={{ ["--hero-hue" as string]: 32 }}>
        <div
          className="hover-trail-target project-hero-box"
          data-trail-hue="32"
          data-tint-color="#DB8727"
        >
          <span className="project-back">
            <BackCapsule category="motion" />
          </span>

          {/* Sin fila de equipo: este lo hice solo, como el branding. */}
          <div className="project-meta">
            <div className="project-meta-row">
              <span className="project-meta-key"><LangText es="Tipo" en="Type" /></span>
              <span>
                <LangText es="Motion graphics" en="Motion graphics" />
              </span>
            </div>
            <div className="project-meta-row">
              <span className="project-meta-key"><LangText es="Asignatura" en="Course" /></span>
              <span>
                <LangText es="Proyectos LAB · ESD Madrid" en="LAB Projects · ESD Madrid" />
              </span>
            </div>
          </div>
        </div>

        <ProjectHeroTitle es="Motion Yelmo Cines" en="Yelmo Cines motion" />

        <div className="project-introrow">
          <p className="project-intro">
            <LangText
              es="La **tercera pata** del rebranding de Yelmo: poner la marca en movimiento. De aquí salió el **vídeo promocional** de la propuesta, junto a otras piezas animadas que llevan el sistema gráfico al terreno del **tiempo y el ritmo**."
              en="The **third strand** of the Yelmo rebrand: setting the brand in motion. It produced the **promo video** for the proposal, along with other animated pieces that take the graphic system into the realm of **time and rhythm**."
            />
          </p>
          <ToolIcons tools={["After Effects", "Illustrator", "Photoshop"]} />
        </div>

        {/* La pieza principal: el promocional de la propuesta. Va con
            controles y con cartel porque suena —ver el componente—. */}
        <section className="motion-seccion">
          <RotuloSeccion es="Vídeo promocional" en="Promo video" />
          <VideoPromo
            src="/proyectos/yelmo-motion/rebranding-yelmo.mp4"
            poster="/proyectos/yelmo-motion/rebranding-yelmo-poster.webp"
            titulo="Vídeo promocional del rebranding de Yelmo Cines"
          />
        </section>

        {/* Las piezas cortas. Las tres van mudas de origen, así que se
            reproducen solas y en bucle, sin controles: son láminas que se
            miran, no vídeos que haya que manejar. El componente es el mismo que
            usa la página de branding —mismo proyecto, mismo trato—. */}
        <section className="motion-seccion">
          <RotuloSeccion es="Cartel de menú" en="Menu poster" />
          <VideoMarca
            src="/proyectos/yelmo-motion/cartel-menu.mp4"
            proporcion="16 / 9"
            fondo="#131313"
            alt="Cartel animado del menú de palomitas y refresco"
          />
        </section>

        {/* El cartel vertical va con su ancho corto y centrado: a 9:16 y a todo
            el ancho de la columna mediría más de metro y medio de alto y no
            cabría de una vez en ninguna pantalla. Así se ve entero, que es
            justo lo que pide un mupi. */}
        <section className="motion-seccion">
          <RotuloSeccion es="Cartel vertical" en="Vertical poster" />
          <div className="motion-vertical">
            <VideoMarca
              src="/proyectos/yelmo-motion/cartel-vertical.mp4"
              proporcion="9 / 16"
              fondo="#278FB2"
              alt="Cartel vertical animado de La Sirenita, para mupi o historia de Instagram"
            />
          </div>
        </section>

        {/* La marca tiene página propia, en Branding: allí está el sistema del
            que sale todo lo que aquí se mueve.
            Como en la franja de vuelta, la versión estrecha es un recorte a la
            misma escala —684 px del original—, encuadrado para que el logotipo
            entre entero. */}
        <section className="motion-seccion">
          <h2 className="project-h2">
            <DropcapTitle es="Páginas recomendadas" en="Recommended pages" />
          </h2>
          <CtaBanner
            href="/proyecto/b2"
            es="Ver el rebranding de la marca"
            en="See the brand rebrand"
            imagen="/banners/rebranding-yelmo.webp"
            imagenMovil="/banners/rebranding-yelmo-movil.webp"
            alt="El logotipo de Yelmo sobre la trama de la marca"
          />
        </section>
      </div>
    </main>
  );
}
