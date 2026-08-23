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

export function organicGradient(hue: number, sat: number, base: number): string {
  return [
    `radial-gradient(130% 110% at 20% 30%, hsl(${hue},${sat}%,${base + 14}%) 0%, transparent 60%)`,
    `radial-gradient(110% 130% at 80% 15%, hsl(${hue + 25},${sat - 6}%,${base + 4}%) 0%, transparent 55%)`,
    `radial-gradient(140% 150% at 65% 85%, hsl(${hue},${sat - 10}%,${base - 14}%) 0%, transparent 62%)`,
    `linear-gradient(hsl(${hue},${sat}%,${base}%), hsl(${hue},${sat}%,${base}%))`,
  ].join(", ");
}

// Las manchas se pintan más grandes que su caja para que al desplazarse no
// asome el borde. Son cuatro medidas porque el degradado son cuatro capas, y
// capsuleDrift mueve esas cuatro: si se añade o quita una, hay que tocar las
// tres cosas a la vez.
export const CAPSULE_DRIFT_SIZE = "190% 190%, 200% 210%, 210% 200%, 100% 100%";

// Ritmo propio para cada elemento, a partir de su id. El desfase es negativo
// para que la animación arranque ya empezada y no salgan todas sincronizadas.
export function drift(id: string): { animation: string } {
  const dur = 4 + seeded(id, 17) * 3.5;
  const delay = -(seeded(id, 53) * dur);
  return { animation: `capsuleDrift ${dur.toFixed(2)}s ease-in-out ${delay.toFixed(2)}s infinite` };
}
