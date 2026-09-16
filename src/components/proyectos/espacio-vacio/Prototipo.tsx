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

// Lo que dura la animación del isotipo, más un respiro.
const CARGA = 4400;

// Traductor corto. Aquí no sirve <LangText>, que solo admite cadenas: dentro de
// la app hay textos con un dato metido en medio y marcadores de posición de los
// campos, que son atributos.
type T = (es: string, en: string) => string;

type Ctx = {
  ir: (id: string) => void;
  t: T;
  horas: number;
  setHoras: (h: number) => void;
};

function Cabecera({ atras, t }: { atras?: () => void; t: T }) {
  return (
    <header className="ev-app-cabecera">
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
// dibujada: se puede escribir dentro, que es lo que uno espera al ver un campo.
function Campo({
  texto,
  valor,
  escribiendo,
  clave,
  onCambio,
}: {
  texto: string;
  valor?: string;
  // Campo de contraseña: se escribe en puntos, y los puntos piden su propio
  // ajuste vertical.
  clave?: boolean;
  // El que se está tecleando lleva el cursor: es lo que hace que se lea como
  // alguien rellenando el formulario y no como un texto que aparece de golpe.
  escribiendo?: boolean;
  onCambio?: (v: string) => void;
}) {
  // Mientras se teclea NO hay <input>, hay una caja igual con el texto y el
  // cursor detrás de la última letra. Es la única forma de que el cursor caiga
  // donde tiene que caer: dentro de un campo, el del navegador solo se dibuja
  // si el campo tiene el foco, y robarle el foco a quien está leyendo la página
  // le arrastraría el desplazamiento hasta aquí. Al terminar vuelve el campo de
  // verdad, que es el que se puede usar.
  if (escribiendo) {
    return (
      <div
        className={`ev-app-campo es-escribiendo${clave ? " es-clave" : ""}`}
        aria-hidden="true"
      >
        <span className="ev-app-tecleado">
          {valor}
          <i />
        </span>
      </div>
    );
  }

  return (
    <label className={`ev-app-campo${clave ? " es-clave" : ""}`}>
      <span className="ev-oculto">{texto}</span>
      <input
        type="text"
        placeholder={texto}
        value={valor ?? ""}
        onChange={(e) => onCambio?.(e.target.value)}
      />
    </label>
  );
}

// El formulario que se rellena solo, letra a letra.
//
// Se teclea de verdad —un carácter por golpe de reloj, con el cursor en el
// campo que toca— en vez de aparecer relleno: lo que se está enseñando es cómo
// se USA la pantalla, y un formulario ya lleno no cuenta nada que no contara
// una captura.
//
// En cuanto alguien escribe por su cuenta, el tecleo se para y no vuelve: la
// máquina no puede pelearse con la persona por el mismo campo.
function CamposAuto({
  campos,
}: {
  campos: { etiqueta: string; valor: string; clave?: boolean }[];
}) {
  const [escrito, setEscrito] = useState<string[]>(() => campos.map(() => ""));
  const [enCurso, setEnCurso] = useState(0);
  // Se levanta cuando escribe una persona, y ya no se baja.
  const tomado = useRef(false);

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
      if (!vivo || tomado.current || campo >= campos.length) return;
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
      // Ritmo irregular: a golpe fijo suena a máquina. Y entre campo y campo,
      // la pausa de buscar el siguiente.
      reloj = setTimeout(paso, acabado ? 420 : 38 + Math.random() * 55);
    };
    // Un respiro antes de empezar, para que se vea la pantalla vacía primero.
    reloj = setTimeout(paso, 650);
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
          onCambio={(v) => {
            // Alguien ha escrito: se para el tecleo y manda lo que ponga.
            tomado.current = true;
            setEscrito((antes) => {
              const copia = [...antes];
              copia[i] = v;
              return copia;
            });
          }}
        />
      ))}
    </div>
  );
}

