"use client";

import { useEffect, useRef, useState } from "react";
import { EFFECTS } from "@/config/effects";

// Efecto de píxeles ligero en canvas 2D:
//  - Fondo: píxeles que aparecen y desaparecen de forma aleatoria (sutil).
//  - Al pulsar sobre el fondo: un "blast" de píxeles que se expande.
// Sin WebGL: barato y fluido.

type Sparkle = { x: number; y: number; age: number; life: number };
type Ring = { x: number; y: number; age: number };

const CELL = 6; // tamaño del píxel (px)
const BG_DENSITY = 1800; // menor = más píxeles (1 píxel por ~N px² de pantalla)
const BG_CAP = 900; // tope duro de píxeles vivos
const BG_LIFE_MIN = 45;
const BG_LIFE_MAX = 100;
const RING_SPEED = 5.5; // px por frame que crece el blast
const RING_MAX_AGE = 46; // frames de vida del blast

export default function PixelFX() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(EFFECTS.backgroundPixels && !reduce);
  }, []);

  useEffect(() => {
    const read = () =>
      setTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light");
    read();
    const onTheme = (e: Event) => {
      const t = (e as CustomEvent).detail;
      if (t === "light" || t === "dark") setTheme(t);
    };
    window.addEventListener("themechange", onTheme);
    return () => window.removeEventListener("themechange", onTheme);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let bgMax = 0;
    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      bgMax = Math.min(BG_CAP, Math.round((w * h) / BG_DENSITY));
    };
    resize();
    window.addEventListener("resize", resize);

    // Color del píxel según tema (verde de marca)
    const rgb = theme === "dark" ? "91, 211, 140" : "0, 64, 42";

    const bg: Sparkle[] = [];
    const rings: Ring[] = [];

    const snap = (v: number) => Math.floor(v / CELL) * CELL;

    const INTERACTIVE = "a,button,input,textarea,select,label,[role='button']";
    const onPointerDown = (e: PointerEvent) => {
      const el = e.target as Element | null;
      if (el && el.closest(INTERACTIVE)) return; // solo clics en el fondo
      rings.push({ x: e.clientX, y: e.clientY, age: 0 });
      if (rings.length > 6) rings.shift();
    };
    window.addEventListener("pointerdown", onPointerDown, { passive: true });

    let raf = 0;
    const tick = () => {
      ctx.clearRect(0, 0, w, h);

      // Fondo: generar nuevos píxeles aleatorios hasta el tope
      while (bg.length < bgMax) {
        bg.push({
          x: snap(Math.random() * w),
          y: snap(Math.random() * h),
          age: 0,
          life: BG_LIFE_MIN + Math.random() * (BG_LIFE_MAX - BG_LIFE_MIN),
        });
      }
      for (let i = bg.length - 1; i >= 0; i--) {
        const p = bg[i];
        p.age++;
        if (p.age >= p.life) { bg.splice(i, 1); continue; }
        const t = p.age / p.life;
        const alpha = Math.sin(t * Math.PI) * 0.5; // aparece y desaparece
        ctx.fillStyle = `rgba(${rgb}, ${alpha})`;
        ctx.fillRect(p.x, p.y, CELL - 1, CELL - 1);
      }

      // Blast: anillos de píxeles que se expanden desde el clic
      for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i];
        r.age++;
        if (r.age > RING_MAX_AGE) { rings.splice(i, 1); continue; }
        const radius = r.age * RING_SPEED;
        const fade = 1 - r.age / RING_MAX_AGE;
        const alpha = fade * 0.9;
        const count = Math.min(140, Math.max(10, Math.round((2 * Math.PI * radius) / CELL)));
        for (let k = 0; k < count; k++) {
          const a = (k / count) * Math.PI * 2;
          const px = snap(r.x + Math.cos(a) * radius);
          const py = snap(r.y + Math.sin(a) * radius);
          if (px < 0 || py < 0 || px > w || py > h) continue;
          ctx.fillStyle = `rgba(${rgb}, ${alpha})`;
          ctx.fillRect(px, py, CELL - 1, CELL - 1);
        }
      }

      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointerdown", onPointerDown);
      cancelAnimationFrame(raf);
    };
  }, [enabled, theme]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
    />
  );
}
