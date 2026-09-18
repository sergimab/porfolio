import "./Isotipo.css";

// El isotipo, dibujado sobre su propia cuadrícula.
//
// Va en SVG y no como imagen porque es una figura de cuadrados: son once
// rectángulos y un puñado de líneas, así que pesa unos cientos de bytes, se ve
// nítido a cualquier tamaño y se puede pintar del color que haga falta desde
// fuera. Una imagen de esto sería más pesada y peor.
//
// EL MAPA ESTÁ ESCRITO ABAJO Y SE LEE COMO SE VE: una fila por renglón, una X
// por cuadrado lleno y un punto por hueco. Si algún cuadrado está donde no
// debe, se corrige ahí y no hay que tocar ni una coordenada.
const MAPA = [
  ". . . . X",
  "X . . X .",
  ". X X . .",
  "X . X . X",
  ". . . X .",
  ". . . . X",
];

const COLUMNAS = 5;

// Las casillas llenas de un mapa.
const llenas = (mapa: string[]) =>
  mapa.flatMap((fila, y) =>
    fila
      .split(" ")
      .map((c, x) => (c === "X" ? { x, y } : null))
      .filter((c): c is { x: number; y: number } => c !== null)
  );

// El dibujante, suelto del mapa: lo usan tanto el isotipo definitivo como el
// muestrario de pruebas, que son la misma figura con otras casillas.
export function Cuadricula({
  mapa,
  conRejilla = false,
  rotulo,
  className,
}: {
  mapa: string[];
  conRejilla?: boolean;
  /**
   * El nombre que anuncia el lector de pantalla. Sin él, la figura se marca
   * como decorativa y el lector la salta, que es lo que corresponde cuando la
   * marca sale repetida dentro de una pantalla —en la app aparece en casi
   * todas, y nombrarla cada vez sería ruido—.
   */
  rotulo?: string;
  className?: string;
}) {
  const FILAS = mapa.length;
  const LLENAS = llenas(mapa);
  return (
    <svg
      className={`am-iso${className ? ` ${className}` : ""}`}
      viewBox={`0 0 ${COLUMNAS} ${FILAS}`}
      role={rotulo ? "img" : undefined}
      aria-label={rotulo || undefined}
      aria-hidden={rotulo ? undefined : true}
      focusable="false"
    >
      {/* La cuadrícula de la que sale, opcional: son las líneas de construcción,
          y solo interesan en la lámina que explica de dónde viene la figura.
          `vector-effect` para que el hilo no engorde al ampliar el dibujo: aquí
          una unidad del viewBox es una casilla entera, así que sin esto el trazo
          saldría del grosor de medio cuadrado. */}
      {conRejilla && (
        <g className="am-iso-rejilla">
          {Array.from({ length: COLUMNAS + 1 }, (_, i) => (
            <line key={`v${i}`} x1={i} y1={0} x2={i} y2={FILAS} vectorEffect="non-scaling-stroke" />
          ))}
          {Array.from({ length: FILAS + 1 }, (_, i) => (
            <line key={`h${i}`} x1={0} y1={i} x2={COLUMNAS} y2={i} vectorEffect="non-scaling-stroke" />
          ))}
        </g>
      )}

      <g className="am-iso-figura">
        {LLENAS.map((c) => (
          // Un pelo más de un cuadro: los cuadrados que se tocan por una esquina
          // o por un lado tienen que quedar soldados, y a tamaño grande una
          // costura de medio píxel entre dos rectángulos contiguos se ve.
          <rect key={`${c.x}-${c.y}`} x={c.x} y={c.y} width={1.002} height={1.002} />
        ))}
      </g>
    </svg>
  );
}

export default function Isotipo({ conRejilla = false }: { conRejilla?: boolean }) {
  return <Cuadricula mapa={MAPA} conRejilla={conRejilla} rotulo="Isotipo de El Arte del Miedo" />;
}
