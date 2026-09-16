"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLang } from "@/components/shared/useLang";
import "./Prototipo.css";

// El alta de la app, dentro de un móvil y navegable.
//
// Las pantallas están PROGRAMADAS, no son capturas de Figma: el texto es texto
// —se puede seleccionar, lo lee un lector de pantalla y cambia de idioma con el
// resto del sitio—, los botones son botones de verdad y todo se dibuja nítido a
// cualquier tamaño. Una captura pesa más, se ve borrosa al ampliar y obliga a
// poner zonas invisibles encima para fingir que se puede pulsar.
//
// Las medidas van en `cqw`: uno por ciento del ANCHO DEL MÓVIL, que es un
// contenedor de consulta. Así la pantalla escala como una sola pieza —igual que
// una app cambiando de tamaño de dispositivo— en vez de descuadrarse cuando el
// móvil se hace pequeño en el teléfono.

// Los cuatro asuntos que se registran a mano, cada uno con su color de la
// paleta: los mismos que la marca da a los cuartos del isotipo.
const ASUNTOS = [
  { color: "#FF5C5C", es: "Relaciones personales", en: "Personal relationships" },
  { color: "#A484FF", es: "Aficiones", en: "Hobbies" },
  { color: "#A1F08D", es: "Hábitos saludables", en: "Healthy habits" },
  { color: "#FFAE11", es: "Logros", en: "Achievements" },
];

// La home: las bandas del menú, de arriba abajo. `alto` es el reparto del hueco
// que queda bajo el logotipo, medido sobre el diseño; `va` es la pantalla a la
// que lleva cada una, y las que aún no existen se pintan igual pero no navegan.
const MENU: { es: string; en: string; alto: number; va?: string }[] = [
  { es: "Calendario", en: "Calendar", alto: 184, va: "calendario" },
  { es: "Momentos", en: "Moments", alto: 186, va: "momentos" },
  { es: "Datos", en: "Data", alto: 192, va: "datos" },
];
const MENU_PIE: { es: string; en: string; va?: string }[] = [
  { es: "Perfil", en: "Profile", va: "perfil" },
  { es: "Guía", en: "Guide", va: "guia" },
];

// Los cuatro cuartos del isotipo, los mismos trazados que en la página de
// marca: la pieza se dibuja, no se trae como imagen.
const CUARTOS = [
  "M61.72,45.7v16.02h-15.33c1.54,5.36,6.47,9.28,12.33,9.28,7.09,0,12.83-5.75,12.83-12.83,0-6.05-4.19-11.11-9.83-12.47Z",
  "M9.28,61.72v-15.88c-5.36,1.54-9.28,6.47-9.28,12.33,0,7.09,5.75,12.83,12.83,12.83,5.86,0,10.78-3.93,12.33-9.28h-15.88Z",
  "M9.28,9.28h15.88C23.62,3.93,18.69,0,12.83,0,5.75,0,0,5.75,0,12.83c0,5.86,3.93,10.78,9.28,12.33v-15.88Z",
  "M58.71,0c-5.86,0-10.78,3.93-12.33,9.28h15.33v16.02c5.64-1.35,9.83-6.41,9.83-12.47,0-7.09-5.75-12.83-12.83-12.83Z",
];

// Traductor corto. Aquí no sirve <LangText>, que solo admite cadenas: dentro de
// la app hay textos con un dato metido en medio y marcadores de posición de los
// campos, que son atributos.
type T = (es: string, en: string) => string;

type Ctx = {
  ir: (id: string) => void;
  t: T;
  horas: number;
  setHoras: (h: number) => void;
  // La categoría que se está anotando, o nula si no hay ninguna. Añadir un
  // momento no es otra pantalla: es un panel que se abre ENCIMA de las cuatro
  // categorías y ocupa su sitio, con el texto y «Mis momentos» quietos arriba.
  abierta: string | null;
  setAbierta: (c: string | null) => void;
};

// La cabecera: el logotipo y, en las pantallas que lo piden, la flecha de
// volver. Las demás vuelven con un botón abajo; ver `flecha` en cada pantalla.
function Cabecera({ atras, t }: { atras?: () => void; t: T }) {
  return (
    <header className={`ev-app-cabecera${atras ? " es-pulsable" : ""}`}>
      {atras && (
        <button type="button" className="ev-app-atras" onClick={atras}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 4 7 12l8 8" fill="none" stroke="currentColor" strokeWidth="2.2" />
          </svg>
          <span className="ev-oculto">{t("Volver", "Back")}</span>
        </button>
      )}
      {/* El logotipo, del mismo archivo que usa todo el proyecto. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="ev-app-logo"
        src="/proyectos/espacio-vacio/espacio-vacio-logo.svg"
        alt="Espacio vacío"
      />
    </header>
  );
}

// Un botón de la app: contorno fino y rótulo en versalitas, como en el diseño.
function Boton({
  onClick,
  children,
  clase,
}: {
  onClick: () => void;
  children: React.ReactNode;
  clase?: string;
}) {
  return (
    <button type="button" className={`ev-app-boton${clase ? ` ${clase}` : ""}`} onClick={onClick}>
      {children}
    </button>
  );
}

// Un campo del formulario. Va como <input> de verdad y no como una caja
// dibujada —así hereda la forma, el cursor y el comportamiento de un campo—,
// pero de solo lectura: esto es la demostración de una pantalla, no un
// formulario que vaya a ninguna parte.
function Campo({
  texto,
  valor,
  escribiendo,
  clave,
}: {
  texto: string;
  valor?: string;
  // Campo de contraseña: se oculta como en un teclado de móvil —la última
  // letra a la vista un momento y el resto en bolitas— y acaba en bolitas del
  // todo.
  clave?: boolean;
  // El que se está tecleando lleva el cursor: es lo que hace que se lea como
  // alguien rellenando el formulario y no como un texto que aparece de golpe.
  escribiendo?: boolean;
}) {
  // Mientras se teclea NO hay <input>, hay una caja igual con el texto y el
  // cursor detrás de la última letra. Es la única forma de que el cursor caiga
  // donde tiene que caer: dentro de un campo, el del navegador solo se dibuja
  // si el campo tiene el foco, y robarle el foco a quien está leyendo la página
  // le arrastraría el desplazamiento hasta aquí. Al terminar vuelve el campo de
  // verdad, que es el que se puede usar.
  if (escribiendo) {
    const escrito = valor ?? "";
    // En una contraseña, lo que se ve mientras se teclea es lo que enseña un
    // móvil: todo en bolitas menos la letra recién pulsada.
    const alaVista = clave
      ? "•".repeat(Math.max(0, escrito.length - 1)) + escrito.slice(-1)
      : escrito;
    return (
      <div
        className={`ev-app-campo es-escribiendo${clave ? " es-clave" : ""}`}
        aria-hidden="true"
      >
        <span className="ev-app-tecleado">
          {alaVista}
          <i />
        </span>
      </div>
    );
  }

  return (
    <label className={`ev-app-campo${clave ? " es-clave" : ""}`}>
      <span className="ev-oculto">{texto}</span>
      {/* Acabada de escribir, la contraseña va en un campo de tipo password:
          las bolitas las pone el navegador, con la forma que tenga el sistema,
          que es exactamente lo que se ve en un móvil.
          De SOLO LECTURA: esto es la demostración de una pantalla, no un
          formulario. Escribiendo dentro se estropea el ejemplo y no se gana
          nada, porque no hay ninguna cuenta al otro lado. */}
      <input
        type={clave ? "password" : "text"}
        placeholder={texto}
        value={valor ?? ""}
        readOnly
      />
    </label>
  );
}

// Un campo que se despliega: se pinta como uno normal pero con el galón a la
// derecha. No abre nada —la lista desplegada no está diseñada—, así que se
// queda en lo que enseña el archivo.
function Desplegable({ texto }: { texto: string }) {
  return (
    <div className="ev-app-campo es-desplegable">
      {texto}
      <svg viewBox="0 0 12 8" aria-hidden="true">
        <path d="M1 1.5 6 6.5 11 1.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    </div>
  );
}

