import BackCapsule from "@/components/shared/BackCapsule";
import ProjectHeroTitle from "@/components/shared/ProjectHeroTitle";
import LangText from "@/components/shared/LangText";
import ToolIcons from "@/components/shared/ToolIcons";
import Galeria from "./Galeria";

// El ámbar de Fotografía, el mismo que el de su cápsula en la home.
const HUE = 32;
const TINTE = "#D97706";

const CARPETA = "/proyectos/orquesta-tokio-galeria";
// Las fotos van numeradas del 01 en adelante, así que basta con decir cuántas
// son. Si mañana se añaden, se cambia este número y ya.
const TOTAL = 40;

export default function GaleriaLanding() {
  return (
    <main className="project-main">
      <div className="project-content-wrap" style={{ ["--hero-hue" as string]: HUE }}>
        <div
          className="hover-trail-target project-hero-box"
          data-trail-hue={String(HUE)}
          data-tint-color={TINTE}
        >
          <span className="project-back">
            <BackCapsule category="fotografia" />
          </span>

          <div className="project-meta">
            <div className="project-meta-row">
              <span className="project-meta-key"><LangText es="Tipo" en="Type" /></span>
              <span><LangText es="Sesión de fotos" en="Photo shoot" /></span>
            </div>
            <div className="project-meta-row">
              <span className="project-meta-key"><LangText es="Cliente" en="Client" /></span>
              <span>Orquesta Tokio</span>
            </div>
          </div>
        </div>

        <ProjectHeroTitle es="Galería Orquesta Tokio" en="Orquesta Tokio gallery" />

        <div className="project-introrow">
          <p className="project-intro">
            <LangText
              es="La sesión entera de la **Orquesta Tokio**, más allá de las tomas que acabaron en el cartel. Cuarenta fotos de **los trajes, los gestos y el escenario montado** que dan la medida de lo que hay detrás de una imagen promocional. Pasa el cursor por encima para acercarte y **pulsa cualquiera para verla en grande**."
              en="The full **Orquesta Tokio** shoot, beyond the frames that made it onto the poster. Forty photographs of **the costumes, the gestures and the set** that show what sits behind a promotional image. Hover to come closer and **click any of them to see it large**."
            />
          </p>
          <ToolIcons tools={["Photoshop", "Lightroom"]} />
        </div>

        {/* Las que van a dos columnas, elegidas por él: el escupefuego, la
            cantante entre el humo azul y el plano del escenario entero. Las
            tres piden ancho por el mismo motivo, que lo que cuentan no cabe en
            un tercio de renglón. */}
        <Galeria
          total={TOTAL}
          carpeta={CARPETA}
          alt="Foto de la sesión de la Orquesta Tokio"
          anchas={[17, 24, 37]}
        />
      </div>
    </main>
  );
}
