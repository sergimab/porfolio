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

// Los iconos de la barra de la home. Van dibujados y no como fuente de iconos
// para que el trazo sea el mismo que el del resto de la app.
const ICONOS: Record<string, string> = {
  casa: "M3 10.5 12 3.5l9 7V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  galeria: "M3 5h18v14H3z M3 16l5-5 4 4 3-3 6 6",
  datos: "M5 20V10 M12 20V4 M19 20v-7",
  descarga: "M12 3v12 M7 11l5 5 5-5 M4 20h16",
};

function Icono({ d, rotulo }: { d: string; rotulo: string }) {
  return (
    <span className="am-app-icono">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        {d.split(" M").map((trozo, i) => (
          <path
            key={i}
            d={i === 0 ? trozo : `M${trozo}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>
      <span className="am-oculto">{rotulo}</span>
    </span>
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

        {/* LA BARRA, con el botón del isotipo en medio.
            Es una sola pieza y no cinco botones sueltos: la barra se dibuja con
            una muesca arriba en el centro, y el botón redondo se posa en esa
            muesca sobresaliendo por encima. Eso es lo que lo convierte en «el»
            botón de la app —el del escaneo— y no en uno más de la fila.
            Los cuatro iconos todavía no llevan a ningún sitio; cada uno tendrá
            su pantalla. */}
        <nav className="am-app-barra" aria-label={c.t("Menú principal", "Main menu")}>
          <button type="button">
            <Icono d={ICONOS.casa} rotulo={c.t("Inicio", "Home")} />
          </button>
          <button type="button">
            <Icono d={ICONOS.galeria} rotulo={c.t("Colección", "Collection")} />
          </button>

          <button type="button" className="am-app-barra-centro">
            <Marca clase="es-boton" />
            <span className="am-oculto">{c.t("Escanear una obra", "Scan a work")}</span>
          </button>

          <button type="button">
            <Icono d={ICONOS.datos} rotulo={c.t("Datos", "Data")} />
          </button>
          <button type="button">
            <Icono d={ICONOS.descarga} rotulo={c.t("Descargas", "Downloads")} />
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