// El formulario que se rellena solo, letra a letra.
//
// Se teclea de verdad —un carácter por golpe de reloj, con el cursor en el
// campo que toca— en vez de aparecer relleno: lo que se está enseñando es cómo
// se USA la pantalla, y un formulario ya lleno no cuenta nada que no contara
// una captura.
//
function CamposAuto({
  campos,
}: {
  campos: { etiqueta: string; valor: string; clave?: boolean }[];
}) {
  const [escrito, setEscrito] = useState<string[]>(() => campos.map(() => ""));
  const [enCurso, setEnCurso] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Sin animación: los campos salen rellenos y ya está. La información es
      // la misma; lo que se pierde es el gesto.
      setEscrito(campos.map((c) => c.valor));
      setEnCurso(campos.length);
      return;
    }
    // `vivo` es de ESTA pasada del efecto, no un ref compartido: en desarrollo
    // React monta, desmonta y vuelve a montar para destapar efectos mal
    // cerrados, y un ref puesto a falso en la primera limpieza dejaba la
    // segunda pasada muerta antes de empezar.
    let vivo = true;
    let campo = 0;
    let letra = 0;
    let reloj: ReturnType<typeof setTimeout>;
    const paso = () => {
      if (!vivo || campo >= campos.length) return;
      letra += 1;
      // El índice se copia a una constante ANTES de tocar `campo`: la función
      // que actualiza el estado no se ejecuta al programarla, sino cuando React
      // la llama, y para entonces `campo` ya habría avanzado. Leyéndolo de ahí,
      // la última letra de cada campo acababa escrita en el campo siguiente y
      // todos se quedaban un carácter cortos.
      const donde = campo;
      const hasta = campos[donde].valor.slice(0, letra);
      setEscrito((antes) => {
        const copia = [...antes];
        copia[donde] = hasta;
        return copia;
      });
      const acabado = letra >= campos[donde].valor.length;
      if (acabado) {
        campo += 1;
        letra = 0;
        setEnCurso(campo);
      }
      // Rápido, que esto es el trámite y no el asunto de la pantalla; pero con
      // el golpe irregular, que a ritmo fijo suena a máquina. Y entre campo y
      // campo, la pausa corta de buscar el siguiente.
      reloj = setTimeout(paso, acabado ? 150 : 11 + Math.random() * 18);
    };
    // Un respiro antes de empezar, para que se vea la pantalla vacía primero.
    reloj = setTimeout(paso, 260);
    return () => {
      vivo = false;
      clearTimeout(reloj);
    };
    // Los campos no cambian mientras la pantalla está puesta: se monta una vez
    // por visita, y al volver a entrar el componente se rehace entero.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="ev-app-campos">
      {campos.map((c, i) => (
        <Campo
          key={c.etiqueta}
          texto={c.etiqueta}
          valor={escrito[i]}
          clave={c.clave}
          escribiendo={i === enCurso && escrito[i] !== c.valor}
        />
      ))}
    </div>
  );
}

// La ficha de la persona: el nombre, la edad y el correo. La llevan igual la
// pantalla de perfil y la de cambiar la foto, así que se escribe una vez.
function Ficha() {
  return (
    <div className="ev-app-ficha">
      <p className="ev-app-ficha-nombre">Clara Gutiérrez</p>
      <p>22</p>
      <p>cgutierrez@gmail.com</p>
    </div>
  );
}

// El hueco donde va la cara: el óvalo de guía que enseña dónde colocarla. Es un
// dibujo, no una imagen, así que se ve nítido a cualquier tamaño.
function Hueco() {
  return (
    <div className="ev-app-hueco">
      <svg viewBox="0 0 100 130" aria-hidden="true">
        <ellipse cx="50" cy="62" rx="35" ry="47" />
        <ellipse cx="36" cy="62" rx="7.5" ry="4.5" />
        <ellipse cx="64" cy="62" rx="7.5" ry="4.5" />
      </svg>
    </div>
  );
}

