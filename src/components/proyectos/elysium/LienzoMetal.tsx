"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useLang } from "@/components/shared/useLang";
import LienzoFluido from "./LienzoFluido";
import "./LienzoFluido.css";

// Lienzo de metal líquido.
//
// El dibujo no se pinta directamente: se construye en un canvas oculto un
// MAPA DE ALTURA, y de él sale todo lo demás.
//
// El campo es una INTEGRAL A LO LARGO DEL RECORRIDO: cada tramo de la línea
// aporta una cúpula, y TODAS se suman —las del mismo trazo entre sí y las de
// unos trazos con otros—, cada una pesando lo que mide su tramo. Eso último es
// lo que lo hace funcionar; conviene entender por qué.
//
// Si se sumaran las cúpulas a secas, el campo mediría la densidad de puntos, y
// como el puntero entrega más puntos cuando vas despacio, el grosor acabaría
// midiendo la velocidad. Pesando cada cúpula por la longitud que representa, la
// suma deja de depender de cómo se muestreó la línea y pasa a depender solo de
// la línea. Y se normaliza para que una recta larga y sola valga exactamente 1:
// así una cinta suelta es siempre igual de ancha, vaya deprisa o despacio, se
// dibuje con diez puntos o con mil.
//
// De ahí sale todo lo demás, sin una sola regla añadida:
//
//  · Una recta vale 1 de punta a punta: PAREJA. Antes esto había que forzarlo.
//  · En un RINCÓN cerrado las dos ramas están a distancia parecida de los
//    puntos del exterior, así que ahí se suman las dos y el campo aguanta por
//    encima del umbral mucho más lejos: el vértice se estira en una AGUJA,
//    tanto más larga cuanto más cerrado el giro. Es la forma que define la
//    referencia, y es pura geometría: no hay código de esquinas.
//  · Donde el trazo VUELVE sobre sí mismo, o donde pasa otro trazo, las dos
//    faldas se suman y entre ellos nace una masa más ancha que cualquiera de
//    los dos, que cierra los huecos pequeños. Antes esto había que detectarlo a
//    mano contando ramas vecinas; ahora es el mismo mecanismo.
//  · En un EXTREMO libre solo hay línea por un lado, así que el campo cae a la
//    mitad y la punta se cierra sola en pico.
//
// Un solo mecanismo para las cuatro cosas. Antes eran tres, y peleaban.
//
// Después, un desenfoque en dos pasadas redondea las uniones —su radio es el
// del filete cóncavo que las suelda— y la pendiente del campo en cada píxel
// da la normal: hacia dónde mira la superficie ahí. La pendiente, y no el
// valor: desde que los trazos se suman, el valor del campo ya no dice a qué
// distancia del borde estás.
//
// Con la normal se hace óptica de verdad en el shader: reflejar la vista
// contra un panorama de estudio (de ahí las cintas que recorren el metal),
// con el rayo desviado un pelo en cada canal para la aberración cromática, y
// Fresnel para que el filo se encienda al sesgo. Es opaco: metal, no vidrio.
//
// Es lo mismo que hace un render 3D, pero sobre un relieve deducido del
// dibujo en vez de una malla.

// Horquilla ancha entre ir despacio y ir rápido: un barrido veloz deja un hilo
// y uno lento un cuerpo con carne. Es variación por VELOCIDAD, no por dirección
// —eso era la plumilla, y se quitó—, así que no impone una silueta al trazo:
// solo lo hace más o menos delgado.
//
// El mínimo ya puede bajar mucho: con el campo normalizado, un hilo vale 1 en
// su eje igual que una cinta ancha, así que no se parte por fino que sea. Antes
// no: el hilo apenas asomaba por encima del umbral y el desenfoque lo rompía a
// trozos, y por eso el suelo estaba en 2,6.
const GROSOR_MAX = 13;
const GROSOR_MIN = 1.4;
const VELOCIDAD_TOPE = 1.4;
const SUAVIZADO = 0.22;
const AFILADO = 4.4;        // >1 afila; a más valor, la punta adelgaza antes
const PUNTA_MIN = 0.12;
// Longitud de cada punta, en múltiplos del radio.
//
// Cuanto más larga, más aguja y menos cono: la punta adelgaza durante más
// recorrido y acaba en un filo mucho más fino. Estuvo en 22 y era pasarse —el
// trazo tardaba en aparecer—, pero el problema era la punta de ENTRADA, no la
// de salida; ahora que van por separado, la de salida puede ser larga.
const LARGO_PUNTA = 12;
// Y la punta de ENTRADA es más corta que la de salida: al bajar el lápiz el
// trazo llega a su cuerpo enseguida, y es al levantarlo cuando se afila largo.
//
// El valor tiene dos límites, uno por arriba y otro por abajo. Muy largo (como
// estaba, igual que la salida) y el trazo tarda en aparecer. Pero muy corto
// tampoco vale: la parte fina de la punta no llega a superar el umbral, así que
// no se dibuja, y lo que se ve es un corte redondeado en vez de una punta. Hace
// falta recorrido suficiente para que el afilado se vea antes de desaparecer.
const ENTRADA_CORTA = 0.32;
const SUAVIZAR_PASADAS = 3; // pasadas de suavizado del recorrido
const PASO_REMUESTREO = 2;  // separación, en px, al reconstruir la curva
// Puntos que se vuelven a procesar por detrás al pintar el tramo nuevo del
// trazo en curso, para que el suavizado empalme sin costura.
const SOLAPE_VIVO = 30;

// Aquí hubo una plumilla: el grosor cambiaba según la dirección del trazo,
// como una pluma de punta ancha inclinada. Se ha quitado a conciencia. Ese es
// un gesto CALIGRÁFICO, y competía con el mecanismo que de verdad da la forma:
// en la referencia la línea que dibujas es un pelo parejo, y todo el modelado
// —dónde engorda, dónde se estrecha, dónde se cierra un hueco— sale de cómo se
// funden unos trazos con otros. Con la plumilla encima, el trazo ya llegaba
// con una silueta propia y ensuciaba la que producía la fusión.
const MAX_PUNTOS = 24000;

// ── La normalización de la integral ───────────────────────────────────────
//
// El perfil de cada cúpula es (1 - d/R)^1,6. Su integral a lo largo de una
// recta que pase por el centro vale 2R/(1,6+1) = 0,769·R. Así que, para que la
// suma de todas las cúpulas de una recta larga valga exactamente 1 en su eje,
// cada una tiene que pesar paso/(0,769·R), donde "paso" es el trozo de línea
// que representa. Eso es todo el truco, y es lo que hace el campo independiente
// de cuántos puntos entregue el puntero.
const NORMA_LINEA = 0.769;
// Cúpulas por radio de influencia.
//
// Aquí hay que ser generoso, y no por el campo en sí: el shader deduce la
// normal de la PENDIENTE del campo, así que amplifica cualquier rizado. Con
// seis, un ondulado invisible a simple vista en el mapa —del orden de un nivel
// de 255— salía en el metal como un moteado a lo largo del brazo. Con diez, el
// rizado cae muy por debajo de eso y de paso el ruido de trama con que el
// navegador dibuja los degradados se promedia entre más cúpulas. Sigue siendo
// más barato que antes, que iba a un cuarto del grosor (unas catorce por radio).
const MUESTRAS_POR_R = 10;
// Y en qué parte del rango del canvas cae ese 1. No puede ser 1: el interés
// está justo en lo que pasa POR ENCIMA —dos ramas que convergen valen 2, tres
// valen 3—, y si el 1 tocara techo, todo lo que fusiona quedaría recortado
// contra el mismo blanco y no habría fusión que ver. Con 0,55 caben 1,8 veces
// una línea sola antes de saturar, que cubre las uniones; solo se recorta el
// corazón de las masas más gruesas, y ahí el relieve ya lo saca la pendiente.
const ESCALA_CAMPO = 0.55;

