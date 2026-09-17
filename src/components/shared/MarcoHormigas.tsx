import "./MarcoHormigas.css";

// Marco de guiones en marcha: el hilo de las cajas del sitio, pero partido y
// corriendo despacio alrededor, como las hormigas de un recorte.
//
// Va dibujado y no como borde del CSS porque un borde discontinuo no se puede
// poner en movimiento: los guiones los pinta el navegador y no hay manera de
// correrlos. Con el trazo de un SVG sí, moviendo su desfase.
//
// Quien lo use tiene que ser `position: relative` y no llevar borde propio: el
// marco se estira a sus cuatro lados y se pinta por delante de su contenido.
export default function MarcoHormigas() {
  return (
    <svg className="marco-hormigas" aria-hidden="true" focusable="false">
      <rect x="0.5" y="0.5" rx="15.5" ry="15.5" />
    </svg>
  );
}
