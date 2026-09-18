// Motor del degradado de malla. Es WebGL puro y no sabe nada de React: quien lo
// usa le da un lienzo y unos colores, y él se encarga de pintarlo y de moverlo.
//
// POR QUÉ UN SHADER Y NO DEGRADADOS DE CSS. Con CSS lo único que se puede animar
// de un degradado es su POSICIÓN: las manchas están quietas entre ellas y todo
// el dibujo se desliza en bloque. Por eso el movimiento se leía como un barrido
// y no como algo vivo. Aquí el color se calcula píxel a píxel a partir de un
// ruido que se deforma sobre sí mismo, así que las manchas se estiran, se
// mezclan y se separan: no hay dibujo que desplazar, hay un fluido.
//
// POR QUÉ UN SOLO CONTEXTO PARA TODOS LOS BOTONES. Un navegador aguanta unos
// dieciséis contextos WebGL a la vez y al pasarse cierra los más viejos; con un
// contexto por botón, una pantalla con varios se quedaría sin ellos. Aquí hay
// UNO, escondido, que pinta por turnos y vuelca el resultado en el lienzo 2D de
// cada botón. Un volcado de una imagen ya dibujada es de las cosas más baratas
// que hace un navegador, y solo se hace para los botones que están animando.

export type Ajustes = {
  // Los colores de la malla, en cualquier forma que entienda el CSS. Se
  // completan hasta cinco repitiendo, así que valen desde dos.
  colores: string[];
  // Vueltas por segundo del ruido en reposo y con el ratón encima. ESTAS SON
  // LAS DOS QUE HAY QUE TOCAR para que el botón se mueva más o menos.
  velocidadReposo: number;
  velocidadHover: number;
  // Segundos que tarda en pasar de una velocidad a la otra. Ver `energia`.
  suavizado: number;
  // Cuántas manchas caben a lo ancho. Más alto, dibujo más menudo.
  escala: number;
  // ANCLADO A LA VENTANA. Normalmente el dibujo se calcula dentro de la caja:
  // la caja se mueve con la página y el dibujo va pegado a ella. Con esto, el
  // dibujo se calcula sobre la VENTANA, así que la caja se convierte en una
  // ventana a un degradado que se queda quieto en la pantalla: al rodar la
  // página, por el hueco va pasando otra parte del color.
  anclado?: boolean;
};

export type Instancia = Ajustes & {
  lienzo: HTMLCanvasElement;
  pincel: CanvasRenderingContext2D;
  tinta: Float32Array;
  // El ratón encima, y el encendido que puede forzar quien lo usa —la casilla
  // activa, por ejemplo, que no tiene ratón encima pero sí tiene que arder—.
  hover: boolean;
  forzado: boolean;
  // ENERGÍA: 0 en reposo, 1 a pleno. No salta de una a otra, se acerca a su
  // destino un poco en cada fotograma, y de ella salen tanto la velocidad como
  // cuánto se deforma el ruido. Es la variable de la transición.
  energia: number;
  // El reloj del ruido. Se ACUMULA sumándole cada fotograma lo que toca a la
  // velocidad de ese momento, en vez de multiplicar el tiempo total por la
  // velocidad. Si se multiplicara, cambiar de velocidad movería también todo el
  // pasado y el dibujo daría un salto justo al entrar el ratón, que es el
  // defecto clásico de estas animaciones.
  fase: number;
  visible: boolean;
  ancho: number;
  alto: number;
  quieto: boolean;
};

// ── El contexto compartido ─────────────────────────────────────────────────

let gl: WebGLRenderingContext | null = null;
let lienzoGl: HTMLCanvasElement | null = null;
let sitios: {
  res: WebGLUniformLocation | null;
  fase: WebGLUniformLocation | null;
  energia: WebGLUniformLocation | null;
  escala: WebGLUniformLocation | null;
  origen: WebGLUniformLocation | null;
  ventana: WebGLUniformLocation | null;
  anclado: WebGLUniformLocation | null;
  color: WebGLUniformLocation | null;
} | null = null;
let arrancado = false;

const VERTICE = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

