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
const CURVA = 0.012;
// Cuánto se separa el recorrido del borde de su bloque. NEGATIVO: va por
// dentro, montado sobre el borde.
//
// Por fuera no funciona, y no es cuestión de gusto: los bloques ocupan la
// columna entera, así que "fuera" cae en los milímetros que quedan hasta el
// borde del contenedor —o directamente fuera de él— y el lienzo lo recorta. Se
// veía el tramo de abajo de un bloque y poco más. Montado sobre el borde, el
// recorrido está siempre dentro y además es donde lo pone el diseño.
const MARGEN = -0.0016;
// Grosor del montante, en las mismas unidades.
//
// Va en fracción del ancho del CONTENEDOR, y el contenedor es ahora la página
// entera, no una columna: el mismo grosor aparente pide aquí un número tres
// veces menor. Es la cuenta que ya me falló una vez en sentido contrario, con
// la cinta tan fina que no cruzaba el umbral del campo.
const GROSOR = 0.0042;
// Puntos por tramo recto, por cuarto de curva y por puente entre bloques.
const POR_LADO = 10;
const POR_CURVA = 8;
const POR_PUENTE = 16;

// El ancho de referencia del contenedor, y los ajustes de material medidos
// sobre él. Van en píxeles —el redondeo es un desenfoque y la suavidad, la
// separación de las muestras que dan la normal—, así que en una pantalla
// estrecha pesan más y adelgazan la cinta. Escalándolos, se ve igual en
// cualquier tamaño. Ver el mismo apaño en Portada.
const ANCHO_BASE = 1100;
const REDONDEO_BASE = 1.5;
const SUAVIDAD_BASE = 7;

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
  // Si se encadena con el bloque anterior en vez de empezar una cinta nueva.
  // Con esto, una sola línea puede rodear la portada, saltar a la lista, bajar
  // al importar y morir en las tarjetas: es lo que hace que el conjunto se lea
  // como UNA cinta recorriendo la página y no como cuatro recuadros.
  unir?: boolean;
};

// El puente entre dos bloques: una curva que sale por donde acabó la cinta y
// entra por donde empieza la siguiente.
//
// Los tirantes salen en la DIRECCIÓN en la que iba y en la que va a ir cada
// cinta, no hacia el otro bloque. Es lo que hace que el puente parezca una
// continuación del recorrido y no un cable tendido entre dos piezas: la línea
// no da un volantazo al llegar al borde, sigue y gira.
function puente(
  desde: [number, number],
  salida: [number, number],
  hasta: [number, number],
  entrada: [number, number],
  pasos: number
): [number, number][] {
  const d = Math.hypot(hasta[0] - desde[0], hasta[1] - desde[1]);
  const tirante = Math.max(0.04, d * 0.45);
  const c1: [number, number] = [desde[0] + salida[0] * tirante, desde[1] + salida[1] * tirante];
  const c2: [number, number] = [hasta[0] - entrada[0] * tirante, hasta[1] - entrada[1] * tirante];
  const puntos: [number, number][] = [];
  for (let n = 1; n < pasos; n++) {
    const t = n / pasos;
    const u = 1 - t;
    puntos.push([
      u * u * u * desde[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * hasta[0],
      u * u * u * desde[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * hasta[1],
    ]);
  }
  return puntos;
}

// La dirección de un punto al siguiente, normalizada.
function rumbo(a: [number, number], b: [number, number]): [number, number] {
  const d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  return [(b[0] - a[0]) / d, (b[1] - a[1]) / d];
}

export default function MarcoLiquido({ marcos }: { marcos: Marco[] }) {
  const cajaRef = useRef<HTMLDivElement>(null);
  const [medidas, setMedidas] = useState<Record<string, Caja>>({});
  const [avance, setAvance] = useState(0);
  const [ancho, setAncho] = useState(ANCHO_BASE);

  // Se mide el sitio de cada bloque dentro de este contenedor, en fracción de
  // su ANCHO —incluida la vertical—, porque es en esas unidades en las que
  // trabaja el lienzo.
  useLayoutEffect(() => {
    const cont = cajaRef.current;
    if (!cont) return;
    const medir = () => {
      const base = cont.getBoundingClientRect();
      if (base.width < 1) return;
      setAncho(base.width);
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
    const listos = marcos.filter((m) => medidas[m.bloque]);
    if (!listos.length) return [];

    // Se encadenan en cintas: cada marco con `unir` se pega al anterior por un
    // puente, y el que no lo lleva empieza una cinta nueva.
    const cintas: [number, number][][] = [];
    for (const m of listos) {
      const tramo = recorrido(medidas[m.bloque], m.lados);
      const anterior = cintas[cintas.length - 1];
      if (m.unir && anterior && anterior.length > 1) {
        const fin = anterior[anterior.length - 1];
        const salida = rumbo(anterior[anterior.length - 2], fin);
        const entrada = rumbo(tramo[0], tramo[1]);
        anterior.push(...puente(fin, salida, tramo[0], entrada, POR_PUENTE), ...tramo);
      } else {
        cintas.push(tramo);
      }
    }

    // El reparto del tiempo va por LONGITUD y no por número de cintas: si no,
    // el marco corto de las tarjetas tardaría lo mismo en trazarse que la
    // vuelta entera a la portada, y la velocidad de la línea daría tirones al
    // pasar de una a otra.
    const largos = cintas.map((c) =>
      c.reduce((s, p, i) => (i ? s + Math.hypot(p[0] - c[i - 1][0], p[1] - c[i - 1][1]) : 0), 0)
    );
    const total = largos.reduce((s, l) => s + l, 0) || 1;
    let acumulado = 0;

    return cintas.map((c, i) => {
      const desde = acumulado / total;
      acumulado += largos[i];
      // Sin afilar por donde empieza y afilada por donde acaba: la cinta nace
      // pegada al bloque y muere en punta, que es lo que hace en la referencia.
      return {
        puntos: c.map(([x, y]) => ({ x, y, r: GROSOR })) as Punto[],
        sinEntrada: true,
        desde,
        hasta: acumulado / total,
      };
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
          suavidad={Math.max(3, Math.round((SUAVIDAD_BASE * ancho) / ANCHO_BASE))}
          redondeo={(REDONDEO_BASE * ancho) / ANCHO_BASE}
          filo={0.9}
          grano={0.1}
        />
      )}
    </div>
  );
}
