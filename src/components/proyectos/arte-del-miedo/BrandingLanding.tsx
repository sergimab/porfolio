import ArteMiedo from "./ArteMiedo";
import RotuloSeccion from "@/components/shared/RotuloSeccion";
import LangText from "@/components/shared/LangText";
import Tipografia from "./Tipografia";
import Paleta from "./Paleta";
import Isotipo from "./Isotipo";
import Pruebas from "./Pruebas";
import "./ArteMiedo.css";

// La pata de branding del proyecto: de dónde sale el nombre, de dónde sale el
// isotipo, con qué letra y con qué colores se escribe, y en qué acaba todo eso
// cuando sale a la calle.
//
// El orden es el del propio trabajo —primero se llama, después se dibuja,
// después se viste y por último se aplica—, así que se lee igual de bien de
// arriba abajo que saltando a la sección que interese.
//
// Las cajas de puntos que hay bajo cada sección marcan las piezas que todavía
// no han llegado. Están a la vista a propósito: un hueco invisible se olvida.
export default function BrandingLanding() {
  return (
    <ArteMiedo disciplina="branding">
      {/* ── El nombre ──────────────────────────────────────────────────── */}
      <section className="am-seccion">
        <RotuloSeccion es="El nombre" en="The name" />
        <div className="am-texto">
          <p>
            <LangText
              es="Antes de llegar a «El Arte del Miedo» hubo varias vueltas: **Reflejos del Miedo**, **Entre Pinceles y Fobia**, **El Lienzo del Miedo**. Me quedé con este porque junta los dos conceptos del proyecto de la forma más directa posible: se lee fácil, se recuerda fácil, y **cobra todo su sentido en el momento en que estás dentro de la sala**."
              en="Before landing on «El Arte del Miedo» there were a few goes at it: **Reflejos del Miedo**, **Entre Pinceles y Fobia**, **El Lienzo del Miedo**. I kept this one because it joins the project's two ideas in the most direct way possible: it reads easily, it sticks, and **it only makes full sense once you are inside the room**."
            />
          </p>
        </div>
        <p className="am-pendiente">
          <LangText
            es="Falta la lámina del nombre: el logotipo acabado y, si las tienes, las pruebas descartadas."
            en="Missing: the name plate — the finished logotype and, if you have them, the discarded attempts."
          />
        </p>
      </section>

      {/* ── El icono ───────────────────────────────────────────────────── */}
      <section className="am-seccion">
        <RotuloSeccion es="El icono" en="The icon" />
        <div className="am-texto">
          <p>
            <LangText
              es="El isotipo nace de una **cuadrícula de seis por siete cuadrados**, huyendo a propósito de la simetría típica de un logo. Esa base de cuadrados no es casualidad: viene directamente de la **textura de mosaico que después define el escáner de la app**, así que la marca y la tecnología hablan el mismo idioma desde el principio."
              en="The icon comes out of a **six-by-seven grid of squares**, deliberately avoiding the symmetry a logo usually falls into. That grid is no accident: it comes straight from the **mosaic texture that later defines the app's scanner**, so brand and technology speak the same language from the start."
            />
          </p>
          <p>
            <LangText
              es="Después de varias pruebas, la forma que salió de esa cuadrícula terminó pareciéndose a una **neurona**, o a la **psique** misma, que es justo de lo que va todo esto."
              en="After a few passes, the shape that came out of that grid ended up looking like a **neuron**, or like the **psyche** itself, which is exactly what all of this is about."
            />
          </p>
        </div>
        {/* El isotipo sobre su cuadrícula —es de lo que habla el texto, así que
            se enseñan la figura Y las líneas de las que sale— y, al lado, las
            pruebas que se quedaron por el camino pasando en bucle. */}
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

        <p className="am-pendiente">
          <LangText
            es="Falta el logotipo completo —«El Arte del Miedo · Exposición»—, que va justo aquí debajo de las dos cuadrículas. En cuanto esté el archivo en public/proyectos/el-arte-del-miedo-branding/, se coloca."
            en="Missing: the full logotype — «El Arte del Miedo · Exposición» — which goes right here, under the two grids. As soon as the file is in public/proyectos/el-arte-del-miedo-branding/, it goes in."
          />
        </p>
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
