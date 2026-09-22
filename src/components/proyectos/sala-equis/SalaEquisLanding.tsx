import BackCapsule from "@/components/shared/BackCapsule";
import ProjectHeroTitle from "@/components/shared/ProjectHeroTitle";
import LangText from "@/components/shared/LangText";
import ToolIcons from "@/components/shared/ToolIcons";
import RotuloSeccion from "@/components/shared/RotuloSeccion";
import Alterna from "./Alterna";
import "./SalaEquis.css";

// El rosa de Branding, el mismo que el de su cápsula en la home.
const HUE = 330;
const TINTE = "#DB2777";

const CARPETA = "/proyectos/sala-equis";

// EL RELEVO DE LOS DOS LOGOTIPOS, que es de lo que va la página: de dónde se
// parte y adónde se llega.
//
// El viejo llega en negro sobre blanco y aquí va sobre negro, así que se
// invierte con un filtro en vez de guardar otro archivo que sería el mismo
// dibujo del revés. El nuevo es un SVG ya en blanco: pesa dos kilos, se ve
// nítido a cualquier tamaño y no hay una segunda versión que mantener.
const LOGOS = [
  { src: `${CARPETA}/logo-actual.webp`, alt: "El logotipo actual de Sala Equis", filtro: "invert(1)" },
  { src: `${CARPETA}/logo-equix.svg`, alt: "El logotipo nuevo, Equix" },
];

// Las seis proyecciones, en el orden en que se hicieron.
const LUCES = Array.from({ length: 6 }, (_, i) => ({
  src: `${CARPETA}/luz-${i + 1}.webp`,
  alt: "El logotipo de Equix deformado por la luz proyectada sobre una superficie",
}));

export default function SalaEquisLanding() {
  return (
    <main className="project-main">
      <div className="project-content-wrap" style={{ ["--hero-hue" as string]: HUE }}>
        <div
          className="hover-trail-target project-hero-box"
          data-trail-hue={String(HUE)}
          data-tint-color={TINTE}
        >
          <span className="project-back">
            <BackCapsule category="branding" />
          </span>

          <div className="project-meta">
            <div className="project-meta-row">
              <span className="project-meta-key"><LangText es="Tipo" en="Type" /></span>
              <span><LangText es="Rebranding" en="Rebranding" /></span>
            </div>
            <div className="project-meta-row">
              <span className="project-meta-key"><LangText es="Asignatura" en="Course" /></span>
              <span><LangText es="Proyectos · ESD Madrid" en="Projects · ESD Madrid" /></span>
            </div>
          </div>
        </div>

        <ProjectHeroTitle es="Rebranding Sala Equis" en="Sala Equis rebranding" />

        <div className="project-introrow">
          <p className="project-intro">
            <LangText
              es="**Sala Equis** es un cine con bar en el centro de Madrid, y su marca no lo contaba. El encargo es **rehacer la identidad poniendo el cine por delante** y dándole el carácter que le faltaba, así que el nombre se acorta a **Equix** y la marca pasa a construirse con lo único que hay de verdad en una sala a oscuras, **un haz de luz contra una superficie**."
              en="**Sala Equis** is a cinema with a bar in central Madrid, and its brand did not say so. The brief is to **rebuild the identity putting the cinema first** and giving it the character it lacked, so the name shortens to **Equix** and the brand comes to be built from the only real thing in a darkened room, **a beam of light hitting a surface**."
            />
          </p>
          <ToolIcons tools={["Illustrator", "Photoshop", "After Effects"]} />
        </div>

        {/* El antes y el después, justo debajo de la entradilla y sin rótulo:
            es la propia entradilla enseñada en imagen, no un apartado aparte. */}
        <Alterna
          laminas={LOGOS}
          proporcion="38 / 10"
          segundos={2.6}
          fondo="#000"
          className="se-logos"
        />

        {/* ── La luz ─────────────────────────────────────────────────────── */}
        <section className="se-seccion">
          <RotuloSeccion es="La luz" en="The light" />
          <div className="se-texto">
            <p>
              <LangText
                es="El logotipo no tiene **una sola forma**. Se proyecta, y como cualquier proyección **se deforma con aquello donde cae**: se estira en una pared en diagonal, se parte en una esquina, se curva sobre un cuerpo. Todas las versiones son el mismo logotipo visto desde otro sitio, así que la marca **no es un dibujo sino una manera de aparecer**, que es exactamente lo que pasa en una sala de cine."
                en="The logotype has **no single shape**. It is projected, and like any projection **it bends with whatever it lands on**: it stretches on an angled wall, breaks across a corner, curves over a body. Every version is the same logotype seen from somewhere else, so the brand **is not a drawing but a way of appearing**, which is exactly what happens inside a cinema."
              />
            </p>
          </div>
          <Alterna
            laminas={LUCES}
            proporcion="3 / 2"
            segundos={2.2}
            fondo="#000"
            className="se-luces"
          />
        </section>

        {/* ── Aplicaciones ───────────────────────────────────────────────── */}
        <section className="se-seccion">
          <RotuloSeccion es="Aplicaciones" en="Applications" />
          {/* Sin texto: son mockups, y lo que hay que decir de ellos ya lo dicen
              ellos. La sección la abre su rótulo y se lee sola. */}
          <div className="se-mockups">
            {/* Las palomitas primero y en grande: es la pieza que se toca, la
                que sale de la sala con quien ha entrado a ver la película, así
                que abre el apartado en vez de ir de acompañante. */}
            <div className="se-grande">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="se-mockup-grande"
                src={`${CARPETA}/palomitas-mockup.webp`}
                alt="La caja de palomitas y el vaso de cerveza de Equix"
              />
            </div>
            <div className="se-mockups-par">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${CARPETA}/tarjetas.webp`} alt="Las dos caras de la tarjeta de Equix" loading="lazy" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${CARPETA}/staff.webp`} alt="Las acreditaciones del equipo con su cordón" loading="lazy" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
