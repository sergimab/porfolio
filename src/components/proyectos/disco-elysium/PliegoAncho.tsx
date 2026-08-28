import "./PliegoAncho.css";

// Un pliego muy apaisado (el desplegable mide casi setenta centímetros, con lo
// que su imagen es cinco veces más ancha que alta).
//
// En escritorio cabe entero a todo el ancho. En móvil no: reducido a 327px de
// ancho quedaría en 63px de alto y no se distinguiría nada, así que ahí se le
// fija una altura legible y se desplaza con el dedo, como el muestrario de
// iconos de la página de Elysium.
export default function PliegoAncho({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="pliego">
      <div className="pliego-scroll">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} loading="lazy" />
      </div>
    </div>
  );
}
