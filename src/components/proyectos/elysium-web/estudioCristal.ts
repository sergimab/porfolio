// El plató que se refleja en el símbolo generado.
//
// Es el tercero de la familia, y cada uno existe por un encargo distinto:
//
//  · El de estudio (en LienzoMetal) es neutro y gris: hace que lo que dibujas
//    con el dedo se lea como acero.
//  · El iridiscente (estudioIridiscente) va muy saturado: hace que los símbolos
//    del fondo se lean como el cromo tornasolado del render de Blender.
//  · Este es el de en medio, y va a por VIDRIO.
//
// La diferencia con el iridiscente no es de intensidad, es de reparto. Allí el
// color está en el decorado, así que la pieza se tiñe de lo que la rodea. Aquí
// el decorado es casi blanco y negro —muy contrastado, con el horizonte cortado
// en seco y filos especulares muy vivos— y el color lo pone la DISPERSIÓN, que
// separa los tres canales al doblarse el rayo. Que es lo que hace un cristal de
// verdad: no está pintado de colores, descompone la luz blanca.
//
// Por eso este archivo tiene tan poco color y el material aun así sale con
// franjas de rojo, verde y azul en cada canto.
//
// El suelo no es negro del todo, y no por descuido: con el nadir a cero la
// mitad inferior de la pieza se apagaba entera y el resultado se leía como
// plástico oscuro con los bordes de colores. Un vidrio real siempre tiene algo
// de luz rebotada por debajo.
export function crearEstudioCristal(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 512;
  const ctx = c.getContext("2d")!;

  // Cielo claro, horizonte cortado en seco y suelo hundido. El corte es lo que
  // al reflejarse sobre una superficie curva da la línea nítida que separa lo
  // encendido de lo apagado, y sin esa línea no hay vidrio ni metal: hay
  // plástico.
  const fondo = ctx.createLinearGradient(0, 0, 0, c.height);
  fondo.addColorStop(0, "#ffffff");
  fondo.addColorStop(0.2, "#ffffff");
  fondo.addColorStop(0.36, "#eef4ff");
  fondo.addColorStop(0.47, "#b9c8da");
  fondo.addColorStop(0.495, "#5a6674"); // horizonte
  fondo.addColorStop(0.5, "#20262f");
  fondo.addColorStop(0.6, "#48535f");
  fondo.addColorStop(0.72, "#252b34");
  fondo.addColorStop(1, "#05060a");
  ctx.fillStyle = fondo;
  ctx.fillRect(0, 0, c.width, c.height);

  // Masas de luz grandes y BLANCAS. Un par llevan un tinte levísimo, lo justo
  // para que el vidrio no salga completamente incoloro y muerto; si se subiera
  // más, volveríamos al tornasol del que se quiere huir.
  ctx.filter = "blur(26px)";
  const cajas: [number, number, number, number, string][] = [
    [30, 0, 320, 165, "#ffffff"],
    [370, 20, 250, 130, "#ffffff"],
    [650, 0, 330, 150, "#ffffff"],
    [150, 190, 300, 80, "#ffffff"],
    [560, 195, 250, 70, "#fffaf2"],
    [860, 175, 160, 85, "#ffffff"],
  ];
  for (const [x, y, w, h, color] of cajas) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  }

  // Montantes muy oscuros y de borde duro. En vidrio importan todavía más que
  // en metal: cada canto refracta el borde tres veces, una por canal, y de ese
  // triple borde salen las franjas de color. Sobre un fondo sin cortes no
  // habría nada que descomponer.
  ctx.filter = "blur(3px)";
  for (let i = 0; i < 9; i++) {
    const x = 20 + i * 115;
    ctx.fillStyle = "rgba(2,3,5,0.97)";
    ctx.fillRect(x, 0, 14 + (i % 3) * 10, 252);
  }

  // Y los filos especulares, muy vivos y muy estrechos: el destello que recorre
  // el canto al girar la pieza.
  ctx.filter = "blur(1px)";
  for (let i = 0; i < 9; i++) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(20 + i * 115 - 5, 6, 3, 240);
  }

  // Rebote del suelo, neutro y tenue.
  ctx.filter = "blur(22px)";
  ctx.fillStyle = "rgba(205,215,230,0.55)";
  ctx.fillRect(0, 258, c.width, 26);
  ctx.filter = "none";
  return c;
}
