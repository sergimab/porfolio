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
// BLOQUES en pantalla. Por eso se miden en vivo con un observador de tamaño en
// vez de escribirse a mano: la página es una rejilla que cambia de proporciones
// con la ventana, y unas coordenadas fijas se despegarían de sus cajas.
//
// El VOCABULARIO es lo que se rehízo, y son cuatro reglas sacadas de la
// referencia. La primera versión hacía recuadros redondeados enteros unidos por
// curvas amplias, y eso no es lo que hay dibujado:
//
//  1. Nadie rodea su bloque entero. La cinta abraza dos o tres lados y se va.
//  2. Los cabos SE PASAN DE LARGO. No terminan en la esquina: siguen recto un
//     trecho por el aire y mueren en aguja. Sin ese asomo, el recorrido se lee
//     como un borde; con él, como un trazo.
//  3. En los nudos cruzan AGUJAS: un par de púas finas atravesando la línea en
//     diagonal, de punta a punta. Son la textura de la referencia y lo que
//     emparenta la cinta con los picos del símbolo.
//  4. Hay PIEZAS SUELTAS flotando en el blanco, sin tocar nada.
//
// Y el salto de un bloque al siguiente serpentea por el HUECO entre columnas en
// vez de atajar por encima del contenido, que era lo que interfería.

// Cuánto tarda en trazarse el conjunto, y cuánto espera desde que la página
// aparece: primero se lee el contenido, luego lo rodea el metal.
const DURACION = 2600;
const ESPERA = 500;

// El radio con el que el recorrido dobla una esquina, en fracción del ancho del
// contenedor igual que el resto de coordenadas. Corto a propósito: en la
// referencia las esquinas son casi de escuadra, y una curva amplia devuelve el
// aire de recuadro del que veníamos.
const CURVA = 0.007;
// Cuánto se separa el recorrido del borde de su bloque. NEGATIVO: va por
// dentro, montado sobre el borde.
const MARGEN = -0.0016;
// Grosor del montante, en las mismas unidades. Va en fracción del ancho del
// CONTENEDOR, y el contenedor es la página entera, no una columna.
const GROSOR = 0.0038;
// Lo que se pasa de largo cada cabo antes de morir en punta. Corto: el hueco
// que dejan los bloques hasta el borde del contenedor es el relleno de la
// página, y todo lo que se pase de ahí el lienzo lo recorta.
const ASOMO = 0.032;
// Puntos por tramo recto, por cuarto de curva y por puente entre bloques.
const POR_LADO = 10;
const POR_CURVA = 8;
const POR_PUENTE = 40;
// Las agujas de los nudos: largo y grosor en relación al montante. Largas y
// muy muestreadas porque el afilado se juega en el radio de cada punto, así que
// pocas muestras dan escalones en vez de una punta.
const AGUJA_LARGO = 0.145;
const AGUJA_GROSOR = 0.58;
const POR_AGUJA = 18;

// El ancho de referencia del contenedor, y los ajustes de material medidos
// sobre él. Van en píxeles —el redondeo es un desenfoque y la suavidad, la
// separación de las muestras que dan la normal—, así que en una pantalla
// estrecha pesan más y adelgazan la cinta. Ver el mismo apaño en Portada.
const ANCHO_BASE = 1100;
const REDONDEO_BASE = 1.5;
const SUAVIDAD_BASE = 7;

type Caja = { x: number; y: number; ancho: number; alto: number };
type XY = [number, number];
type Lado = "arriba" | "derecha" | "abajo" | "izquierda";

// Un nudo con agujas: dónde cruza —en fracción del recorrido de su cinta— y
// cómo de abierto es el aspa.
type Nudo = {
  en: number;
  // Grados respecto a la dirección de la línea en ese punto. Dos púas, una por
  // ángulo. Rasante la primera y cruzada la segunda es lo que dibuja el pico.
  angulos?: [number, number];
  largo?: number;
};

export type Marco = {
  // El atributo data-marco del bloque al que sigue.
  bloque: string;
  lados: Lado[];
  // Los lados se encadenan siempre en el sentido de las agujas del reloj, que
  // es el único en el que el final de uno es el principio del siguiente. Para
  // recorrerlos al revés se describen igual y se le da la vuelta al resultado.
  invertir?: boolean;
  // Si se encadena con el bloque anterior en vez de empezar una cinta nueva, y
  // cómo: la curva es un enlace corto entre bordes vecinos, y el serpenteo es
  // el bajante que en la referencia recorre el hueco entre dos bloques con tres
  // quiebros.
  unir?: "curva" | "serpiente";
  // Cuánto asoma cada cabo, en múltiplos de ASOMO. Cero deja el corte a hueso
  // en la esquina, útil cuando el cabo apunta hacia el contenido.
  asomo?: [number, number];
  nudos?: Nudo[];
};

