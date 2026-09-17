"use client";

import { useEffect, useRef } from "react";
import "./VideoMarca.css";

// El vídeo de la marca, que abre el proyecto.
//
// Se reproduce solo al llegar —no al cargar la página, que si no habría dado
// una vuelta entera antes de que nadie lo vea— y en bucle.
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
      // Con margen por delante: el vídeo arranca una pantalla antes de
      // asomarse, de modo que en una conexión de móvil le dé tiempo a llenar
      // el búfer y, cuando se llega, ya esté rodando. Antes era al revés —un
      // -20 % que lo retrasaba hasta tenerlo bien dentro—, y en el móvil eso
      // se notaba como un cuadro parado que tardaba en despertar.
      { rootMargin: "100% 0px 100% 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="ym-video">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      {/* `preload="auto"`: el archivo pesa 157 kB —va sin pista de sonido, que
          aquí no pinta nada—, así que sale más barato traerlo entero de una vez
          que pedir los metadatos y luego el resto cuando ya hace falta. */}
      <video ref={video} src="/proyectos/yelmo/branding/rebranding-muestra.mp4" muted loop playsInline preload="auto" />
    </div>
  );
}
