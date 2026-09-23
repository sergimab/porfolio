"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import "./Galeria.css";

// La galería de la sesión: un muro de fotos que flotan, y cualquiera de ellas
// se abre en grande sobre el resto.
//
// DOS TAMAÑOS POR FOTO, y esa es la decisión que sostiene todo lo demás. El
// muro usa copias de 640 px —cuarenta fotos a tamaño de lectura serían doce
// megas antes de ver nada— y la versión de 1500 solo se pide cuando se abre
// una. Así la página entra con un mega y pico y el grande llega en el momento
// en que hace falta, que además es cuando el navegador no tiene otra cosa que
// hacer.
export default function Galeria({ total, carpeta, alt }: { total: number; carpeta: string; alt: string }) {
  const fotos = Array.from({ length: total }, (_, i) => String(i + 1).padStart(2, "0"));
  const [abierta, setAbierta] = useState<string | null>(null);
  // De dónde se salió, para devolver el foco al cerrar: quien navega con
  // teclado tiene que volver a la foto que abrió, no al principio de la página.
  const volverA = useRef<HTMLElement | null>(null);

  const cerrar = useCallback(() => {
    setAbierta(null);
    volverA.current?.focus();
    volverA.current = null;
  }, []);

  useEffect(() => {
    if (!abierta) return;
    const tecla = (e: KeyboardEvent) => { if (e.key === "Escape") cerrar(); };
    document.addEventListener("keydown", tecla);
    // Con una foto abierta, la página de detrás no se mueve: si no, al cerrar
    // uno se encuentra en otro sitio del documento sin haber hecho nada.
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", tecla);
      document.body.style.overflow = antes;
    };
  }, [abierta, cerrar]);

  return (
    <>
      {/* El muro se difumina y SE PARA cuando hay una abierta. Lo segundo
          importa tanto como lo primero: un fondo borroso que además se mueve
          tira del ojo justo cuando se está mirando otra cosa. */}
      <div className={`gt-muro${abierta ? " es-al-fondo" : ""}`}>
        {fotos.map((n, i) => (
          <button
            key={n}
            type="button"
            className="gt-foto"
            // Cada una flota a su aire. El desfase negativo arranca la
            // animación ya empezada, que si no las cuarenta subirían y bajarían
            // a la vez y el muro entero parecería respirar de golpe.
            style={{
              ["--gt-dur" as string]: `${7 + (i % 5) * 1.6}s`,
              ["--gt-espera" as string]: `-${(i % 7) * 1.3}s`,
              ["--gt-giro" as string]: `${((i % 3) - 1) * 0.6}deg`,
            }}
            onClick={(e) => { volverA.current = e.currentTarget; setAbierta(n); }}
            aria-label={`${alt} ${i + 1}. Ver en grande`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${carpeta}/mini/${n}.webp`} alt="" loading="lazy" />
          </button>
        ))}
      </div>

      {abierta && (
        // El velo entero es el botón de cerrar: se pulsa fuera y se vuelve, que
        // es lo que pediste y además lo que hace todo el mundo sin pensarlo.
        // La foto de dentro no propaga el clic, así que pulsarla no cierra.
        <div
          className="gt-lupa"
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={cerrar}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${carpeta}/grande/${abierta}.webp`}
            alt={alt}
            onClick={(e) => e.stopPropagation()}
          />
          <button type="button" className="gt-cerrar" onClick={cerrar} aria-label="Cerrar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}