// Una pieza suelta flotando en el blanco: un aspa de dos púas cruzadas, anclada
// a un bloque para que siga a su caja al redimensionar, pero fuera de ella.
export type Suelto = {
  bloque: string;
  // En fracción de la CAJA del bloque; fuera de 0..1 para salirse de él.
  x: number;
  y: number;
  // Grados desde la horizontal, y largo en fracción del ancho del contenedor.
  giro: number;
  largo: number;
  // La púa que cruza, si la lleva: ángulo respecto a la primera y qué parte
  // mide de ella.
  cruz?: [number, number];
};

// Las esquinas de la caja ya con su margen.
function esquinas(c: Caja): Record<Lado, [XY, XY]> {
  const x0 = c.x - MARGEN;
  const y0 = c.y - MARGEN;
  const x1 = c.x + c.ancho + MARGEN;
  const y1 = c.y + c.alto + MARGEN;
  return {
    arriba: [
      [x0, y0],
      [x1, y0],
    ],
    derecha: [
      [x1, y0],
      [x1, y1],
    ],
    abajo: [
      [x1, y1],
      [x0, y1],
    ],
    izquierda: [
      [x0, y1],
      [x0, y0],
    ],
  };
}

// La dirección de un punto al siguiente, normalizada.
function rumbo(a: XY, b: XY): XY {
  const d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  return [(b[0] - a[0]) / d, (b[1] - a[1]) / d];
}

// De la lista de lados a una poligonal con las esquinas redondeadas y los cabos
// pasados de largo.
function recorrido(c: Caja, lados: Lado[], asomo: [number, number], invertir: boolean): XY[] {
  const e = esquinas(c);
  const vertices: XY[] = [];
  for (const lado of lados) {
    const [a, b] = e[lado];
    if (!vertices.length) vertices.push(a);
    vertices.push(b);
  }
  // Antes del asomo, para que sea el cabo de verdad el que se pasa de largo.
  if (invertir) vertices.reverse();

  // El asomo: el primer y el último vértice se echan hacia fuera siguiendo la
  // recta que ya llevaban. Es lo que convierte el borde en trazo, porque el
  // cabo deja de coincidir con la esquina del bloque.
  if (vertices.length > 1) {
    const dEntrada = rumbo(vertices[1], vertices[0]);
    vertices[0] = [
      vertices[0][0] + dEntrada[0] * ASOMO * asomo[0],
      vertices[0][1] + dEntrada[1] * ASOMO * asomo[0],
    ];
    const u = vertices.length - 1;
    const dSalida = rumbo(vertices[u - 1], vertices[u]);
    vertices[u] = [
      vertices[u][0] + dSalida[0] * ASOMO * asomo[1],
      vertices[u][1] + dSalida[1] * ASOMO * asomo[1],
    ];
  }

  // Muestreo: recto entre esquinas y un cuarto de vuelta en cada una.
  const puntos: XY[] = [];
  for (let i = 0; i < vertices.length - 1; i++) {
    const p = vertices[i];
    const q = vertices[i + 1];
    const largo = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
    const ux = (q[0] - p[0]) / largo;
    const uy = (q[1] - p[1]) / largo;
    const recorteA = i === 0 ? 0 : Math.min(CURVA, largo / 2);
    const recorteB = i === vertices.length - 2 ? 0 : Math.min(CURVA, largo / 2);
    const desde: XY = [p[0] + ux * recorteA, p[1] + uy * recorteA];
    const hasta: XY = [q[0] - ux * recorteB, q[1] - uy * recorteB];
    for (let n = 0; n <= POR_LADO; n++) {
      const t = n / POR_LADO;
      puntos.push([desde[0] + (hasta[0] - desde[0]) * t, desde[1] + (hasta[1] - desde[1]) * t]);
    }
    if (i < vertices.length - 2) {
      const r = vertices[i + 2];
      const largo2 = Math.hypot(r[0] - q[0], r[1] - q[1]) || 1;
      const vx = (r[0] - q[0]) / largo2;
      const vy = (r[1] - q[1]) / largo2;
      const salida: XY = [
        q[0] + vx * Math.min(CURVA, largo2 / 2),
        q[1] + vy * Math.min(CURVA, largo2 / 2),
      ];
      for (let n = 1; n < POR_CURVA; n++) {
        const t = n / POR_CURVA;
        const u = 1 - t;
        // Cuadrática con la esquina de control: pasa cerca de ella sin tocarla,
        // que es exactamente un canto redondeado.
        puntos.push([
          u * u * hasta[0] + 2 * u * t * q[0] + t * t * salida[0],
          u * u * hasta[1] + 2 * u * t * q[1] + t * t * salida[1],
        ]);
      }
    }
  }
  return puntos;
}

