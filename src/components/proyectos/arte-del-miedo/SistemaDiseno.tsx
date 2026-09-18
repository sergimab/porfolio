"use client";

import { useLang } from "@/components/shared/useLang";
import { Cuadricula } from "./Isotipo";
import { raleway } from "./fuente";
// Las muestras SON los componentes de la app, así que hace falta su hoja de
// estilos. Se trae desde aquí y no con un `@import` dentro del CSS: el
// procesador del proyecto inlina los imports y vuelve a analizar el resultado,
// y ahí una hoja tan larga como la del prototipo se le atraganta.
import "./Prototipo.css";
import "./SistemaDiseno.css";

// DE QUÉ ESTÁ HECHA LA APP: la retícula, la letra, el color y las piezas.
//
// LAS MUESTRAS SON LOS COMPONENTES DE VERDAD, no dibujos de los componentes.
// El botón que se ve aquí es el mismo `.am-app-boton` que hay dentro del móvil,
// con sus mismas clases y sus mismas medidas, puesto sobre un lienzo que hereda
// los mismos tokens. Eso significa que el día que se retoque el botón, esta
// página se retoca sola; con una copia dibujada aparte, en dos semanas el
// sistema estaría enseñando una app que ya no existe.
//
// Por eso el lienzo declara `container-type` y va al mismo ancho que la
// pantalla del móvil: las medidas de la app están en `cqw` —porcentaje del
// ancho de su contenedor—, así que un lienzo más estrecho las enseñaría todas
// encogidas y un lienzo más ancho, hinchadas.

const RETICULA = [
  {
    dato: "645 × 1398",
    es: "La pantalla",
    en: "The screen",
    nota: "La medida de las maquetas. Todo lo demás se expresa en porcentaje de su ancho, así que la app escala entera como una pieza.",
    notaEn: "The mock-up size. Everything else is written as a percentage of its width, so the whole screen scales as one piece.",
  },
  {
    dato: "29 px",
    es: "La unidad",
    en: "The unit",
    nota: "El renglón del texto corrido. Al medir los huecos del diseño salieron tres distancias y no veinte, y todas son múltiplos de esta.",
    notaEn: "The body-text line. Measuring the design's gaps turned up three distances, not twenty, and all are multiples of this one.",
  },
  {
    dato: "58 · 81 px",
    es: "Los huecos",
    en: "The gaps",
    nota: "Dos renglones entre bloques; casi tres entre las partes grandes de una pantalla.",
    notaEn: "Two lines between blocks; nearly three between the big parts of a screen.",
  },
  {
    dato: "110 px",
    es: "Margen del recorrido",
    en: "Walkthrough margin",
    nota: "Columna corta, para un párrafo centrado que se lee de un golpe.",
    notaEn: "A short column, for a centred paragraph you take in at a glance.",
  },
  {
    dato: "40 px",
    es: "Margen de la app",
    en: "In-app margin",
    nota: "Más ancho: dentro hay listas y fichas, y esas piden sitio.",
    notaEn: "Wider: inside there are lists and entries, and those need room.",
  },
];

const TIPOS = [
  {
    clase: "am-sd-muestra-titulo",
    texto: "Escanea",
    nombre: "Título",
    nombreEn: "Heading",
    ficha: "Raleway Medium · 5,2 cqw · versalitas · +0,02 em",
    uso: "El nombre de cada pantalla y el de la fobia. Siempre una o dos líneas.",
    usoEn: "The name of each screen and of each fear. Never more than two lines.",
  },
  {
    clase: "am-sd-muestra-texto",
    texto: "Apunta la cámara al cuadro y la app te dirá qué miedo esconde.",
    nombre: "Texto",
    nombreEn: "Body",
    ficha: "Raleway Light · 3,8 cqw · renglón 1,32",
    uso: "Lo que se lee. En el recorrido va centrado y en las fichas, justificado.",
    usoEn: "What you read. Centred in the walkthrough, justified in the entries.",
  },
  {
    clase: "am-sd-muestra-menudo",
    texto: "Siguiente",
    nombre: "Menudo",
    nombreEn: "Small",
    ficha: "Raleway Regular · 3,4 cqw · +0,04 em",
    uso: "Rótulos de botón y avisos. El escalón pequeño, nunca para leer seguido.",
    usoEn: "Button labels and notices. The small step, never for running text.",
  },
];

const COLORES = [
  {
    hex: "#000000",
    es: "Fondo",
    en: "Background",
    nota: "La app es negra en los dos modos del sitio: es una sala a oscuras.",
    notaEn: "The app is black in both site modes: it is a darkened room.",
  },
  {
    hex: "#FFFFFF",
    es: "Texto",
    en: "Text",
    nota: "Blanco puro sobre negro puro. También el contorno de la barra.",
    notaEn: "Pure white on pure black. Also the menu bar's outline.",
  },
  {
    hex: "#3D00E4",
    es: "Azul",
    en: "Blue",
    nota: "El arranque del degradado. Sale de la paleta de la marca.",
    notaEn: "Where the gradient starts. Straight from the brand palette.",
  },
  {
    hex: "#FF1597",
    es: "Rosa",
    en: "Pink",
    nota: "El final del degradado. El mismo de los carteles y del escáner.",
    notaEn: "Where the gradient ends. The same one on the posters and the scanner.",
  },
  {
    hex: "#A5A5A5",
    es: "Apagado",
    en: "Muted",
    nota: "Los iconos del menú que no están en curso. Medido en el diseño.",
    notaEn: "The menu icons you are not on. Measured off the design.",
  },
];

