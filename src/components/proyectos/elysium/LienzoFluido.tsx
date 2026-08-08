"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLang } from "@/components/shared/useLang";
import "./LienzoFluido.css";

// Lienzo de dibujo: los trazos se pintan como formas afiladas que, al
// cruzarse, se sueldan entre sí dejando huecos y uniones tensas, más cerca de
// un metal retorcido que de una gota de líquido.
//
// La fusión es el truco gooey: un desenfoque fuerte (feGaussianBlur) seguido
// de un contraste bestia del canal alfa (feColorMatrix) que vuelve a recortar
// un borde nítido. Cuanto menor es el desenfoque y mayor el contraste, más
// estrechos son los cuellos de unión y mejor se conservan los agujeros.
//
// El dibujo va a un <canvas> (rápido, sin crear nodos del DOM). Los trazos
// terminados se guardan en un canvas fuera de pantalla y el trazo en curso se
// repinta entero en cada fotograma: hace falta porque su perfil de grosor
// depende de la longitud total, que va cambiando mientras se dibuja.

// Color de la tinta.
const MODO: "cromo" | "violeta" | "negro" = "cromo";
// Acabado: "plano" deja la silueta lisa; "cristal" añade volumen y reflejos.
const ACABADO: "plano" | "cristal" = "cristal";

const GROSOR_MAX = 34;      // radio en el vientre del trazo, con el puntero lento
const GROSOR_MIN = 12;      // radio en el vientre, a toda velocidad
const VELOCIDAD_TOPE = 3.2; // px/ms a partir de los cuales el trazo es mínimo
const SUAVIZADO = 0.22;     // cuánto tarda el grosor en reaccionar (0-1)
const AFILADO = 1.6;        // >1 afila las puntas; 1 sería un huso suave
const PUNTA_MIN = 2.2;      // radio mínimo en la punta, en px
const MAX_PUNTOS = 24000;   // tope de memoria: se olvidan los trazos más viejos

type Punto = { x: number; y: number; r: number };

// Perfil de grosor a lo largo del trazo: cero en los extremos y máximo en el
// centro. El exponente concentra el volumen en el vientre y hace que el grosor
// se desplome hacia las puntas, que salen como espinas.
const perfil = (t: number) => Math.pow(Math.sin(Math.PI * t), AFILADO);

