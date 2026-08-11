"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useLang } from "@/components/shared/useLang";
import LienzoFluido from "./LienzoFluido";
import "./LienzoFluido.css";

// Lienzo de metal líquido.
//
// El dibujo no se pinta directamente: se construye en un canvas oculto un
// MAPA DE ALTURA. Cada punto del trazo aporta una cúpula (un degradado radial
// que vale 1 en el centro y 0 en el borde) y se combina con "lighten", es
// decir, quedándose con el máximo. Así el trazo tiene sección de tubo, que es
// lo que hace falta para que la superficie tenga curvatura en todo su ancho.
//
// Un trazo blanco macizo, por mucho que se desenfoque, se satura por dentro:
// la superficie sale como una meseta plana y el reflejo no cambia salvo en el
// canto. Con cúpulas no pasa: la altura baja del centro al borde siempre.
//
// Después, un desenfoque suave en dos pasadas redondea las uniones —ahí es
// donde los trazos cercanos se sueldan entre sí— y la pendiente del campo en
// cada píxel da la normal: hacia dónde mira la superficie ahí.
//
// Con la normal ya se puede hacer óptica de verdad en el shader:
//   · reflejar la vista contra un entorno de estudio (de ahí las cintas que
//     recorren el metal, que cambian según la curvatura),
//   · refractar con un índice distinto para el rojo, el verde y el azul, que
//     es lo que produce la dispersión iridiscente,
//   · mezclar ambas según Fresnel: de frente manda la refracción y en los
//     bordes rasantes, el reflejo.
//
// Es lo mismo que hace un render 3D, pero sobre un relieve deducido del
// dibujo en vez de una malla.

const GROSOR_MAX = 46;
const GROSOR_MIN = 18;
const VELOCIDAD_TOPE = 3.2;
const SUAVIZADO = 0.22;
const AFILADO = 2.6;        // >1 afila; a más valor, la punta adelgaza antes
const PUNTA_MIN = 0.35;
const LARGO_PUNTA = 9;      // longitud de cada punta, en múltiplos del radio
const SUAVIZAR_PASADAS = 3; // pasadas de suavizado del recorrido
const PASO_REMUESTREO = 2;  // separación, en px, al reconstruir la curva
const VENTANA_GROSOR = 9;   // puntos que se promedian para pulir el grosor

// Plumilla: el trazo se comporta como una pluma de punta ancha inclinada.
// Al moverse perpendicular al filo deja su grosor máximo y, al moverse en la
// dirección del filo, un pelo. Es de donde sale la alternancia de finas y
// gruesas al cambiar de sentido.
const PLUMILLA = (-38 * Math.PI) / 180; // inclinación del filo
const PLUMILLA_MIN = 0.12;              // grosor en la dirección del filo
const MAX_PUNTOS = 24000;

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

// Media móvil del grosor. El factor de plumilla se calcula tramo a tramo y
// llega con dientes; promediándolo, el grosor crece y decrece de forma
// continua en vez de a saltos.
function pulirGrosor(puntos: Punto[], ventana: number): Punto[] {
  if (puntos.length < 3) return puntos;
  const mitad = Math.floor(ventana / 2);
  return puntos.map((p, i) => {
    let suma = 0;
    let n = 0;
    for (let k = -mitad; k <= mitad; k++) {
      const q = puntos[i + k];
      if (q) {
        suma += q.r;
        n++;
      }
    }
    return { ...p, r: suma / n };
  });
}

// Afilado por longitud recorrida, no por porcentaje del trazo. La diferencia
// importa: con un porcentaje, la punta crece con el trazo y, mientras dibujas,
// el extremo que está bajo el cursor tiene grosor cero — parece que la línea
// se queda atrás. Con una longitud fija, la punta mide siempre lo mismo.
function factorPunta(distanciaAlExtremo: number, radio: number, largoTotal: number): number {
  // La punta nunca ocupa más de un tercio del trazo: si no, en una línea
  // corta las dos puntas se juntan y la línea desaparece.
  const largo = Math.min(Math.max(8, radio * LARGO_PUNTA), largoTotal / 3);
  const t = Math.min(1, distanciaAlExtremo / largo);
  // El exponente va por encima de 1: así el grosor se desploma cerca del
  // extremo y la punta sale como una aguja. Por debajo de 1 haría lo
  // contrario, engordar enseguida y quedar roma.
  return Math.pow(t, AFILADO);
}

