// Las siete eras, en el orden en que salieron los discos.
//
// Es el orden que fija dónde cae cada eje alrededor del círculo, y por tanto el
// que hace que el camino se cruce consigo mismo. Cambiarlo cambia todas las
// figuras.
//
// AQUÍ VIVÍA EL GENERADOR ANTERIOR: ochocientas líneas que repartían los votos,
// tejían el recorrido, afilaban los vértices y separaban los cruces para luego
// levantar un campo de cúpulas y cortarlo por un umbral. Se fue entero. La forma
// la hace ahora formaGaga —barras rectas unidas en inglete, con el redondeo de
// los rincones hecho en la tarjeta gráfica— y el volumen, LienzoGaga.
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
