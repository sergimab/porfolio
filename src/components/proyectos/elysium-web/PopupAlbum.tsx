"use client";

import Cartel from "./Cartel";
import IconosFlotantes, { FLOTANTES } from "./IconosFlotantes";
import { CANCIONES, claveCancion } from "./canciones";
import type { Era } from "./simbolo";

// El popup de un álbum: su símbolo a la izquierda y sus canciones a la derecha.
//
// Aquí es donde se recogen los datos. Lo que se marque en estos siete popups es
// lo que al final da los porcentajes de cada disco y, con ellos, la figura.
export default function PopupAlbum({
  era,
  seleccion,
  onAlternar,
  onCerrar,
}: {
  era: Era;
  seleccion: Set<string>;
  onAlternar: (id: string) => void;
  onCerrar: () => void;
}) {
  // El mismo modelo que flota en el fondo, traído al centro y a lo grande. Se
  // reutiliza el componente de los flotantes en vez de una imagen del símbolo
  // por dos razones: no hay que exportar siete PNG más, y la pieza sigue
  // girando y tornasolando, que es lo que la hace reconocible como la misma que
  // acabas de pulsar.
  const suyo = FLOTANTES.find((f) => f.era === era);
  const elegidas = CANCIONES[era].filter((c) => seleccion.has(claveCancion(era, c))).length;

  return (
    <Cartel onCerrar={onCerrar} ancho="min(980px, 92%)" etiqueta={`Canciones de ${era}`}>
      <div className="palbum">
        <div className="palbum-simbolo">
          {suyo && (
            <IconosFlotantes
              // Centrado y a lo grande. La escala tiene que ser bastante mayor
              // que la del fondo porque el visor mide el tamaño sobre el ALTO
              // de su hueco, y aquí ese hueco es un cuadro pequeño, no la
              // pantalla entera.
              iconos={[{ ...suyo, x: 0, y: 0, escala: 2.7, movimiento: "flota" }]}
            />
          )}
        </div>

        <div className="palbum-lista">
          <h2 className="palbum-titulo">{era}</h2>
          <p className="palbum-ayuda">
            Marca las canciones que te representan
            {elegidas > 0 && <span className="palbum-cuenta">{elegidas}</span>}
          </p>

          <ul className="palbum-canciones">
            {CANCIONES[era].map((cancion) => {
              const id = claveCancion(era, cancion);
              const puesta = seleccion.has(id);
              return (
                <li key={id}>
                  <button
                    type="button"
                    className={`palbum-cancion${puesta ? " es-puesta" : ""}`}
                    onClick={() => onAlternar(id)}
                    aria-pressed={puesta}
                  >
                    <span className="palbum-marca" aria-hidden="true">
                      {puesta && (
                        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor"
                          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2.5 6.3 4.8 8.6 9.5 3.5" />
                        </svg>
                      )}
                    </span>
                    {cancion}
                  </button>
                </li>
              );
            })}
          </ul>

          <button type="button" className="cartel-boton" onClick={onCerrar}>
            BACK
          </button>
        </div>
      </div>
    </Cartel>
  );
}
