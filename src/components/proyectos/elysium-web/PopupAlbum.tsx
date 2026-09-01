"use client";

import { useMemo } from "react";
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
  // reutiliza el visor en vez de una imagen del símbolo por dos razones: no hay
  // que exportar siete PNG más, y la pieza sigue levitando, que es lo que la
  // hace reconocible como la misma que se acaba de pulsar.
  //
  // El useMemo NO es un adorno de rendimiento: es lo que impide que el símbolo
  // dé un salto cada vez que se marca una casilla. Marcar cambia el estado y el
  // componente se vuelve a dibujar; si la lista de iconos se construyera aquí
  // mismo, sería un array NUEVO en cada pasada, y el visor la tiene como
  // dependencia, así que respondía montando otra vez la escena entera —recargar
  // el .glb incluido— y la pieza se reiniciaba a mitad de su vaivén. Atada al
  // álbum, la lista es la misma mientras el popup lo sea.
  const iconos = useMemo(() => {
    const suyo = FLOTANTES.find((f) => f.era === era);
    if (!suyo) return [];
    return [
      {
        ...suyo,
        x: 0,
        y: 0,
        // Bastante mayor que en el fondo: el visor mide el tamaño sobre el ALTO
        // de su hueco, y aquí ese hueco es un cuadro, no la pantalla entera.
        escala: 3.6,
        movimiento: "flota" as const,
        // Solo arriba y abajo. Girando se aleja de la silueta con la que se la
        // acaba de reconocer, y de cerca eso despista más que decora.
        soloVertical: true,
      },
    ];
  }, [era]);

  return (
    <Cartel onCerrar={onCerrar} ancho="min(1060px, 93%)" etiqueta={`Canciones de ${era}`}>
      <div className="palbum">
        <div className="palbum-simbolo">
          {iconos.length > 0 && <IconosFlotantes iconos={iconos} />}
        </div>

        <div className="palbum-lista">
          <h2 className="palbum-titulo">{era}</h2>

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
