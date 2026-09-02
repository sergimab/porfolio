"use client";

import { AJUSTES, minimoDe } from "./simbolo";

// PROVISIONAL: el panel de mandos del generador.
//
// Existe porque afinar esta forma a ciegas —una ronda de "prueba esto", esperar,
// mirar, otra ronda— cuesta días, y moviendo una barra con la figura delante se
// encuentra el punto bueno en un rato. No es parte de la web: cuando la
// configuración esté decidida, los valores se congelan en AJUSTES y esto se va,
// igual que el botón de ALEATORIO.
//
// Los valores de la figura se escriben DIRECTAMENTE en el objeto AJUSTES, que
// es un módulo compartido, y luego se avisa al padre para que recalcule. No
// viven en estado de React porque quien los lee es el generador, que es una
// función pura llamada desde un useMemo: pasarlos por props obligaría a
// enhebrar nueve valores por tres componentes para algo que se va a borrar.
export type Material = {
  dispersion: number;
  suavidad: number;
  brillo: number;
  redondeo: number;
};

type Barra = {
  clave: Exclude<keyof typeof AJUSTES, "minimoAuto">;
  rotulo: string;
  min: number;
  max: number;
  paso: number;
  nota: string;
};

const BARRAS: Barra[] = [
  { clave: "grosor", rotulo: "Grosor", min: 0.006, max: 0.03, paso: 0.0005,
    nota: "y el alcance: es el mismo mando" },
  { clave: "radioMinimo", rotulo: "Mínimo", min: 0, max: 0.6, paso: 0.01,
    nota: "bajo = todo junto en el centro" },
  { clave: "cruceMin", rotulo: "Fusión", min: 0.2, max: 1, paso: 0.02,
    nota: "alto = los cruces se sueldan" },
  { clave: "cruceCerca", rotulo: "Alcance del cruce", min: 0.6, max: 3, paso: 0.1,
    nota: "a qué distancia se estorban" },
  { clave: "pico", rotulo: "Punta", min: 0.05, max: 1, paso: 0.01,
    nota: "bajo = vértices más afilados" },
  { clave: "picoDesde", rotulo: "Desde qué giro", min: 0, max: 0.6, paso: 0.01,
    nota: "bajo = hasta los abiertos hacen esquina" },
  { clave: "picoAlcance", rotulo: "Alcance en la punta", min: 0.15, max: 1, paso: 0.01,
    nota: "bajo = la muesca no se rellena" },
  { clave: "delgado", rotulo: "Contraste", min: 0.3, max: 1, paso: 0.01,
    nota: "1 = todos los tramos iguales" },
  { clave: "encaje", rotulo: "Tamaño", min: 0.4, max: 0.85, paso: 0.01,
    nota: "cuánto ocupa en el marco" },
];

export default function Controles({
  material,
  onMaterial,
  onCambio,
  onCerrar,
  pesos,
}: {
  material: Material;
  onMaterial: (m: Material) => void;
  onCambio: () => void;
  onCerrar: () => void;
  // Solo para enseñar qué mínimo ha elegido la figura que hay en pantalla.
  pesos: Record<string, number>;
}) {
  return (
    <div className="mandos">
      <div className="mandos-cabecera">
        <strong>Mandos</strong>
        <button type="button" onClick={onCerrar} aria-label="Cerrar los mandos">
          ✕
        </button>
      </div>

      <p className="mandos-nota">Forma</p>

      {/* El mínimo automático. Va el primero porque cuando está puesto, la barra
          de "Mínimo" no pinta nada, y conviene verlo antes de moverla. */}
      <label className="mandos-interruptor">
        <input
          type="checkbox"
          defaultChecked={AJUSTES.minimoAuto}
          onChange={(e) => {
            AJUSTES.minimoAuto = e.target.checked;
            onCambio();
          }}
        />
        <span>
          Mínimo automático
          <em>{minimoDe(pesos as never).toFixed(2)}</em>
        </span>
      </label>
      {BARRAS.map((b) => (
        <label key={b.clave} className="mandos-barra">
          <span className="mandos-rotulo">
            {b.rotulo}
            <em>{AJUSTES[b.clave].toFixed(b.paso < 0.01 ? 4 : 2)}</em>
          </span>
          <input
            type="range"
            min={b.min}
            max={b.max}
            step={b.paso}
            defaultValue={AJUSTES[b.clave] as number}
            disabled={b.clave === "radioMinimo" && AJUSTES.minimoAuto}
            onChange={(e) => {
              (AJUSTES[b.clave] as number) = Number(e.target.value);
              onCambio();
            }}
          />
          <span className="mandos-pista">{b.nota}</span>
        </label>
      ))}

      <p className="mandos-nota">Material</p>
      <label className="mandos-barra">
        <span className="mandos-rotulo">
          Dispersión<em>{material.dispersion.toFixed(3)}</em>
        </span>
        <input
          type="range"
          min={0}
          max={0.04}
          step={0.001}
          value={material.dispersion}
          onChange={(e) => onMaterial({ ...material, dispersion: Number(e.target.value) })}
        />
        <span className="mandos-pista">el arcoíris del canto</span>
      </label>
      <label className="mandos-barra">
        <span className="mandos-rotulo">
          Suavidad<em>{material.suavidad}</em>
        </span>
        <input
          type="range"
          min={1}
          max={16}
          step={1}
          value={material.suavidad}
          onChange={(e) => onMaterial({ ...material, suavidad: Number(e.target.value) })}
        />
        <span className="mandos-pista">alto = superficie sin costura</span>
      </label>
      <label className="mandos-barra">
        <span className="mandos-rotulo">
          Redondeo<em>{material.redondeo}</em>
        </span>
        <input
          type="range"
          min={0}
          max={8}
          step={0.5}
          value={material.redondeo}
          onChange={(e) => onMaterial({ ...material, redondeo: Number(e.target.value) })}
        />
        <span className="mandos-pista">alisa las crestas y los cruces</span>
      </label>
      <label className="mandos-barra">
        <span className="mandos-rotulo">
          Brillo<em>{material.brillo.toFixed(2)}</em>
        </span>
        <input
          type="range"
          min={0.4}
          max={2.2}
          step={0.05}
          value={material.brillo}
          onChange={(e) => onMaterial({ ...material, brillo: Number(e.target.value) })}
        />
        <span className="mandos-pista">exposición del reflejo</span>
      </label>

      {/* La configuración entera en una línea, para poder copiarla o hacerle una
          captura cuando encuentres la buena. Sin esto habría que ir anotando
          nueve barras a mano. */}
      <p className="mandos-nota">Configuración</p>
      <code className="mandos-copia">
        {BARRAS.map((b) => `${b.clave}: ${AJUSTES[b.clave]}`).join(", ")},{" "}
        {`dispersion: ${material.dispersion}, suavidad: ${material.suavidad}, redondeo: ${material.redondeo}, brillo: ${material.brillo}`}
      </code>
    </div>
  );
}
