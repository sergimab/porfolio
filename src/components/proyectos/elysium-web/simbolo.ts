import type { Punto, TrazoHecho } from "@/components/proyectos/elysium/LienzoMetal";

// ── Los mandos ────────────────────────────────────────────────────────────
//
// Estas nueve cifras son todo lo que decide el carácter de un símbolo, y van en
// un objeto MUTABLE en vez de en constantes sueltas por una razón concreta: el
// panel de la pantalla final las cambia en caliente. Ajustar a ojo, viendo la
// figura cambiar, encuentra el punto bueno en un rato; hacerlo a ciegas por
// rondas de "prueba esto" cuesta días, y lo sé porque así lo hicimos.
//
// Cada una está explicada donde se usa. El panel es provisional: cuando la
// configuración esté decidida, estos valores se congelan y el panel se va.
export const AJUSTES = {
  // Distancia mínima al centro, en fracción de la máxima.
  radioMinimo: 0.28,
  // Lo que mide la figura de lado a lado una vez encajada.
  encaje: 0.62,
  // Grosor del montante —y, con la atracción, su alcance—.
  grosor: 0.0125,
  // Lo que queda del grosor justo en el vértice.
  pico: 0.22,
  // A partir de qué cerrado está el giro se afila.
  picoDesde: 0.12,
  // Hasta dónde baja el alcance en el vértice.
  picoAlcance: 0.45,
  // A qué distancia se considera que dos tramos se molestan.
  cruceCerca: 1.6,
  // Y hasta dónde se recoge su alcance. Más alto = más fusión.
  //
  // Recogerlo mucho es lo que producía la pirámide de cuatro caras en cada
  // cruce: al quitarle alcance a los puntos de la X, los cuatro valles que
  // quedan entre los brazos dejan de rellenarse, sus paredes se enderezan y el
  // sombreado —que lee la PENDIENTE— encuentra cuatro caras planas con sus
  // aristas. Dejando más alcance, las cúpulas de los dos tramos se solapan en
  // esos valles, el fondo sube y el cruce se lee como un nudo fundido.
  cruceMin: 0.84,
  // Cuánto engorda la cinta en un cruce: el filete que rellena los rincones
  // entre los brazos. Ver separarLosCruces.
  cruceRelleno: 0.45,
  // Y hasta dónde se recoge el alcance cuando el tramo de enfrente va
  // PARALELO, no cruzado: bajo, para que la ida y la vuelta de una punta no se
  // suelden en una masa alargada. Ver separarLosCruces.
  paraleloMin: 0.34,
  // Lo fino que llega a ser el tramo de un disco poco votado.
  delgado: 0.62,
  // Si el mínimo lo elige la propia figura en vez de valer lo de arriba. Ver
  // minimoDe: no hay un mínimo bueno para todos los repartos de votos.
  minimoAuto: true,
};


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
// 2. EL AMONTONAMIENTO DEL CENTRO NO SE COMBATE: ES EL RESULTADO. Durante
//    mucho tiempo separé los vértices del centro para deshacer esa masa, y con
//    eso me cargaba el mecanismo entero. Ver AJUSTES.radioMinimo y `escala`.
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
// CASI CERO, y esto es lo contrario de lo que estuve haciendo durante mucho
// tiempo. La tentación es subirlo para que el centro "respire", porque ahí es
// donde se juntan muchos tramos y se forma una masa. Pero esa masa ES el
// resultado: en el gráfico de referencia el trazo se queda entre el 20% y el
// 45% del radio, nunca llega al borde, y por eso los tramos de ida y de vuelta
// corren juntos. De ahí sale todo lo que hace al símbolo:
//
//   · una excursión aguda hacia fuera y de vuelta se funde en una AGUJA,
//   · los cruces cerca del centro dejan AGUJEROS diminutos,
//   · y el amontonamiento del medio es el CUERPO de la pieza.
//
// Separando los vértices se destruye el mecanismo entero: sale un polígono
// abierto, sin agujas y sin agujeros. El mínimo solo existe para que un disco
// con cero votos siga teniendo dirección propia y no colapse sobre el centro
// exacto.
// 0,28 sale de las dos veces que me pasé: con 0,45 los siete vértices quedaban
// tan repartidos que no se tocaba nada y salía un polígono de alambre; con
// 0,06, tres o cuatro discos flojos se apilaban sobre el centro y aquello era
// un pegote. En el gráfico de referencia el trazo va del 20% al 45% del radio
// —o sea que el más flojo llega a poco menos de la mitad del más votado—, que
// es más o menos aquí.
// (ajustable en caliente: AJUSTES.radioMinimo)

