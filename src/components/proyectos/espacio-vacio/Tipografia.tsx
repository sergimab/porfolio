import LangText from "@/components/shared/LangText";
import RotuloSeccion from "@/components/shared/RotuloSeccion";
import "./Tipografia.css";

// La lámina de tipografía del manual, montada en web.
//
// A diferencia de la de color, esta tiene que estar ESCRITA con la fuente de
// verdad y no puede ser una imagen: es una muestra tipográfica, así que lo que
// enseña es precisamente cómo dibuja la fuente cada letra, y una captura la
// deja borrosa en cuanto alguien amplía. Va cargada desde el propio sitio —ver
// el @font-face del CSS—, que la licencia de Fontshare lo permite.
//
// El archivo es el VARIABLE: uno solo cubre los tres pesos de la lámina, así
// que se descargan 47 KB en vez de tres archivos.

// Los tres pesos y a qué se destina cada uno. El número es el que se le pide a
// la fuente variable, dentro de su rango de 200 a 700.
const PESOS = [
  { peso: 700, nombre: "Bold", uso: "Título", usoEn: "Heading" },
  { peso: 500, nombre: "Medium", uso: "Subtítulo", usoEn: "Subheading" },
  { peso: 400, nombre: "Regular", uso: "Texto", usoEn: "Body" },
];

const RAZONES = [
  { es: "Versatilidad y adaptabilidad", en: "Versatile and adaptable" },
  { es: "Estética moderna", en: "Modern aesthetic" },
  { es: "Expresión de valores, juventud y tecnología", en: "Expresses values, youth and technology" },
  { es: "Legibilidad y claridad", en: "Legible and clear" },
  { es: "Identidad visual única", en: "A visual identity of its own" },
];

// El muestrario, repartido en las mismas líneas que el manual. La eñe va donde
// le toca en el alfabeto español, que es como está en la lámina.
const MAYUSCULAS = ["ABCDEFGHIJK", "LMNÑOPQRST", "UVWXYZ"];
const MINUSCULAS = ["abcdefghijk", "lmnñopqrst", "uvwxyz"];
const SIGNOS = ["®îŠŁåãæÖÙÜÚ¼½¾", "§{}¶!¡#$%&()"];

export default function Tipografia() {
  return (
    <section className="ev-tipo">
      <RotuloSeccion es="Tipografía" en="Typography" />

      <div className="ev-tipo-rejilla">
        {/* Columna izquierda: la muestra grande, el nombre y por qué esta. */}
        <div className="ev-tipo-izq">
          <p className="ev-tipo-aa" aria-hidden="true">
            Aa
          </p>
          <p className="ev-tipo-nombre">
            Clash Grotesk
            <br />
            Variable
          </p>
          <ul className="ev-tipo-razones">
            {RAZONES.map((r) => (
              <li key={r.es}>
                <LangText es={r.es} en={r.en} />
              </li>
            ))}
          </ul>
        </div>

        {/* Columna derecha: los pesos arriba y el muestrario abajo. */}
        <div className="ev-tipo-der">
          <div className="ev-tipo-pesos">
            {PESOS.map((p) => (
              <div className="ev-tipo-peso" key={p.peso}>
                {/* El nombre del peso, la línea que lo une con su uso y la
                    muestra. La línea es un borde y no un guion largo: así se
                    estira con el hueco disponible en vez de cortarse. */}
                <span className="ev-tipo-peso-nombre" style={{ fontWeight: p.peso }}>
                  {p.nombre}
                </span>
                <span className="ev-tipo-peso-linea" aria-hidden="true" />
                <div className="ev-tipo-peso-uso">
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

          <div className="ev-tipo-muestrario" aria-hidden="true">
            <div className="ev-tipo-abecedario">
              {MAYUSCULAS.map((l) => (
                <p key={l}>{l}</p>
              ))}
            </div>
            <div className="ev-tipo-abecedario">
              {MINUSCULAS.map((l) => (
                <p key={l}>{l}</p>
              ))}
              <div className="ev-tipo-signos">
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
