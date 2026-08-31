"use client";

import { useEffect, useRef } from "react";

// El campo de estrellas del fondo.
//
// Va por código y no como imagen a propósito. En el render original las
// estrellas venían FUNDIDAS con los siete símbolos en un mismo PNG, y aquí los
// símbolos tienen que flotar por su cuenta —hoy solo uno— y moverse por delante
// del fondo. Con la imagen habría que elegir entre las estrellas y los iconos
// sueltos; generándolas, se pueden tener las dos cosas. De paso llenan
// cualquier pantalla sin estirarse y pesan cero.
type Estrella = {
  x: number;
  y: number;
  r: number;
  brillo: number;
  // Cada estrella parpadea a su ritmo y con su desfase; sin esto todas
  // titilarían a la vez y se vería el latido de la pantalla entera.
  ritmo: number;
  fase: number;
};

// Estrellas por millón de píxeles. Se cuenta por área y no en total para que la
// densidad se vea igual en un móvil que en un monitor ancho.
const DENSIDAD = 700;

export default function Galaxia() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let estrellas: Estrella[] = [];
    let raf = 0;

    const sembrar = () => {
      const { width, height } = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cuantas = Math.round((width * height * DENSIDAD) / 1e6);
      estrellas = Array.from({ length: cuantas }, () => {
        // El tamaño va sesgado a lo pequeño: unas pocas grandes entre muchas
        // diminutas. Repartido por igual, el cielo parece una trama.
        const t = Math.random();
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          r: 0.3 + t * t * t * 1.9,
          brillo: 0.35 + Math.random() * 0.65,
          ritmo: 0.0004 + Math.random() * 0.0012,
          fase: Math.random() * Math.PI * 2,
        };
      });
    };

    const pintar = (t: number) => {
      const { width, height } = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);
      for (const e of estrellas) {
        const titilar = quieto ? 1 : 0.72 + 0.28 * Math.sin(t * e.ritmo + e.fase);
        ctx.globalAlpha = Math.min(1, e.brillo * titilar);
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const bucle = (t: number) => {
      raf = requestAnimationFrame(bucle);
      pintar(t);
    };

    sembrar();
    if (quieto) pintar(0);
    else raf = requestAnimationFrame(bucle);

    const ro = new ResizeObserver(() => {
      sembrar();
      if (quieto) pintar(0);
    });
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="galaxia" aria-hidden="true" />;
}
