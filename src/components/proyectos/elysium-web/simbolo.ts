import type { Punto, TrazoHecho } from "@/components/proyectos/elysium/LienzoMetal";

// El generador de símbolos de Elysium.
//
// La regla es la que cuenta la propia página de Elysium: hay un gráfico
// circular con siete puntas, una por álbum, y cuantas más canciones eliges de
// un disco más se estira la figura hacia su punta. La línea empieza en el
// centro, en el cero, viaja primero al álbum con el porcentaje más alto, salta
// al siguiente y al siguiente, y se cierra sobre su punto de partida.
//
// Todo el carácter de la figura sale de que esos dos órdenes NO son el mismo:
// las puntas están repartidas en orden de DISCOGRAFÍA, mientras que el
// recorrido va de más a menos votado. Si coincidieran, la línea daría la vuelta
// al círculo sin cruzarse nunca y saldría un polígono; al no coincidir, la
// línea se cruza consigo misma y de esos cruces nacen las masas.

// Las siete puntas, en el orden en que salieron los discos. Es el que fija
// dónde cae cada una alrededor del círculo.
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

// Cuánto del ancho del lienzo ocupa la figura de lado a lado, como mucho. No
// llega a 1 para que las agujas de los vértices —que salen POR FUERA de la
// línea— quepan dentro y no se corten contra el borde.
const EXTENSION = 0.4;
// Radio mínimo de una punta, en fracción de la mayor. Un álbum sin nada elegido
// NO se salta: se le deja una punta corta.
//
// Estuvo en 0,38 una temporada para deshacer unas masas del centro: con el
// mínimo bajo, tres o cuatro discos poco votados caían casi encima del centro y
// esos vértices amontonados se fundían en un bulto.
//
// Vuelve a 0,12, y ahora sí funciona, porque entretanto cambió lo que amontona:
// aquellos brazos eran cintas con cuerpo y hoy son hilos. Tres hilos que se
// cruzan cerca del centro no hacen bulto, hacen un nudo fino.
//
// Y ganamos lo que costaba tenerlo alto: con el mínimo alto, los siete puntos
// caían casi en un anillo y la figura se leía como un polígono enredado. Con el
// mínimo bajo, los flojos se acercan al centro y los fuertes se van al borde,
// que es lo que hace que el recorrido de mayor a menor se VEA en la forma.
//
// Es lo que hace que toda figura tenga las siete direcciones y, con ellas,
// carácter. Saltándose los ceros, quien elige de dos discos obtiene una línea
// de ida y vuelta —dos vértices— que no es un símbolo, es una raya; y quien
// elige de uno, una línea doblada sobre sí misma. Con la punta corta, esos
// mismos casos salen como una estrella muy asimétrica: un brazo largo y seis
// cortos. Y sigue diciendo la verdad, porque cerca del centro es exactamente lo
// que significa no haber elegido nada de ese disco.
const RADIO_MINIMO = 0.12;
// Lo que debe medir la figura de lado a lado una vez encajada, en fracción del
// lienzo. Ver el reencuadre al final.
const ENCAJE = 0.66;
// Grosor de la cinta, en la misma escala relativa. Es el radio, no el ancho.
//
// Va en fracción del lienzo y no en píxeles a propósito: así la figura se ve
// igual de proporcionada en el marco grande de escritorio que en el de móvil.
// En píxeles, un valor bueno en uno de los dos sale de alambre en el otro.
//
// Este es el grosor del brazo MÁS votado. Los demás adelgazan con su peso, y el
// del disco sin nada elegido baja hasta HILO.
//
// Con la atracción activada este número ya no es el grosor: es el ALCANCE. Fija
// hasta dónde llega la influencia de todo el trazo —hilos incluidos— y, con
// ella, dos cosas más: a qué distancia se atraen dos partes y CUÁNTO SE ESTIRA
// LA AGUJA de un vértice, que es proporcional al alcance dividido por lo cerrado
// del giro.
//
// Por eso puede subir mientras las cintas ADELGAZAN: son dos mandos distintos.
// El alcance alarga las puntas; el grosor lo pone la altura de la cúpula, en el
// lienzo. Antes iban juntos y no se podía tener lo uno sin lo otro.
//
// Pero tiene techo, y lo encontré pasándome: a 0,022 la atracción alcanzaba a
// casi todas las partes a la vez y la figura se fundía en un contorno liso, sin
// estructura por dentro. El alcance alarga las puntas y también se come los
// huecos.
//
// Baja de 0,017 a 0,015 junto con la subida de HILO, y las dos cosas van
// juntas: menos campo de unión es menos masa —medido, un 20% menos de superficie
// muy por dentro del umbral, que es el indicador de los bultos—, pero también
// menos soldadura, así que por sí solo PARTE más la figura. Es el hilo más
// gordo el que paga esa cuenta.
const GROSOR = 0.015;
// El mismo número, exportado: el lienzo lo necesita como referencia común de
// todos los trazos de la figura. Ver la prop `referencia`.
export const GROSOR_REFERENCIA = GROSOR;
// Lo fino que llega a ser un brazo, en fracción del más grueso.
//
// Bajó de 0,26 a 0,06. Con 0,26, el brazo de un disco poco votado seguía siendo
// una cinta con cuerpo, y las masas del centro salían de sumar cintas: quitando
// suelo, esos brazos pasan a ser hilos de verdad y el nudo central adelgaza. De
// paso, un vértice al que llega un hilo se cierra en aguja en vez de en cuña.
//
// Es lo que da el efecto pegajoso: un hilo que se acerca a un brazo grueso no se
// suma a él sin más, se le pega. El campo del lienzo funde a distancia, así que
// entre los dos se levanta una membrana cóncava, y esa membrana es mucho más
// ancha que el hilo y mucho más estrecha que el brazo. Con todos los brazos
// iguales esa tensión no existe, porque no hay nada más fino que se pegue a
// nada más grueso.
//
// Y aquí está el suelo de verdad. Con 0,06, el brazo más flojo se apoyaba en el
// mínimo de la horquilla de altura del lienzo, que vive a un 5% del umbral del
// campo: en cuanto ese brazo giraba, la suma bajaba, cruzaba el umbral y la
// cinta se PARTÍA, dejando el resto del recorrido como una pieza suelta. Medido
// sobre 123 tests: 10 figuras salían en trozos.
//
// Subiéndolo a 0,35 el brazo más flojo se apoya un poco más arriba y aguanta la
// curva. Sigue siendo un hilo al lado de una cinta —el reparto entre medias no
// se toca—, y es mejor arreglo que subir el suelo del lienzo, que engordaba
// TODOS los brazos menos uno y aplanaba el contraste entero.
//
// Medido con las dos cosas juntas —este hilo y el alcance a 0,015—: 0 figuras
// en trozos de 123, y menos masa que antes.
const HILO = 0.35;
// Puntos por tramo recto. El lienzo remuestrea por su cuenta, pero necesita
// bastantes puntos crudos para que su suavizado no redondee los vértices, que
// es justo donde nacen las puntas.
//
// Se exporta para la vista de esqueleto: un punto es un VÉRTICE del recorrido
// exactamente cuando su índice es múltiplo de esto.
export const POR_TRAMO = 14;
// Largo de la púa que sale de un vértice, en fracción del lienzo.
//
// Esto NO lo produce la fusión sola. El campo estira un vértice en aguja cuando
// el giro es muy cerrado, pero los vértices de esta figura son giros suaves, y
// ahí lo que sale es una esquina redondeada. La aguja hay que dibujarla: al
// llegar al vértice, el recorrido sale un poco hacia fuera y vuelve por donde ha
// venido.
//
// Y ese pico de ida y vuelta sí lo afila la fusión, porque es un giro de 180°:
// el más cerrado que hay. De un rabito corto sale una aguja larga.
//
// APARCADO EN CERO. Las púas quedaban irregulares —unas veces rematan bien y
// otras parecen un añadido— y se prefiere el trazo limpio mientras se afinan.
// El mecanismo se queda entero: subir este número las devuelve.
const PUA = 0;

