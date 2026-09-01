import type { Punto, TrazoHecho } from "@/components/proyectos/elysium/LienzoMetal";

// El generador de símbolos de Elysium.
//
// ── La regla ──────────────────────────────────────────────────────────────
//
// UN camino cerrado. Sale del centro, visita los siete discos de más votado a
// menos, y vuelve al centro. Nada más.
//
// Las puntas están repartidas en orden de DISCOGRAFÍA y el camino va en orden
// de VOTOS, y de que esos dos órdenes no coincidan sale todo lo demás: la línea
// se cruza consigo misma, y cada cruce encierra un hueco. Las celdas de la
// referencia no son un alambre construido a mano — son los huecos que deja la
// línea al cruzarse. Por eso el símbolo puede ser un solo trazo y parecer una
// retícula.
//
// ── Lo que hay que respetar para que funcione ─────────────────────────────
//
// Esta lógica ya se intentó antes y salía mal, y no era por la regla sino por
// tres decisiones montadas encima de ella. Están las tres corregidas aquí, y
// cada una costó bastante averiguarla:
//
// 1. GROSOR PAREJO. Antes el grosor seguía a los votos, así que el disco menos
//    votado salía como un hilo. Un hilo vive a un 5% del umbral del campo, y
//    cualquier curva lo hunde por debajo: la cinta se partía y lo que quedaba
//    al otro lado se veía como una pieza suelta. Medido, 10 figuras de 123.
//    Con todos los montantes iguales eso no puede pasar, y además es lo que se
//    ve en la referencia.
//
// 2. LOS NUDOS NO SE ACERCAN AL CENTRO. Con el mínimo bajo, tres o cuatro
//    discos poco votados caían casi encima del centro; sus tramos se sumaban
//    justo donde ya se juntan la salida y la vuelta, y aquello era una masa.
//    Ver RADIO_MINIMO.
//
// 3. NI ENTRADA NI SALIDA AFILADAS. El afilado de extremos del lienzo está
//    pensado para un trazo que nace en el aire. Este nace en el centro y vuelve
//    al mismo punto: afilado, se apagaba antes de llegar por los dos lados y
//    parecía no arrancar del centro ni cerrarse en él.

// Las siete puntas, en el orden en que salieron los discos. Es el que fija
// dónde cae cada una alrededor del círculo, y el que hace que el camino se
// cruce.
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

// Radio del círculo sobre el que caen las puntas.
const EXTENSION = 0.4;

// Distancia mínima al centro, en fracción de la máxima.
//
// Es alta, y es de las cosas que más cambian el resultado. Un disco sin votos
// no se salta —las siete direcciones existen siempre—, pero tampoco puede caer
// sobre el centro: ahí es donde ya se juntan el tramo de salida y el de vuelta,
// y un tercer y cuarto tramo encima convierten el arranque en un bulto. Con
// 0,45 el reparto se sigue leyendo —del mínimo al máximo hay más del doble— y
// el centro respira.
const RADIO_MINIMO = 0.45;

// Lo que mide la figura de lado a lado una vez encajada, en fracción del
// lienzo.
const ENCAJE = 0.62;

// Grosor del montante. Es el radio, no el ancho, y es el MISMO para todo el
// camino.
//
// Va en fracción del lienzo y no en píxeles a propósito: así la figura se ve
// igual de proporcionada en el marco grande de escritorio que en el de móvil.
//
// Con la atracción activada este número es además el ALCANCE: hasta dónde llega
// la influencia del trazo y, con ella, a qué distancia se funde con otra parte
// de sí mismo. Ahí está su techo: pasado cierto punto, la línea se suelda con
// todo lo que tiene cerca, los huecos se cierran y la figura se convierte en un
// contorno liso sin nada dentro. Y su suelo: por debajo, dos tramos que se
// cruzan se cortan en vez de fundirse y el cruce se ve como un aspa y no como
// una unión.
export const GROSOR = 0.013;
// El mismo número, exportado: el lienzo lo necesita como referencia común de
// todos los trazos de la figura. Ver la prop `referencia`.
export const GROSOR_REFERENCIA = GROSOR;