// El fragmento. La idea es un ruido de valor sumado en cuatro octavas (fbm) al
// que se le pasa como coordenada OTRO ruido: eso es el «domain warping», y es
// lo que convierte unas manchas redondas en algo que se retuerce como tinta en
// agua. Se hace dos veces seguidas —q deforma a r, y r deforma al final— porque
// con una sola pasada todavía se le ve la cuadrícula al ruido.
const FRAGMENTO = `
precision highp float;

uniform vec2 uRes;
uniform float uFase;
uniform float uEnergia;
uniform float uEscala;
uniform vec2 uOrigen;
uniform vec2 uVentana;
uniform float uAnclado;
uniform vec3 uColor[5];

float picadillo(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Ruido de valor con interpolación suave: la misma casilla siempre da el mismo
// número, y entre casilla y casilla se pasa con una curva en ese y no en recta,
// que es lo que evita que se vean las aristas de la cuadrícula.
float ruido(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(picadillo(i),                picadillo(i + vec2(1.0, 0.0)), u.x),
             mix(picadillo(i + vec2(0.0, 1.0)), picadillo(i + vec2(1.0, 1.0)), u.x), u.y);
}

// DOS capas de ruido, y la segunda pesando un tercio de la primera. Cada capa
// que se añade mete formas más pequeñas, y esas formas pequeñas son las que se
// ven pasar: con tres capas el botón enseñaba demasiado dibujo moviéndose a la
// vez. Con dos quedan pocas manchas y grandes, que es lo que se quiere —que se
// note que el color respira, no que hay cosas cruzando—. La segunda capa no
// sobra: es la que le quita a la primera la cara de círculo perfecto.
// Entre capa y capa se gira el plano; sin ese giro las dos comparten cuadrícula
// y se le ve la rejilla al ruido.
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 giro = mat2(0.80, 0.60, -0.60, 0.80);
  for (int i = 0; i < 2; i++) {
    v += a * ruido(p);
    p = giro * p * 1.9;
    a *= 0.34;
  }
  return v / 0.67;
}

void main() {
  // Donde cae este pixel dentro del dibujo. Con uAnclado, se le suma la
  // posición de la caja EN LA VENTANA y se mide contra la ventana entera: el
  // campo de color deja de pertenecer a la caja y pasa a pertenecer a la
  // pantalla. La caja se mueve con la página, el dibujo no.
  vec2 marco = mix(uRes, uVentana, uAnclado);
  vec2 pos = gl_FragCoord.xy + uOrigen * uAnclado;
  vec2 uv = pos / marco;
  // Corregido por la proporción del marco: sin esto, en una caja apaisada las
  // manchas saldrían estiradas a lo ancho.
  vec2 p = vec2(uv.x * (marco.x / marco.y), uv.y) * uEscala;

  float t = uFase;
  // La energía no solo acelera: también DEFORMA más. Es lo que hace que al
  // pasar por encima parezca que el color se activa y no solo que corre.
  // El suelo es bajo a propósito: cuanta más deformación, más se retuerce el
  // dibujo sobre sí mismo y más formas distintas aparecen. A 0,5 las manchas se
  // estiran y se mezclan, pero siguen siendo las mismas manchas.
  float amp = 0.50 + uEnergia * 0.40;

  vec2 q = vec2(fbm(p + vec2(0.0, t)),
                fbm(p + vec2(5.2, 1.3) - t * 0.8));
  vec2 r = vec2(fbm(p + amp * q + vec2(1.7, 9.2) + t * 0.7),
                fbm(p + amp * q + vec2(8.3, 2.8) - t * 0.6));
  float f = fbm(p + amp * r);

  // Cada color entra con su propia máscara, sacada de una parte distinta del
  // ruido: así no se apilan en el mismo sitio y la malla tiene varios focos.
  // Con smoothstep y no con un corte recto: la mezcla entra y sale con curva,
  // que es lo que hace que dos colores se fundan en vez de tocarse por un
  // borde. El margen se estrecha con la energía, así que al encenderse los
  // colores se separan más en vez de quedarse en una media.
  // Los tramos son ANCHOS y se solapan mucho: cuanto más estrecho el tramo, más
  // marcado el borde entre un color y el siguiente, y esos bordes son justo lo
  // que se lee como «formas». Anchos, lo que hay es un color pasando a otro.
  float k = uEnergia * 0.10;
  float m1 = smoothstep(0.20 + k, 0.86 - k, f);
  float m2 = smoothstep(0.26 + k, 0.94 - k, length(q) * 0.72);
  float m3 = smoothstep(0.18 + k, 0.90 - k, r.x);
  float m4 = smoothstep(0.42 + k, 1.00 - k, f * 1.06);

  vec3 col = uColor[0];
  col = mix(col, uColor[1], m1);
  col = mix(col, uColor[2], m2);
  col = mix(col, uColor[3], m3);
  col = mix(col, uColor[4], m4);

  gl_FragColor = vec4(col, 1.0);
}
`;

