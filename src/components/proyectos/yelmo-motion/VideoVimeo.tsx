"use client";

import { useEffect, useRef, useState } from "react";
import "./VideoVimeo.css";

// Un vídeo alojado en Vimeo. Va en su reproductor porque de esta pieza no hay
// archivo a mano: es la única de la página que no se sirve desde aquí. Con el
// archivo iría mejor —las demás pesan menos de un mega y se ven al momento—,
// así que si aparece, se cambia.
//
// `background=1` es el modo del reproductor sin nada alrededor: ni botones, ni
// título, ni barra de tiempo. Arranca solo, en bucle y en silencio —es lo que
// exige cualquier navegador para dejar que un vídeo empiece sin que se lo
// pidan—, así que aquí la pieza se mira, no se maneja.
//
// El reproductor no se pide al cargar la página, que si no cada visita se
// bajaría los scripts de Vimeo aunque nadie llegase hasta aquí. Pero tampoco
// con `loading="lazy"`, que espera a tenerlo casi encima: montar el
// reproductor de Vimeo son varias peticiones en cadena —el iframe, sus
// scripts, y solo entonces el vídeo—, y en una conexión de móvil eso se ve
// como un cuadro negro que tarda. Aquí se monta cuando falta una pantalla
// larga para llegar, con lo que ese rodeo se hace mientras el visitante aún va
// leyendo lo de arriba.
export default function VideoVimeo({
  id,
  hash,
  titulo,
}: {
  id: string;
  hash: string;
  titulo: string;
}) {
  const caja = useRef<HTMLDivElement>(null);
  const [montar, setMontar] = useState(false);

  useEffect(() => {
    const el = caja.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setMontar(true);
          obs.disconnect();
        }
      },
      { rootMargin: "150% 0px 150% 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="ym-vimeo" ref={caja}>
      {/* Adelantar el saludo a los servidores de Vimeo —DNS, TCP y TLS— en
          cuanto se sabe que el vídeo va a hacer falta. Es lo que más se nota en
          móvil, donde esa ida y vuelta cuesta cientos de milisegundos. */}
      {montar ? (
        <>
          <link rel="preconnect" href="https://player.vimeo.com" />
          <link rel="preconnect" href="https://i.vimeocdn.com" />
          <link rel="preconnect" href="https://f.vimeocdn.com" />
          <iframe
            src={`https://player.vimeo.com/video/${id}?h=${hash}&background=1&dnt=1`}
            title={titulo}
            referrerPolicy="strict-origin-when-cross-origin"
            allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
            allowFullScreen
          />
        </>
      ) : null}
    </div>
  );
}
