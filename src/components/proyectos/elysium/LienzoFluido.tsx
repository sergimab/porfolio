"use client";

import { useCallback, useEffect, useRef } from "react";
import LangText from "@/components/shared/LangText";
import { useLang } from "@/components/shared/useLang";
import "./LienzoFluido.css";

// Lienzo de "dibujo fluido": los trazos se pintan como formas gruesas de
// extremos redondeados y, al cruzarse, se funden en una sola masa continua.
//
// La fusión no se calcula: se consigue con el truco clásico del efecto gooey.
// Sobre el canvas se aplica un filtro SVG que primero desenfoca mucho la
// imagen (feGaussianBlur) y luego dispara el contraste del canal alfa
// (feColorMatrix). El desenfoque hace que dos formas cercanas solapen sus
// bordes difusos, y el contraste vuelve a recortar todo eso en un borde nítido
// que las une: donde había dos manchas separadas aparece un cuello líquido.
//
// El dibujo va a un <canvas> normal (rápido, sin crear nodos), y el filtro lo
// aplica el navegador al compositar. Los trazos se guardan en memoria para
// poder repintarlos al cambiar de tamaño o de tema.

// Cambia a "violeta" para el degradado #c073da → #433778.
const MODO: "negro" | "violeta" = "negro";

const GROSOR_MAX = 30;   // radio con el puntero parado
const GROSOR_MIN = 9;    // radio a toda velocidad
const VELOCIDAD_TOPE = 3.2; // px/ms a partir de los cuales el trazo es mínimo
const SUAVIZADO = 0.22;  // cuánto tarda el grosor en reaccionar (0-1)
const PUNTAS = 5;        // puntos de entrada y salida que se van afilando
const MAX_PUNTOS = 24000; // tope de memoria: se olvidan los trazos más viejos

type Punto = { x: number; y: number; r: number };