function compila(tipo: number, fuente: string): WebGLShader | null {
  if (!gl) return null;
  const s = gl.createShader(tipo);
  if (!s) return null;
  gl.shaderSource(s, fuente);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.warn("mesh gradient:", gl.getShaderInfoLog(s));
    gl.deleteShader(s);
    return null;
  }
  return s;
}

// Monta el contexto la primera vez que alguien lo pide. Devuelve false si el
// navegador no da WebGL: entonces quien llame se queda con el degradado de CSS
// que hay debajo, que es el mismo color aunque no se mueva igual.
function arranca(): boolean {
  if (arrancado) return gl !== null;
  arrancado = true;
  lienzoGl = document.createElement("canvas");
  gl =
    (lienzoGl.getContext("webgl", { antialias: false, depth: false, alpha: false }) as WebGLRenderingContext | null) ??
    (lienzoGl.getContext("experimental-webgl") as WebGLRenderingContext | null);
  if (!gl) return false;

  const v = compila(gl.VERTEX_SHADER, VERTICE);
  const f = compila(gl.FRAGMENT_SHADER, FRAGMENTO);
  const prog = gl.createProgram();
  if (!v || !f || !prog) { gl = null; return false; }
  gl.attachShader(prog, v);
  gl.attachShader(prog, f);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn("mesh gradient:", gl.getProgramInfoLog(prog));
    gl = null;
    return false;
  }
  gl.useProgram(prog);

  // Un solo triángulo que se sale de la pantalla por dos lados, en vez de dos
  // que formen el cuadrado: cubre lo mismo con la mitad de vértices y sin la
  // costura de la diagonal.
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  sitios = {
    res: gl.getUniformLocation(prog, "uRes"),
    fase: gl.getUniformLocation(prog, "uFase"),
    energia: gl.getUniformLocation(prog, "uEnergia"),
    escala: gl.getUniformLocation(prog, "uEscala"),
    origen: gl.getUniformLocation(prog, "uOrigen"),
    ventana: gl.getUniformLocation(prog, "uVentana"),
    anclado: gl.getUniformLocation(prog, "uAnclado"),
    color: gl.getUniformLocation(prog, "uColor[0]"),
  };
  return true;
}

// ── Colores ────────────────────────────────────────────────────────────────

// Cualquier color que entienda el CSS —hex, rgb(), hsl(), un nombre— se pasa a
// tres números de 0 a 1 pintándolo en un lienzo de un píxel y leyéndolo. Es un
// rodeo, pero es la única manera de no tener que escribir un intérprete de
// colores, y se hace una sola vez por botón.
let pipeta: CanvasRenderingContext2D | null = null;
function aRgb(color: string): [number, number, number] {
  if (!pipeta) {
    const c = document.createElement("canvas");
    c.width = c.height = 1;
    pipeta = c.getContext("2d", { willReadFrequently: true });
  }
  if (!pipeta) return [0, 0, 0];
  pipeta.clearRect(0, 0, 1, 1);
  pipeta.fillStyle = "#000";
  pipeta.fillStyle = color;
  pipeta.fillRect(0, 0, 1, 1);
  const d = pipeta.getImageData(0, 0, 1, 1).data;
  return [d[0] / 255, d[1] / 255, d[2] / 255];
}

