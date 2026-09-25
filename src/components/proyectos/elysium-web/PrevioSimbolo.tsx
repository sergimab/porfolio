"use client";

import { useMemo } from "react";
import LienzoGaga from "./LienzoGaga";
import { ERAS } from "./simbolo";
import { fraccionPorEra } from "./canciones";

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
  const valores = useMemo(() => fraccionPorEra(seleccion, ERAS), [seleccion]);
  const hay = valores.some((v) => v > 0);

  return (
    <div className="previo" role="dialog" aria-label="Previsualización del símbolo">
      <div className="previo-lienzo">
        {hay && (
          // Girable, que es a lo que viene esta ventana: aquí se está mirando
          // la FORMA, y una figura que solo se ve de frente esconde justo lo que
          // hay que juzgar, el cuerpo de los brazos y cómo cierran las puntas.
          <LienzoGaga valores={valores} girable className="previo-simbolo" />
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