// ALCANCE separa dos cosas que hasta ahora eran la misma: lo ANCHO que se ve
// un trazo y lo LEJOS que llega su influencia. Cada cúpula se pinta con un
// radio ALCANCE veces mayor que el grosor del trazo, pero el umbral corta muy
// por encima de su falda, así que un trazo solo sigue viéndose como una cinta
// fina: casi toda su cúpula queda por debajo del corte, invisible.
//
// Lo invisible es justo lo que hace el efecto. Cuando otro trazo pasa cerca,
// las dos faldas se suman y el hueco entre ellos supera el corte de golpe: se
// sueldan desde lejos, con una masa mucho más ancha que cualquiera de los dos,
// y los huecos pequeños se cierran solos. Es el comportamiento de un líquido
// con tensión superficial, y es de donde salen las formas de la referencia.
//
// Con ALCANCE = 1 volveríamos a lo de antes: trazos que solo engordan donde
// literalmente se pisan.
//
// Ahora manda además el LARGO DE LAS AGUJAS. En un rincón de medio ángulo α, el
// campo se mantiene mientras la distancia a las dos ramas quepa dentro del
// alcance, así que la punta llega hasta ~R/sen α: cuanto mayor el alcance, más
// larga la aguja del vértice. Es el mismo número para las dos cosas porque son
// la misma: lo que suelda dos trazos de lejos es lo que estira una esquina.
const ALCANCE = 3.6;
// Umbral del shader, en unidades de campo (1 = una recta sola). Sale de dónde
// quiere cortarse la falda: con 0,68 la media anchura visible cae en 1/3,6 del
// alcance, o sea justo el grosor pedido. No está calculado a mano —la mezcla de
// paradas de un degradado de canvas no es exactamente la potencia teórica—, sino
// medido sobre el perfil que sale de verdad. Se guarda en unidades de campo y se
// multiplica por la escala al pasarlo al shader: si se toca ESCALA_CAMPO, el
// umbral se recoloca solo en vez de descuadrar la silueta.
const UMBRAL_CAMPO = 0.68;

// Los puntos se guardan en coordenadas relativas al lienzo (0-1 en x, y la
// misma escala en y), no en píxeles. En móvil, al arrastrar el dedo la barra
// del navegador se oculta y el alto del lienzo cambia: con píxeles, todo lo
// dibujado se descolocaba respecto al dedo. Con coordenadas relativas, el
// trazo sigue donde debe pase lo que pase con el tamaño.
type Punto = { x: number; y: number; r: number };

// Suaviza el recorrido promediando cada punto con sus vecinos. El puntero
// entrega una poligonal temblorosa; sin esto, el trazo sale con microacodos
// que el metal delata en forma de reflejos rotos.
function suavizar(puntos: Punto[], pasadas: number): Punto[] {
  let salida = puntos;
  for (let p = 0; p < pasadas; p++) {
    if (salida.length < 3) return salida;
    const siguiente: Punto[] = [salida[0]];
    for (let i = 1; i < salida.length - 1; i++) {
      const a = salida[i - 1];
      const b = salida[i];
      const c = salida[i + 1];
      siguiente.push({
        x: (a.x + b.x * 2 + c.x) / 4,
        y: (a.y + b.y * 2 + c.y) / 4,
        r: (a.r + b.r * 2 + c.r) / 4,
      });
    }
    siguiente.push(salida[salida.length - 1]);
    salida = siguiente;
  }
  return salida;
}

// Reconstruye el recorrido como una curva de Catmull-Rom muestreada a paso
// constante. El puntero entrega los puntos donde le pilla el reloj —muy
// juntos si vas lento, muy separados si aceleras—, y esa irregularidad se ve
// en el metal como facetas. Al remuestrear, la línea queda pareja.
function remuestrear(puntos: Punto[], paso: number): Punto[] {
  if (puntos.length < 3) return puntos;
  const salida: Punto[] = [];
  const en = (i: number) => puntos[Math.max(0, Math.min(puntos.length - 1, i))];

  for (let i = 0; i < puntos.length - 1; i++) {
    const p0 = en(i - 1);
    const p1 = en(i);
    const p2 = en(i + 1);
    const p3 = en(i + 2);
    const tramo = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    const trozos = Math.max(1, Math.ceil(tramo / paso));
    for (let k = 0; k < trozos; k++) {
      const t = k / trozos;
      const t2 = t * t;
      const t3 = t2 * t;
      // Catmull-Rom: la curva pasa por los puntos y usa los vecinos para
      // decidir con qué inclinación llega a cada uno.
      const cr = (a: number, b: number, c: number, d: number) =>
        0.5 * ((2 * b) + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      salida.push({
        x: cr(p0.x, p1.x, p2.x, p3.x),
        y: cr(p0.y, p1.y, p2.y, p3.y),
        r: cr(p0.r, p1.r, p2.r, p3.r),
      });
    }
  }
  salida.push(puntos[puntos.length - 1]);
  return salida;
}

// Aquí vivían tres funciones que ya no hacen falta, y merece la pena decir por
// qué se fueron las tres a la vez: las tres corregían a mano el grosor punto a
// punto, y con el campo normalizado el grosor de un trazo ya es constante.
//
//  · pulirGrosor y limitarPendiente alisaban un grosor que cambiaba tramo a
//    tramo. Ya no cambia: hay uno solo para todo el trazo.
//  · marcarConvergencia buscaba con una rejilla espacial las ramas que pasaban
//    cerca de cada punto para engordar los cruces. Eso lo hace ahora la propia
//    suma, que era el sitio donde tenía que estar: la masa del cruce sale de
//    que dos ramas sumen, no de que las contemos.

// Afilado por longitud recorrida, no por porcentaje del trazo. La diferencia
// importa: con un porcentaje, la punta crece con el trazo y, mientras dibujas,
// el extremo que está bajo el cursor tiene grosor cero — parece que la línea
// se queda atrás. Con una longitud fija, la punta mide siempre lo mismo.
function factorPunta(
  distanciaAlExtremo: number,
  radio: number,
  largoTotal: number,
  proporcion = 1
): number {
  // La punta nunca ocupa más de un tercio del trazo: si no, en una línea
  // corta las dos puntas se juntan y la línea desaparece.
  //
  // El suelo de 1 px no es adorno: en el primer fotograma de un trazo solo hay
  // un punto, el trazo mide cero, y sin él esto divide cero entre cero. Lo que
  // sale de ahí no es un número, y acaba en el radio de un degradado.
  const largo = Math.max(1, Math.min(Math.max(8, radio * LARGO_PUNTA * proporcion), largoTotal / 3));
  const t = Math.min(1, distanciaAlExtremo / largo);
  // El exponente va por encima de 1: así el grosor se desploma cerca del
  // extremo y la punta sale como una aguja. Por debajo de 1 haría lo
  // contrario, engordar enseguida y quedar roma.
  // El suavizado previo redondea además el empalme con el cuerpo, que con la
  // potencia sola llegaba en ángulo.
  const suave = t * t * (3 - 2 * t);
  return Math.pow(suave, AFILADO * 0.75);
}

// Estudio equirectangular generado por código: un panorama 2:1 donde la
// horizontal es el giro alrededor y la vertical va del cenit al nadir. Lleva
// lo que tendría un plató real —techo claro, suelo oscuro, softboxes y tiras
// de luz—, porque son esas formas, y no un degradado, las que al reflejarse
// dibujan las cintas del cromo.
function crearEstudio(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 512;
  const ctx = c.getContext("2d")!;

  // Cielo y suelo, con el horizonte cortado en seco. Ese corte es la clave
  // del cromo: al reflejarse sobre una superficie curva se convierte en la
  // línea nítida que separa la mitad clara de la oscura en cada pieza. Con un
  // degradado suave en su lugar, el metal sale gris y sin carácter.
  const fondo = ctx.createLinearGradient(0, 0, 0, c.height);
  fondo.addColorStop(0, "#ffffff");
  fondo.addColorStop(0.34, "#f4f7fb");
  fondo.addColorStop(0.46, "#c8d2de");
  fondo.addColorStop(0.495, "#8e9099"); // horizonte
  fondo.addColorStop(0.5, "#2a2622");
  fondo.addColorStop(0.62, "#59544d"); // suelo, con un punto de calidez
  fondo.addColorStop(0.78, "#2b2520");
  fondo.addColorStop(1, "#050505");
  ctx.fillStyle = fondo;
  ctx.fillRect(0, 0, c.width, c.height);

  // Softboxes: pocos y muy grandes. En la referencia el metal refleja masas
  // amplias de luz, no una retícula: son esas masas las que se estiran a lo
  // largo del trazo y dan las cintas limpias.
  ctx.filter = "blur(28px)";
  const cajas: [number, number, number, number, string][] = [
    [60, 20, 380, 150, "#ffffff"],
    [560, 0, 420, 130, "#ffffff"],
    [200, 200, 300, 70, "#ffffff"],
    [700, 220, 240, 60, "#eef4ff"],
  ];
  for (const [x, y, w, h, color] of cajas) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  }

  // Montantes oscuros, separados y de borde bastante definido: son ellos los
  // que cortan las masas de luz. El metal se lee como metal por el CONTRASTE
  // entre zonas encendidas y apagadas que se persiguen sobre la superficie; con
  // un panorama suave sale un plástico gris. Por eso van poco desenfocados.
  ctx.filter = "blur(5px)";
  for (let i = 0; i < 6; i++) {
    const x = 60 + i * 172;
    ctx.fillStyle = "rgba(4,5,7,0.95)";
    ctx.fillRect(x, 0, 22 + (i % 3) * 14, 250);
  }

  // Y un par de filos muy brillantes junto a los montantes: el reflejo
  // especular que recorre el canto cuando la pieza gira.
  ctx.filter = "blur(2px)";
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.fillRect(60 + i * 172 - 7, 10, 5, 232);
  }

  // Franja clara justo debajo del horizonte: es el rebote del suelo, y es lo
  // que evita que la mitad inferior del metal se vaya a negro del todo.
  ctx.filter = "blur(20px)";
  ctx.fillStyle = "rgba(216,206,194,0.5)";
  ctx.fillRect(0, 262, c.width, 26);
  ctx.filter = "none";
  return c;
}

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

