import BackCapsule from "@/components/shared/BackCapsule";
import ProjectHeroTitle from "@/components/shared/ProjectHeroTitle";
import LangText from "@/components/shared/LangText";
import ToolIcons from "@/components/shared/ToolIcons";
import DropcapTitle from "@/components/shared/DropcapTitle";
import Recomendados from "@/components/shared/Recomendados";
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
// El promocional abre, y detrás van las piezas cortas: el cartel del menú, la
// intro de tráileres y el cartel vertical de mupi. La estructura es la misma
// que la de la página de branding, así que se le pueden ir añadiendo más sin
// rehacer nada.
export default function MotionLanding() {
  return (
    <main className="project-main">
      {/* --hero-hue en el contenedor: lo heredan el cuadro de cabecera y las
          cajas de medios, para que todo vaya del color de la categoría. El 217
          es el azul de Motion Graphics; sale de la cápsula, no de un color
          elegido aquí, así que si allí cambia hay que cambiarlo también aquí.
          (Era el 32, el ámbar, hasta que Motion y Fotografía se cambiaron el
          color.) El tinte es ese mismo tono con el brillo y la saturación del
          rosa de Branding, para que las dos páginas del proyecto pesen igual. */}
      <div className="project-content-wrap" style={{ ["--hero-hue" as string]: 217 }}>
        <div
          className="hover-trail-target project-hero-box"
          data-trail-hue="217"
          data-tint-color="#286DDC"
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


        {/* La intro va en horizontal, que es como está rodada. Se probó a
            encajarla a lo alto, al lado del cartel: de un 16:9 metido en un
            9:16 solo se salva el 32 % del ancho, y en el segundo 3 el logotipo
            de yelmo cruza el encuadre entero, así que quedaba partido. */}
        <section className="motion-seccion">
          <RotuloSeccion es="Intro de tráileres" en="Trailer intro" />
          <VideoMarca
            src="/proyectos/yelmo-motion/intro-traileres.mp4"
            proporcion="16 / 9"
            fondo="#000"
            /* Los dos primeros segundos son el fundido de entrada, casi a
               oscuras: hasta que arranca, la caja enseña el fotograma del
               segundo 3, con el logotipo. */
            cartel="/proyectos/yelmo-motion/intro-traileres-poster.webp"
            alt="Intro animada que precede a los tráileres en sala"
          />
        </section>

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
            Como en la franja de vuelta, la versión estrecha es el recorte
            central a más tamaño, con la medida que llevan todas las del
            sitio. */}
        <section className="motion-seccion">
          <Recomendados ids={["b2", "m2"]} />
        </section>
      </div>
    </main>
  );
}
