"use client";

import { useEffect, useMemo, useState } from "react";
import LienzoMetal, { type TrazoHecho } from "@/components/proyectos/elysium/LienzoMetal";
import Galaxia from "./Galaxia";
import IconosFlotantes from "./IconosFlotantes";
import { ERAS } from "./simbolo";
import { figuraDeEras } from "./simbolo";
import { contarPorEra } from "./canciones";
import { crearEstudioIridiscente } from "./estudioIridiscente";

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
              // El MISMO plató que ilumina los iconos que flotan en el fondo.
              // No es parecido, es el mismo archivo: un metal no tiene color
              // propio, así que el panorama ES el material, y compartirlo hace
              // que el símbolo generado y las eras se lean como la misma
              // sustancia.
              //
              // Lo que no se puede clonar es el modelo de sombreado: los iconos
              // son geometría 3D con el material físico de la librería, y esto
              // es un relieve deducido de un mapa de altura. Comparten el
              // entorno y la óptica del reflejo; la iridiscencia de película
              // fina de aquellos la sustituye aquí la dispersión.
              entorno={crearEstudioIridiscente}
              // Dispersión contenida. Llegó a estar en 0,045 y luego en 0,022, y
              // las dos se pasaban: el color invadía la superficie y, sobre
              // todo, amplificaba los escalones de los 256 niveles del mapa de
              // altura hasta salpicar la pieza de moteado. Lo que en la
              // referencia es un filo de arcoíris aquí se convertía en suciedad.
              dispersion={0.013}
              // Y sin capas. Eran el reflejo del canto repetido hacia dentro, y
              // funcionaban con la cinta gruesa; con la cinta fina no hay fondo
              // donde quepan, así que solo aportaban líneas que no correspondían
              // a nada y delataban el truco. Lo que hace realista a esto es la
              // óptica que ya había, no una capa más encima.
              capas={0}
              brillo={1.25}
              // Cada brazo con su grosor: es lo que deja que los discos poco
              // votados salgan como hilos y se peguen a los gruesos.
              grosorLibre
              // Y el alcance desligado del grosor, que es lo que hace que dos
              // partes finas que se acercan se unan en vez de pasar de largo.
              atraccion
              // Las alturas para la normal se miden más lejos. La normal sale de
              // restar dos muestras del mapa, y el mapa tiene 256 niveles: cuanto
              // más juntas se toman, más pesa el escalón frente a la pendiente
              // real, y eso es exactamente el ruido que se veía. Separándolas, la
              // superficie sale limpia a cambio de un filo un pelo menos seco.
              suavidad={5}
            />
          )}
        </div>
      </div>
    </div>
  );
}
