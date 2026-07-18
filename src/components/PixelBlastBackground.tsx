"use client";

import { useEffect, useState } from "react";
import PixelBlast from "./PixelBlast";
import { EFFECTS } from "@/config/effects";

// Fondo global con el PixelBlast real (WebGL). Fijo, detrás del contenido.
// Se auto-desactiva si el navegador no tiene aceleración por hardware o si
// el rendimiento cae, para que nunca vaya lento.

// ¿El WebGL corre por software (sin GPU)? En ese caso no lo cargamos.
function isSoftwareOrNoWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl2") || c.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return true; // sin WebGL → no cargar
    const dbg = gl.getExtension("WEBGL_debug_renderer_info");
    const r = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || "") : "";
    return /swiftshader|software|llvmpipe|basic render|microsoft basic/i.test(r);
  } catch {
    return true;
  }
}

export default function PixelBlastBackground() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!EFFECTS.backgroundPixels || reduce || isSoftwareOrNoWebGL()) return;
    setEnabled(true);
  }, []);

  // Guardián de FPS: si el efecto hace caer el rendimiento, se desactiva.
  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    let frames = 0;
    let t0 = 0;
    const start = () => {
      t0 = performance.now();
      const tick = () => {
        frames++;
        const dt = performance.now() - t0;
        if (dt < 1400) {
          raf = requestAnimationFrame(tick);
        } else if (frames / (dt / 1000) < 30) {
          setEnabled(false); // rendimiento bajo → fuera
        }
      };
      raf = requestAnimationFrame(tick);
    };
    // Espera un poco al arranque del WebGL antes de medir
    const to = window.setTimeout(start, 600);
    return () => {
      clearTimeout(to);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

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

  if (!enabled) return null;

  // Blanco sobre oscuro / oscuro sobre claro, para que siempre se vea.
  const color = theme === "dark" ? "#F2EEE2" : "#1C1A16";

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} aria-hidden="true">
      <PixelBlast
        variant="circle"
        pixelSize={3}
        color={color}
        patternScale={2.25}
        patternDensity={0.05}
        pixelSizeJitter={0.1}
        enableRipples
        rippleSpeed={0.4}
        rippleThickness={0.12}
        rippleIntensityScale={1.5}
        liquid={false}
        speed={0.6}
        edgeFade={0}
        transparent
        maxPixelRatio={1}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