// Desenfoque separable: se aplica en horizontal y luego en vertical, que sale
// mucho más barato que un desenfoque en dos dimensiones de una sola pasada.
// Sin declarar la precisión: Three inyecta la que soporte el dispositivo. Al
// fijar "highp" a mano, en los móviles que no la admiten en el fragmento el
// shader no compila y no se dibuja nada.
const BLUR = /* glsl */ `
  varying vec2 vUv;
  uniform sampler2D uTex;
  uniform vec2 uPaso;
  void main() {
    float suma = 0.0;
    suma += texture2D(uTex, vUv - uPaso * 4.0).r * 0.028;
    suma += texture2D(uTex, vUv - uPaso * 3.0).r * 0.065;
    suma += texture2D(uTex, vUv - uPaso * 2.0).r * 0.121;
    suma += texture2D(uTex, vUv - uPaso).r       * 0.175;
    suma += texture2D(uTex, vUv).r               * 0.198;
    suma += texture2D(uTex, vUv + uPaso).r       * 0.175;
    suma += texture2D(uTex, vUv + uPaso * 2.0).r * 0.121;
    suma += texture2D(uTex, vUv + uPaso * 3.0).r * 0.065;
    suma += texture2D(uTex, vUv + uPaso * 4.0).r * 0.028;
    // Alfa a 1, no al valor del campo. Con el valor, el material mezclaba el
    // resultado consigo mismo al escribirlo y cada pasada lo elevaba al
    // cuadrado: entre las dos, el campo salía a la cuarta. No se notaba
    // mientras las cúpulas eran blancas —uno a la cuarta sigue siendo uno—,
    // pero hunde cualquier valor por debajo de 1, que es justo lo que
    // necesitan las metaballs para tener margen al sumarse.
    gl_FragColor = vec4(suma, suma, suma, 1.0);
  }
`;

