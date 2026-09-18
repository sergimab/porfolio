"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLang } from "@/components/shared/useLang";
import { Cuadricula } from "./Isotipo";
import { raleway } from "./fuente";
import "./Prototipo.css";

// La app de la exposición, programada y navegable dentro de un móvil.
//
// LAS PANTALLAS ESTÁN ESCRITAS, no son capturas de Figma. Las capturas son la
// referencia —de ahí salen los textos, el orden y las medidas—, pero lo que se
// ve aquí es interfaz de verdad: el texto se puede seleccionar, lo lee un
// lector de pantalla, cambia de idioma con el resto del sitio, los botones son
// botones y todo se dibuja nítido a cualquier tamaño. Una captura pesa veinte
// veces más, se ve borrosa al ampliar y obliga a poner zonas invisibles encima
// para fingir que se puede pulsar.
//
// El armazón es el mismo que el de la app de Espacio vacío —marco de CSS,
// mandos fuera del aparato, medidas en `cqw`— porque es la misma clase de
// pieza. Lo que no se comparte es el interior: aquella app es blanca y de
// Clash Grotesk, y esta es negra y de Raleway.
//
// Las medidas van en `cqw`: uno por ciento del ANCHO DEL MÓVIL, que se declara
// contenedor de consulta. Así la pantalla escala como una sola pieza —tipos,
// márgenes y botones a la vez— en vez de descuadrarse al encoger el aparato.

// ─────────────────────────────────────────────────────────────────────────────
// LAS ANIMACIONES DEL TUTORIAL VAN AQUÍ.
//
// Cada paso del recorrido lleva una pieza en movimiento dentro de su marco. En
// cuanto el archivo esté en `public/proyectos/el-arte-del-miedo-app/`, basta
// con escribir su nombre en esta tabla y aparece: no hay que tocar nada más.
// Mientras el hueco esté vacío, el marco se pinta igual —con su degradado— y
// dentro se avisa de que falta la pieza.
//
// MP4 y no GIF: un GIF de pantalla completa pesa decenas de megas y se ve a
// saltos; el mismo movimiento en vídeo pesa unas centésimas y va fino. Si lo
// que hay es un GIF, se convierte antes de dejarlo en la carpeta.
const ANIMACIONES: Record<string, string> = {
  escanea: "escanea.mp4",
  descubre: "descubre.mp4",
  colecciona: "colecciona.mp4",
  analiza: "analiza.mp4",
  descarga: "descarga.mp4",
};

const RUTA = "/proyectos/el-arte-del-miedo-app";

type T = (es: string, en: string) => string;
type Ctx = {
  ir: (id: string) => void;
  t: T;
  /** Arranca la animación del logotipo, que es la que da paso a la bienvenida. */
  comenzar: () => void;
  arrancando: boolean;
};

// Los cinco pasos del tutorial, que son lo que la app sabe hacer. El texto es
// el de las pantallas originales.
const PASOS = [
  {
    id: "escanea",
    es: "Escanea",
    en: "Scan",
    textoEs: "Utiliza la función de escaneo para identificar cada obra, simplemente apunta la cámara de tu dispositivo hacia el cuadro.",
    textoEn: "Use the scan function to identify each work: just point your device's camera at the painting.",
  },
  {
    id: "descubre",
    es: "Descubre",
    en: "Discover",
    textoEs: "Descubre qué fobia hay representada en cada obra, así como una descripción detallada de la misma y cómo impacta en ella. Apunta con cuáles de estas fobias te sientes identificado.",
    textoEn: "Find out which phobia each work represents, with a detailed description and how it plays out in the painting. Note down which of these fears you recognise in yourself.",
  },
  {
    id: "colecciona",
    es: "Colecciona",
    en: "Collect",
    textoEs: "Colecciona y almacena todas y cada una de las fobias que se representan en la exposición.",
    textoEn: "Collect and keep every one of the phobias on show in the exhibition.",
  },
  {
    id: "analiza",
    es: "Analiza",
    en: "Analyse",
    textoEs: "Analiza qué fobias son más comunes entre los visitantes.",
    textoEn: "See which fears are the most common among visitors.",
  },
  {
    id: "descarga",
    es: "Descarga",
    en: "Download",
    textoEs: "Llévate un recuerdo de la exposición «El Arte del Miedo» y pon de fondo de pantalla aquella fobia que más te representa.",
    textoEn: "Take a souvenir of «The Art of Fear» home and set the fear that most represents you as your wallpaper.",
  },
];