// Lo que mide la figura de lado a lado una vez encajada, en fracción del
// lienzo.
// (ajustable en caliente: AJUSTES.encaje)

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
// El punto de equilibrio, y es estrecho. A 0,013 sale un alambre: los tramos
// vecinos no llegan a tocarse y no hay ni agujas ni agujeros. A 0,024 sale un
// pegote: el campo alcanza a todo a la vez, los huecos se cierran y la pieza
// pierde el filo. Lo medí sobre la referencia y me pasé —el 9% que deduje de la
// imagen no sobrevive al contraste con el resultado—, así que este número sale
// de mirar figuras, no de una cuenta.
// (ajustable en caliente: AJUSTES.grosor)

// ── El afilado de los vértices ────────────────────────────────────────────
//
// El alcance del campo, repetido aquí a propósito: LienzoMetal lo exporta, pero
// importarlo metería un componente de React en este archivo, que es cálculo
// puro y se puede ejecutar fuera del navegador para medirlo. Si allí cambia,
// cambia aquí.
const ALCANCE_CAMPO = 3.6;
// Lo que queda del grosor justo en el vértice.
// (ajustable en caliente: AJUSTES.pico)
// La ventana del afilado, en veces el alcance. Es la distancia en la que la
// fusión redondea una esquina, así que el afilado tiene que empezar antes que
// ella o se aplica dentro de la zona ya redondeada y no se nota.
const PICO_VENTANA = 1.8;
// Y su tope como fracción del tramo más corto que llega al vértice, para que un
// tramo corto no se afile entero y se desprenda.
const PICO_TRAMO = 0.42;
// A partir de qué cerrado está el giro se afila. 0 es seguir recto, 1 es darse
// la vuelta del todo. Bajo a propósito: la referencia es angulosa de arriba
// abajo, así que hasta los vértices poco cerrados quieren su esquina.
// (ajustable en caliente: AJUSTES.picoDesde)
// Y hasta dónde baja el alcance en el vértice. Sin esto no basta: desde que el
// alcance dejó de seguir al grosor, dos ramas que salen del mismo vértice se
// funden entre ellas y rellenan la muesca que acaba de abrir el afilado.
// (ajustable en caliente: AJUSTES.picoAlcance)

// ── La separación de los cruces ───────────────────────────────────────────
//
// Hasta dónde se mira, en veces el alcance; cuántos puntos del camino por
// debajo de los cuales dos son simplemente vecinos; cuánto tiene que acortar el
// camino la línea recta para que cuente como cruce y no como tramo seguido; y
// hasta dónde puede recogerse el alcance.
// (ajustable en caliente: AJUSTES.cruceCerca)
const CRUCE_VECINO = 10;
const CRUCE_DOBLEZ = 0.5;
// Qué parte del radio de detección ocupa el filete. Ver separarLosCruces.
const CRUCE_FILETE = 0.5;
// (ajustable en caliente: AJUSTES.cruceMin)

// Lo fino que llega a ser el tramo de un disco poco votado, en fracción del
// grosor máximo.
//
// El grosor vuelve a contar los votos, pero en una horquilla ESTRECHA a
// propósito. Con la horquilla ancha que hubo al principio, el disco menos
// votado salía como un hilo, y un hilo se queda a un 5% del umbral del campo:
// cualquier curva lo hunde por debajo y la figura se parte —10 de 123, medido—.
// Con 0,62 el tramo más fino conserva cerca de un 25% de margen, que aguanta, y
// aun así se distingue a simple vista del más gordo.
// (ajustable en caliente: AJUSTES.delgado)

// Puntos por tramo. El lienzo remuestrea por su cuenta, pero necesita bastantes
// puntos crudos para que su suavizado no redondee los vértices, que es donde
// nace la forma.
//
// Se exporta para la vista de taller: un punto es un VÉRTICE del camino
// exactamente cuando su índice es múltiplo de esto.
export const POR_TRAMO = 14;

