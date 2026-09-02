// El plató que se refleja en el símbolo cuando va dentro de la portada.
//
// Es hermano del iridiscente que usan los iconos flotando en el espacio, y la
// diferencia es dónde está la pieza. Aquel es un plató turquesa y coral, que
// funciona sobre el negro del universo; metido en la caja rosa y violeta de la
// carátula, el mismo símbolo salía oscuro y rojizo, como si fuera de otra
// fotografía.
//
// Un metal no tiene color propio: devuelve el de lo que le rodea. Así que para
// que la pieza pertenezca a la portada, lo que hay que cambiar no es su
// material sino la habitación donde se refleja. Aquí la habitación es la propia
// carátula: rosas, lilas, y mucho blanco arriba.
//
// Y el blanco es lo que más importa. En la referencia el símbolo se lee como
// CROMO CLARO, casi blanco, y eso solo sale si la mitad de arriba del plató es
// luminosa de verdad: un metal en una habitación oscura sale oscuro por muy
// brillante que sea su material.
export function crearEstudioPortada(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 512;
  const ctx = c.getContext("2d")!;

  // Cielo casi blanco con el horizonte cortado en seco. El corte es lo que se
  // convierte, al reflejarse en una superficie curva, en la línea nítida que
  // recorre cada montante; con un degradado suave saldría una pompa de jabón.
  const fondo = ctx.createLinearGradient(0, 0, 0, c.height);
  fondo.addColorStop(0, "#ffffff");
  fondo.addColorStop(0.2, "#fdf2fb");
  fondo.addColorStop(0.34, "#f0c9e6");  // el rosa del cuerpo
  fondo.addColorStop(0.44, "#c79ad8");  // lila
  fondo.addColorStop(0.495, "#3a2352"); // horizonte
  fondo.addColorStop(0.5, "#241436");
  fondo.addColorStop(0.6, "#4a2a63");
  fondo.addColorStop(0.72, "#8e5f9e");
  fondo.addColorStop(0.85, "#2a1636");
  fondo.addColorStop(1, "#0d0714");
  ctx.fillStyle = fondo;
  ctx.fillRect(0, 0, c.width, c.height);

  // Masas de luz grandes: son las que se estiran a lo largo de cada montante.
  // Aquí van casi todas claras —blanco, rosa pálido, lila— porque lo que se
  // busca es cromo claro y no una pieza de colores.
  ctx.filter = "blur(30px)";
  const cajas: [number, number, number, number, string][] = [
    [20, 0, 340, 170, "#ffffff"],
    [340, 20, 280, 130, "#ffe6f7"],
    [610, 0, 330, 160, "#ffffff"],
    [140, 185, 300, 80, "#e9b8ff"],  // lila, en la banda baja del cielo
    [520, 195, 260, 70, "#ffb9dd"],  // rosa
    [820, 175, 190, 90, "#b9d9ff"],  // un frío para que el blanco no sea plano
  ];
  for (const [x, y, w, h, color] of cajas) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  }

  // Montantes oscuros de borde definido. Son los que cortan las masas de luz, y
  // sin ellos el reflejo es una papilla clara sin filo. Van más separados y algo
  // más estrechos que en el plató del espacio: la pieza tiene que salir clara,
  // así que se le quita sombra.
  ctx.filter = "blur(6px)";
  for (let i = 0; i < 6; i++) {
    const x = 60 + i * 172;
    ctx.fillStyle = "rgba(26,10,40,0.9)";
    ctx.fillRect(x, 0, 14 + (i % 3) * 10, 250);
  }

  // Y el filo especular junto a cada montante: el destello que recorre el canto
  // cuando la pieza gira, que es lo que delata que la superficie es dura.
  ctx.filter = "blur(2px)";
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = "rgba(255,255,255,0.98)";
    ctx.fillRect(60 + i * 172 - 6, 8, 5, 236);
  }

  // Rebote del suelo, rosado, para que la mitad de abajo de la pieza no se vaya
  // a negro y siga perteneciendo a la carátula.
  ctx.filter = "blur(24px)";
  ctx.fillStyle = "rgba(255,180,220,0.5)";
  ctx.fillRect(0, 262, c.width, 34);
  ctx.filter = "none";
  return c;
}
