import Link from "next/link";
import BackCapsule from "@/components/shared/BackCapsule";
import ProjectHeroTitle from "@/components/shared/ProjectHeroTitle";
import LangText from "@/components/shared/LangText";
import Prototipo from "./Prototipo";
import "./Marca.css";

// App Espacio vacío: el diseño de producto del proyecto, en su propia página de
// UI/UX.
//
// Vive en la carpeta de Espacio vacío y no en una suya porque comparte todo con
// la marca —las pantallas salen del mismo Figma, y el papel y los divisores del
// mismo CSS—; lo que cambia es la categoría en la que se enseña. Las dos
// páginas se enlazan entre sí al final.
export default function AppLanding() {
  return (
    <main className="project-main">
      {/* El 175 es el verde azulado de UI/UX. Sale de la lista de categorías,
          así que si allí cambia, aquí también. */}
      <div className="project-content-wrap" style={{ ["--hero-hue" as string]: 175 }}>
        <div
          className="hover-trail-target project-hero-box"
          data-trail-hue="175"
          data-tint-color="#0D9488"
        >
          <span className="project-back">
            <BackCapsule category="uiux" />
          </span>

          <div className="project-meta">
            <div className="project-meta-row">
              <span className="project-meta-key"><LangText es="Tipo" en="Type" /></span>
              <span>
                <LangText es="Diseño de producto" en="Product design" />
              </span>
            </div>
            <div className="project-meta-row">
              <span className="project-meta-key"><LangText es="Herramienta" en="Tool" /></span>
              <span>Figma</span>
            </div>
          </div>
        </div>

        <ProjectHeroTitle es="App Espacio vacío" en="Empty space app" />

        <div className="ev-papel project-text">
          <p>
            <LangText
              es="La app es el centro de la campaña: es donde la persona **ve cuánto tiempo se le va** en las redes sociales y lo pone al lado del que dedica a lo que de verdad le importa."
              en="The app is the heart of the campaign: it's where you **see how much time is going** into social media and set it against the time you give to what actually matters."
            />
          </p>
          <p>
            <LangText
              es="El alta es la parte más delicada del recorrido. Antes de enseñar un solo dato hay que explicar de qué va esto, pedir un compromiso —cuánto tiempo te gustaría dedicarle al día— y enseñar cómo se traduce ese compromiso en las casillas que irán desapareciendo de tu foto. Son **diez pantallas** para que, al llegar a la primera de verdad, ya se entienda el trato."
              en="Onboarding is the delicate part. Before showing a single figure you have to explain what this is, ask for a commitment —how long you'd like to spend each day— and show how that turns into the slots that will disappear from your photo. **Ten screens**, so that by the time you reach the real first screen the deal is already clear."
            />
          </p>
          <p>
            <LangText
              es="Abajo está el alta entera, **navegable**: se pasa pulsando los botones de la propia app, igual que el prototipo."
              en="Below is the whole onboarding, **playable**: you move through it by tapping the app's own buttons, just like the prototype."
            />
          </p>
        </div>

        <Prototipo />

        <hr className="ev-divisor" />

        {/* Y de vuelta a la marca, que es de donde sale todo esto. */}
        <div className="ev-papel ev-salto">
          <p>
            <LangText
              es="La marca, la paleta y la tipografía de la app son las del proyecto de branding:"
              en="The app's brand, palette and typography come from the branding project:"
            />{" "}
            <Link href="/proyecto/b1">
              <LangText es="ver Espacio vacío" en="see Empty space" />
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