// ── Piezas sueltas ───────────────────────────────────────────────────────────

// El isotipo, del mismo trazado que la página de marca: se dibuja, no se trae
// como imagen.
function Marca({ clase }: { clase?: string }) {
  return (
    <span className={`am-app-marca${clase ? ` ${clase}` : ""}`} aria-hidden="true">
      {/* Sin rótulo: aquí la marca es decoración —sale en casi todas las
          pantallas— y nombrarla cada vez sería ruido para un lector. Lo que
          hay que leer de cada pantalla es su título. */}
      <Cuadricula
        mapa={[". . . . X", "X . . X .", ". X X . .", "X . X . X", ". . . X .", ". . . . X"]}
      />
    </span>
  );
}

// El logotipo completo. ES EL ARCHIVO DE LA PÁGINA DE MARCA, el mismo que se
// enseña en branding: el logotipo tiene su propio dibujo —la retícula metida
// delante de MIEDO, los cuerpos distintos de EL y DEL, el interletrado— y
// componerlo a mano con la fuente da otra cosa parecida, que no es el logotipo.
// Viene negro sobre transparente porque así se usa sobre papel blanco; aquí se
// invierte a blanco desde el CSS, de modo que no hay dos archivos que mantener.
function Logotipo() {
  return (
    <p className="am-app-logotipo">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/proyectos/el-arte-del-miedo-branding/logotipo.webp" alt="El Arte del Miedo" />
    </p>
  );
}

// El botón de la app: contorno de un hilo con el degradado de la marca, como en
// el diseño. El degradado va en el borde y no en el fondo —de ahí las dos capas
// del CSS—, que es lo que le da ese aire de neón sobre negro.
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
    <button type="button" className={`am-app-boton${clase ? ` ${clase}` : ""}`} onClick={onClick}>
      <span>{children}</span>
    </button>
  );
}

// El marco donde va la pieza en movimiento de cada paso. El canto lleva el
// degradado rosa-azul, que es la constante de toda la identidad.
function Marco({ id, t }: { id: string; t: T }) {
  const animacion = ANIMACIONES[id];
  return (
    <div className="am-app-marco">
      {animacion ? (
        <video
          src={`${RUTA}/${animacion}`}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        />
      ) : (
        <span className="am-app-marco-falta">
          {t("Falta la animación", "Animation pending")}
        </span>
      )}
    </div>
  );
}

// La animación del logotipo, que es la carga de la app. Es el mismo archivo que
// abre la página de marca: allí presenta el proyecto y aquí arranca la app, que
// es exactamente el trabajo para el que se hizo.
//
// El vídeo se pone en marcha desde un efecto y no desde el manejador del botón:
// cuando se pulsa todavía no existe —lo monta ese mismo cambio de estado—, así
// que allí la referencia estaría vacía y la llamada se perdería.
function CargaAnimada({ ir }: { ir: (id: string) => void }) {
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    video.current?.play().catch(() => {});
    // Red de seguridad: si el navegador no lo reproduce, o el aviso de que ha
    // terminado no llega, la bienvenida entra igual pasada su duración.
    const reloj = setTimeout(() => ir("bienvenida"), 5200);
    return () => clearTimeout(reloj);
  }, [ir]);
  return (
    <video
      ref={video}
      className="am-app-carga"
      src={`${RUTA}/arranque.mp4`}
      muted
      playsInline
      preload="auto"
      aria-hidden="true"
      onEnded={() => ir("bienvenida")}
    />
  );
}

// ── Las pantallas ────────────────────────────────────────────────────────────

type Pantalla = {
  id: string;
  es: string;
  en: string;
  /** La pantalla se pinta entera ella misma, sin los márgenes del cuerpo. */
  plena?: boolean;
  /** Retoques propios de esa pantalla, cuando su reparto no es el de las demás. */
  clase?: string;
  cuerpo: (c: Ctx) => React.ReactNode;
};

