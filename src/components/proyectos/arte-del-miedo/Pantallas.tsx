"use client";

import LangText from "@/components/shared/LangText";
import { useLang } from "@/components/shared/useLang";
import "./Pantallas.css";

// Una tira de pantallas de la app, en el orden en que se ven al usarla.
//
// VA EN HORIZONTAL Y SE ARRASTRA, no en una cuadrícula. El motivo es que estas
// pantallas son una SECUENCIA: nueve pasos de una entrada, seis de un escaneo.
// Puestas en cuadrícula habría que leerlas en zigzag y el orden se perdería;
// en una fila, el orden es el propio eje, y además cada tira se lee igual en
// una pantalla ancha que en un móvil —lo único que cambia es cuántas caben a la
// vez—.
//
// El alto es fijo y el ancho lo pone la proporción del archivo, así que todas
// las pantallas salen exactamente igual de altas aunque alguna capture venga
// con doce píxeles de más, que es lo que pasa con una de las del escáner.

export type Pantalla = {
  /** Nombre del archivo dentro de la carpeta del proyecto, sin extensión. */
  id: string;
  /**
   * Lo que se lee debajo. Es opcional a propósito: una tira de pasos con
   * nombre se cuenta mejor con el nombre de cada paso, pero una tira de
   * ejemplos —seis obras distintas vistas de la misma manera— no, y ponerle un
   * «Obra 1, Obra 2» debajo a cada una sería escribir texto para rellenar.
   */
  es?: string;
  en?: string;
};

const RUTA = "/proyectos/el-arte-del-miedo-app";

export default function Pantallas({
  pantallas,
  rotulo,
  rotuloEn,
}: {
  pantallas: Pantalla[];
  /** Para qué es esta tira. Lo lee quien navega con teclado o con lector. */
  rotulo: string;
  rotuloEn: string;
}) {
  // El rótulo de la tira no es texto visible, es el nombre que anuncia el
  // lector de pantalla, así que no puede ir con LangText —que pinta un nodo— y
  // hay que elegir el idioma a mano.
  const lang = useLang();

  return (
    // `tabIndex` en una caja que se arrastra no es un capricho: un contenedor
    // con scroll al que no se puede llegar con el tabulador es contenido al que
    // solo se accede con ratón. Con esto, se llega tabulando y se recorre con
    // las flechas, que es lo que el navegador hace solo en cuanto la caja
    // puede recibir el foco.
    <div
      className="am-pantallas"
      tabIndex={0}
      role="group"
      aria-label={lang === "en" ? rotuloEn : rotulo}
    >
      {pantallas.map((p, i) => (
        <figure key={p.id} className="am-pantalla">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${RUTA}/${p.id}.webp`}
            alt=""
            loading={i < 3 ? undefined : "lazy"}
            draggable={false}
          />
          {p.es ? (
            <figcaption>
              <LangText es={p.es} en={p.en ?? p.es} />
            </figcaption>
          ) : null}
        </figure>
      ))}
    </div>
  );
}
