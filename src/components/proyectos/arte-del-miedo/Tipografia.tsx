import LangText from "@/components/shared/LangText";
import { raleway } from "./fuente";
import "./Tipografia.css";

// La lámina de tipografía, con la misma estructura que la de Espacio vacío: la
// muestra grande y las razones a la izquierda, los pesos y el muestrario a la
// derecha.
//
// Va ESCRITA con Raleway y no es una captura: lo que enseña es precisamente
// cómo dibuja la fuente cada letra, y una imagen se queda borrosa en cuanto
// alguien amplía. La fuente se trae de Google (ver fuente.ts).
//
// Sin rótulo propio: esta lámina vive dentro de la sección «Tipografía y color»
// de la página, que ya lleva el suyo. Dos rótulos seguidos se leerían como dos
// apartados distintos.

// Los tres pesos y a qué se destina cada uno.
const PESOS = [
  { peso: 700, nombre: "Bold", uso: "Título", usoEn: "Heading" },
  { peso: 500, nombre: "Medium", uso: "Subtítulo", usoEn: "Subheading" },
  { peso: 400, nombre: "Regular", uso: "Texto", usoEn: "Body" },
];

// Por qué esta y no otra. Son las razones del propio proyecto, partidas en
// líneas: una sans serif moderna, muy legible, que aguanta un titular grande y
// también un bloque de texto largo.
const RAZONES = [
  { es: "Sans serif moderna", en: "A modern sans serif" },
  { es: "Muy legible", en: "Highly legible" },
  { es: "Aguanta un titular grande", en: "Holds up at headline size" },
  { es: "Y un bloque de texto largo", en: "And across a long block of text" },
];

// El muestrario. La eñe va donde le toca en el alfabeto español.
const MAYUSCULAS = ["ABCDEFGHIJK", "LMNÑOPQRST", "UVWXYZ"];
const MINUSCULAS = ["abcdefghijk", "lmnñopqrst", "uvwxyz"];
const SIGNOS = ["®îŠŁåãæÖÙÜÚ¼½¾", "§{}¶!¡#$%&()"];

export default function Tipografia() {
  return (
    // La clase de la fuente va aquí y no en el <body>: es lo que hace que
    // Raleway solo se descargue en las páginas de este proyecto.
    <div className={`am-tipo ${raleway.variable}`}>
      <div className="am-tipo-rejilla">
        {/* Columna izquierda: la muestra grande, el nombre y por qué esta. */}
        <div className="am-tipo-izq">
          <p className="am-tipo-aa" aria-hidden="true">
            Aa
          </p>
          <p className="am-tipo-nombre">Raleway</p>
          <ul className="am-tipo-razones">
            {RAZONES.map((r) => (
              <li key={r.es}>
                <LangText es={r.es} en={r.en} />
              </li>
            ))}
          </ul>
        </div>

        {/* Columna derecha: los pesos arriba y el muestrario abajo. */}
        <div className="am-tipo-der">
          <div className="am-tipo-pesos">
            {PESOS.map((p) => (
              <div className="am-tipo-peso" key={p.peso}>
                {/* El nombre del peso, la línea que lo une con su uso y la
                    muestra. La línea es un borde y no un guion largo: así se
                    estira con el hueco disponible en vez de cortarse. */}
                <span className="am-tipo-peso-nombre" style={{ fontWeight: p.peso }}>
                  {p.nombre}
                </span>
                <span className="am-tipo-peso-linea" aria-hidden="true" />
                <div className="am-tipo-peso-uso">
                  <span>
                    <LangText es={p.uso} en={p.usoEn} />
                  </span>
                  <p style={{ fontWeight: p.peso }} aria-hidden="true">
                    Aa
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="am-tipo-muestrario" aria-hidden="true">
            <div className="am-tipo-abecedario">
              {MAYUSCULAS.map((l) => (
                <p key={l}>{l}</p>
              ))}
            </div>
            <div className="am-tipo-abecedario">
              {MINUSCULAS.map((l) => (
                <p key={l}>{l}</p>
              ))}
              <div className="am-tipo-signos">
                {SIGNOS.map((l) => (
                  <p key={l}>{l}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
