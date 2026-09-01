import type { Punto, TrazoHecho } from "@/components/proyectos/elysium/LienzoMetal";

// El generador de símbolos de Elysium.
//
// ── Qué forma se busca ────────────────────────────────────────────────────
//
// La referencia son los símbolos hechos en Blender con geometry nodes, y lo
// importante de ellos no es el acabado sino la TOPOLOGÍA: no son un trazo, son
// una RETÍCULA. Dos a cuatro celdas cerradas, montantes de grosor parejo que se
// encuentran de tres en tres, y una o dos agujas muy largas saliendo de un
// nudo.
//
// Esto sustituye a un generador que dibujaba UN camino: del centro a un disco,
// vuelta al centro, siete veces. De aquella topología salían inevitablemente
// tres cosas —triángulos largos, un centro con ocho tramos encima, y tramos que
// iban y volvían soldándose entre sí— y se fueron acumulando parches para
// pelearse con cada una: adelgazar los amontonamientos, afilar los vértices,
// dar cintura a los tramos planos. Cuatro correcciones contra tres efectos que
// nacían de la forma del recorrido, no de cómo se dibujaba. Ninguna constante
// arreglaba eso.
//
// La retícula, además, le va A FAVOR al lienzo. Montantes parejos que se funden
// en las uniones es exactamente lo que el campo hace solo, y de paso desaparece
// lo que más nos ha costado: con todos los montantes iguales no hay hilos, y
// sin hilos no hay nada viviendo a un pelo del umbral que se parta a la mínima.
//
// ── Cómo lo deciden los votos ─────────────────────────────────────────────
//
// Los siete discos son los NUDOS: el ángulo lo pone la discografía —fijo para
// todo el mundo— y la distancia al centro, lo votado que esté el disco. El
// anillo que los une da el contorno, y unas cuerdas lo subdividen en celdas.
//
// Así que los votos deciden la FORMA y no el grosor: dónde cae cada nudo, cómo
// de estirado sale el contorno, qué celdas aparecen y de dónde brotan las
// agujas.

// Las siete puntas, en el orden en que salieron los discos. Es el que fija
// dónde cae cada nudo alrededor del círculo.
export const ERAS = [
  "The Fame",
  "The Fame Monster",
  "Born This Way",
  "ARTPOP",
  "Joanne",
  "Chromatica",
  "Mayhem",
] as const;

export type Era = (typeof ERAS)[number];

// Radio del círculo sobre el que se colocan los nudos.
const EXTENSION = 0.4;
// Distancia mínima al centro, en fracción de la máxima. Alta a propósito: si un
// nudo se acerca demasiado al centro, las dos aristas del anillo que llegan a
// él se juntan y la celda de al lado se cierra en una rendija. Con 0,42 el
// contorno sigue siendo muy irregular —de 0,42 a 1 hay más del doble— pero
// ninguna celda degenera.
const RADIO_MINIMO = 0.42;
// Lo que mide la figura de lado a lado una vez encajada, en fracción del
// lienzo.
const ENCAJE = 0.66;

// Grosor de los montantes. Es el radio, no el ancho, y va en fracción del
// lienzo para que la figura se vea igual de proporcionada en el marco grande de
// escritorio que en el de móvil.
//
// Es el mismo para todos. Con la atracción activada este número es además el
// ALCANCE: hasta dónde llega la influencia del montante y, con ella, a qué
// distancia se funde con lo que tenga al lado. Como aquí las aristas se tocan
// de verdad en los nudos, no hace falta alcance de sobra para soldar nada, y
// puede quedarse bajo: menos alcance es menos masa en las uniones.
export const GROSOR = 0.012;
// El mismo número, exportado: el lienzo lo necesita como referencia común de
// todos los trazos de la figura. Ver la prop `referencia`.
export const GROSOR_REFERENCIA = GROSOR;

// Puntos por arista. El lienzo remuestrea por su cuenta, pero necesita bastantes
// puntos crudos para que su suavizado no redondee los extremos.
//
// Se exporta para la vista de esqueleto.
export const POR_TRAMO = 14;

// Cuántas celdas puede tener el símbolo como mucho, aparte del contorno. La
// referencia no pasa de cuatro celdas en total.
const CELDAS_MAX = 3;

// Largo de la aguja principal, en fracción del radio del círculo de nudos. Es
// larga de verdad: en la referencia la aguja sale bastante más allá del cuerpo
// y es lo que le da carácter a la silueta.
const AGUJA = 1.15;
// La segunda aguja, más corta, y a partir de qué proporción de votos aparece.
const AGUJA_2 = 0.55;
const AGUJA_2_DESDE = 0.5;
// Lo que adelgaza una aguja de la base a la punta.
const AGUJA_PUNTA = 0.22;

