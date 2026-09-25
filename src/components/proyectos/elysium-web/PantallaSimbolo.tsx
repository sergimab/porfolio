"use client";

import { useEffect, useMemo, useState } from "react";
import LienzoGaga from "./LienzoGaga";
import Galaxia from "./Galaxia";
import IconosFlotantes from "./IconosFlotantes";
import { ERAS } from "./simbolo";
import { fraccionPorEra } from "./canciones";

// Lo que tarda el símbolo en trazarse entero. Largo a propósito: es el momento
// en que aparece lo que la persona acaba de generar, y merece verse nacer.
const DURACION = 6800;
// Y lo que se queda a la vista, ya entero, antes de pasar a la portada. Sin
// esta pausa el símbolo se termina de trazar y desaparece en el mismo gesto:
// hay que darle un momento para verlo hecho.
const PAUSA = 1400;

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
  const [avance, setAvance] = useState(0);

  const completo = useMemo(() => fraccionPorEra(seleccion, ERAS), [seleccion]);
  const hay = completo.some((v) => v > 0);

  useEffect(() => {
    // Sin animación, el símbolo aparece hecho. No es una versión pobre: para
    // quien pide menos movimiento, ver la figura es el resultado, y trazarla es
    // el adorno.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setAvance(1);
      const salto = window.setTimeout(onListo, PAUSA);
      return () => clearTimeout(salto);
    }
    let raf = 0;
    let espera = 0;
    let inicio = 0;
    const paso = (t: number) => {
      if (!inicio) inicio = t;
      const p = Math.min(1, (t - inicio) / DURACION);
      // Suavizado a la entrada y a la salida: arranca sin tirón y llega al
      // final frenando, que es como se termina un trazo a mano.
      setAvance(p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
      if (p < 1) raf = requestAnimationFrame(paso);
      else espera = window.setTimeout(onListo, PAUSA);
    };
    raf = requestAnimationFrame(paso);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(espera);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // LA FIGURA CRECE DESDE EL CENTRO en vez de trazarse punta a punta. El motor
  // de ahora no dibuja una línea que se recorre: reparte los porcentajes en el
  // gráfico y rellena la silueta de una vez, así que no hay «hasta dónde va el
  // trazo» que recortar. Lo que sí hay es cuánto vale cada eje, y subirlos todos
  // de cero a su valor hace que las agujas salgan del centro y se estiren hasta
  // su sitio. El símbolo sigue naciendo delante, solo que de dentro afuera.
  const valores = useMemo(() => completo.map((v) => v * avance), [completo, avance]);

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
              valores={valores}
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
