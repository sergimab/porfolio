"use client";

import { useRef, useState } from "react";
import "./VideoPromo.css";

// El vídeo promocional, servido como archivo propio.
//
// A diferencia de las piezas cortas de la página, este **suena**: lleva música
// de principio a fin, y sin ella la pieza no es lo que es. Eso decide todo lo
// demás:
//
// - No arranca solo. Ningún navegador deja empezar un vídeo con sonido sin que
//   lo pidan, y forzarlo mudo sería enseñar media pieza.
// - Lleva cartel (`poster`). Como no empieza solo, el hueco estaría en negro
//   hasta que alguien lo pulsara; con el fotograma puesto se ve de qué va.
// - Y **los controles solo aparecen cuando hace falta**: mientras está parado,
//   lo único que hay que decidir es si se ve o no, así que se enseña un botón
//   de play en el centro y nada más. En cuanto arranca entran los controles del
//   navegador —parar, volumen, minutaje—, que es cuando hay algo que manejar.
//   Se ponen los del navegador, no unos dibujados: son los que el visitante ya
//   sabe usar, los que responden al teclado y los que salen bien en cada
//   sistema.
//
// `preload="metadata"`: se piden solo la duración y las medidas, no los 6,8 MB
// del archivo. Lo demás llega al pulsar, que es cuando hace falta.
export default function VideoPromo({
  src,
  poster,
  titulo,
}: {
  src: string;
  poster: string;
  titulo: string;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [arrancado, setArrancado] = useState(false);

  const arrancar = () => {
    const el = video.current;
    if (!el) return;
    el.play().catch(() => {
      // Si el navegador se niega, al menos que queden los controles a mano.
    });
    setArrancado(true);
  };

  return (
    <div className="ym-promo">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={video}
        src={src}
        poster={poster}
        controls={arrancado}
        preload="metadata"
        playsInline
        aria-label={titulo}
      />
      {arrancado ? null : (
        <button type="button" className="ym-promo-play" onClick={arrancar}>
          {/* El triángulo, dibujado: el carácter ▶ cambia de forma y de peso
              según la tipografía, y aquí tiene que ser el mismo en todas
              partes. Va desplazado un pelo a la derecha porque un triángulo
              centrado por su caja se ve descentrado: el ojo lo equilibra por el
              área, y la punta pesa menos que la base. */}
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M9 6.5 L18 12 L9 17.5 Z" fill="currentColor" />
          </svg>
          <span className="ym-promo-play-texto">Reproducir {titulo}</span>
        </button>
      )}
    </div>
  );
}
