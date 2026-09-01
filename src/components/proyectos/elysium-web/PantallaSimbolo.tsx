"use client";

import { useEffect, useMemo, useState } from "react";
import LienzoMetal, { type TrazoHecho } from "@/components/proyectos/elysium/LienzoMetal";
import Galaxia from "./Galaxia";
import IconosFlotantes from "./IconosFlotantes";
import { ERAS } from "./simbolo";
import { figuraDeEras } from "./simbolo";
import { contarPorEra } from "./canciones";
import { crearEstudioCristal } from "./estudioCristal";

// Lo que tarda el símbolo en trazarse entero. Largo a propósito: es el momento
// en que aparece lo que la persona acaba de generar, y merece verse nacer.
const DURACION = 4600;

// Recorta la figura para enseñar solo el principio de su recorrido.
//
// Es el equivalente a un trim path: la línea es siempre la misma, lo que cambia
// es hasta dónde se dibuja. Y como el lienzo afila el extremo final de todo
// trazo, el punto donde se corta sale en punta, igual que la cabeza de un trazo
// que se está dibujando.
function recortar(figura: TrazoHecho[], avance: number): TrazoHecho[] {
  if (avance <= 0) return [];
  if (avance >= 1) return figura;
  // Sin mínimo forzado: hasta que no hay dos puntos de verdad no se dibuja
  // nada. Forzando dos, en el primer fotograma ya aparecía una mancha diminuta
  // —el lienzo pinta cualquier trazo, por corto que sea— y el arranque se veía
  // como un parpadeo seguido de una espera, en vez de como una línea que
  // empieza a salir de la nada.
  return figura
    .map((trazo) => trazo.slice(0, Math.round(trazo.length * avance)))
    .filter((trazo) => trazo.length >= 2);
}

// La pantalla final: el universo se queda detrás, desenfocado, y el símbolo se
// dibuja solo en el centro.
export default function PantallaSimbolo({ seleccion }: { seleccion: Set<string> }) {
  const figuraCompleta = useMemo(() => {
    const pesos = contarPorEra(seleccion, ERAS);
    return figuraDeEras(pesos);
  }, [seleccion]);

  const [avance, setAvance] = useState(0);

  useEffect(() => {
    // Sin animación, el símbolo aparece hecho. No es una versión pobre: para
    // quien pide menos movimiento, ver la figura es el resultado, y trazarla es
    // el adorno.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setAvance(1);
      return;
    }
    let raf = 0;
    let inicio = 0;
    const paso = (t: number) => {
      if (!inicio) inicio = t;
      const p = Math.min(1, (t - inicio) / DURACION);
      // Suavizado a la entrada y a la salida: arranca sin tirón y llega al
      // final frenando, que es como se termina un trazo a mano.
      setAvance(p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
      if (p < 1) raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, []);

  const figura = useMemo(
    () => recortar(figuraCompleta, avance),
    [figuraCompleta, avance]
  );

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
          {figura.length > 0 && (
            <LienzoMetal
              figura={figura}
              interactivo={false}
              entorno={crearEstudioCristal}
              // Ocho veces la del lienzo de dibujo. Ahí una pizca de separación
              // es el hilo de color del filo de una pieza de cromo; aquí, tanta
              // separación descompone la luz en los cantos y la convierte en
              // vidrio.
              //
              // Llegó a estar en 0,045 y era pasarse: el color invadía la
              // superficie entera, y en la referencia el cuerpo es casi blanco y
              // el arcoíris vive solo en los bordes. De paso, tanta separación
              // amplificaba los escalones de los 256 niveles del mapa de altura
              // y salpicaba la pieza de moteado.
              dispersion={0.022}
              // Dos repeticiones del reflejo hacia dentro: es lo que hace que
              // el canto se lea grueso y transparente en vez de como una chapa.
              //
              // Con tres se escalonaban. El mapa de altura tiene 256 niveles y
              // el reparto de relieve ocupa una franja estrecha de ese rango, así
              // que cuantas más líneas se pidan, menos escalones le tocan a cada
              // una y antes se ven los peldaños.
              capas={2}
              brillo={1.75}
            />
          )}
        </div>
      </div>
    </div>
  );
}
