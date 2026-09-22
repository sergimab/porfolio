import "./Carrusel.css";

// Una tira de imágenes pasando hacia la izquierda sin parar.
//
// LA LISTA VA DOS VECES A PROPÓSITO. El bucle se hace desplazando la tira
// justo la mitad de su ancho, de modo que al acabar la segunda copia queda
// donde estaba la primera al empezar y el salto de vuelta cae en un fotograma
// idéntico. Con una sola copia habría que volver a cero desde el final, que es
// el tirón clásico de este tipo de carruseles.
//
// La copia se marca con aria-hidden, que para quien lo oiga en vez de verlo
// las imágenes son las que son y no el doble.
//
// Lo usan los dos carruseles de la página, el de la sesión y el de los posts
// del año pasado, con una sola diferencia entre ellos: cuántas imágenes llevan
// y a qué velocidad pasan. De ahí que la duración venga de fuera, porque una
// tira más larga necesita más tiempo para recorrerse al mismo paso.
export default function Carrusel({
  fotos,
  segundos = 60,
  modificador,
}: {
  fotos: { src: string; alt: string }[];
  /** Lo que tarda la tira en dar una vuelta entera. */
  segundos?: number;
  /** Una clase extra, para las tiras que no van al alto de siempre. */
  modificador?: string;
}) {
  return (
    <div className={`ot-carrusel${modificador ? ` ${modificador}` : ""}`}>
      {/* La duración va como variable y no como `animation-duration` a pelo: un
          estilo en línea le gana a la hoja de estilos, y en el móvil la tira
          tiene que ir más rápida. */}
      <div className="ot-carrusel-tira" style={{ ["--ot-dur" as string]: `${segundos}s` }}>
        {[0, 1].map((copia) =>
          fotos.map((f) => (
            <figure key={`${copia}-${f.src}`} aria-hidden={copia === 1}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {/* LA PRIMERA COPIA NO VA DIFERIDA Y LA SEGUNDA SÍ. Diferir una
                  imagen que está fuera de la pantalla POR LA DERECHA, dentro de
                  una tira con el desbordamiento oculto, es pedirle al navegador
                  que adivine cuándo va a entrar; algunos no lo resuelven y la
                  imagen no llega nunca, que es una tira con huecos en blanco
                  moviéndose. Pesan treinta kilos cada una, así que la vuelta
                  entera se pide de golpe y se acabó el problema. La segunda
                  copia sí se difiere, que es la misma lista otra vez. */}
              <img src={f.src} alt={copia === 0 ? f.alt : ""} loading={copia === 0 ? "eager" : "lazy"} />
            </figure>
          ))
        )}
      </div>
    </div>
  );
}
