"use client";

import { useLang } from "@/components/shared/useLang";
import { COLORES } from "./Prototipo";
import "./SistemaDiseno.css";

// El sistema de diseño de la app.
//
// LAS MUESTRAS SON LOS COMPONENTES DE VERDAD: llevan las clases de la app y
// heredan sus medidas, así que lo que se ve aquí es exactamente lo que se usa
// en el prototipo de arriba. Una lámina dibujada aparte se quedaría vieja al
// primer retoque y acabaría contando algo que la app ya no hace.
//
// Cada muestra vive dentro de un lienzo que mide lo mismo que la pantalla del
// móvil (330 px) y que es contenedor de consulta, que es lo que hace que las
// medidas en `cqw` —porcentaje del ancho de la pantalla— den aquí el mismo
// resultado que allí.

const ANCHO = 330; // el ancho del móvil del prototipo, en píxeles

// La escala tipográfica, con su tamaño en porcentaje del ancho y lo que mide a
// ese ancho. Los dos datos: el porcentaje es la regla, los píxeles son lo que
// se ve.
const TIPOS = [
  { paso: "--titulazo", cqw: 6.1, peso: 700, es: "Titular", en: "Display", uso: "La bienvenida", usoEn: "The welcome screen" },
  { paso: "--titulo", cqw: 4.8, peso: 600, es: "Título", en: "Heading", uso: "El título de cada pantalla", usoEn: "Each screen's title" },
  { paso: "--rotulo", cqw: 4.2, peso: 500, es: "Rótulo", en: "Label", uso: "Menús y pestañas", usoEn: "Menus and tabs" },
  { paso: "--texto", cqw: 3.6, peso: 400, es: "Texto", en: "Body", uso: "El cuerpo de lectura", usoEn: "Reading copy" },
  { paso: "--menudo", cqw: 3.2, peso: 600, es: "Menudo", en: "Small", uso: "Botones, campos y datos", usoEn: "Buttons, fields and data" },
];

// Los colores. Los cuatro de actividad son los de la marca; el nombre que
// llevan aquí es el que les da la app, que no es el mismo que el de la lámina
// de marca —allí el naranja son logros y el verde hábitos—.
const TINTAS = [
  { hex: "#252221", es: "Negro", en: "Black", uso: "Texto y trazos", usoEn: "Text and strokes" },
  { hex: "#FFFFFF", es: "Blanco", en: "White", uso: "El fondo de la pantalla", usoEn: "The screen background" },
  { hex: COLORES.relaciones, es: "Rosa", en: "Pink", uso: "Relaciones personales", usoEn: "Personal relationships" },
  { hex: COLORES.aficiones, es: "Morado", en: "Purple", uso: "Aficiones", usoEn: "Hobbies" },
  { hex: COLORES.habitos, es: "Naranja", en: "Orange", uso: "Hábitos saludables", usoEn: "Healthy habits" },
  { hex: COLORES.logros, es: "Verde", en: "Green", uso: "Logros", usoEn: "Achievements" },
];

// La retícula: las medidas que se repiten en todas las pantallas.
const MEDIDAS = [
  { dato: "860 × 1864", es: "La pantalla", en: "The screen", nota: "La del archivo de Figma", notaEn: "As in the Figma file" },
  { dato: "11,5 %", es: "Margen lateral", en: "Side margin", nota: "Del ancho de la pantalla", notaEn: "Of the screen width" },
  { dato: "2,6 · 4 · 7 %", es: "Ritmo vertical", en: "Vertical rhythm", nota: "Los tres huecos, y no más", notaEn: "Three gaps, and no more" },
  { dato: "22 %", es: "Cabecera", en: "Header", nota: "Logotipo centrado y flecha a la izquierda", notaEn: "Centred logo, arrow on the left" },
  { dato: "33 %", es: "Pie", en: "Footer", nota: "Donde caen atrás y siguiente", notaEn: "Where back and next sit" },
];

