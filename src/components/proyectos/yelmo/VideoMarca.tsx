"use client";

import { useEffect, useRef } from "react";
import "./VideoMarca.css";

// El vídeo de la marca, que abre el proyecto.
//
// Se reproduce solo al llegar —no al cargar la página, que si no habría
// terminado antes de que nadie lo vea— y va SIN bucle: al acabar se queda
// parado en su último fotograma, que es el logotipo montado.
//
// Sin sonido y con `playsInline`: es la única manera de que un navegador deje
// arrancar un vídeo sin que el usuario lo pida, y en iPhone de que no se abra a
// pantalla completa. Y sin controles: aquí es una pieza de la lámina, no algo
// que haya que manejar.
export default function VideoMarca() {
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
      { rootMargin: "0px 0px -20% 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="ym-video">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video ref={video} src="/proyectos/yelmo/branding/rebranding.mp4" muted playsInline preload="metadata" />
    </div>
  );
}
