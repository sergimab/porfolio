import type { TrazoHecho } from "@/components/proyectos/elysium/LienzoMetal";

// El recorte del trazado, compartido por el símbolo y por los marcos líquidos.
//
// Es el equivalente a un trim path: la línea es siempre la misma, lo que cambia
// es hasta dónde se dibuja. Y como el lienzo afila el extremo final de todo
// trazo, el punto donde se corta sale en punta, igual que la cabeza de un trazo
// que se está dibujando.
export function recortar(figura: TrazoHecho[], avance: number): TrazoHecho[] {
  if (avance <= 0) return [];
  if (avance >= 1) return figura;
  // Sin mínimo forzado: hasta que no hay dos puntos de verdad no se dibuja
  // nada. Forzando dos, en el primer fotograma ya aparecía una mancha diminuta
  // —el lienzo pinta cualquier trazo, por corto que sea— y el arranque se veía
  // como un parpadeo seguido de una espera, en vez de como una línea que
  // empieza a salir de la nada.
  return figura
    .map((trazo) => {
      // Cada trazo tiene su TURNO dentro de la animación: empieza cuando le
      // toca y termina antes de que empiece el siguiente. Sin turnos, una
      // figura de varias piezas crecería toda a la vez desde sitios distintos,
      // que no se lee como trazar sino como aparecer.
      const desde = trazo.desde ?? 0;
      const hasta = trazo.hasta ?? 1;
      const propio = hasta <= desde ? 1 : (avance - desde) / (hasta - desde);
      // Mientras se está trazando, el extremo que avanza es la CABEZA y tiene
      // que ir en punta aunque el trazo acabado no se afile ahí. En cuanto le
      // llega su final, recupera su remate de verdad.
      const enCurso = propio < 1;
      return {
        ...trazo,
        sinSalida: enCurso ? false : trazo.sinSalida,
        puntos:
          propio <= 0
            ? []
            : trazo.puntos.slice(0, Math.round(trazo.puntos.length * Math.min(1, propio))),
      };
    })
    .filter((trazo) => trazo.puntos.length >= 2);
}

// Un avance de 0 a 1 con entrada y salida suaves, y el aviso de cuándo termina.
//
// Va aparte del componente que lo usa porque el símbolo y los marcos hacen
// exactamente lo mismo con él, y porque respetar `prefers-reduced-motion` es
// algo que se olvida en cuanto se copia y pega.
export function animarAvance(
  duracion: number,
  poner: (v: number) => void,
  alTerminar?: () => void
): () => void {
  // Sin animación, la figura aparece hecha. No es una versión pobre: para quien
  // pide menos movimiento, ver la figura es el resultado y trazarla es el
  // adorno.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    poner(1);
    alTerminar?.();
    return () => {};
  }
  let raf = 0;
  let inicio = 0;
  const paso = (t: number) => {
    if (!inicio) inicio = t;
    const p = Math.min(1, (t - inicio) / duracion);
    // Arranca sin tirón y llega al final frenando, que es como se termina un
    // trazo a mano.
    poner(p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
    if (p < 1) raf = requestAnimationFrame(paso);
    else alTerminar?.();
  };
  raf = requestAnimationFrame(paso);
  return () => cancelAnimationFrame(raf);
}