const FRAGMENT = /* glsl */ `
  varying vec2 vUv;
  uniform sampler2D uCampo;   // mapa de altura ya desenfocado
  uniform vec2  uRes;
  uniform float uUmbral;      // dónde corta la silueta
  uniform float uRelieve;     // pendiente de los faldones del tejadillo
  uniform float uFilo;        // cuánto vuelca el canto en el filo mismo
  uniform float uGrano;       // pendiente a la que el faldón ya está a tope
  uniform float uDispersion;  // cuánto se separan los canales en el filo
  uniform float uCapas;       // líneas de reflejo repetidas hacia dentro
  uniform float uBrillo;      // ganancia final
  uniform sampler2D uEstudio; // panorama equirectangular del plató

  // Parte del ancho que ocupa el bisel del canto. Bajo = chapa plana con
  // arista viva; alto = vuelta a la sección de tubo.
  const float BISEL = 0.30;
  // Grosor del reparto de relieve, en unidades de campo. Ver abajo. Bajó de
  // 0,30 al normalizarse el campo: entre el umbral y la cresta de una cinta
  // sola hay ahora bastante menos recorrido de valor, y con el rango antiguo el
  // bisel no llegaba a cerrarse en todo el ancho del brazo.
  const float RANGO = 0.12;
  // Inclinación del panorama (cos y sin de unos 58°). Cuanto más tumbado,
  // antes se descuelga el faldón al suelo y más oscura sale la pieza.
  const float ENV_COS = 0.53;
  const float ENV_SIN = 0.85;

  // Muestreo del panorama: la dirección se convierte en coordenadas de la
  // imagen equirectangular (giro alrededor y ángulo respecto al cenit).
  vec3 entorno(vec3 dir) {
    // El panorama va TUMBADO unos 70°. Sin girarlo, la parte plana de la
    // pieza —que mira de frente al espectador— refleja exactamente el
    // horizonte, y como el horizonte es la banda oscura, el metal entero
    // salía marrón. Tumbado del todo (90°) tampoco vale: lo plano queda
    // blanco pero el bisel se descuelga al suelo de golpe y la pieza sale
    // negra. A 70° lo plano mira al cielo, el bisel barre toda la franja
    // clara mientras se inclina y solo el filo llega al suelo. Ese reparto
    // —claro por dentro, oscuro justo en el canto— es el del cromo.
    vec3 d = normalize(vec3(
      dir.x,
      dir.y * ENV_COS + dir.z * ENV_SIN,
      dir.z * ENV_COS - dir.y * ENV_SIN
    ));
    float u = atan(d.z, d.x) / 6.2831853 + 0.5;
    float v = acos(clamp(d.y, -1.0, 1.0)) / 3.14159265;
    vec3 col = texture2D(uEstudio, vec2(u, v)).rgb;
    // El panorama se usa como iluminación, no como imagen: subirle el
    // contraste separa los reflejos de las sombras y es lo que hace que el
    // metal parezca pulido en vez de mate.
    return col * col * 1.45;
  }

  void main() {
    vec2 px = 1.0 / uRes;
    float h = texture2D(uCampo, vUv).r;

    // Silueta: el corte del campo desenfocado. Igual que el contraste de alfa
    // del truco gooey, pero aquí además conservamos la rampa para el relieve.
    float dentro = smoothstep(uUmbral - 0.015, uUmbral + 0.015, h);
    if (dentro < 0.001) discard;

    // Cuánto adentro de la pieza estamos: 0 en el filo, 1 en el corazón.
    // El rango es corto y no llega hasta 1: ahora el campo puede valer
    // cualquier cosa según cuántos trazos se sumen ahí, y si el reparto
    // dependiera de eso, una cinta suelta saldría con el relieve a medias y
    // una masa fundida, aplanada. Con un rango corto, ambas tienen el mismo
    // canto y la misma cresta; lo que cambia entre ellas es el ancho.
    float t = clamp((h - uUmbral) / RANGO, 0.0, 1.0);
    // Y dónde cae eso respecto al bisel: 0 en el filo, 1 al acabar el bisel y
    // empezar la meseta.
    float altura = clamp(t / BISEL, 0.0, 1.0);

    // La superficie es un TEJADILLO: dos faldones anchos y casi rectos que se
    // encuentran en una cresta que recorre el brazo por el centro. Cada
    // faldón, al ser casi plano, refleja una zona distinta del plató, y la
    // cresta los separa con una línea limpia. Ese corte a lo largo de cada
    // brazo es la firma de la referencia; ni el tubo ni la chapa plana lo dan
    // —el tubo reparte la curvatura y embarra el reflejo, la chapa deja el
    // interior de un gris liso.
    //
    // Del campo se toma solo HACIA DÓNDE cae, no cuánto. La inclinación la
    // pone el perfil. Es la diferencia que importa: deduciéndola del gradiente,
    // un trazo fino —donde el campo cae en cuatro píxeles— sale casi vertical
    // y por tanto negro, mientras que uno ancho sale plano. Con el perfil, una
    // púa y un cuerpo ancho tienen el mismo canto y el mismo brillo.
    // Las muestras van algo separadas a propósito. El mapa de altura solo
    // tiene 256 niveles, y midiendo la pendiente entre píxeles contiguos esos
    // escalones se amplifican y salpican la cresta de puntitos de color.
    vec2 d = px * 3.0;
    float hIzq = texture2D(uCampo, vUv - vec2(d.x, 0.0)).r;
    float hDer = texture2D(uCampo, vUv + vec2(d.x, 0.0)).r;
    float hAba = texture2D(uCampo, vUv - vec2(0.0, d.y)).r;
    float hArr = texture2D(uCampo, vUv + vec2(0.0, d.y)).r;
    vec2 grad = vec2(hDer - hIzq, hArr - hAba);
    float g = length(grad);
    vec2 dir = g > 0.00001 ? grad / g : vec2(0.0);

    // La inclinación sale de LO EMPINADO que esté el campo, no de cuánto vale.
    // Es la pieza que hace falta desde que los trazos se suman: el valor del
    // campo ya no dice a qué distancia del borde estás —una masa fundida es
    // una meseta saturada—, mientras que la pendiente lo dice siempre.
    //
    // Y sale gratis lo que buscábamos, sin un solo umbral que ajustar: en una
    // cinta fina el campo baja por los dos lados casi hasta el centro, así que
    // salen los dos faldones del tejadillo con su cresta; en una masa fundida
    // el interior es llano y queda como una chapa de espejo con el canto
    // biselado. Que es justo lo que hace la referencia.
    float m = g / (g + uGrano);
    float tilt = uRelieve * m;
    // Y un repunte corto justo en el filo: ahí el canto vuelca hasta rasante y
    // devuelve el hilo de luz que perfila cada pieza contra el fondo negro.
    tilt += uFilo * pow(1.0 - altura, 3.0);

    // Las líneas de dentro, que son lo que distingue el vidrio del metal.
    //
    // Un canto grueso de vidrio no devuelve un solo reflejo: devuelve el borde
    // repetido varias veces hacia dentro, porque el rayo rebota en la cara de
    // atrás antes de salir. Aquí se imita repitiendo el repunte del filo a
    // varias profundidades. Las curvas de nivel del campo siguen la silueta por
    // definición, así que las líneas salen paralelas al contorno —púas
    // incluidas— sin tener que calcular ningún contorno.
    if (uCapas > 0.0) {
      // Aquí NO se usa la altura del píxel, sino la media de las cinco muestras
      // —la del centro y las cuatro que el gradiente ya ha traído, así que sale
      // gratis—. El motivo es que el mapa tiene 256 niveles y el reparto de
      // relieve ocupa una franja estrecha de ese rango: leyendo un solo píxel,
      // las líneas caen siempre sobre los mismos escalones y se ven a peldaños.
      // Promediando cinco, la altura pasa a tener valores intermedios y las
      // líneas salen continuas.
      float hSuave = (texture2D(uCampo, vUv).r + hIzq + hDer + hAba + hArr) * 0.2;
      float tSuave = clamp((hSuave - uUmbral) / RANGO, 0.0, 1.0);
      // El exponente decide lo fina que es cada línea. Muy alto las deja de un
      // píxel y se rompen; con seis son anchas y se sostienen.
      float onda = fract(tSuave * uCapas);
      tilt += uFilo * 0.5 * pow(1.0 - onda, 6.0);
    }
    vec3 n = normalize(vec3(-dir * tilt, 1.0));

    vec3 V = vec3(0.0, 0.0, 1.0);

    // Esto es METAL, no vidrio: el color viene del reflejo, siempre. Antes se
    // mezclaba con la refracción y de frente mandaba ella, que es lo que daba
    // ese aspecto translúcido y lechoso; el cromo de la referencia es opaco y
    // espeja igual mirándolo de frente que al sesgo.
    vec3 R = reflect(-V, n);

    // La aberración cromática se hace desviando el rayo REFLEJADO en cada
    // canal, no refractando: así hay franja de color en las aristas —que es
    // donde la desviación cambia deprisa— sin perder la opacidad.
    //
    // Cuánto, lo decide quien usa el lienzo. Muy poca es cromo: un hilo de
    // color solo en el filo. Mucha separa los tres canales por toda la pieza y
    // el material se lee como vidrio, que dispersa de verdad. Es el mismo
    // cálculo; lo que cambia es de qué material parece.
    float disp = uDispersion;
    vec3 refl = vec3(
      entorno(reflect(-V, normalize(n + vec3(-disp, -disp, 0.0)))).r,
      entorno(R).g,
      entorno(reflect(-V, normalize(n + vec3(disp, disp, 0.0)))).b
    );

    // Fresnel sobre metal: no decide entre ver a través o espejar, solo sube
    // el brillo al sesgo. El suelo del 0,78 es lo que lo mantiene metálico.
    float f = pow(1.0 - clamp(dot(n, V), 0.0, 1.0), 4.0);
    // Tinte de acero: el cromo no es un espejo neutro, apaga un punto el rojo.
    vec3 tinte = vec3(0.94, 0.96, 1.0);
    vec3 color = refl * tinte * (0.78 + 0.5 * f) * uBrillo;

    // Nada de oscurecer el canto a mano: en la referencia el filo es un hilo
    // BLANCO, no una sombra. Sale solo, porque ahí el canto está volcado y
    // Fresnel dispara el reflejo hasta rasante.

    gl_FragColor = vec4(color, dentro);
  }
`;

// Un trazo ya hecho, en las mismas coordenadas relativas que usa el lienzo por
// dentro: x e y en fracción del ANCHO (no del alto), y r igual. Ver el
// comentario del tipo Punto.
export type TrazoHecho = Punto[];

