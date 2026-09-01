"use client";

import { useMemo, useState } from "react";
import LienzoMetal from "@/components/proyectos/elysium/LienzoMetal";
import { ERAS, figuraDeEras, type Era } from "./simbolo";
import { CANCIONES, claveCancion, contarPorEra } from "./canciones";
import "./TestSimbolo.css";

// El test de Elysium, funcionando: eliges las canciones que te representan y el
// símbolo se genera delante de ti, con el mismo motor de metal que el lienzo.
//
// El repertorio vive en canciones.ts, compartido con los popups de las eras.

export default function TestSimbolo() {
  const [elegidas, setElegidas] = useState<Set<string>>(new Set());

  const alternar = (id: string) =>
    setElegidas((antes) => {
      const nuevo = new Set(antes);
      if (nuevo.has(id)) nuevo.delete(id);
      else nuevo.add(id);
      return nuevo;
    });

  // Cuántas canciones ha elegido de cada disco. Eso, y solo eso, es lo que
  // decide la figura.
  const pesos = useMemo(() => contarPorEra(elegidas, ERAS), [elegidas]);

  const figura = useMemo(() => figuraDeEras(pesos), [pesos]);
  const total = elegidas.size;
  const maximo = Math.max(...ERAS.map((e) => pesos[e]));

  return (
    <div className="testsim">
      <div className="testsim-listas">
        {ERAS.map((era) => (
          <fieldset key={era} className="testsim-era">
            <legend className="testsim-era-tit">
              {era}
              {pesos[era] > 0 && <span className="testsim-cuenta">{pesos[era]}</span>}
            </legend>
            <div className="testsim-canciones">
              {CANCIONES[era].map((cancion) => {
                const id = claveCancion(era, cancion);
                const puesta = elegidas.has(id);
                return (
                  <button
                    key={id}
                    type="button"
                    className={`testsim-cancion${puesta ? " es-puesta" : ""}`}
                    onClick={() => alternar(id)}
                    aria-pressed={puesta}
                  >
                    {cancion}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>

      <div className="testsim-resultado">
        <div className="testsim-simbolo">
          {figura.length ? (
            <LienzoMetal figura={figura} interactivo={false} />
          ) : (
            <p className="testsim-vacio">
              Elige canciones y tu símbolo se irá formando aquí.
            </p>
          )}
        </div>

        {total > 0 && (
          <>
            {/* El reparto, que es el dato que de verdad manda: la figura se
                normaliza al disco más votado, así que lo que cambia la forma es
                la proporción entre discos y no cuántas canciones marques. */}
            <ul className="testsim-reparto">
              {[...ERAS]
                .filter((e) => pesos[e] > 0)
                .sort((a, b) => pesos[b] - pesos[a])
                .map((era) => (
                  <li key={era}>
                    <span className="testsim-reparto-era">{era}</span>
                    <span className="testsim-barra" aria-hidden="true">
                      <span style={{ width: `${(pesos[era] / maximo) * 100}%` }} />
                    </span>
                    <span className="testsim-reparto-n">
                      {Math.round((pesos[era] / total) * 100)}%
                    </span>
                  </li>
                ))}
            </ul>
            <button
              type="button"
              className="testsim-borrar"
              onClick={() => setElegidas(new Set())}
            >
              Empezar de nuevo
            </button>
          </>
        )}
      </div>
    </div>
  );
}
