import ArteMiedo from "./ArteMiedo";
import VideoMarca from "../yelmo/VideoMarca";
import Pieza from "./Pieza";
import RotuloSeccion from "@/components/shared/RotuloSeccion";
import LangText from "@/components/shared/LangText";
import DropcapTitle from "@/components/shared/DropcapTitle";
import Recomendados from "@/components/shared/Recomendados";
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
      {/* La marca construyéndose. Es la única animación del encargo que no va
          dentro de una pantalla, así que en una página de motion no puede estar
          en otro sitio que en el primero —y por eso ya no está también en la de
          marca, donde repetía sin añadir nada—.
          La franja se recorta a 1920/620 porque el archivo es 16:9 y toda la
          construcción cabe en la banda central. En móvil la caja se hace
          CUADRADA: medida, la pieza ocupa solo el 11 % del ancho del cuadro y
          está centrada, así que el recorte de una caja cuadrada se lleva
          lados vacíos y el logotipo pasa de 42 a 75 px. */}
      <VideoMarca
        src="/proyectos/el-arte-del-miedo-branding/logo-final.mp4"
        proporcion="1920 / 620"
        proporcionMovil="1 / 1"
        fondo="#000"
        alt="El isotipo de El Arte del Miedo construyéndose cuadro a cuadro"
      />

      {/* ── El recorrido ───────────────────────────────────────────────── */}
      <section className="am-seccion">
        <RotuloSeccion es="El recorrido" en="The walkthrough" />
        <div className="am-texto">
          <p>
            <LangText
              es="Cinco piezas seguidas cuentan qué se puede hacer dentro de la app. Van **sin una palabra**, así que cada una tiene que leerse en dos segundos: un verbo, una idea en movimiento. Y todas con **el mismo marco, el mismo fondo y la misma entrada**, que es lo que las hace una secuencia y no cinco animaciones sueltas."
              en="Five pieces in a row tell you what the app can do. They run **without a single word**, so each has to read in two seconds: one verb, one idea in motion. And all share **the same frame, ground and entrance**, which is what makes them a sequence instead of five loose animations."
            />
          </p>
        </div>

        <div className="am-recorrido">
          {RECORRIDO.map((v) => (
            <figure key={v.id}>
              {/* Todas son 396 × 696, el hueco que tienen dentro de la app. */}
              <Pieza src={`${RUTA_APP}/${v.id}.mp4`} proporcion="396 / 696" alt={v.es} />
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
              es="Las ochenta obras se animan igual: la pintura se descompone en la **retícula de cuadrados** de la marca y vuelve a recomponerse. No es un filtro puesto encima, es **la misma trama del isotipo y los carteles**. Y no toca el color del cuadro —solo lo desordena—, que es lo que deja aplicarlo igual a un óleo del XIX que a un grabado en blanco y negro."
              en="All eighty works are animated the same way: the painting breaks into the brand's **grid of squares** and puts itself back together. It is not a filter on top, it is **the same weave as the isotype and the posters**. And it never touches the painting's colour — it only unsettles it — which is what lets it work on a nineteenth-century oil and on a black-and-white engraving alike."
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
              es="Donde el efecto se usa de verdad. El **escaneo**: se apunta la cámara a un cuadro sin cartela y la obra se enciende dentro del encuadre. Y lo que viene después: la **ficha sube desde abajo** y cuenta qué miedo esconde."
              en="Where the effect actually gets used. The **scan**: point the camera at a painting with no wall label and the work lights up inside the frame. And what comes next: the **entry rises from the bottom** and tells you what fear it hides."
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
              es="Las cinco del recorrido se pueden ver además **funcionando dentro del prototipo**, en la página del diseño de producto."
              en="The five walkthrough pieces can also be seen **running inside the prototype**, on the product design page."
            />
          </p>
        </div>
      </section>

      {/* ── El pie ─────────────────────────────────────────────────────── */}
      <section className="am-seccion">
        <Recomendados ids={["u3", "b3"]} />
      </section>
    </ArteMiedo>
  );
}
