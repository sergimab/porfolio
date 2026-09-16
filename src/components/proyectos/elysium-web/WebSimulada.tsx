"use client";

import { useState } from "react";
import Link from "next/link";
import PantallaInicio from "./PantallaInicio";
import PantallaEras from "./PantallaEras";
import PantallaSimbolo from "./PantallaSimbolo";
import PaginaDisco from "./PaginaDisco";
import { seleccionAlAzar } from "./canciones";
import { ERAS } from "./simbolo";
import "./PantallaInicio.css";
import "./Popups.css";
import "./Portada.css";
import "./PaginaDisco.css";
import "./WebSimulada.css";

// La web de Elysium, a pantalla completa.
//
// Va por pantallas y no por scroll: la portada con el cartel, el universo de
// símbolos donde se hace el test, y el símbolo que sale de él. Se guarda en
// estado y no en la URL porque es un recorrido, no un sitio al que se llegue de
// fuera; si más adelante hay que poder enlazar una pantalla suelta, esto pasa a
// ser una ruta.
type Pantalla = "inicio" | "eras" | "simbolo" | "portada";

export default function WebSimulada() {
  const [pantalla, setPantalla] = useState<Pantalla>("inicio");
  // Las canciones marcadas, con la clave "Álbum|Canción". Vive aquí arriba, y
  // no dentro de la pantalla de las eras, porque tiene que sobrevivir a ir y
  // venir entre pantallas: es el dato que ha ido recogiendo la persona, y
  // perderlo al cambiar de sitio sería perder el test entero.
  const [seleccion, setSeleccion] = useState<Set<string>>(new Set());
  const alternar = (id: string) =>
    setSeleccion((antes) => {
      const nuevo = new Set(antes);
      if (nuevo.has(id)) nuevo.delete(id);
      else nuevo.add(id);
      return nuevo;
    });

  // data-theme="dark" en el envoltorio, no un fondo negro a pelo. Esta web es
  // negra por diseño, pero el lienzo de metal saca su papel de las variables del
  // tema: pintando el negro por encima se quedaría con el fondo cambiado y el
  // material sin ajustar. Poniendo el atributo, todo lo de dentro resuelve sus
  // colores para oscuro, que es justo para lo que está.
  return (
    <div className="websim" data-theme="dark">
      {pantalla === "inicio" && (
        <PantallaInicio onStart={() => setPantalla("eras")} />
      )}

      {pantalla === "eras" && (
        <PantallaEras
          seleccion={seleccion}
          onAlternar={alternar}
          onTerminar={() => setPantalla("simbolo")}
          onAleatorio={() => setSeleccion(seleccionAlAzar(ERAS))}
        />
      )}

      {pantalla === "simbolo" && (
        <PantallaSimbolo seleccion={seleccion} onListo={() => setPantalla("portada")} />
      )}

      {pantalla === "portada" && (
        <PaginaDisco seleccion={seleccion} onReintentar={() => setPantalla("eras")} />
      )}

      {/* El hilo de vuelta al portfolio, siempre disponible: sin él, quien entra
          aquí se queda encerrado. Lleva a la parrilla de UI/UX, que es de donde
          se viene: la web ya no cuelga de una página de proyecto, es el
          proyecto. Va discreto y por encima de la galaxia. */}
      <Link className="websim-salir" href="/?cat=uiux">
        Volver al portfolio
      </Link>
    </div>
  );
}
