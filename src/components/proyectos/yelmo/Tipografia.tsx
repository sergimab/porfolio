import { Dosis } from "next/font/google";
import LangText from "@/components/shared/LangText";
import RotuloSeccion from "@/components/shared/RotuloSeccion";
import "./Tipografia.css";

// La lámina de tipografía, con la misma composición que la de Espacio vacío: la
// muestra grande y el nombre a la izquierda, y a la derecha los pesos y el
// muestrario.
//
// Y con las fuentes de verdad, no con capturas: lo que enseña una lámina así es
// precisamente cómo dibuja cada letra. Dosis viene de Google y la sirve Next con
// el resto del sitio; Somatic Rounded no está en Google, así que va desde
// /fonts.
const dosis = Dosis({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--ym-dosis",
  display: "swap",
});

// Los cuatro pesos de la auxiliar, y para qué se usa cada extremo. Los dos de en
// medio no llevan destino porque el manual tampoco se lo da.
const PESOS: { peso: number; nombre: string; uso?: string; usoEn?: string }[] = [
  { peso: 700, nombre: "Bold", uso: "Títulos", usoEn: "Headings" },
  { peso: 500, nombre: "Medium" },
  { peso: 400, nombre: "Regular" },
  { peso: 300, nombre: "Light", uso: "Texto corrido", usoEn: "Body copy" },
];

const USOS = [
  { es: "Nombre y logotipo", en: "Name and logotype" },
  { es: "Titulares de marca", en: "Brand headlines" },
  { es: "Geométrica y redondeada", en: "Geometric and rounded" },
];

// El muestrario, en las mismas líneas que el manual.
const MAYUSCULAS = ["ABCDEFGHIJK", "LMNÑOPQRST", "UVWXYZ"];
const MINUSCULAS = ["abcdefghijk", "lmnñopqrst", "uvwxyz"];
const SIGNOS = ["®îŠŁåãæÖÙÜÚ¼½¾", "§{}¶!¡#$%&()"];

export default function Tipografia() {
  return (
    <section className={`ym-tipo ${dosis.variable}`}>
      <RotuloSeccion className="ym-tipo-titulo" es="Tipografía" en="Typography" />

      <div className="ym-tipo-rejilla">
        {/* Columna izquierda: la corporativa, con la que está dibujado el
            logotipo. */}
        <div className="ym-tipo-izq">
          <p className="ym-tipo-aa es-somatic" aria-hidden="true">
            Aa
          </p>
          <p className="ym-tipo-nombre es-somatic">
            Somatic
            <br />
            Rounded
          </p>
          <span className="ym-tipo-etiqueta">
            <LangText es="Corporativa" en="Corporate" />
          </span>
          <ul className="ym-tipo-razones">
            {USOS.map((u) => (
              <li key={u.es}>
                <LangText es={u.es} en={u.en} />
              </li>
            ))}
          </ul>
        </div>

        {/* Columna derecha: la auxiliar, con sus pesos y su muestrario. */}
        <div className="ym-tipo-der">
          <div className="ym-tipo-pesos">
            <p className="ym-tipo-nombre es-dosis">Dosis</p>
            <span className="ym-tipo-etiqueta">
              <LangText es="Auxiliar" en="Secondary" />
            </span>
            {PESOS.map((p) => (
              <div className="ym-tipo-peso" key={p.peso}>
                {/* El nombre del peso, la línea que lo une con su muestra y la
                    muestra. La línea es un borde y no un guion largo: así se
                    estira con el hueco disponible en vez de cortarse. */}
                <span className="ym-tipo-peso-nombre" style={{ fontWeight: p.peso }}>
                  {p.nombre}
                </span>
                <span className="ym-tipo-peso-linea" aria-hidden="true" />
                <div className="ym-tipo-peso-uso">
                  {p.uso && (
                    <span>
                      <LangText es={p.uso} en={p.usoEn ?? p.uso} />
                    </span>
                  )}
                  <p style={{ fontWeight: p.peso }} aria-hidden="true">
                    AaBbCc 123
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="ym-tipo-muestrario" aria-hidden="true">
            <div className="ym-tipo-abecedario">
              {MAYUSCULAS.map((l) => (
                <p key={l}>{l}</p>
              ))}
            </div>
            <div className="ym-tipo-abecedario">
              {MINUSCULAS.map((l) => (
                <p key={l}>{l}</p>
              ))}
              <div className="ym-tipo-signos">
                {SIGNOS.map((l) => (
                  <p key={l}>{l}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
