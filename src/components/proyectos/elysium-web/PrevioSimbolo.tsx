"use client";

import { useMemo } from "react";
import LienzoMetal from "@/components/proyectos/elysium/LienzoMetal";
import { ERAS, figuraDeEras } from "./simbolo";
import { contarPorEra } from "./canciones";
import { crearEstudioVidrio } from "./estudioVidrio";

// PROVISIONAL — herramienta de taller.
//
// El símbolo de la selección actual, ya hecho y a tamaño grande, sin pasar por
// el trazado ni por la portada.
//
// Existe porque afinar la forma costaba un recorrido entero por cada prueba:
// entrar, marcar canciones, confirmar dos veces y esperar siete segundos a que
// se trazara, para ver un cruce. Mirar la figura y volver a mirarla tras tocar
// un número es lo que de verdad hace falta, y con `Otra` se sortea una
// selección nueva sin salir de aquí.
//
// Se va con el botón que lo abre, en PantallaEras.
export default function PrevioSimbolo({
  seleccion,
  onOtra,
  onCerrar,
}: {
  seleccion: Set<string>;
  onOtra: () => void;
  onCerrar: () => void;
}) {
  const figura = useMemo(
    () => figuraDeEras(contarPorEra(seleccion, ERAS)),
    [seleccion]
  );

  return (
    <div className="previo" role="dialog" aria-label="Previsualización del símbolo">
      <div className="previo-lienzo">
        {figura.length > 0 && (
          // El mismo material que la pantalla del trazado, no el de la portada:
          // lo que se está afinando aquí es la forma, y hay que verla en el
          // sitio donde se va a ver primero.
          <LienzoMetal
            figura={figura}
            interactivo={false}
            entorno={crearEstudioVidrio}
            dispersion={0.022}
            capas={3}
            brillo={1.45}
            grosorLibre
            atraccion
            suavizado={0}
            suavidad={9}
            redondeo={2.5}
          />
        )}
      </div>

      <div className="previo-pie">
        <button type="button" className="cartel-boton es-hueco" onClick={onOtra}>
          OTRA
        </button>
        <button type="button" className="cartel-boton" onClick={onCerrar}>
          CERRAR
        </button>
      </div>
    </div>
  );
}
