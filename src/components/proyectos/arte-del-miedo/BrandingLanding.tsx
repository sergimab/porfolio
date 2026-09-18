import { existsSync } from "node:fs";
import { join } from "node:path";
import ArteMiedo from "./ArteMiedo";
import RotuloSeccion from "@/components/shared/RotuloSeccion";
import LangText from "@/components/shared/LangText";
import Tipografia from "./Tipografia";
import Paleta from "./Paleta";
import Isotipo from "./Isotipo";
import Pruebas from "./Pruebas";
import "./ArteMiedo.css";

// EL LOGOTIPO SE BUSCA EN EL DISCO, no se escribe a mano en el código.
//
// Esta página se monta en el servidor, así que aquí se puede mirar si el
// archivo está y decidir en consecuencia: si está, se enseña; si no, se enseña
// el aviso de que falta. El motivo es práctico: así basta con dejar el archivo
// en su carpeta para que aparezca en la página, sin tocar una línea.
//
// Se prueban varias extensiones por orden de preferencia. El SVG primero
// porque un logotipo de trazos limpios pesa ahí una décima parte, se ve nítido
// a cualquier tamaño y se puede pintar del color del texto —o sea, vale igual
// en claro que en oscuro sin hacer dos versiones—.
const CARPETA = "proyectos/el-arte-del-miedo-branding";
const NOMBRES = ["logotipo.svg", "logotipo.webp", "logotipo.png", "logotipo.jpg"];

// La búsqueda va DENTRO del componente y no en el cuerpo del módulo. Fuera se
// haría una sola vez, al cargar el módulo, y dejar el archivo después no
// serviría de nada hasta reiniciar el servidor: justo lo contrario de lo que se
// busca. Aquí se comprueba al montar la página, que en producción es al
// construirla y en desarrollo en cada recarga.
const buscarLogotipo = () =>
  NOMBRES.find((n) => existsSync(join(process.cwd(), "public", CARPETA, n)));

// La pata de branding del proyecto: de dónde sale el isotipo, con qué letra y
// con qué colores se escribe, y en qué acaba todo eso cuando sale a la calle.
//
// El orden es el del propio trabajo —primero se dibuja, después se viste y por
// último se aplica—, así que se lee igual de bien de arriba abajo que saltando
// a la sección que interese.
//
// Las cajas de puntos que hay bajo cada sección marcan las piezas que todavía
// no han llegado. Están a la vista a propósito: un hueco invisible se olvida.
export default function BrandingLanding() {
  const logotipo = buscarLogotipo();

  return (
    <ArteMiedo disciplina="branding">
      {/* ── El icono ───────────────────────────────────────────────────── */}
      <section className="am-seccion">
        <RotuloSeccion es="El icono" en="The icon" />
        {/* Sin texto: la sección la cuentan las propias piezas. El isotipo sobre
            su cuadrícula —se enseñan la figura Y las líneas de las que sale— y,
            al lado, las pruebas que se quedaron por el camino pasando en
            bucle. */}
        <div className="am-iconos">
          <figure>
            <Isotipo conRejilla />
            <figcaption>
              <LangText es="Final" en="Final" />
            </figcaption>
          </figure>
          <figure>
            <Pruebas />
            <figcaption>
              <LangText es="Pruebas" en="Trials" />
            </figcaption>
          </figure>
        </div>

        {/* El logotipo completo, debajo de las dos cuadrículas: primero de dónde
            sale la figura, después la figura ya puesta con el nombre. */}
        {logotipo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="am-logotipo"
            src={`/${CARPETA}/${logotipo}`}
            alt="El Arte del Miedo · Exposición"
          />
        ) : (
          <p className="am-pendiente">
            <LangText
              es="Falta el logotipo completo —«El Arte del Miedo · Exposición»—, que va justo aquí. Basta con dejar el archivo en public/proyectos/el-arte-del-miedo-branding/ llamado logotipo.svg (o .png): la página lo busca sola y lo coloca."
              en="Missing: the full logotype — «El Arte del Miedo · Exposición» — which goes right here. Just drop the file into public/proyectos/el-arte-del-miedo-branding/ named logotipo.svg (or .png): the page looks for it and places it."
            />
          </p>
        )}
      </section>

      {/* ── Tipografía ─────────────────────────────────────────────────── */}
      {/* Esto y el color iban juntos bajo un solo rótulo, «Tipografía y color».
          Se han separado al darle a la paleta su propio título: con los dos
          rótulos seguidos, el de arriba anunciaba dos cosas y el de abajo solo
          una, y no se sabía dónde acababa cada apartado. El texto ya venía en
          dos párrafos, uno por tema, así que la partición era la suya. */}
      <section className="am-seccion">
        <RotuloSeccion es="Tipografía" en="Typography" />
        <div className="am-texto">
          <p>
            <LangText
              es="**Raleway** se encarga de la parte tipográfica: una sans serif moderna y muy legible que aguanta bien tanto un titular grande como un bloque de texto largo."
              en="**Raleway** does the typographic work: a modern, highly legible sans serif that holds up both at headline size and across a long block of text."
            />
          </p>
        </div>
        <Tipografia />
      </section>

      {/* ── Paleta de color ────────────────────────────────────────────── */}
      <section className="am-seccion">
        <RotuloSeccion es="Paleta de color" en="Colour palette" />
        <div className="am-texto">
          <p>
            <LangText
              es="La paleta parte de un **negro y blanco muy contrastado**, elegante y serio, y se rompe con un **azul** y un **rosa** vibrantes que aparecen en los puntos clave —el escáner, los botones, la interfaz—, dándole ese punto de energía que el negro y blanco solos no tienen."
              en="The palette starts from **high-contrast black and white**, elegant and serious, and is broken by a vivid **blue** and **pink** that show up at the key points — the scanner, the buttons, the interface — giving it the charge that black and white alone do not have."
            />
          </p>
        </div>
        <Paleta />
      </section>

      {/* ── Aplicaciones ───────────────────────────────────────────────── */}
      <section className="am-seccion">
        <RotuloSeccion es="Aplicaciones" en="Applications" />
        <div className="am-texto">
          <p>
            <LangText
              es="Toda esta identidad se traslada a los materiales que acompañan la exposición por la ciudad: **carteles con una retícula de seis por diez** que simulan el propio efecto de escaneo, y **flyers en A5 con un código QR** que lleva directo a la descarga de la app."
              en="The whole identity carries over to the materials that take the exhibition around the city: **posters on a six-by-ten grid** that mimic the scanning effect itself, and **A5 flyers with a QR code** that goes straight to the app download."
            />
          </p>
        </div>
        <p className="am-pendiente">
          <LangText
            es="Faltan los carteles y el flyer A5, a poder ser sobre soporte real (mupi, mano) como en las demás páginas."
            en="Missing: the posters and the A5 flyer, ideally on a real support (billboard, in hand) as on the other pages."
          />
        </p>
      </section>
    </ArteMiedo>
  );
}