// No hay agujas dibujadas aparte, y es a propósito.
//
// Las hubo, y estaban de más. Una aguja aparece sola donde el camino se aleja
// del montón y vuelve por casi el mismo sitio: ese giro de casi 180° es el más
// cerrado que existe, y el campo lo estira en punta. Dibujarla encima era
// sumar un adorno a algo que el propio recorrido ya produce, y por eso quedaba
// como un añadido en vez de como parte de la pieza.

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
function disponer(pesos: Record<Era, number>, minimoDado?: number) {
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
    const minimo = minimoDado ?? AJUSTES.radioMinimo;
    const radio = EXTENSION * (minimo + (1 - minimo) * proporcionDe(era));
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

  // Y el grosor, UNO POR TRAMO y constante de punta a punta.
  //
  // No interpolado entre los dos vértices: eso hacía que el grosor subiera y
  // bajara a lo largo del mismo tramo, y un montante que engorda por el camino
  // no se lee como intención, se lee como un fallo. Cada tramo es una barra de
  // una sección, y el cambio ocurre EN el vértice, donde se juntan dos barras
  // distintas —que es exactamente lo que pasa en una pieza soldada—.
  //
  // El grosor de un tramo sale de los dos discos que une: el de un tramo entre
  // dos muy votados tiene cuerpo, el de uno entre dos flojos es fino.
  const grosorDe = (era: Era) => AJUSTES.delgado + (1 - AJUSTES.delgado) * proporcionDe(era);
  const tramos = [recorrido[0], ...recorrido, recorrido[recorrido.length - 1]];
  const grosores: number[] = [];
  for (let i = 0; i < tramos.length - 1; i++) {
    grosores.push((grosorDe(tramos[i]) + grosorDe(tramos[i + 1])) / 2);
  }

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
  const todos: [number, number][] = [...vertices];
  const xs = todos.map((v) => v[0]);
  const ys = todos.map((v) => v[1]);
  const mayor = Math.max(
    Math.max(...xs) - Math.min(...xs),
    Math.max(...ys) - Math.min(...ys)
  );
  const k = mayor > 1e-4 ? AJUSTES.encaje / mayor : 1;
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
    grosores,
    encajar,
    // Cuánto se ha ampliado la figura para llenar el marco. El grosor tiene que
    // multiplicarse por esto, y es de las cosas menos evidentes de todo el
    // generador.
    //
    // El campo funde a una distancia FIJA. Si la figura se amplía y el grosor
    // no, los tramos que en el gráfico corrían pegados quedan lejos en píxeles
    // y dejan de fundirse: sale un polígono de alambre, sin agujas y sin
    // agujeros. Ampliando las dos cosas a la vez, la figura de un disco poco
    // votado —apretada, y por eso fundida en un cuerpo con agujeros— se ve
    // grande y sigue siendo ese cuerpo, y la de uno muy votado sigue saliendo
    // abierta. El tamaño en pantalla se iguala; la FORMA la siguen decidiendo
    // los votos, que es lo que tiene que distinguir a una figura de otra.
    escala: k,
  };
}

// ── La elección automática del mínimo ─────────────────────────────────────
//
// El mínimo es el mando que más cambia el resultado, y el problema es que su
// mejor valor NO es el mismo para todas las figuras: depende del reparto de
// votos. Con siete discos parejos, los vértices caen casi en un anillo y hace
// falta acercarlos al centro para que la línea se cruce y aparezcan formas; con
// uno dominante y seis a cero, esos seis se apilan y hay que separarlos o sale
// un pegote. Un número fijo acierta en unas figuras y falla en otras, y eso es
// exactamente lo que se veía tirando del ALEATORIO.
//
// Así que se busca. Se prueban valores y se puntúa cada uno contra lo que
// queremos de verdad:
//
//   · NADA DE MASAS: tramos que corren tan pegados que se funden en un bulto.
//   · CUANTAS MÁS FORMAS, MEJOR: cada cruce de la línea consigo misma encierra
//     un hueco, y un hueco es una forma. Solo cuentan los que tienen tamaño
//     suficiente para no rellenarse.
//   · FUSIÓN ORGÁNICA: tramos que se acercan lo justo para soldarse con una
//     membrana, sin llegar a fundirse del todo.
//
// Se mide sobre la geometría, sin pintar. El campo del lienzo tiene un alcance
// conocido, así que la distancia entre dos tramos basta para saber si se
// ignoran, se sueldan o se funden en una masa.

// Distancias en las que ocurre cada cosa, en veces el alcance del campo.
const MASA = 0.55;
const MEMBRANA = 1.15;
// Cuántos pares muy juntos se toleran —son el cuerpo de la pieza— y cuántas
// membranas se buscan. Los dos salen de mirar el barrido de figuras reales, no
// de una cuenta: por debajo de la treintena la pieza se lee como alambre y por
// encima empieza a pegarse consigo misma.
const MASA_PERDONADA = 4;
const MEMBRANAS_OBJETIVO = 34;

