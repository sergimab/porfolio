"use client";

import { useState } from "react";
import { useLang } from "@/components/shared/useLang";
import LangText from "@/components/shared/LangText";
import Prototipo from "./Prototipo";
import SistemaDiseno from "./SistemaDiseno";
// LAS PESTAÑAS SON LAS MISMAS QUE LAS DE LA APP DE ESPACIO VACÍO, y por eso se
// importa su CSS en vez de copiarlo. Son la misma pieza haciendo el mismo
// trabajo en la misma clase de página —el prototipo y el sistema de una app—,
// así que teniéndolo escrito dos veces, el día que se retoque una, la otra se
// queda atrás. Si alguna vez tuvieran que verse distintas, lo que toca es
// sacarlo a un componente compartido, no volver a copiarlo.
import "../app-espacio-vacio/Apartados.css";
import "./ArteMiedo.css";

// Las dos caras del proyecto en la misma caja: lo que la app HACE y de qué está
// HECHA. Van como dos posiciones de un interruptor y no como dos apartados
// seguidos, igual que en la app de Espacio vacío: es el mismo trabajo mirado de
// dos maneras, y verlos a la vez obligaría a elegir cuál va primero.
//
// Los dos se montan siempre y se esconde el que no toca —`hidden`, no quitarlo
// del marcado— para que al volver a una pestaña se siga donde se estaba: si la
// tira de pantallas se ha arrastrado hasta el escaneo, sigue ahí.
export default function AppApartados() {
  const [cual, setCual] = useState<"prototipo" | "sistema">("prototipo");
  const lang = useLang();
  const t = (es: string, en: string) => (lang === "en" ? en : es);

  return (
    <div className="ev-fichas">
      <div className="ev-fichas-pestanas">
        <button
          type="button"
          className="ev-ficha-pestana"
          data-puesta={cual === "prototipo"}
          onClick={() => setCual("prototipo")}
        >
          {t("Prototipo", "Prototype")}
        </button>
        <button
          type="button"
          className="ev-ficha-pestana"
          data-puesta={cual === "sistema"}
          onClick={() => setCual("sistema")}
        >
          {t("Sistema de diseño", "Design system")}
        </button>
      </div>

      <div className="ev-fichas-caja" data-cual={cual}>
        {/* Solo el prototipo. Sin texto delante ni piezas detrás: la pestaña ya
            dice qué es esto, y la app se explica sola pasando pantallas. */}
        <div hidden={cual !== "prototipo"}>
          <Prototipo />
        </div>

        <div hidden={cual !== "sistema"}>
          <SistemaDiseno />
        </div>
      </div>
    </div>
  );
}
