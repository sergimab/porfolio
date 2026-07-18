// Flags de efectos visuales. Permiten volver al "haz de luz" clásico si hace
// falta, sin borrar código.
//
//  - "pixels": nuevo efecto de píxeles (fondo + hover)
//  - "beam":   haz de luz clásico (HoverTrail)
export const EFFECTS = {
  /** Fondo de píxeles animado con blast al pulsar. */
  backgroundPixels: true,
  /** Efecto de hover en botones y cajas: "pixels" o "beam". */
  hover: "beam" as "pixels" | "beam",
};
