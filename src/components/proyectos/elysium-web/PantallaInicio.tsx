"use client";

import Galaxia from "./Galaxia";
import IconosFlotantes from "./IconosFlotantes";

// La primera pantalla de la web: la galaxia con los símbolos flotando y, encima,
// el cartel que presenta el proyecto.
//
// El cartel no lleva fondo propio, lleva el fondo DESENFOCADO: es un cristal
// esmerilado sobre la galaxia. Por eso los iconos van detrás y se ven borrosos
// a través de él y nítidos por fuera — es lo que da la profundidad, y es lo que
// se perdería pintando un negro sólido.
export default function PantallaInicio({ onStart }: { onStart: () => void }) {
  return (
    <div className="inicio">
      <Galaxia />
      <IconosFlotantes />

      <div className="inicio-capa">
        <div className="inicio-cartel">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="inicio-logo"
            src="/proyectos/elysium-web/logo-elysium.webp"
            alt="Elysium"
          />
          <p className="inicio-frase">
            “The only thing you have to do is <strong>choose your destiny</strong>”.
          </p>
        </div>

        <button type="button" className="inicio-start" onClick={onStart}>
          START
        </button>
      </div>
    </div>
  );
}
