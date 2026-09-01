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
// 2. EL AMONTONAMIENTO DEL CENTRO NO SE COMBATE: ES EL RESULTADO. Durante
//    mucho tiempo separé los vértices del centro para deshacer esa masa, y con
//    eso me cargaba el mecanismo entero. Ver RADIO_MINIMO y `escala`.
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
const RADIO_MINIMO = 0.28;

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
// El punto de equilibrio, y es estrecho. A 0,013 sale un alambre: los tramos
// vecinos no llegan a tocarse y no hay ni agujas ni agujeros. A 0,024 sale un
// pegote: el campo alcanza a todo a la vez, los huecos se cierran y la pieza
// pierde el filo. Lo medí sobre la referencia y me pasé —el 9% que deduje de la
// imagen no sobrevive al contraste con el resultado—, así que este número sale
// de mirar figuras, no de una cuenta.
export const GROSOR = 0.0125;

// ── El afilado de los vértices ────────────────────────────────────────────
//
// El alcance del campo, repetido aquí a propósito: LienzoMetal lo exporta, pero
// importarlo metería un componente de React en este archivo, que es cálculo
// puro y se puede ejecutar fuera del navegador para medirlo. Si allí cambia,
// cambia aquí.
const ALCANCE_CAMPO = 3.6;
// Lo que queda del grosor justo en el vértice.
const PICO = 0.22;
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
const PICO_DESDE = 0.12;
// Y hasta dónde baja el alcance en el vértice. Sin esto no basta: desde que el
// alcance dejó de seguir al grosor, dos ramas que salen del mismo vértice se
// funden entre ellas y rellenan la muesca que acaba de abrir el afilado.
const PICO_ALCANCE = 0.45;

// ── La separación de los cruces ───────────────────────────────────────────
//
// Hasta dónde se mira, en veces el alcance; cuántos puntos del camino por
// debajo de los cuales dos son simplemente vecinos; cuánto tiene que acortar el
// camino la línea recta para que cuente como cruce y no como tramo seguido; y
// hasta dónde puede recogerse el alcance.
const CRUCE_CERCA = 1.6;
const CRUCE_VECINO = 10;
const CRUCE_DOBLEZ = 0.5;
const CRUCE_MIN = 0.58;

// Lo fino que llega a ser el tramo de un disco poco votado, en fracción del
// grosor máximo.
//
// El grosor vuelve a contar los votos, pero en una horquilla ESTRECHA a
// propósito. Con la horquilla ancha que hubo al principio, el disco menos
// votado salía como un hilo, y un hilo se queda a un 5% del umbral del campo:
// cualquier curva lo hunde por debajo y la figura se parte —10 de 123, medido—.
// Con 0,62 el tramo más fino conserva cerca de un 25% de margen, que aguanta, y
// aun así se distingue a simple vista del más gordo.
const DELGADO = 0.62;

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

  // Y el grosor de cada vértice, que es lo que hace que unos tramos salgan más
  // finos que otros.
  //
  // Los dos del centro heredan el del disco que sale o entra por ellos, para
  // que el cambio ocurra a lo largo del tramo y no de golpe en el arranque.
  const grosorDe = (era: Era) => DELGADO + (1 - DELGADO) * proporcionDe(era);
  const grosores: number[] = [
    grosorDe(recorrido[0]),
    ...recorrido.map(grosorDe),
    grosorDe(recorrido[recorrido.length - 1]),
  ];

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
function afilarVertices(trazo: Punto[], base: number): Punto[] {
  const acum = [0];
  for (let i = 1; i < trazo.length; i++) {
    acum.push(acum[i - 1] + Math.hypot(trazo[i].x - trazo[i - 1].x, trazo[i].y - trazo[i - 1].y));
  }

  // Los vértices interiores, con lo cerrado de su giro. Van cada POR_TRAMO
  // puntos por construcción; los dos cabos se saltan porque el lienzo ya se
  // ocupa de ellos.
  const ventanaMaxima = base * ALCANCE_CAMPO * PICO_VENTANA;
  const picos: { i: number; agudeza: number; ventana: number }[] = [];
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
    });
  }

  return trazo.map((p, i) => {
    let factor = 1;
    for (const pico of picos) {
      if (pico.agudeza < PICO_DESDE) continue;
      const d = Math.abs(acum[i] - acum[pico.i]);
      if (d >= pico.ventana) continue;
      // Lleno en el vértice y nada en el borde de la ventana, graduado por lo
      // cerrado del giro.
      const fuerza = (pico.agudeza - PICO_DESDE) / (1 - PICO_DESDE);
      factor = Math.min(factor, 1 - (1 - PICO) * fuerza * (1 - d / pico.ventana));
    }
    if (factor >= 1) return p;
    return {
      ...p,
      r: p.r * factor,
      a: Math.max(PICO_ALCANCE, factor),
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
// La prueba no es "cuántos puntos tengo cerca" —los de al lado siempre lo
// están— sino si alguno está MUCHO MÁS CERCA EN EL ESPACIO QUE A LO LARGO DEL
// CAMINO. En un tramo recto las dos distancias se parecen; donde el camino se
// cruza consigo mismo, se separan, y esa diferencia es exactamente "aquí hay
// otro tramo que no es mi continuación".
function separarLosCruces(trazo: Punto[], base: number): Punto[] {
  const acum = [0];
  for (let i = 1; i < trazo.length; i++) {
    acum.push(acum[i - 1] + Math.hypot(trazo[i].x - trazo[i - 1].x, trazo[i].y - trazo[i - 1].y));
  }
  // Se mira hasta donde llega la fusión: más allá, dos tramos ya no se enteran
  // el uno del otro.
  const cerca = base * ALCANCE_CAMPO * CRUCE_CERCA;

  return trazo.map((p, i) => {
    let vecinos = 0;
    for (let j = 0; j < trazo.length; j++) {
      if (Math.abs(i - j) < CRUCE_VECINO) continue;
      const q = trazo[j];
      const d = Math.hypot(q.x - p.x, q.y - p.y);
      if (d >= cerca) continue;
      // Si la distancia en línea recta se parece a la del camino, es que la
      // línea sigue de largo: no hay cruce.
      if (d > Math.abs(acum[i] - acum[j]) * CRUCE_DOBLEZ) continue;
      vecinos++;
    }
    if (!vecinos) return p;
    // Cuantos más tramos alrededor, más se recoge. Con suelo: sin nada de
    // alcance, el cruce dejaría de fundirse del todo y se vería como un aspa de
    // dos piezas superpuestas en vez de como una unión.
    const recogido = 1 / (1 + vecinos * 0.06);
    return { ...p, a: Math.min(p.a ?? 1, Math.max(CRUCE_MIN, recogido)) };
  });
}

export function figuraDeEras(pesos: Record<Era, number>): TrazoHecho[] {
  const d = disponer(pesos);
  if (!d) return [];

  // De poligonal a trazo, muestreando cada tramo a paso constante e
  // interpolando el grosor entre sus dos vértices.
  const base = GROSOR * d.escala;
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
          r: base * (gs[i] + (gs[i + 1] - gs[i]) * t),
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
      puntos: separarLosCruces(
        afilarVertices(tejer(d.vertices, d.grosores), base),
        base
      ),
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