// Una línea de «Mis datos»: el rótulo, el valor subrayado y, al lado, el botón
// de cambiarlo. La fecha es la excepción: se despliega, así que lleva un galón
// pegado a su rótulo en lugar de botón.
function Dato({
  etiqueta,
  valor,
  despliega,
  solo,
  t,
}: {
  etiqueta: string;
  valor: string;
  despliega?: boolean;
  // Sin botón de cambiar: en el formulario de envío estos campos se rellenan,
  // no se modifican.
  solo?: boolean;
  t: T;
}) {
  return (
    <div className="ev-app-dato">
      <div className="ev-app-dato-campo">
        <p className="ev-app-dato-rotulo">
          {etiqueta}
          {despliega && (
            <svg viewBox="0 0 12 8" aria-hidden="true">
              <path d="M1 1.5 6 6.5 11 1.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          )}
        </p>
        <p className="ev-app-dato-valor">{valor}</p>
      </div>
      {!despliega && !solo && (
        <button type="button" className="ev-app-dato-cambiar">
          {t("cambiar", "change")}
        </button>
      )}
    </div>
  );
}



// OJO CON LOS COLORES: aquí el naranja es «hábitos saludables» y el verde
// «logros», al revés que en la lámina de marca. Se respeta lo que dice esta
// pantalla, que es la que se está montando.
const COLORES = {
  habitos: "#FFAE11",
  relaciones: "#FF5C5C",
  aficiones: "#A484FF",
  logros: "#A1F08D",
};

// ── Calendario ───────────────────────────────────────────────────────────────
// El calendario impreso, en sus tres plazos. Igual que en Datos, cambiar de
// vista no es un paso del recorrido, así que es estado de la propia pantalla.
const POSTERES = [
  { id: "diario", es: "Diario", en: "Daily", img: "diario" },
  { id: "mensual", es: "Mensual", en: "Monthly", img: "mensual" },
  { id: "anual", es: "Anual", en: "Yearly", img: "anual" },
];

function Calendario({ t, ir }: { t: T; ir: (id: string) => void }) {
  const [cual, setCual] = useState("diario");
  const puesto = POSTERES.find((p) => p.id === cual) ?? POSTERES[0];
  return (
    <>
      <div className="ev-app-pestanas">
        {POSTERES.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`ev-app-pestana${p.id === cual ? " es-puesta" : ""}`}
            onClick={() => setCual(p.id)}
            aria-pressed={p.id === cual}
          >
            {t(p.es, p.en)}
          </button>
        ))}
      </div>

      {/* El póster, en su marco. Lo que se enseña aquí es la pieza impresa, así
          que ocupa casi toda la pantalla. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="ev-app-poster"
        src={`/proyectos/app-espacio-vacio/posters/${puesto.img}.webp`}
        alt={t(`Calendario ${puesto.es.toLowerCase()}`, `${puesto.en} calendar`)}
      />

      <Boton clase="es-centrado es-encargar" onClick={() => ir("encargo")}>
        {t("Encargar", "Order")}
      </Boton>
    </>
  );
}

// ── Momentos ─────────────────────────────────────────────────────────────────
// Las cuatro cosas que se anotan a mano, con el color que les da la marca.
const CATEGORIAS = [
  { id: "relaciones", color: COLORES.relaciones, es: "Relaciones personales", en: "Personal relationships" },
  { id: "aficiones", color: COLORES.aficiones, es: "Aficiones", en: "Hobbies" },
  { id: "habitos", color: COLORES.habitos, es: "Hábitos saludables", en: "Healthy habits" },
  { id: "logros", color: COLORES.logros, es: "Logros", en: "Achievements" },
];

// La galería: lo guardado, mes a mes. Cada anotación lleva el color de su
// categoría, el día y la foto. `col` es la columna en la que cae, que es lo que
// da a la página ese aire de collage en vez de rejilla cerrada.
type Anotacion = {
  dia: number;
  color: string;
  img: number;
  col: number;
  ancho: number;
  alto: number;
  // La única que se puede abrir, de momento: es el ejemplo de cómo se ve una
  // anotación guardada. Las demás se quedan en la miniatura porque no hay foto
  // grande ni texto para ellas, y fingirlo sería inventarse el contenido.
  detalle?: { foto: string; fecha: string; que: string; queEn: string; rato: string; ratoEn: string };
};

const GALERIA: { mes: string; mesEn: string; dias: Anotacion[] }[] = [
  {
    mes: "Enero",
    mesEn: "January",
    dias: [
      { dia: 2, color: COLORES.aficiones, img: 1, col: 1, ancho: 22, alto: 0.75 },
      { dia: 8, color: COLORES.logros, img: 2, col: 2, ancho: 15, alto: 1.5 },
      { dia: 10, color: COLORES.relaciones, img: 3, col: 3, ancho: 21, alto: 1.1 },
      { dia: 13, color: COLORES.aficiones, img: 4, col: 2, ancho: 16, alto: 1.6 },
      { dia: 18, color: COLORES.habitos, img: 5, col: 3, ancho: 17, alto: 0.72 },
      { dia: 19, color: COLORES.logros, img: 6, col: 1, ancho: 18, alto: 1.5 },
      { dia: 23, color: COLORES.aficiones, img: 7, col: 2, ancho: 20, alto: 0.78 },
      { dia: 31, color: COLORES.relaciones, img: 8, col: 3, ancho: 18, alto: 1.5 },
    ],
  },
  {
    mes: "Febrero",
    mesEn: "February",
    dias: [
      { dia: 4, color: COLORES.logros, img: 9, col: 1, ancho: 19, alto: 1.4 },
      {
        dia: 6,
        color: COLORES.relaciones,
        img: 10,
        col: 2,
        ancho: 18,
        alto: 1.35,
        detalle: {
          foto: "/proyectos/app-espacio-vacio/momentos/carnet-conducir.webp",
          fecha: "6 / 02 / 2024",
          que: "Carnet de conducir",
          queEn: "Driving licence",
          rato: "30 horas",
          ratoEn: "30 hours",
        },
      },
      { dia: 9, color: COLORES.aficiones, img: 11, col: 3, ancho: 19, alto: 1.4 },
      { dia: 11, color: COLORES.logros, img: 12, col: 2, ancho: 18, alto: 1.4 },
      { dia: 12, color: COLORES.aficiones, img: 13, col: 3, ancho: 18, alto: 1.35 },
    ],
  },
];

// El botón de añadir de cada categoría: el aspa dentro de su color.
function Mas({ color }: { color: string }) {
  return (
    <span className="ev-app-mas" style={{ background: color }} aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <path d="M12 5v14M5 12h14" fill="none" stroke="#252221" strokeWidth="2" />
      </svg>
    </span>
  );
}

// ── Datos ────────────────────────────────────────────────────────────────────
// Las tres vistas del consumo: el día, el mes y el año. Cambian sin salir de la
// pantalla, así que la vista es estado suyo y no un paso del recorrido.
//
// El gráfico va en SVG y sale de una tabla: la caja es el tiempo en redes y
// cada burbuja una de las cosas que sí llenan. Todas cuelgan de la misma línea
// de suelo con un tallo, que es lo que las pone a comparar.
//

type Burbuja = { cx: number; cy: number; r: number; color: string; texto: string };
type Vista = {
  id: "diario" | "mensual" | "anual";
  es: string;
  en: string;
  rotulo: string;
  rotuloEn: string;
  recuento: string;
  recuentoEn: string;
  // La caja del tiempo en redes: sitio, tamaño y cuántas horas. `tx`/`ty`
  // mueven la cifra cuando el centro de la caja lo ocupa una burbuja, que es lo
  // que pasa en la vista del año.
  caja: { x: number; y: number; w: number; h: number; texto: string; tx?: number; ty?: number };
  burbujas: Burbuja[];
  cuentas: { color: string; n: string; es: string; en: string }[];
  vacios: { n: string; es: string; en: string };
};

const VISTAS: Vista[] = [
  {
    id: "diario",
    es: "Diario",
    en: "Daily",
    rotulo: "D.31",
    rotuloEn: "D.31",
    recuento: "Recuento del día:",
    recuentoEn: "The day in numbers:",
    caja: { x: 33, y: 12, w: 47, h: 47, texto: "4h" },
    burbujas: [{ cx: 33, cy: 70, r: 12, color: COLORES.habitos, texto: "2h" }],
    cuentas: [
      { color: COLORES.habitos, n: "1", es: "Hábito saludable", en: "Healthy habit" },
      { color: COLORES.relaciones, n: "0", es: "Relaciones personales", en: "Personal relationships" },
      { color: COLORES.aficiones, n: "0", es: "Aficiones", en: "Hobbies" },
      { color: COLORES.logros, n: "0", es: "Logros", en: "Achievements" },
    ],
    vacios: { n: "3", es: "Espacios vacíos = 1/6 de tu día", en: "Empty slots = 1/6 of your day" },
  },
  {
    id: "mensual",
    es: "Mensual",
    en: "Monthly",
    rotulo: "Diciembre",
    rotuloEn: "December",
    recuento: "Recuento del mes:",
    recuentoEn: "The month in numbers:",
    caja: { x: 14, y: 6, w: 69, h: 64, texto: "150h", tx: 44, ty: 36 },
    burbujas: [
      { cx: 20, cy: 62, r: 11, color: COLORES.habitos, texto: "9h" },
      { cx: 41, cy: 16, r: 5.5, color: COLORES.logros, texto: "3h" },
      { cx: 62, cy: 50, r: 12.5, color: COLORES.relaciones, texto: "15h" },
      { cx: 83, cy: 24, r: 11.5, color: COLORES.aficiones, texto: "10h" },
    ],
    cuentas: [
      { color: COLORES.habitos, n: "6", es: "Hábitos saludables", en: "Healthy habits" },
      { color: COLORES.relaciones, n: "5", es: "Relaciones personales", en: "Personal relationships" },
      { color: COLORES.aficiones, n: "2", es: "Aficiones", en: "Hobbies" },
      { color: COLORES.logros, n: "1", es: "Logros", en: "Achievements" },
    ],
    vacios: { n: "112", es: "Espacios vacíos = 4 días de tu vida", en: "Empty slots = 4 days of your life" },
  },
  {
    id: "anual",
    es: "Anual",
    en: "Yearly",
    rotulo: "2023",
    rotuloEn: "2023",
    recuento: "Recuento del año:",
    recuentoEn: "The year in numbers:",
    caja: { x: 8, y: 5, w: 84, h: 69, texto: "1350h", tx: 44, ty: 29 },
    burbujas: [
      { cx: 22, cy: 33, r: 14, color: COLORES.habitos, texto: "120h" },
      { cx: 40, cy: 56, r: 9, color: COLORES.logros, texto: "45h" },
      { cx: 62, cy: 50, r: 15.5, color: COLORES.relaciones, texto: "150h" },
      { cx: 84, cy: 20, r: 13, color: COLORES.aficiones, texto: "100h" },
    ],
    cuentas: [
      { color: COLORES.habitos, n: "6", es: "Hábitos saludables", en: "Healthy habits" },
      { color: COLORES.relaciones, n: "30", es: "Relaciones personales", en: "Personal relationships" },
      { color: COLORES.aficiones, n: "4", es: "Aficiones", en: "Hobbies" },
      { color: COLORES.logros, n: "3", es: "Logros", en: "Achievements" },
    ],
    vacios: { n: "1.008", es: "Espacios vacíos = 56 días de tu vida", en: "Empty slots = 56 days of your life" },
  },
];

// La línea de suelo de la que cuelga todo.
const SUELO = 94;

function Grafico({ vista }: { vista: Vista }) {
  const { caja, burbujas } = vista;
  return (
    <svg className="ev-app-grafico" viewBox="0 0 100 104" aria-hidden="true">
      {/* El tallo de cada pieza sale de su centro y baja hasta el suelo. */}
      <line x1={caja.x + caja.w / 2} y1={caja.y + caja.h} x2={caja.x + caja.w / 2} y2={SUELO} />
      {burbujas.map((b) => (
        <line key={`t${b.cx}`} x1={b.cx} y1={b.cy + b.r} x2={b.cx} y2={SUELO} />
      ))}

      <rect x={caja.x} y={caja.y} width={caja.w} height={caja.h} className="ev-app-caja" />
      <text
        x={caja.tx ?? caja.x + caja.w / 2}
        y={caja.ty ?? caja.y + caja.h / 2}
        className="ev-app-cifra"
      >
        {caja.texto}
      </text>

      {burbujas.map((b) => (
        <g key={`b${b.cx}`}>
          <circle cx={b.cx} cy={b.cy} r={b.r} fill={b.color} />
          <text x={b.cx} y={b.cy} className="ev-app-cifra">
            {b.texto}
          </text>
        </g>
      ))}

      <line x1="0" y1={SUELO} x2="100" y2={SUELO} className="ev-app-suelo" />
    </svg>
  );
}