export default function SistemaDiseno() {
  const lang = useLang();
  const t = (es: string, en: string) => (lang === "en" ? en : es);

  return (
    <section className={`am-sd ${raleway.variable}`}>
      <h3 className="am-sd-apartado">{t("Retícula", "Grid")}</h3>
      <ul className="am-sd-medidas">
        {RETICULA.map((m) => (
          <li key={m.dato}>
            <span className="am-sd-dato">{m.dato}</span>
            <span className="am-sd-que">{t(m.es, m.en)}</span>
            <span className="am-sd-nota">{t(m.nota, m.notaEn)}</span>
          </li>
        ))}
      </ul>

      <h3 className="am-sd-apartado">{t("Tipografía", "Type")}</h3>
      <p className="am-sd-entradilla">
        {t(
          "Raleway, la misma de la identidad, en tres pesos y tres tamaños. Las muestras están a la escala real de la app.",
          "Raleway, the same face as the identity, in three weights and three sizes. The samples are at the app's real scale."
        )}
      </p>
      <ul className="am-sd-tipos">
        {TIPOS.map((x) => (
          <li key={x.nombre}>
            <span className="am-sd-lienzo es-linea">
              <span className={x.clase}>{x.texto}</span>
            </span>
            <span className="am-sd-tipo-datos">
              <strong>{t(x.nombre, x.nombreEn)}</strong>
              <span className="am-sd-nota">{x.ficha}</span>
              <span className="am-sd-nota">{t(x.uso, x.usoEn)}</span>
            </span>
          </li>
        ))}
      </ul>

      <h3 className="am-sd-apartado">{t("Color", "Colour")}</h3>
      <ul className="am-sd-tintas">
        {COLORES.map((c) => (
          <li key={c.hex}>
            <span className="am-sd-tinta" style={{ background: c.hex }} />
            <strong>{t(c.es, c.en)}</strong>
            <span className="am-sd-nota">{c.hex}</span>
            <span className="am-sd-nota">{t(c.nota, c.notaEn)}</span>
          </li>
        ))}
        {/* El degradado va con las tintas y no aparte: en esta app no es un
            adorno que se pone encima de los colores, es LA marca. El isotipo
            del escáner, el canto de los botones, las barras del listado y la
            raya de los titulares son todos este mismo degradado. */}
        <li className="es-ancha">
          <span className="am-sd-tinta es-tinta" />
          <strong>{t("Degradado", "Gradient")}</strong>
          <span className="am-sd-nota">115° · #3D00E4 → #FF1597</span>
          <span className="am-sd-nota">
            {t(
              "La marca reducida a dos colores y un ángulo. Lo llevan el botón del escáner, el canto de los botones y los marcos, las barras del listado y la raya de los titulares.",
              "The brand boiled down to two colours and an angle. It carries the scanner button, the edge of buttons and frames, the chart bars and the rule under headings."
            )}
          </span>
        </li>
      </ul>

      <h3 className="am-sd-apartado">{t("Componentes", "Components")}</h3>
      <p className="am-sd-entradilla">
        {t(
          "No son dibujos de los componentes: son los componentes. Las piezas de aquí abajo comparten clases y medidas con las que hay dentro del móvil, así que si allí se retocan, aquí cambian solas.",
          "These are not pictures of the components: they are the components. The pieces below share classes and measurements with the ones inside the phone, so if those are tweaked, these follow."
        )}
      </p>
      <div className="am-sd-piezas">
        <figure className="am-sd-pieza">
          <div className="am-sd-lienzo">
            <span className="am-app-boton">
              <span>{t("Siguiente", "Next")}</span>
            </span>
            <span className="am-app-boton es-puesto">
              <span>{t("Siento el miedo", "I feel the fear")}</span>
            </span>
          </div>
          <figcaption>
            {t(
              "El botón: contorno en reposo, macizo al tocarlo. Y macizo fijo cuando marca algo, como el miedo que reconoces tuyo.",
              "The button: outlined at rest, solid when touched. And solid for good when it marks something, like a fear you recognise as yours."
            )}
          </figcaption>
        </figure>

        <figure className="am-sd-pieza">
          <div className="am-sd-lienzo">
            <span className="am-app-raya" />
            <span className="am-sd-iso">
              <Cuadricula
                mapa={[". . . . X", "X . . X .", ". X X . .", "X . X . X", ". . . X .", ". . . . X"]}
              />
            </span>
          </div>
          <figcaption>
            {t(
              "La raya del degradado y el isotipo, que aquí va siempre en blanco: dentro del botón del escáner es el hueco por el que se ve el color.",
              "The gradient rule and the isotype, always white here: inside the scanner button it is the gap the colour shows through."
            )}
          </figcaption>
        </figure>

        <figure className="am-sd-pieza">
          <div className="am-sd-lienzo es-alto">
            <ul className="am-app-listado">
              {[
                ["Claustrofobia", 100],
                ["Acrofobia", 74],
                ["Necrofobia", 43],
              ].map(([n, w]) => (
                <li key={n as string}>
                  <span>{n}</span>
                  <em className="am-app-pista">
                    <i style={{ width: `${w}%`, transition: "none" }} />
                  </em>
                </li>
              ))}
            </ul>
          </div>
          <figcaption>
            {t(
              "La fila del listado: el nombre en columna fija y la barra en su pista. La columna fija es lo que permite comparar unas con otras de un vistazo.",
              "The chart row: name in a fixed column, bar in its track. That fixed column is what lets you compare rows at a glance."
            )}
          </figcaption>
        </figure>

        <figure className="am-sd-pieza">
          <div className="am-sd-lienzo es-sangre">
            <div className="am-app-galeria">
              <span />
              <span />
            </div>
          </div>
          <figcaption>
            {t(
              "La banda de la colección: 3 : 1, a todo el ancho y separada de la siguiente por un hilo blanco.",
              "The collection band: 3 : 1, full width, parted from the next by a white hairline."
            )}
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
