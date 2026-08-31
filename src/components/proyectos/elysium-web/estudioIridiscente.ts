// El plató que se refleja en los símbolos del fondo.
//
// Es hermano del que usa el lienzo de metal, pero NO el mismo, y la diferencia
// es el encargo: aquel es un plató de estudio neutro, gris y blanco, porque el
// símbolo que dibujas tiene que leerse como acero. Este es multicolor, como el
// render original de Blender, donde el cromo tira a verde azulado y coral.
//
// El color va en el ENTORNO y no en el material del objeto, que es como
// funciona un metal de verdad: un metal no tiene color propio, devuelve el de
// lo que le rodea. Tiñendo el material saldría plástico pintado; tiñendo el
// plató, sale cromo en una habitación de colores.
//
// Lo que hace que se lea como metal, y no como una mancha de colores, es el
// CONTRASTE: el corte seco del horizonte y los montantes oscuros entre las
// masas de luz. Al reflejarse sobre una superficie curva, esos bordes duros se
// convierten en las cintas nítidas que recorren la pieza. Con un degradado
// suave de arcoíris saldría una pompa de jabón, no cromo.
export function crearEstudioIridiscente(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 512;
  const ctx = c.getContext("2d")!;

  // Cielo y suelo con el horizonte cortado en seco, igual que en el plató
  // neutro, pero recorriendo la gama del aceite sobre agua: blanco arriba,
  // verde azulado en la banda alta, coral por debajo del horizonte y negro en
  // el nadir.
  const fondo = ctx.createLinearGradient(0, 0, 0, c.height);
  fondo.addColorStop(0, "#ffffff");
  fondo.addColorStop(0.18, "#d8fbf4");
  fondo.addColorStop(0.32, "#7fe3d6"); // verde azulado, el dominante
  fondo.addColorStop(0.44, "#2fa79c");
  fondo.addColorStop(0.495, "#0d5f5c"); // horizonte
  fondo.addColorStop(0.5, "#1b1020");
  fondo.addColorStop(0.58, "#7a3352"); // el coral asoma por debajo
  fondo.addColorStop(0.66, "#c96f7a");
  fondo.addColorStop(0.76, "#4a2036");
  fondo.addColorStop(1, "#040406");
  ctx.fillStyle = fondo;
  ctx.fillRect(0, 0, c.width, c.height);

  // Masas de luz grandes y de colores distintos. Son ellas las que se estiran a
  // lo largo de cada brazo, y que cada una tenga su color es lo que hace que la
  // pieza cambie de tono según por dónde se la mire.
  ctx.filter = "blur(30px)";
  const cajas: [number, number, number, number, string][] = [
    [40, 10, 300, 150, "#ffffff"],
    [330, 30, 260, 120, "#8ff5e6"],  // verde azulado
    [620, 0, 300, 140, "#ffffff"],
    [180, 190, 280, 80, "#ff9ec4"],  // rosa
    [560, 200, 240, 70, "#9ad9ff"],  // azul frío
    [850, 170, 180, 90, "#ffd8a8"],  // cálido, para que no sea todo frío
  ];
  for (const [x, y, w, h, color] of cajas) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  }

  // Montantes oscuros de borde definido: son los que cortan las masas de luz.
  // Sin ellos el reflejo es una papilla de color; con ellos hay filo.
  ctx.filter = "blur(6px)";
  for (let i = 0; i < 7; i++) {
    const x = 40 + i * 148;
    ctx.fillStyle = "rgba(3,4,8,0.94)";
    ctx.fillRect(x, 0, 18 + (i % 3) * 12, 250);
  }

  // Y el filo especular junto a cada montante: el destello que recorre el canto
  // cuando la pieza gira, que es lo que delata que la superficie es dura.
  ctx.filter = "blur(2px)";
  for (let i = 0; i < 7; i++) {
    ctx.fillStyle = "rgba(255,255,255,0.96)";
    ctx.fillRect(40 + i * 148 - 6, 8, 4, 236);
  }

  // Rebote del suelo, tirando a coral, para que la mitad de abajo no se vaya a
  // negro del todo y conserve algo de color.
  ctx.filter = "blur(24px)";
  ctx.fillStyle = "rgba(226,150,150,0.45)";
  ctx.fillRect(0, 262, c.width, 30);
  ctx.filter = "none";
  return c;
}