function Datos({ t }: { t: T }) {
  const [cual, setCual] = useState<Vista["id"]>("diario");
  const vista = VISTAS.find((v) => v.id === cual) ?? VISTAS[0];
  return (
    <>
      <div className="ev-app-pestanas">
        {VISTAS.map((v) => (
          <button
            key={v.id}
            type="button"
            className={`ev-app-pestana${v.id === cual ? " es-puesta" : ""}`}
            onClick={() => setCual(v.id)}
            aria-pressed={v.id === cual}
          >
            {t(v.es, v.en)}
          </button>
        ))}
      </div>

      <Grafico vista={vista} />
      <p className="ev-app-periodo">{t(vista.rotulo, vista.rotuloEn)}</p>

      <h3 className="ev-app-titulo es-suelto es-recuento">
        {t(vista.recuento, vista.recuentoEn)}
      </h3>
      <ul className="ev-app-cuentas">
        {vista.cuentas.map((c) => (
          <li key={c.es}>
            <span className="ev-app-cuenta-n" style={{ background: c.color }}>
              {c.n}
            </span>
            {t(c.es, c.en)}
          </li>
        ))}
        <li>
          <span className="ev-app-cuenta-n es-caja">{vista.vacios.n}</span>
          {t(vista.vacios.es, vista.vacios.en)}
        </li>
      </ul>
    </>
  );
}

// Una banda del menú de la home. Cuando lleva a algún sitio es un botón; cuando
// todavía no —el apartado está por hacer—, es solo su rótulo, para no prometer
// una pulsación que no hace nada.
function Banda({
  texto,
  alto,
  va,
  ir,
}: {
  texto: string;
  alto?: number;
  va?: string;
  ir: (id: string) => void;
}) {
  const estilo = alto ? { flexGrow: alto } : undefined;
  if (!va) {
    return (
      <div className="ev-app-banda" style={estilo}>
        {texto}
      </div>
    );
  }
  return (
    <button type="button" className="ev-app-banda" style={estilo} onClick={() => ir(va)}>
      {texto}
    </button>
  );
}

type Pantalla = {
  id: string;
  es: string;
  en: string;
  // Se puede volver desde ella.
  atras?: boolean;
  // La flecha vuelve a una pantalla CONCRETA y no al paso anterior. Lo lleva el
  // perfil: se llega a él desde la home, pero también desde sus propios
  // apartados, y deshacer el último paso te devolvería a «Mis datos» en vez de
  // salir del perfil, que es lo que espera quien pulsa.
  atrasVa?: string;
  // Y antes de volver, la pantalla tiene su oportunidad: si devuelve cierto, se
  // ha ocupado ella —cerrando un panel, por ejemplo— y no se sale.
  alVolver?: (c: Ctx) => boolean;
  // Una capa por encima de todo: popups y cosas que no se desplazan con el
  // contenido.
  encima?: (c: Ctx) => React.ReactNode;
  // Y se vuelve con la flecha de la cabecera en vez de con el botón de abajo.
  // Lo llevan las pantallas cuyo pie ya tiene su propio botón —los formularios
  // y la última—, donde un «Atrás» abajo serían dos botones amontonados.
  flecha?: boolean;
  // El cuerpo, centrado en el alto de la pantalla en vez de colgado de arriba.
  centrado?: boolean;
  // La pantalla se pinta entera ella misma: sin los márgenes del cuerpo, para
  // que lo suyo llegue hasta los cantos.
  plena?: boolean;
  // Y sin la cabecera común. Lo lleva la home, cuyo logotipo va dentro de su
  // propia banda; las demás pantallas plenas sí la quieren.
  sinCabecera?: boolean;
  // A qué altura empieza el cuerpo, en cqw. Sin él, el sitio de siempre; se
  // baja solo donde el texto es tan largo que no cabe desde ahí.
  arranque?: number;
  cuerpo: (c: Ctx) => React.ReactNode;
};