// Hasta dónde se mira para saber si la línea se está doblando sobre sí misma.
// Ver adelgazarDondeSeAmontona.
const CERCA = 0.06;
// Puntos del recorrido por debajo de los cuales dos son simplemente vecinos.
const VECINO_INMEDIATO = 8;
// Cuánto tiene que acortar el camino la línea recta para considerar que la línea
// se ha doblado. Con 0,45, ir de un punto a otro por el aire cuesta menos de la
// mitad que ir caminando por la línea.
const DOBLEZ = 0.45;
// Lo fino que puede llegar a quedar el trazo en el peor amontonamiento, y lo
// corto que puede quedarse su alcance.
const ADELGAZA_MAX = 0.34;
const ALCANCE_MIN = 0.40;

// ── El afilado de los picos ───────────────────────────────────────────────
//
// El alcance del campo, repetido aquí a propósito: LienzoMetal lo exporta, pero
// importarlo metería un componente de React en este archivo, que es cálculo puro
// y se puede ejecutar fuera del navegador para medirlo. Si allí cambia, cambia
// aquí.
const ALCANCE_CAMPO = 3.6;
// Lo fino que queda el trazo justo en el pico, en fracción de su grosor.
const PICO = 0.18;
// La ventana del afilado, en veces el alcance del campo. Es la distancia en la
// que la fusión redondea una punta, así que el afilado tiene que empezar antes
// que ella: con menos, se afila dentro de la zona ya redondeada y no se nota.
const PICO_VENTANA = 2.2;
// A partir de qué cerrado está el giro se afila. 0 es seguir recto y 1 es
// darse la vuelta del todo. Por debajo de esto el vértice se queda redondo, que
// es lo que tiene que pasar: la gracia es que convivan los dos remates.
const PICO_DESDE = 0.35;
// Y el tope de la ventana como fracción del tramo más corto que llega al
// vértice, para que un brazo corto no se afile entero. Ver abajo.
const PICO_TRAMO = 0.4;
// A partir de qué grosor —en fracción del máximo— el brazo recibe el afilado
// entero. Por debajo, proporcional. Ver el cálculo de `cuerpo`.
const PICO_GRUESO = 0.6;