// LOS ICONOS DE LA BARRA, dibujados uno a uno y no traídos de una librería:
// cada uno tiene su gesto en el diseño —la casa lleva puerta de arco, la
// galería un sol asomando, los datos van MACIZOS y no de contorno como los
// demás— y una librería da cuatro iconos coherentes entre sí pero distintos de
// estos.
//
// Todos se dibujan dentro del mismo cuadro de 24 y con el mismo grosor de
// trazo, que es lo que hace que pesen igual en la fila aunque uno sea una casa
// y otro tres barras.
const TRAZO = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const ICONOS: Record<string, React.ReactNode> = {
  casa: (
    <>
      <path d="M3.6 10.1 12 3.3l8.4 6.8v9.1a1.3 1.3 0 0 1-1.3 1.3H4.9a1.3 1.3 0 0 1-1.3-1.3z" {...TRAZO} />
      {/* La puerta, un arco y no un rectángulo: es lo que distingue a esta casa
          de la de cualquier librería de iconos. */}
      <path d="M9.4 20.5v-4.3a2.6 2.6 0 0 1 5.2 0v4.3" {...TRAZO} />
    </>
  ),
  galeria: (
    <>
      <rect x="3" y="4.7" width="18" height="14.6" rx="2.6" {...TRAZO} />
      <circle cx="16.1" cy="9.4" r="1.35" {...TRAZO} />
      <path d="M3.3 16.4 8.6 11l4.6 4.6 2.3-2.1 5.2 4.3" {...TRAZO} />
    </>
  ),
  datos: (
    // Macizas: en el diseño esta es la única de las cuatro que va rellena.
    <g fill="currentColor">
      <rect x="3.6" y="14.4" width="3.9" height="6.2" rx="1.2" />
      <rect x="10.05" y="10.4" width="3.9" height="10.2" rx="1.2" />
      <rect x="16.5" y="6.6" width="3.9" height="14" rx="1.2" />
    </g>
  ),
  descarga: (
    <>
      <path d="M12 3.3v11.2" {...TRAZO} />
      <path d="M7.4 10.2 12 14.8l4.6-4.6" {...TRAZO} />
      {/* La bandeja: abierta por arriba, que es donde entra la flecha. */}
      <path d="M4 15.6v3.4a1.6 1.6 0 0 0 1.6 1.6h12.8a1.6 1.6 0 0 0 1.6-1.6v-3.4" {...TRAZO} />
    </>
  ),
};

// Los cuatro destinos de la barra, en orden. `puesto` es dónde va cada uno a lo
// largo de la barra, medido en el diseño: no es un reparto automático, porque
// los dos huecos de en medio los ocupa la muesca del botón del escáner.
const BARRA: { id: string; es: string; en: string; puesto: number }[] = [
  { id: "casa", es: "Inicio", en: "Home", puesto: 13.5 },
  { id: "galeria", es: "Colección", en: "Collection", puesto: 31.2 },
  { id: "datos", es: "Datos", en: "Data", puesto: 68.8 },
  { id: "descarga", es: "Descargas", en: "Downloads", puesto: 86.5 },
];

function Icono({ id }: { id: string }) {
  return (
    <span className="am-app-icono">
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        {ICONOS[id]}
      </svg>
    </span>
  );
}

// LA BARRA, dibujada en SVG y no con `border-radius`.
//
// El motivo es la MUESCA: el canto de arriba no es recto, baja en una curva
// suave por el centro para hacerle sitio al botón del escáner, y eso una caja
// de CSS no lo sabe hacer —se podría fingir con un círculo negro encima, pero
// entonces el contorno blanco se cortaría en seco a los dos lados de la muesca
// en vez de seguir rodeándola, que es justo lo que se ve en el diseño—.
//
// El lienzo va en las medidas del diseño (596 × 116) y la caja de fuera tiene
// esa misma proporción, así que el dibujo escala entero sin deformarse y los
// números de aquí se pueden comparar con lo medido sin traducir nada.
function Barra() {
  const r = 56.75; // el radio de las puntas, ya descontado medio trazo

  // LA MUESCA ESTÁ CALCULADA, no dibujada a ojo. El botón es un círculo de 42,5
  // de radio con el centro 5 por encima del canto de la barra, y lo que se
  // pide de la muesca es que pase SIEMPRE a la misma distancia de él: si se
  // abre poco, el contorno roza el botón por los flancos —que es donde más se
  // cierra la curva— aunque por abajo parezca que sobra sitio.
  //
  // Con estos números la separación es de 11 px por los lados y 15 por abajo,
  // medida punto a punto sobre la curva. La anterior dejaba 2,3: de ahí que el
  // botón se viera pegado a la línea.
  //
  // Los dos números que mandan son el ANCHO —90 a cada lado del centro— y el
  // FONDO —54—; los de control valen el 42 % del ancho, que es lo que le da a
  // la curva el hombro suave en vez de una uve.
  const cx = 298;
  const w = 90;
  const d = 54;
  const k = 38;

  return (
    <svg
      className="am-app-barra-forma"
      viewBox="0 0 596 116"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/* El relleno no es plano: en el diseño va de un gris muy oscuro arriba
            a uno bastante más claro abajo, que es lo que le da el bulto. */}
        <linearGradient id="am-barra-relleno" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1f1f1f" />
          <stop offset="0.55" stopColor="#2c2c2c" />
          <stop offset="1" stopColor="#444444" />
        </linearGradient>
      </defs>
      <path
        d={
          `M 58 1.25 L ${cx - w} 1.25` +
          ` C ${cx - w + k} 1.25 ${cx - k} ${d} ${cx} ${d}` +
          ` C ${cx + k} ${d} ${cx + w - k} 1.25 ${cx + w} 1.25` +
          ` L 538 1.25 A ${r} ${r} 0 0 1 538 114.75` +
          ` L 58 114.75 A ${r} ${r} 0 0 1 58 1.25 Z`
        }
        fill="url(#am-barra-relleno)"
        stroke="#fff"
        strokeWidth="2.5"
      />
    </svg>
  );
}