export default function LienzoFluido() {
  const lang = useLang();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const posoRef = useRef<HTMLCanvasElement | null>(null); // trazos terminados
  const trazosRef = useRef<Punto[][]>([]);
  const actualRef = useRef<Punto[] | null>(null);
  const colaRef = useRef<{ x: number; y: number; t: number }[]>([]);
  const ultimoRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const radioRef = useRef(GROSOR_MAX);
  const rafRef = useRef(0);
  const [vacio, setVacio] = useState(true);

  const pincel = useCallback((ctx: CanvasRenderingContext2D) => {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    if (MODO === "negro") {
      const css = getComputedStyle(ctx.canvas).getPropertyValue("--tinta").trim();
      return css || "#000";
    }
    const g = ctx.createLinearGradient(0, 0, w, h);
    if (MODO === "violeta") {
      g.addColorStop(0, "#c073da");
      g.addColorStop(1, "#433778");
      return g;
    }
    // Cromo: bandas claras y oscuras alternas. Un degradado suave parecería
    // plástico; lo que lee como metal es el salto brusco entre bandas.
    g.addColorStop(0, "#f6f7f9");
    g.addColorStop(0.18, "#9fa6ae");
    g.addColorStop(0.32, "#ffffff");
    g.addColorStop(0.46, "#585f68");
    g.addColorStop(0.6, "#e8ebef");
    g.addColorStop(0.76, "#767d86");
    g.addColorStop(0.9, "#f2f4f7");
    g.addColorStop(1, "#4b525a");
    return g;
  }, []);

  // Pinta un trazo completo aplicando el perfil de grosor.
  const pintarTrazo = useCallback(
    (ctx: CanvasRenderingContext2D, puntos: Punto[]) => {
      if (!puntos.length) return;
      ctx.strokeStyle = pincel(ctx);
      ctx.fillStyle = ctx.strokeStyle;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (puntos.length < 3) {
        const p = puntos[0];
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(PUNTA_MIN, p.r * 0.6), 0, Math.PI * 2);
        ctx.fill();
        return;
      }
      const n = puntos.length - 1;
      for (let i = 1; i <= n; i++) {
        const a = puntos[i - 1];
        const b = puntos[i];
        const ra = Math.max(PUNTA_MIN, a.r * perfil((i - 1) / n));
        const rb = Math.max(PUNTA_MIN, b.r * perfil(i / n));
        ctx.lineWidth = ra + rb;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    },
    [pincel]
  );

  // Vuelca el poso (trazos terminados) y encima el trazo en curso.
  const componer = useCallback(() => {
    const canvas = canvasRef.current;
    const poso = posoRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (poso) ctx.drawImage(poso, 0, 0);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (actualRef.current) pintarTrazo(ctx, actualRef.current);
  }, [pintarTrazo]);

  // Rehace el poso desde cero (al cambiar de tamaño o de tema).
  const rehacerPoso = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const poso = posoRef.current ?? document.createElement("canvas");
    posoRef.current = poso;
    poso.width = canvas.width;
    poso.height = canvas.height;
    const ctx = poso.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, poso.width, poso.height);
    for (const trazo of trazosRef.current) pintarTrazo(ctx, trazo);
    componer();
  }, [pintarTrazo, componer]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const medir = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
      rehacerPoso();
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(canvas);
    const mo = new MutationObserver(rehacerPoso);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      ro.disconnect();
      mo.disconnect();
    };
  }, [rehacerPoso]);

  // Los eventos solo encolan puntos; se dibuja una vez por fotograma.
  useEffect(() => {
    const procesar = () => {
      rafRef.current = requestAnimationFrame(procesar);
      const cola = colaRef.current;
      if (!cola.length || !actualRef.current) return;
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
      componer();
    };
    rafRef.current = requestAnimationFrame(procesar);
    return () => cancelAnimationFrame(rafRef.current);
  }, [componer]);

  const alBajar = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // Capturar el puntero mantiene el trazo aunque el dedo salga del lienzo.
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

  const alMover = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!actualRef.current) return;
    const agrupados =
      typeof e.nativeEvent.getCoalescedEvents === "function"
        ? e.nativeEvent.getCoalescedEvents()
        : [];
    // Si el navegador devuelve la lista vacía, vale el propio evento: si no,
    // el trazo se quedaría en el punto inicial.
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
    // El trazo pasa al poso, ya con su perfil definitivo.
    const ctx = posoRef.current?.getContext("2d");
    if (ctx) pintarTrazo(ctx, trazo);
    componer();
  };

  const limpiar = () => {
    trazosRef.current = [];
    actualRef.current = null;
    colaRef.current = [];
    rehacerPoso();
    setVacio(true);
  };

  return (
    <section
      className={`lienzo-fluido${ACABADO === "cristal" ? " es-cristal" : ""}${
        MODO === "cromo" ? " es-cromo" : ""
      }`}
    >
      {/* Los filtros van ocultos: solo se referencian desde el CSS. */}
      <svg className="lienzo-defs" aria-hidden="true">
        <defs>
          {/* Fusión sola. stdDeviation baja y contraste alto: cuellos
              estrechos, uniones anguladas y agujeros que se conservan. */}
          <filter id="lienzo-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="difuso" />
            <feColorMatrix
              in="difuso"
              mode="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 32 -16"
            />
          </filter>

          {/* Fusión + cromo con aberración cromática. */}
          <filter id="lienzo-cristal" x="-15%" y="-15%" width="130%" height="130%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="difuso" />
            <feColorMatrix
              in="difuso"
              mode="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 32 -16"
              result="masa"
            />

            {/* Relieve: la masa vuelta a desenfocar da pendientes en los
                bordes, que es lo que la luz puede iluminar. */}
            <feGaussianBlur in="masa" stdDeviation="4" result="relieve" />

            {/* Reflejo duro y pequeño: es lo que distingue el metal pulido del
                plástico, que tiene el brillo ancho y blando. */}
            <feSpecularLighting
              in="relieve"
              surfaceScale="9"
              specularConstant="1.6"
              specularExponent="60"
              lightingColor="#ffffff"
              result="destello"
            >
              <fePointLight x="-120" y="-160" z="200" />
            </feSpecularLighting>
            <feComposite in="destello" in2="masa" operator="in" result="destelloDentro" />

            {/* Canto iluminado desde el lado opuesto. */}
            <feSpecularLighting
              in="relieve"
              surfaceScale="6"
              specularConstant="0.5"
              specularExponent="14"
              lightingColor="#cfe4ff"
              result="canto"
            >
              <fePointLight x="900" y="700" z="180" />
            </feSpecularLighting>
            <feComposite in="canto" in2="masa" operator="in" result="cantoDentro" />

            {/* Aberración cromática: tres copias de la silueta, cada una
                reducida a un canal y desplazada en distinta dirección. Al
                sumarlas en "screen" se recomponen en blanco donde coinciden y
                dejan flecos rojos, verdes y azules donde no. Se recortan
                contra la masa (operator="out") para que el desdoblamiento
                asome solo por fuera del borde, como en una lente. */}
            <feOffset in="masa" dx="-3" dy="-2" result="despR" />
            <feColorMatrix
              in="despR"
              mode="matrix"
              values="1 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
              result="canalR"
            />
            <feOffset in="masa" dx="3" dy="2" result="despG" />
            <feColorMatrix
              in="despG"
              mode="matrix"
              values="0 0 0 0 0
                      0 1 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
              result="canalG"
            />
            <feOffset in="masa" dx="0" dy="3" result="despB" />
            <feColorMatrix
              in="despB"
              mode="matrix"
              values="0 0 0 0 0
                      0 0 0 0 0
                      0 0 1 0 0
                      0 0 0 1 0"
              result="canalB"
            />
            <feBlend in="canalR" in2="canalG" mode="screen" result="rg" />
            <feBlend in="rg" in2="canalB" mode="screen" result="rgb" />
            <feComposite in="rgb" in2="masa" operator="out" result="flecosDuros" />
            {/* A plena intensidad el fleco parece un contorno de colores
                puros; rebajado, se lee como el desdoblamiento de una lente. */}
            <feColorMatrix
              in="flecosDuros"
              mode="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 0.55 0"
              result="flecos"
            />

            <feMerge>
              <feMergeNode in="flecos" />
              <feMergeNode in="masa" />
              <feMergeNode in="cantoDentro" />
              <feMergeNode in="destelloDentro" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      <div className="lienzo-marco">
        <div className="lienzo-tinta">
          <canvas
            ref={canvasRef}
            className="lienzo-canvas"
            onPointerDown={alBajar}
            onPointerMove={alMover}
            onPointerUp={alSoltar}
            onPointerCancel={alSoltar}
            onPointerLeave={alSoltar}
          />
        </div>

        {/* Indicación centrada, que desaparece en cuanto se dibuja. */}
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
