import ArteMiedo from "./ArteMiedo";
import VideoMarca from "../yelmo/VideoMarca";
import Pieza from "./Pieza";
import RotuloSeccion from "@/components/shared/RotuloSeccion";
import LangText from "@/components/shared/LangText";
import DropcapTitle from "@/components/shared/DropcapTitle";
import CtaBanner from "@/components/shared/CtaBanner";
import { FOBIAS } from "./fobias";
import "./ArteMiedo.css";
import "./Motion.css";

const RUTA = "/proyectos/el-arte-del-miedo-motion";
// Las piezas del recorrido viven en la carpeta de la app y se traen de allí en
// vez de duplicarlas aquí: son los mismos cinco archivos que corren dentro del
// prototipo, y teniendo dos copias, el día que se reexporte una se quedaría la
// otra vieja sin que nadie se entere.
const RUTA_APP = "/proyectos/el-arte-del-miedo-app";

// Los cinco pasos del recorrido de bienvenida, en su orden.
const RECORRIDO = [
  { id: "escanea", es: "Escanea", en: "Scan" },
  { id: "descubre", es: "Descubre", en: "Discover" },
  { id: "colecciona", es: "Colecciona", en: "Collect" },
  { id: "analiza", es: "Analiza", en: "Analyse" },
  { id: "descarga", es: "Descarga", en: "Download" },
];

// LAS SEIS OBRAS ANIMADAS, con la proporción de su archivo.
//
// Son seis de las siete: del Munch no hay pieza en movimiento. Y cada una tiene
// su propia forma porque respeta la del cuadro —de 450 × 298 a 450 × 552—, así
// que la proporción va escrita aquí, medida en los archivos. Hace falta antes
// de descargarlos: ver el comentario de `Pieza`.
//
// El ORDEN y los títulos no se escriben otra vez: salen de la lista de obras,
// que es la misma que usan la app y la galería. Si allí cambia, aquí cambia.
const ANIMADAS: Record<string, string> = {
  autofobia: "450 / 298",
  necrofobia: "450 / 354",
  entomofobia: "450 / 332",
  claustrofobia: "450 / 552",
  acrofobia: "450 / 430",
  pirofobia: "450 / 334",
};
const OBRAS = FOBIAS.filter((f) => f.id in ANIMADAS);