const PANTALLAS: Pantalla[] = [
  {
    id: "carga",
    es: "Arranque",
    en: "Splash",
    plena: true,
    // El isotipo encendido, esperando. Al comenzar, en su sitio corre la
    // animación del logotipo construyéndose, que es la carga de verdad de la
    // app: la marca mientras arranca. O sea que la animación ES la transición
    // a la bienvenida, no un adorno delante de ella.
    cuerpo: (c) => (
      <>
        {c.arrancando ? <CargaAnimada ir={c.ir} /> : <Marca clase="es-carga" />}
        {/* El mismo botón que hay en los mandos, repetido DENTRO de la
            pantalla. Solo se ve en estrecho: allí los mandos quedan debajo del
            aparato y a menudo fuera de la vista, y sin esto no se encuentra por
            dónde arrancar. En ancho manda el de fuera. */}
        {!c.arrancando && (
          <div className="am-app-arranque">
            <Boton onClick={c.comenzar}>{c.t("Comenzar", "Start")}</Boton>
          </div>
        )}
      </>
    ),
  },
  {
    id: "bienvenida",
    es: "Bienvenida",
    en: "Welcome",
    clase: "es-bienvenida",
    cuerpo: (c) => (
      <>
        <Logotipo />
        <h3 className="am-app-titulo es-lema">
          {c.t("Un viaje a través del arte y la mente", "A journey through art and the mind")}
        </h3>
        {/* La rayita del degradado bajo el titular: es la misma marca reducida
            a un trazo, y aparece en toda la app haciendo de separador. */}
        <span className="am-app-raya" aria-hidden="true" />
        <p className="am-app-texto">
          {c.t(
            "Bienvenido a una experiencia única en el cruce entre el arte y la psicología.",
            "Welcome to a one-off experience where art meets psychology."
          )}
        </p>
        <p className="am-app-texto">
          {c.t(
            "Esta app será tu guía interactiva en la exposición temporal «El Arte del Miedo», alojada en el museo del Prado de Madrid.",
            "This app is your interactive guide to the temporary exhibition «The Art of Fear», at the Museo del Prado in Madrid."
          )}
        </p>
        <Boton clase="es-pie" onClick={() => c.ir("escanea")}>
          {c.t("Siguiente", "Next")}
        </Boton>
      </>
    ),
  },

  // Los cinco pasos comparten la misma plantilla: marca arriba, título, la
  // pieza en movimiento, el texto y el botón. Escribirlos uno a uno habría
  // sido copiar cinco veces la misma pantalla.
  ...PASOS.map((paso, i) => ({
    id: paso.id,
    es: paso.es,
    en: paso.en,
    cuerpo: (c: Ctx) => (
      <>
        <Marca clase="es-cabecera" />
        <h3 className="am-app-titulo">{c.t(paso.es, paso.en)}</h3>
        <Marco id={paso.id} t={c.t} />
        <p className="am-app-texto es-paso">{c.t(paso.textoEs, paso.textoEn)}</p>
        <Boton
          clase="es-pie"
          onClick={() => c.ir(i + 1 < PASOS.length ? PASOS[i + 1].id : "listo")}
        >
          {c.t("Siguiente", "Next")}
        </Boton>
      </>
    ),
  })),

  {
    id: "listo",
    es: "¿Todo listo?",
    en: "All set?",
    cuerpo: (c) => (
      <>
        <Marca clase="es-cabecera" />
        <div className="am-app-listo">
          <h3 className="am-app-titulo">{c.t("¿Todo listo?", "All set?")}</h3>
          <Boton onClick={() => c.ir("home")}>{c.t("Empecemos", "Let's go")}</Boton>
        </div>
      </>
    ),
  },

  {
    id: "home",
    es: "Menú principal",
    en: "Main menu",
    plena: true,
    cuerpo: (c) => (
      <>
        {/* La marca, sola en el centro de la pantalla: la home de esta app no
            enseña contenido, solo abre. El contenido está detrás de los
            botones de la barra. */}
        <div className="am-app-home">
          <Logotipo />
        </div>

        {/* La barra, con el botón del escáner posado en su muesca. El dibujo va
            aparte —en SVG— y los botones encima, cada uno en el punto que
            ocupa en el diseño. */}
        <nav className="am-app-barra" aria-label={c.t("Menú principal", "Main menu")}>
          <Barra />
          {BARRA.map((b, i) => (
            <button
              key={b.id}
              type="button"
              style={{ left: `${b.puesto}%` }}
              /* El primero va encendido: es donde se está. Los otros tres, en
                 gris, que es como los tiene el diseño. */
              data-puesto={i === 0}
            >
              <Icono id={b.id} />
              <span className="am-oculto">{c.t(b.es, b.en)}</span>
            </button>
          ))}

          <button type="button" className="am-app-barra-centro">
            <Marca clase="es-boton" />
            <span className="am-oculto">{c.t("Escanear una obra", "Scan a work")}</span>
          </button>
        </nav>
      </>
    ),
  },
];

