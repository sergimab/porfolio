"use client";

import { useState } from "react";
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
  const [previo, setPrevio] = useState(false);

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
        {/* PROVISIONAL, para probar formas: rellena el test al azar y vuelve a
            sortear en cada pulsación. Va vaciado para que no compita con
            FINISH, que es el botón de verdad. */}
        <button type="button" className="cartel-boton es-hueco" onClick={onAleatorio}>
          ALEATORIO
        </button>
        {/* PROVISIONAL, para afinar la forma: el símbolo de lo que hay marcado
            ahora mismo, ya hecho, sin pasar por el trazado ni por la portada. */}
        <button type="button" className="cartel-boton es-hueco" onClick={() => setPrevio(true)}>
          PREVIO
        </button>
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