// Grosor según la dirección del movimiento respecto al filo de la plumilla.
function factorPlumilla(dx: number, dy: number): number {
  const largo = Math.hypot(dx, dy);
  if (largo < 0.0001) return 1;
  const ang = Math.atan2(dy, dx);
  const s = Math.abs(Math.sin(ang - PLUMILLA));
  return PLUMILLA_MIN + (1 - PLUMILLA_MIN) * Math.pow(s, 0.7);
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

  // Cielo y suelo.
  const fondo = ctx.createLinearGradient(0, 0, 0, c.height);
  fondo.addColorStop(0, "#ffffff");
  fondo.addColorStop(0.3, "#e6eaf0");
  fondo.addColorStop(0.46, "#3a3f47");
  fondo.addColorStop(0.55, "#0d0f13");
  fondo.addColorStop(1, "#030304");
  ctx.fillStyle = fondo;
  ctx.fillRect(0, 0, c.width, c.height);

  // Softboxes: rectángulos muy claros repartidos por el techo y la banda
  // media. Son la fuente de los reflejos alargados.
  ctx.filter = "blur(9px)";
  const cajas: [number, number, number, number, string][] = [
    [40, 30, 240, 120, "#ffffff"],
    [360, 10, 180, 90, "#ffffff"],
    [640, 40, 300, 110, "#f2f6ff"],
    [120, 170, 150, 60, "#ffffff"],
    [520, 150, 220, 70, "#eef3ff"],
    [830, 180, 130, 50, "#ffffff"],
    [250, 240, 420, 26, "#dfe6f2"],
    [700, 250, 260, 20, "#cdd6e4"],
  ];
  for (const [x, y, w, h, color] of cajas) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  }

  // Tiras verticales: los montantes del plató. Al reflejarse en una
  // superficie curva se convierten en las cintas que la recorren.
  ctx.filter = "blur(5px)";
  for (let i = 0; i < 14; i++) {
    const x = (i / 14) * c.width + (i % 3) * 12;
    const ancho = 6 + (i % 4) * 5;
    ctx.fillStyle = i % 2 ? "rgba(255,255,255,0.95)" : "rgba(4,5,7,0.95)";
    ctx.fillRect(x, 40, ancho, 330);
  }

  // Un par de reflejos cálidos, para que el metal no salga muerto de color.
  ctx.filter = "blur(26px)";
  ctx.fillStyle = "rgba(255,214,170,0.5)";
  ctx.fillRect(120, 120, 180, 90);
  ctx.fillStyle = "rgba(150,190,255,0.45)";
  ctx.fillRect(760, 90, 200, 110);
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
    gl_FragColor = vec4(suma, suma, suma, suma);
  }
