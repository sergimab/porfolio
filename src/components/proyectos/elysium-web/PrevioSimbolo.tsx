"use client";

import { useMemo, useState } from "react";
import LienzoGaga from "./LienzoGaga";
import Mandos, { AFINADO_BASE, type Afinado } from "./Mandos";
import { ERAS } from "./simbolo";
import { fraccionPorEra } from "./canciones";

// PROVISIONAL — herramienta de taller.
//
// El símbolo de la selección actual, ya hecho y a tamaño grande, sin pasar por
// el trazado ni por la portada, y con los ocho mandos del generador al lado.
//
// Existe porque afinar la forma costaba un recorrido entero por cada prueba:
// entrar, marcar canciones, confirmar dos veces y esperar a que se trazara, para
// ver un cruce. Mirar la figura y volver a mirarla tras mover un mando es lo que
// de verdad hace falta, y con OTRA se sortea una selección nueva sin salir.
//
// Se abre con la tecla P, desde la pantalla de las eras.
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

  // Lo que se mueve en el panel vive aquí y no en el lienzo: el lienzo tiene que
  // poder recibirlo desde fuera, que es como lo recibe la web de verdad.
  const [afinado, setAfinado] = useState<Afinado>(AFINADO_BASE);
  const [mandos, setMandos] = useState(true);

  return (
    <div className={`previo${mandos ? " con-mandos" : ""}`} role="dialog" aria-label="Previsualización del símbolo">
      <div className="previo-lienzo">
        {hay && (
          // Girable, que es a lo que viene esta ventana: aquí se está mirando
          // la FORMA, y una figura que solo se ve de frente esconde justo lo que
          // hay que juzgar, el cuerpo de los brazos y cómo cierran las puntas.
          <LienzoGaga
            valores={valores}
            girable
            className="previo-simbolo"
            ajuste={afinado}
            fusion={afinado.fusion}
            organico={afinado.organico}
            suavidad={afinado.suavidad}
            volumen={afinado.volumen}
            giroLuz={afinado.giroLuz}
            plato={afinado.plato}
          />
        )}
      </div>

      <div className="previo-pie">
        <button type="button" className="cartel-boton es-hueco" onClick={onOtra}>
          OTRA
        </button>
        <button
          type="button"
          className="cartel-boton es-hueco"
          onClick={() => setMandos((v) => !v)}
          aria-pressed={mandos}
        >
          MANDOS
        </button>
        <button type="button" className="cartel-boton" onClick={onCerrar}>
          CERRAR
        </button>
      </div>

      {mandos && (
        <Mandos valores={afinado} onCambio={setAfinado} onCerrar={() => setMandos(false)} />
      )}
    </div>
  );
}