type Pantalla = {
  id: string;
  es: string;
  en: string;
  atras?: boolean;
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
    cuerpo: (c) => (
      <>
        <h3 className="ev-app-titulo es-suelto">{c.t("Crear cuenta", "Create account")}</h3>
        {/* Los datos son los de la pantalla de perfil del proyecto: la misma
            usuaria de ejemplo aquí que allí. La contraseña se teclea a la vista
            —sin puntos— porque así está en el diseño original. */}
        <CamposAuto
          campos={[
            { etiqueta: c.t("Nombre completo", "Full name"), valor: "Clara Gutiérrez García" },
            { etiqueta: c.t("Correo electrónico", "Email"), valor: "cgutierrez@gmail.com" },
            {
              etiqueta: c.t("Fecha de nacimiento", "Date of birth"),
              valor: c.t("16 de Marzo de 2003", "16 March 2003"),
            },
            { etiqueta: c.t("Contraseña", "Password"), valor: "Polloconarroz" },
            {
              etiqueta: c.t("Confirmar contraseña", "Confirm password"),
              valor: "Polloconarroz",
            },
          ]}
        />
        <Boton clase="es-suelto" onClick={() => c.ir("quienes")}>
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
    cuerpo: (c) => (
      <>
        <h3 className="ev-app-titulo es-suelto">{c.t("Entrar", "Log in")}</h3>
        <div className="ev-app-campos">
          <Campo texto={c.t("Correo electrónico", "Email")} />
          <Campo texto={c.t("Contraseña", "Password")} />
        </div>
        <Boton clase="es-suelto" onClick={() => c.ir("quienes")}>
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
        <h3 className="ev-app-titulo">{c.t("Una pregunta importante", "One important question")}</h3>
        <p className="ev-app-texto es-fuerte">
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
    cuerpo: (c) => (
      <>
        <h3 className="ev-app-titulo es-centrado">{c.t("¿Listo para empezar?", "Ready to start?")}</h3>
        <Boton clase="es-centrado" onClick={() => c.ir("carga")}>
          {c.t("Vamos", "Let's go")}
        </Boton>
      </>
    ),
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
  const actual = PORID.get(camino[camino.length - 1]) ?? PANTALLAS[0];
  const video = useRef<HTMLVideoElement>(null);

  const ir = useCallback((id: string) => {
    // Volver al principio es empezar de cero, no apilar otra vuelta.
    setCamino((antes) => (id === "carga" ? ["carga"] : [...antes, id]));
  }, []);
  const atras = useCallback(() => {
    setCamino((antes) => (antes.length > 1 ? antes.slice(0, -1) : antes));
  }, []);

  // La pantalla de carga pasa sola: es lo que hace de verdad, y dejarla
  // esperando un clic sería inventarse un botón que no existe.
  useEffect(() => {
    if (actual.id !== "carga") return;
    const v = video.current;
    if (v) {
      v.currentTime = 0;
      // El navegador puede rechazar la reproducción automática; no pasa nada,
      // el temporizador sigue y la pantalla avanza igual.
      v.play().catch(() => {});
    }
    const reloj = setTimeout(() => ir("bienvenida"), CARGA);
    return () => clearTimeout(reloj);
  }, [actual.id, ir]);

  const ctx: Ctx = { ir, t, horas, setHoras };

  return (
    <section className="ev-proto">
      <div className="ev-proto-caja">
        {/* El móvil. El marco es CSS —no una imagen— para que se vea nítido a
            cualquier tamaño y para que pese cero. */}
        <div className="ev-movil">
          <div className="ev-pantalla">
            {/* La clave fuerza a React a rehacer el cuerpo al cambiar de
                pantalla, que es lo que dispara la entrada. */}
            <div className="ev-app" key={actual.id}>
              {/* La carga va sin cabecera: ahí la marca ya la pone la
                  animación del isotipo, y el logotipo arriba la repetía. */}
              {actual.id !== "carga" && (
                <Cabecera atras={actual.atras ? atras : undefined} t={t} />
              )}

              {/* La animación del isotipo de la pantalla de carga. El vídeo
                  viene con fondo casi blanco —#FDFDFD— sobre una pantalla
                  blanca: con `multiply` ese blanco desaparece y no se ve el
                  recuadro. */}
              {actual.id === "carga" && (
                <video
                  ref={video}
                  className="ev-app-carga"
                  src="/proyectos/espacio-vacio/app/isotipo.mp4"
                  muted
                  playsInline
                  preload="auto"
                  aria-hidden="true"
                />
              )}

              <div className={`ev-app-cuerpo${actual.id === "casillas" ? " es-alto" : ""}`}>
                {actual.cuerpo(ctx)}
              </div>
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
            <button type="button" onClick={atras} disabled={camino.length < 2}>
              {t("Atrás", "Back")}
            </button>
            <button type="button" onClick={() => ir("carga")}>
              {t("Reiniciar", "Restart")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
