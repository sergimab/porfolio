"use client";

import { useEffect, useRef, useState } from "react";

// UNA PIEZA DE LA SERIE: un vídeo que se comporta como una imagen que se mueve.
//
// No lleva controles ni suena, y eso no es un descuido: son bucles cortos y
// callados, así que no hay nada que manejar —ni volumen, ni minutaje, ni un
// final al que llegar—. Poner una barra de reproducción debajo sería prometer
// unos mandos que no hacen falta. El vídeo promocional de Yelmo sí los lleva,
// porque aquello es una pieza con música y con principio y final.
//
// ARRANCA SOLO CUANDO SE VE, y se para al salir de pantalla. Son tres vídeos en
// una misma página: dejándolos correr todos a la vez se descodifican tres
// secuencias para enseñar una, que en un portátil es el ventilador y en un móvil
// la batería. `preload="none"` remata lo mismo por el lado de la descarga: hasta
// que la pieza no se acerca al borde de la pantalla no se pide ni un byte.
//
// Y SI SE PIDE MENOS MOVIMIENTO, no arranca. Queda el cartel —un fotograma— y un
// botón para verlo a quien lo quiera. Una animación orgánica en bucle es
// exactamente lo que molesta a quien activa ese ajuste.
export default function Pieza({
  src,
  poster,
  titulo,
  descripcion,
}: {
  src: string;
  poster?: string;
  titulo: string;
  descripcion: React.ReactNode;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const caja = useRef<HTMLDivElement>(null);
  // Nulo mientras no se sabe: el ajuste se lee en el navegador, y decidirlo
  // antes daría un parpadeo entre lo que pinta el servidor y lo que toca.
  const [quieto, setQuieto] = useState<boolean | null>(null);
  const [aMano, setAMano] = useState(false);

  useEffect(() => {
    const pregunta = window.matchMedia("(prefers-reduced-motion: reduce)");
    const leer = () => setQuieto(pregunta.matches);
    leer();
    pregunta.addEventListener("change", leer);
    return () => pregunta.removeEventListener("change", leer);
  }, []);

  useEffect(() => {
    const el = video.current;
    const zona = caja.current;
    if (!el || !zona || quieto === null) return;
    if (quieto && !aMano) return;

    const ojo = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          // `preload` se sube aquí y no en el atributo: es lo que retrasa la
          // descarga hasta que la pieza está a punto de verse.
          el.preload = "auto";
          el.play().catch(() => {
            // Algunos navegadores se niegan a arrancar solos aunque esté mudo.
            // No se insiste: queda el cartel, que ya cuenta lo que hay.
          });
        } else {
          el.pause();
        }
      },
      // Con margen: empieza a cargar un poco antes de asomar, para que no se
      // vea el primer fotograma llegando tarde.
      { rootMargin: "200px 0px", threshold: 0.01 }
    );
    ojo.observe(zona);
    return () => ojo.disconnect();
  }, [quieto, aMano]);

  return (
    <figure className="mar-pieza" ref={caja}>
      <div className="mar-lienzo">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          ref={video}
          src={src}
          poster={poster}
          muted
          loop
          playsInline
          preload="none"
          aria-label={titulo}
        />
        {quieto && !aMano && (
          <button
            type="button"
            className="mar-play"
            onClick={() => setAMano(true)}
            aria-label={`Reproducir ${titulo}`}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5v14l11-7z" fill="currentColor" />
            </svg>
          </button>
        )}
      </div>
      <figcaption className="mar-pie">
        <h3>{titulo}</h3>
        <p>{descripcion}</p>
      </figcaption>
    </figure>
  );
}