const PORID = new Map(PANTALLAS.map((p) => [p.id, p]));

export default function Prototipo() {
  const lang = useLang();
  const t = useCallback<T>((es, en) => (lang === "en" ? en : es), [lang]);

  // El camino recorrido y no la pantalla suelta: hace falta la pila entera para
  // que «Atrás» deshaga los pasos en el orden en que se dieron.
  const [camino, setCamino] = useState<string[]>(["carga"]);
  const [arrancando, setArrancando] = useState(false);
  const actual = PORID.get(camino[camino.length - 1]) ?? PANTALLAS[0];

  const ir = useCallback((id: string) => {
    // Al salir de la carga se apaga la animación. Apagarla importa: mientras
    // está encendida hay un reloj de seguridad en marcha, y si se quedara
    // puesto al llegar a otra pantalla, a los cinco segundos saltaría solo a la
    // bienvenida y desharía el camino.
    setArrancando(false);
    setCamino((antes) => (id === "carga" ? ["carga"] : [...antes, id]));
  }, []);
  const comenzar = useCallback(() => setArrancando(true), []);
  const atras = useCallback(() => {
    setCamino((antes) => (antes.length > 1 ? antes.slice(0, -1) : antes));
  }, []);

  const ctx: Ctx = { ir, t, comenzar, arrancando };

  return (
    <section className={`am-proto ${raleway.variable}`}>
      <div className="am-proto-caja">
        {/* El móvil. El marco es CSS —no una imagen— para que se vea nítido a
            cualquier tamaño, pese cero y el hueco de la pantalla sea exacto. */}
        <div className="am-movil">
          <div className="am-movil-hueco">
            <div className="am-movil-notch" aria-hidden="true" />
            {/* La clave fuerza a React a rehacer el cuerpo al cambiar de
                pantalla, que es lo que dispara la entrada. */}
            <div className="am-app" key={actual.id}>
              <div
                className={`am-app-cuerpo${actual.plena ? " es-plena" : ""}${
                  actual.clase ? ` ${actual.clase}` : ""
                }`}
              >
                {actual.cuerpo(ctx)}
              </div>
            </div>
          </div>
        </div>

        {/* Los mandos, FUERA del móvil: dentro serían un botón más y se
            confundirían con la interfaz que se está enseñando. */}
        <div className="am-proto-mandos">
          <p className="am-proto-donde">
            <span className="am-proto-num">
              {String(PANTALLAS.indexOf(actual) + 1).padStart(2, "0")}
            </span>
            {t(actual.es, actual.en)}
          </p>

          <div className="am-proto-botones">
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
