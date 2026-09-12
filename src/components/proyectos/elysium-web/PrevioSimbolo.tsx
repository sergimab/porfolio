"use client";

import { useMemo } from "react";
import LienzoMetal from "@/components/proyectos/elysium/LienzoMetal";
import { ERAS, figuraDeEras } from "./simbolo";
import { contarPorEra } from "./canciones";
import { crearEstudioCromo } from "./estudioCromo";

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
            entorno={crearEstudioCromo}
            // Poca dispersión: el color lo pone ahora la película, no la
            // separación de canales. Sumando las dos, el tornasol se ensucia.
            dispersion={0.012}
            capas={2}
            brillo={1.7}
            grosorLibre
            atraccion
            suavizado={0}
            suavidad={9}
            redondeo={2.5}
            techo={0.66}
            relieve={1.5}
            // La película fina de los iconos que flotan: mismos números que
            // ellos —iridiscencia entera, índice 2,25 y el grosor alto de su
            // rango—, que es lo que hace que compartan tornasol y no solo
            // habitación.
            tornasol={0}
            pelicula={340}
            peliculaIOR={2.25}
            saturacion={1}
            planicie={0.65}
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