export function medir(pesos: Record<Era, number>, minimo: number) {
  const d = disponer(pesos, minimo);
  if (!d) return { nota: -Infinity, minimo };

  // El recorrido, muestreado grueso: para medir distancias no hacen falta los
  // catorce puntos por tramo que necesita el tejido.
  const POR_LADO = 8;
  const puntos: { x: number; y: number; s: number }[] = [];
  let largo = 0;
  for (let i = 0; i < d.vertices.length - 1; i++) {
    const [x1, y1] = d.encajar(d.vertices[i]);
    const [x2, y2] = d.encajar(d.vertices[i + 1]);
    const tramo = Math.hypot(x2 - x1, y2 - y1);
    for (let n = 0; n < POR_LADO; n++) {
      const t = n / POR_LADO;
      puntos.push({ x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t, s: largo + tramo * t });
    }
    largo += tramo;
  }

  // El alcance, en las mismas unidades que los puntos.
  const alcance = AJUSTES.grosor * d.escala * ALCANCE_CAMPO;

  let masa = 0;
  let membranas = 0;
  for (let i = 0; i < puntos.length; i++) {
    for (let j = i + 1; j < puntos.length; j++) {
      const p = puntos[i];
      const q = puntos[j];
      const dist = Math.hypot(q.x - p.x, q.y - p.y);
      if (dist >= alcance * MEMBRANA) continue;
      // Si están cerca POR EL CAMINO son vecinos, no dos tramos que se
      // encuentran: la distancia entre ellos no dice nada.
      if (Math.abs(q.s - p.s) < alcance * 2) continue;
      if (dist < alcance * MASA) masa++;
      else membranas++;
    }
  }

  // Los cruces de la línea consigo misma, y el tamaño del hueco que encierran.
  // Un cruce cuyo lazo sea más pequeño que el propio grosor no deja hueco: se
  // rellena y lo que queda es un nudo.
  let formas = 0;
  const vs = d.vertices.map(d.encajar);
  for (let i = 0; i < vs.length - 1; i++) {
    for (let j = i + 2; j < vs.length - 1; j++) {
      const corte = cruce(vs[i], vs[i + 1], vs[j], vs[j + 1]);
      if (!corte) continue;
      // El lazo que encierra el cruce son los vértices entre los dos tramos.
      const lazo = [corte, ...vs.slice(i + 1, j + 1), corte];
      if (area(lazo) > alcance * alcance * 2.2) formas++;
    }
  }

  // La nota, y su forma importa más que sus pesos.
  //
  // El primer intento sumaba formas, restaba masa y premiaba la fusión con
  // techo. Salía mal por una razón que solo se ve midiendo: separar los
  // vértices MEJORA las dos primeras a la vez —más cruces con hueco de sobra y
  // menos tramos pegados—, así que el máximo se iba siempre al extremo del
  // barrido. Y ese extremo es exactamente el polígono de alambre: lleno de
  // huecos, sí, pero sin nada fundido.
  //
  // Lo que faltaba es que la fusión tire EN CONTRA, y no como "cuantas más
  // mejor" sino con una banda: pocas membranas es un alambre y muchas es una
  // figura pegándose consigo misma entera. Con el objetivo en medio, el máximo
  // cae dentro del barrido y no en su borde.
  //
  // Y la masa se perdona hasta cierto punto: unos pocos tramos muy juntos son
  // el CUERPO de la pieza, que es algo que queremos. Lo que no queremos es que
  // el cuerpo se coma la figura.
  const nota =
    formas * 2.5 -
    Math.max(0, masa - MASA_PERDONADA) * 0.8 -
    Math.abs(membranas - MEMBRANAS_OBJETIVO) * 0.5;
  return { nota, minimo, formas, masa, membranas };
}

// Dónde se cruzan dos segmentos, si es que se cruzan.
function cruce(
  a: [number, number],
  b: [number, number],
  c: [number, number],
  e: [number, number]
): [number, number] | null {
  const r = [b[0] - a[0], b[1] - a[1]];
  const s = [e[0] - c[0], e[1] - c[1]];
  const den = r[0] * s[1] - r[1] * s[0];
  if (Math.abs(den) < 1e-9) return null;
  const t = ((c[0] - a[0]) * s[1] - (c[1] - a[1]) * s[0]) / den;
  const u = ((c[0] - a[0]) * r[1] - (c[1] - a[1]) * r[0]) / den;
  if (t <= 0 || t >= 1 || u <= 0 || u >= 1) return null;
  return [a[0] + r[0] * t, a[1] + r[1] * t];
}

