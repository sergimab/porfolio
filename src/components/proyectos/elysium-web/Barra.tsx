"use client";

import Link from "next/link";

// La barra de la web de Elysium, la misma en todas sus pantallas.
//
// Nació dentro de la página del disco, que es donde estaba dibujada, pero es la
// cabecera del sitio entero: el universo de símbolos y el trazado también la
// llevan. Lo único que cambia de una pantalla a otra es sobre qué papel cae, y
// eso lo dice `clara`: la página del disco va sobre blanco y el resto sobre el
// negro de la web.
//
// A la izquierda, donde en el diseño iba el menú, va la salida al portfolio. Un
// menú de tres rayas que no abre nada es una promesa que no se cumple, y en
// cambio la salida sí hace falta: sin ella, quien entra aquí se queda dentro.
export default function Barra({ clara = false }: { clara?: boolean }) {
  return (
    <header className={`ely-barra${clara ? " es-clara" : ""}`}>
      <Link className="ely-salir" href="/?cat=uiux">
        <svg width="7" height="12" viewBox="0 0 8 14" fill="none" stroke="currentColor"
             strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6.5 1 1.5 7l5 6" />
        </svg>
        <span>Volver al portfolio</span>
      </Link>

      <p className="ely-marca">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/proyectos/elysium-web/logo-elysium.webp" alt="Elysium" />
        <span>Lady Gaga</span>
      </p>
    </header>
  );
}