const PANTALLAS: Pantalla[] = [
  {
    id: "carga",
    es: "Carga",
    en: "Splash",
    // Solo el logotipo y la animación; pasa sola.
    cuerpo: () => null,
  },
  {
    id: "bienvenida",
    es: "Bienvenida",
    en: "Welcome",
    cuerpo: (c) => (
      <>
        <h3 className="ev-app-titulo">
          {c.t("Bienvenido a Espacio Vacío", "Welcome to Empty Space")}
        </h3>
        <p className="ev-app-texto">
          {c.t("¿Eres nuevo usuario, o ya tienes cuenta?", "Are you new here, or do you already have an account?")}
        </p>
        <div className="ev-app-fila">
          <Boton onClick={() => c.ir("crear")}>{c.t("Soy nuevo", "I'm new")}</Boton>
          <Boton onClick={() => c.ir("entrar")}>{c.t("Tengo cuenta", "I have an account")}</Boton>
        </div>
      </>
    ),
  },
  {
    id: "crear",
    es: "Crear cuenta",
    en: "Sign up",
    atras: true,
    flecha: true,
    cuerpo: (c) => (
      <>
        <h3 className="ev-app-titulo es-suelto es-medium">
          {c.t("Crear cuenta", "Create account")}
        </h3>
        {/* Los datos son los de la pantalla de perfil del proyecto: la misma
            usuaria de ejemplo aquí que allí. La contraseña se teclea a la vista
            —sin puntos— porque así está en el diseño original. */}
        <CamposAuto
          campos={[
            { etiqueta: c.t("Nombre", "First name"), valor: "Clara" },
            { etiqueta: c.t("Apellidos", "Surname"), valor: "Gutiérrez García" },
            { etiqueta: c.t("Correo electrónico", "Email"), valor: "cgutierrez@gmail.com" },
            {
              etiqueta: c.t("Fecha de nacimiento", "Date of birth"),
              valor: c.t("16 de Marzo de 2003", "16 March 2003"),
            },
            { etiqueta: c.t("Contraseña", "Password"), valor: "Polloconarroz", clave: true },
            {
              etiqueta: c.t("Confirmar contraseña", "Confirm password"),
              valor: "Polloconarroz",
              clave: true,
            },
          ]}
        />
        <Boton clase="es-suelto" onClick={() => c.ir("foto")}>
          {c.t("Crear cuenta", "Create account")}
        </Boton>
      </>
    ),
  },
  {
    id: "entrar",
    es: "Entrar",
    en: "Log in",
    atras: true,
    flecha: true,
    cuerpo: (c) => (
      <>
        <h3 className="ev-app-titulo es-suelto">{c.t("Entrar", "Log in")}</h3>
        <div className="ev-app-campos">
          <Campo texto={c.t("Correo electrónico", "Email")} />
          <Campo texto={c.t("Contraseña", "Password")} />
        </div>
        {/* Quien ya tiene cuenta entra directo a la home: las instrucciones y
            la foto son del alta, y repetírselas cada vez que entra sería
            hacerle pasar otra vez por lo que ya hizo. */}
        <Boton clase="es-suelto" onClick={() => c.ir("home")}>
          {c.t("Entrar", "Log in")}
        </Boton>
      </>
    ),
  },
  {
    id: "quienes",
    es: "¿Quiénes somos?",
    en: "Who we are",
    atras: true,
    cuerpo: (c) => (
      <>
        <h3 className="ev-app-titulo es-suelto">{c.t("¿Quiénes somos?", "Who we are")}</h3>
        <p className="ev-app-texto">
          {c.t(
            "En un mundo cada vez más conectado, pasamos horas consumiendo contenido sin sentido y perdiendo la oportunidad de vivir momentos significativos y reales.",
            "In an ever more connected world, we spend hours consuming meaningless content and missing the chance to live real, meaningful moments."
          )}
        </p>
        <p className="ev-app-texto">
          {c.t(
            "Nuestra misión es reconectar con lo que realmente importa. Redescubre la satisfacción de invertir tiempo en experiencias valiosas.",
            "Our mission is to reconnect with what really matters. Rediscover how good it feels to put your time into things worth doing."
          )}
        </p>
        <Boton clase="es-pie" onClick={() => c.ir("comofunciona")}>
          {c.t("Siguiente", "Next")}
        </Boton>
      </>
    ),
  },
  {
    id: "comofunciona",
    es: "¿Cómo funciona?",
    en: "How it works",
    atras: true,
    cuerpo: (c) => (
      <>
        <h3 className="ev-app-titulo es-suelto">{c.t("¿Cómo funciona?", "How it works")}</h3>
        <p className="ev-app-texto">
          {c.t(
            "Sube una foto de tu cara a la aplicación y vincula el tiempo que usas en redes sociales. Esto quedará registrado en un calendario diario.",
            "Upload a photo of your face and link it to the time you spend on social media. It all gets logged in a daily calendar."
          )}
        </p>
        {/* La ecuación de la que va todo: el tiempo se convierte en trozos de
            tu cara que se van. */}
        <p className="ev-app-ecuacion">
          <span>{c.t("Tiempo en redes sociales", "Time on social media")}</span>
          <span>=</span>
          <span>{c.t("Casillas que desaparecerán de tu foto", "Slots that will vanish from your photo")}</span>
        </p>
        <Boton clase="es-pie" onClick={() => c.ir("pregunta")}>
          {c.t("Siguiente", "Next")}
        </Boton>
      </>
    ),
  },
  {
    id: "pregunta",
    es: "La pregunta",
    en: "The question",
    atras: true,
    cuerpo: (c) => (
      <>
        <h3 className="ev-app-titulo es-suelto">
          {c.t("Una pregunta importante", "One important question")}
        </h3>
        <p className="ev-app-texto">
          {c.t(
            "¿Cuánto es el tiempo idóneo que te gustaría invertir en redes sociales cada día?",
            "How much time would you ideally like to spend on social media each day?"
          )}
        </p>
        {/* Se elige de verdad, y lo elegido viaja a la pantalla siguiente: en
            el prototipo esto era un número escrito a mano. */}
        <div className="ev-app-horas">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((h) => (
            <button
              key={h}
              type="button"
              className={`ev-app-hora${h === c.horas ? " es-elegida" : ""}`}
              onClick={() => c.setHoras(h)}
              aria-pressed={h === c.horas}
            >
              {h}
            </button>
          ))}
        </div>
        <Boton clase="es-pie" onClick={() => c.ir("casillas")}>
          {c.t("Siguiente", "Next")}
        </Boton>
      </>
    ),
  },
  {
    id: "casillas",
    es: "Las casillas",
    en: "The slots",
    atras: true,
    cuerpo: (c) => (
      <>
        <p className="ev-app-texto es-arriba">
          {c.t("Has elegido como tiempo idóneo diario ", "You've set ")}
          <b>{c.horas}h</b>
          {c.t(
            ". Cada día se dividirá en 6 casillas, las cuales estarán divididas en ",
            " a day as your ideal. Each day is split into 6 slots of "
          )}
          <b>{c.t("45 min", "45 min")}</b>
          {c.t(
            " de consumo. Cada 45 min que pases consumiendo redes, desaparecerá una casilla, si excedes el máximo, esa porción de tu foto desaparecerá.",
            " each. Every 45 minutes you spend on social media, one slot goes; go over the limit and that part of your photo disappears."
          )}
        </p>
        <div className="ev-app-rejilla">
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i}>{c.t("45 min / día", "45 min / day")}</span>
          ))}
        </div>
        <Boton clase="es-pie" onClick={() => c.ir("diario")}>
          {c.t("Siguiente", "Next")}
        </Boton>
      </>
    ),
  },
  {
    id: "diario",
    es: "Tu diario",
    en: "Your diary",
    atras: true,
    cuerpo: (c) => (
      <>
        <h3 className="ev-app-titulo es-suelto">{c.t("Somos tu diario", "We're your diary")}</h3>
        <p className="ev-app-texto">
          {c.t(
            "Añade en este apartado cosas importantes para ti. Como creas momentos de calidad que fomentan tu crecimiento personal o tus conexiones con las personas y el mundo real.",
            "Add the things that matter to you here: the moments that feed your own growth or your ties to people and the real world."
          )}
        </p>
        <ul className="ev-app-asuntos">
          {ASUNTOS.map((a) => (
            <li key={a.es}>
              <span className="ev-app-punto" style={{ background: a.color }} aria-hidden="true" />
              {c.t(a.es, a.en)}
            </li>
          ))}
        </ul>
        <Boton clase="es-pie" onClick={() => c.ir("listo")}>
          {c.t("Siguiente", "Next")}
        </Boton>
      </>
    ),
  },
  {
    id: "listo",
    es: "¿Listo?",
    en: "Ready?",
    atras: true,
    flecha: true,
    centrado: true,
    cuerpo: (c) => (
      <>
        <h3 className="ev-app-titulo es-centrado">{c.t("¿Listo para empezar?", "Ready to start?")}</h3>
        <Boton clase="es-centrado" onClick={() => c.ir("home")}>
          {c.t("Vamos", "Let's go")}
        </Boton>
      </>
    ),
  },
  {
    id: "home",
    es: "Inicio",
    en: "Home",
    // Sin volver dentro de la pantalla: la home es el final del alta y en la
    // app no se vuelve de ella a ninguna parte. Para deshacer el recorrido
    // están los mandos de fuera del móvil.
    // La home se pinta ella sola de borde a borde y se queda sin cabecera: su
    // logotipo va dentro de su propia banda.
    plena: true,
    sinCabecera: true,
    cuerpo: (c) => (
      <div className="ev-app-home">
        <div className="ev-app-home-marca">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/proyectos/espacio-vacio/espacio-vacio-logo.svg" alt="Espacio vacío" />
        </div>
        {MENU.map((m) => (
          <Banda key={m.es} texto={c.t(m.es, m.en)} alto={m.alto} va={m.va} ir={c.ir} />
        ))}
        <div className="ev-app-home-pie">
          {MENU_PIE.map((m) => (
            <Banda key={m.es} texto={c.t(m.es, m.en)} va={m.va} ir={c.ir} />
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "guia",
    es: "Guía",
    en: "Guide",
    atras: true,
    flecha: true,
    centrado: true,
    cuerpo: (c) => (
      <div className="ev-app-menu">
        {/* Las instrucciones del alta, otra vez: van sueltas y arriba porque no
            son un apartado de la guía, sino el repaso entero. */}
        <Boton clase="es-menu" onClick={() => c.ir("quienes")}>
          {c.t("Instrucciones iniciales", "Getting started")}
        </Boton>
        <div className="ev-app-menu-grupo">
          <Boton clase="es-menu" onClick={() => c.ir("g-quienes")}>
            {c.t("¿Quiénes somos?", "Who we are")}
          </Boton>
          <Boton clase="es-menu" onClick={() => c.ir("g-funciona")}>
            {c.t("¿Cómo funciona?", "How it works")}
          </Boton>
          <Boton clase="es-menu" onClick={() => c.ir("g-calendario")}>
            {c.t("¿Qué es el calendario?", "What the calendar is")}
          </Boton>
          <Boton clase="es-menu" onClick={() => c.ir("g-redes")}>
            {c.t("¿Cómo conecto mi app?", "How to connect my app")}
          </Boton>
        </div>
      </div>
    ),
  },
  {
    id: "g-quienes",
    es: "Guía · ¿Quiénes somos?",
    en: "Guide · Who we are",
    atras: true,
    flecha: true,
    arranque: 66,
    cuerpo: (c) => (
      <>
        <h3 className="ev-app-titulo es-suelto">{c.t("¿Quiénes somos?", "Who we are")}</h3>
        <p className="ev-app-texto es-guia">
          {c.t(
            "En un mundo cada vez más conectado, pasamos horas consumiendo contenido sin sentido y perdiendo la oportunidad de vivir momentos significativos y reales.",
            "In an ever more connected world, we spend hours consuming meaningless content and missing the chance to live real, meaningful moments."
          )}
        </p>
        <p className="ev-app-texto es-guia">
          {c.t(
            "Nuestra misión es reconectar con lo que realmente importa. Redescubre la satisfacción de invertir tiempo en experiencias valiosas.",
            "Our mission is to reconnect with what really matters. Rediscover how good it feels to put your time into things worth doing."
          )}
        </p>
      </>
    ),
  },
  {
    id: "g-funciona",
    es: "Guía · ¿Cómo funciona?",
    en: "Guide · How it works",
    atras: true,
    flecha: true,
    // Este texto es largo de verdad: empieza más arriba y la pantalla se puede
    // desplazar, como haría la de una app.
    arranque: 44,
    cuerpo: (c) => (
      <>
        <h3 className="ev-app-titulo es-suelto">{c.t("¿Cómo funciona?", "How it works")}</h3>
        <p className="ev-app-texto es-guia">
          {c.t(
            "Tras crear una cuenta, deberás conectar tu app con el consumo de aplicaciones que calcula tu teléfono móvil, en ese preciso momento, empezará el juego.",
            "Once you have an account, you connect the app to the screen-time your phone already measures. That is when the game starts."
          )}
        </p>
        <p className="ev-app-texto es-guia">
          {c.t(
            "Deberás indicar el número de horas diarias de consumo de redes que consideres responsable, tras ello, nuestra app plasmará el número de horas que consumes en redes sociales. Cada día podrás ver cómo tu foto va desapareciendo a medida que consumes tu valioso tiempo consumiendo redes sociales.",
            "You set how many hours a day on social media you consider responsible, and the app then shows the hours you actually spend. Day by day you watch your photo disappear as you spend your valuable time on social media."
          )}
        </p>
        <p className="ev-app-texto es-guia">
          {c.t(
            "También tendrás la oportunidad de plasmar actividades útiles que realices en tu día a día, para que al final del día, el mes o el año, puedas comparar el tiempo que has consumido en redes sociales, y el tiempo útil que has empleado en hacer cosas que de verdad te llenan y te hacen crecer en la vida satisfactoriamente.",
            "You can also log the worthwhile things you do, so that at the end of the day, the month or the year you can set the time you spent on social media against the time you put into what really fills you and makes you grow."
          )}
        </p>
        <p className="ev-app-texto es-guia">
          {c.t(
            "Podrás encargar tu calendario cuando finalice el mes o el año, para poder tener un trocito de tu vida en la pared de tu habitación.",
            "And you can order your calendar when the month or the year is over, to keep a little piece of your life on your bedroom wall."
          )}
        </p>
      </>
    ),
  },
  {
    id: "g-calendario",
    es: "Guía · El calendario",
    en: "Guide · The calendar",
    atras: true,
    flecha: true,
    arranque: 66,
    cuerpo: (c) => (
      <>
        <h3 className="ev-app-titulo es-suelto">
          {c.t("¿Qué es el calendario?", "What the calendar is")}
        </h3>
        <p className="ev-app-texto es-guia">
          {c.t(
            "El calendario es, como su propio nombre indica, un calendario, pero no uno cualquiera. Será el elemento que refleje si de verdad cumples tus objetivos, y si de verdad pierdes tu tiempo consumiendo contenido vacío en redes sociales o si por el contrario, eres una persona responsable y pasas tiempo de calidad haciendo cosas útiles al margen de la pantalla y la falsa dimensión en la que nos sumergen las redes sociales.",
            "The calendar is exactly that, a calendar, but not any calendar. It is the piece that shows whether you really meet your goals: whether you are losing your time on empty content, or spending it on worthwhile things away from the screen and the false world social media pulls us into."
          )}
        </p>
        <p className="ev-app-texto es-guia">
          {c.t("¿Serás capaz de cumplir tus objetivos?", "Will you be able to meet your goals?")}
        </p>
      </>
    ),
  },
  {
    id: "g-redes",
    es: "Guía · Uso de redes",
    en: "Guide · Social media use",
    atras: true,
    flecha: true,
    arranque: 66,
    cuerpo: (c) => (
      <>
        <h3 className="ev-app-titulo es-suelto">{c.t("Uso de redes", "Social media use")}</h3>
        <p className="ev-app-texto es-guia">
          {c.t(
            "En este espacio podrás conocer el uso que haces en redes sociales al día, al mes y al año. Para comenzar a crear tu espacio de redes, debes conectar tu aplicación con el uso de aplicaciones calculado por tu teléfono móvil.",
            "Here you can see how much you use social media by day, by month and by year. To start building your own space, connect the app to the screen-time your phone already measures."
          )}
        </p>
        <h3 className="ev-app-titulo es-suelto es-segundo">
          {c.t("¿Cómo hacerlo?", "How to do it")}
        </h3>
        <p className="ev-app-texto es-guia">
          {c.t(
            "Para conectar la app con el uso de aplicaciones diario de tu móvil clicka sobre el siguiente botón.",
            "To connect the app to your phone's daily screen-time, tap the button below."
          )}
        </p>
        {/* Vincular no lleva a ninguna parte todavía: la pantalla de después no
            está diseñada, y mandar a otro sitio sería inventársela. */}
        <Boton clase="es-centrado es-vincular" onClick={() => c.ir("g-redes")}>
          {c.t("Vincular app", "Link app")}
        </Boton>
      </>
    ),
  },
  {
    id: "foto",
    es: "Tu fotografía",
    en: "Your photo",
    atras: true,
    flecha: true,
    arranque: 30,
    cuerpo: (c) => (
      <>
        <h3 className="ev-app-titulo es-suelto">{c.t("Añadir fotografía", "Add a photo")}</h3>
        <p className="ev-app-texto es-guia">
          {c.t(
            "Esta es la foto que irá desapareciendo con el tiempo que pases en redes. Encaja tu cara dentro de la guía.",
            "This is the photo that will disappear as you spend time on social media. Fit your face inside the guide."
          )}
        </p>
        <Hueco />
        <div className="ev-app-fila es-pegada">
          <Boton onClick={() => c.ir("quienes")}>{c.t("Tomar foto", "Take photo")}</Boton>
          <Boton onClick={() => c.ir("quienes")}>{c.t("Cargar foto", "Upload photo")}</Boton>
        </div>
      </>
    ),
  },
  {
    id: "perfil",
    es: "Perfil",
    en: "Profile",
    atras: true,
    flecha: true,
    atrasVa: "home",
    arranque: 30,
    cuerpo: (c) => (
      <>
        <Ficha />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="ev-app-retrato"
          src="/proyectos/app-espacio-vacio/persona.webp"
          alt={c.t("Fotografía de perfil de Clara", "Clara's profile photo")}
        />
        <div className="ev-app-fila es-pegada">
          <Boton onClick={() => c.ir("perfil-foto")}>{c.t("Cambiar foto", "Change photo")}</Boton>
          <Boton onClick={() => c.ir("perfil-datos")}>{c.t("Mis datos", "My details")}</Boton>
        </div>
      </>
    ),
  },
  {
    id: "perfil-foto",
    es: "Perfil · Cambiar foto",
    en: "Profile · Change photo",
    atras: true,
    flecha: true,
    arranque: 30,
    cuerpo: (c) => (
      <>
        <Ficha />
        <Hueco />
        <div className="ev-app-fila es-pegada">
          <Boton onClick={() => c.ir("perfil")}>{c.t("Tomar foto", "Take photo")}</Boton>
          <Boton onClick={() => c.ir("perfil")}>{c.t("Cargar foto", "Upload photo")}</Boton>
        </div>
      </>
    ),
  },
  {
    id: "perfil-datos",
    es: "Perfil · Mis datos",
    en: "Profile · My details",
    atras: true,
    flecha: true,
    arranque: 28,
    cuerpo: (c) => (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="ev-app-retrato es-sello"
          src="/proyectos/app-espacio-vacio/persona.webp"
          alt={c.t("Fotografía de perfil de Clara", "Clara's profile photo")}
        />
        <Dato etiqueta={c.t("Nombre", "First name")} valor="Clara" t={c.t} />
        <Dato etiqueta={c.t("Apellidos", "Surname")} valor="Gutiérrez García" t={c.t} />
        <Dato etiqueta={c.t("Email", "Email")} valor="cgutierrez@gmail.com" t={c.t} />
        {/* La fecha no tiene «cambiar»: se despliega, y por eso lleva galón en
            vez de botón. */}
        <Dato
          etiqueta={c.t("Fecha de nacimiento", "Date of birth")}
          valor={c.t("16 de Marzo de 2003", "16 March 2003")}
          despliega
          t={c.t}
        />
        <Dato etiqueta={c.t("Contraseña", "Password")} valor="Polloconarroz" t={c.t} />
        <Boton clase="es-guardar" onClick={() => c.ir("perfil")}>
          {c.t("Guardar cambios", "Save changes")}
        </Boton>
      </>
    ),
  },
  {
    id: "datos",
    es: "Datos",
    en: "Data",
    atras: true,
    flecha: true,
    atrasVa: "home",
    arranque: 30,
    cuerpo: (c) => <Datos t={c.t} />,
  },
  {
    id: "momentos",
    es: "Momentos",
    en: "Moments",
    atras: true,
    flecha: true,
    atrasVa: "home",
    plena: true,
    // Con el panel abierto, la flecha lo cierra en vez de salir de la pantalla:
    // es el gesto que espera quien acaba de abrirlo.
    alVolver: (c) => {
      if (!c.abierta) return false;
      c.setAbierta(null);
      return true;
    },
    cuerpo: (c) => {
      const cat = CATEGORIAS.find((x) => x.id === c.abierta);
      return (
        <div className="ev-app-momentos">
          <div className="ev-app-momentos-alto">
            <p className="ev-app-texto es-guia">
              {c.t(
                "Añade en este apartado cosas importantes para ti. Como creas momentos de calidad que fomentan tu crecimiento personal o tus conexiones con las personas y el mundo real.",
                "Add the things that matter to you here: the moments that feed your own growth or your ties to people and the real world."
              )}
            </p>
            <Boton
              clase="es-centrado"
              onClick={() => {
                c.setAbierta(null);
                c.ir("galeria");
              }}
            >
              {c.t("Mis momentos", "My moments")}
            </Boton>
          </div>

          {cat ? (
            // El panel de añadir, en el hueco de las cuatro categorías.
            <div className="ev-app-panel">
              <span className="ev-oculto">{c.t(cat.es, cat.en)}</span>
              {/* El hueco de la foto, teñido del color de la categoría: es lo
                  único que distingue una anotación de otra, así que manda. */}
              <div
                className="ev-app-hueco-foto"
                style={{
                  borderColor: cat.color,
                  background: `color-mix(in srgb, ${cat.color} 14%, #fff)`,
                }}
              >
                <Mas color={cat.color} />
              </div>
              <Desplegable texto="10 / 01 / 2024" />
              <Campo texto={c.t("Descripción", "Description")} />
              <Desplegable texto={c.t("1 hora", "1 hour")} />
              {/* Guardar cierra el panel y deja el cuadrante a la vista: lo
                  normal es anotar varias cosas seguidas, y mandar a la galería
                  obligaba a volver para la siguiente. */}
              <Boton clase="es-centrado" onClick={() => c.setAbierta(null)}>
                {c.t("Guardar", "Save")}
              </Boton>
            </div>
          ) : (
            // Las cuatro categorías, en cuadrante. Las divisiones llegan hasta
            // los cantos de la pantalla, como en el diseño.
            <div className="ev-app-cuadrante">
              {CATEGORIAS.map((x) => (
                <button
                  key={x.id}
                  type="button"
                  className="ev-app-casilla"
                  onClick={() => c.setAbierta(x.id)}
                >
                  <span>{c.t(x.es, x.en)}</span>
                  <Mas color={x.color} />
                </button>
              ))}
            </div>
          )}
        </div>
      );
    },
  },
  {
    id: "galeria",
    es: "Momentos · Mis momentos",
    en: "Moments · My moments",
    atras: true,
    flecha: true,
    atrasVa: "momentos",
    arranque: 26,
    // Con una anotación abierta, la flecha cierra el popup en vez de salir.
    alVolver: (c) => {
      if (!c.abierta) return false;
      c.setAbierta(null);
      return true;
    },
    cuerpo: (c) => (
      <>
        {GALERIA.map((mes) => (
            <section key={mes.mes} className="ev-app-mes">
              <h3 className="ev-app-titulo es-suelto">{c.t(mes.mes, mes.mesEn)}</h3>
              <div className="ev-app-collage">
                {mes.dias.map((d) => {
                  const pieza = (
                    <>
                      <figcaption>
                        <span className="ev-app-punto" style={{ background: d.color }} />
                        {d.dia}
                      </figcaption>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/proyectos/app-espacio-vacio/momentos/m${d.img}.webp`}
                        alt=""
                        style={{ width: `${d.ancho}cqw`, aspectRatio: `1 / ${d.alto}` }}
                      />
                    </>
                  );
                  // La que tiene detalle se puede abrir, y se le nota: lleva un
                  // foco que late para que se vea que ahí hay algo.
                  return d.detalle ? (
                    <button
                      key={d.dia}
                      type="button"
                      className="ev-app-momento es-abrible"
                      style={{ gridColumn: d.col }}
                      onClick={() => c.setAbierta(`dia-${d.dia}`)}
                    >
                      {pieza}
                    </button>
                  ) : (
                    <figure key={d.dia} className="ev-app-momento" style={{ gridColumn: d.col }}>
                      {pieza}
                    </figure>
                  );
                })}
              </div>
            </section>
          ))}

      </>
    ),
    // El popup va FUERA del cuerpo: el cuerpo se desplaza, y dentro de él la
    // capa quedaría anclada arriba del contenido en vez de sobre lo que se está
    // mirando.
    encima: (c) => {
      const abierta = GALERIA.flatMap((m) => m.dias).find(
        (d) => d.detalle && `dia-${d.dia}` === c.abierta
      );
      const d = abierta?.detalle;
      if (!d) return null;
      // La foto grande y, debajo, lo que se guardó con ella. El fondo
      // oscurecido cierra al pulsarlo, como cualquier popup.
      return (
        <div className="ev-app-popup" onClick={() => c.setAbierta(null)}>
          <div className="ev-app-popup-caja" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={d.foto} alt="" />
            <p className="ev-app-popup-fecha">{d.fecha}</p>
            <p>{c.t(d.que, d.queEn)}</p>
            <p>{c.t(d.rato, d.ratoEn)}</p>
          </div>
        </div>
      );
    },
  },

  {
    id: "calendario",
    es: "Calendario",
    en: "Calendar",
    atras: true,
    flecha: true,
    atrasVa: "home",
    arranque: 30,
    cuerpo: (c) => <Calendario t={c.t} ir={c.ir} />,
  },
  {
    id: "encargo",
    es: "Calendario · Encargo",
    en: "Calendar · Order",
    atras: true,
    flecha: true,
    atrasVa: "calendario",
    arranque: 30,
    // Con el pedido hecho, la flecha cierra el aviso en vez de salir.
    alVolver: (c) => {
      if (c.abierta !== "pedido") return false;
      c.setAbierta(null);
      return true;
    },
    cuerpo: (c) => (
      <>
        <p className="ev-app-texto es-guia">
          {c.t(
            "Ha finalizado el año y podrás tener tu calendario impreso. Para poder enviártelo necesitamos que rellenes los siguientes campos:",
            "The year is over and you can have your calendar printed. To send it to you, we need you to fill in these fields:"
          )}
        </p>
        <div className="ev-app-envio">
          <Dato etiqueta={c.t("Nombre", "First name")} valor="Clara" t={c.t} solo />
          <Dato etiqueta={c.t("Apellidos", "Surname")} valor="Gutiérrez García" t={c.t} solo />
          <Dato etiqueta={c.t("Dirección", "Address")} valor="C/Las Palmas n.23" t={c.t} solo />
          <Dato etiqueta={c.t("Teléfono", "Phone")} valor="+34 658 58 90 65" t={c.t} solo />
        </div>
        <Boton clase="es-encargar" onClick={() => c.setAbierta("pedido")}>
          {c.t("Encargar", "Order")}
        </Boton>
      </>
    ),
    encima: (c) => {
      if (c.abierta !== "pedido") return null;
      return (
        <div className="ev-app-popup">
          <div className="ev-app-popup-caja es-aviso">
            <h3 className="ev-app-titulo">
              {c.t("¡Pedido realizado con éxito!", "Order placed!")}
            </h3>
            <p className="ev-app-texto">
              {c.t(
                "Hemos recibido tu solicitud de pedido, recibirás un email de confirmación y un link de seguimiento de tu pedido una vez lo enviemos.",
                "We've received your order. You'll get a confirmation email and a tracking link as soon as we ship it."
              )}
            </p>
            <p className="ev-app-texto">
              {c.t("¡Gracias por utilizar Espacio Vacío!", "Thanks for using Empty Space!")}
            </p>
            <Boton
              clase="es-centrado"
              onClick={() => {
                c.setAbierta(null);
                c.ir("home");
              }}
            >
              {c.t("Continuar", "Continue")}
            </Boton>
          </div>
        </div>
      );
    },
  },
];

const PORID = new Map(PANTALLAS.map((p) => [p.id, p]));

export default function Prototipo() {
  const lang = useLang();
  const t = useCallback<T>((es, en) => (lang === "en" ? en : es), [lang]);

  // El camino recorrido y no la pantalla suelta: del alta se sale por dos
  // ramas —crear cuenta o entrar— y la flecha de volver tiene que deshacer la
  // que se tomó, así que hace falta la pila entera.
  const [camino, setCamino] = useState<string[]>(["carga"]);
  const [horas, setHoras] = useState(3);
  const [abierta, setAbierta] = useState<string | null>(null);
  // La carga tiene dos momentos: el isotipo quieto esperando, y la animación
  // corriendo desde que se pulsa comenzar hasta que entra la bienvenida.
  const [arrancando, setArrancando] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const actual = PORID.get(camino[camino.length - 1]) ?? PANTALLAS[0];

  const ir = useCallback((id: string) => {
    // Volver al principio es empezar de cero, no apilar otra vuelta.
    if (id === "carga") setArrancando(false);
    setCamino((antes) => (id === "carga" ? ["carga"] : [...antes, id]));
  }, []);

  // Comenzar: se pone en marcha la animación del isotipo y, al acabarla, entra
  // la bienvenida. La pantalla de carga de una app es exactamente eso —la marca
  // mientras arranca—, así que la animación ES la transición, no un adorno
  // delante de ella.
  const comenzar = useCallback(() => setArrancando(true), []);
  const atras = useCallback(() => {
    setCamino((antes) => (antes.length > 1 ? antes.slice(0, -1) : antes));
  }, []);

  // Volver a una pantalla concreta. Si ya se pasó por ella, se recorta el camino
  // hasta allí en vez de apilar otra visita: así el recorrido no crece cada vez
  // que se entra y se sale de un apartado.
  const volverA = useCallback((id: string) => {
    setCamino((antes) => {
      const i = antes.lastIndexOf(id);
      return i >= 0 ? antes.slice(0, i + 1) : [...antes, id];
    });
  }, []);

  useEffect(() => {
    if (!arrancando) return;
    // El vídeo se pone en marcha AQUÍ y no en el manejador del botón: cuando se
    // pulsa todavía no existe —lo monta este mismo cambio de estado—, así que
    // allí la referencia está vacía y la llamada se perdía. Por eso el vídeo se
    // quedaba quieto en el primer fotograma, que además es blanco.
    video.current?.play().catch(() => {});
    // Y red de seguridad: si no llega a reproducirse, o el aviso de que ha
    // terminado no llega, la bienvenida entra igual pasada su duración.
    const reloj = setTimeout(() => ir("bienvenida"), 4600);
    return () => clearTimeout(reloj);
  }, [arrancando, ir]);

  const ctx: Ctx = { ir, t, horas, setHoras, abierta, setAbierta };

  return (
    <section className="ev-proto">
      <div className="ev-proto-caja">
        {/* El móvil. El marco es CSS —no una imagen— para que se vea nítido a
            cualquier tamaño y para que pese cero. */}
        <div className="ev-movil">
          <div className="ev-pantalla">
            <div className="ev-movil-notch" aria-hidden="true" />
            {/* La clave fuerza a React a rehacer el cuerpo al cambiar de
                pantalla, que es lo que dispara la entrada. */}
            <div className="ev-app" key={actual.id}>
              {/* La carga va sin cabecera: ahí la marca ya la pone la
                  animación del isotipo, y el logotipo arriba la repetía. */}
              {actual.id !== "carga" && !actual.sinCabecera && (
                <Cabecera
                  atras={
                    actual.flecha
                      ? () => {
                          if (actual.alVolver?.(ctx)) return;
                          if (actual.atrasVa) volverA(actual.atrasVa);
                          else atras();
                        }
                      : undefined
                  }
                  t={t}
                />
              )}

              {/* La pantalla de carga: el isotipo quieto esperando y, al
                  comenzar, la animación en su sitio.
                  El vídeo viene con fondo casi blanco —#FDFDFD— sobre una
                  pantalla blanca: con `multiply` ese blanco desaparece y no se
                  ve el recuadro. */}
              {actual.id === "carga" &&
                (arrancando ? (
                  <video
                    ref={video}
                    className="ev-app-carga es-video"
                    src="/proyectos/app-espacio-vacio/isotipo.mp4"
                    muted
                    playsInline
                    preload="auto"
                    aria-hidden="true"
                    onEnded={() => ir("bienvenida")}
                  />
                ) : (
                  <svg className="ev-app-carga" viewBox="0 0 71.55 71" aria-hidden="true">
                    {CUARTOS.map((d, i) => (
                      <path key={i} d={d} fill="#252221" />
                    ))}
                  </svg>
                ))}

              <div
                className={`ev-app-cuerpo${actual.id === "casillas" ? " es-alto" : ""}${
                  actual.centrado ? " es-centro" : ""
                }${actual.plena ? " es-plena" : ""}`}
                style={
                  actual.arranque ? { paddingTop: `${actual.arranque}cqw` } : undefined
                }
              >
                {actual.cuerpo(ctx)}
                {/* Volver, abajo y a la izquierda: enfrente del de avanzar y en
                    el mismo sitio en todas las pantallas. */}
                {actual.atras && !actual.flecha && (
                  <Boton clase="es-pie es-izquierda" onClick={atras}>
                    {t("Atrás", "Back")}
                  </Boton>
                )}
              </div>

              {actual.encima?.(ctx)}
            </div>
          </div>
        </div>

        {/* Los mandos, FUERA del móvil: dentro serían un botón más y se
            confundirían con la interfaz que se está enseñando. */}
        <div className="ev-proto-mandos">
          <p className="ev-proto-donde">
            <span className="ev-proto-num">
              {String(PANTALLAS.indexOf(actual) + 1).padStart(2, "0")}
            </span>
            {t(actual.es, actual.en)}
          </p>

          <div className="ev-proto-botones">
            {/* La carga no pasa sola: arranca quien mira. El botón vive fuera
                del móvil, con los demás mandos, porque tampoco es un botón de
                la app: la pantalla de carga no tiene ninguno. */}
            {actual.id === "carga" && (
              <button
                type="button"
                className="es-principal"
                onClick={comenzar}
                disabled={arrancando}
              >
                {t(arrancando ? "Arrancando…" : "Comenzar", arrancando ? "Starting…" : "Start")}
              </button>
            )}
            {/* En la carga no se enseña: todavía no hay nada a lo que volver, y
                un botón apagado ahí solo es ruido. */}
            {actual.id !== "carga" && (
              <button type="button" onClick={atras} disabled={camino.length < 2}>
                {t("Atrás", "Back")}
              </button>
            )}
            <button type="button" onClick={() => ir("carga")}>
              {t("Reiniciar", "Restart")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