// Puntos por tramo. El lienzo remuestrea por su cuenta, pero necesita bastantes
// puntos crudos para que su suavizado no redondee los vértices, que es donde
// nace la forma.
//
// Se exporta para la vista de taller: un punto es un VÉRTICE del camino
// exactamente cuando su índice es múltiplo de esto.
export const POR_TRAMO = 14;

// La aguja: largo en fracción del radio del círculo, y lo que adelgaza de la
// base a la punta.
//
// Sale del disco más votado, hacia fuera y en dirección radial, que es la única
// en la que no se cruza con el cuerpo. Va como trazo aparte porque una punta
// solo aparece si el radio de las cúpulas encoge a lo largo de un extremo, y
// eso el lienzo solo lo hace en los cabos de un trazo: metida dentro del
// camino, la punta quedaría en mitad del recorrido y saldría redonda.
const AGUJA = 1.0;
const AGUJA_PUNTA = 0.2;
// La segunda, más corta, y desde qué proporción de votos aparece.
const AGUJA_2 = 0.5;
const AGUJA_2_DESDE = 0.55;

// ── El reparto ────────────────────────────────────────────────────────────
//
// De votos a dónde cae cada cosa. Separado del tejido porque hay dos
// consumidores: la figura, que lo convierte en trazos, y la vista de taller,
// que dibuja el gráfico del que sale. Calculándolo dos veces se irían separando
// en cuanto uno de los dos cambiara, y el gráfico dejaría de explicar la
// figura.
//
// `pesos` no tiene por qué sumar 100 ni estar acotado: lo único que importa es
// la proporción entre unos y otros, porque la figura se NORMALIZA —el disco más
// votado llega siempre al borde—. Sin normalizar, quien eligiera pocas
// canciones obtendría una figura diminuta, más pequeña que la distancia a la
// que el metal se funde, y saldría un borrón en vez de un símbolo. Lo que dice
// algo de una persona es el reparto entre discos, no cuántas canciones marcó.
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

  const punta = (era: Era): [number, number] => {
    const i = ERAS.indexOf(era);
    // Se empieza arriba y se gira a favor del reloj.
    const angulo = (-90 + (i * 360) / ERAS.length) * (Math.PI / 180);
    // El mínimo se suma por debajo en vez de sustituir: así un disco con una
    // canción sigue quedando por delante de uno con ninguna, que es lo que hace
    // que el reparto se siga leyendo en la forma.
    const radio = EXTENSION * (RADIO_MINIMO + (1 - RADIO_MINIMO) * proporcionDe(era));
    return [cx + radio * Math.cos(angulo), cy + radio * Math.sin(angulo)];
  };

  // El camino: los siete, de más votado a menos. Los empates —y los ceros lo
  // son entre sí— se deshacen por el orden de la discografía, que es un
  // criterio fijo: sin él, dos personas con las mismas respuestas podrían
  // obtener figuras distintas según cómo hubiera ordenado el navegador.
  const recorrido = [...ERAS].sort(
    (a, b) => (pesos[b] || 0) - (pesos[a] || 0) || ERAS.indexOf(a) - ERAS.indexOf(b)
  );

  // Centro, los siete, centro.
  const vertices: [number, number][] = [
    [cx, cy],
    ...recorrido.map(punta),
    [cx, cy],
  ];

  // Las agujas, y de qué disco sale cada una.
  const agujas: { era: Era; largo: number }[] = [{ era: recorrido[0], largo: AGUJA }];
  if (proporcionDe(recorrido[1]) >= AGUJA_2_DESDE) {
    agujas.push({ era: recorrido[1], largo: AGUJA_2 });
  }
  const puntaDeAguja = (era: Era, largo: number): [number, number] => {
    const [x, y] = punta(era);
    const d = Math.hypot(x - cx, y - cy) || 1;
    return [x + ((x - cx) / d) * EXTENSION * largo, y + ((y - cy) / d) * EXTENSION * largo];
  };

  // Encaje: se lleva la figura al centro del lienzo y se escala para que ocupe
  // siempre lo mismo.
  //
  // Sin esto, el tamaño y la posición dependían de qué discos se hubieran
  // votado: una figura tirando a un lado se iba a esa esquina y dejaba media
  // pantalla vacía, y una de radios parecidos ocupaba el doble que otra de
  // radios pequeños. Midiendo su caja, todas llegan igual de grandes y
  // centradas, y lo que las distingue pasa a ser su FORMA, que es lo único que
  // debería distinguirlas.
  //
  // La aguja cuenta a MEDIAS. Contándola entera, se lleva la caja ella sola y
  // el cuerpo se queda pequeño en mitad del marco; sin contarla, se sale por el
  // borde. A medias, el cuerpo manda y la aguja sobresale, que es lo que pasa
  // en la referencia.
  const cuerpo: [number, number][] = [...vertices];
  const conAgujas: [number, number][] = agujas.map((a) => {
    const [px, py] = puntaDeAguja(a.era, a.largo);
    const [bx, by] = punta(a.era);
    return [bx + (px - bx) * 0.5, by + (py - by) * 0.5];
  });
  const todos = [...cuerpo, ...conAgujas];
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
    proporcionDe,
    recorrido,
    punta,
    vertices,
    agujas,
    puntaDeAguja,
    encajar,
  };
}

