import { raleway } from "./fuente";
import "./Paleta.css";

// Los colores de la marca, montados con la forma del propio isotipo.
//
// No es una captura: las muestras son color de verdad —el mismo valor que
// llevan la web y la app—, así que lo que se ve aquí es exactamente lo que se
// usa, y en una pantalla mejor se ve mejor en vez de más borroso.
//
// LA COLOCACIÓN NO ES DECORACIÓN. Las cinco casillas van escalonadas sobre la
// misma cuadrícula de cuadrados de la que sale el isotipo y la textura del
// escáner: la paleta tiene la forma de la marca.

// Fila y columna de cada muestra dentro de una cuadrícula de 3 × 3. Los huecos
// que quedan son parte del dibujo, no un despiste.
const MUESTRAS: { col: number; fila: number; hex: string; clara?: boolean }[] = [
  { col: 1, fila: 1, hex: "#252525" },
  { col: 2, fila: 2, hex: "#FF1597" },
  { col: 1, fila: 3, hex: "#FFFFFF", clara: true },
  { col: 3, fila: 3, hex: "#3D00E4" },
];

// La quinta casilla no es un color: es la MEZCLA de los dos vibrantes, el rosa
// y el azul, que es como aparecen en el escáner y en los degradados de la app.
// Va sin rótulo porque no es un valor que se pueda apuntar.
const MEZCLA = { col: 3, fila: 2 };

export default function Paleta() {
  return (
    <div className={`am-paleta ${raleway.variable}`}>
      {MUESTRAS.map((m) => (
        <span
          key={m.hex}
          className={`am-paleta-celda${m.clara ? " es-clara" : ""}`}
          style={{ gridColumn: m.col, gridRow: m.fila, background: m.hex }}
        >
          <span className="am-paleta-hex">{m.hex}</span>
        </span>
      ))}

      <span
        className="am-paleta-celda es-mezcla"
        style={{ gridColumn: MEZCLA.col, gridRow: MEZCLA.fila }}
      />
    </div>
  );
}
