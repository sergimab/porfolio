"use client";

import { useEffect, useState } from "react";
import { Cuadricula } from "./Isotipo";

// El muestrario de pruebas: las versiones que se quedaron por el camino, pasando
// una detrás de otra en bucle al lado de la que se quedó.
//
// Va así y no como seis dibujos en fila porque lo que interesa no es cada
// prueba por separado —ninguna se eligió—, sino ver la BÚSQUEDA: las casillas
// saltando de sitio sobre la misma cuadrícula hasta dar con la figura buena. En
// fila serían seis manchas que se miran una vez; en bucle, al lado de la
// definitiva, se lee como el proceso que fue.
//
// Cada mapa se lee igual que el del isotipo: una fila por renglón, una X por
// cuadrado lleno y un punto por hueco.
const PRUEBAS = [
  [
    ". X . . .",
    "X X X . X",
    ". . . . .",
    ". X X . X",
    "X . X . .",
    "X . . X X",
  ],
  [
    ". X X . X",
    ". X . X X",
    ". . X X .",
    "X X . . .",
    "X . . . X",
    "X . . X X",
  ],
  [
    ". X . X X",
    ". X X . .",
    "X X . X .",
    "X . . . .",
    ". . . X .",
    ". . X . X",
  ],
  [
    ". X X . X",
    ". . . X .",
    "X X . X .",
    ". . . . X",
    "X . . X X",
    ". . X . X",
  ],
  [
    "X . X X .",
    "X . . . X",
    ". X X . X",
    "X . . X X",
    ". . X X .",
    "X . X . X",
  ],
  [
    "X . X . .",
    ". . . X X",
    ". X X . .",
    "X . X . X",
    "X . . X X",
    ". . X . .",
  ],
];

// Lo que tarda en pasar de una a la siguiente. Suficiente para verla, poco para
// que parezca que se ha quedado parada.
const PASO = 900;

export default function Pruebas() {
  const [i, setI] = useState(0);

  useEffect(() => {
    // Quien no quiere movimiento se queda con la primera: sigue siendo una
    // prueba, y el apartado se entiende igual con el rótulo de al lado.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const reloj = setInterval(() => setI((n) => (n + 1) % PRUEBAS.length), PASO);
    return () => clearInterval(reloj);
  }, []);

  return (
    <Cuadricula
      mapa={PRUEBAS[i]}
      conRejilla
      rotulo={`Prueba ${i + 1} de ${PRUEBAS.length} del isotipo`}
    />
  );
}
