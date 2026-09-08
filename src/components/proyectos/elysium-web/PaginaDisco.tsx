"use client";

import { useMemo } from "react";
import Portada from "./Portada";
import MarcoLiquido, { type Marco, type Suelto } from "./MarcoLiquido";
import { ERAS } from "./simbolo";
import { CANCIONES, claveCancion } from "./canciones";

// La página del disco: lo que aparece cuando el símbolo ya está formado.
//
// A la izquierda la portada con el símbolo dentro; a la derecha, lo que la
// persona ha construido —su lista de canciones— y lo que puede hacer con ella:
// llevársela a su plataforma, comprar el disco, comprar el merchan con su
// símbolo.
//
// La lista NO es un adorno: son exactamente las canciones que se marcaron en el
// test, en el orden de la discografía. Es la misma selección de la que salió el
// símbolo, así que la portada y la lista son dos vistas de lo mismo.

// Las plataformas a las que se puede exportar. De momento son rótulos: los
// logotipos de Apple Music, Spotify y Amazon Music son marcas registradas y
// tienen que venir de sus kits oficiales, no dibujados a mano.
const PLATAFORMAS = ["Apple Music", "Spotify", "Amazon Music"];

// El recorrido del metal por la página. No es una cinta única: son TRES piezas
// y un par de esquirlas sueltas, que es como está dibujado.
//
// La primera versión daba la vuelta completa a cada bloque y saltaba de uno a
// otro por el camino más corto, o sea cruzando el contenido. Aquí ningún bloque
// se cierra —cada pieza abraza dos o tres lados y se marcha—, los cabos se
// pasan de largo y mueren en aguja, en los nudos cruzan púas, y el único salto
// serpentea por el HUECO que queda entre la lista y el bloque de importar.
//
// Los lados se nombran siempre en el sentido de las agujas del reloj, porque es
// el único en el que se encadenan; `invertir` recorre esa misma poligonal al
// revés, y es lo que permite empezar por un cabo al aire en vez de por una
// esquina.
const MARCOS: Marco[] = [
  // Columna derecha: nace en el aire a la derecha de la lista, corre por su
  // borde de arriba hacia la izquierda, baja por su costado, serpentea por el
  // hueco y rodea el bloque de importar hasta salir por su derecha.
  {
    bloque: "lista",
    lados: ["izquierda", "arriba"],
    invertir: true,
    asomo: [0.5, 0],
    nudos: [{ en: 0.18 }],
  },
  {
    bloque: "importar",
    lados: ["derecha", "abajo", "izquierda"],
    invertir: true,
    unir: "serpiente",
    asomo: [0, 0.55],
    nudos: [{ en: 0.92, angulos: [18, -74] }],
  },
  // La portada: una L por debajo y por la izquierda, con dos nudos, abierta por
  // arriba y por la derecha.
  {
    bloque: "portada",
    lados: ["abajo", "izquierda"],
    asomo: [0.6, 0.55],
    nudos: [{ en: 0.24 }, { en: 0.66, angulos: [12, -80], largo: 0.09 }],
  },
  // Y las tarjetas, que solo reciben una escuadra por el lado que da al hueco.
  {
    bloque: "tarjetas",
    lados: ["abajo", "izquierda"],
    invertir: true,
    asomo: [0.45, 0.8],
    nudos: [{ en: 0.85 }],
  },
];

// Las esquirlas que flotan en el blanco, ancladas a un bloque para que sigan a
// su caja al redimensionar pero colocadas fuera de él. Son remate, no marco: en
// la referencia hay un par de agujas sueltas sin tocar nada, y quitarlas deja
// la composición demasiado ordenada.
const SUELTOS: Suelto[] = [
  // Van pegadas por dentro del relleno de la página: más afuera, el lienzo
  // acaba y la aguja se corta a la mitad en vez de terminar en punta.
  { bloque: "portada", x: 0.36, y: -0.05, giro: -3, largo: 0.13, cruz: [64, 0.34] },
  { bloque: "importar", x: 1.02, y: 0.55, giro: 84, largo: 0.09, cruz: [70, 0.4] },
];

export default function PaginaDisco({
  seleccion,
  onReintentar,
}: {
  seleccion: Set<string>;
  onReintentar: () => void;
}) {
  // Las canciones elegidas, en orden de discografía y de tracklist. Recorrer
  // las eras en vez del Set es lo que da un orden estable: un Set conserva el
  // orden de inserción, o sea el orden en que se fue pulsando, que no significa
  // nada para quien luego lee la lista.
  const elegidas = useMemo(() => {
    const salida: { era: string; titulo: string }[] = [];
    for (const era of ERAS) {
      for (const titulo of CANCIONES[era]) {
        if (seleccion.has(claveCancion(era, titulo))) salida.push({ era, titulo });
      }
    }
    return salida;
  }, [seleccion]);

  return (
    <div className="disco">
      <header className="disco-barra">
        <button type="button" className="disco-menu" aria-label="Abrir el menú">
          <span />
          <span />
          <span />
        </button>
        <p className="disco-marca">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/proyectos/elysium-web/logo-elysium.webp" alt="Elysium" />
          <span>Lady Gaga</span>
        </p>
      </header>

      <main className="disco-cuerpo">
        {/* El metal va por encima de todo y no recoge el ratón: es un adorno que
            abraza los bloques, no una superficie con la que se trata. Cuelga del
            cuerpo entero y no de una columna porque la cinta cruza de una a
            otra. */}
        <MarcoLiquido marcos={MARCOS} sueltos={SUELTOS} />

        <section className="disco-izquierda">
          <div data-marco="portada">
            <Portada seleccion={seleccion} />
          </div>
          {/* Vuelve al universo con la selección INTACTA: "otra vez" es rehacer
              el test, no perder lo marcado y empezar de cero. */}
          <button type="button" className="disco-otra" onClick={onReintentar}>
            Try again
          </button>
        </section>

        <section className="disco-derecha">

          <div className="disco-lista" data-marco="lista">
            <ol>
              {elegidas.map((c, i) => (
                <li key={`${c.era}-${c.titulo}`}>
                  <span className="disco-num">{i + 1}</span>
                  <span className="disco-titulo">{c.titulo}</span>
                </li>
              ))}
            </ol>
            <button type="button" className="disco-play" aria-label="Reproducir la lista">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5v14l11-7z" fill="currentColor" />
              </svg>
            </button>
          </div>

          <div className="disco-importar" data-marco="importar">
            <p>Import to:</p>
            <ul>
              {PLATAFORMAS.map((p) => (
                <li key={p}>
                  <button type="button">{p}</button>
                </li>
              ))}
            </ul>
          </div>

          <div className="disco-tarjetas" data-marco="tarjetas">
            <article className="disco-tarjeta">
              <div className="disco-tarjeta-imagen" aria-hidden="true" />
              <div className="disco-tarjeta-pie">
                <p>
                  <strong>Buy</strong>
                  <span>custom merchandising</span>
                </p>
                <button type="button" aria-label="Ver el merchandising">
                  ›
                </button>
              </div>
            </article>
            <article className="disco-tarjeta">
              <div className="disco-tarjeta-imagen es-disco" aria-hidden="true" />
              <div className="disco-tarjeta-pie">
                <p>
                  <strong>Explore the</strong>
                  <span>new album</span>
                </p>
                <button type="button" aria-label="Explorar el álbum">
                  ›
                </button>
              </div>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
