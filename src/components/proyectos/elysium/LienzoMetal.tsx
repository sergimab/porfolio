"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useLang } from "@/components/shared/useLang";
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
const AFILADO = 2.4;      // >1 afila las puntas
const PUNTA_MIN = 0.8;
const MAX_PUNTOS = 24000;

type Punto = { x: number; y: number; r: number };
const perfil = (t: number) => Math.pow(Math.sin(Math.PI * t), AFILADO);

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

// Desenfoque separable: se aplica en horizontal y luego en vertical, que sale
// mucho más barato que un desenfoque en dos dimensiones de una sola pasada.
const BLUR = /* glsl */ `
  precision highp float;
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
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uCampo;   // mapa de altura ya desenfocado
  uniform vec2  uRes;
  uniform float uUmbral;      // dónde corta la silueta
  uniform float uRelieve;     // cuánto abomba la superficie

  // Entorno de estudio: franjas horizontales claras y oscuras, como los
  // paneles y las lámparas de un plató reflejados en una pieza cromada.
  // Es lo que se ve "dentro" del metal y lo que da las cintas.
  vec3 entorno(vec3 dir) {
    float y = dir.y;
    // Suelo oscuro, horizonte claro, techo con lámparas.
    // Un cromo convincente necesita zonas MUY oscuras junto a zonas muy
    // claras: si todo el entorno es medio, la pieza sale lavada y parece
    // plástico blanco.
    vec3 suelo = vec3(0.05, 0.05, 0.07);
    vec3 medio = vec3(0.48, 0.52, 0.58);
    vec3 techo = vec3(1.0, 1.0, 1.0);
    vec3 base = mix(suelo, medio, smoothstep(-0.9, -0.05, y));
    base = mix(base, techo, smoothstep(0.12, 0.55, y));

    // Franjas: paneles del plató. Al variar con el ángulo, cada curva de la
    // pieza refleja una franja distinta y aparecen las cintas.
    // Paneles del plató: franjas de luz separadas por huecos oscuros. El
    // contraste duro entre ambas es lo que dibuja las cintas al reflejarse.
    float ang = atan(dir.x, dir.z);
    float franjas = sin(ang * 4.0 + y * 2.0);
    base = mix(base * 0.55, base + 0.5, smoothstep(0.05, 0.55, franjas));
    float finas = sin(ang * 11.0 - y * 7.0);
    base += smoothstep(0.85, 1.0, finas) * 0.5;
    // Tinte frío arriba y cálido abajo: el metal puro sale muerto sin algo
    // de temperatura de color.
    base *= mix(vec3(1.05, 0.98, 0.92), vec3(0.94, 0.98, 1.08), smoothstep(-0.4, 0.5, y));

    // Dos focos duros, que son los que dejan el destello pequeño y brillante.
    float foco1 = pow(max(dot(normalize(dir), normalize(vec3(-0.4, 0.75, 0.5))), 0.0), 90.0);
    float foco2 = pow(max(dot(normalize(dir), normalize(vec3(0.65, 0.35, 0.6))), 0.0), 45.0);
    base += vec3(1.0) * foco1 * 3.0;
    base += vec3(0.85, 0.9, 1.0) * foco2 * 1.2;
    return base;
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
  const pintarTrazo = useCallback((ctx: CanvasRenderingContext2D, puntos: Punto[]) => {
    if (!puntos.length) return;
    const previo = ctx.globalCompositeOperation;
    ctx.globalCompositeOperation = "lighten";

    const n = Math.max(1, puntos.length - 1);
    for (let i = 0; i < puntos.length; i++) {
      const p = puntos[i];
      const r = Math.max(PUNTA_MIN, p.r * perfil(puntos.length < 3 ? 0.5 : i / n));
      cupula(ctx, p.x, p.y, r);
      // Cúpulas intermedias, para que un movimiento rápido no deje el trazo
      // a trocitos.
      const q = puntos[i + 1];
      if (q) {
        const d = Math.hypot(q.x - p.x, q.y - p.y);
        const pasos = Math.ceil(d / Math.max(1, r * 0.12));
        for (let k = 1; k < pasos; k++) {
          const t = k / pasos;
          const rr = Math.max(PUNTA_MIN, (p.r + (q.r - p.r) * t) * perfil((i + t) / n));
          cupula(ctx, p.x + (q.x - p.x) * t, p.y + (q.y - p.y) * t, rr);
        }
      }
    }
    ctx.globalCompositeOperation = previo;
  }, []);

  const repintarMapa = useCallback(() => {
    const mask = maskRef.current;
    const ctx = mask?.getContext("2d");
    if (!mask || !ctx) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, mask.width, mask.height);
    ctx.restore();
    for (const t of trazosRef.current) pintarTrazo(ctx, t);
    if (actualRef.current) pintarTrazo(ctx, actualRef.current);
    sucioRef.current = true;
  }, [pintarTrazo]);

  // Montaje de WebGL.
  useEffect(() => {
    const cont = contenedorRef.current;
    if (!cont) return;

    const mask = document.createElement("canvas");
    maskRef.current = mask;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    cont.appendChild(renderer.domElement);
    renderer.domElement.className = "lienzo-canvas";

    const escena = new THREE.Scene();
    const camara = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const textura = new THREE.CanvasTexture(mask);
    textura.minFilter = THREE.LinearFilter;
    textura.magFilter = THREE.LinearFilter;

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
        uRes: { value: new THREE.Vector2() },
        uUmbral: { value: 0.3 },
        uRelieve: { value: 7.0 },
      },
      transparent: true,
    });

    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), matBlur);
    escena.add(quad);

    tresRef.current = { renderer, escena, camara, textura, rt1, rt2, matBlur, matFinal, quad };

    const medir = () => {
      const { width, height } = cont.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setSize(width, height, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      mask.width = Math.round(width * dpr);
      mask.height = Math.round(height * dpr);
      const ctx = mask.getContext("2d");
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
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
      renderer.dispose();
      rt1.dispose();
      rt2.dispose();
      textura.dispose();
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
          trazo.push({ x: p.x, y: p.y, r: radioRef.current });
          ultimoRef.current = p;
        }
        colaRef.current = [];
        repintarMapa();
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
  }, [repintarMapa]);

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