// Siempre cinco colores, que es lo que espera el shader. Con menos se repiten
// en rueda, así que un botón de dos colores también vale.
export function tinta(colores: string[]): Float32Array {
  const lista = colores.length ? colores : ["#888"];
  const out = new Float32Array(15);
  for (let i = 0; i < 5; i++) {
    const [r, g, b] = aRgb(lista[i % lista.length]);
    out[i * 3] = r;
    out[i * 3 + 1] = g;
    out[i * 3 + 2] = b;
  }
  return out;
}

// ── El bucle ───────────────────────────────────────────────────────────────

const instancias = new Set<Instancia>();
let bucle = 0;
let anterior = 0;

// Tope de dos: por encima solo se gastan píxeles. Un degradado difuso no gana
// nada con más resolución.
const densidad = () => Math.min(typeof window === "undefined" ? 1 : window.devicePixelRatio || 1, 2);

function paso(ahora: number) {
  bucle = 0;
  const dt = Math.min((ahora - anterior) / 1000, 0.05);
  anterior = ahora;

  let sigue = false;

  for (const inst of instancias) {
    // Fuera de pantalla no se toca nada: ni se pinta ni se adelanta el reloj.
    // Es la mitad del ahorro cuando hay varios botones en la página.
    if (!inst.visible) continue;

    const destino = inst.hover || inst.forzado ? 1 : 0;
    // Acercamiento exponencial: se recorre siempre la misma FRACCIÓN de lo que
    // falta por segundo, así que la transición dura lo mismo caiga a 60 o a 120
    // fotogramas. `suavizado` es su constante de tiempo en segundos.
    inst.energia += (destino - inst.energia) * (1 - Math.exp(-dt / inst.suavizado));
    if (Math.abs(destino - inst.energia) < 0.002) inst.energia = destino;

    const velocidad = inst.velocidadReposo + (inst.velocidadHover - inst.velocidadReposo) * inst.energia;
    inst.fase += dt * velocidad;

    // Un botón en reposo, sin movimiento propio y ya pintado, no vuelve a
    // pintarse. Con esto una pantalla llena de botones cuesta lo mismo que uno:
    // el que tiene el ratón encima. Cuando se para, se le pinta UN último
    // fotograma —el de la postura final— y ahí se queda.
    // Un anclado nunca se da por quieto: basta con que la página ruede un píxel
    // para que por su hueco tenga que verse otra parte del color. Como solo se
    // pinta si está en pantalla, el gasto es el de una caja pequeña.
    const trabaja = velocidad > 0.0005 || inst.energia !== destino || !!inst.anclado;
    if (trabaja) {
      sigue = true;
      inst.quieto = false;
      pinta(inst);
    } else if (!inst.quieto) {
      // Solo se da por quieto si ha pintado de verdad. Si el elemento todavía no
      // tenía medidas, se sigue intentando: si no, se quedaría para siempre con
      // el fotograma en blanco que no llegó a pintarse.
      if (pinta(inst)) inst.quieto = true;
      else sigue = true;
    }
  }

  // Si no queda nadie moviéndose, el bucle se apaga del todo. Lo vuelve a
  // encender `remueve`, que es lo que llama el componente al entrar el ratón o
  // al volver el botón a la pantalla.
  if (sigue) bucle = requestAnimationFrame(paso);
}

function despierta() {
  if (bucle) return;
  anterior = performance.now();
  bucle = requestAnimationFrame(paso);
}

