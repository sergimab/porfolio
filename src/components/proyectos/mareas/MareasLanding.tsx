import fs from "node:fs";
import path from "node:path";
import BackCapsule from "@/components/shared/BackCapsule";
import ProjectHeroTitle from "@/components/shared/ProjectHeroTitle";
import LangText from "@/components/shared/LangText";
import ToolIcons from "@/components/shared/ToolIcons";
import Recomendados from "@/components/shared/Recomendados";
import Pieza from "./Pieza";
import "./Mareas.css";

// El violeta del 3D, el mismo que su cápsula en la home.
const HUE = 262;
const TINTE = "#7C3AED";

const CARPETA = "/proyectos/mareas";

// LAS TRES PIEZAS. El archivo se llama por su número, así que subir la serie es
// dejar tres mp4 con estos nombres y nada más.
//
// El cartel es opcional y del mismo nombre: si está, es lo que se ve mientras el
// vídeo llega y lo que queda para quien pide menos movimiento. Se saca del
// propio vídeo con ffmpeg, no se dibuja.
const PIEZAS = [
  {
    archivo: "pieza-1",
    es: "Pieza uno",
    en: "Piece one",
    textoEs: "Descripción de la primera animación.",
    textoEn: "Description of the first animation.",
  },
  {
    archivo: "pieza-2",
    es: "Pieza dos",
    en: "Piece two",
    textoEs: "Descripción de la segunda animación.",
    textoEn: "Description of the second animation.",
  },
  {
    archivo: "pieza-3",
    es: "Pieza tres",
    en: "Piece three",
    textoEs: "Descripción de la tercera animación.",
    textoEn: "Description of the third animation.",
  },
];

// Mientras un archivo no esté en su sitio no se pinta un vídeo que no existe: se
// deja el hueco diciendo qué falta. Es el mismo apaño que usa Elysium con su
// figura final, y sirve para lo mismo: poder montar la página antes de tener
// todo el material.
function siExiste(ruta: string): string | null {
  return fs.existsSync(path.join(process.cwd(), "public", ruta)) ? ruta : null;
}

export default function MareasLanding() {
  return (
    <main className="project-main">
      <div className="project-content-wrap" style={{ ["--hero-hue" as string]: HUE }}>
        <div
          className="hover-trail-target project-hero-box"
          data-trail-hue={String(HUE)}
          data-tint-color={TINTE}
        >
          <span className="project-back">
            <BackCapsule category="3d" />
          </span>

          <div className="project-meta">
            <div className="project-meta-row">
              <span className="project-meta-key"><LangText es="Tipo" en="Type" /></span>
              <span><LangText es="Serie en 3D" en="3D series" /></span>
            </div>
            <div className="project-meta-row">
              <span className="project-meta-key"><LangText es="Piezas" en="Pieces" /></span>
              <span>3</span>
            </div>
          </div>
        </div>

        <ProjectHeroTitle es="Mareas" en="Tides" />

        <div className="project-introrow">
          <p className="project-intro">
            <LangText
              es="Tres esferas sobre el mar, cada una con **su propia manera de moverse**. La serie busca lo mínimo que hace falta para que algo parezca vivo: ni un gesto de más, ni una forma que no esté ahí por el movimiento."
              en="Three spheres over the sea, each with **its own way of moving**. The series looks for the least it takes to make something feel alive: not one gesture more, not one shape that isn't there for the movement."
            />
          </p>
          <ToolIcons tools={["Blender", "After Effects"]} />
        </div>

        <div className="mar-serie">
          {PIEZAS.map((p) => {
            const video = siExiste(`${CARPETA}/${p.archivo}.mp4`);
            const cartel = siExiste(`${CARPETA}/${p.archivo}.webp`) ?? undefined;
            const titulo = <LangText es={p.es} en={p.en} />;
            const texto = <LangText es={p.textoEs} en={p.textoEn} />;
            return video ? (
              <Pieza
                key={p.archivo}
                src={video}
                poster={cartel}
                titulo={p.es}
                descripcion={texto}
              />
            ) : (
              <figure key={p.archivo} className="mar-pieza es-vacia">
                <div className="mar-lienzo">
                  <span className="mar-falta">
                    <LangText
                      es={`Falta ${p.archivo}.mp4`}
                      en={`${p.archivo}.mp4 missing`}
                    />
                  </span>
                </div>
                <figcaption className="mar-pie">
                  <h3>{titulo}</h3>
                  <p>{texto}</p>
                </figcaption>
              </figure>
            );
          })}
        </div>

        <Recomendados ids={["d1"]} />
      </div>
    </main>
  );
}
