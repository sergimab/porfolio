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
    `radial-gradient(78% 70% at 22% 24%, hsl(${tono(hue - 42)},${satura(sat + 20)}%,${luz(base + 16)}%) 0%, transparent 62%)`,
    // El tono contrario, arriba a la derecha: es el que mete el segundo color y
    // saca al degradado de ser un solo tinte aclarado y oscurecido.
    `radial-gradient(74% 74% at 82% 16%, hsl(${tono(hue + 48)},${satura(sat + 14)}%,${luz(base)}%) 0%, transparent 58%)`,
    // La sombra, abajo a la derecha, y bien abajo: es la que da el volumen.
    `radial-gradient(92% 86% at 72% 88%, hsl(${tono(hue + 16)},${satura(sat + 6)}%,${luz(base - 26)}%) 0%, transparent 66%)`,
    // El rebote de abajo a la izquierda, pequeño y encendido: el brillo suelto
    // que tienen estas esferas en la esquina que no toca ni la luz ni la sombra.
    `radial-gradient(58% 58% at 14% 84%, hsl(${tono(hue - 16)},${satura(sat + 24)}%,${luz(base + 8)}%) 0%, transparent 54%)`,
    `linear-gradient(hsl(${tono(hue + 6)},${satura(sat)}%,${luz(base)}%), hsl(${tono(hue + 6)},${satura(sat)}%,${luz(base)}%))`,
  ].join(", ");
}

// Las manchas se pintan más grandes que su caja para que al desplazarse no
// asome el borde. Son cinco medidas porque el degradado son cinco capas, y
// capsuleDrift mueve esas cinco: si se añade o quita una, hay que tocar las
// tres cosas a la vez.
//
// Alrededor del 150 % y no del 200 %: con el doble de tamaño, la caja solo
// enseña un cuarto del dibujo, y en una cápsula —que mide 130 × 32— eso era casi
// siempre el interior de UNA mancha. O sea, un color plano, justo lo contrario
// de lo que se busca. A 150 se ve más de la mitad del dibujo y las cuatro
// manchas se pisan dentro de la caja, que es de donde sale el relieve.
export const CAPSULE_DRIFT_SIZE = "150% 150%, 145% 160%, 165% 155%, 140% 150%, 100% 100%";

// Ritmo propio para cada elemento, a partir de su id. El desfase es negativo
// para que la animación arranque ya empezada y no salgan todas sincronizadas.
export function drift(id: string): { animation: string } {
  const dur = 4 + seeded(id, 17) * 3.5;
  const delay = -(seeded(id, 53) * dur);
  return { animation: `capsuleDrift ${dur.toFixed(2)}s ease-in-out ${delay.toFixed(2)}s infinite` };
}