// Afila los vértices cerrados encogiendo el trazo por LOS DOS LADOS hasta el
// pico.
//
// Un vértice interior no tiene ningún afilado: el del lienzo actúa en los
// extremos del trazo, y por el medio el radio de las cúpulas se mantiene. Y una
// punta solo sale si el RADIO encoge —bajando la altura, la superficie termina
// siempre en casquete—, así que un giro cerrado se cerraba en una cápsula
// alargada y blanda en vez de en una aguja.
//
// Aquí se dibuja lo que el campo no hace solo: al acercarse al vértice el trazo
// adelgaza y acorta su alcance, y al salir vuelve a engordar. El resultado es
// una punta de verdad, y como el afilado va con lo CERRADO del giro, los
// vértices abiertos siguen saliendo redondeados.
function afilarPicos(trazo: Punto[]): Punto[] {
  const acum = [0];
  for (let i = 1; i < trazo.length; i++) {
    acum.push(acum[i - 1] + Math.hypot(trazo[i].x - trazo[i - 1].x, trazo[i].y - trazo[i - 1].y));
  }

  // Los vértices interiores, con lo cerrado de su giro. Van cada POR_TRAMO
  // puntos por construcción; las dos puntas del trazo se saltan porque el
  // lienzo ya las afila por su cuenta.
  const picos: { i: number; agudeza: number; ventana: number }[] = [];
  const ventanaMaxima = GROSOR * ALCANCE_CAMPO * PICO_VENTANA;
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
    // 1 = sigue recto, -1 = se da la vuelta. Se lleva a 0..1.
    const coseno = (ax * bx + ay * by) / (la * lb);

    // La ventana no puede comerse el brazo entero, y esto no es una precaución
    // teórica: con varios discos a cero los brazos se quedan en el radio mínimo
    // y miden MENOS que la ventana. Esos brazos se afilaban de punta a punta,
    // el trazo entero caía por debajo del umbral y el brazo se DESPRENDÍA de la
    // figura. Medido: 8 figuras de 123 salían en trozos por esto.
    //
    // Limitándola a una parte del tramo más corto que llega al vértice, el
    // afilado se queda donde tiene que estar —junto al pico— y el resto del
    // brazo conserva su grosor.
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
      // Lleno en el vértice y nada en el borde de la ventana, graduado además
      // por lo cerrado del giro.
      // El afilado va con el GROSOR del brazo, además de con lo cerrado del
      // giro. Un brazo gordo es el que forma masa y el que hay que romper; un
      // hilo ya llega fino al vértice y encima vive pegado al umbral del campo,
      // así que recortarlo más lo hunde por debajo y lo desprende. Por eso el
      // hilo apenas se afila: no le hace falta y no lo aguanta.
      const cuerpo = Math.min(1, p.r / (GROSOR * PICO_GRUESO));
      const fuerza = ((pico.agudeza - PICO_DESDE) / (1 - PICO_DESDE)) * cuerpo;
      factor = Math.min(factor, 1 - (1 - PICO) * fuerza * (1 - d / pico.ventana));
    }
    if (factor >= 1) return p;
    return {
      ...p,
      r: p.r * factor,
      // El alcance también, porque si no las dos ramas del pico se sueldan
      // entre ellas y rellenan justo el hueco que hace la punta. Con suelo: sin
      // nada de alcance, la punta se despegaría del brazo.
      a: Math.min(p.a ?? 1, Math.max(ALCANCE_MIN, factor)),
    };
  });
}