// ── De reparto a trazos ───────────────────────────────────────────────────

export function figuraDeEras(pesos: Record<Era, number>): TrazoHecho[] {
  const d = disponer(pesos);
  if (!d) return [];

  // De poligonal a trazo, muestreando cada tramo a paso constante.
  const tejer = (vs: [number, number][], radio: (t: number) => number): Punto[] => {
    const puntos: Punto[] = [];
    for (let i = 0; i < vs.length - 1; i++) {
      const [x1, y1] = d.encajar(vs[i]);
      const [x2, y2] = d.encajar(vs[i + 1]);
      for (let n = 0; n < POR_TRAMO; n++) {
        const t = n / POR_TRAMO;
        // El radio se mide sobre el recorrido ENTERO, no sobre el tramo: así la
        // aguja adelgaza de su base a su punta y el camino se queda parejo.
        const s = (i + t) / (vs.length - 1);
        puntos.push({ x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t, r: radio(s) });
      }
    }
    const [fx, fy] = d.encajar(vs[vs.length - 1]);
    puntos.push({ x: fx, y: fy, r: radio(1) });
    return puntos;
  };

  // El camino, de una sola pieza y sin afilar por ninguno de sus dos cabos:
  // salen del mismo punto y ahí se encuentran.
  const trazos: TrazoHecho[] = [
    {
      puntos: tejer(d.vertices, () => GROSOR),
      sinEntrada: true,
      sinSalida: true,
      desde: 0,
      // El camino ocupa la mayor parte de la animación y las agujas rematan
      // después, que es el orden en que se leen.
      hasta: d.agujas.length ? 0.8 : 1,
    },
  ];

  // Las agujas. Sin afilar por la base —brotan del vértice, y afilar ahí las
  // convierte en dardos posados encima en vez de en algo que sale de la pieza—
  // y afiladas por la punta, que es lo único que las hace agujas.
  d.agujas.forEach((aguja, i) => {
    const desde = 0.8 + (0.2 * i) / d.agujas.length;
    trazos.push({
      puntos: tejer(
        [d.punta(aguja.era), d.puntaDeAguja(aguja.era, aguja.largo)],
        (t) => GROSOR * (1 - (1 - AGUJA_PUNTA) * t)
      ),
      sinEntrada: true,
      desde,
      hasta: desde + 0.2 / d.agujas.length,
    });
  });

  return trazos;
}

// ── El andamio, para la vista de taller ───────────────────────────────────
//
// Existe porque el camino es difícil de reconstruir mirando el metal: al
// fundirse, dos tramos que se cruzan parecen uno solo y un tramo que pasa cerca
// de otro parece terminar ahí. Con los ejes y los números delante se ve dónde
// empieza, en qué orden va y que vuelve al mismo sitio del que salió.
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
    // El eje entero, no hasta donde llega la marca: es la referencia contra la
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
      en: d.encajar(d.punta(era)),
      // 1 es el primero que visita la línea, 7 el último.
      orden: d.recorrido.indexOf(era) + 1,
      peso: pesos[era] || 0,
      // Si de este disco sale una aguja.
      celda: d.agujas.some((a) => a.era === era),
    })),
    // El camino, tramo a tramo.
    aristas: d.vertices.slice(0, -1).map((v, i) => ({
      a: d.encajar(v),
      b: d.encajar(d.vertices[i + 1]),
      contorno: true,
    })),
  };
}
