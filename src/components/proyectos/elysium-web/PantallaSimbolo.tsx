"use client";

import { useEffect, useMemo, useState } from "react";
import LienzoGaga from "./LienzoGaga";
import Galaxia from "./Galaxia";
import IconosFlotantes from "./IconosFlotantes";
import { ERAS } from "./simbolo";
import { fraccionPorEra } from "./canciones";

// EL SÍMBOLO SE TRAZA, y esto es lo que tarda en dibujarse entero.
//
// Es un trim path de verdad: el generador recorta el CAMINO —centro, el disco
// más votado, el siguiente, hasta volver al centro— por su longitud, y monta las
// barras solo sobre el trozo dibujado. La punta avanza a velocidad constante, y
// el encuadre se queda quieto en la figura entera desde el primer cuadro para
// que la cámara no persiga a la línea. Ver `recorte` en formaGaga.
const DURACION = 5200;
// Y lo que se queda a la vista, ya entera, antes de pasar a la portada. Sin esta
// pausa el símbolo se termina de trazar y desaparece en el mismo gesto.
const PAUSA = 1500;

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

  const [recorte, setRecorte] = useState(0);

  useEffect(() => {
    // Para quien pide menos movimiento, la figura aparece hecha. No es una
    // versión pobre: el resultado es el símbolo, y trazarlo es el adorno.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setRecorte(1);
      const salto = window.setTimeout(onListo, PAUSA);
      return () => clearTimeout(salto);
    }
    let raf = 0, espera = 0, inicio = 0;
    const paso = (t: number) => {
      if (!inicio) inicio = t;
      const p = Math.min(1, (t - inicio) / DURACION);
      // Arranca sin tirón y llega al final frenando, que es como se termina un
      // trazo a mano.
      setRecorte(p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
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
              recorte={recorte}
              className="simfinal-simbolo"
            />
          )}
        </div>
      </div>

    </div>
  );
}
