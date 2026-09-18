import BackCapsule from "@/components/shared/BackCapsule";
import ProjectHeroTitle from "@/components/shared/ProjectHeroTitle";
import LangText from "@/components/shared/LangText";
import ToolIcons from "@/components/shared/ToolIcons";

// «El Arte del Miedo», el mismo encargo contado desde sus tres disciplinas:
// la identidad de la exposición, las piezas en movimiento y la app que la hace
// legible. En el portfolio cada una vive en su categoría —Branding, Motion y
// UI/UX—, así que son tres páginas; pero el proyecto es uno solo, y por eso
// comparten este componente.
//
// LA ENTRADILLA ESTÁ ESCRITA UNA VEZ. Es el mismo párrafo en las tres páginas,
// y teniéndolo copiado tres veces bastaría con corregir una coma en una para
// que las otras dos se quedaran atrás. Aquí se cambia en un sitio y cambia en
// las tres.
//
// Lo que sí es distinto en cada una es su color —el de su categoría, que sale
// de la cápsula de la home— y los programas con los que se hizo.

export type Disciplina = "branding" | "motion" | "uiux";

const FICHA: Record<
  Disciplina,
  {
    hue: number;
    tinte: string;
    titulo: { es: string; en: string };
    tipo: { es: string; en: string };
    programas: string[];
  }
> = {
  branding: {
    // Los tonos y los tintes son los mismos que usan las demás páginas de cada
    // categoría: rosa en Branding, azul en Motion, verde azulado en UI/UX.
    hue: 330,
    tinte: "#DB2777",
    titulo: { es: "El Arte del Miedo", en: "The Art of Fear" },
    tipo: { es: "Identidad de exposición", en: "Exhibition identity" },
    programas: ["Photoshop", "Illustrator", "Blender", "After Effects"],
  },
  motion: {
    hue: 217,
    tinte: "#286DDC",
    titulo: { es: "Motion El Arte del Miedo", en: "The Art of Fear motion" },
    tipo: { es: "Motion graphics", en: "Motion graphics" },
    programas: ["Illustrator", "After Effects"],
  },
  uiux: {
    hue: 175,
    tinte: "#0D9488",
    titulo: { es: "App El Arte del Miedo", en: "The Art of Fear app" },
    tipo: { es: "App de exposición", en: "Exhibition app" },
    programas: ["Photoshop", "Illustrator", "Blender", "After Effects"],
  },
};

export default function ArteMiedo({ disciplina }: { disciplina: Disciplina }) {
  const ficha = FICHA[disciplina];

  return (
    <main className="project-main">
      {/* --hero-hue en el contenedor: lo heredan el cuadro de cabecera, los
          rótulos de sección y las cajas de medios, para que toda la página vaya
          del color de su categoría. */}
      <div className="project-content-wrap" style={{ ["--hero-hue" as string]: ficha.hue }}>
        <div
          className="hover-trail-target project-hero-box"
          data-trail-hue={String(ficha.hue)}
          data-tint-color={ficha.tinte}
        >
          <span className="project-back">
            <BackCapsule category={disciplina} />
          </span>

          <div className="project-meta">
            <div className="project-meta-row">
              <span className="project-meta-key"><LangText es="Tipo" en="Type" /></span>
              <span><LangText es={ficha.tipo.es} en={ficha.tipo.en} /></span>
            </div>
          </div>
        </div>

        <ProjectHeroTitle es={ficha.titulo.es} en={ficha.titulo.en} />

        <div className="project-introrow">
          <p className="project-intro">
            <LangText
              es="**El Arte del Miedo** es una exposición pensada para una sala del **Museo del Prado**, donde el visitante recorre **ochenta obras sin ninguna cartela** ni texto que las explique. La única forma de entenderlas es **escanearlas con una app propia**, construida junto a un equipo de **psicólogos especializados en fobias**, que revela **qué miedo humano esconde cada cuadro**."
              en="**The Art of Fear** is an exhibition designed for a room at the **Museo del Prado**, where visitors walk past **eighty works with no wall label** or text to explain them. The only way to understand them is to **scan them with a dedicated app**, built with a team of **psychologists specialising in phobias**, which reveals **what human fear each painting hides**."
            />
          </p>
          <ToolIcons tools={ficha.programas} />
        </div>
      </div>
    </main>
  );
}