function area(poligono: [number, number][]) {
  let doble = 0;
  for (let i = 0; i < poligono.length - 1; i++) {
    doble += poligono[i][0] * poligono[i + 1][1] - poligono[i + 1][0] * poligono[i][1];
  }
  return Math.abs(doble) / 2;
}

// El mínimo elegido para este reparto de votos.
//
// Barrido grueso y quedarse con el mejor. Veintiuna pruebas de unos pocos miles
// de operaciones cada una: se ejecuta en unos milisegundos, así que puede vivir
// en el propio generador en vez de en una tabla calculada de antemano.
export function minimoDe(pesos: Record<Era, number>): number {
  let mejor = { nota: -Infinity, minimo: AJUSTES.radioMinimo };
  for (let m = 0.04; m <= 0.56001; m += 0.02) {
    const r = medir(pesos, m);
    if (r.nota > mejor.nota) mejor = r;
  }
  return mejor.minimo;
}

// ── De reparto a trazos ───────────────────────────────────────────────────

// Afila los vértices encogiendo el trazo por LOS DOS LADOS al acercarse a
// ellos.
//
// Es lo único que produce una esquina. El afilado del lienzo actúa en los cabos
// del trazo, y por el medio el radio de las cúpulas se mantiene, así que un
// vértice interior se cierra siempre en casquete: redondo, por cerrado que sea
// el giro. Y bajar la altura no sirve —la superficie termina igualmente en
// casquete—; tiene que encoger el RADIO.
//
// Este mecanismo ya existió y hubo que quitarlo, pero por una razón que ya no
// se da: entonces el grosor seguía a los votos, el brazo más flojo era un hilo
// viviendo a un 5% del umbral del campo, y recortarlo lo hundía por debajo y lo
// desprendía. Con el grosor parejo hay más de un 50% de margen sobre el umbral,
// y el afilado cabe de sobra.
// La distancia de cada punto al tramo AJENO más cercano, o infinito si no hay
// ninguno. Es el dato del que viven las dos funciones siguientes, y se calcula
// una sola vez porque las dos preguntan exactamente lo mismo.
//
// "Ajeno" no es "lejos en el array": los puntos de al lado siempre están cerca.
// Es que esté MUCHO MÁS CERCA EN EL ESPACIO QUE A LO LARGO DEL CAMINO. En un
// tramo recto las dos distancias se parecen; donde el camino se dobla sobre sí
// mismo o se cruza, se separan.
type Vecindad = {
  // Distancia al tramo ajeno más cercano, o infinito si no hay.
  cerca: number[];
  // Y si ese tramo va PARALELO al nuestro, de 0 a 1.
  //
  // Es la distinción que separa las dos peticiones, que parecían la misma y no
  // lo son. Dos tramos ajenos pueden encontrarse de dos maneras:
  //
  //   · CRUZÁNDOSE, en ángulo abierto. Ahí la fusión es lo que se quiere: el
  //     nudo tiene que leerse como una pieza y no como dos tubos superpuestos.
  //   · CORRIENDO JUNTOS, casi en la misma línea. Eso pasa en cada punta: el
  //     camino sale hacia fuera y vuelve por al lado, y la ida y la vuelta se
  //     sueldan a lo largo en una masa alargada con un hueco dentro, en vez de
  //     leerse como dos trazos finos.
  //
  // Con el ángulo se pueden tratar distinto: fundir los cruces y separar los
  // paralelos. Sin él solo cabía elegir entre fundirlo todo o nada.
  paralelo: number[];
};

