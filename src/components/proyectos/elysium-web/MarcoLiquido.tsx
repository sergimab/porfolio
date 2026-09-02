"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import LienzoMetal, { type Punto, type TrazoHecho } from "@/components/proyectos/elysium/LienzoMetal";
import { crearEstudioIridiscente } from "./estudioIridiscente";
import { animarAvance, recortar } from "./trim";

// Los marcos líquidos que rodean los bloques de la página.
//
// Son el mismo metal del símbolo y se trazan igual: una línea que crece con un
// trim path. La diferencia es de dónde sale el recorrido — el del símbolo lo
// calculan los votos, y estos los calcula el PROPIO SITIO QUE OCUPAN LOS
// BLOQUES en pantalla.
//
// Por eso se miden en vivo con un observador de tamaño en vez de escribirse a
// mano en fracciones: la página es una rejilla que cambia de proporciones con
// la ventana, y unas coordenadas fijas se despegarían de sus cajas en cuanto
// alguien redimensionara. Midiendo, el marco sigue a su bloque siempre.

// Cuánto tarda en trazarse el conjunto, y cuánto espera desde que la página
// aparece: primero se lee el contenido, luego lo rodea el metal.
const DURACION = 2600;
const ESPERA = 500;

// El radio con el que el recorrido dobla una esquina. En fracción del ancho del
// contenedor, igual que el resto de coordenadas.
const CURVA = 0.035;
// Cuánto se separa el recorrido del borde de su bloque. NEGATIVO: va por
// dentro, montado sobre el borde.
//
// Por fuera no funciona, y no es cuestión de gusto: los bloques ocupan la
// columna entera, así que "fuera" cae en los milímetros que quedan hasta el
// borde del contenedor —o directamente fuera de él— y el lienzo lo recorta. Se
// veía el tramo de abajo de un bloque y poco más. Montado sobre el borde, el
// recorrido está siempre dentro y además es donde lo pone el diseño.
const MARGEN = -0.005;
// Grosor del montante, en las mismas unidades.
//
// Con 0,006 la cinta salía tan fina que apenas cruzaba el umbral del campo y se
// veía a trozos. Es la misma cuenta de siempre: el grosor va en fracción del
// ancho del CONTENEDOR, y esta columna es estrecha, así que el mismo número que
// en el símbolo da aquí la mitad de píxeles.
const GROSOR = 0.013;
// Puntos por tramo recto y por cuarto de curva.
const POR_LADO = 10;
const POR_CURVA = 8;

type Caja = { x: number; y: number; ancho: number; alto: number };

// Un recorrido en L o en U alrededor de una caja, indicando por qué lados pasa.
//
// Los lados se dan en orden y el recorrido los recorre encadenados, doblando en
// cada esquina. No se cierra: la gracia de la referencia es que el metal rodea
// el bloque por unos lados y se va, dejando el resto del borde limpio.
type Lado = "arriba" | "derecha" | "abajo" | "izquierda";

// Las esquinas de la caja ya con su margen, para que el recorrido no pise el
// bloque.
function esquinas(c: Caja) {
  const x0 = c.x - MARGEN;
  const y0 = c.y - MARGEN;
  const x1 = c.x + c.ancho + MARGEN;
  const y1 = c.y + c.alto + MARGEN;
  return {
    arriba: [
      [x0, y0],
      [x1, y0],
    ] as [number, number][],
    derecha: [
      [x1, y0],
      [x1, y1],
    ] as [number, number][],
    abajo: [
      [x1, y1],
      [x0, y1],
    ] as [number, number][],
    izquierda: [
      [x0, y1],
      [x0, y0],
    ] as [number, number][],
  };
}

