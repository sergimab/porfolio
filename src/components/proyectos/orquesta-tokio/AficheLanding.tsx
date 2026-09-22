import BackCapsule from "@/components/shared/BackCapsule";
import ProjectHeroTitle from "@/components/shared/ProjectHeroTitle";
import LangText from "@/components/shared/LangText";
import ToolIcons from "@/components/shared/ToolIcons";

// «Afiche Orquesta Tokio», la primera página de Fotografía.
//
// De momento solo la cabecera y la entradilla, que es como empiezan todas las
// páginas de proyecto del sitio: la ficha de arriba, el título y el párrafo que
// cuenta de qué va. Lo que venga después —las fotos del cliente, el cartel
// montado, las versiones— se añade en secciones debajo, igual que en las demás.
//
// El 32 es el naranja de Fotografía. Sale de la lista de categorías de la home,
// así que si allí cambia, esta página cambia con él; y el tinte es el mismo
// color en hexadecimal, que es lo que pide la caja de la cabecera para el
// rastro del cursor.
const HUE = 32;
const TINTE = "#D97706";

export default function AficheLanding() {
  return (
    <main className="project-main">
      {/* --hero-hue en el contenedor: lo heredan el cuadro de cabecera, los
          rótulos de sección y las cajas de medios, para que toda la página vaya
          del color de su categoría. */}
      <div className="project-content-wrap" style={{ ["--hero-hue" as string]: HUE }}>
        <div
          className="hover-trail-target project-hero-box"
          data-trail-hue={String(HUE)}
          data-tint-color={TINTE}
        >
          <span className="project-back">
            <BackCapsule category="fotografia" />
          </span>

          {/* La ficha. «Cliente» y no «Asignatura»: esto es un encargo, no un
              trabajo de clase, y la diferencia la marca esa fila. */}
          <div className="project-meta">
            <div className="project-meta-row">
              <span className="project-meta-key"><LangText es="Tipo" en="Type" /></span>
              <span><LangText es="Cartel promocional" en="Promotional poster" /></span>
            </div>
            <div className="project-meta-row">
              <span className="project-meta-key"><LangText es="Cliente" en="Client" /></span>
              <span>Orquesta Tokio</span>
            </div>
          </div>
        </div>

        <ProjectHeroTitle es="Afiche Orquesta Tokio" en="Orquesta Tokio poster" />

        <div className="project-introrow">
          <p className="project-intro">
            <LangText
              es="A partir de **unas fotografías aportadas por el cliente**, se monta el **cartel promocional de la gira** de la **Orquesta Tokio**: el material de partida no se elige, se recibe, así que el trabajo consiste en **sacarle una imagen** —encuadre, luz y color— y construir con ella un afiche que funcione a distancia y en la calle."
              en="Starting from **a set of photographs supplied by the client**, this is the **promotional poster for the Orquesta Tokio tour**: the raw material is not chosen, it arrives, so the job is to **pull an image out of it** — framing, light and colour — and build a poster that works from a distance and out in the street."
            />
          </p>
          <ToolIcons tools={["Photoshop", "Illustrator"]} />
        </div>
      </div>
    </main>
  );
}