function distanciasAjenas(trazo: Punto[]): Vecindad {
  const acum = [0];
  for (let i = 1; i < trazo.length; i++) {
    acum.push(acum[i - 1] + Math.hypot(trazo[i].x - trazo[i - 1].x, trazo[i].y - trazo[i - 1].y));
  }
  // La dirección local de cada punto, para poder comparar rumbos.
  const rumbo = trazo.map((p, i) => {
    const a = trazo[Math.max(0, i - 2)];
    const b = trazo[Math.min(trazo.length - 1, i + 2)];
    const d = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    return [(b.x - a.x) / d, (b.y - a.y) / d] as const;
  });

  const cerca: number[] = [];
  const paralelo: number[] = [];
  trazo.forEach((p, i) => {
    let mejor = Infinity;
    let mejorJ = -1;
    for (let j = 0; j < trazo.length; j++) {
      if (Math.abs(i - j) < CRUCE_VECINO) continue;
      const d = Math.hypot(trazo[j].x - p.x, trazo[j].y - p.y);
      if (d > Math.abs(acum[i] - acum[j]) * CRUCE_DOBLEZ) continue;
      if (d < mejor) {
        mejor = d;
        mejorJ = j;
      }
    }
    cerca.push(mejor);
    if (mejorJ < 0) {
      paralelo.push(0);
      return;
    }
    // En VALOR ABSOLUTO: la ida y la vuelta de una punta van en sentidos
    // contrarios, así que su coseno es −1 y no +1, y sin el absoluto el caso
    // que más importa se contaría como el más perpendicular de todos.
    const coseno = Math.abs(
      rumbo[i][0] * rumbo[mejorJ][0] + rumbo[i][1] * rumbo[mejorJ][1]
    );
    // Solo cuenta como paralelo lo que de verdad lo es: por debajo de un
    // coseno de 0,7 —unos 45º— se considera cruce y se funde.
    paralelo.push(Math.min(1, Math.max(0, (coseno - 0.7) / 0.3)));
  });
  return { cerca, paralelo };
}

function afilarVertices(trazo: Punto[], base: number, vecindad: Vecindad): Punto[] {
  const acum = [0];
  for (let i = 1; i < trazo.length; i++) {
    acum.push(acum[i - 1] + Math.hypot(trazo[i].x - trazo[i - 1].x, trazo[i].y - trazo[i - 1].y));
  }

  // Los vértices interiores, con lo cerrado de su giro. Van cada POR_TRAMO
  // puntos por construcción; los dos cabos se saltan porque el lienzo ya se
  // ocupa de ellos.
  const ventanaMaxima = base * ALCANCE_CAMPO * PICO_VENTANA;
  // Hasta dónde se considera que un vértice tiene compañía. El mismo radio con
  // el que se detectan los cruces: si ahí hay otro tramo, este vértice no está
  // al aire.
  const radioLibre = base * ALCANCE_CAMPO * AJUSTES.cruceCerca;
  const picos: { i: number; agudeza: number; ventana: number; libre: number }[] = [];
  for (let i = POR_TRAMO; i < trazo.length - 1; i += POR_TRAMO) {
    const antes = trazo[Math.max(0, i - 5)];
    const luego = trazo[Math.min(trazo.length - 1, i + 5)];
    const v = trazo[i];
    const ax = v.x - antes.x;
    const ay = v.y - antes.y;
    const bx = luego.x - v.x;
    const by = luego.y - v.y;
    const la = Math.hypot(ax, ay) || 1;
    const lb = Math.hypot(bx, by) || 1;
    // 1 = sigue recto, −1 = se da la vuelta. Se lleva a 0..1.
    const coseno = (ax * bx + ay * by) / (la * lb);
    const tramoAntes = acum[i] - acum[Math.max(0, i - POR_TRAMO)];
    const tramoLuego = acum[Math.min(trazo.length - 1, i + POR_TRAMO)] - acum[i];
    picos.push({
      i,
      agudeza: Math.min(1, Math.max(0, (1 - coseno) / 2)),
      ventana: Math.min(ventanaMaxima, Math.min(tramoAntes, tramoLuego) * PICO_TRAMO),
      // Cuánto está AL AIRE, y de aquí venía el cráter con forma de estrella.
      //
      // Afilar un vértice es encogerle el radio hasta un 22%. En una punta
      // suelta eso es exactamente lo que se quiere: la punta sale afilada en
      // vez de en casquete. Pero cuando el vértice cae en medio de la figura,
      // con otros tramos alrededor, esos tramos llegan con su grosor entero
      // hasta un centro estrangulado, y el resultado es un hoyo de cuatro caras
      // justo donde se juntan. Lo que parecía un problema de fusión entre los
      // brazos era el propio vértice hundiéndose.
      //
      // Con esto, el afilado se apaga a medida que el vértice tiene compañía:
      // entero al aire, nada dentro de un nudo.
      libre: Math.min(1, vecindad.cerca[i] / radioLibre),
    });
  }

  return trazo.map((p, i) => {
    let factor = 1;
    for (const pico of picos) {
      if (pico.agudeza < AJUSTES.picoDesde) continue;
      const d = Math.abs(acum[i] - acum[pico.i]);
      if (d >= pico.ventana) continue;
      // Lleno en el vértice y nada en el borde de la ventana, graduado por lo
      // cerrado del giro.
      const fuerza =
        ((pico.agudeza - AJUSTES.picoDesde) / (1 - AJUSTES.picoDesde)) * pico.libre;
      factor = Math.min(factor, 1 - (1 - AJUSTES.pico) * fuerza * (1 - d / pico.ventana));
    }
    if (factor >= 1) return p;
    return {
      ...p,
      r: p.r * factor,
      a: Math.max(AJUSTES.picoAlcance, factor),
    };
  });
}

