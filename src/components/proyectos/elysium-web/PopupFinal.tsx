"use client";

import Cartel from "./Cartel";
import { ERAS, type Era } from "./simbolo";
import { contarPorEra } from "./canciones";

// El popup de cierre: pregunta si ha terminado y le enseña de qué discos no ha
// elegido nada.
//
// Ese listado no es un reproche, es información: un álbum sin marcar vale cero y
// la figura no se estira nada hacia su punta, así que conviene saber si es a
// propósito o un despiste antes de cerrar.
export default function PopupFinal({
  seleccion,
  onVolver,
  onTerminar,
}: {
  seleccion: Set<string>;
  onVolver: () => void;
  onTerminar: () => void;
}) {
  const pesos = contarPorEra(seleccion, ERAS);
  const sinNada: Era[] = ERAS.filter((e) => pesos[e] === 0);

  return (
    <Cartel onCerrar={onVolver} ancho="min(620px, 92%)" etiqueta="¿Has terminado?">
      <div className="pfinal">
        <h2 className="pfinal-titulo">Are you done?</h2>

        {/* El aviso solo aparece cuando hay algo que avisar. Con canciones en
            los siete discos no queda ni el rótulo: decir "no falta ninguno" es
            hacer ruido para no decir nada, y deja la pregunta y los dos botones
            solos, que es todo lo que hace falta ahí. */}
        {sinNada.length > 0 && (
          <div className="pfinal-cuerpo">
            <p className="pfinal-rotulo">Albums with no selection:</p>
            <ul className="pfinal-lista">
              {sinNada.map((era) => (
                <li key={era}>{era}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="pfinal-botones">
          <button type="button" className="cartel-boton es-hueco" onClick={onVolver}>
            BACK
          </button>
          <button type="button" className="cartel-boton" onClick={onTerminar}>
            FINISH
          </button>
        </div>
      </div>
    </Cartel>
  );
}