// Una muestra. El lienzo mide lo que la pantalla del móvil y no lleva relleno
// lateral: es lo que hace que `cqw` dé aquí el mismo número que allí, y por
// tanto que la pieza salga a su tamaño de verdad. El margen de la app lo pone
// el forro de dentro, salvo en las piezas que van de canto a canto —las bandas
// del menú—, que lo saltan.
function Muestra({
  titulo,
  children,
  sangre,
}: {
  titulo: string;
  children: React.ReactNode;
  sangre?: boolean;
}) {
  return (
    <figure className="ev-sd-pieza">
      <div className="ev-sd-lienzo">
        <div className={`ev-sd-dentro${sangre ? " es-sangre" : ""}`}>{children}</div>
      </div>
      <figcaption>{titulo}</figcaption>
    </figure>
  );
}

export default function SistemaDiseno() {
  const lang = useLang();
  const t = (es: string, en: string) => (lang === "en" ? en : es);

  return (
    <section className="ev-sd">
      {/* Sin rótulo propio: el apartado vive en una pestaña que ya lo nombra. */}
      {/* ── La retícula ── */}
      <h3 className="ev-sd-apartado">{t("Retícula", "Grid")}</h3>
      <ul className="ev-sd-medidas">
        {MEDIDAS.map((m) => (
          <li key={m.es}>
            <span className="ev-sd-dato">{m.dato}</span>
            <span className="ev-sd-que">{t(m.es, m.en)}</span>
            <span className="ev-sd-nota">{t(m.nota, m.notaEn)}</span>
          </li>
        ))}
      </ul>

      {/* ── La tipografía ── */}
      <h3 className="ev-sd-apartado">{t("Tipografía", "Type")}</h3>
      <p className="ev-sd-entradilla">
        {t(
          "Clash Grotesk, cinco pasos. El tamaño va en porcentaje del ancho de la pantalla, no en píxeles: así la app entera escala como una pieza en cualquier aparato. Al lado, lo que mide cada paso en el móvil del prototipo.",
          "Clash Grotesk, five steps. Sizes are a percentage of the screen width, not pixels, so the whole app scales as one piece on any device. Alongside, what each step measures on the prototype's phone."
        )}
      </p>
      <ul className="ev-sd-tipos">
        {TIPOS.map((x) => (
          <li key={x.paso}>
            <span
              className="ev-sd-tipo-muestra"
              style={{ fontSize: `${(x.cqw * ANCHO) / 100}px`, fontWeight: x.peso }}
            >
              Aa
            </span>
            <span className="ev-sd-tipo-datos">
              <b>{t(x.es, x.en)}</b>
              <span className="ev-sd-nota">
                {x.cqw} % · {Math.round((x.cqw * ANCHO) / 100)} px · {x.peso}
              </span>
              <span className="ev-sd-nota">{t(x.uso, x.usoEn)}</span>
            </span>
          </li>
        ))}
      </ul>

      {/* ── El color ── */}
      <h3 className="ev-sd-apartado">{t("Color", "Colour")}</h3>
      <ul className="ev-sd-tintas">
        {TINTAS.map((c) => (
          <li key={c.hex}>
            <span className="ev-sd-tinta" style={{ background: c.hex }} />
            <b>{t(c.es, c.en)}</b>
            <span className="ev-sd-nota">{c.hex}</span>
            <span className="ev-sd-nota">{t(c.uso, c.usoEn)}</span>
          </li>
        ))}
      </ul>

      {/* ── Los componentes ──
          Todo lo de aquí abajo lleva las clases de la app: son las piezas de
          verdad, no un dibujo de ellas. */}
      <h3 className="ev-sd-apartado">{t("Componentes", "Components")}</h3>
      <div className="ev-sd-piezas">
        <Muestra titulo={t("Botón", "Button")}>
          <button type="button" className="ev-app-boton">
            {t("Siguiente", "Next")}
          </button>
        </Muestra>

        <Muestra titulo={t("Par de botones", "Button pair")}>
          <div className="ev-app-fila" style={{ marginTop: 0 }}>
            <button type="button" className="ev-app-boton">
              {t("Soy nuevo", "I'm new")}
            </button>
            <button type="button" className="ev-app-boton">
              {t("Tengo cuenta", "I have an account")}
            </button>
          </div>
        </Muestra>

        <Muestra titulo={t("Campo", "Field")}>
          <label className="ev-app-campo" style={{ display: "block" }}>
            <input type="text" placeholder={t("Correo electrónico", "Email")} readOnly />
          </label>
        </Muestra>

        <Muestra titulo={t("Campo desplegable", "Dropdown")}>
          <div className="ev-app-campo es-desplegable" style={{ marginBottom: 0 }}>
            10 / 01 / 2024
            <svg viewBox="0 0 12 8" aria-hidden="true">
              <path d="M1 1.5 6 6.5 11 1.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </div>
        </Muestra>

        <Muestra titulo={t("Dato con cambio", "Editable data")}>
          <div className="ev-app-dato" style={{ marginBottom: 0 }}>
            <div className="ev-app-dato-campo">
              <p className="ev-app-dato-rotulo">{t("Nombre", "First name")}</p>
              <p className="ev-app-dato-valor">Clara</p>
            </div>
            <button type="button" className="ev-app-dato-cambiar">
              {t("cambiar", "change")}
            </button>
          </div>
        </Muestra>

        <Muestra titulo={t("Pestañas", "Tabs")}>
          <div className="ev-app-pestanas" style={{ marginBottom: 0 }}>
            <button type="button" className="ev-app-pestana es-puesta">
              {t("Diario", "Daily")}
            </button>
            <button type="button" className="ev-app-pestana">
              {t("Mensual", "Monthly")}
            </button>
            <button type="button" className="ev-app-pestana">
              {t("Anual", "Yearly")}
            </button>
          </div>
        </Muestra>

        <Muestra titulo={t("Añadir", "Add")}>
          <div className="ev-sd-mases">
            {[COLORES.relaciones, COLORES.aficiones, COLORES.habitos, COLORES.logros].map((c) => (
              <span key={c} className="ev-app-mas" style={{ background: c }}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" fill="none" stroke="#252221" strokeWidth="2" />
                </svg>
              </span>
            ))}
          </div>
        </Muestra>

        <Muestra titulo={t("Recuento", "Counter")}>
          <ul className="ev-app-cuentas" style={{ margin: 0 }}>
            <li style={{ marginBottom: 0 }}>
              <span className="ev-app-cuenta-n" style={{ background: COLORES.habitos }}>
                6
              </span>
              {t("Hábitos saludables", "Healthy habits")}
            </li>
            <li style={{ marginBottom: 0 }}>
              <span className="ev-app-cuenta-n es-caja">112</span>
              {t("Espacios vacíos", "Empty slots")}
            </li>
          </ul>
        </Muestra>

        <Muestra titulo={t("Elección de horas", "Hours picker")}>
          <div className="ev-app-horas" style={{ marginTop: 0 }}>
            {[1, 2, 3, 4, 5, 6].map((h) => (
              <button key={h} type="button" className={`ev-app-hora${h === 3 ? " es-elegida" : ""}`}>
                {h}
              </button>
            ))}
          </div>
        </Muestra>

        <Muestra titulo={t("Banda de menú", "Menu row")} sangre>
          <div className="ev-sd-bandas">
            <span className="ev-app-banda">{t("Calendario", "Calendar")}</span>
            <span className="ev-app-banda">{t("Momentos", "Moments")}</span>
          </div>
        </Muestra>

        <Muestra titulo={t("Rejilla de casillas", "Slot grid")}>
          <div className="ev-app-rejilla" style={{ marginTop: 0 }}>
            {Array.from({ length: 6 }, (_, i) => (
              <span key={i}>{t("45 min / día", "45 min / day")}</span>
            ))}
          </div>
        </Muestra>

        <Muestra titulo={t("Hueco de la foto", "Photo slot")}>
          <div
            className="ev-app-hueco-foto"
            style={{
              marginBottom: 0,
              borderColor: COLORES.aficiones,
              background: `color-mix(in srgb, ${COLORES.aficiones} 14%, #fff)`,
            }}
          >
            <span className="ev-app-mas" style={{ background: COLORES.aficiones }}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 5v14M5 12h14" fill="none" stroke="#252221" strokeWidth="2" />
              </svg>
            </span>
          </div>
        </Muestra>
      </div>
    </section>
  );
}
