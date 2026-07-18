"use client";

import { useEffect, useState } from "react";
import PixelBlast from "./PixelBlast";
import { EFFECTS } from "@/config/effects";

// Fondo global con el PixelBlast real (WebGL). Fijo, detrás del contenido.
// Parámetros basados en el recurso de React Bits que pasó el usuario.
export default function PixelBlastBackground() {
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
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
