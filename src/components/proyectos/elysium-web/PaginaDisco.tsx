"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import Portada from "./Portada";
import SimboloPlano from "./SimboloPlano";
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

// Las plataformas a las que se puede exportar, con su logotipo oficial. Van en
// negro sobre el papel claro de esta página, que es como los entregan sus kits
// de marca; ninguno está redibujado.
const PLATAFORMAS = [
  { nombre: "Apple Music", logo: "/proyectos/elysium-web/logo-apple-music.webp" },
  { nombre: "Spotify", logo: "/proyectos/elysium-web/logo-spotify.webp" },
  { nombre: "Amazon Music", logo: "/proyectos/elysium-web/logo-amazon-music.webp" },
];

// DÓNDE VA IMPRESO EL SÍMBOLO EN LA CAMISETA. Medido sobre la foto marcada, en
// fracción de la tarjeta, no puesto a ojo: si mañana se cambia la foto, se
// vuelve a medir. El ancho es el de la estampación; el alto lo pone la propia
// figura.
const ESTAMPAS = [
  { x: 0.589, y: 0.146, ancho: 0.213, giro: -8.75 },
  { x: 0.466, y: 0.524, ancho: 0.189, giro: 6.54 },
];

// Lo menos que puede medir la lista por mucho que aprieten las dos columnas.
// Por debajo de esto deja de ser una lista con la que se pueda tratar y pasa a
// ser una rendija con desplazamiento.
const LISTA_MINIMA = 150;
// Y lo más, para que con pocas canciones no se estire hasta lo absurdo.
const LISTA_MAXIMA = 420;


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

  // El alto de la lista sale de MEDIR, no de un número escrito a mano.
  //
  // La columna derecha tiene una parte que no se puede encoger —importar y las
  // dos tarjetas— y la lista es lo único elástico que hay en ella. Con un tope
  // fijo, la derecha acababa 278 px más abajo que la carátula y esa diferencia
  // era un pegote de blanco debajo de la portada. Midiendo, la lista se queda
  // exactamente con el hueco que le deja la carátula y las dos columnas
  // terminan a la misma altura.
  //
  // No se puede hacer en CSS: el alto de la carátula es su propio ancho —es
  // cuadrada— y ninguna de las dos columnas sabe lo que mide la otra. Probé
  // antes con `align-items: stretch` y una derecha de alto cero estirada al
  // 100%, y lo que pasó es que la fila creció igual y estiró la izquierda.
  const izquierdaRef = useRef<HTMLElement>(null);
  const derechaRef = useRef<HTMLElement>(null);
  const listaRef = useRef<HTMLOListElement>(null);
  const [altoLista, setAltoLista] = useState<number>();

  useLayoutEffect(() => {
    const izq = izquierdaRef.current;
    const der = derechaRef.current;
    const ol = listaRef.current;
    if (!izq || !der || !ol) return;
    const medir = () => {
      // Lo que ocupa la derecha SIN la lista es estable, así que el cálculo
      // converge a la primera: al aplicar el alto nuevo, el observador vuelve a
      // disparar, sale el mismo número y ahí se queda.
      const resto = der.getBoundingClientRect().height - ol.getBoundingClientRect().height;
      const hueco = izq.getBoundingClientRect().height - resto;
      const alto = Math.round(Math.min(LISTA_MAXIMA, Math.max(LISTA_MINIMA, hueco)));
      setAltoLista((antes) => (antes === alto ? antes : alto));
    };
    medir();
    const obs = new ResizeObserver(medir);
    obs.observe(izq);
    obs.observe(der);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="disco">
      <main className="disco-cuerpo">
        <section className="disco-izquierda" ref={izquierdaRef}>
          <div>
            <Portada seleccion={seleccion} />
          </div>
          {/* Vuelve al universo con la selección INTACTA: "otra vez" es rehacer
              el test, no perder lo marcado y empezar de cero. */}
          <button type="button" className="disco-otra" onClick={onReintentar}>
            Try again
          </button>
        </section>

        <section className="disco-derecha" ref={derechaRef}>

          <div className="disco-lista">
            <ol ref={listaRef} style={altoLista ? { maxHeight: altoLista } : undefined}>
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

          <div className="disco-importar">
            <p>Import to:</p>
            <ul>
              {PLATAFORMAS.map((p) => (
                <li key={p.nombre}>
                  <button type="button" aria-label={`Importar a ${p.nombre}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.logo} alt={p.nombre} />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="disco-tarjetas">
            <article className="disco-tarjeta es-merch">
              {/* EL SÍMBOLO, ESTAMPADO. No es un adorno sobre la foto: es la
                  figura que esa persona acaba de construir, puesta donde iría
                  serigrafiada. Por eso la tarjeta dice «custom». */}
              {ESTAMPAS.map((e, i) => (
                <SimboloPlano
                  key={i}
                  seleccion={seleccion}
                  className="disco-estampa"
                  style={{
                    left: `${e.x * 100}%`,
                    top: `${e.y * 100}%`,
                    width: `${e.ancho * 100}%`,
                    transform: `translate(-50%, -50%) rotate(${e.giro}deg)`,
                  }}
                />
              ))}
              <div className="disco-tarjeta-pie">
                <p>
                  <strong>Buy</strong>
                  <span>custom merchandising</span>
                </p>
              </div>
              <button type="button" className="disco-tarjeta-ir" aria-label="Ver el merchandising">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.2"
                        strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </article>
            <article className="disco-tarjeta es-album">
              <div className="disco-tarjeta-pie">
                <p>
                  <strong>Explore the</strong>
                  <span>new album</span>
                </p>
              </div>
              <button type="button" className="disco-tarjeta-ir" aria-label="Explorar el álbum">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.2"
                        strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
