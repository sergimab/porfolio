"use client";

import { useEffect, useMemo, useState } from "react";
import LienzoMetal, { ALCANCE, type TrazoHecho } from "@/components/proyectos/elysium/LienzoMetal";
import Galaxia from "./Galaxia";
import IconosFlotantes from "./IconosFlotantes";
import { ERAS, POR_TRAMO } from "./simbolo";
import { figuraDeEras } from "./simbolo";
import { contarPorEra } from "./canciones";
import { crearEstudioIridiscente } from "./estudioIridiscente";
import { GROSOR_REFERENCIA } from "./simbolo";

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
    .map((trazo) => {
      // Cada trazo puede tener su propio momento de aparición. Una púa brota de
      // un brazo, así que no debe dibujarse antes que él: hasta que el trazado
      // no llega a su vértice, la púa ni existe, y a partir de ahí recorre su
      // propio camino en lo que queda de animación.
      const desde = trazo.desde ?? 0;
      const propio = desde >= 1 ? 1 : (avance - desde) / (1 - desde);
      return {
        ...trazo,
        puntos:
          propio <= 0
            ? []
            : trazo.puntos.slice(0, Math.round(trazo.puntos.length * Math.min(1, propio))),
      };
    })
    .filter((trazo) => trazo.puntos.length >= 2);
}

// El esqueleto: el recorrido desnudo del que sale la figura.
//
// Es una herramienta de taller, no parte de la web. Encima del metal se dibuja
// la línea que lo genera, sus vértices y —lo que de verdad explica las masas—
// un círculo por punto con el radio que ese punto pide. Donde esos círculos se
// solapan es donde el campo suma, y ahí es donde aparece el bulto: verlo es
// mucho más rápido que deducirlo del resultado.
//
// Va en las mismas coordenadas que la figura, que son fracción del ANCHO del
// lienzo. Por eso el viewBox es 0 0 1 1 y el marco tiene que ser cuadrado.
function Esqueleto({ figura }: { figura: TrazoHecho[] }) {
  return (
    <svg className="simfinal-esqueleto" viewBox="0 0 1 1" aria-hidden="true">
      {figura.map((trazo, t) => (
        <g key={t}>
          {/* El alcance de cada punto: la huella que deja en el campo. Se pinta
              uno de cada tres, que basta para ver el solape y no tapa la línea. */}
          {trazo.puntos.map((p, i) =>
            i % 3 ? null : (
              <circle key={i} cx={p.x} cy={p.y} r={p.r * (p.a ?? 1) * ALCANCE} className="es-alcance" />
            )
          )}
          <polyline points={trazo.puntos.map((p) => `${p.x},${p.y}`).join(" ")} className="es-linea" />
          {/* Los vértices, que es donde el recorrido cambia de dirección y donde
              nace toda la forma. */}
          {trazo.puntos.map((p, i) =>
            i % POR_TRAMO ? null : <circle key={i} cx={p.x} cy={p.y} r={0.006} className="es-vertice" />
          )}
        </g>
      ))}
    </svg>
  );
}

// La pantalla final: el universo se queda detrás, desenfocado, y el símbolo se
// dibuja solo en el centro.
export default function PantallaSimbolo({ seleccion }: { seleccion: Set<string> }) {
  const figuraCompleta = useMemo(() => {
    const pesos = contarPorEra(seleccion, ERAS);
    return figuraDeEras(pesos);
  }, [seleccion]);

  const [avance, setAvance] = useState(0);
  // PROVISIONAL, para afinar la forma: enseña el recorrido del que sale el
  // metal. Se va con el botón que lo enciende.
  const [esqueleto, setEsqueleto] = useState(false);

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
              // Sin suavizar el recorrido. El suavizado está para el temblor de
              // la mano, y aquí no hay mano: lo único que hacía era redondear
              // las esquinas, que son justo lo que tiene que quedar afilado.
              // Las redondeadas siguen saliendo solas —una esquina a la que
              // llega un brazo grueso se cierra en curva porque la fusión la
              // rellena—, así que conviven las dos.
              suavizado={0}
              // El grosor de referencia, común a TODOS los trazos de la figura.
              // Sin él, cada púa se normaliza contra sí misma y sale a plena
              // altura por fina que sea, mientras que el brazo del que nace
              // —fino de verdad comparado con el resto— se queda casi invisible.
              // La púa se veía y su brazo no, y parecía flotando.
              referencia={GROSOR_REFERENCIA}
              // Las alturas para la normal se miden más lejos. La normal sale de
              // restar dos muestras del mapa, y el mapa tiene 256 niveles: cuanto
              // más juntas se toman, más pesa el escalón frente a la pendiente
              // real, y eso es exactamente el ruido que se veía. Separándolas, la
              // superficie sale limpia a cambio de un filo un pelo menos seco.
              suavidad={5}
            />
          )}
          {/* El esqueleto va sobre el mismo cuadrado y con el MISMO recorte que
              el metal, así que se construye a la vez que él: es la forma de ver
              qué parte del trazo está produciendo cada masa, y en qué momento. */}
          {esqueleto && <Esqueleto figura={figura} />}
        </div>
      </div>

      {/* PROVISIONAL: el interruptor del esqueleto. Va en la esquina contraria a
          la salida al portfolio para no pisarla. */}
      <button
        type="button"
        className={`simfinal-esqueleto-boton${esqueleto ? " es-activo" : ""}`}
        onClick={() => setEsqueleto((v) => !v)}
        aria-pressed={esqueleto}
      >
        Trazo
      </button>
    </div>
  );
}
