import "./VideoVimeo.css";

// Un vídeo alojado en Vimeo. Va en su reproductor —no como archivo— porque es
// donde está subido: así no hay que duplicar el montaje en el repositorio y
// Vimeo se encarga de servir la calidad que toque en cada conexión.
//
// `loading="lazy"`: el reproductor no se pide hasta que la página se acerca a
// él, que si no cada visita cargaría los scripts de Vimeo aunque nadie llegara
// a verlo.
export default function VideoVimeo({
  id,
  hash,
  titulo,
}: {
  id: string;
  hash: string;
  titulo: string;
}) {
  return (
    <div className="ym-vimeo">
      <iframe
        src={`https://player.vimeo.com/video/${id}?h=${hash}`}
        title={titulo}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
        allowFullScreen
      />
    </div>
  );
}