// Adelgaza el trazo, y le acorta el alcance, allí donde la línea se dobla sobre
// sí misma.
//
// Es lo que evita los lóbulos. El campo del lienzo funde a distancia, así que
// una ida y una vuelta que corren juntas se sueldan y el hueco entre ellas se
// rellena: en vez de dos líneas queda un bulto grueso y redondeado.
//
// La prueba no es "cuántos puntos tengo cerca" —los de al lado siempre lo
// están— sino si alguno está MUCHO MÁS CERCA EN EL ESPACIO QUE A LO LARGO DEL
// RECORRIDO. En un tramo recto, la distancia en línea recta y la distancia
// caminando por la línea son casi la misma; donde la línea se dobla, se separan,
// y esa diferencia es exactamente "aquí la línea vuelve sobre sus pasos".
//
// Esa comparación es la que faltaba en el primer intento: descartaba a los
// vecinos cercanos por el recorrido, y el lóbulo de un giro cerrado lo forman
// justo esos. Se descartaba la única señal que servía.
//
// Y no basta con adelgazar: hay que bajar también el ALCANCE. Desde que el
// alcance dejó de seguir al grosor —lo que hace que dos partes lejanas se
// atraigan—, dos líneas finas se sueldan igual que dos gruesas, porque su radio
// de influencia no ha cambiado. Adelgazando a secas, el lóbulo seguía saliendo:
// solo que más fino.
function adelgazarDondeSeAmontona(trazo: Punto[]): Punto[] {
  // Longitud acumulada: cuánto hay que caminar por la línea hasta cada punto.
  const acum = [0];
  for (let i = 1; i < trazo.length; i++) {
    acum.push(acum[i - 1] + Math.hypot(trazo[i].x - trazo[i - 1].x, trazo[i].y - trazo[i - 1].y));
  }

  return trazo.map((p, i) => {
    let cerca = 0;
    for (let j = 0; j < trazo.length; j++) {
      // Los inmediatos no dicen nada: siempre están pegados.
      if (Math.abs(i - j) < VECINO_INMEDIATO) continue;
      const q = trazo[j];
      const d = Math.hypot(q.x - p.x, q.y - p.y);
      if (d >= CERCA) continue;
      // Y si la distancia en línea recta se parece a la del camino, es que la
      // línea sigue de largo: no se ha doblado.
      if (d > Math.abs(acum[i] - acum[j]) * DOBLEZ) continue;
      cerca++;
    }
    if (!cerca) return p;
    // Cuantos más, más fino y más corto de alcance. Los dos con suelo: por
    // debajo de cierto punto el trazo dejaría de verse en vez de adelgazar, y
    // sin nada de alcance se rompería la unión con lo que sí toca.
    const aprieto = 1 / (1 + cerca * 0.05);
    return {
      ...p,
      r: p.r * Math.max(ADELGAZA_MAX, aprieto),
      a: Math.max(ALCANCE_MIN, aprieto),
    };
  });
}

