// El plató del símbolo: un estudio de cromo, neutro.
//
// Sale de mirar los siete símbolos de Blender. Son cromo pulido sobre un fondo
// neutro: el cuerpo va del blanco al gris acero recorriendo cada brazo, el
// horizonte cruza los montantes como una línea limpia, y el único color es un
// hilo de rojo y cian en los filos que pone la dispersión, no la habitación.
//
// Hace falta uno propio porque los otros tres no valen aquí, y los tres se
// probaron: el iridiscente tiene el suelo coral y con los faldones inclinados
// tiñe la pieza de magenta; el de la portada trae grises lilas y un par de
// focos cálidos que se concentran en las zonas planas de los nudos y los dejan
// con manchas amarillas; y el del vidrio es una habitación clara pensada para
// que la pieza salga casi blanca.
//
// La regla del sitio: un metal devuelve lo que le rodea, así que el material no
// se pinta, se le cambia la habitación.
export function crearEstudioCromo(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 512;
  const ctx = c.getContext("2d")!;

  // Cielo claro y suelo medio, con el horizonte CORTADO EN SECO. Ese corte es
  // lo que se convierte, sobre cada montante redondeado, en la línea que lo
  // recorre a lo largo separando la parte clara de la oscura: la firma del
  // cromo. Difuminarlo lo borra y la pieza sale como plástico gris.
  const fondo = ctx.createLinearGradient(0, 0, 0, c.height);
  fondo.addColorStop(0, "#ffffff");
  fondo.addColorStop(0.3, "#f2f4f7");
  fondo.addColorStop(0.47, "#dde2e9");
  fondo.addColorStop(0.5, "#3c434c"); // horizonte
  fondo.addColorStop(0.56, "#59626d");
  fondo.addColorStop(0.74, "#767f8a"); // el rebote del suelo
  fondo.addColorStop(0.9, "#4a525b");
  fondo.addColorStop(1, "#333a42");
  ctx.fillStyle = fondo;
  ctx.fillRect(0, 0, c.width, c.height);

  // Fuentes blancas anchas sobre el cielo, para que la pieza tenga blanco puro
  // y no un gris parejo.
  ctx.filter = "blur(26px)";
  for (const [x, y, w, h] of [
    [20, 0, 330, 150],
    [400, 20, 260, 120],
    [720, 0, 290, 145],
  ]) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x, y, w, h);
  }

  // Y los montantes oscuros entre ellas, que son los que hacen el dibujo: cada
  // uno se convierte, al reflejarse sobre un brazo curvo, en una línea que lo
  // cruza. Sin ellos el reflejo es una papilla clara sin filo.
  ctx.filter = "blur(7px)";
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = "rgba(18,22,28,0.9)";
    ctx.fillRect(44 + i * 128, 0, 16 + (i % 3) * 10, 236);
  }

  // El destello junto a cada montante: el hilo duro que delata que la
  // superficie es pulida y no mate.
  ctx.filter = "blur(2px)";
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.fillRect(44 + i * 128 - 6, 8, 4, 220);
  }
  ctx.filter = "none";
  return c;
}