// El salto de un bloque al siguiente.
//
// Los tirantes salen en la DIRECCIÓN en la que iba y en la que va a ir cada
// cinta, no hacia el otro bloque: así el puente parece la continuación del
// recorrido y no un cable tendido entre dos piezas.
//
// Con `serpiente`, además, la línea culebrea. La onda va sobre la NORMAL de la
// curva y se apaga en los dos extremos, de manera que entra y sale alineada con
// lo que enlaza y solo se retuerce por el medio — que es donde en la referencia
// hay hueco entre columnas.
function puente(
  desde: XY,
  salida: XY,
  hasta: XY,
  entrada: XY,
  serpiente: boolean
): XY[] {
  const d = Math.hypot(hasta[0] - desde[0], hasta[1] - desde[1]);
  const tirante = Math.max(0.04, d * 0.45);
  const c1: XY = [desde[0] + salida[0] * tirante, desde[1] + salida[1] * tirante];
  const c2: XY = [hasta[0] - entrada[0] * tirante, hasta[1] - entrada[1] * tirante];
  const en = (t: number): XY => {
    const u = 1 - t;
    return [
      u * u * u * desde[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * hasta[0],
      u * u * u * desde[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * hasta[1],
    ];
  };
  const amplitud = serpiente ? Math.max(0.016, d * 0.2) : 0;
  const puntos: XY[] = [];
  for (let n = 1; n < POR_PUENTE; n++) {
    const t = n / POR_PUENTE;
    const p = en(t);
    if (!amplitud) {
      puntos.push(p);
      continue;
    }
    const q = en(Math.min(1, t + 0.01));
    const [tx, ty] = rumbo(p, q);
    // Tres quiebros, apagados en los extremos por el seno de la envolvente.
    const onda = Math.sin(t * Math.PI * 3) * Math.sin(t * Math.PI) * amplitud;
    puntos.push([p[0] - ty * onda, p[1] + tx * onda]);
  }
  return puntos;
}

// Largos acumulados de una poligonal, para poder buscar por fracción de camino.
function acumular(c: XY[]): number[] {
  const s = [0];
  for (let i = 1; i < c.length; i++) s.push(s[i - 1] + Math.hypot(c[i][0] - c[i - 1][0], c[i][1] - c[i - 1][1]));
  return s;
}

// Una púa: un segmento recto centrado en un punto.
//
// El radio DECRECE del centro a las dos puntas, y esto es lo que la hace aguja.
// Con radio constante —que fue la primera versión— el lienzo solo afilaba los
// dos píxeles del extremo y el resto salía a grosor completo: en pantalla eran
// pajaritas gordas y oscuras, no las púas finas de la referencia. La regla del
// motor es la de siempre: una punta solo aparece si encoge el RADIO.
function pua(centro: XY, dir: XY, largo: number, grosor: number): Punto[] {
  const puntos: Punto[] = [];
  for (let n = 0; n <= POR_AGUJA; n++) {
    const t = n / POR_AGUJA;
    const desviacion = Math.abs(2 * t - 1);
    puntos.push({
      x: centro[0] + dir[0] * largo * (t - 0.5),
      y: centro[1] + dir[1] * largo * (t - 0.5),
      // Con un suelo mínimo: un radio de cero deja el punto sin cúpula que
      // sumar y el extremo se corta en seco en vez de terminar.
      r: Math.max(grosor * 0.05, grosor * Math.pow(1 - desviacion, 0.32)),
    });
  }
  return puntos;
}

function girar(d: XY, grados: number): XY {
  const a = (grados * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [d[0] * c - d[1] * s, d[0] * s + d[1] * c];
}

// El vacío por defecto va aquí fuera y no en la firma: un `= []` en el
// parámetro crea un array NUEVO en cada render, y como es dependencia del
// efecto que mide, el efecto volvería a medir, a poner estado y a renderizar
// sin parar.
const SIN_SUELTOS: Suelto[] = [];

export default function MarcoLiquido({
  marcos,
  sueltos = SIN_SUELTOS,
}: {
  marcos: Marco[];
  sueltos?: Suelto[];
}) {
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
    const nombres = [...new Set([...marcos.map((m) => m.bloque), ...sueltos.map((s) => s.bloque)])];
    const medir = () => {
      const base = cont.getBoundingClientRect();
      if (base.width < 1) return;
      setAncho(base.width);
      const salida: Record<string, Caja> = {};
      for (const nombre of nombres) {
        const el = document.querySelector<HTMLElement>(`[data-marco="${nombre}"]`);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        salida[nombre] = {
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
    for (const nombre of nombres) {
      const el = document.querySelector<HTMLElement>(`[data-marco="${nombre}"]`);
      if (el) obs.observe(el);
    }
    return () => obs.disconnect();
  }, [marcos, sueltos]);

  useEffect(() => {
    const espera = window.setTimeout(() => animarAvance(DURACION, setAvance), ESPERA);
    return () => clearTimeout(espera);
  }, []);

  const figura = useMemo<TrazoHecho[]>(() => {
    const listos = marcos.filter((m) => medidas[m.bloque]);
    if (!listos.length) return [];

    // Se encadenan en cintas: cada marco con `unir` se pega al anterior por un
    // puente, y el que no lo lleva empieza una cinta nueva. Los nudos se
    // apuntan con la fracción que les toca DENTRO de la cinta ya montada, que
    // es distinta de la que tenían en su tramo suelto.
    const cintas: XY[][] = [];
    // Los nudos se apuntan por ÍNDICE DE PUNTO y no por fracción: la fracción
    // de un tramo deja de valer en cuanto se le encadena otro detrás, porque la
    // cinta a la que pertenece se alarga. El índice no se mueve.
    const nudos: { cinta: number; indice: number; nudo: Nudo }[] = [];
    for (const m of listos) {
      const tramo = recorrido(medidas[m.bloque], m.lados, m.asomo ?? [1, 1], !!m.invertir);
      const anterior = cintas[cintas.length - 1];
      let arranca = 0;
      if (m.unir && anterior && anterior.length > 1) {
        const fin = anterior[anterior.length - 1];
        const salida = rumbo(anterior[anterior.length - 2], fin);
        const entrada = rumbo(tramo[0], tramo[1]);
        const enlace = puente(fin, salida, tramo[0], entrada, m.unir === "serpiente");
        arranca = anterior.length + enlace.length;
        anterior.push(...enlace, ...tramo);
      } else {
        cintas.push(tramo);
      }
      const cinta = cintas.length - 1;
      for (const nudo of m.nudos ?? []) {
        nudos.push({ cinta, indice: arranca + Math.round(nudo.en * (tramo.length - 1)), nudo });
      }
    }

    // El reparto del tiempo va por LONGITUD y no por número de cintas: si no,
    // el marco corto de las tarjetas tardaría lo mismo en trazarse que la
    // vuelta entera a la portada, y la línea daría tirones al pasar de una a
    // otra.
    const acums = cintas.map(acumular);
    const largos = acums.map((a) => a[a.length - 1]);
    const total = largos.reduce((s, l) => s + l, 0) || 1;
    const arranque = cintas.map((_, i) => largos.slice(0, i).reduce((s, l) => s + l, 0) / total);

    const salida: TrazoHecho[] = cintas.map((c, i) => ({
      // Sin afilar por donde empieza y afilada por donde acaba: la cinta nace
      // pegada al bloque y muere en punta, que es lo que hace en la referencia.
      puntos: c.map(([x, y]) => ({ x, y, r: GROSOR })) as Punto[],
      sinEntrada: true,
      desde: arranque[i],
      hasta: arranque[i] + largos[i] / total,
    }));

    // Las agujas de los nudos, cada una con el turno del punto que cruza: la
    // púa aparece cuando la línea llega a ella, no antes ni al final.
    for (const { cinta, indice, nudo } of nudos) {
      const c = cintas[cinta];
      const i = Math.min(c.length - 1, Math.max(1, indice));
      const p = c[i];
      const t = rumbo(c[i - 1], c[i]);
      const cuando = arranque[cinta] + acums[cinta][i] / total;
      const [a, b] = nudo.angulos ?? [22, -68];
      const largo = nudo.largo ?? AGUJA_LARGO;
      for (const [grados, escala] of [
        [a, 1],
        [b, 0.62],
      ] as [number, number][]) {
        salida.push({
          puntos: pua(p, girar(t, grados), largo * escala, GROSOR * AGUJA_GROSOR),
          desde: cuando,
          hasta: Math.min(1, cuando + 0.05),
        });
      }
    }

    // Y las piezas sueltas, al final del todo y escalonadas: son el remate, y
    // apareciendo antes competirían con la línea que aún se está trazando.
    const conCaja = sueltos.filter((s) => medidas[s.bloque]);
    conCaja.forEach((s, i) => {
      const caja = medidas[s.bloque];
      const centro: XY = [caja.x + caja.ancho * s.x, caja.y + caja.alto * s.y];
      const dir = girar([1, 0], s.giro);
      const cuando = 0.82 + (0.16 * i) / Math.max(1, conCaja.length);
      salida.push({ puntos: pua(centro, dir, s.largo, GROSOR * AGUJA_GROSOR), desde: cuando, hasta: cuando + 0.08 });
      if (s.cruz) {
        salida.push({
          puntos: pua(centro, girar(dir, s.cruz[0]), s.largo * s.cruz[1], GROSOR * AGUJA_GROSOR),
          desde: cuando + 0.02,
          hasta: cuando + 0.1,
        });
      }
    });

    return salida;
  }, [marcos, sueltos, medidas]);

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
