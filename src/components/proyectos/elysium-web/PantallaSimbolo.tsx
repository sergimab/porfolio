"use client";

import { useEffect, useMemo, useState } from "react";
import LienzoMetal, { ALCANCE, type TrazoHecho } from "@/components/proyectos/elysium/LienzoMetal";
import Galaxia from "./Galaxia";
import IconosFlotantes from "./IconosFlotantes";
import { ERAS, POR_TRAMO, type Grafico } from "./simbolo";
import { figuraDeEras, graficoDeEras } from "./simbolo";
import { contarPorEra } from "./canciones";
import { crearEstudioCromo } from "./estudioCromo";
import Controles, { type Material } from "./Controles";

// Las dos herramientas de taller —el esqueleto del trazo y el panel de mandos—
// se apagan aquí. El código se queda: mientras la forma no esté cerrada del
// todo, volver a encenderlas es cambiar este `false` por `true`, y borrarlas
// significaría reescribirlas la próxima vez que haya que afinar algo.
const TALLER = false;

// Lo que tarda el símbolo en trazarse entero. Largo a propósito: es el momento
// en que aparece lo que la persona acaba de generar, y merece verse nacer.
const DURACION = 6800;
// Y lo que se queda a la vista, ya entero, antes de pasar a la portada. Sin
// esta pausa el símbolo se termina de trazar y desaparece en el mismo gesto:
// hay que darle un momento para verlo hecho.
const PAUSA = 1400;

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
      // Cada trazo tiene su TURNO dentro de la animación: empieza cuando le
      // toca y termina antes de que empiece el siguiente. La figura es una
      // retícula de una docena de piezas, y sin turnos crecerían todas a la vez
      // desde sitios distintos —que no se lee como trazar, se lee como
      // aparecer—.
      const desde = trazo.desde ?? 0;
      const hasta = trazo.hasta ?? 1;
      const propio = hasta <= desde ? 1 : (avance - desde) / (hasta - desde);
      // Mientras se está trazando, el extremo que avanza es la CABEZA y tiene
      // que ir en punta aunque el trazo acabado no se afile ahí.
      //
      // El remate de verdad se recupera UN POCO ANTES del final, no en el
      // último fotograma, y de ahí venía el saltito al completarse: la cabeza
      // pasaba de aguja a cabo romo de golpe, con la figura ya quieta, y ese
      // engorde repentino se lee como un tirón. Cambiándolo cuando aún quedan
      // unos puntos por recorrer, el cambio de remate ocurre mientras la línea
      // todavía avanza y queda enmascarado por su propio movimiento. Además,
      // esos últimos puntos caen dentro de la masa del centro —el trazo vuelve
      // ahí—, así que el cabo romo se entierra en ella.
      const enCurso = propio < 0.96;
      return {
        ...trazo,
        sinSalida: enCurso ? false : trazo.sinSalida,
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
function Esqueleto({ figura, grafico }: { figura: TrazoHecho[]; grafico: Grafico | null }) {
  return (
    <svg className="simfinal-esqueleto" viewBox="0 0 1 1" aria-hidden="true">
      {/* El gráfico va debajo de todo: es el andamio, no el dibujo. */}
      {grafico && (
        <g className="es-grafico">
          {grafico.ejes.map((eje) => (
            <line
              key={eje.era}
              x1={grafico.centro[0]}
              y1={grafico.centro[1]}
              x2={eje.punta[0]}
              y2={eje.punta[1]}
              className="es-eje"
            />
          ))}
          {/* El alambre: el contorno a trazo continuo y las cuerdas que lo
              subdividen en celdas, a rayas, para distinguir a simple vista qué
              parte de la retícula viene de dónde. */}
          {grafico.aristas.map((a, i) => (
            <line
              key={i}
              x1={a.a[0]}
              y1={a.a[1]}
              x2={a.b[0]}
              y2={a.b[1]}
              className={a.contorno ? "es-contorno" : "es-cuerda"}
            />
          ))}
          <circle cx={grafico.centro[0]} cy={grafico.centro[1]} r={0.006} className="es-centro" />
          {grafico.marcas.map((m) => (
            <g key={m.era}>
              <circle
                cx={m.en[0]}
                cy={m.en[1]}
                r={0.009}
                className={m.celda ? "es-marca es-recorta" : "es-marca"}
              />
              {/* Su puesto por votos y cuántas canciones lo sostienen: con los
                  dos se lee de un vistazo si la retícula es la que debería. */}
              <text x={m.en[0]} y={m.en[1] - 0.019} className="es-orden">
                {m.orden}
                <tspan className="es-peso">{` (${m.peso})`}</tspan>
              </text>
            </g>
          ))}
        </g>
      )}

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
  // PROVISIONAL, para afinar la forma: enseña el recorrido del que sale el
  // metal. Se va con el botón que lo enciende.
  const [esqueleto, setEsqueleto] = useState(false);
  // PROVISIONAL, como el esqueleto: el panel de mandos y un contador que sube
  // en cada toque de barra. Los valores de la forma viven en el objeto AJUSTES
  // —ver Controles—, así que hace falta algo que le diga a React que lo que
  // dependía de ellos ha cambiado; el contador es ese aviso.
  const [mandos, setMandos] = useState(false);
  const [retoque, setRetoque] = useState(0);
  const [material, setMaterial] = useState<Material>({
    // Vidrio, no cromo: los canales muy separados son los destellos de
    // arcoíris de los filos.
    dispersion: 0.012,
    suavidad: 9,
    redondeo: 2.5,
    brillo: 1.7,
  });

  const pesos = useMemo(() => contarPorEra(seleccion, ERAS), [seleccion]);

  const figuraCompleta = useMemo(
    () => figuraDeEras(pesos),
    [pesos, retoque]
  );

  // El gráfico del que sale, solo para la vista de taller.
  const grafico = useMemo(
    () => graficoDeEras(pesos),
    [pesos, retoque]
  );

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
              // El plató del vidrio: oscuro con unas pocas fuentes muy
              // brillantes. Un objeto transparente se ilumina así en un plató
              // de verdad, y es lo que produce las bandas nítidas; en una
              // habitación clara y pareja el vidrio pierde el dibujo interior y
              // sale como una pastilla blanca.
              entorno={crearEstudioCromo}
              dispersion={material.dispersion}
              // Y CON capas: son el reflejo del canto repetido hacia dentro,
              // que es exactamente el dibujo de la referencia —cada brazo
              // llevando dos o tres líneas paralelas a su propio contorno—.
              //
              // Estuvieron en cero mucho tiempo, y con razón: entonces la cinta
              // era fina y no había fondo donde cupieran, así que solo aportaban
              // líneas que no correspondían a nada. Ahora los montantes tienen
              // cuerpo y las líneas caen donde deben.
              capas={2}
              brillo={material.brillo}
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
              // Sin referencia común: la figura es UN solo trazo, así que se
              // normaliza contra sí mismo, que es justo lo que hace falta. El
              // grosor no es fijo —escala con la figura para que la fusión se
              // conserve al ampliarla, ver `escala` en simbolo.ts—, y una
              // referencia constante lo dejaría descuadrado.
              // Las alturas para la normal se miden más lejos. La normal sale de
              // restar dos muestras del mapa, y el mapa tiene 256 niveles: cuanto
              // más juntas se toman, más pesa el escalón frente a la pendiente
              // real, y eso es exactamente el ruido que se veía. Separándolas, la
              // superficie sale limpia a cambio de un filo un pelo menos seco.
              // Las alturas para la normal se miden bastante lejos. La normal
              // sale de restar dos muestras del mapa, y el mapa tiene 256
              // niveles: cuanto más juntas se toman, más pesa el escalón frente
              // a la pendiente real. Eso es el moteado que recorría la cresta de
              // cada montante —un punteado fino, como una costura—, y de 5 a 9
              // desaparece. Se paga con un filo un pelo menos seco, que en una
              // pieza de canto redondeado como esta no se echa de menos.
              suavidad={material.suavidad}
              // El mapa de altura, redondeado antes de iluminarlo: es lo que
              // quita el pico de los cruces. Ver componerMapa en el lienzo.
              redondeo={material.redondeo}
              // La tapa del campo, que es lo que quita los valles de los
              // cruces: donde dos trazos se suman, el cruce sobresale y esa
              // cima trae sus laderas sombreadas. Ver `tapar` en el lienzo.
              techo={0.66}
              // Y los faldones tumbados: la superficie se acerca a una chapa de
              // espejo y el vuelco se queda solo en el canto, que es lo que
              // pedía la referencia. De paso es lo que quita el tono rojizo,
              // porque la inclinación decide qué zona del panorama refleja cada
              // punto.
              relieve={1.5}
              // Y la película fina de los iconos que flotan. Es lo que faltaba
              // para que se vieran del mismo material: compartir plató no
              // bastaba, porque su tornasol no sale de la habitación sino de la
              // película. Mismos números que ellos.
              tornasol={0}
              pelicula={340}
              peliculaIOR={2.25}
              saturacion={1}
              planicie={0.65}
              // Sin filo ni grano bajos, al contrario que en la portada, y
              // probado: allí aplanan los pliegues, pero aquí el plató es otro
              // —el del vidrio, con sus bandas oscuras estrechas— y lo que sale
              // es un enrejado de facetas romboidales por toda la superficie.
              // Estos dos mandos trabajan sobre la luz, así que su resultado
              // depende de la habitación, y lo que vale en una no vale en la
              // otra.
            />
          )}
          {/* El esqueleto va sobre el mismo cuadrado y con el MISMO recorte que
              el metal, así que se construye a la vez que él: es la forma de ver
              qué parte del trazo está produciendo cada masa, y en qué momento. */}
          {esqueleto && <Esqueleto figura={figura} grafico={grafico} />}
        </div>
      </div>

      {/* PROVISIONAL: el interruptor del esqueleto. Va en la esquina contraria a
          la salida al portfolio para no pisarla. */}
      {TALLER && (
        <>
      <button
        type="button"
        className={`simfinal-esqueleto-boton${esqueleto ? " es-activo" : ""}`}
        onClick={() => setEsqueleto((v) => !v)}
        aria-pressed={esqueleto}
      >
        Trazo
      </button>

      {/* PROVISIONAL: los mandos del generador. */}
      <button
        type="button"
        className={`simfinal-esqueleto-boton es-mandos${mandos ? " es-activo" : ""}`}
        onClick={() => setMandos((v) => !v)}
        aria-pressed={mandos}
      >
        Mandos
      </button>
      {mandos && (
        <Controles
          material={material}
          onMaterial={setMaterial}
          onCambio={() => setRetoque((n) => n + 1)}
          onCerrar={() => setMandos(false)}
          pesos={pesos}
        />
      )}
        </>
      )}
    </div>
  );
}
