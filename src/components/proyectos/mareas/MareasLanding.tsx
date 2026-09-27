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
// LAS TRES PIEZAS. El archivo se llama por su número, así que subir la serie es
// dejar tres mp4 con estos nombres y nada más. El cartel —un fotograma del
// propio vídeo— va al lado con el mismo nombre en .webp.
//
// El nombre que llevan no se enseña: es lo que lee quien no ve la pieza.
const PIEZAS = [
  { archivo: "pieza-1", es: "Esfera iridiscente sobre el mar", en: "Iridescent sphere over the sea" },
  { archivo: "pieza-2", es: "Esfera envuelta en una cinta de cromo", en: "Sphere wrapped in a chrome ribbon" },
  { archivo: "pieza-3", es: "Esfera dentro de una membrana", en: "Sphere inside a membrane" },
];

// LOS TRES FONDOS, a pie de página. Fotogramas de la misma serie puestos como se
// usarían, en vertical de teléfono y uno al lado de otro.
//
// El orden lo puso Sergio y no el número del archivo: los nombres vienen de
// cómo salieron de Blender, que no tiene por qué ser el orden en que se miran.
const FONDOS = [
  { archivo: "fondo-3", es: "Fondo de la esfera iridiscente", en: "Iridescent sphere wallpaper" },
  { archivo: "fondo-1", es: "Fondo de la esfera con la cinta", en: "Chrome ribbon sphere wallpaper" },
  { archivo: "fondo-2", es: "Fondo de la esfera rodeada de aros", en: "Sphere ringed by hoops wallpaper" },
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
              es="Tres esferas sobre el mar, cada una con **su propia manera de moverse**. Salió de experimentar con **deformaciones geométricas**, buscando dónde se tocan el hiperrealismo del material y lo mínimo del gesto."
              en="Three spheres over the sea, each with **its own way of moving**. It came out of experimenting with **geometric deformations**, looking for where hyperrealistic materials meet the barest possible gesture."
            />
          </p>
          <ToolIcons tools={["Blender", "After Effects"]} />
        </div>

        <div className="mar-serie">
          {PIEZAS.map((p) => {
            const video = siExiste(`${CARPETA}/${p.archivo}.mp4`);
            const cartel = siExiste(`${CARPETA}/${p.archivo}.webp`) ?? undefined;
            return video ? (
              <Pieza key={p.archivo} src={video} poster={cartel} titulo={p.es} />
            ) : (
              <div key={p.archivo} className="mar-pieza es-vacia">
                <div className="mar-lienzo">
                  <span className="mar-falta">
                    <LangText es={`Falta ${p.archivo}.mp4`} en={`${p.archivo}.mp4 missing`} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Los fondos, en fila. Van los tres a la vez y no uno debajo de otro
            porque aquí lo que se enseña no es cada imagen sino QUE HAY UNA
            SERIE: puestas en columna serían tres piezas más, y en fila se leen
            como lo que son, el mismo trabajo llevado a otro sitio. */}
        <div className="mar-fondos">
          {FONDOS.map((f) => {
            const img = siExiste(`${CARPETA}/${f.archivo}.webp`);
            if (!img) return null;
            return (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img key={f.archivo} src={img} alt={f.es} loading="lazy" decoding="async" />
            );
          })}
        </div>

        <Recomendados ids={["d1"]} />
      </div>
    </main>
  );
}
