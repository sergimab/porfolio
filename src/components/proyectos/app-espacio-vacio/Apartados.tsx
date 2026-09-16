"use client";

import { useState } from "react";
import { useLang } from "@/components/shared/useLang";
import Prototipo from "./Prototipo";
import SistemaDiseno from "./SistemaDiseno";
import "./Apartados.css";

// Las dos caras del proyecto, en la misma caja: el prototipo —lo que la app
// hace— y el sistema —de qué está hecha—. Son el mismo trabajo mirado de dos
// maneras, así que van como dos pestañas de una sola pieza y no como dos
// apartados seguidos, igual que el holding y el subholding de Ilustraciones.
//
// Los dos se montan a la vez y se esconde el que no toca, en vez de quitarlo
// del marcado: el prototipo guarda por dónde ibas —la pantalla, las horas
// elegidas, el momento abierto—, y desmontarlo lo devolvería a la carga cada
// vez que se mira el sistema.
export default function Apartados() {
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
