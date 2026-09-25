"use client";

import { useEffect, useMemo } from "react";
import LienzoGaga from "./LienzoGaga";
import Galaxia from "./Galaxia";
import IconosFlotantes from "./IconosFlotantes";
import { ERAS } from "./simbolo";
import { fraccionPorEra } from "./canciones";

// EL SÍMBOLO APARECE HECHO, con un fundido, y se queda a la vista lo que dura
// esta espera antes de pasar a la portada.
//
// Antes se trazaba, y eran casi siete segundos de línea creciendo. Aquello se
// podía hacer porque el motor de entonces dibujaba un recorrido y se podía
// cortar por la mitad. El de ahora reparte los porcentajes y rellena la silueta
// de una vez, así que lo único que se podía animar era el valor de cada eje, y
// eso no hacía crecer la figura: la deformaba, porque el grosor del trazo no
// depende de los porcentajes. Aparecer hecha es más honesto con lo que es.
const ESPERA = 3600;

// EL TALLER SE FUE CON EL MOTOR ANTERIOR. Aquí vivían el recorte del trazo —un
// trim path que enseñaba la línea creciendo—, el esqueleto que dibujaba el
// recorrido desnudo encima del metal y el panel de mandos. Los tres existían
// para afinar un generador que ya no está: el de ahora se afinó aparte y llega
// con sus números puestos. Ver formaGaga y LienzoGaga.

export default function PantallaSimbolo({
  seleccion,
  onListo,
}: {
  seleccion: Set<string>;
  // Se avisa cuando el símbolo ha terminado de trazarse, para pasar a la
  // portada. La espera no va aquí dentro sino en el efecto: el símbolo recién
  // hecho merece un momento a la vista antes de que la pantalla cambie.
  onListo: () => void;
}) {
  const completo = useMemo(() => fraccionPorEra(seleccion, ERAS), [seleccion]);
  const hay = completo.some((v) => v > 0);

  useEffect(() => {
    const salto = window.setTimeout(onListo, ESPERA);
    return () => clearTimeout(salto);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="inicio simfinal">
      <Galaxia />
      <IconosFlotantes />

      {/* El velo que desenfoca el universo entero. No lleva color propio: todo
          lo que se ve a través de él es el fondo, solo que emborronado y con el
          color subido, así que las eras siguen ahí sin competir con la figura. */}
      <div className="simfinal-velo" aria-hidden="true" />

      <div className="simfinal-centro">
        <div className="simfinal-lienzo">
          {hay && (
            <LienzoGaga
              valores={completo}
              // Cromo, que es el material del universo: la pieza se recorta
              // contra las eras desenfocadas y tiene que devolverlas. El fondo
              // del lienzo se queda transparente para eso.
              material="cromo"
              className="simfinal-simbolo"
            />
          )}
        </div>
      </div>

    </div>
  );
}
