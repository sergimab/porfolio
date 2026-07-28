// Los iconos en movimiento. Cada GIF trae su propio fondo verde corporativo,
// así que la caja que los agrupa se limita a poner el color del tema y el
// borde en el contrario. La primera fila lleva del 1 al 5 y la segunda el
// resto, tal cual está pensada la composición.

import "./IconoGifs.css";

const BASE = "/proyectos/iberdrola/iconografia/gifs";
const FILA_1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

function Fila({ nums }: { nums: number[] }) {
  return (
    <div className="icg-fila">
      {nums.map((n) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={n} className="icg-gif" src={`${BASE}/${n}.gif`} alt="" aria-hidden="true" />
      ))}
    </div>
  );
}

export default function IconoGifs() {
  return (
    <div className="icg">
      <Fila nums={FILA_1} />
    </div>
  );
}