// ── El reparto ────────────────────────────────────────────────────────────
//
// De votos a dónde cae cada cosa. Está separado del tejido porque hay dos
// consumidores: la figura, que lo convierte en trazos, y la vista de taller,
// que dibuja el andamio del que sale. Calculándolo dos veces se irían separando
// en cuanto uno de los dos cambiara.
function disponer(pesos: Record<Era, number>) {
  const maximo = Math.max(...ERAS.map((e) => pesos[e] || 0));
  // Nadie ha elegido nada: no hay figura que dibujar.
  if (maximo <= 0) return null;

  const cx = 0.5;
  // El lienzo mide la y en fracción del ANCHO, no del alto. Que el centro
  // vertical sea también 0,5 es porque el marco del símbolo es CUADRADO: la
  // figura es radial y en un marco apaisado saldría estirada.
  const cy = 0.5;

  const proporcionDe = (era: Era) => (pesos[era] || 0) / maximo;

  const nudo = (era: Era): [number, number] => {
    const i = ERAS.indexOf(era);
    // Se empieza arriba y se gira a favor del reloj.
    const angulo = (-90 + (i * 360) / ERAS.length) * (Math.PI / 180);
    // El mínimo se suma por debajo en vez de sustituir: así un disco con una
    // canción sigue quedando por delante de uno con ninguna.
    const radio =
      EXTENSION * (RADIO_MINIMO + (1 - RADIO_MINIMO) * proporcionDe(era));
    return [cx + radio * Math.cos(angulo), cy + radio * Math.sin(angulo)];
  };

  // El orden por votos. Los empates —y los ceros lo son entre sí— se deshacen
  // por la discografía, que es un criterio fijo: sin él, dos personas con las
  // mismas respuestas podrían obtener figuras distintas según cómo hubiera
  // ordenado el navegador.
  const ranking = [...ERAS].sort(
    (a, b) => (pesos[b] || 0) - (pesos[a] || 0) || ERAS.indexOf(a) - ERAS.indexOf(b)
  );

  // El contorno: el anillo que une cada disco con el siguiente de la
  // discografía. Es lo que cierra la figura por fuera.
  const aristas: [Era, Era][] = ERAS.map((era, i) => [
    era,
    ERAS[(i + 1) % ERAS.length],
  ]);

  // Y las cuerdas que lo subdividen. Cada una salta un nudo y recorta una celda
  // triangular a su costa.
  //
  // Van a los discos MÁS votados, que son los que están más lejos del centro:
  // ahí el triángulo que se recorta tiene sitio y se lee como una celda. En los
  // nudos de dentro saldría una astilla.
  //
  // Y no se recortan dos nudos seguidos: comparten una arista del anillo, y las
  // dos celdas saldrían pegadas formando una masa en vez de dos huecos.
  const recortados: Era[] = [];
  for (const era of ranking) {
    if (recortados.length >= CELDAS_MAX) break;
    // Cuántas celdas: una por cada disco que pase de la mitad del más votado.
    // Quien reparte sus canciones entre muchos discos obtiene una retícula
    // densa, y quien se centra en uno o dos, una figura de pocas celdas y
    // contorno muy estirado.
    if (proporcionDe(era) < 0.5) break;
    const i = ERAS.indexOf(era);
    const vecino = (j: number) => ERAS[(j + ERAS.length) % ERAS.length];
    if (recortados.includes(vecino(i - 1)) || recortados.includes(vecino(i + 1))) continue;
    recortados.push(era);
    aristas.push([vecino(i - 1), vecino(i + 1)]);
  }

  // Las agujas: de qué nudo salen y cuánto miden. Salen hacia fuera en
  // dirección radial, que es la única en la que no se cruzan con el cuerpo.
  const agujas: { era: Era; largo: number }[] = [
    { era: ranking[0], largo: AGUJA },
  ];
  if (proporcionDe(ranking[1]) >= AGUJA_2_DESDE) {
    agujas.push({ era: ranking[1], largo: AGUJA_2 });
  }
  const puntaDe = (era: Era, largo: number): [number, number] => {
    const [x, y] = nudo(era);
    const d = Math.hypot(x - cx, y - cy) || 1;
    return [x + ((x - cx) / d) * EXTENSION * largo, y + ((y - cy) / d) * EXTENSION * largo];
  };

  // Encaje: se lleva la figura al centro del lienzo y se escala para que ocupe
  // siempre lo mismo.
  //
  // Sin esto, el tamaño y la posición dependían de qué discos se hubieran
  // votado: una figura tirando a un lado se iba a esa esquina, y una de radios
  // parecidos ocupaba el doble que otra de radios pequeños. Midiendo su caja,
  // todas llegan igual de grandes y centradas, y lo que las distingue pasa a
  // ser su FORMA.
  //
  // Se mide sobre TODO, agujas incluidas: son lo que más sobresale con
  // diferencia, y sin contarlas se saldrían del marco.
  const todos: [number, number][] = [
    ...ERAS.map(nudo),
    ...agujas.map((a) => puntaDe(a.era, a.largo)),
  ];
  const xs = todos.map((v) => v[0]);
  const ys = todos.map((v) => v[1]);
  const mayor = Math.max(
    Math.max(...xs) - Math.min(...xs),
    Math.max(...ys) - Math.min(...ys)
  );
  const k = mayor > 1e-4 ? ENCAJE / mayor : 1;
  const mx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const my = (Math.min(...ys) + Math.max(...ys)) / 2;
  const encajar = ([x, y]: [number, number]): [number, number] => [
    cx + (x - mx) * k,
    cy + (y - my) * k,
  ];

  return {
    centro: [cx, cy] as [number, number],
    ranking,
    proporcionDe,
    nudo,
    aristas,
    recortados,
    agujas,
    puntaDe,
    encajar,
  };
}

