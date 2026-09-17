import "./VideoPromo.css";

// El vídeo promocional, servido como archivo propio.
//
// A diferencia de las piezas de la página de branding, este **suena**: lleva
// música de principio a fin, y sin ella la pieza no es lo que es. Eso decide
// todo lo demás:
//
// - No arranca solo. Ningún navegador deja empezar un vídeo con sonido sin que
//   lo pidan, y forzarlo mudo sería enseñar media pieza. Se ve cuando se pulsa.
// - Lleva controles. Si hay algo que manejar —el sonido, el minutaje de algo
//   que dura más de un minuto—, tiene que haber con qué.
// - Lleva cartel (`poster`). Como no empieza solo, el hueco estaría en negro
//   hasta que alguien lo pulsara; con el fotograma puesto se ve de qué va.
//
// `preload="metadata"`: se piden solo la duración y las medidas, no los 6,8 MB
// del archivo. Lo demás llega cuando se pulsa, que es cuando hace falta.
export default function VideoPromo({
  src,
  poster,
  titulo,
}: {
  src: string;
  poster: string;
  titulo: string;
}) {
  return (
    <div className="ym-promo">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video src={src} poster={poster} controls preload="metadata" playsInline aria-label={titulo} />
    </div>
  );
}
