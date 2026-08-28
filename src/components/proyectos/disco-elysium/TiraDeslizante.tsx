import "./TiraDeslizante.css";

// Dos imágenes en un mismo marco, turnándose: se queda unos segundos en una,
// se desliza de lado hasta la otra, espera, y vuelve. En bucle.
//
// Va con una animación CSS y sin JavaScript: no hay estado que llevar ni
// eventos que escuchar, así que el navegador puede animarlo en el compositor
// y no cuesta nada aunque quede fuera de pantalla.
export default function TiraDeslizante({
  imagenes,
}: {
  imagenes: { src: string; alt: string }[];
}) {
  return (
    <div className="tirad">
      {/* La pista mide tantas veces el ancho del marco como imágenes lleve, y
          es ella la que se desplaza. */}
      <div
        className="tirad-pista"
        style={{ ["--n" as string]: imagenes.length }}
      >
        {imagenes.map((im) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={im.src} src={im.src} alt={im.alt} loading="lazy" />
        ))}
      </div>
    </div>
  );
}
