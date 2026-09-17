"use client";

import { useEffect, useRef } from "react";
import "./VideoMarca.css";

// Una pieza de animación de la marca, servida como archivo propio.
//
// Se reproduce sola al llegar —no al cargar la página, que si no habría dado
// una vuelta entera antes de que nadie lo vea— y en bucle. El observador salta
// con una pantalla de margen por delante: así, en una conexión de móvil, le da
// tiempo a llenar el búfer y cuando se llega ya está rodando.
//
// Sin sonido y con `playsInline`: es la única manera de que un navegador deje
// arrancar un vídeo sin que el usuario lo pida, y en iPhone de que no se abra a
// pantalla completa. Y sin controles: aquí es una pieza de la lámina, no algo
// que haya que manejar. Todos los vídeos que entran por aquí van mudos de
// origen, así que no se pierde nada al silenciarlos.
export default function VideoMarca({
  src,
  proporcion = "1920 / 573",
  alt,
}: {
  src: string;
  /** Proporción de la caja. La de por defecto es la franja recortada del
      vídeo de apertura; una pieza a formato completo pide "16 / 9". */
  proporcion?: string;
  /** Qué se ve, para quien no pueda verlo. */
  alt?: string;
}) {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.play().catch(() => {
            // Si el navegador se niega, se queda en su primer fotograma. No hay
            // nada que rescatar: sin controles, tampoco hay a qué recurrir.
          });
          obs.disconnect();
        }
      },
      { rootMargin: "100% 0px 100% 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="ym-video" style={{ aspectRatio: proporcion }}>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={video}
        src={src}
        muted
        loop
        playsInline
        preload="auto"
        aria-label={alt}
      />
    </div>
  );
}
