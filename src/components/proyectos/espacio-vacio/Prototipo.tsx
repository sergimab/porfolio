"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import LangText from "@/components/shared/LangText";
import "./Prototipo.css";

// El alta de la app, navegable de verdad.
//
// Las pantallas son las de Figma exportadas a PNG, pero NO van como una galería:
// van dentro de un móvil y se pasan pulsando sus propios botones, que es como se
// usa una app. Enseñar una rejilla de diez capturas cuenta qué se dibujó;
// esto cuenta cómo se recorre, que es lo que hay que juzgar de un diseño de
// producto.
//
// Las zonas pulsables están MEDIDAS sobre los archivos —buscando las cajas
// oscuras de cada botón en el mapa de grises— y van en porcentaje de la
// pantalla, así que siguen encima de su botón a cualquier tamaño.

const BASE = "/proyectos/espacio-vacio/app";

// Una zona pulsable: el rectángulo del botón y a dónde lleva.
type Zona = {
  x: number;
  y: number;
  ancho: number;
  alto: number;
  va: string;
  es: string;
  en: string;
};

type Pantalla = {
  id: string;
  archivo: string;
  es: string;
  en: string;
  zonas: Zona[];
  // La flecha de volver de la cabecera. La llevan todas menos las dos primeras.
  atras?: boolean;
};

// El botón SIGUIENTE cae en el mismo sitio en toda la secuencia de
// instrucciones, así que se escribe una vez.
const SIGUIENTE = (va: string): Zona => ({
  x: 54.9,
  y: 80.5,
  ancho: 35.3,
  alto: 4.3,
  va,
  es: "Siguiente",
  en: "Next",
});

const PANTALLAS: Pantalla[] = [
  {
    id: "carga",
    archivo: "01-loading.webp",
    es: "Carga",
    en: "Splash",
    // Sin zonas: pasa sola cuando termina la animación del isotipo.
    zonas: [],
  },
  {
    id: "bienvenida",
    archivo: "02-bienvenida.webp",
    es: "Bienvenida",
    en: "Welcome",
    // La única bifurcación del alta: cuenta nueva o entrar con la de siempre.
    zonas: [
      { x: 11.2, y: 51.3, ancho: 35.3, alto: 4.5, va: "crear", es: "Soy nuevo", en: "I'm new" },
      { x: 53.5, y: 51.3, ancho: 35.3, alto: 4.5, va: "entrar", es: "Tengo cuenta", en: "I have an account" },
    ],
  },
  {
    id: "crear",
    archivo: "03-crear-cuenta.webp",
    es: "Crear cuenta",
    en: "Sign up",
    atras: true,
    zonas: [
      { x: 12.6, y: 73.2, ancho: 35.3, alto: 4.3, va: "quienes", es: "Crear cuenta", en: "Create account" },
    ],
  },
  {
    id: "entrar",
    archivo: "04-entrar.webp",
    es: "Entrar",
    en: "Log in",
    atras: true,
    zonas: [
      { x: 12.1, y: 51.7, ancho: 35.3, alto: 4.5, va: "quienes", es: "Entrar", en: "Log in" },
    ],
  },
  {
    id: "quienes",
    archivo: "05-quienes-somos.webp",
    es: "¿Quiénes somos?",
    en: "Who we are",
    atras: true,
    zonas: [SIGUIENTE("comofunciona")],
  },
  {
    id: "comofunciona",
    archivo: "06-como-funciona.webp",
    es: "¿Cómo funciona?",
    en: "How it works",
    atras: true,
    zonas: [SIGUIENTE("pregunta")],
  },
  {
    id: "pregunta",
    archivo: "07-pregunta.webp",
    es: "La pregunta",
    en: "The question",
    atras: true,
    zonas: [SIGUIENTE("casillas")],
  },
  {
    id: "casillas",
    archivo: "08-casillas.webp",
    es: "Las casillas",
    en: "The slots",
    atras: true,
    zonas: [SIGUIENTE("diario")],
  },
  {
    id: "diario",
    archivo: "09-diario.webp",
    es: "Tu diario",
    en: "Your diary",
    atras: true,
    zonas: [SIGUIENTE("listo")],
  },
  {
    id: "listo",
    archivo: "10-listo.webp",
    es: "¿Listo?",
    en: "Ready?",
    atras: true,
    zonas: [
      { x: 32.6, y: 36.5, ancho: 35.3, alto: 4.5, va: "carga", es: "Vamos", en: "Let's go" },
    ],
  },
];

const PORID = new Map(PANTALLAS.map((p) => [p.id, p]));

