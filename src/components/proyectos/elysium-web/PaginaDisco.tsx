"use client";

import { useMemo } from "react";
import Portada from "./Portada";
import MarcoLiquido, { type Marco } from "./MarcoLiquido";
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

// Por qué lados rodea el metal a cada bloque, y en qué turno.
//
// No los rodea enteros a propósito: en la referencia la cinta entra por un
// lado, dobla y se va, dejando el resto del borde limpio. Rodearlos del todo
// convertiría el adorno en un recuadro, que es justo lo que no es.
//
// Y los turnos se solapan un poco —el siguiente arranca antes de que el
// anterior termine— para que el conjunto se lea como una sola cinta que
// recorre la columna y no como tres piezas por separado.
const MARCOS: Marco[] = [
  { bloque: "lista", lados: ["izquierda", "arriba", "derecha"], desde: 0, hasta: 0.55 },
  { bloque: "importar", lados: ["derecha", "abajo"], desde: 0.45, hasta: 0.8 },
  { bloque: "tarjetas", lados: ["abajo", "izquierda"], desde: 0.7, hasta: 1 },
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
        <section className="disco-izquierda">
          <Portada seleccion={seleccion} />
          {/* Vuelve al universo con la selección INTACTA: "otra vez" es rehacer
              el test, no perder lo marcado y empezar de cero. */}
          <button type="button" className="disco-otra" onClick={onReintentar}>
            Try again
          </button>
        </section>

        <section className="disco-derecha">
          {/* El metal va por encima de los bloques y no recoge el ratón: es un
              adorno que los abraza, no una superficie con la que se trata. */}
          <MarcoLiquido marcos={MARCOS} />

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
