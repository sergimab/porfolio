"use client";

import { useEffect, useRef, useState } from "react";

// Una pieza en movimiento de la página de motion.
//
// NO SE DESCARGA HASTA QUE HACE FALTA, y esa es toda la razón de que exista
// este componente en vez de un `<video autoplay>` a secas. En esta página hay
// NUEVE piezas: puestas a cargar todas de golpe son tres megas en cuanto se
// abre la página, y nueve vídeos descodificando a la vez en un móvil son un
// ventilador y una batería. Aquí el archivo ni siquiera se pide —`preload` a
// «none» y sin `src`— hasta que la pieza se acerca a la pantalla.
//
// El margen del observador es de una pantalla POR DELANTE: lo justo para que al
// llegar ya esté rodando, y no tanto como para acabar bajándolas todas en
// cuanto se pasa de largo. Estaba en media y en el móvil se quedaba corto —a
// velocidad de pulgar daba tiempo a ver el hueco en negro antes de que
// apareciera la pieza—, que es el único síntoma que tiene un vídeo que aún no
// ha llegado.
// Es un compromiso distinto del de las piezas de apertura del sitio, que
// arrancan al entrar de verdad porque son largas y perderse el principio se
// nota; estas duran seis segundos y van en bucle, así que da igual por dónde se
// las coja.
//
// Muda, en bucle, `playsInline` y sin controles: es una lámina, no algo que
// haya que manejar.
export default function Pieza({
  src,
  alt,
  proporcion,
}: {
  src: string;
  alt: string;
  /**
   * La proporción del archivo, para reservarle el sitio ANTES de tenerlo.
   * Es obligatoria y no un extra: un vídeo sin fuente no tiene tamaño propio,
   * así que sin esto el hueco mediría cero, la página se montaría con las seis
   * piezas amontonadas y saltaría entera al ir apareciendo cada una. Que es
   * justo lo que se evita no descargándolas de golpe.
   */
  proporcion: string;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [pedida, setPedida] = useState(false);

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setPedida(true);
        obs.disconnect();
      },
      { rootMargin: "100% 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // El `play()` va en su propio efecto y después de poner el `src`: pedirlo en
  // el mismo paso en que se monta la fuente es pedírselo a un vídeo que
  // todavía no tiene nada que reproducir.
  useEffect(() => {
    if (!pedida) return;
    video.current?.play().catch(() => {
      // Si el navegador se niega —ahorro de datos, por ejemplo—, la pieza se
      // queda en su primer fotograma. No hay nada que rescatar.
    });
  }, [pedida]);

  return (
    // eslint-disable-next-line jsx-a11y/media-has-caption
    <video
      ref={video}
      src={pedida ? src : undefined}
      muted
      loop
      playsInline
      preload="none"
      style={{ aspectRatio: proporcion }}
      aria-label={alt}
    />
  );
}