// La pata de motion del proyecto: lo que se mueve.
//
// Las tres páginas cuentan el mismo encargo y por eso comparten cabecera,
// entradilla y ficha; lo que cambia es desde dónde se mira. Aquí se mira desde
// la animación, así que el orden es el de las piezas: primero la marca
// construyéndose, después el efecto que se aplica a las ochenta obras y por
// último el movimiento que hay dentro de la app.
export default function MotionLanding() {
  return (
    <ArteMiedo disciplina="motion">
      {/* ── La cabecera ────────────────────────────────────────────────── */}
      {/* La misma pieza que abre la página de marca, y a propósito: allí es la
          presentación del proyecto y aquí es el trabajo. Es la única animación
          del encargo que no va dentro de una pantalla, así que en una página de
          motion no puede estar en otro sitio que en el primero.
          La franja se recorta a 1920/620 porque el archivo es 16:9 y toda la
          construcción cabe en la banda central. */}
      <VideoMarca
        src="/proyectos/el-arte-del-miedo-branding/logo-final.mp4"
        proporcion="1920 / 620"
        fondo="#000"
        alt="El isotipo de El Arte del Miedo construyéndose cuadro a cuadro"
      />

      {/* ── El recorrido ───────────────────────────────────────────────── */}
      <section className="am-seccion">
        <RotuloSeccion es="El recorrido" en="The walkthrough" />
        <div className="am-texto">
          <p>
            <LangText
              es="Lo primero que ve el visitante al abrir la app son **cinco piezas seguidas** que le cuentan qué puede hacer dentro: escanear, descubrir, coleccionar, analizar y descargar. Se ven una detrás de otra, a pantalla completa, así que tienen que **leerse en dos segundos y sin texto**: cada una explica su verbo con una sola idea en movimiento."
              en="The first thing you see when you open the app is **five pieces in a row** telling you what you can do inside: scan, discover, collect, analyse and download. They come one after another, full screen, so each has to **read in two seconds and without words**: one idea in motion per verb."
            />
          </p>
          <p>
            <LangText
              es="Van todas con **la misma gramática** —el marco de canto rosa y azul, el fondo negro, la figura entrando desde el mismo sitio—, que es lo que hace que las cinco se lean como una sola secuencia y no como cinco animaciones sueltas puestas en fila."
              en="They all share **the same grammar** — the pink-and-blue edged frame, the black ground, the shape entering from the same place — which is what makes the five read as one sequence instead of five loose animations lined up."
            />
          </p>
        </div>

        <div className="am-recorrido">
          {RECORRIDO.map((v) => (
            <figure key={v.id}>
              {/* Todas son 400 × 700, el hueco que tienen dentro de la app. */}
              <Pieza src={`${RUTA_APP}/${v.id}.mp4`} proporcion="400 / 700" alt={v.es} />
              <figcaption>
                <LangText es={v.es} en={v.en} />
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ── El efecto ──────────────────────────────────────────────────── */}
      <section className="am-seccion">
        <RotuloSeccion es="El efecto" en="The effect" />
        <div className="am-texto">
          <p>
            <LangText
              es="Cada una de las ochenta obras se anima con **el mismo efecto**: la pintura se descompone en la **retícula de cuadrados** de la marca y vuelve a recomponerse, atravesada por el rosa y el azul del escáner. No es un filtro puesto encima —es la misma trama con la que están hechos el isotipo y los carteles—, así que lo que se ve al escanear un cuadro y lo que se ve en un cartel de la calle son **la misma cosa en dos soportes**."
              en="Each of the eighty works is animated with **the same effect**: the painting breaks up into the brand's **grid of squares** and puts itself back together, shot through with the scanner's pink and blue. It is not a filter laid on top — it is the same weave the isotype and the posters are made of — so what you see when you scan a painting and what you see on a poster in the street are **the same thing on two surfaces**."
            />
          </p>
          <p>
            <LangText
              es="El movimiento tiene que funcionar sobre pinturas muy distintas —un óleo oscuro del XIX, un grabado en blanco y negro, un surrealista de colores planos—, así que el efecto **no toca el color de la obra**: solo la desordena. Lo que cambia de un cuadro a otro es cuánto se desordena, no de qué color se pone."
              en="The motion has to work on very different paintings — a dark nineteenth-century oil, a black-and-white engraving, a flat-coloured surrealist — so the effect **does not touch the work's colour**: it only unsettles it. What changes from one painting to the next is how much it unsettles, not what colour it turns."
            />
          </p>
        </div>

        <div className="am-obras">
          {OBRAS.map((f) => (
            <figure key={f.id}>
              <Pieza
                src={`${RUTA}/cuadro-${f.id}.mp4`}
                proporcion={ANIMADAS[f.id]}
                alt={`${f.obra}, ${f.anio}, con el efecto de escaneo`}
              />
              <figcaption>
                <span>«{f.obra}»</span>
                <span className="am-obras-anio">{f.anio}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ── Dentro de la app ───────────────────────────────────────────── */}
      <section className="am-seccion">
        <RotuloSeccion es="Dentro de la app" en="Inside the app" />
        <div className="am-texto">
          <p>
            <LangText
              es="La app es donde el efecto se usa de verdad. A la izquierda, el **escaneo**: se apunta la cámara a un cuadro que no tiene cartela y la obra se enciende dentro del encuadre. A la derecha, lo que viene después: la **ficha sube desde abajo** y cuenta qué miedo esconde."
              en="The app is where the effect actually gets used. On the left, the **scan**: you point the camera at a painting with no wall label and the work lights up inside the frame. On the right, what comes next: the **entry rises from the bottom** and tells you what fear it hides."
            />
          </p>
        </div>

        <div className="am-motion-app">
          {[
            { id: "ejemplo-01", es: "El escaneo de una obra", en: "Scanning a work" },
            { id: "ejemplo-02", es: "La ficha de la fobia", en: "The phobia entry" },
          ].map((v) => (
            <figure key={v.id}>
              {/* Las dos son capturas de pantalla de móvil, 400 × 700. */}
              <Pieza src={`${RUTA}/${v.id}.mp4`} proporcion="400 / 700" alt={v.es} />
              <figcaption>
                <LangText es={v.es} en={v.en} />
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="am-texto">
          <p>
            <LangText
              es="Las cinco del recorrido también se pueden ver **funcionando dentro del prototipo**, en su sitio y pasando con el botón de siguiente, en la página del diseño de producto."
              en="The five walkthrough pieces can also be seen **running inside the prototype**, in place and advancing with the next button, on the product design page."
            />
          </p>
        </div>
      </section>

      {/* ── El pie ─────────────────────────────────────────────────────── */}
      <section className="am-seccion">
        <h2 className="project-h2">
          <DropcapTitle es="Páginas recomendadas" en="Recommended pages" />
        </h2>
        <CtaBanner
          href="/proyecto/u3"
          es="Ver la app de la exposición"
          en="See the exhibition app"
          imagen="/banners/el-arte-del-miedo-app.webp"
          imagenMovil="/banners/el-arte-del-miedo-app-movil.webp"
          alt="La app de El Arte del Miedo escaneando una obra de la exposición"
        />
        <CtaBanner
          href="/proyecto/b3"
          es="Ver la marca de la exposición"
          en="See the exhibition's brand"
          imagen="/banners/el-arte-del-miedo-branding.webp"
          imagenMovil="/banners/el-arte-del-miedo-branding-movil.webp"
          alt="Los carteles de la exposición pegados en un panel de la calle"
        />
      </section>
    </ArteMiedo>
  );
}