`;

const FRAGMENT = /* glsl */ `
  varying vec2 vUv;
  uniform sampler2D uCampo;   // mapa de altura ya desenfocado
  uniform vec2  uRes;
  uniform float uUmbral;      // dónde corta la silueta
  uniform float uRelieve;     // cuánto abomba la superficie
  uniform sampler2D uEstudio; // panorama equirectangular del plató

  // Muestreo del panorama: la dirección se convierte en coordenadas de la
  // imagen equirectangular (giro alrededor y ángulo respecto al cenit).
  vec3 entorno(vec3 dir) {
    vec3 d = normalize(dir);
    float u = atan(d.z, d.x) / 6.2831853 + 0.5;
    float v = acos(clamp(d.y, -1.0, 1.0)) / 3.14159265;
    vec3 col = texture2D(uEstudio, vec2(u, v)).rgb;
    // El panorama se usa como iluminación, no como imagen: subirle el
    // contraste separa los reflejos de las sombras y es lo que hace que el
    // metal parezca pulido en vez de mate.
    return col * col * 1.35;
  }

  // Altura de la superficie en un punto: la rampa del campo, redondeada.
  // La raíz cuadrada convierte la caída lineal del desenfoque en una sección
  // de tubo; sin ella la pieza sería una meseta con el canto biselado y el
  // reflejo solo cambiaría en el borde.
  float alturaEn(vec2 uv) {
    float h = texture2D(uCampo, uv).r;
    float t = clamp((h - uUmbral) / (1.0 - uUmbral), 0.0, 1.0);
    return sqrt(t);
  }

  void main() {
    vec2 px = 1.0 / uRes;
    float h = texture2D(uCampo, vUv).r;

    // Silueta: el corte del campo desenfocado. Igual que el contraste de alfa
    // del truco gooey, pero aquí además conservamos la rampa para el relieve.
    float dentro = smoothstep(uUmbral - 0.015, uUmbral + 0.015, h);
    if (dentro < 0.001) discard;

    float altura = alturaEn(vUv);

    // Normal por diferencias finitas sobre la altura ya redondeada: así la
    // curvatura recorre todo el ancho del trazo y el reflejo cambia con ella.
    vec2 d = px * 2.0;
    float ax1 = alturaEn(vUv + vec2(d.x, 0.0));
    float ax0 = alturaEn(vUv - vec2(d.x, 0.0));
    float ay1 = alturaEn(vUv + vec2(0.0, d.y));
    float ay0 = alturaEn(vUv - vec2(0.0, d.y));
    vec3 n = normalize(vec3(-(ax1 - ax0) * uRelieve, -(ay1 - ay0) * uRelieve, 1.0));

    vec3 V = vec3(0.0, 0.0, 1.0);

    // Reflexión del entorno.
    vec3 R = reflect(-V, n);
    vec3 refl = entorno(R);

    // Refracción con un índice por canal: el vidrio desvía más el azul que el
    // rojo, y esa diferencia es la dispersión que se ve como iridiscencia.
    vec3 tr = refract(-V, n, 1.0 / 1.36);
    vec3 tg = refract(-V, n, 1.0 / 1.45);
    vec3 tb = refract(-V, n, 1.0 / 1.54);
    vec3 refr = vec3(entorno(tr).r, entorno(tg).g, entorno(tb).b);

    // Fresnel: de frente se ve a través, al sesgo espeja.
    float f = pow(1.0 - clamp(dot(n, V), 0.0, 1.0), 4.0);
    f = clamp(0.12 + f * 0.85, 0.0, 1.0);

    vec3 color = mix(refr, refl, f);

    // Realce del canto, que es lo que hace que la pieza parezca tener grosor.
    color += vec3(0.9, 0.95, 1.0) * pow(1.0 - altura, 6.0) * 0.35;

    gl_FragColor = vec4(color, dentro);
  }
