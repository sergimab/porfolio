// LA SILUETA DEL SÍMBOLO, en polígonos exactos.
//
// Port del generador que Sergio afinó aparte (gaga-shape-generator). Sustituye
// al motor anterior, que levantaba un campo de cúpulas a lo largo del trazo y lo
// cortaba por un umbral: aquel medía en píxeles, así que la misma figura salía
// distinta según el tamaño del lienzo, y las puntas cerraban en cápsula porque
// una cúpula no sabe acabar en pico.
//
// Aquí el trazo se convierte en BARRAS RECTAS —polígonos convexos— unidas en
// inglete: el borde exterior de cada esquina sigue recto hasta cortarse con el
// siguiente, así que la esquina sale afilada, y en los ángulos cerrados el
// inglete se alarga en pico. El redondeo líquido de rincones y cruces se hace
// después en la GPU, con un cierre morfológico. Ver LienzoGaga.
//
// Lo que entra son los porcentajes por era, uno por eje, en el orden de ERAS.

// Hasta ocho barras y ocho picos.
export const MAXP = 16;
// Seis vértices por polígono, dos coordenadas: 12 números por pieza.
export const POR_POLIGONO = 12;

export type Forma = {
  poligonos: Float32Array;
  cuantos: number;
  caja: [[number, number], [number, number]];
};

export type Ajuste = {
  // Grosor general del trazo.
  grosor: number;
  // Cuánto se alargan los picos en los ángulos cerrados.
  picos: number;
  // Mezcla entre grosores parejos y grosores dispares de un tramo a otro.
  mezcla: number;
};

// Los de la web, elegidos con el panel de mandos mirando la figura. No son los
// que trae el generador al abrirlo —1 / 1 / 0,6—: un trazo fino y parejo es lo
// que deja ver el dibujo del recorrido, que es lo que cuenta cada símbolo.
export const AJUSTE_BASE: Ajuste = { grosor: 0.4, picos: 1, mezcla: 0 };

const TAU = Math.PI * 2;

// Eje i: arriba y en sentido horario. Coordenadas con y hacia abajo, como SVG.
export const puntoDeEje = (i: number, v: number, n: number): [number, number] => {
  const a = -Math.PI / 2 + (i * TAU) / n;
  return [Math.cos(a) * v, Math.sin(a) * v];
};

// El recorrido: centro → el más votado → … → el menos votado → centro.
export function recorrido(vals: ArrayLike<number>) {
  const orden = Array.from(vals)
    .map((v, i) => ({ v, i }))
    .filter((o) => o.v > 1e-3)
    .sort((a, b) => b.v - a.v || a.i - b.i);
  const n = vals.length;
  const puntos: [number, number][] = [
    [0, 0],
    ...orden.map((o) => puntoDeEje(o.i, o.v, n)),
    [0, 0],
  ];
  return { orden, puntos };
}

// LO GRANDE QUE ES LA FIGURA, medida sobre el CAMINO y no sobre la silueta.
//
// Tiene que ser sobre el camino porque la silueta incluye el grosor del trazo, y
// el grosor es justo lo que se quiere decidir a partir de esto: midiendo la
// silueta, engordar el trazo haría la figura «más grande» y eso pediría
// engordarlo más. Un lazo que se muerde la cola.
//
// Se devuelve el lado mayor de la caja del camino, que es lo que el encuadre usa
// para llenar la pantalla: dos figuras con esta misma medida se ven del mismo
// tamaño aunque una tenga más brazos que la otra.
export function extensionDeRecorrido(vals: ArrayLike<number>) {
  const { orden, puntos } = recorrido(vals);
  if (!orden.length) return 0;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of puntos) {
    x0 = Math.min(x0, x); x1 = Math.max(x1, x);
    y0 = Math.min(y0, y); y1 = Math.max(y1, y);
  }
  return Math.max(x1 - x0, y1 - y0);
}

