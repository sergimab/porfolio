import BackCapsule from "@/components/shared/BackCapsule";
import ProjectHeroTitle from "@/components/shared/ProjectHeroTitle";
import LangText from "@/components/shared/LangText";
import ToolIcons from "@/components/shared/ToolIcons";
import RotuloSeccion from "@/components/shared/RotuloSeccion";
import Carrusel from "./Carrusel";
import { existsSync } from "node:fs";
import { join } from "node:path";
import "./Carrusel.css";

// El cartel se busca en el disco igual que el logotipo del branding, así que
// basta con dejar el archivo en su carpeta para que aparezca, sin tocar código.
const CARPETA = "proyectos/orquesta-tokio";
const NOMBRES = ["afiche.webp", "afiche.jpg", "afiche.png"];

// Las nueve fotos de la sesión de este año.
const SESION = Array.from({ length: 9 }, (_, i) => ({
  src: `/${CARPETA}/sesion-${i + 1}.webp`,
  alt: "Retrato de la sesión de la Orquesta Tokio sobre fondo blanco",
}));

// Las tres parejas del año pasado. Cada columna es un color, con el contraluz
// arriba y el retrato que sale de esa misma silueta debajo.
const PAREJAS = [
  { color: "naranja", nombre: "naranja" },
  { color: "magenta", nombre: "magenta" },
  { color: "azul", nombre: "azul" },
];

// Los posts de presentación, uno por integrante, con su nombre y su papel en
// la banda. Van en el alt porque es lo que lleva escrito cada imagen.
const POSTS = [
  ["nerea-brecht", "Nerea Brecht, cantante"],
  ["marina-rey", "Mariña Rey, cantante"],
  ["lia-garcia", "Lía García, cantante"],
  ["berto-prado", "Berto Prado, bajista"],
  ["nolann-peno", "Nolann Peño, saxofón"],
  ["mario-alvarinas", "Mario Alvariñas, teclado"],
  ["jose-manuel-vieitez", "José Manuel Vieitez, trompeta"],
  ["manuel-alvarinas", "Manuel Alvariñas, batería"],
].map(([archivo, alt]) => ({ src: `/${CARPETA}/anteriores/${archivo}.webp`, alt }));

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
  const afiche = NOMBRES.find((n) => existsSync(join(process.cwd(), "public", CARPETA, n)));

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
              es="A partir de **unas fotografías aportadas por el cliente** se monta el **cartel promocional de la gira** de la **Orquesta Tokio**. El material de partida no se elige, llega dado, así que el trabajo está en **sacarle una imagen** con el encuadre, la luz y el color, y construir con ella un afiche que funcione a distancia y en la calle."
              en="Starting from **a set of photographs supplied by the client**, this is the **promotional poster for the Orquesta Tokio tour**. The raw material is not chosen, it arrives as it is, so the job is to **pull an image out of it** through framing, light and colour, and build a poster that works from a distance and out in the street."
            />
          </p>
          <ToolIcons tools={["Photoshop", "Illustrator"]} />
        </div>

        {/* ── La sesión ──────────────────────────────────────────────────── */}
        <section className="ot-seccion">
          <RotuloSeccion es="La sesión" en="The shoot" />
          <Carrusel fotos={SESION} segundos={60} />
        </section>

        {/* ── El cartel ──────────────────────────────────────────────────── */}
        {/* Con rótulo propio y no como un pie del carrusel: el material de
            partida y la pieza acabada son dos cosas distintas, y el título es
            lo que marca dónde termina una y empieza la otra. */}
        <section className="ot-seccion">
          <RotuloSeccion es="El cartel" en="The poster" />

          {afiche ? (
            <figure className="ot-afiche">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/${CARPETA}/${afiche}`} alt="El cartel promocional de la gira de la Orquesta Tokio" />
            </figure>
          ) : (
            <p className="ot-pendiente">
              <LangText
                es="Falta el afiche, que va justo aquí. Basta con dejar el archivo en public/proyectos/orquesta-tokio/ llamado afiche.webp (o .jpg), que la página lo busca sola y lo coloca."
                en="Missing the poster, which goes right here. Just drop the file into public/proyectos/orquesta-tokio/ named afiche.webp (or .jpg) and the page will find it and place it."
              />
            </p>
          )}
        </section>

        {/* ── Trabajos anteriores ────────────────────────────────────────── */}
        <section className="ot-seccion">
          <RotuloSeccion es="Trabajos anteriores" en="Earlier work" />
          <div className="ot-texto">
            <p>
              <LangText
                es="El año anterior el encargo fue otro. La orquesta pidió una serie de **posts para redes sociales** que presentaran uno a uno a los **artistas de aquella temporada**, así que se montó una ficha por integrante con su nombre y su instrumento, todas con la misma retícula y el mismo marco para que se reconocieran como serie al verlas seguidas en el perfil."
                en="The year before, the job was a different one. The band asked for a run of **social media posts** introducing the **artists of that season** one by one, so each member got their own card with their name and their instrument, all on the same grid and inside the same frame so they would read as a series once they sat together on the profile."
              />
            </p>
          </div>

          {/* Las tres parejas de contraluz, antes que los posts: son el
              arranque de la serie, el ejercicio de luz del que salen las
              fichas que vienen después. */}
          <div className="ot-parejas">
            {PAREJAS.map((p) => (
              <div className="ot-pareja" key={p.color}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/${CARPETA}/anteriores/contraluz-${p.color}.webp`}
                  alt={`Silueta a contraluz de la Orquesta Tokio recortada sobre un halo ${p.nombre}`}
                  loading="lazy"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/${CARPETA}/anteriores/retrato-${p.color}.webp`}
                  alt={`Retrato de la Orquesta Tokio iluminado en ${p.nombre}`}
                  loading="lazy"
                />
              </div>
            ))}
          </div>

          <Carrusel fotos={POSTS} segundos={45} modificador="es-posts" />
        </section>
      </div>
    </main>
  );
}