// Acorta el ALCANCE donde el camino se junta consigo mismo, para que los huecos
// no se rellenen.
//
// Cerca del centro pasan varios tramos, y el campo funde a distancia fija: dos
// que corren a menos de esa distancia se sueldan y el hueco entre ellos
// desaparece. En vez de dos líneas y un hueco queda una masa.
//
// Se toca SOLO el alcance, no el grosor. Son dos mandos distintos desde que
// existe la atracción —el grosor lo pone la altura de la cúpula y el alcance su
// anchura—, y aquí hace falta exactamente uno: los montantes tienen que seguir
// midiendo lo mismo, lo que tiene que dejar de pasar es que se atraigan.
// Adelgazándolos se conseguiría el hueco a costa de un trazo desigual, que es
// justo lo que se acaba de arreglar.
//
// La vecindad la da distanciasAjenas, que es donde está explicada la prueba.
function separarLosCruces(trazo: Punto[], base: number, vecindad: Vecindad): Punto[] {
  // Hasta donde llega la fusión: más allá, dos tramos ya no se enteran el uno
  // del otro.
  const cerca = base * ALCANCE_CAMPO * AJUSTES.cruceCerca;

  return trazo.map((p, i) => {
    // La distancia al tramo ajeno más cercano decide las dos cosas: cuánto se
    // recoge el alcance y cuánto engorda el filete.
    //
    // Tiene que ser el más cercano y no un recuento de vecinos, y esto lo hice
    // mal la primera vez: sumando un peso por vecino, en el interior de la
    // figura hay decenas de puntos a tiro y el total se desbordaba en casi
    // todas partes, así que el filete dejaba de ser un filete y engordaba la
    // pieza entera. La figura salió como una masa con los montantes finos
    // comidos. Lo que define un rincón es lo cerca que está la pared de
    // enfrente: una distancia, no un recuento.
    const masCerca = vecindad.cerca[i];
    // Lo paralelo que va el tramo de enfrente: cerca de 1, es la ida y la
    // vuelta de una punta corriendo juntas; cerca de 0, un cruce de verdad.
    const par = vecindad.paralelo[i];
    if (masCerca >= cerca) return p;
    // Cuánto se recoge el alcance, graduado por la misma distancia.
    const vecinos = (1 - masCerca / cerca) * 6;
    // Cuantos más tramos alrededor, más se recoge. Con suelo: sin nada de
    // alcance, el cruce dejaría de fundirse del todo y se vería como un aspa de
    // dos piezas superpuestas en vez de como una unión.
    const recogido = 1 / (1 + vecinos * 0.04);
    // EL FILETE. Más alcance no basta para quitar los valles de un cruce, y
    // esto costó una pasada entenderlo: el alcance ensancha la cúpula de cada
    // punto, pero los dos brazos que salen del cruce siguen siendo dos crestas
    // separadas, y el rincón agudo que queda entre ellas sigue ahí. Lo que
    // rellena un rincón es MASA en el rincón, o sea grosor. Engordando la cinta
    // en el propio cruce, el encuentro pasa de dos tubos cruzados a un nudo con
    // sus curvas de acuerdo, que es lo que hace cualquier soldadura.
    //
    // El relleno cae al CUADRADO de la distancia, así que es fuerte donde los
    // dos tramos se tocan y prácticamente nulo a media distancia: engorda el
    // rincón y deja el resto del montante como estaba. El radio del filete es
    // más corto que el de detección, porque detectar un cruce y estar dentro de
    // él son dos cosas distintas.
    const radio = cerca * CRUCE_FILETE;
    const lleno = masCerca >= radio ? 0 : Math.pow(1 - masCerca / radio, 2);
    // Y aquí se separan los dos casos.
    //
    // En un CRUCE se funde: el alcance apenas se recoge y el filete rellena el
    // rincón, que es lo que hace que el nudo se lea como una pieza.
    //
    // Entre dos tramos PARALELOS se hace lo contrario: se recoge el alcance
    // hasta que dejan de alcanzarse y no se engorda nada, así que la ida y la
    // vuelta de una punta se ven como dos trazos finos en vez de soldarse en
    // una masa alargada. Lo que antes obligaba a elegir entre las dos cosas
    // para toda la figura, ahora lo decide el ángulo punto por punto.
    const suelo = AJUSTES.cruceMin + (AJUSTES.paraleloMin - AJUSTES.cruceMin) * par;
    return {
      ...p,
      r: p.r * (1 + AJUSTES.cruceRelleno * lleno * (1 - par)),
      a: Math.min(p.a ?? 1, Math.max(suelo, recogido * (1 - par) + AJUSTES.paraleloMin * par)),
    };
  });
}

