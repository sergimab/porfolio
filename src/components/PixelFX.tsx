"use client";

import { useEffect, useRef, useState } from "react";
import { EFFECTS } from "@/config/effects";

// Efecto de píxeles ligero en canvas 2D:
//  - Fondo: píxeles que aparecen y desaparecen de forma aleatoria (sutil).
//  - Al pulsar sobre el fondo: un "blast" de píxeles que se expande.
//  - Al hacer hover en botones/cajas: un haz de píxeles clipado a su forma
//    (colores aleatorios en botones; verde de marca en las cajas con data-trail-hue).
// Sin WebGL: barato y fluido.

type Sparkle = { x: number; y: number; age: number; life: number };
type Ring = { x: number; y: number; age: number };
type HoverPix = { x: number; y: number; age: number; life: number; color: string; rect: RRect };
type RRect = { l: number; t: number; w: number; h: number; rad: number };

const CELL = 6; // tamaño del píxel (px)
const BG_DENSITY = 1800; // menor = más píxeles (1 píxel por ~N px² de pantalla)
const BG_CAP = 900; // tope duro de píxeles vivos
const BG_LIFE_MIN = 45;
const BG_LIFE_MAX = 100;
const RING_SPEED = 5.5; // px por frame que crece el blast
const RING_MAX_AGE = 46; // frames de vida del blast

const HOVER_SELECTOR = ".hover-trail-target, .panel-btn-tile, .back-to-top-btn, .theme-toggle-dot";
const HOVER_LIFE = 24;
const HOVER_CAP = 500;

function parseRadius(computed: string, w: number, h: number): number {
  const val = computed.split(" ")[0];
  const size = Math.min(w, h);
  if (val.endsWith("%")) return (parseFloat(val) / 100) * size;
  const px = parseFloat(val);
  return Number.isFinite(px) ? Math.min(px, size / 2) : 0;
}

// ¿El punto está dentro del rectángulo de esquinas redondeadas?
function inRoundRect(x: number, y: number, r: RRect): boolean {
  const { l, t, w, h } = r;
  if (x < l || x > l + w || y < t || y > t + h) return false;
  const rad = Math.min(r.rad, w / 2, h / 2);
  if (x >= l && x <= l + w && y >= t + rad && y <= t + h - rad) return true; // banda vertical
  if (y >= t && y <= t + h && x >= l + rad && x <= l + w - rad) return true; // banda horizontal
  const nx = Math.max(l + rad, Math.min(x, l + w - rad));
  const ny = Math.max(t + rad, Math.min(y, t + h - rad));
  const dx = x - nx;
  const dy = y - ny;
  return dx * dx + dy * dy <= rad * rad;
}

export default function PixelFX() {
  const bgRef = useRef<HTMLCanvasElement>(null);
  const fxRef = useRef<HTMLCanvasElement>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled((EFFECTS.backgroundPixels || EFFECTS.hover === "pixels") && !reduce);
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
    const bgCanvas = bgRef.current;
    const fxCanvas = fxRef.current;
    if (!bgCanvas || !fxCanvas) return;
    const ctx = bgCanvas.getContext("2d"); // fondo + blast (detrás del contenido)
    const fx = fxCanvas.getContext("2d"); // hover (encima del contenido)
    if (!ctx || !fx) return;

    let w = 0;
    let h = 0;
    let bgMax = 0;
    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      for (const c of [bgCanvas, fxCanvas]) {
        c.width = w;
        c.height = h;
        c.style.width = `${w}px`;
        c.style.height = `${h}px`;
      }
      bgMax = EFFECTS.backgroundPixels ? Math.min(BG_CAP, Math.round((w * h) / BG_DENSITY)) : 0;
    };
    resize();
    window.addEventListener("resize", resize);

    const rgb = theme === "dark" ? "91, 211, 140" : "0, 64, 42";

    const bg: Sparkle[] = [];
    const rings: Ring[] = [];
    const hover: HoverPix[] = [];

    const snap = (v: number) => Math.floor(v / CELL) * CELL;

    const INTERACTIVE = "a,button,input,textarea,select,label,[role='button']";
    const onPointerDown = (e: PointerEvent) => {
      if (!EFFECTS.backgroundPixels) return;
      const el = e.target as Element | null;
      if (el && el.closest(INTERACTIVE)) return; // solo clics en el fondo
      rings.push({ x: e.clientX, y: e.clientY, age: 0 });
      if (rings.length > 6) rings.shift();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (EFFECTS.hover !== "pixels") return;
      const el = (e.target as Element | null)?.closest(HOVER_SELECTOR);
      if (!el) return;
      const b = el.getBoundingClientRect();
      const rad = parseRadius(getComputedStyle(el).borderRadius, b.width, b.height);
      const rect: RRect = { l: b.left, t: b.top, w: b.width, h: b.height, rad };
      const fixedHue = el.getAttribute("data-trail-hue");
      for (let i = 0; i < 3; i++) {
        const x = snap(e.clientX + (Math.random() - 0.5) * 34);
        const y = snap(e.clientY + (Math.random() - 0.5) * 34);
        const color = fixedHue
          ? `hsl(${fixedHue}, 70%, 55%)`
          : `hsl(${Math.floor(Math.random() * 360)}, 85%, 62%)`;
        hover.push({ x, y, age: 0, life: HOVER_LIFE, color, rect });
      }
      if (hover.length > HOVER_CAP) hover.splice(0, hover.length - HOVER_CAP);
    };

    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    let raf = 0;
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      fx.clearRect(0, 0, w, h);

      // Fondo
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
        const alpha = Math.sin((p.age / p.life) * Math.PI) * 0.5;
        ctx.fillStyle = `rgba(${rgb}, ${alpha})`;
        ctx.fillRect(p.x, p.y, CELL - 1, CELL - 1);
      }

      // Blast al pulsar
      for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i];
        r.age++;
        if (r.age > RING_MAX_AGE) { rings.splice(i, 1); continue; }
        const radius = r.age * RING_SPEED;
        const alpha = (1 - r.age / RING_MAX_AGE) * 0.9;
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

      // Haz de píxeles en hover (canvas superior), clipado a la forma.
      // El canvas superior solo se composita cuando hay píxeles activos.
      fxCanvas.style.display = hover.length ? "block" : "none";
      for (let i = hover.length - 1; i >= 0; i--) {
        const p = hover[i];
        p.age++;
        if (p.age >= p.life) { hover.splice(i, 1); continue; }
        if (!inRoundRect(p.x, p.y, p.rect)) continue;
        fx.globalAlpha = Math.sin((p.age / p.life) * Math.PI) * 0.85;
        fx.fillStyle = p.color;
        fx.fillRect(p.x, p.y, CELL - 1, CELL - 1);
        fx.globalAlpha = 1;
      }

      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      cancelAnimationFrame(raf);
    };
  }, [enabled, theme]);

  if (!enabled) return null;

  return (
    <>
      {/* Fondo: detrás del contenido */}
      <canvas
        ref={bgRef}
        aria-hidden="true"
        style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
      />
      {/* Hover: por encima del contenido (como el haz) */}
      <canvas
        ref={fxRef}
        aria-hidden="true"
        style={{ position: "fixed", inset: 0, zIndex: 5, pointerEvents: "none" }}
      />
    </>
  );
}
