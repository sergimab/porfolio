import { raleway } from "./fuente";
import "./Paleta.css";

// La lámina de color del manual, montada en web.
//
// No es una captura: las muestras son color de verdad —el mismo valor que
// llevan la web y la app—, así que lo que se ve aquí es exactamente lo que se
// usa, y en una pantalla mejor se ve mejor en vez de más borroso.
//
// LA COLOCACIÓN NO ES DECORACIÓN. Las cinco muestras y los cuadros vacíos van
// sobre la misma cuadrícula de cuadrados de la que sale el isotipo y la textura
// del escáner: por eso están escalonadas y por eso hay huecos. Un cuadrado
// vacío es un cuadrado de esa trama que todavía no se ha rellenado.

// Fila y columna de cada pieza dentro de la cuadrícula de 5 × 6, contando desde
// 1. Las llenas llevan color; las vacías, solo el hilo.
const MUESTRAS: { col: number; fila: number; hex: string; oscura?: boolean }[] = [
  { col: 1, fila: 2, hex: "#252525" },
  { col: 2, fila: 3, hex: "#FF1597" },
  { col: 1, fila: 4, hex: "#FFFFFF", oscura: true },
  { col: 3, fila: 4, hex: "#3D00E4" },
];

// La quinta casilla no es un color: es la MEZCLA de los dos vibrantes, el rosa
// y el azul, que es como aparecen en el escáner y en los degradados de la app.
// Va sin rótulo porque no es un valor que se pueda apuntar.
const MEZCLA = { col: 3, fila: 3 };

const VACIAS: { col: number; fila: number }[] = [
  { col: 5, fila: 1 },
  { col: 4, fila: 2 },
  { col: 5, fila: 4 },
  { col: 4, fila: 5 },
  { col: 5, fila: 6 },
];

const sitio = (col: number, fila: number) => ({
  gridColumn: col,
  gridRow: fila,
});

export default function Paleta() {
  return (
    <div className={`am-paleta ${raleway.variable}`}>
      <div className="am-paleta-marco">
        <div className="am-paleta-lamina">
          <span className="am-paleta-pestana">Color corp.</span>

          <div className="am-paleta-rejilla">
            {MUESTRAS.map((m) => (
              <span
                key={m.hex}
                className={`am-paleta-celda${m.oscura ? " es-clara" : ""}`}
                style={{ ...sitio(m.col, m.fila), background: m.hex }}
              >
                <span className="am-paleta-hex">{m.hex}</span>
              </span>
            ))}

            <span className="am-paleta-celda es-mezcla" style={sitio(MEZCLA.col, MEZCLA.fila)} />

            {VACIAS.map((v) => (
              <span
                key={`${v.col}-${v.fila}`}
                className="am-paleta-celda es-vacia"
                style={sitio(v.col, v.fila)}
                aria-hidden="true"
              />
            ))}
          </div>

          <div className="am-paleta-pie">
            <span>Proyectos experimentales 2024</span>
            <span>/ El Arte del Miedo /</span>
            <span>Sergio Martín Barahona</span>
          </div>
        </div>
      </div>
    </div>
  );
}
