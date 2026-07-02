"use client";

import { useEffect, useRef } from "react";

const SELECTOR = ".hover-trail-target, .panel-btn-tile, .back-to-top-btn, .theme-toggle-dot";

type Point = { x: number; y: number; alpha: number; hue: number; rect: DOMRect; radius: number };

function parseRadius(computed: string, w: number, h: number): number {
  const val = computed.split(" ")[0]; // uniform corners only (our shapes)
  const size = Math.min(w, h);
  if (val.endsWith("%")) return (parseFloat(val) / 100) * size;
  const px = parseFloat(val);
  return Number.isFinite(px) ? Math.min(px, size / 2) : 0;
}

function clipToShape(ctx: CanvasRenderingContext2D, rect: DOMRect, radius: number) {
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(rect.left, rect.top, rect.width, rect.height, radius);
  } else {
    const { left: x, top: y, width: w, height: h } = rect;
    const r = Math.min(radius, w / 2, h / 2);
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
  }
  ctx.clip();
}

export default function HoverTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<Point[]>([]);
  const hueRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: PointerEvent) => {
      const target = (e.target as Element)?.closest(SELECTOR);
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const radius = parseRadius(getComputedStyle(target).borderRadius, rect.width, rect.height);
      hueRef.current = (hueRef.current + 2.2) % 360;
      pointsRef.current.push({ x: e.clientX, y: e.clientY, alpha: 0.32, hue: hueRef.current, rect, radius });
      if (pointsRef.current.length > 260) pointsRef.current.shift();
    };
    window.addEventListener("pointermove", onMove);

    const tick = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      const pts = pointsRef.current;
      ctx.globalCompositeOperation = "lighter";
      for (let i = pts.length - 1; i >= 0; i--) {
        const p = pts[i];
        p.alpha *= 0.978;
        if (p.alpha < 0.006) { pts.splice(i, 1); continue; }
        ctx.save();
        clipToShape(ctx, p.rect, p.radius);
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 46);
        g.addColorStop(0, `hsla(${p.hue}, 80%, 65%, ${p.alpha})`);
        g.addColorStop(0.55, `hsla(${(p.hue + 40) % 360}, 80%, 60%, ${p.alpha * 0.45})`);
        g.addColorStop(1, `hsla(${p.hue}, 80%, 60%, 0)`);
        ctx.fillStyle = g;
        ctx.fillRect(p.x - 48, p.y - 48, 96, 96);
        ctx.restore();
      }
      ctx.globalCompositeOperation = "source-over";
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 5 }}
    />
  );
}