// ── De reparto a trazos ───────────────────────────────────────────────────

// Una arista, de nudo a nudo.
//
// Ni afilada por donde empieza ni por donde acaba. El afilado de extremos del
// lienzo está pensado para un trazo que nace en el aire; estos nacen y mueren
// EN un nudo, pegados a otras dos aristas, y afilarlos abriría un hueco justo
// en la unión. Sin afilar, las tres se suman y el campo redondea el encuentro
// solo: eso es la unión de la referencia, y sale gratis.
function tramo(
  a: [number, number],
  b: [number, number],
  radio: (t: number) => number,
  desde: number,
  hasta: number
): TrazoHecho {
  const puntos: Punto[] = [];
  for (let n = 0; n <= POR_TRAMO; n++) {
    const t = n / POR_TRAMO;
    puntos.push({
      x: a[0] + (b[0] - a[0]) * t,
      y: a[1] + (b[1] - a[1]) * t,
      r: radio(t),
    });
  }
  return { puntos, sinEntrada: true, sinSalida: true, desde, hasta };
}

export function figuraDeEras(pesos: Record<Era, number>): TrazoHecho[] {
  const d = disponer(pesos);
  if (!d) return [];

  // Cada trazo se dibuja en su propio turno, uno detrás de otro. Es lo que hace
  // que la animación se lea como una plumilla recorriendo el alambre en vez de
  // como una figura que aparece a trozos por todas partes a la vez.
  const total = d.aristas.length + d.agujas.length;
  const turno = (i: number): [number, number] => [i / total, (i + 1) / total];

  const trazos: TrazoHecho[] = d.aristas.map(([a, b], i) => {
    const [desde, hasta] = turno(i);
    return tramo(d.encajar(d.nudo(a)), d.encajar(d.nudo(b)), () => GROSOR, desde, hasta);
  });

  // Y las agujas. Estas SÍ se afilan por la punta —es lo único que las hace
  // agujas—, pero no por la base: brotan del nudo, y afilar ahí las convertiría
  // en dardos posados encima en vez de en algo que sale de la pieza.
  //
  // El afilado del lienzo encoge el radio de las cúpulas a lo largo del
  // extremo, que es lo único que produce un pico: bajando solo la altura, la
  // superficie termina siempre en casquete. Aquí se le ayuda además
  // adelgazando el trazo hacia la punta.
  d.agujas.forEach((aguja, i) => {
    const [desde, hasta] = turno(d.aristas.length + i);
    const t0 = d.encajar(d.nudo(aguja.era));
    const t1 = d.encajar(d.puntaDe(aguja.era, aguja.largo));
    trazos.push({
      ...tramo(t0, t1, (t) => GROSOR * (1 - (1 - AGUJA_PUNTA) * t), desde, hasta),
      sinSalida: false,
    });
  });

  return trazos;
}

// ── El andamio, para la vista de taller ───────────────────────────────────
//
// Existe porque la retícula es difícil de reconstruir mirando el metal: al
// fundirse, dos montantes que se encuentran parecen uno solo y una celda
// pequeña parece un agujero del material. Con los nudos numerados delante se ve
// qué disco es cada cosa y de dónde sale cada celda.
export type Grafico = {
  centro: [number, number];
  ejes: { era: Era; punta: [number, number] }[];
  marcas: { era: Era; en: [number, number]; orden: number; peso: number; celda: boolean }[];
  aristas: { a: [number, number]; b: [number, number]; contorno: boolean }[];
};

export function graficoDeEras(pesos: Record<Era, number>): Grafico | null {
  const d = disponer(pesos);
  if (!d) return null;
  const [cx, cy] = d.centro;
  return {
    centro: d.encajar(d.centro),
    // El eje entero, no hasta donde llega el nudo: es la referencia contra la
    // que se lee lo votado que está cada disco.
    ejes: ERAS.map((era) => {
      const i = ERAS.indexOf(era);
      const angulo = (-90 + (i * 360) / ERAS.length) * (Math.PI / 180);
      return {
        era,
        punta: d.encajar([cx + EXTENSION * Math.cos(angulo), cy + EXTENSION * Math.sin(angulo)]),
      };
    }),
    marcas: ERAS.map((era) => ({
      era,
      en: d.encajar(d.nudo(era)),
      // 1 es el más votado.
      orden: d.ranking.indexOf(era) + 1,
      peso: pesos[era] || 0,
      // Si este disco recorta su propia celda.
      celda: d.recortados.includes(era),
    })),
    aristas: d.aristas.map(([a, b], i) => ({
      a: d.encajar(d.nudo(a)),
      b: d.encajar(d.nudo(b)),
      // Las primeras son el anillo; las que vienen después, las cuerdas.
      contorno: i < ERAS.length,
    })),
  };
}