`;

export default function LienzoMetal() {
  const lang = useLang();
  const contenedorRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLCanvasElement | null>(null);
  const posoRef = useRef<HTMLCanvasElement | null>(null); // trazos terminados
  const vivoRef = useRef<HTMLCanvasElement | null>(null); // trazo en curso
  const dibujadosRef = useRef(0); // puntos del trazo en curso ya pintados
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

  // Una cúpula en (x, y) de radio r. Las paradas del degradado siguen
  // aproximadamente sqrt(1 - d²), el perfil de una esfera: es lo que da la
  // sección redonda del tubo.
  const cupula = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number) => {
    if (r < 0.3) return;
    // La altura va en el color sobre fondo negro opaco, no en el alfa: al
    // componer, los alfas se suman y el interior se saturaría otra vez; los
    // colores con "lighten" sí se quedan con el máximo.
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgb(255,255,255)");
    g.addColorStop(0.35, "rgb(240,240,240)");
    g.addColorStop(0.6, "rgb(204,204,204)");
    g.addColorStop(0.8, "rgb(153,153,153)");
    g.addColorStop(0.93, "rgb(82,82,82)");
    g.addColorStop(1, "rgb(0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  };

  // Dibuja un trazo en el mapa de altura como una sucesión de cúpulas, con el
  // perfil que afila las puntas. "lighten" se queda con el máximo en cada
  // píxel: sumar saturaría el centro y volveríamos a la meseta plana.
  // `enCurso` indica que el trazo aún se está dibujando: en ese caso no se
  // afila el final, porque ese extremo es el que sigue al cursor.
  // Devuelve cuántos puntos de la curva ya reconstruida se han dibujado, para
  // poder continuar desde ahí en el siguiente fotograma.
  const pintarTrazo = useCallback(
    (ctx: CanvasRenderingContext2D, crudos: Punto[], enCurso = false, desde = 0) => {
      if (!crudos.length) return 0;
      const puntos = pulirGrosor(
        remuestrear(suavizar(crudos, SUAVIZAR_PASADAS), PASO_REMUESTREO),
        VENTANA_GROSOR
      );
      const previo = ctx.globalCompositeOperation;
      ctx.globalCompositeOperation = "lighten";

      // Longitud acumulada, para medir las puntas en píxeles reales.
      const largos: number[] = [0];
      for (let i = 1; i < puntos.length; i++) {
        largos.push(largos[i - 1] + Math.hypot(puntos[i].x - puntos[i - 1].x, puntos[i].y - puntos[i - 1].y));
      }
      const total = largos[largos.length - 1] || 1;

      const radioEn = (i: number, extra = 0) => {
        const p = puntos[i];
        const s = largos[i] + extra;
        const inicio = factorPunta(s, p.r, total);
        const fin = enCurso ? 1 : factorPunta(total - s, p.r, total);
        return Math.max(PUNTA_MIN, p.r * Math.min(inicio, fin));
      };

      for (let i = Math.max(0, desde); i < puntos.length; i++) {
        const p = puntos[i];
        cupula(ctx, p.x, p.y, radioEn(i));
        // Cúpulas intermedias, para que un movimiento rápido no deje el trazo
        // a trocitos.
        const q = puntos[i + 1];
        if (q) {
          const d = Math.hypot(q.x - p.x, q.y - p.y);
          const pasos = Math.ceil(d / Math.max(0.8, p.r * 0.25));
          for (let k = 1; k < pasos; k++) {
            const t = k / pasos;
            cupula(ctx, p.x + (q.x - p.x) * t, p.y + (q.y - p.y) * t, radioEn(i, d * t));
          }
        }
      }
      ctx.globalCompositeOperation = previo;
      return puntos.length;
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
    // "lighten" para quedarse con el máximo de las dos capas, igual que entre
    // cúpulas: con source-over, el vivo taparía el poso con su fondo negro.
    ctx.globalCompositeOperation = "lighten";
    if (poso) ctx.drawImage(poso, 0, 0);
    if (vivo) ctx.drawImage(vivo, 0, 0);
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

  const repintarMapa = useCallback(() => {
    limpiarCapa(posoRef.current);
    limpiarCapa(vivoRef.current);
    const ctx = posoRef.current?.getContext("2d");
    if (ctx) for (const t of trazosRef.current) pintarTrazo(ctx, t);
    dibujadosRef.current = 0;
    componerMapa();
  }, [pintarTrazo, componerMapa]);

  // Montaje de WebGL. Se retrasa hasta que el lienzo se acerca a la pantalla:
  // la página ya tiene otro contexto (el fondo de píxeles) y los móviles son
  // muy estrictos con cuántos permiten a la vez. Creándolo solo cuando hace
  // falta, hay bastantes menos posibilidades de que lo rechacen.
  useEffect(() => {
    const cont = contenedorRef.current;
    if (!cont || !cerca) return;

    const mask = document.createElement("canvas");
    maskRef.current = mask;
    posoRef.current = document.createElement("canvas");
    vivoRef.current = document.createElement("canvas");

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

    const estudio = new THREE.CanvasTexture(crearEstudio());
    estudio.minFilter = THREE.LinearFilter;
    estudio.magFilter = THREE.LinearFilter;
    // El panorama da la vuelta completa: la costura tiene que repetirse.
    estudio.wrapS = THREE.RepeatWrapping;
    estudio.wrapT = THREE.ClampToEdgeWrapping;

    const opciones = { depthBuffer: false, stencilBuffer: false };
    const rt1 = new THREE.WebGLRenderTarget(1, 1, opciones);
    const rt2 = new THREE.WebGLRenderTarget(1, 1, opciones);

    const matBlur = new THREE.ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: BLUR,
      uniforms: { uTex: { value: null }, uPaso: { value: new THREE.Vector2() } },
      transparent: true,
    });
    const matFinal = new THREE.ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      uniforms: {
        uCampo: { value: null },
        uEstudio: { value: null },
        uRes: { value: new THREE.Vector2() },
        uUmbral: { value: 0.3 },
        uRelieve: { value: 13.0 },
      },
      transparent: true,
    });

    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), matBlur);
    escena.add(quad);

    matFinal.uniforms.uEstudio.value = estudio;
    tresRef.current = { renderer, escena, camara, textura, rt1, rt2, matBlur, matFinal, quad };

    const medir = () => {
      const { width, height } = cont.getBoundingClientRect();
      // El mismo tope que el renderer: los lienzos del mapa de altura también
      // ocupan memoria de vídeo al subirse como textura.
      const dpr = Math.min(window.devicePixelRatio || 1, tope);
      renderer.setSize(width, height, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      for (const capa of [mask, posoRef.current, vivoRef.current]) {
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
  }, [repintarMapa]);

  // Bucle: consume los puntos encolados y, si hay cambios, rehace el campo y
  // vuelve a sombrear.
  useEffect(() => {
    const dibujar = () => {
      rafRef.current = requestAnimationFrame(dibujar);
      const tres = tresRef.current;
      if (!tres) return;

      const cola = colaRef.current;
      if (cola.length && actualRef.current) {
        const trazo = actualRef.current;
        for (const p of cola) {
          const previo = ultimoRef.current;
          let radio = GROSOR_MAX;
          if (previo) {
            const dt = Math.max(1, p.t - previo.t);
            const dist = Math.hypot(p.x - previo.x, p.y - previo.y);
            const v = Math.min(dist / dt, VELOCIDAD_TOPE) / VELOCIDAD_TOPE;
            radio = GROSOR_MAX - (GROSOR_MAX - GROSOR_MIN) * v;
          }
          radioRef.current += (radio - radioRef.current) * SUAVIZADO;
          const plumilla = previo ? factorPlumilla(p.x - previo.x, p.y - previo.y) : 1;
          trazo.push({ x: p.x, y: p.y, r: radioRef.current * plumilla });
          ultimoRef.current = p;
        }
        colaRef.current = [];
        // Se redibujan unos pocos puntos ya pintados: el suavizado mueve algo
        // los últimos y, como se compone por máximo, repetirlos no acumula.
        const ctxVivo = vivoRef.current?.getContext("2d");
        if (ctxVivo) {
          dibujadosRef.current = pintarTrazo(
            ctxVivo,
            trazo,
            true,
            Math.max(0, dibujadosRef.current - 12)
          );
        }
        componerMapa();
      }

      if (!sucioRef.current) return;
      sucioRef.current = false;

      const { renderer, escena, camara, textura, rt1, rt2, matBlur, matFinal, quad } = tres;
      textura.needsUpdate = true;

      // Pasada 1: desenfoque horizontal del mapa.
      quad.material = matBlur;
      matBlur.uniforms.uTex.value = textura;
      matBlur.uniforms.uPaso.value.set(1.5 / rt1.width, 0);
      renderer.setRenderTarget(rt1);
      renderer.render(escena, camara);

      // Pasada 2: desenfoque vertical. Aquí es donde se sueldan los trazos.
      matBlur.uniforms.uTex.value = rt1.texture;
      matBlur.uniforms.uPaso.value.set(0, 1.5 / rt1.height);
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
  }, [repintarMapa, cerca]);

  const alBajar = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    const r = e.currentTarget.getBoundingClientRect();
    const p = { x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() };
    radioRef.current = GROSOR_MAX * 0.7;
    ultimoRef.current = p;
    actualRef.current = [];
    colaRef.current = [p];
    setVacio(false);
  };

  const alMover = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!actualRef.current) return;
    const agrupados =
      typeof e.nativeEvent.getCoalescedEvents === "function" ? e.nativeEvent.getCoalescedEvents() : [];
    const eventos = agrupados.length ? agrupados : [e.nativeEvent];
    const r = e.currentTarget.getBoundingClientRect();
    for (const ev of eventos) {
      colaRef.current.push({ x: ev.clientX - r.left, y: ev.clientY - r.top, t: performance.now() });
    }
  };

  const alSoltar = () => {
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

  // Sin WebGL no hay metal posible: se cambia por la versión de filtros SVG,
  // que hace la misma fusión y un cromo aproximado sin tocar la GPU.
  if (sinWebgl) return <LienzoFluido />;

  return (
    <section className="lienzo-fluido es-metal">
      <div className="lienzo-marco">
        <div
          ref={contenedorRef}
          className="lienzo-tinta lienzo-gl"
          onPointerDown={alBajar}
          onPointerMove={alMover}
          onPointerUp={alSoltar}
          onPointerCancel={alSoltar}
          onPointerLeave={alSoltar}
        />
        <p className={`lienzo-pista${vacio ? "" : " se-va"}`} aria-hidden={!vacio}>
          {lang === "en" ? "Draw here" : "Dibuja aquí"}
        </p>

        <button type="button" className="lienzo-reset" onClick={limpiar}>
          {lang === "en" ? "Reset" : "Borrar"}
        </button>
      </div>
    </section>
  );
}
