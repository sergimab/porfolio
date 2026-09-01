"use client";

import { useState } from "react";
import Link from "next/link";
import PantallaInicio from "./PantallaInicio";
import PantallaEras from "./PantallaEras";
import VisorEra from "./VisorEra";
import TestSimbolo from "./TestSimbolo";
import "./PantallaInicio.css";
import "./WebSimulada.css";

// La web de Elysium, a pantalla completa.
//
// Va por pantallas y no por scroll: la primera es la portada con el cartel, y
// START lleva a la siguiente. Se guarda en estado y no en la URL porque es un
// recorrido, no un sitio al que se llegue de fuera; si más adelante hay que
// poder enlazar una pantalla suelta, esto pasa a ser una ruta.
type Pantalla = "inicio" | "eras" | "test";

export default function WebSimulada() {
  const [pantalla, setPantalla] = useState<Pantalla>("inicio");
  // La era pulsada. Todavía no lleva a ninguna parte —el test por álbum está
  // por hacer—, pero se guarda para que el día que lo esté baste con leerla
  // aquí en vez de rehacer el cableado.
  const [, setEra] = useState<string | null>(null);

  // data-theme="dark" en el envoltorio, no un fondo negro a pelo. Esta web es
  // negra por diseño, pero el lienzo de metal y el visor 3D sacan su papel de
  // las variables del tema: pintando el negro por encima se quedarían con el
  // fondo cambiado y el material sin ajustar. Poniendo el atributo, todo lo de
  // dentro resuelve sus colores para oscuro, que es justo para lo que está.
  return (
    <div className="websim" data-theme="dark">
      {pantalla === "inicio" ? (
        <PantallaInicio onStart={() => setPantalla("eras")} />
      ) : pantalla === "eras" ? (
        <>
          <PantallaEras onElegir={(era) => setEra(era)} />
          {/* Puente provisional a lo que ya estaba construido. Al pulsar una era
              todavía no pasa nada —el test por álbum está por hacer—, y sin este
              enlace la pantalla del símbolo se quedaría sin manera de llegar a
              ella. Se va en cuanto las eras lleven a su propio test. */}
          <button
            type="button"
            className="eras-puente"
            onClick={() => setPantalla("test")}
          >
            Ver la generación del símbolo
          </button>
        </>
      ) : (
        <>
          <header className="websim-barra">
            <button
              type="button"
              className="websim-volver"
              onClick={() => setPantalla("eras")}
            >
              <svg width="8" height="14" viewBox="0 0 8 14" fill="none" stroke="currentColor"
                strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6.5 1 1.5 7l5 6" />
              </svg>
              Volver
            </button>
            <span className="websim-marca">ELYSIUM</span>
          </header>

          <main className="websim-cuerpo">
            <section className="websim-seccion">
              <h2 className="websim-h2">Los símbolos de cada era</h2>
              <p className="websim-texto">
                Los modelos que salieron de Blender, aquí dentro, girando en el
                navegador.
              </p>
              <VisorEra />
            </section>

            <section className="websim-seccion">
              <h2 className="websim-h2">Tu símbolo</h2>
              <p className="websim-texto">
                Marca las canciones que te representan. La figura se va formando
                según cuántas elijas de cada disco.
              </p>
              <TestSimbolo />
            </section>
          </main>
        </>
      )}

      {/* El hilo de vuelta al portfolio, siempre disponible: sin él, quien entra
          aquí desde el proyecto se queda encerrado. Va discreto y por encima de
          la galaxia. */}
      <Link className="websim-salir" href="/proyecto/u1">
        Volver al proyecto
      </Link>
    </div>
  );
}