// El reparto: de porcentajes a dónde cae cada cosa, antes de convertirlo en
// trazo.
//
// Está separado del tejido porque hay dos consumidores. La figura lo usa para
// dibujar el metal, y la vista de taller lo usa para dibujar el GRÁFICO del que
// sale: los siete ejes, hasta dónde llega cada uno y en qué orden los visita la
// línea. Calculándolo dos veces se irían separando en cuanto uno de los dos
// cambiara, y entonces el gráfico dejaría de explicar la figura.
//
// `pesos` no tiene por qué sumar 100 ni estar acotado: lo único que importa es
// la proporción entre unos y otros, porque la figura se NORMALIZA —el álbum más
// votado llega siempre al borde—. Sin normalizar, alguien que eligiera pocas
// canciones obtendría una figura diminuta, más pequeña que la distancia a la
// que el metal se funde, y saldría un borrón en vez de un símbolo. Lo que dice
// algo de una persona es el reparto entre discos, no cuántas canciones marcó.
function disponer(pesos: Record<Era, number>) {
  const maximo = Math.max(...ERAS.map((e) => pesos[e] || 0));
  // Nadie ha elegido nada: no hay figura que dibujar. Devolver algo aquí
  // pintaría un punto en medio del lienzo como si fuera un resultado.
  if (maximo <= 0) return null;

  const cx = 0.5;
  // El lienzo mide la y en fracción del ANCHO, no del alto. Que el centro
  // vertical sea también 0,5 no es casualidad ni descuido: es que el marco del
  // símbolo es CUADRADO —lo fija .testsim-simbolo en el CSS— porque la figura
  // es radial y en un marco apaisado saldría estirada. Si ese marco dejara de
  // ser cuadrado, este número deja de valer.
  const cy = 0.5;

  // Grosor del brazo de cada era, del hilo al máximo según lo votada que esté.
  const grosorDe = (era: Era) => {
    const proporcion = (pesos[era] || 0) / maximo;
    return GROSOR * (HILO + (1 - HILO) * proporcion);
  };

  // Cuánto sobresale la púa de cada vértice. Va CON los votos: la saca el disco
  // muy elegido, en la punta de su brazo largo, y no la sacan los flojos.
  //
  // Antes iba al revés y producía una roseta. Los discos sin votos se colocan
  // todos a la misma distancia corta del centro —el radio mínimo—, así que
  // están amontonados; dándoles a ELLOS la púa más larga, salían media docena de
  // agujas naciendo casi del mismo punto y radiando en abanico. Eso no es el
  // recorrido de porcentajes, es un adorno que se monta encima de él.
  //
  // Repartidas al revés, las agujas caen en las puntas de los brazos largos, que
  // es donde hay sitio y donde de verdad rematan algo. Y el umbral deja sin púa
  // a todo lo que se acerque al montón del centro.
  const puaDe = (era: Era) => {
    const proporcion = (pesos[era] || 0) / maximo;
    if (proporcion < 0.34) return 0;
    return PUA * proporcion;
  };

  const punto = (era: Era): [number, number] => {
    const i = ERAS.indexOf(era);
    // Se empieza arriba y se gira a favor del reloj.
    const angulo = (-90 + (i * 360) / ERAS.length) * (Math.PI / 180);
    const proporcion = (pesos[era] || 0) / maximo;
    // El mínimo se suma por debajo en vez de sustituir: así un disco con una
    // canción sigue quedando por delante de uno con ninguna, que es lo que
    // hace que el reparto se siga leyendo en la forma.
    const radio = EXTENSION * (RADIO_MINIMO + (1 - RADIO_MINIMO) * proporcion);
    return [cx + radio * Math.cos(angulo), cy + radio * Math.sin(angulo)];
  };

  // Ahora se visitan los SIETE, de más votado a menos. Los empates —y los ceros
  // lo son entre sí— se deshacen por el orden de la discografía, que es un
  // criterio fijo: sin él, dos personas con las mismas respuestas podrían
  // obtener figuras distintas según cómo hubiera ordenado el navegador.
  const recorrido = [...ERAS].sort(
    (a, b) => (pesos[b] || 0) - (pesos[a] || 0) || ERAS.indexOf(a) - ERAS.indexOf(b)
  );

  // El recorrido principal, vértice a vértice y con su grosor al lado. Los del
  // centro se quedan con el del brazo que sale o entra por ellos, para que el
  // cambio ocurra a lo largo del brazo y no de golpe en el centro.
  const vertices: [number, number][] = [[cx, cy]];
  const grosores: number[] = [grosorDe(recorrido[0])];
  for (const era of recorrido) {
    vertices.push(punto(era));
    grosores.push(grosorDe(era));
  }
  vertices.push([cx, cy]);
  grosores.push(grosorDe(recorrido[recorrido.length - 1]));

  // Las púas, cada una como TRAZO APARTE. Y esto es lo que las hace afiladas.
  //
  // Metidas dentro del recorrido principal —saliendo del vértice y volviendo—
  // la punta quedaba en mitad del trazo, así que no pasaba por el afilado de
  // extremos y salía como un pegote redondo. Un trazo suelto tiene dos extremos,
  // y el afilado encoge el RADIO de las cúpulas a lo largo de ellos, que es lo
  // único que produce un pico: bajando solo la altura, la superficie termina
  // siempre en casquete.
  //
  // Arrancan EN el vértice, no por dentro del brazo.
  //
  // Metiéndolas hacia dentro pasaba algo que no había previsto: un trazo suelto
  // se afila por sus DOS extremos, y como la púa va en dirección radial mientras
  // que el brazo en ese vértice va en diagonal, el extremo interior sacaba su
  // propia aguja cruzada respecto al brazo. Las dos puntas opuestas juntas se
  // veían como una pajarita clavada en cada vértice.
  //
  // Naciendo en el vértice, ese extremo interior queda justo donde convergen los
  // dos tramos del recorrido y el campo es más alto, así que la suma se lo traga
  // y solo queda la punta de fuera.
  const puas: [number, number][][] = [];
  const grosoresPua: number[][] = [];
  // Y en qué momento del trazado le toca a cada una: cuando la línea principal
  // llegue a su vértice. Sin esto, al dibujarse la figura las púas asomaban
  // sueltas por el lienzo antes de que llegara el trazo del que salen.
  const desdePua: number[] = [];
  for (const era of recorrido) {
    const largo = puaDe(era);
    if (largo <= 0.004) continue;
    const [vx, vy] = punto(era);
    const d = Math.hypot(vx - cx, vy - cy) || 1;
    const ux = (vx - cx) / d;
    const uy = (vy - cy) / d;
    puas.push([
      [vx, vy],
      [vx + ux * largo, vy + uy * largo],
    ]);
    // La púa hereda el grosor DEL BRAZO del que sale, y adelgaza hacia la
    // punta. Así una era floja saca una aguja de pelo y una fuerte una de
    // cuerpo, en vez de salir todas iguales y desentonar con su propio brazo.
    grosoresPua.push([grosorDe(era), grosorDe(era) * 0.4]);
    // El vértice de esta era es el (i+1)-ésimo de los que recorre la línea, y la
    // línea tiene un tramo por vértice más el de vuelta al centro.
    desdePua.push((recorrido.indexOf(era) + 1) / (recorrido.length + 1));
  }

  // Encaje: se lleva la figura al centro del lienzo y se escala para que ocupe
  // siempre lo mismo.
  //
  // Sin esto, el tamaño y la posición dependían de qué eras se hubieran elegido:
  // una figura tirando a un solo lado se iba a esa esquina y dejaba media
  // pantalla vacía, y una de radios parecidos ocupaba el doble que otra de
  // radios pequeños. Midiendo su caja y ajustándola, todas llegan igual de
  // grandes y centradas, y lo que las distingue pasa a ser su FORMA, que es lo
  // único que debería distinguirlas.
  //
  // Se mide sobre TODO, púas incluidas: si no, las púas se saldrían del marco.
  const todos = [...vertices, ...puas.flat()];
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
    maximo,
    recorrido,
    punto,
    encajar,
    vertices,
    grosores,
    puas,
    grosoresPua,
    desdePua,
  };
}