const resta = (a: number[], b: number[]): [number, number] => [a[0] - b[0], a[1] - b[1]];
const unidad = (a: number[]): [number, number] => {
  const l = Math.hypot(a[0], a[1]) || 1;
  return [a[0] / l, a[1] / l];
};
const cruz = (a: number[], b: number[]) => a[0] * b[1] - a[1] * b[0];
const azar = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// Recorta un polígono convexo al semiplano dot(p − P, n) ≤ 0 (Sutherland–Hodgman).
function recortar(poly: [number, number][], P: number[], n: number[]) {
  const f = (p: number[]) => (p[0] - P[0]) * n[0] + (p[1] - P[1]) * n[1];
  const out: [number, number][] = [];
  poly.forEach((a, i) => {
    const b = poly[(i + 1) % poly.length];
    const fa = f(a), fb = f(b);
    if (fa <= 0) out.push(a);
    if ((fa < 0 && fb > 0) || (fa > 0 && fb < 0)) {
      const t = fa / (fa - fb);
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
  });
  return out;
}

// Envolvente convexa, cadena monótona.
function envolvente(pts: [number, number][]) {
  const P = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const c = (o: number[], a: number[], b: number[]) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo: [number, number][] = [], up: [number, number][] = [];
  for (const p of P) {
    while (lo.length > 1 && c(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop();
    lo.push(p);
  }
  for (const p of P.reverse()) {
    while (up.length > 1 && c(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop();
    up.push(p);
  }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}


// El buffer del dibujo y un segundo para medir. Se reservan una vez: esto lo
// llama el bucle de animación sesenta veces por segundo, y reservar ahí dentro
// sería fabricar basura para el recolector.
const buffer = new Float32Array(MAXP * POR_POLIGONO);
const medidor = new Float32Array(MAXP * POR_POLIGONO);

// EL MONTAJE, sobre un recorrido cualquiera. Vale para el camino entero —que se
// cierra sobre el centro— y para un trozo suyo, que queda abierto por la punta.
// La única diferencia está en los dos extremos de un camino abierto: ahí no hay
// esquina que ingletear, así que se cortan en recto, perpendiculares al tramo.
function montar(
  V: [number, number][],
  R: number[],
  cerrada: boolean,
  P: Ajuste,
  destino: Float32Array
) {
  const tramos = V.length - 1;
  if (tramos < 1) return null;
  const min: [number, number] = [1e9, 1e9], max: [number, number] = [-1e9, -1e9];
  const crecer = (p: number[]) => {
    for (let q = 0; q < 2; q++) {
      min[q] = Math.min(min[q], p[q]);
      max[q] = Math.max(max[q], p[q]);
    }
  };

  const encuentro = (p: number[], d: number[], q: number[], e: number[]): [number, number] => {
    const t = cruz(resta(q, p), e) / cruz(d, e);
    return [p[0] + d[0] * t, p[1] + d[1] * t];
  };
  const acortar = (v: number[], p: [number, number], lim: number): [number, number] => {
    const w = resta(p, v), l = Math.hypot(w[0], w[1]);
    return l > lim ? [v[0] + (w[0] / l) * lim, v[1] + (w[1] / l) * lim] : p;
  };

  // Por vértice: punto y normal del corte, orientada según el tramo entrante.
  // Todas las piezas son polígonos convexos exactos, así que su campo de
  // distancias también es exacto por fuera.
  const corte: [number[], number[], number[], number[]][] = [];
  let np = 0;
  const anadir = (pts: [number, number][]) => {
    if (np >= MAXP || pts.length < 3) return;
    const q = pts.slice(0, 6);
    while (q.length < 6) q.push(q[q.length - 1]);
    destino.set(q.flat(), np++ * POR_POLIGONO);
    pts.forEach(crecer);
  };

  // En el camino cerrado hay un corte por tramo y el último enlaza con el
  // primero; en el abierto hay uno por vértice, dos de ellos en los cabos.
  const cuantos = cerrada ? tramos : V.length;
  for (let k = 0; k < cuantos; k++) {
    const v = V[k];
    let d1: [number, number], d2: [number, number], r1: number, r2: number;
    if (!cerrada && k === 0) {
      d2 = unidad(resta(V[1], v)); d1 = d2; r1 = R[0]; r2 = R[0];
    } else if (!cerrada && k === V.length - 1) {
      d1 = unidad(resta(v, V[k - 1])); d2 = d1; r1 = R[tramos - 1]; r2 = R[tramos - 1];
    } else {
      const iAntes = cerrada ? (k - 1 + tramos) % tramos : k - 1;
      const prev = V[cerrada ? (k - 1 + tramos) % tramos : k - 1];
      const next = V[k + 1];
      d1 = unidad(resta(v, prev)); d2 = unidad(resta(next, v));
      r1 = R[iAntes]; r2 = R[k];
    }
    const cr = cruz(d1, d2), dt = d1[0] * d2[0] + d1[1] * d2[1];
    // La longitud máxima del pico.
    const lim = Math.max(r1, r2) * (2 + 7 * P.picos);
    if (Math.abs(cr) < 1e-4 && dt > 0) {
      corte.push([v, d1, v, d2]);
      continue; // tramo recto, o un cabo del camino abierto
    }
    // El exterior es el lado contrario al giro.
    const lado = cr >= 0 ? 1 : -1;
    const o1 = [lado * d1[1], -lado * d1[0]], o2 = [lado * d2[1], -lado * d2[0]];
    const p1: [number, number] = [v[0] + o1[0] * r1, v[1] + o1[1] * r1];
    const p2: [number, number] = [v[0] + o2[0] * r2, v[1] + o2[1] * r2];
    let punta: [number, number];
    const plano: [number[], number[], number[], number[]] = [v, d1, v, d2];
    if (Math.abs(cr) < 1e-4) {
      punta = [v[0] + d1[0] * lim, v[1] + d1[1] * lim];
      corte.push(plano);
    } else {
      const M = encuentro(p1, d1, p2, d2);
      const I = encuentro(
        [2 * v[0] - p1[0], 2 * v[1] - p1[1]], d1,
        [2 * v[0] - p2[0], 2 * v[1] - p2[1]], d2
      );
      const prev = V[cerrada ? (k - 1 + tramos) % tramos : k - 1];
      const tramoMin = Math.min(
        Math.hypot(...resta(v, prev)),
        Math.hypot(...resta(V[k + 1], v))
      );
      punta = acortar(v, M, lim);
      if (Math.hypot(...resta(M, v)) <= lim && Math.hypot(...resta(I, v)) < tramoMin) {
        // Unión exacta: las dos barras cortadas por la recta I–M, así encajan
        // sin escalón aunque tengan grosores distintos.
        const c = resta(M, I);
        let nc = unidad([c[1], -c[0]]);
        if (nc[0] * d1[0] + nc[1] * d1[1] < 0) nc = [-nc[0], -nc[1]];
        corte.push([I, nc, I, nc]);
        continue;
      }
      corte.push(plano);
    }
    // El pico, limitado: la envolvente de los extremos de las dos barras y la
    // punta. Así el tramo grueso se afila hacia el pico sin escalones aunque el
    // otro sea fino.
    const i1: [number, number] = [v[0] - o1[0] * r1, v[1] - o1[1] * r1];
    const i2: [number, number] = [v[0] - o2[0] * r2, v[1] - o2[1] * r2];
    anadir(envolvente([p1, i1, p2, i2, punta]));
  }
  // En el cerrado, el corte que remata el último tramo es el del primero.
  if (cerrada) corte.push(corte[0]);

  // Las barras: una franja alargada por los dos lados y recortada por las
  // líneas de unión de sus extremos. En las uniones exactas la recta I–M ya
  // incluye la prolongación hasta la esquina exterior.
  for (let k = 0; k < tramos; k++) {
    const a = V[k], b = V[k + 1];
    if (Math.hypot(...resta(b, a)) < 1e-4) continue;
    const d = unidad(resta(b, a));
    const nr = [-d[1] * R[k], d[0] * R[k]];
    const E = 4;
    const a0 = [a[0] - d[0] * E, a[1] - d[1] * E];
    const b0 = [b[0] + d[0] * E, b[1] + d[1] * E];
    let poly: [number, number][] = [
      [a0[0] + nr[0], a0[1] + nr[1]],
      [b0[0] + nr[0], b0[1] + nr[1]],
      [b0[0] - nr[0], b0[1] - nr[1]],
      [a0[0] - nr[0], a0[1] - nr[1]],
    ];
    const [, , sp, sn] = corte[k];
    const [ep, en] = corte[k + 1];
    poly = recortar(poly, sp, [-sn[0], -sn[1]]);
    poly = recortar(poly, ep, en);
    anadir(poly);
  }

  if (np === 0) return null;
  return { np, min, max };
}

// EL RECORTE, que es el trim path. Devuelve el principio del recorrido, medido
// en longitud y no en número de vértices: así la punta avanza a velocidad
// constante y no da un acelerón al pasar por un brazo corto.
//
// El grosor de cada tramo NO se recalcula —se lleva el del tramo entero—, y eso
// importa: los grosores se sortean con la pareja de discos que une cada tramo,
// así que recalcularlos sobre un camino más corto cambiaría el reparto en cada
// cuadro y la figura temblaría mientras se dibuja.
function truncar(V: [number, number][], R: number[], t: number) {
  const largos = V.slice(0, -1).map((a, k) => Math.hypot(...resta(V[k + 1], a)));
  const total = largos.reduce((a, b) => a + b, 0);
  const objetivo = total * t;
  const Vout: [number, number][] = [V[0]];
  const Rout: number[] = [];
  let acc = 0;
  for (let k = 0; k < largos.length; k++) {
    const L = largos[k];
    if (acc + L <= objetivo) {
      Vout.push(V[k + 1]);
      Rout.push(R[k]);
      acc += L;
      continue;
    }
    const resto = objetivo - acc;
    if (resto > 1e-5 && L > 1e-9) {
      const u = resto / L;
      Vout.push([V[k][0] + (V[k + 1][0] - V[k][0]) * u, V[k][1] + (V[k + 1][1] - V[k][1]) * u]);
      Rout.push(R[k]);
    }
    break;
  }
  return { V: Vout, R: Rout };
}

export function construirForma(
  vals: ArrayLike<number>,
  P: Ajuste,
  // Cuánto del recorrido se ha dibujado, de 0 a 1. Con 1 —lo normal— sale la
  // figura entera y esto no cuesta nada.
  recorte = 1
): Forma | null {
  const { orden, puntos } = recorrido(vals);
  if (!orden.length) return null;

  // y hacia arriba, que es lo que espera el shader.
  const V = puntos.map(([x, y]) => [x, -y] as [number, number]);
  const ids = [-1, ...orden.map((o) => o.i), -1];
  const tramos = V.length - 1;
  const T = P.grosor;

  // El grosor de cada tramo: una mezcla de finos y gruesos, sorteada con un
  // ruido estable —la misma selección da siempre la misma figura—.
  const R: number[] = [];
  for (let k = 0; k < tramos; k++) {
    const semilla = ids[k] * 7 + ids[k + 1] * 13 + k;
    const h1 = azar(semilla), h2 = azar(semilla + 51);
    const parejo = 0.038 + 0.01 * h2;
    const dispar = h1 < 0.45 ? 0.013 + 0.006 * h2 : 0.05 + 0.012 * h2;
    R.push(T * (parejo + (dispar - parejo) * P.mezcla));
  }

  if (recorte >= 1) {
    const hecho = montar(V, R, true, P, buffer);
    return hecho && { poligonos: buffer, cuantos: hecho.np, caja: [hecho.min, hecho.max] };
  }

  // LA CAJA ES SIEMPRE LA DE LA FIGURA ENTERA, y por eso se monta dos veces
  // mientras dura el recorte. El encuadre persigue a la caja, así que midiendo
  // el trozo dibujado la cámara iría cerrándose y abriéndose detrás de la punta
  // en vez de estarse quieta mientras el símbolo se traza.
  const entera = montar(V, R, true, P, medidor);
  if (!entera) return null;
  const trozo = truncar(V, R, recorte);
  if (trozo.V.length < 2) return null;
  const hecho = montar(trozo.V, trozo.R, false, P, buffer);
  if (!hecho) return null;
  return { poligonos: buffer, cuantos: hecho.np, caja: [entera.min, entera.max] };
}
