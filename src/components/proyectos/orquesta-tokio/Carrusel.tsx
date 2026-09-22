import "./Carrusel.css";

// Las fotos de la sesión que aportó el cliente, pasando hacia la izquierda.
//
// LA LISTA VA DOS VECES A PROPÓSITO. El bucle se hace desplazando la tira
// justo la mitad de su ancho, de modo que al acabar la segunda copia queda
// donde estaba la primera al empezar y el salto de vuelta cae en un fotograma
// idéntico. Con una sola copia habría que volver a cero desde el final, que es
// el tirón clásico de este tipo de carruseles.
//
// La copia se marca con aria-hidden: para quien lo oiga en vez de verlo, las
// fotos son nueve y no dieciocho.
const FOTOS = Array.from({ length: 9 }, (_, i) => `/proyectos/orquesta-tokio/sesion-${i + 1}.webp`);

export default function Carrusel({ alt }: { alt: string }) {
  return (
    <div className="ot-carrusel">
      <div className="ot-carrusel-tira">
        {[0, 1].map((copia) =>
          FOTOS.map((src) => (
            <figure key={`${copia}-${src}`} aria-hidden={copia === 1}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={copia === 0 ? alt : ""} loading="lazy" />
            </figure>
          ))
        )}
      </div>
    </div>
  );
}