// El gráfico del que sale la figura, ya encajado sobre el lienzo: los siete
// ejes completos, la marca de cada era en su eje y el orden en que la línea los
// visita.
//
// Es material de taller —lo pinta el interruptor "Trazo"— y existe porque el
// recorrido es difícil de reconstruir mirando el metal: al fundirse, dos tramos
// que se cruzan parecen uno, y un brazo que pasa cerca de otro parece que
// termina ahí. Con los ejes y los números delante se ve lo que hay: dónde
// empieza, en qué orden va y que vuelve al mismo sitio del que salió.
export type Grafico = {
  centro: [number, number];
  ejes: { era: Era; punta: [number, number] }[];
  marcas: { era: Era; en: [number, number]; orden: number; peso: number }[];
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
      en: d.encajar(d.punto(era)),
      // 1 es el primero que visita la línea, 7 el último.
      orden: d.recorrido.indexOf(era) + 1,
      peso: pesos[era] || 0,
    })),
  };
}

export function figuraDeEras(pesos: Record<Era, number>): TrazoHecho[] {
  const d = disponer(pesos);
  if (!d) return [];
  const { vertices, grosores, puas, grosoresPua, desdePua, encajar } = d;

  // De poligonal a trazo, muestreando cada tramo e interpolando el grosor.
  const tejer = (
    vs: [number, number][],
    gs: number[],
    sinEntrada = false,
    desde = 0
  ): TrazoHecho => {
    const trazo: Punto[] = [];
    for (let i = 0; i < vs.length - 1; i++) {
      const [x1, y1] = encajar(vs[i]);
      const [x2, y2] = encajar(vs[i + 1]);
      const r1 = gs[i];
      const r2 = gs[i + 1];
      for (let n = 0; n < POR_TRAMO; n++) {
        const t = n / POR_TRAMO;
        trazo.push({
          x: x1 + (x2 - x1) * t,
          y: y1 + (y2 - y1) * t,
          r: r1 + (r2 - r1) * t,
        });
      }
    }
    const [fx, fy] = encajar(vs[vs.length - 1]);
    trazo.push({ x: fx, y: fy, r: gs[gs.length - 1] });
    return { puntos: trazo, sinEntrada, desde };
  };

  // El principal va primero: es el que fija el alcance del conjunto, y es el
  // único al que se le pasa el adelgazado —las púas son cortas y no se doblan
  // sobre sí mismas.
  //
  // Las púas van con el arranque SIN afilar: no empiezan en el aire, brotan del
  // brazo, y afilar esa base las convertía en dardos posados encima.
  //
  // El orden importa: primero se afilan los picos y luego se busca el
  // amontonamiento. Al revés, el adelgazado mediría el trazo gordo y marcaría
  // como amontonado un pico que el afilado ya iba a separar.
  //
  // Y el principal no se afila por donde EMPIEZA. El afilado de extremos está
  // pensado para un trazo que nace en el aire, y este nace en el centro y va a
  // volver exactamente al mismo punto: afilándolo, la línea se apagaba antes de
  // llegar y el símbolo parecía no arrancar del centro ni cerrarse en él.
  //
  // El final se afila o no según el momento: mientras se está trazando, ese
  // extremo es la CABEZA del trazo y tiene que ir en punta; cuando la figura
  // está entera, deja de serlo y se cierra sobre el arranque. Eso lo decide
  // quien anima. Ver `sinSalida` en la pantalla del símbolo.
  const principal = tejer(vertices, grosores, true);
  return [
    { ...principal, puntos: adelgazarDondeSeAmontona(afilarPicos(principal.puntos)) },
    ...puas.map((p, i) => tejer(p, grosoresPua[i], true, desdePua[i])),
  ];
}