// Lo que dura la animación del isotipo, más un respiro. Si algún día se
// reexporta el vídeo con otra duración, hay que tocarlo aquí.
const CARGA = 4400;

export default function Prototipo() {
  // El camino recorrido, no la pantalla suelta: la flecha de volver tiene que
  // deshacer lo que se hizo —y del alta se puede llegar por dos ramas—, así que
  // hace falta la pila entera y no un índice.
  const [camino, setCamino] = useState<string[]>(["carga"]);
  const [pistas, setPistas] = useState(false);
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
    const t = setTimeout(() => ir("bienvenida"), CARGA);
    return () => clearTimeout(t);
  }, [actual.id, ir]);

  // Las imágenes, todas cargadas de antemano: son 200 KB entre las diez, y el
  // parpadeo al pasar de pantalla arruinaría la sensación de estar usando algo.
  useEffect(() => {
    PANTALLAS.forEach((p) => {
      const img = new Image();
      img.src = `${BASE}/${p.archivo}`;
    });
  }, []);

  return (
    <section className="ev-proto">
      <h2 className="ev-proto-titulo">
        <LangText es="El alta, paso a paso" en="Onboarding, step by step" />
      </h2>

      <div className="ev-proto-caja">
        {/* El móvil. El marco es CSS —no una imagen— para que se vea nítido a
            cualquier tamaño y para que pese cero. */}
        {/* Sin isla de cámara: las pantallas vienen diseñadas a sangre y el
            logotipo de la app va justo arriba del todo, así que una isla
            dibujada encima le caía encima y tapaba la marca. */}
        <div className="ev-movil">
          <div className={`ev-pantalla${pistas ? " es-pistas" : ""}`}>
            {PANTALLAS.map((p) => (
              // Todas montadas y solo una visible: así el cambio es un fundido
              // entre dos imágenes ya descargadas y no un hueco en blanco.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={p.id}
                className={`ev-captura${p.id === actual.id ? " es-visible" : ""}`}
                src={`${BASE}/${p.archivo}`}
                alt=""
                aria-hidden={p.id !== actual.id}
                draggable={false}
              />
            ))}

            {/* La animación del isotipo, encima de la pantalla de carga.
                El vídeo viene con fondo casi blanco —#FDFDFD— y la pantalla es
                blanca del todo: con `multiply` el blanco desaparece y solo
                quedan las formas, así que no se ve el recuadro del vídeo. */}
            <video
              ref={video}
              className={`ev-carga${actual.id === "carga" ? " es-visible" : ""}`}
              src={`${BASE}/isotipo.mp4`}
              muted
              playsInline
              preload="auto"
              aria-hidden="true"
            />

            {actual.atras && (
              <button
                type="button"
                className="ev-zona es-atras"
                onClick={atras}
                title="Volver"
              >
                <span className="ev-zona-texto">
                  <LangText es="Volver" en="Back" />
                </span>
              </button>
            )}

            {actual.zonas.map((z) => (
              <button
                key={z.va + z.x}
                type="button"
                className="ev-zona"
                style={{
                  left: `${z.x}%`,
                  top: `${z.y}%`,
                  width: `${z.ancho}%`,
                  height: `${z.alto}%`,
                }}
                onClick={() => ir(z.va)}
              >
                <span className="ev-zona-texto">
                  <LangText es={z.es} en={z.en} />
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Los mandos, FUERA del móvil: dentro serían un botón más y se
            confundirían con la interfaz que se está enseñando. */}
        <div className="ev-proto-mandos">
          <p className="ev-proto-donde">
            <span className="ev-proto-num">
              {String(PANTALLAS.indexOf(actual) + 1).padStart(2, "0")}
            </span>
            <LangText es={actual.es} en={actual.en} />
          </p>

          <div className="ev-proto-botones">
            <button type="button" onClick={atras} disabled={camino.length < 2}>
              <LangText es="Atrás" en="Back" />
            </button>
            <button type="button" onClick={() => ir("carga")}>
              <LangText es="Reiniciar" en="Restart" />
            </button>
            <button
              type="button"
              className={pistas ? "es-activo" : undefined}
              onClick={() => setPistas((v) => !v)}
            >
              <LangText es="Ver zonas" en="Show hotspots" />
            </button>
          </div>

          <p className="ev-proto-pie">
            <LangText
              es="Se recorre pulsando los botones de la propia app, como el prototipo de Figma."
              en="You move through it by tapping the app's own buttons, like the Figma prototype."
            />
          </p>
        </div>
      </div>
    </section>
  );
}