export default function LienzoFluido() {
  const lang = useLang();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trazosRef = useRef<Punto[][]>([]);
  const actualRef = useRef<Punto[] | null>(null);
  const colaRef = useRef<{ x: number; y: number; t: number }[]>([]);
  const ultimoRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const radioRef = useRef(GROSOR_MAX);
  const rafRef = useRef(0);

  // Pincel: color plano o degradado, según el modo.
  const pincel = useCallback((ctx: CanvasRenderingContext2D) => {
    if (MODO === "violeta") {
      const g = ctx.createLinearGradient(0, 0, ctx.canvas.width, ctx.canvas.height);
      g.addColorStop(0, "#c073da");
      g.addColorStop(1, "#433778");
      return g;
    }
    const css = getComputedStyle(ctx.canvas).getPropertyValue("--tinta").trim();
    return css || "#000";
  }, []);

  // Pinta un tramo de puntos. Cada segmento se traza con el grosor medio de
  // sus dos extremos y remates redondos: así el ancho varía de forma continua.
  const pintarTramo = useCallback(
    (ctx: CanvasRenderingContext2D, puntos: Punto[], desde: number) => {
      ctx.strokeStyle = pincel(ctx);
      ctx.fillStyle = ctx.strokeStyle;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      if (puntos.length === 1 && desde === 0) {
        const p = puntos[0];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        return;
      }
      for (let i = Math.max(1, desde); i < puntos.length; i++) {
        const a = puntos[i - 1];
        const b = puntos[i];
        ctx.lineWidth = a.r + b.r;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    },
    [pincel]
  );

  const repintar = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const trazo of trazosRef.current) pintarTramo(ctx, trazo, 0);
    if (actualRef.current) pintarTramo(ctx, actualRef.current, 0);
  }, [pintarTramo]);

  // El canvas se dimensiona al contenedor teniendo en cuenta la densidad de
  // pantalla, con tope 2 para no disparar el coste del filtro en retina.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const medir = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      const ctx = canvas.getContext("2d");
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
      repintar();
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(canvas);
    // Al cambiar el tema cambia el color de la tinta: hay que repintar.
    const mo = new MutationObserver(repintar);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      ro.disconnect();
      mo.disconnect();
    };
  }, [repintar]);

  // Los eventos de puntero solo encolan; el dibujo ocurre una vez por
  // fotograma, para no repintar decenas de veces entre dos refrescos.
  useEffect(() => {
    const procesar = () => {
      rafRef.current = requestAnimationFrame(procesar);
      const cola = colaRef.current;
      if (!cola.length || !actualRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx) return;

      const trazo = actualRef.current;
      const desde = Math.max(0, trazo.length - 1);
      for (const p of cola) {
        const previo = ultimoRef.current;
        let radio = GROSOR_MAX;
        if (previo) {
          const dt = Math.max(1, p.t - previo.t);
          const dist = Math.hypot(p.x - previo.x, p.y - previo.y);
          const v = Math.min(dist / dt, VELOCIDAD_TOPE) / VELOCIDAD_TOPE;
          // Cuanto más rápido va el puntero, más fino sale el trazo.
          radio = GROSOR_MAX - (GROSOR_MAX - GROSOR_MIN) * v;
        }
        radioRef.current += (radio - radioRef.current) * SUAVIZADO;
        // Entrada afilada: los primeros puntos crecen desde casi nada.
        const rampa = Math.min(1, (trazo.length + 1) / (PUNTAS + 1));
        trazo.push({ x: p.x, y: p.y, r: Math.max(1, radioRef.current * rampa) });
        ultimoRef.current = p;
      }
      colaRef.current = [];
      pintarTramo(ctx, trazo, desde);
    };
    rafRef.current = requestAnimationFrame(procesar);
    return () => cancelAnimationFrame(rafRef.current);
  }, [pintarTramo]);

  const posicion = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() };
  };

  const alBajar = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // Capturar el puntero mantiene el trazo aunque el dedo salga del lienzo.
    // Puede fallar en algún caso (puntero ya liberado); no es motivo para
    // interrumpir el dibujo.
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    const p = posicion(e);
    radioRef.current = GROSOR_MAX * 0.5;
    ultimoRef.current = p;
    actualRef.current = [];
    colaRef.current = [p];
  };

  const alMover = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!actualRef.current) return;
    // getCoalescedEvents recupera los puntos que el navegador agrupó entre
    // fotogramas: el trazo sale más fiel sin escuchar más eventos.
    const agrupados =
      typeof e.nativeEvent.getCoalescedEvents === "function"
        ? e.nativeEvent.getCoalescedEvents()
        : [];
    // Si no hay agrupados (o el navegador devuelve la lista vacía), vale el
    // propio evento: si no, no se registraría ningún punto y el trazo se
    // quedaría en el punto inicial.
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

    // Salida afilada: se rebajan los últimos radios en rampa hasta la punta.
    const n = Math.min(PUNTAS, trazo.length);
    for (let i = 0; i < n; i++) {
      const p = trazo[trazo.length - 1 - i];
      p.r = Math.max(1, p.r * ((i + 1) / (n + 1)));
    }
    trazosRef.current.push(trazo);

    // Tope de memoria: se olvidan los trazos más antiguos.
    let total = trazosRef.current.reduce((s, t) => s + t.length, 0);
    while (total > MAX_PUNTOS && trazosRef.current.length > 1) {
      total -= trazosRef.current.shift()!.length;
    }
    repintar();
  };

  const limpiar = () => {
    trazosRef.current = [];
    actualRef.current = null;
    colaRef.current = [];
    repintar();
  };

  return (
    <section className={`lienzo-fluido${MODO === "violeta" ? " es-violeta" : ""}`}>
      <div className="lienzo-cabecera">
        <p className="lienzo-pista">
          <LangText es="Dibuja aquí ↓" en="Draw here ↓" />
        </p>
        <button type="button" className="lienzo-reset" onClick={limpiar}>
          {lang === "en" ? "Reset" : "Borrar"}
        </button>
      </div>

      {/* El filtro que produce la fusión. Va oculto: solo se referencia. */}
      <svg className="lienzo-defs" aria-hidden="true">
        <defs>
          <filter id="lienzo-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="difuso" />
            <feColorMatrix
              in="difuso"
              mode="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 24 -12"
            />
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
      </div>
    </section>
  );
}