export default function LienzoMetal({
  // Figura de partida. Si viene, el lienzo la pinta en vez de empezar vacío:
  // es lo que permite usar el mismo motor de metal para enseñar un símbolo
  // generado, sin duplicar el shader ni el mapa de altura.
  figura,
  // Con interactivo en false no se escucha al puntero y desaparecen la pista y
  // el botón de borrar: el lienzo pasa a ser una pieza que se mira.
  interactivo = true,
  // El plató que se refleja. Por defecto el de estudio, neutro, que es el que
  // hace que lo dibujado se lea como acero. Pasando otro se cambia el material
  // sin tocar nada más: un metal no tiene color propio, así que el panorama ES
  // el material.
  entorno,
  // Separación de los canales de color. Baja, cromo; alta, vidrio.
  dispersion = 0.0028,
  // Cuántas líneas de reflejo se repiten hacia dentro. Cero es una chapa; a
  // partir de tres se lee como un canto grueso de vidrio.
  capas = 0,
  // Ganancia final. El vidrio pide más que el metal: refleja de frente casi
  // todo lo que le llega, mientras que el metal se queda una parte.
  brillo = 1,
}: {
  figura?: TrazoHecho[];
  interactivo?: boolean;
  entorno?: () => HTMLCanvasElement;
  dispersion?: number;
  capas?: number;
  brillo?: number;
} = {}) {
  const lang = useLang();
  const contenedorRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLCanvasElement | null>(null);
  const posoRef = useRef<HTMLCanvasElement | null>(null); // trazos terminados
  const vivoRef = useRef<HTMLCanvasElement | null>(null); // trazo en curso
  // La cabeza del trazo en curso: se borra y se repinta en cada fotograma, así
  // que va en su propia capa. Ver componerMapa.
  const cabezaRef = useRef<HTMLCanvasElement | null>(null);
  const dibujadosRef = useRef(0);  // puntos crudos del trazo en curso ya pintados
  const pintadoHastaRef = useRef(0); // px de recorrido del trazo en curso ya pintados
  const anchoCssRef = useRef(1);  // ancho del lienzo en px, para el paso a relativo
  const trazosRef = useRef<Punto[][]>([]);
  const actualRef = useRef<Punto[] | null>(null);
  const colaRef = useRef<{ x: number; y: number; t: number }[]>([]);
  const ultimoRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const radioRef = useRef(GROSOR_MAX);
  const rafRef = useRef(0);
  const tresRef = useRef<{
    renderer: THREE.WebGLRenderer;
    escena: THREE.Scene;
    camara: THREE.OrthographicCamera;
    textura: THREE.CanvasTexture;
    rt1: THREE.WebGLRenderTarget;
    rt2: THREE.WebGLRenderTarget;
    matBlur: THREE.ShaderMaterial;
    matFinal: THREE.ShaderMaterial;
    quad: THREE.Mesh;
  } | null>(null);
  const sucioRef = useRef(true);
  const [vacio, setVacio] = useState(true);
  const [sinWebgl, setSinWebgl] = useState(false);
  const [cerca, setCerca] = useState(false);
  // Panel de diagnóstico, solo si la URL lleva ?diag: sirve para ver en el
  // propio móvil qué está pasando, sin depurador ni cable.
  const [diag, setDiag] = useState<Record<string, string | number> | null>(null);
  const diagRef = useRef<Record<string, string | number>>({});
  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("diag")) return;
    const t = setInterval(() => setDiag({ ...diagRef.current }), 300);
    return () => clearInterval(t);
  }, []);

  // Sondeo inmediato: ¿hay WebGL siquiera? Se comprueba con un lienzo de
  // usar y tirar y se suelta el contexto enseguida para no ocupar uno de los
  // pocos que permite el móvil. No se deja esto en manos del observador de
  // visibilidad: si el navegador no produce fotogramas (GPU deshabilitada),
  // ese observador no llega a dispararse nunca y el bloque se quedaría mudo.
  useEffect(() => {
    const sonda = document.createElement("canvas");
    const gl =
      (sonda.getContext("webgl2") as WebGL2RenderingContext | null) ||
      (sonda.getContext("webgl") as WebGLRenderingContext | null);
    if (!gl) {
      diagRef.current.webgl = "no";
      setSinWebgl(true);
      return;
    }
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  }, []);

  // Solo se enciende WebGL cuando el bloque está a punto de verse.
  useEffect(() => {
    const cont = contenedorRef.current;
    if (!cont) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setCerca(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    io.observe(cont);
    return () => io.disconnect();
  }, []);

  // Una cúpula de radio de influencia R y altura `alto`, en unidades de canvas.
  //
  // El perfil es (1 - d/R)^1,6, y no el núcleo habitual de metaball —(1-d²)²—,
  // que es de cumbre plana y dejaba el interior de cada cinta como un gris
  // liso. Este llega al borde con pendiente nula, así que dos cúpulas vecinas
  // se suman sin costura, pero en el centro llega en ángulo, y ese pico es la
  // cresta que recorre el brazo.
  //
  // La altura ya no es una constante: la pone quien llama, y vale lo que mide
  // el trozo de línea que esta cúpula representa. Ver NORMA_LINEA.
  const cupula = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    R: number,
    alto: number
  ) => {
    if (R < 0.5 || alto <= 0) return;
    // La altura va en el color sobre fondo negro, no en el alfa: al componer,
    // los alfas se comportan distinto y el interior se ensuciaría.
    const g = ctx.createRadialGradient(x, y, 0, x, y, R);
    const v = (k: number) => Math.round(Math.min(1, alto) * 255 * k);
    g.addColorStop(0, `rgb(${v(1)},${v(1)},${v(1)})`);
    g.addColorStop(0.15, `rgb(${v(0.771)},${v(0.771)},${v(0.771)})`);
    g.addColorStop(0.3, `rgb(${v(0.565)},${v(0.565)},${v(0.565)})`);
    g.addColorStop(0.5, `rgb(${v(0.33)},${v(0.33)},${v(0.33)})`);
    g.addColorStop(0.7, `rgb(${v(0.146)},${v(0.146)},${v(0.146)})`);
    g.addColorStop(0.85, `rgb(${v(0.048)},${v(0.048)},${v(0.048)})`);
    g.addColorStop(1, "rgb(0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, R, 0, Math.PI * 2);
    ctx.fill();
  };

  // Dibuja un trazo en el mapa de altura recorriéndolo A PASO CONSTANTE DE
  // LONGITUD y soltando una cúpula en cada paso, todas SUMÁNDOSE ("lighter").
  //
  // Recorrerlo por longitud, y no punto a punto, es la mitad del asunto: los
  // puntos vienen apelotonados donde la mano fue despacio, y sumando cúpulas
  // por punto el trazo engordaría justo ahí. Andando por longitud, cada cúpula
  // representa siempre el mismo trozo de línea, y por eso todas pesan igual.
  //
  // `desdeRecorrido` es la longitud del trazo ya pintada en fotogramas
  // anteriores: se mide en píxeles desde el principio del trazo, no en índices
  // de punto. Tiene que ser así porque al rehacer el suavizado los puntos se
  // renumeran, y con la suma no hay margen de error: repetir un tramo ya
  // pintado dejaría un bulto brillante en mitad del trazo. Con el máximo de
  // antes daba igual, y por eso antes bastaba con un índice.
  //
  // Devuelve hasta dónde ha pintado, y dónde quedó la cabeza.
  const pintarTrazo = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      crudos: Punto[],
      enCurso = false,
      desdeRecorrido = 0,
      sinPuntaInicial = false,
      // Tramo del trazo ya pintado. No se vuelve a dibujar: sirve para el
      // grosor medio y para saber por dónde va el recorrido.
      contexto: Punto[] = []
    ): { hasta: number; cabeza: { x: number; y: number; R: number } | null } => {
      if (!crudos.length) return { hasta: desdeRecorrido, cabeza: null };
      // De relativo a píxeles: todo el trabajo de suavizado y afilado se hace
      // ya en la escala en la que se va a pintar.
      const escala = anchoCssRef.current || 1;

      // UN grosor para todo el trazo, no uno por tramo.
      //
      // La velocidad sigue mandando, pero se promedia sobre el gesto entero en
      // vez de aplicarse punto a punto: un barrido rápido sale fino y uno lento
      // sale con cuerpo, y en ambos casos la cinta es pareja de punta a punta.
      // Midiendo la velocidad instantánea, el grosor subía y bajaba varias
      // veces dentro del mismo trazo —la mano acelera y frena sola al girar— y
      // eso no se lee como un material, se lee como un fallo. Lo único que
      // cambia el grosor a lo largo del trazo son las puntas, que son forma.
      const todos = contexto.length ? contexto.concat(crudos) : crudos;
      const radioUniforme =
        (todos.reduce((suma, p) => suma + p.r, 0) / todos.length) * escala;

      const enPx = crudos.map((p) => ({ x: p.x * escala, y: p.y * escala, r: radioUniforme }));
      const puntos = remuestrear(suavizar(enPx, SUAVIZAR_PASADAS), PASO_REMUESTREO);

      // Longitud acumulada del tramo, y la del contexto que lo precede: juntas
      // dan la posición dentro del trazo entero, que es lo que miden las puntas.
      const largos: number[] = [0];
      for (let i = 1; i < puntos.length; i++) {
        largos.push(
          largos[i - 1] + Math.hypot(puntos[i].x - puntos[i - 1].x, puntos[i].y - puntos[i - 1].y)
        );
      }
      const total = largos[largos.length - 1];
      let antes = 0;
      for (let i = 1; i < contexto.length; i++) {
        antes += Math.hypot(contexto[i].x - contexto[i - 1].x, contexto[i].y - contexto[i - 1].y) * escala;
      }
      const largoTrazo = Math.max(1, antes + total);

      // Un trazo corto no llega a valer 1: le falta línea a los lados para que
      // la integral se complete. Si se dejara así, un gesto breve saldría por
      // debajo del umbral y no se vería nada. Se resuelve encogiéndole el
      // alcance hasta lo que su propia longitud puede llenar, con lo que sale
      // lo que tiene que salir: una lenteja fina y en punta por los dos lados,
      // que es exactamente como empieza un trazo en la referencia.
      const alcanceUtil = Math.min(ALCANCE * radioUniforme, Math.max(largoTrazo, 8) * 0.9);
      const factorR = radioUniforme > 0 ? alcanceUtil / (ALCANCE * radioUniforme) : 1;

      const previo = ctx.globalCompositeOperation;
      // SUMA, siempre. Antes aquí iba "lighten" —el máximo— para que un trazo no
      // se saturara a sí mismo; con las cúpulas pesadas por longitud eso ya no
      // pasa, y sumar es lo que hace que una esquina se estire en aguja y que el
      // trazo se funda consigo mismo donde vuelve sobre sus pasos.
      ctx.globalCompositeOperation = "lighter";

      // Radio de influencia en un punto del recorrido, con las puntas ya
      // aplicadas. El largo de la punta se mide con el radio del trazo, no con
      // el local: con el local, donde ya es fino la punta saldría cortísima.
      const radioEn = (s: number) => {
        const inicio = sinPuntaInicial
          ? 1
          : factorPunta(antes + s, radioUniforme, largoTrazo, ENTRADA_CORTA);
        const fin = enCurso ? 1 : factorPunta(largoTrazo - antes - s, radioUniforme, largoTrazo);
        return Math.max(PUNTA_MIN, radioUniforme * Math.min(inicio, fin)) * ALCANCE * factorR;
      };

      let idx = 0;
      let s = Math.max(0, desdeRecorrido - antes);
      let cabeza: { x: number; y: number; R: number } | null = null;
      while (s <= total) {
        while (idx < puntos.length - 2 && largos[idx + 1] < s) idx++;
        const a = puntos[idx];
        const b = puntos[idx + 1] ?? a;
        const tramo = (largos[idx + 1] ?? largos[idx]) - largos[idx];
        const t = tramo > 0 ? (s - largos[idx]) / tramo : 0;
        const x = a.x + (b.x - a.x) * t;
        const y = a.y + (b.y - a.y) * t;
        const R = radioEn(s);
        // El paso va con el alcance: seis cúpulas por radio. Así el número de
        // degradados no se dispara en un trazo grueso, y en uno finísimo el
        // suelo de un píxel impide que se hagan millones.
        const paso = Math.max(1, R / MUESTRAS_POR_R);
        cupula(ctx, x, y, R, (paso / (NORMA_LINEA * R)) * ESCALA_CAMPO);
        cabeza = { x, y, R };
        s += paso;
      }

      ctx.globalCompositeOperation = previo;
      return { hasta: antes + s, cabeza: enCurso ? cabeza : null };
    },
    []
  );

  // El mapa se arma con dos capas: el poso (trazos terminados) y el vivo (el
  // que se está dibujando). Así el trazo en curso se pinta a trocitos, solo
  // la parte nueva de cada fotograma, en vez de entero: redibujarlo completo
  // significaba miles de degradados por fotograma y lo tumbaba a 0,6 fps.
  const componerMapa = useCallback(() => {
    const mask = maskRef.current;
    const poso = posoRef.current;
    const vivo = vivoRef.current;
    const ctx = mask?.getContext("2d");
    if (!mask || !ctx) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, mask.width, mask.height);
    // Aquí se SUMA, no se toma el máximo: el trazo en curso tiene que engordar
    // los que ya están cuando se les acerca, igual que ellos entre sí.
    ctx.globalCompositeOperation = "lighter";
    if (poso) ctx.drawImage(poso, 0, 0);
    if (vivo) ctx.drawImage(vivo, 0, 0);
    if (cabezaRef.current) ctx.drawImage(cabezaRef.current, 0, 0);
    ctx.restore();
    sucioRef.current = true;
  }, []);

  const limpiarCapa = (capa: HTMLCanvasElement | null) => {
    const ctx = capa?.getContext("2d");
    if (!capa || !ctx) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, capa.width, capa.height);
    ctx.restore();
  };

  // Todos los trazos, uno detrás de otro, en la misma capa y sumándose.
  //
  // Aquí había un tercer lienzo: cada trazo se armaba a solas y solo después se
  // sumaba al poso, porque dentro de un trazo las cúpulas iban al máximo y solo
  // entre trazos se sumaban. Ya no hace falta separarlos —ahora se suma
  // siempre—, y de paso un trazo puede fundirse consigo mismo, que es lo que no
  // se podía hacer antes y lo que hace falta para dibujar un símbolo de una
  // sola tirada.
  const repintarMapa = useCallback(() => {
    limpiarCapa(posoRef.current);
    limpiarCapa(vivoRef.current);
    limpiarCapa(cabezaRef.current);
    const ctx = posoRef.current?.getContext("2d");
    if (ctx) {
      for (const t of trazosRef.current) pintarTrazo(ctx, t);
    }
    dibujadosRef.current = 0;
    pintadoHastaRef.current = 0;
    componerMapa();
  }, [pintarTrazo, componerMapa]);

  // Montaje de WebGL. Se retrasa hasta que el lienzo se acerca a la pantalla:
  // la página ya tiene otro contexto (el fondo de píxeles) y los móviles son
  // muy estrictos con cuántos permiten a la vez. Creándolo solo cuando hace
  // falta, hay bastantes menos posibilidades de que lo rechacen.
  useEffect(() => {
    const cont = contenedorRef.current;
    if (!cont || !cerca) return;

    diagRef.current.webgl = "sí";
    const mask = document.createElement("canvas");
    maskRef.current = mask;
    posoRef.current = document.createElement("canvas");
    vivoRef.current = document.createElement("canvas");
    cabezaRef.current = document.createElement("canvas");

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    } catch {
      // Sin WebGL (móvil viejo, contexto agotado…) el lienzo no puede
      // funcionar; mejor decirlo que dejar un recuadro que no responde.
      setSinWebgl(true);
      return;
    }
    // En móvil se limita a 1,5: el búfer crece con el cuadrado del factor y
    // es justo lo que hace que el sistema retire el contexto.
    const tope = window.innerWidth <= 700 ? 1.5 : 2;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, tope));
    cont.appendChild(renderer.domElement);
    renderer.domElement.className = "lienzo-canvas";
    // Los móviles retiran el contexto con facilidad (memoria, pestaña en
    // segundo plano). Si pasa, se avisa en vez de quedarse en blanco.
    const alPerderContexto = () => setSinWebgl(true);
    renderer.domElement.addEventListener("webglcontextlost", alPerderContexto);

    const escena = new THREE.Scene();
    const camara = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const textura = new THREE.CanvasTexture(mask);
    textura.minFilter = THREE.LinearFilter;
    textura.magFilter = THREE.LinearFilter;

    const estudio = new THREE.CanvasTexture((entorno ?? crearEstudio)());
    estudio.minFilter = THREE.LinearFilter;
    estudio.magFilter = THREE.LinearFilter;
    // El panorama da la vuelta completa: la costura tiene que repetirse.
    estudio.wrapS = THREE.RepeatWrapping;
    estudio.wrapT = THREE.ClampToEdgeWrapping;
    // Sin voltear. Three sube las texturas del revés por defecto, y aquí eso
    // ponía el cielo abajo: el shader calcula la vertical como el ángulo desde
    // el cenit (0 arriba), así que una superficie plana miraba al suelo negro
    // creyendo mirar al cielo, y el metal salía apagado.
    estudio.flipY = false;

    const opciones = { depthBuffer: false, stencilBuffer: false };
    const rt1 = new THREE.WebGLRenderTarget(1, 1, opciones);
    const rt2 = new THREE.WebGLRenderTarget(1, 1, opciones);

    const matBlur = new THREE.ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: BLUR,
      uniforms: { uTex: { value: null }, uPaso: { value: new THREE.Vector2() } },
      // Sin mezcla: el desenfoque escribe el campo tal cual en el destino.
      // No está pintando nada encima de nada, está calculando.
      transparent: false,
      blending: THREE.NoBlending,
    });
    const matFinal = new THREE.ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      uniforms: {
        uCampo: { value: null },
        uEstudio: { value: null },
        uRes: { value: new THREE.Vector2() },
        // El umbral se deriva, no se teclea: es el corte en unidades de campo
        // llevado a la escala del canvas. Así, al mover ESCALA_CAMPO la silueta
        // no se descuadra.
        uUmbral: { value: UMBRAL_CAMPO * ESCALA_CAMPO },
        uRelieve: { value: 1.5 },
        uFilo: { value: 1.7 },
        // Bajó de 0,07 con el campo normalizado: la falda de la cinta cae ahora
        // más suave —el campo llega a 1 y no a 0,8, pero repartido sobre un
        // alcance mayor—, así que la pendiente a la que el faldón está a tope
        // tiene que bajar en la misma proporción o el brazo sale plano.
        uGrano: { value: 0.042 },
        uDispersion: { value: dispersion },
        uCapas: { value: capas },
        uBrillo: { value: brillo },
      },
      transparent: true,
    });

    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), matBlur);
    escena.add(quad);

    matFinal.uniforms.uEstudio.value = estudio;
    tresRef.current = { renderer, escena, camara, textura, rt1, rt2, matBlur, matFinal, quad };

    const medir = () => {
      const { width, height } = cont.getBoundingClientRect();
      anchoCssRef.current = width || 1;
      // El mismo tope que el renderer: los lienzos del mapa de altura también
      // ocupan memoria de vídeo al subirse como textura.
      const dpr = Math.min(window.devicePixelRatio || 1, tope);
      renderer.setSize(width, height, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      for (const capa of [mask, posoRef.current, vivoRef.current, cabezaRef.current]) {
        if (!capa) continue;
        capa.width = Math.round(width * dpr);
        capa.height = Math.round(height * dpr);
        capa.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      // El desenfoque se hace a media resolución: es donde se va el coste y
      // el campo resultante es suave, así que no se nota.
      rt1.setSize(Math.round(width * dpr * 0.5), Math.round(height * dpr * 0.5));
      rt2.setSize(Math.round(width * dpr * 0.5), Math.round(height * dpr * 0.5));
      matFinal.uniforms.uRes.value.set(width * dpr, height * dpr);
      repintarMapa();
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(cont);

    return () => {
      ro.disconnect();
      renderer.domElement.removeEventListener("webglcontextlost", alPerderContexto);
      renderer.dispose();
      rt1.dispose();
      rt2.dispose();
      textura.dispose();
      estudio.dispose();
      quad.geometry.dispose();
      matBlur.dispose();
      matFinal.dispose();
      renderer.domElement.remove();
      tresRef.current = null;
    };
  }, [repintarMapa, cerca, entorno, dispersion, capas, brillo]);

  // Pasa los puntos encolados al trazo en curso y pinta lo nuevo. Se llama
  // desde el bucle y también al soltar: si el dedo baja y sube dentro del
  // mismo fotograma —un trazo rápido—, el bucle aún no los ha consumido y sin
  // esto se perderían.
  const consumirCola = useCallback(() => {
    const cola = colaRef.current;
    if (cola.length) {
      diagRef.current.puntos = ((diagRef.current.puntos as number) || 0) + cola.length;
      const u = cola[cola.length - 1];
      diagRef.current.ultimo = `${u.x.toFixed(2)},${u.y.toFixed(2)}`;
    }
    const trazo = actualRef.current;
    if (!cola.length || !trazo) return;
    for (const p of cola) {
      const previo = ultimoRef.current;
      const ancho = anchoCssRef.current || 1;
      let radio = GROSOR_MAX;
      if (previo) {
        const dt = Math.max(1, p.t - previo.t);
        // La velocidad se mide en píxeles reales, no en unidades relativas,
        // para que el trazo responda igual en cualquier tamaño de pantalla.
        const dist = Math.hypot(p.x - previo.x, p.y - previo.y) * ancho;
        const v = Math.min(dist / dt, VELOCIDAD_TOPE) / VELOCIDAD_TOPE;
        radio = GROSOR_MAX - (GROSOR_MAX - GROSOR_MIN) * v;
      }
      radioRef.current += (radio - radioRef.current) * SUAVIZADO;
      // El radio se guarda en la misma escala relativa que x e y: en píxeles,
      // al pintar se multiplicaría por el ancho y saldría descomunal.
      trazo.push({ x: p.x, y: p.y, r: radioRef.current / ancho });
      ultimoRef.current = p;
    }
    colaRef.current = [];
    const ctxVivo = vivoRef.current?.getContext("2d");
    if (ctxVivo) {
      // Solo se procesa y se pinta el tramo nuevo, con un solapamiento hacia
      // atrás para que el suavizado empalme. Antes se reprocesaba el trazo
      // entero en cada fotograma: con miles de puntos, eso era el grueso del
      // coste y hundía los fotogramas por segundo.
      //
      // La ventana se REPROCESA solapada pero se PINTA solo desde donde se
      // quedó, y esas dos cosas son distintas a propósito: el solape es lo que
      // hace que el suavizado empalme sin costura, pero volver a soltar cúpulas
      // sobre un tramo ya pintado lo sumaría dos veces y dejaría un bulto
      // brillante cada pocos fotogramas.
      const desde = Math.max(0, dibujadosRef.current - SOLAPE_VIVO);
      const ventana = trazo.slice(desde);
      // El afilado de entrada solo tiene sentido si la ventana incluye el
      // principio del trazo; si no, se pinta sin punta inicial.
      const { hasta, cabeza } = pintarTrazo(
        ctxVivo,
        ventana,
        true,
        pintadoHastaRef.current,
        desde > 0,
        trazo.slice(0, desde)
      );
      pintadoHastaRef.current = hasta;
      dibujadosRef.current = trazo.length;

      // Y la cabeza, aparte. En un extremo libre el campo se queda en la mitad
      // —solo hay línea por un lado—, así que la tinta se cerraría un buen
      // trozo por detrás del dedo y parecería que el trazo va con retraso. Esta
      // cúpula pone la mitad que falta, y va en su propia capa porque es lo
      // único que hay que borrar y rehacer en cada fotograma: al soltar
      // desaparece y en su sitio queda la punta afilada de verdad.
      limpiarCapa(cabezaRef.current);
      const ctxCabeza = cabezaRef.current?.getContext("2d");
      if (ctxCabeza && cabeza) {
        ctxCabeza.globalCompositeOperation = "lighter";
        cupula(ctxCabeza, cabeza.x, cabeza.y, cabeza.R, 0.5 * ESCALA_CAMPO);
      }
    }
    componerMapa();
  }, [pintarTrazo, componerMapa]);

  // Bucle: consume los puntos encolados y, si hay cambios, rehace el campo y
  // vuelve a sombrear.
  useEffect(() => {
    let ultimoFrame = 0;
    const dibujar = () => {
      rafRef.current = requestAnimationFrame(dibujar);
      const tres = tresRef.current;
      if (!tres) return;

      consumirCola();
      diagRef.current.fps = Math.round(1000 / Math.max(1, performance.now() - (ultimoFrame || performance.now())));
      ultimoFrame = performance.now();

      if (!sucioRef.current) return;
      diagRef.current.pintados = ((diagRef.current.pintados as number) || 0) + 1;
      sucioRef.current = false;

      const { renderer, escena, camara, textura, rt1, rt2, matBlur, matFinal, quad } = tres;
      textura.needsUpdate = true;

      // Pasada 1: desenfoque horizontal del mapa.
      quad.material = matBlur;
      matBlur.uniforms.uTex.value = textura;
      // El radio del desenfoque ES el radio del filete: es lo que decide
      // cuánto se hunde la membrana entre dos brazos que se cruzan. Corto,
      // los trazos se tocan y ya; largo, se sueldan con esa curva cóncava que
      // recorre el hueco de lado a lado, como en la referencia.
      //
      // Bajó de 0,85 a 0,7: soldar ya lo hace el propio campo, y lo que el
      // desenfoque hacía de más era limar las agujas de los vértices, que es
      // justo lo que no se puede tocar. Lo que queda es para disimular los
      // escalones de los 256 niveles del mapa.
      matBlur.uniforms.uPaso.value.set(0.7 / rt1.width, 0);
      renderer.setRenderTarget(rt1);
      renderer.render(escena, camara);

      // Pasada 2: desenfoque vertical. Aquí es donde se sueldan los trazos.
      matBlur.uniforms.uTex.value = rt1.texture;
      matBlur.uniforms.uPaso.value.set(0, 0.7 / rt1.height);
      renderer.setRenderTarget(rt2);
      renderer.render(escena, camara);

      // Pasada 3: óptica sobre el campo resultante.
      quad.material = matFinal;
      matFinal.uniforms.uCampo.value = rt2.texture;
      renderer.setRenderTarget(null);
      renderer.render(escena, camara);
    };
    rafRef.current = requestAnimationFrame(dibujar);
    return () => cancelAnimationFrame(rafRef.current);
  }, [repintarMapa]);

  // Mientras dura el trazo se escucha en la ventana, no en el elemento. En
  // iOS, al arrastrar, el navegador manda pointerleave (y a veces
  // pointercancel) aunque el dedo siga sobre el lienzo: tratándolos como
  // "dedo levantado", el trazo se cortaba a los cuatro o cinco puntos y cada
  // trozo salía como una bola suelta.
  const finRef = useRef<(() => void) | null>(null);
  const moverRef = useRef<((e: PointerEvent) => void) | null>(null);

  const soltarGlobal = useCallback(() => {
    if (moverRef.current) window.removeEventListener("pointermove", moverRef.current);
    if (finRef.current) {
      window.removeEventListener("pointerup", finRef.current);
      window.removeEventListener("pointercancel", finRef.current);
    }
    moverRef.current = null;
    finRef.current = null;
  }, []);

  const alBajar = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    const r = e.currentTarget.getBoundingClientRect();
    // El ancho se toma del propio evento: si se espera a que lo mida el
    // montaje, los primeros puntos de un trazo se normalizan con un ancho
    // provisional y salen con un radio disparatado.
    anchoCssRef.current = r.width || anchoCssRef.current;
    diagRef.current.abajo = ((diagRef.current.abajo as number) || 0) + 1;
    diagRef.current.lienzo = `${Math.round(r.width)}x${Math.round(r.height)}`;
    const p = {
      x: (e.clientX - r.left) / r.width,
      y: (e.clientY - r.top) / r.width,
      t: performance.now(),
    };
    radioRef.current = GROSOR_MAX * 0.7;
    ultimoRef.current = p;
    pintadoHastaRef.current = 0;
    dibujadosRef.current = 0;
    actualRef.current = [];
    colaRef.current = [p];
    setVacio(false);

    const caja = e.currentTarget;
    const mover = (ev: PointerEvent) => {
      if (!actualRef.current) return;
      const c = caja.getBoundingClientRect();
      anchoCssRef.current = c.width || anchoCssRef.current;
      const agrupados =
        typeof ev.getCoalescedEvents === "function" ? ev.getCoalescedEvents() : [];
      const lista = agrupados.length ? agrupados : [ev];
      for (const q of lista) {
        colaRef.current.push({
          x: (q.clientX - c.left) / c.width,
          y: (q.clientY - c.top) / c.width,
          t: performance.now(),
        });
      }
      diagRef.current.puntos = ((diagRef.current.puntos as number) || 0) + lista.length;
    };
    const fin = () => {
      alSoltar();
      soltarGlobal();
    };
    moverRef.current = mover;
    finRef.current = fin;
    window.addEventListener("pointermove", mover, { passive: true });
    window.addEventListener("pointerup", fin);
    window.addEventListener("pointercancel", fin);
  };

  const alSoltar = () => {
    // Primero se vacía la cola: en un trazo muy rápido, el bucle no ha tenido
    // ocasión de consumirla y esos puntos son todo el trazo.
    consumirCola();
    const trazo = actualRef.current;
    actualRef.current = null;
    if (!trazo || !trazo.length) return;
    trazosRef.current.push(trazo);
    let total = trazosRef.current.reduce((s, t) => s + t.length, 0);
    while (total > MAX_PUNTOS && trazosRef.current.length > 1) {
      total -= trazosRef.current.shift()!.length;
    }
    repintarMapa();
  };

  const limpiar = () => {
    trazosRef.current = [];
    actualRef.current = null;
    colaRef.current = [];
    repintarMapa();
    setVacio(true);
  };

  // La figura de partida, cuando la hay.
  //
  // Se depende de su FIRMA y no del array: quien nos llama construye la figura
  // al vuelo, así que el array es nuevo en cada render y usarlo de dependencia
  // repintaría sin parar. Las figuras generadas son de unos pocos vértices, así
  // que serializarlas no cuesta nada.
  const firmaFigura = figura ? JSON.stringify(figura) : "";
  useEffect(() => {
    if (!figura) return;
    trazosRef.current = figura.map((t) => t.map((p) => ({ ...p })));
    setVacio(false);
    // Si WebGL aún no ha montado, esto no pinta nada todavía: no importa, el
    // montaje mide el lienzo y repinta, y para entonces la figura ya está
    // puesta. Por eso `cerca` es dependencia.
    repintarMapa();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firmaFigura, cerca, repintarMapa]);

  // Sin WebGL no hay metal posible: se cambia por la versión de filtros SVG,
  // que hace la misma fusión y un cromo aproximado sin tocar la GPU.
  //
  // Solo cuando se puede dibujar. Enseñando una figura ya hecha no sirve de
  // recambio: pondría un lienzo en blanco donde tenía que haber un resultado, e
  // invitaría a dibujar en un sitio que no es para eso.
  if (sinWebgl) return interactivo ? <LienzoFluido /> : null;

  return (
    <section className={`lienzo-fluido es-metal${interactivo ? "" : " es-fijo"}`}>
      <div className="lienzo-marco">
        <div
          ref={contenedorRef}
          className="lienzo-tinta lienzo-gl"
          onPointerDown={interactivo ? alBajar : undefined}
        />
        {interactivo && (
          <p className={`lienzo-pista${vacio ? "" : " se-va"}`} aria-hidden={!vacio}>
            {lang === "en" ? "Draw here" : "Dibuja aquí"}
          </p>
        )}

        {diag && (
          <pre className="lienzo-diag">
            {Object.entries(diag)
              .map(([k, v]) => `${k}: ${v}`)
              .join("\n")}
          </pre>
        )}

        {interactivo && (
          <button type="button" className="lienzo-reset" onClick={limpiar}>
            {lang === "en" ? "Reset" : "Borrar"}
          </button>
        )}
      </div>
    </section>
  );
}
