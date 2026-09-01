"use client";

import { useEffect, useRef } from "react";

// El cartel de cristal esmerilado, como el de la portada, reutilizable para los
// popups que se abren sobre el universo de símbolos.
//
// Sale de la portada y no al revés porque allí es donde se definió el lenguaje:
// borde blanco fino, fondo apenas teñido y el fondo real desenfocado por detrás.
// Aquí eso hace además un trabajo práctico —los símbolos se siguen viendo
// moverse detrás del cristal, así que el popup no corta la escena, se posa
// encima.
export default function Cartel({
  children,
  onCerrar,
  ancho,
  etiqueta,
}: {
  children: React.ReactNode;
  // Cerrar con Escape y pulsando fuera. No se pone un aspa: el popup siempre
  // trae sus propios botones, y un aspa más sería una tercera manera de salir.
  onCerrar?: () => void;
  ancho?: string;
  etiqueta: string;
}) {
  const cajaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!onCerrar) return;
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
    };
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [onCerrar]);

  // El foco entra en el cartel al abrirse. Sin esto, quien navega con teclado
  // seguiría en el botón de detrás y tabularía por toda la página antes de
  // llegar a lo que se le acaba de poner delante.
  useEffect(() => {
    cajaRef.current?.focus();
  }, []);

  return (
    <div
      className="cartel-fondo"
      onPointerDown={(e) => {
        // Solo si el clic cae en el fondo, no dentro del cartel.
        if (e.target === e.currentTarget) onCerrar?.();
      }}
    >
      <div
        ref={cajaRef}
        className="cartel"
        style={ancho ? { width: ancho } : undefined}
        role="dialog"
        aria-modal="true"
        aria-label={etiqueta}
        tabIndex={-1}
      >
        {children}
      </div>
    </div>
  );
}
