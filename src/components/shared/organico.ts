// Degradado "orgánico" animado: el color de cada categoría, pero como varias
// manchas que derivan en vez de un barrido plano. Lo usan las cápsulas de la
// home y las tarjetas de proyecto, así que vive aquí y no dentro de una de las
// dos: si se retoca, cambia en los dos sitios.
//
// Va siempre en trío — degradado, tamaño y animación capsuleDrift—, porque el
// movimiento no está en el degradado sino en desplazar sus capas.

// Pseudoaleatorio estable a partir de un texto. Estable importa: con
// Math.random, cada repintado le cambiaría el ritmo a la animación y se
// verían saltos.
//
// Es FNV-1a con la mezcla final de MurmurHash3, y no el clásico h*31 + letra.
// Ese daba resultados casi idénticos para ids que solo se diferencian en el
// último carácter —"i1" e "i5" salían 0,19640 y 0,19644—, porque la última
// letra aporta una millonésima frente al acumulado. Con ids como los de los
// proyectos, que comparten prefijo, eso dejaba a todas las piezas con el mismo
// ritmo y la animación se veía sincronizada en vez de suelta. La mezcla final
// es justo lo que reparte esa diferencia por todos los bits.
export function seeded(id: string, salt: number): number {
  let h = (2166136261 ^ salt) >>> 0;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h ^= h >>> 15;
  h = Math.imul(h, 2246822507);
  h ^= h >>> 13;
  h = Math.imul(h, 3266489909);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

// Las manchas son CUATRO y se van lejos del color de partida, que es lo que le
// da relieve. Antes las tres se movían entre el tono base y +25, con catorce
// puntos de luz de la más clara a la más oscura: a esa distancia todas eran
// casi el mismo color y el resultado se leía como una mancha plana.
//
// Ahora el abanico es de 90 grados de tono —de -42 a +48 alrededor del color de
// la categoría— y de 42 puntos de luz, y cada mancha sube o baja también de
// saturación. Es el reparto de una esfera de verdad: una luz que tira a un lado
// del círculo cromático, una sombra que tira al otro y se va a oscuro, y un
// reflejo de rebote abajo. La categoría se sigue reconociendo porque el tono de
// partida manda en las cuatro y en el fondo liso.
//
// Los topes no son adorno: sin ellos, una categoría de luz alta —las cápsulas
// encendidas van a 57— se iría a blanco en la zona de luz y el nombre en blanco
// que va encima dejaría de leerse.
const tono = (h: number) => Math.round((h + 360) % 360);
const satura = (s: number) => Math.min(96, Math.max(42, Math.round(s)));
// El techo es 70 y no más arriba por el texto: el nombre va en blanco encima, y
// un amarillo claro —que es donde cae el tono contrario de las categorías
// cálidas— se lo come. 70 es justo lo más claro que llegaba a haber antes, así
// que el contraste crece por abajo y por el tono, no aclarando.
const luz = (l: number) => Math.min(70, Math.max(15, Math.round(l)));

export function organicGradient(hue: number, sat: number, base: number): string {
  return [
    // La luz principal, arriba a la izquierda: el tono se va hacia atrás en el
    // círculo y sube de saturación y de claridad.
    `radial-gradient(47% 42% at 22% 24%, hsl(${tono(hue - 42)},${satura(sat + 20)}%,${luz(base + 16)}%) 0%, transparent 62%)`,
    // El tono contrario, arriba a la derecha: es el que mete el segundo color y
    // saca al degradado de ser un solo tinte aclarado y oscurecido.
    `radial-gradient(44% 44% at 82% 16%, hsl(${tono(hue + 48)},${satura(sat + 14)}%,${luz(base)}%) 0%, transparent 58%)`,
    // La sombra, abajo a la derecha, y bien abajo: es la que da el volumen.
    `radial-gradient(55% 52% at 72% 88%, hsl(${tono(hue + 16)},${satura(sat + 6)}%,${luz(base - 26)}%) 0%, transparent 66%)`,
    // El rebote de abajo a la izquierda, pequeño y encendido: el brillo suelto
    // que tienen estas esferas en la esquina que no toca ni la luz ni la sombra.
    `radial-gradient(35% 35% at 14% 84%, hsl(${tono(hue - 16)},${satura(sat + 24)}%,${luz(base + 8)}%) 0%, transparent 54%)`,
    `linear-gradient(hsl(${tono(hue + 6)},${satura(sat)}%,${luz(base)}%), hsl(${tono(hue + 6)},${satura(sat)}%,${luz(base)}%))`,
  ].join(", ");
}

// Los mismos cinco colores, sueltos y sin degradado: es lo que se le pasa al
// degradado de malla del shader, que no quiere un dibujo hecho sino la paleta
// para amasarla él. Van en el mismo orden que las capas de arriba —el fondo
// primero y las cuatro manchas después—, así que las dos versiones de una
// categoría se parecen aunque una la pinte el CSS y la otra WebGL.
export function paletaOrganica(hue: number, sat: number, base: number): string[] {
  return [
    `hsl(${tono(hue + 6)},${satura(sat)}%,${luz(base)}%)`,
    `hsl(${tono(hue - 42)},${satura(sat + 20)}%,${luz(base + 16)}%)`,
    `hsl(${tono(hue + 48)},${satura(sat + 14)}%,${luz(base)}%)`,
    `hsl(${tono(hue + 16)},${satura(sat + 6)}%,${luz(base - 26)}%)`,
    `hsl(${tono(hue - 16)},${satura(sat + 24)}%,${luz(base + 8)}%)`,
  ];
}

// ── La paleta LEGIBLE, para lo que lleva texto encima ──────────────────────
//
// EL PROBLEMA. Un degradado de varios tonos que además se mueve no tiene UN
// contraste: tiene uno distinto en cada punto y en cada instante. Elegir el
// color del texto a partir del color «de la categoría» —que es lo que se hacía—
// mide contra algo que ya no está detrás de las letras. Midiendo de verdad las
// cinco manchas de cada categoría, ninguna de las siete llegaba al 4,5:1 que
// pide la norma en su punto peor: la mejor se quedaba en 3,7 y varias en 1,3.
// Y no se arregla eligiendo mejor el color del texto: probadas todas las
// luminosidades de banda, no hay ninguna en la que el blanco o la tinta valgan
// para las siete a la vez. El tono, por sí solo, ya mueve la luminancia: un
// cian y un azul de la misma luminosidad HSL se llevan cuatro veces en brillo.
//
// LA SALIDA. Igualar la LUMINANCIA de las cinco manchas y dejar que lo que se
// mueva sea el tono. A cada mancha se le busca la luminosidad a la que su
// luminancia da el número pedido, así que todas pesan lo mismo de luz aunque
// una sea verde y otra azul: el degradado se sigue viendo cambiar de color —que
// es lo que se ve— y el contraste del texto pasa a ser un número fijo y
// conocido en toda la superficie y en todo momento.
//
// A 0,155 el contraste con el blanco es de 5,1:1 en cualquier punto, por encima
// del 4,5 que pide la AA para texto normal. Subirlo aclara los colores y baja
// el contraste; bajarlo los oscurece y lo sube.
export const LUMINANCIA_BANDA = 0.155;

// ── Y LA BANDA CLARA, para lo que lleva el texto en tinta ───────────────────
//
// El naranja es el único color de la paleta que no sobrevive a la banda oscura.
// Un azul bajado de luz sigue siendo azul y un violeta sigue siendo violeta,
// pero un naranja bajado de luz es marrón, y un amarillo es caqui: no son el
// mismo color apagado, son otro color. Así que para que Fotografía se vea
// naranja de verdad no hay que tocar su tono, hay que dejar de oscurecerlo, y
// eso solo se puede hacer si el nombre de encima va en negro en vez de en
// blanco.
//
// 0,34 da 6,7:1 contra la tinta en el punto peor del degradado, por encima del
// 4,5 de la norma. Y es 0,34 y no más arriba porque de 0,40 para allá el
// naranja se lava: llega a ser clarito, pero deja de ser naranja y se queda en
// arena. Este es el punto donde el color está más encendido sin que la tinta
// baje del listón.
export const LUMINANCIA_CLARA = 0.34;

// EL ABANICO DE LA BANDA CLARA SE CIERRA a menos de la mitad del normal, y esto
// es lo que hace que se vea naranja y no barro. Con el abanico de siempre, la
// mancha más abierta cae 34 grados por encima del tono base, o sea en pleno
// amarillo verdoso, y ese tono a esta luz es oliva. Cerrándolo, las cinco
// manchas se quedan entre el 19 y el 46 —del naranja encendido al ámbar— y el
// degradado varía dentro de la familia en vez de salirse de ella.
// La saturación sube a 90 por lo mismo: es lo que separa un naranja de un
// terracota.
const ABANICO_CLARO = 0.3;
const SATURACION_CLARA = 90;

/** El degradado de una categoría de banda clara, la que lleva el texto en tinta. */
export function degradadoClaro(hue: number): string {
  return degradadoLegible(hue, SATURACION_CLARA, ABANICO_CLARO, LUMINANCIA_CLARA);
}
/** Sus cinco colores sueltos, para el shader. */
export function paletaClara(hue: number): string[] {
  return paletaLegible(hue, SATURACION_CLARA, ABANICO_CLARO, LUMINANCIA_CLARA);
}

// ── LOS ROJOS NO SE VAN AL LADRILLO ─────────────────────────────────────────
//
// El mismo problema de antes, visto desde el otro lado. El abanico de una
// categoría se abre 34 grados por encima de su tono, y para un rojo esos 34
// grados son naranja; bajado a la luz de la banda oscura, ese naranja es
// marrón. Por eso Editorial mezclaba rojos con marrones: no era un color de la
// paleta, era su propia mancha más abierta.
//
// Un rojo tiene salida hacia el otro lado que un ámbar no tiene: bajando de
// tono se va al granate y al vino, que siguen siendo rojo oscuro y además es
// exactamente lo que se le pide a la sombra de un rojo. Así que en vez de
// dejarle subir, se le da la vuelta al abanico: lo que se pasaba de rojo por
// arriba vuelve por abajo.
//
// Solo entran aquí los tonos que SON rojos de partida, del 340 al 15. El rosa
// de Branding está en el 330 y se queda fuera a propósito: su abanico sube
// hacia el coral, que es otra cosa y ahí sí funciona.
const TOPE_ROJO = 8;
function sinLadrillo(base: number, h: number): number {
  const esRojo = base >= 340 || base <= 15;
  if (!esRojo) return h;
  // La distancia respecto al tono de partida, medida por el camino corto, que
  // es lo que evita que un 355 y un 5 parezcan estar a 350 grados.
  const d = ((h - base + 540) % 360) - 180;
  return d > TOPE_ROJO ? base - (d - TOPE_ROJO) : h;
}

// Luminancia relativa de un color HSL, tal y como la define la norma de
// contraste: se pasa a RGB, se le quita la curva de la pantalla y se pesan los
// tres canales según lo que aporta cada uno a lo que el ojo llama brillo —el
// verde, casi tres cuartas partes—.
function luminancia(h: number, s: number, l: number): number {
  const sn = s / 100;
  const ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ln - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const recta = (v: number) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  return 0.2126 * recta(r + m) + 0.7152 * recta(g + m) + 0.0722 * recta(b + m);
}

// La luminosidad HSL a la que ese tono y esa saturación dan la luminancia
// pedida. Por tanteo partiendo el intervalo en dos: la luminancia sube siempre
// con la luminosidad, así que veinte pasadas bastan para clavarlo.
function luzParaLuminancia(h: number, s: number, objetivo: number): number {
  let bajo = 0;
  let alto = 100;
  for (let i = 0; i < 20; i++) {
    const medio = (bajo + alto) / 2;
    if (luminancia(h, s, medio) < objetivo) bajo = medio;
    else alto = medio;
  }
  return (bajo + alto) / 2;
}

// Las cinco manchas de una categoría, con el mismo peso de luz todas.
// `abanico` encoge o abre el reparto de tonos alrededor del de la categoría:
// a 1 es el de la paleta normal —90 grados—, y más bajo junta los colores.
function capasLegibles(hue: number, sat: number, abanico: number, objetivo: number) {
  const capas: [number, number][] = [
    [6, 0],
    [-42, 20],
    [48, 14],
    [16, 6],
    [-16, 24],
  ];
  return capas.map(([dh, ds]) => {
    const h = tono(sinLadrillo(hue, hue + dh * abanico));
    const s = satura(sat + ds * abanico);
    return { h, s, l: luzParaLuminancia(h, s, objetivo) };
  });
}

export function paletaLegible(hue: number, sat = 70, abanico = 0.7, objetivo = LUMINANCIA_BANDA): string[] {
  return capasLegibles(hue, sat, abanico, objetivo).map(c => `hsl(${c.h},${c.s}%,${c.l.toFixed(1)}%)`);
}

// El mismo color en degradado de CSS, para lo que se ve mientras el lienzo se
// funde y para cuando no hay WebGL. Sin esto se veía un destello del color
// claro de la paleta normal antes de que entrara el oscuro de esta.
export function degradadoLegible(hue: number, sat = 70, abanico = 0.7, objetivo = LUMINANCIA_BANDA): string {
  const c = capasLegibles(hue, sat, abanico, objetivo);
  const col = (i: number) => `hsl(${c[i].h},${c[i].s}%,${c[i].l.toFixed(1)}%)`;
  return [
    `radial-gradient(47% 42% at 22% 24%, ${col(1)} 0%, transparent 62%)`,
    `radial-gradient(44% 44% at 82% 16%, ${col(2)} 0%, transparent 58%)`,
    `radial-gradient(55% 52% at 72% 88%, ${col(3)} 0%, transparent 66%)`,
    `radial-gradient(35% 35% at 14% 84%, ${col(4)} 0%, transparent 54%)`,
    `linear-gradient(${col(0)}, ${col(0)})`,
  ].join(", ");
}

// Las manchas se pintan más grandes que su caja para que al desplazarse no
// asome el borde. Son cinco medidas porque el degradado son cinco capas, y
// capsuleDrift mueve esas cinco: si se añade o quita una, hay que tocar las
// tres cosas a la vez.
//
// Y el dibujo mide 250 %, no 150, para que el RECORRIDO sea largo: lo que se
// puede desplazar una capa es la diferencia entre el dibujo y la caja, así que
// a 150 la mancha se movía media caja —un temblor— y a 250 se mueve caja y
// media. Ahí sí entra un color por un lado, cruza y se va por el otro.
//
// El tamaño de las manchas se bajó en la misma proporción (de 78 % del dibujo a
// 47 %), así que en pantalla se ven IGUAL DE GRANDES que antes: lo que cambia
// es cuánto viajan, no cuánto ocupan.
export const CAPSULE_DRIFT_SIZE = "250% 250%, 240% 260%, 270% 260%, 230% 250%, 100% 100%";

// Ritmo propio para cada elemento, a partir de su id. El desfase es negativo
// para que la animación arranque ya empezada y no salgan todas sincronizadas.
export function drift(id: string): { animation: string } {
  // Entre 11 y 19 segundos. Antes eran de 4 a 7,5: con el recorrido largo, a esa
  // velocidad los colores pasaban barriendo y se leía como un parpadeo. Lo que
  // se busca es que un color entre despacio, se quede un rato y se vaya.
  const dur = 11 + seeded(id, 17) * 8;
  const delay = -(seeded(id, 53) * dur);
  return { animation: `capsuleDrift ${dur.toFixed(2)}s ease-in-out ${delay.toFixed(2)}s infinite` };
}
