// El plató del símbolo mientras se forma y en la pantalla del test.
//
// La referencia es una pieza de vidrio pulido sobre un fondo oscuro verdoso:
// blanca casi entera, con las líneas del canto repitiéndose hacia dentro y
// destellos de arcoíris en los filos.
//
// La habitación es CLARA, y esto lo razoné al revés la primera vez. Como la
// pieza va sobre el negro del universo, monté un plató oscuro con unas pocas
// fuentes brillantes —que es como se fotografía el vidrio de verdad— y el
// símbolo salió casi negro. El fallo es de bulto: un metal devuelve lo que le
// rodea, así que una pieza que tiene que verse BLANCA necesita estar rodeada de
// blanco. Lo oscuro del fondo de la pantalla no pinta nada en esto.
//
// Lo que dibuja las líneas no son las fuentes: son las BANDAS OSCURAS entre
// ellas. Muchas, estrechas y de borde seco. Cada una se convierte, al
// reflejarse sobre un montante curvo, en una línea que lo recorre; y con las
// capas del sombreado repitiendo el canto hacia dentro, salen las tres o cuatro
// líneas paralelas de la referencia.
export function crearEstudioVidrio(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 512;
  const ctx = c.getContext("2d")!;

  // El fondo, oscuro y con el verde grisáceo de la referencia. El horizonte se
  // corta igual que en los otros platós: ese corte es lo que se convierte en la
  // línea que separa el cielo del suelo sobre cada superficie curva.
  const fondo = ctx.createLinearGradient(0, 0, 0, c.height);
  fondo.addColorStop(0, "#ffffff");
  fondo.addColorStop(0.34, "#f4f9f8");
  fondo.addColorStop(0.46, "#dfe9e7");
  fondo.addColorStop(0.495, "#18211f"); // horizonte, cortado en seco
  fondo.addColorStop(0.5, "#0d1413");
  fondo.addColorStop(0.68, "#26332f");  // el verde grisáceo de la referencia
  fondo.addColorStop(0.86, "#121a19");
  fondo.addColorStop(1, "#060909");
  ctx.fillStyle = fondo;
  ctx.fillRect(0, 0, c.width, c.height);

  // Un par de fuentes aún más blancas sobre el cielo ya claro, para que la
  // pieza tenga zonas de blanco puro y no un gris parejo.
  ctx.filter = "blur(20px)";
  const focos: [number, number, number, number, string][] = [
    [40, 0, 340, 170, "#ffffff"],
    [420, 10, 240, 130, "#ffffff"],
    [720, 0, 280, 165, "#ffffff"],
    [200, 296, 340, 54, "#cfe6e0"],  // rebote del suelo
  ];
  for (const [x, y, w, h, color] of focos) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  }

  // Separadores oscuros muy marcados. En un plató de vidrio son las varillas
  // negras entre los difusores, y son ellas las que hacen el dibujo: cuantas
  // más y más contrastadas, más líneas recorren la pieza.
  ctx.filter = "blur(3px)";
  for (let i = 0; i < 10; i++) {
    ctx.fillStyle = "rgba(2,4,4,0.96)";
    ctx.fillRect(52 + i * 100, 0, 16 + (i % 3) * 8, 240);
  }

  // Y el filo especular junto a cada separador: el destello duro que delata que
  // la superficie es pulida y no mate.
  ctx.filter = "blur(1px)";
  for (let i = 0; i < 10; i++) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(52 + i * 100 - 5, 6, 4, 228);
  }
  ctx.filter = "none";
  return c;
}