// De la lista de lados a una poligonal con las esquinas redondeadas.
function recorrido(c: Caja, lados: Lado[]): [number, number][] {
  const e = esquinas(c);
  const vertices: [number, number][] = [];
  for (const lado of lados) {
    const [a, b] = e[lado];
    if (!vertices.length) vertices.push(a);
    vertices.push(b);
  }

  // Muestreo: recto entre esquinas y un cuarto de vuelta en cada una. Redondear
  // importa más de lo que parece — una esquina en ángulo vivo, con este campo,
  // se estira en aguja, y aquí no queremos agujas sino una cinta que dobla.
  const puntos: [number, number][] = [];
  for (let i = 0; i < vertices.length - 1; i++) {
    const p = vertices[i];
    const q = vertices[i + 1];
    const largo = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
    const ux = (q[0] - p[0]) / largo;
    const uy = (q[1] - p[1]) / largo;
    // El tramo recto se acorta por los dos extremos para dejar sitio a las
    // curvas, salvo en los cabos del recorrido, que llegan hasta el final.
    const recorteA = i === 0 ? 0 : Math.min(CURVA, largo / 2);
    const recorteB = i === vertices.length - 2 ? 0 : Math.min(CURVA, largo / 2);
    const desde: [number, number] = [p[0] + ux * recorteA, p[1] + uy * recorteA];
    const hasta: [number, number] = [q[0] - ux * recorteB, q[1] - uy * recorteB];
    for (let n = 0; n <= POR_LADO; n++) {
      const t = n / POR_LADO;
      puntos.push([desde[0] + (hasta[0] - desde[0]) * t, desde[1] + (hasta[1] - desde[1]) * t]);
    }
    // Y la curva hacia el siguiente lado, con la propia esquina de control.
    if (i < vertices.length - 2) {
      const r = vertices[i + 2];
      const largo2 = Math.hypot(r[0] - q[0], r[1] - q[1]) || 1;
      const vx = (r[0] - q[0]) / largo2;
      const vy = (r[1] - q[1]) / largo2;
      const salida: [number, number] = [q[0] + vx * Math.min(CURVA, largo2 / 2), q[1] + vy * Math.min(CURVA, largo2 / 2)];
      for (let n = 1; n < POR_CURVA; n++) {
        const t = n / POR_CURVA;
        // Cuadrática con la esquina de control: la curva pasa cerca de ella sin
        // llegar a tocarla, que es exactamente un canto redondeado.
        const u = 1 - t;
        puntos.push([
          u * u * hasta[0] + 2 * u * t * q[0] + t * t * salida[0],
          u * u * hasta[1] + 2 * u * t * q[1] + t * t * salida[1],
        ]);
      }
    }
  }
  return puntos;
}

export type Marco = {
  // El atributo data-marco del bloque al que sigue.
  bloque: string;
  lados: Lado[];
  // Su turno dentro del trazado, de 0 a 1.
  desde: number;
  hasta: number;
};

export default function MarcoLiquido({ marcos }: { marcos: Marco[] }) {
  const cajaRef = useRef<HTMLDivElement>(null);
  const [medidas, setMedidas] = useState<Record<string, Caja>>({});
  const [avance, setAvance] = useState(0);

  // Se mide el sitio de cada bloque dentro de este contenedor, en fracción de
  // su ANCHO —incluida la vertical—, porque es en esas unidades en las que
  // trabaja el lienzo.
  useLayoutEffect(() => {
    const cont = cajaRef.current;
    if (!cont) return;
    const medir = () => {
      const base = cont.getBoundingClientRect();
      if (base.width < 1) return;
      const salida: Record<string, Caja> = {};
      for (const m of marcos) {
        const el = document.querySelector<HTMLElement>(`[data-marco="${m.bloque}"]`);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        salida[m.bloque] = {
          x: (r.left - base.left) / base.width,
          y: (r.top - base.top) / base.width,
          ancho: r.width / base.width,
          alto: r.height / base.width,
        };
      }
      setMedidas(salida);
    };
    medir();
    const obs = new ResizeObserver(medir);
    obs.observe(cont);
    for (const m of marcos) {
      const el = document.querySelector<HTMLElement>(`[data-marco="${m.bloque}"]`);
      if (el) obs.observe(el);
    }
    return () => obs.disconnect();
  }, [marcos]);

  useEffect(() => {
    const espera = window.setTimeout(() => animarAvance(DURACION, setAvance), ESPERA);
    return () => clearTimeout(espera);
  }, []);

  const figura = useMemo<TrazoHecho[]>(() => {
    return marcos
      .filter((m) => medidas[m.bloque])
      .map((m) => {
        const puntos: Punto[] = recorrido(medidas[m.bloque], m.lados).map(([x, y]) => ({
          x,
          y,
          r: GROSOR,
        }));
        // Sin afilar por donde empieza y afilado por donde acaba: la cinta
        // nace del borde de la pantalla o de otro marco y muere en punta, que
        // es lo que hace en la referencia.
        return { puntos, sinEntrada: true, desde: m.desde, hasta: m.hasta };
      });
  }, [marcos, medidas]);

  const recortada = useMemo(() => recortar(figura, avance), [figura, avance]);

  return (
    <div className="marcoliq" ref={cajaRef} aria-hidden="true">
      {recortada.length > 0 && (
        <LienzoMetal
          figura={recortada}
          interactivo={false}
          // El plató iridiscente, no el de la portada. Aquí el fondo de la
          // página es BLANCO, y un cromo claro sobre blanco desaparece: no
          // tiene nada oscuro que devolver. El iridiscente trae montantes
          // oscuros y color, así que la cinta se recorta sobre el papel.
          entorno={crearEstudioIridiscente}
          dispersion={0.015}
          capas={3}
          brillo={1.35}
          grosorLibre
          atraccion
          suavizado={0}
          suavidad={7}
          redondeo={1.5}
          filo={0.9}
          grano={0.1}
        />
      )}
    </div>
  );
}
