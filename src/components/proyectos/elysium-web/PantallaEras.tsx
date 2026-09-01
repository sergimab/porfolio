"use client";

import Galaxia from "./Galaxia";
import IconosFlotantes from "./IconosFlotantes";

// La segunda pantalla: se va el cartel y quedan las siete eras flotando, ahora
// sí a la vista y pulsables.
//
// Es la misma galaxia y los mismos iconos de la portada, en el mismo sitio: al
// darle a START no se cambia de escenario, se quita lo que había delante. Por
// eso la composición se midió del render aunque en la portada el cartel tapara
// media docena — estaba pensada para verse aquí.
export default function PantallaEras({
  onElegir,
}: {
  onElegir: (era: string) => void;
}) {
  return (
    <div className="inicio">
      <Galaxia />
      <IconosFlotantes interactivo onElegir={onElegir} />

      <p className="eras-pie">Elige la era con la que empezar</p>
    </div>
  );
}
