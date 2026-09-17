import "./VideoVimeo.css";

// Un vídeo alojado en Vimeo. Va en su reproductor —no como archivo— porque es
// donde está subido: así no hay que duplicar el montaje en el repositorio y
// Vimeo se encarga de servir la calidad que toque en cada conexión.
//
// `background=1` es el modo del reproductor sin nada alrededor: ni botones, ni
// título, ni barra de tiempo. Arranca solo, en bucle y en silencio —es lo que
// exige cualquier navegador para dejar que un vídeo empiece sin que se lo
// pidan—, así que aquí la pieza se mira, no se maneja.
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
        src={`https://player.vimeo.com/video/${id}?h=${hash}&background=1`}
        title={titulo}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
        allowFullScreen
      />
    </div>
  );
}
