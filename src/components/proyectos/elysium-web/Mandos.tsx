"use client";

import { useState } from "react";
import type { Ajuste } from "./formaGaga";
import { AJUSTE_BASE } from "./formaGaga";
import { LIENZO_BASE } from "./LienzoGaga";
import "./Mandos.css";

// EL PANEL DE MANDOS DEL GENERADOR — herramienta de taller.
//
// Los ocho deslizadores del generador que se afinó aparte, con sus mismos
// recorridos y sus mismos valores de fábrica, contra la figura de verdad. Vive
// dentro de la ventana de previsualización, que es donde se está mirando la
// forma, y no aparece si no se abre esa ventana.
//
// Lo que se mueve aquí NO se guarda en ningún sitio: es un banco de pruebas. Lo
// que sí hace el botón de copiar es dejar los valores escritos tal cual van en
// el componente, para pegarlos donde toque y que queden fijos.

export type Afinado = Ajuste & {
  fusion: number;
  organico: number;
  suavidad: number;
  volumen: number;
  giroLuz: number;
};

// «De fábrica» quiere decir LO QUE HAY PUESTO EN LA WEB, no lo que traía el
// generador original al abrirlo. Si el panel arrancara con aquellos valores,
// abrirlo cambiaría la figura antes de tocar nada y no habría manera de comparar
// contra lo que se está viendo. Por eso se toman de los dos sitios donde viven
// de verdad, y volver atrás es volver a la web.
export const AFINADO_BASE: Afinado = { ...AJUSTE_BASE, ...LIENZO_BASE };

// Nombre, recorrido y paso de cada mando, copiados del generador.
const MANDOS: {
  clave: keyof Afinado;
  nombre: string;
  min: number;
  max: number;
  paso: number;
  // Cuántos decimales enseñar. Un mando que va de 0,002 en 0,002 necesita tres;
  // uno que va de grado en grado, ninguno.
  cifras: number;
  // Una línea sobre qué hace, para no tener que recordarlo.
  que: string;
}[] = [
  { clave: "fusion", nombre: "Fusión", min: 0.002, max: 0.1, paso: 0.002, cifras: 3,
    que: "Cuánto se rellenan los rincones y los cruces" },
  { clave: "grosor", nombre: "Grosor", min: 0.4, max: 2, paso: 0.02, cifras: 2,
    que: "El cuerpo del trazo" },
  { clave: "mezcla", nombre: "Mezcla grosor", min: 0, max: 1, paso: 0.02, cifras: 2,
    que: "0, todos los tramos iguales; 1, unos finos y otros gruesos" },
  { clave: "picos", nombre: "Picos", min: 0, max: 2, paso: 0.02, cifras: 2,
    que: "Cuánto se alargan las puntas en los ángulos cerrados" },
  { clave: "organico", nombre: "Orgánico", min: 0, max: 0.08, paso: 0.002, cifras: 3,
    que: "Ondulación del contorno. Pasado de rosca se come el filo" },
  { clave: "suavidad", nombre: "Suavidad", min: 0, max: 8, paso: 0.1, cifras: 1,
    que: "Redondea la silueta y el volumen" },
  { clave: "volumen", nombre: "Volumen", min: 0.3, max: 3, paso: 0.05, cifras: 2,
    que: "Cuánto levanta la pieza" },
  { clave: "giroLuz", nombre: "Giro luz", min: -180, max: 180, paso: 1, cifras: 0,
    que: "Gira el plató. Es lo que más cambia el color de un metal" },
];

export default function Mandos({
  valores,
  onCambio,
  onCerrar,
}: {
  valores: Afinado;
  onCambio: (v: Afinado) => void;
  onCerrar: () => void;
}) {
  const [copiado, setCopiado] = useState(false);

  // Los valores, escritos como irían en el componente. Solo salen los que se
  // han movido: pegar los ocho cuando has tocado uno es enterrar el cambio.
  const receta = () => {
    const sueltos: string[] = [];
    const dentro: string[] = [];
    for (const m of MANDOS) {
      const v = valores[m.clave];
      if (v === AFINADO_BASE[m.clave]) continue;
      const n = Number(v.toFixed(m.cifras + 1));
      if (m.clave === "grosor" || m.clave === "mezcla" || m.clave === "picos") {
        dentro.push(`${m.clave}: ${n}`);
      } else {
        sueltos.push(`${m.clave}={${n}}`);
      }
    }
    if (dentro.length) sueltos.unshift(`ajuste={{ ${dentro.join(", ")} }}`);
    return sueltos.length ? sueltos.join("\n") : "todo de fábrica";
  };

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(receta());
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 1600);
    } catch {
      // Sin permiso de portapapeles no se rompe nada: los valores están a la
      // vista en el propio panel.
      setCopiado(false);
    }
  };

  const tocados = MANDOS.filter((m) => valores[m.clave] !== AFINADO_BASE[m.clave]).length;
  const texto = receta();

  return (
    <div className="mandos" role="group" aria-label="Mandos del generador">
      <div className="mandos-cabeza">
        <h2>Generador</h2>
        <button type="button" className="mandos-x" onClick={onCerrar} aria-label="Cerrar los mandos">
          ✕
        </button>
      </div>

      {MANDOS.map((m) => {
        const v = valores[m.clave];
        const deFabrica = v === AFINADO_BASE[m.clave];
        return (
          <label key={m.clave} className={`mandos-fila${deFabrica ? "" : " es-tocado"}`}>
            <span className="mandos-nombre">
              {m.nombre}
              <span className="mandos-que">{m.que}</span>
            </span>
            <input
              type="range"
              min={m.min}
              max={m.max}
              step={m.paso}
              value={v}
              onChange={(e) => onCambio({ ...valores, [m.clave]: Number(e.target.value) })}
            />
            <output>{v.toFixed(m.cifras)}</output>
          </label>
        );
      })}

      <div className="mandos-pie">
        <button
          type="button"
          className="mandos-boton"
          onClick={() => onCambio(AFINADO_BASE)}
          disabled={!tocados}
        >
          De fábrica
        </button>
        <button type="button" className="mandos-boton es-fuerte" onClick={copiar} disabled={!tocados}>
          {copiado ? "Copiado" : `Copiar${tocados ? ` (${tocados})` : ""}`}
        </button>
      </div>

      {/* LA RECETA, A LA VISTA Y NO SOLO EN EL PORTAPAPELES. Copiar puede fallar
          —el navegador pide permiso para escribir en el portapapeles y no
          siempre lo da—, y entonces el trabajo de una tarde se quedaría sin
          manera de salir de aquí. Escrito, siempre se puede leer o fotografiar. */}
      {tocados > 0 && <pre className="mandos-receta">{texto}</pre>}
    </div>
  );
}
