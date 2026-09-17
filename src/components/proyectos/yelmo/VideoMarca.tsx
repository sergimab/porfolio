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
  fondo = "#fff",
  encaje,
  cartel,
  alt,
}: {
  src: string;
  /** Proporción de la caja. La de por defecto es la franja recortada del
      vídeo de apertura; una pieza a formato completo pide "16 / 9". */
  proporcion?: string;
  /**
   * Color del hueco mientras carga. Por defecto blanco, que es el fondo de las
   * piezas de la construcción de la marca; una pieza oscura pide el suyo, para
   * que el marco no destelle antes de aparecer el primer fotograma.
   */
  fondo?: string;
  /**
   * Qué hacer cuando el vídeo y la caja no tienen la misma proporción. Por
   * defecto la llena y se recorta por los lados; con "contain" se ve entero y
   * quedan franjas del color del fondo, que es lo que pide una pieza apaisada
   * metida en una caja vertical.
   */
  encaje?: "cover" | "contain";
  /**
   * Fotograma que se enseña hasta que arranca. Solo hace falta cuando la pieza
   * empieza con un fundido: si no, el primer fotograma ya sirve de cartel y
   * poner otro sería enseñar algo que el vídeo aún no ha contado.
   */
  cartel?: string;
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
      // Arranca cuando la pieza ha entrado de verdad en pantalla, no antes: con
      // una pantalla de margen, al llegar ya iba por la mitad, y en piezas de
      // nueve segundos eso es perderse el principio. De que no se haga esperar
      // se encarga el `preload="auto"`, que trae el archivo mientras se lee lo
      // de arriba; esto solo decide cuándo empieza a rodar.
      { rootMargin: "0px 0px -15% 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="ym-video" style={{ aspectRatio: proporcion, background: fondo }}>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={video}
        src={src}
        poster={cartel}
        muted
        loop
        playsInline
        preload="auto"
        style={encaje ? { objectFit: encaje } : undefined}
        aria-label={alt}
      />
    </div>
  );
}