// Devuelve si ha llegado a pintar. Puede que no: un lienzo cuyo elemento aún no
// tiene medidas —está montado pero el navegador todavía no lo ha colocado, que
// es lo que pasa con las tarjetas mientras se reparten— mide cero, y pintarlo
// ahí lo dejaría en un píxel estirado, o sea en un color plano. Cuando pasa, se
// dice que no y se vuelve a intentar en el siguiente fotograma.
function pinta(inst: Instancia): boolean {
  if (!gl || !lienzoGl || !sitios) return false;
  const d = densidad();
  // `offsetWidth`/`offsetHeight` y NO `getBoundingClientRect`: el rect devuelve
  // el tamaño PINTADO, con las transformaciones aplicadas, y aquí casi todo lo
  // que lleva degradado va transformado —las tarjetas entran escaladas y las
  // cápsulas van giradas—. Midiendo así, una tarjeta a mitad de su entrada daba
  // 35 × 10 px y el lienzo se quedaba clavado en esa medida para siempre: un
  // pegote de color estirado en vez de un degradado. El tamaño de maquetación
  // no depende de la transformación, que es justo lo que hace falta.
  const anchoCss = inst.lienzo.offsetWidth;
  const altoCss = inst.lienzo.offsetHeight;
  if (anchoCss < 1 || altoCss < 1) return false;
  const w = Math.max(1, Math.round(anchoCss * d));
  const h = Math.max(1, Math.round(altoCss * d));
  if (w !== inst.ancho || h !== inst.alto) {
    inst.ancho = w;
    inst.alto = h;
    inst.lienzo.width = w;
    inst.lienzo.height = h;
  }
  // El lienzo escondido solo CRECE, nunca encoge: cambiarle el tamaño obliga al
  // navegador a reservar memoria de nuevo, y hacerlo en cada fotograma cuando
  // hay dos botones de distinto tamaño animando sería tirar trabajo.
  if (lienzoGl.width < w || lienzoGl.height < h) {
    lienzoGl.width = Math.max(lienzoGl.width, w);
    lienzoGl.height = Math.max(lienzoGl.height, h);
  }

  // Se pinta en la esquina de abajo a la izquierda del lienzo escondido —que es
  // el origen de WebGL— y de ahí se recorta al volcarlo.
  gl.viewport(0, 0, w, h);
  gl.uniform2f(sitios.res, w, h);
  gl.uniform1f(sitios.fase, inst.fase);
  gl.uniform1f(sitios.energia, inst.energia);
  gl.uniform1f(sitios.escala, inst.escala);
  gl.uniform3fv(sitios.color, inst.tinta);

  // Anclado: dónde está la caja dentro de la ventana, en píxeles de dibujo.
  // La `y` va del revés porque WebGL cuenta desde ABAJO y el navegador desde
  // arriba: lo que se le pasa es la distancia del borde inferior de la caja al
  // borde inferior de la ventana.
  gl.uniform1f(sitios.anclado, inst.anclado ? 1 : 0);
  if (inst.anclado) {
    const caja = inst.lienzo.getBoundingClientRect();
    gl.uniform2f(sitios.origen, caja.left * d, (window.innerHeight - caja.bottom) * d);
    gl.uniform2f(sitios.ventana, window.innerWidth * d, window.innerHeight * d);
  } else {
    gl.uniform2f(sitios.origen, 0, 0);
    gl.uniform2f(sitios.ventana, w, h);
  }
  gl.drawArrays(gl.TRIANGLES, 0, 3);

  inst.pincel.drawImage(lienzoGl, 0, lienzoGl.height - h, w, h, 0, 0, w, h);
  return true;
}

export function registra(lienzo: HTMLCanvasElement, ajustes: Ajustes): Instancia | null {
  if (!arranca()) return null;
  const pincel = lienzo.getContext("2d");
  if (!pincel) return null;
  const inst: Instancia = {
    ...ajustes,
    lienzo,
    pincel,
    tinta: tinta(ajustes.colores),
    hover: false,
    forzado: false,
    energia: 0,
    // Cada botón empieza el ruido por un sitio distinto: si no, todos los de la
    // página enseñarían exactamente la misma mancha.
    fase: Math.random() * 100,
    visible: true,
    ancho: 0,
    alto: 0,
    quieto: false,
  };
  instancias.add(inst);
  despierta();
  return inst;
}

export function jubila(inst: Instancia) {
  instancias.delete(inst);
}

// Para avisar de un cambio de estado desde fuera sin esperar al siguiente
// fotograma: si el bucle estaba dormido —todos en reposo y quietos—, esto lo
// vuelve a arrancar.
export function remueve(inst: Instancia) {
  inst.quieto = false;
  despierta();
}