export function figuraDeEras(
  pesos: Record<Era, number>,
  // Cuánto ocupa la figura en su marco, si hace falta otra cosa que el valor
  // general. La portada lo sube: allí el símbolo va dentro de una caja y tiene
  // que llenarla, mientras que en la pantalla del trazado va suelto sobre el
  // universo y necesita aire alrededor.
  encaje?: number
): TrazoHecho[] {
  const previo = AJUSTES.encaje;
  if (encaje) AJUSTES.encaje = encaje;
  const d = disponer(pesos, AJUSTES.minimoAuto ? minimoDe(pesos) : undefined);
  AJUSTES.encaje = previo;
  if (!d) return [];

  // De poligonal a trazo, muestreando cada tramo a paso constante e
  // interpolando el grosor entre sus dos vértices.
  const base = AJUSTES.grosor * d.escala;
  // `gs` trae UN grosor por tramo, no uno por vértice.
  const tejer = (vs: [number, number][], gs: number[]): Punto[] => {
    const puntos: Punto[] = [];
    for (let i = 0; i < vs.length - 1; i++) {
      const [x1, y1] = d.encajar(vs[i]);
      const [x2, y2] = d.encajar(vs[i + 1]);
      for (let n = 0; n < POR_TRAMO; n++) {
        const t = n / POR_TRAMO;
        puntos.push({
          x: x1 + (x2 - x1) * t,
          y: y1 + (y2 - y1) * t,
          r: base * gs[i],
        });
      }
    }
    const [fx, fy] = d.encajar(vs[vs.length - 1]);
    puntos.push({ x: fx, y: fy, r: base * gs[gs.length - 1] });
    return puntos;
  };

  // Un solo trazo, y sin afilar por ninguno de sus dos cabos: salen del mismo
  // punto y ahí se encuentran.
  return [
    {
      // El orden importa: primero se afilan los vértices y luego se separan los
      // cruces. Al revés, el afilado pisaría el alcance ya recogido de un cruce
      // que cae junto a un vértice —que es donde más se juntan las cosas— y
      // volvería a soldarlo.
      //
      // Y las dos medidas van contra `base`, el grosor máximo, no contra el
      // radio de cada punto: si no, el tramo fino se afilaría en una ventana
      // más corta y su vértice saldría con otro carácter que el de al lado.
      puntos: (() => {
        // Las distancias se miden UNA vez sobre el trazo crudo y las usan las
        // dos funciones. Ninguna de las dos mueve puntos —solo tocan radio y
        // alcance—, así que siguen valiendo después de afilar.
        const crudo = tejer(d.vertices, d.grosores);
        const vecindad = distanciasAjenas(crudo);
        return separarLosCruces(afilarVertices(crudo, base, vecindad), base, vecindad);
      })(),
      sinEntrada: true,
      sinSalida: true,
      desde: 0,
      hasta: 1,
    },
  ];
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
  const d = disponer(pesos, AJUSTES.minimoAuto ? minimoDe(pesos) : undefined);
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
      // Ya no se destaca ningún nudo: las agujas salen del propio recorrido.
      celda: false,
    })),
    // El camino, tramo a tramo.
    aristas: d.vertices.slice(0, -1).map((v, i) => ({
      a: d.encajar(v),
      b: d.encajar(d.vertices[i + 1]),
      contorno: true,
    })),
  };
}
