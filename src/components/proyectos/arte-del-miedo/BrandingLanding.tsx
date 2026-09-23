import { existsSync } from "node:fs";
import { join } from "node:path";
import ArteMiedo from "./ArteMiedo";
// De la carpeta de Yelmo: es el mismo trato para una pieza muda en bucle, así
// que no hay por qué tener dos componentes iguales. Aquí ya no abre la página
// —esa cabecera se ha ido a motion, que es donde la animación es el trabajo y
// no el escaparate— pero sigue haciendo falta para el recorrido por la sala.
import VideoMarca from "../yelmo/VideoMarca";
import RotuloSeccion from "@/components/shared/RotuloSeccion";
import LangText from "@/components/shared/LangText";
import DropcapTitle from "@/components/shared/DropcapTitle";
import Recomendados from "@/components/shared/Recomendados";
import Tipografia from "./Tipografia";
import Paleta from "./Paleta";
import Isotipo from "./Isotipo";
import Pruebas from "./Pruebas";
import Carteles from "./Carteles";
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
          {/* Las pruebas van primero y el definitivo después: se lee de
              izquierda a derecha, así que ese orden cuenta el proceso en el
              sentido en que ocurrió —se buscó, y se llegó—. Al revés parecía que
              el bueno se degradaba en seis intentos. */}
          <figure className="es-prueba">
            <Pruebas />
            <figcaption>
              <LangText es="Pruebas" en="Trials" />
            </figcaption>
          </figure>
          <figure className="es-final">
            <Isotipo conRejilla />
            <figcaption>
              <LangText es="Final" en="Final" />
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
        {/* Sin texto: la lámina ya lleva escrito el nombre de la fuente y las
            razones de por qué esta. */}
        <Tipografia />
      </section>

      {/* ── Paleta de color ────────────────────────────────────────────── */}
      <section className="am-seccion">
        <RotuloSeccion es="Paleta de color" en="Colour palette" />
        {/* Sin texto: los colores se ven, y cada muestra lleva su valor
            escrito. */}
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
        <Carteles />

        {/* El recorrido por la sala y, a su lado, el flyer. Mismo truco que la
            fila de arriba: el vídeo es cuadrado y el mockup 3:2, así que con un
            reparto de 1 contra 1,5 los dos acaban con el mismo alto. */}
        <div className="am-flyers">
          <div className="am-flyers-video">
            <VideoMarca
              src="/proyectos/el-arte-del-miedo-branding/sala-expo.mp4"
              proporcion="1 / 1"
              fondo="#12121c"
              alt="Recorrido por la sala de la exposición, con las obras iluminadas y sin cartelas"
            />
          </div>
          <figure className="am-flyers-mockup">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/proyectos/el-arte-del-miedo-branding/flyer-mockup.webp"
              alt="El flyer A5 de la exposición, con el código QR que lleva a la app"
            />
          </figure>
        </div>
      </section>

      {/* ── El pie de página ───────────────────────────────────────────── */}
      {/* La página acaba mandando a la app, y no es un enlace de cortesía: toda
          esta identidad existe para que funcione el escaneo, así que lo que
          viene después de los carteles y del flyer —que llevan un QR pintado—
          es justamente eso, la pantalla a la que lleva el QR.
          El título va con la capitular y no con el rótulo-pastilla: los rótulos
          son de los apartados del proyecto, y esto no es un apartado más, es la
          salida. Igual que en Yelmo y en Espacio vacío. */}
      <section className="am-seccion">
        <Recomendados ids={["u3", "b1", "b2", "b4"]} />
      </section>
    </ArteMiedo>
  );
}
