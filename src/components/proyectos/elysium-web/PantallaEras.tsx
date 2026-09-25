"use client";

import { useEffect, useState } from "react";
import Galaxia from "./Galaxia";
import IconosFlotantes from "./IconosFlotantes";
import PopupAlbum from "./PopupAlbum";
import PopupFinal from "./PopupFinal";
import PrevioSimbolo from "./PrevioSimbolo";
import type { Era } from "./simbolo";

// La segunda pantalla: se va el cartel y quedan las siete eras flotando, ahora
// sí a la vista y pulsables.
//
// Es la misma galaxia y los mismos iconos de la portada, en el mismo sitio: al
// darle a START no se cambia de escenario, se quita lo que había delante.
//
// Y es aquí donde se hace el test. Cada símbolo abre su álbum, y lo que se
// marque en los siete es lo que dará los porcentajes.
export default function PantallaEras({
  seleccion,
  onAlternar,
  onTerminar,
  onAleatorio,
}: {
  seleccion: Set<string>;
  onAlternar: (id: string) => void;
  onTerminar: () => void;
  // PROVISIONAL: rellena el test al azar para poder ver formas distintas
  // deprisa. Se va con el botón que lo dispara.
  onAleatorio: () => void;
}) {
  const [abierta, setAbierta] = useState<Era | null>(null);
  const [cerrando, setCerrando] = useState(false);
  // PROVISIONAL, como ALEATORIO: la previsualización del símbolo sin pasar por
  // el trazado. Ver PrevioSimbolo.
  // El previo sigue montado pero sin botón: se abre con la tecla P, que es
  // suficiente para volver a afinar la forma si hiciera falta y no mete un
  // mando de taller en la pantalla de quien está haciendo el test.
  const [previo, setPrevio] = useState(false);
  useEffect(() => {
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === "p" || e.key === "P") setPrevio((v) => !v);
    };
    window.addEventListener("keydown", alPulsar);
    return () => window.removeEventListener("keydown", alPulsar);
  }, []);

  return (
    <div className="inicio">
      <Galaxia />
      {/* Los iconos dejan de recoger el ratón mientras hay un popup delante: si
          no, se encenderían al pasar por encima del cristal y el cursor de mano
          prometería un clic que el popup se come. */}
      <IconosFlotantes
        interactivo={!abierta && !cerrando}
        onElegir={(era) => setAbierta(era as Era)}
      />

      <div className="eras-pie">
        {/* ALEATORIO y PREVIO eran los dos mandos con los que se afinó la forma
            —rellenar el test al azar y ver el símbolo sin pasar por el trazado—.
            La configuración ya está decidida, así que se guardan detrás de
            MANDOS y aquí solo queda FINISH, que es el botón de la web. */}
        <button type="button" className="cartel-boton" onClick={() => setCerrando(true)}>
          FINISH
        </button>
      </div>

      {abierta && (
        <PopupAlbum
          era={abierta}
          seleccion={seleccion}
          onAlternar={onAlternar}
          onCerrar={() => setAbierta(null)}
        />
      )}

      {previo && (
        <PrevioSimbolo
          seleccion={seleccion}
          onOtra={onAleatorio}
          onCerrar={() => setPrevio(false)}
        />
      )}

      {cerrando && (
        <PopupFinal
          seleccion={seleccion}
          onVolver={() => setCerrando(false)}
          onTerminar={onTerminar}
        />
      )}
    </div>
  );
}
