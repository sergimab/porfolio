"use client";

import { useEffect, useState } from "react";
import LangText from "@/components/shared/LangText";
import DropcapTitle from "@/components/shared/DropcapTitle";
import "./SobreMi.css";

// La imagen de «Sobre mí»: la foto en dos capas —el fondo y yo recortado— y,
// metidas entre las dos, unas figuras que se van turnando. Al ir en medio,
// aparecen por detrás de la figura y por delante de la calle, como si
// estuvieran pintadas en la pared. Y son más grandes que la foto: lo que
// sobresale se sale del cuadro, a la vista, en vez de cortarse en el borde.
//
// Se pintan todas a la vez y solo cambia cuál se ve: si se cambiara el `src` de
// una sola, la primera vuelta iría a tirones —cada archivo llegaría cuando le
// tocase— y habría un parpadeo en cada salto. Pesan menos de un kilobyte cada
// una, así que tenerlas todas puestas no cuesta nada.
// Las figuras, con la medida de su lienzo. Los anchos son muy distintos —la 6
// es dos veces más ancha que alta y la 10 es más alta que ancha—, así que
// igualarlas por el alto las dejaba desiguales: la ancha se comía la foto y las
// redondas parecían pequeñas.
//
// Lo que se iguala es el ÁREA, que es lo que el ojo mide cuando dice «grande» o
// «pequeña». De ahí sale el alto de cada una: cuanto más ancha es, más bajita
// se pone, y todas ocupan lo mismo en pantalla. El número de abajo es el mando
// del tamaño; cada figura lo reparte según su forma.
//
// La lista va escrita a mano y no contando del 1 al 10: falta la 4 —la azul y
// amarilla, descartada— y no tendría sentido renumerar el resto de archivos
// cada vez que caiga una.
//
// El ORDEN también es a mano, y es el de la rueda. La 6, la 7, la 8 y la 9 son
// elipses parecidas entre sí: seguidas se veían como la misma figura moviéndose
// un poco, así que van intercaladas entre las demás, nunca dos juntas.
//
// Y el color lo pone la página, no el archivo: son los siete de las cápsulas de
// categoría, repartidos de modo que dos seguidas nunca coincidan. Cada SVG entra
// como recorte —una máscara—, así que el dibujo pone la forma y aquí se pinta
// del color que toque, sea cual sea el que traiga dentro.
const FIGURAS = [
  { n: 6, w: 259.16, h: 122.53, color: "#d97706" }, // ámbar de Motion Graphics
  { n: 1, w: 128.29, h: 121.34, color: "#db2777" }, // rosa de Branding
  { n: 7, w: 215.59, h: 126.63, color: "#2563eb" }, // azul de Fotografía
  { n: 2, w: 114.79, h: 116.62, color: "#16a34a" }, // verde de Iberdrola
  { n: 8, w: 116.56, h: 121.17, color: "#0d9488" }, // turquesa de UI / UX
  { n: 3, w: 126.02, h: 123.43, color: "#7c3aed" }, // violeta de 3D
  { n: 9, w: 165.0, h: 114.01, color: "#68a50d" }, // verde lima de Editorial
  { n: 5, w: 115.66, h: 119.52, color: "#d97706" },
  { n: 10, w: 100.64, h: 116.13, color: "#2563eb" },
];

// Cuánto ocupan, en porcentaje del lado de la foto. Es la medida de una figura
// cuadrada; las demás salen de ahí. Pasado de 100, todas asoman un poco por
// fuera del cuadro.
const TAMANO = 104;

// Tope de ancho: 110 % del lado de la foto, que es lo que hay hasta la caja del
// texto —el lado más los 24 px del hueco—. Las dos o tres figuras muy
// apaisadas lo alcanzan antes de llegar a su tamaño, y se quedan ahí: se salen
// hasta el borde del hueco y ni un pelo más, que es donde empezarían a meterse
// por detrás del texto y a parecer cortadas. Se baja el alto con el ancho, no
// se aplasta.
const ANCHO_MAXIMO = 110;

// La forma media, que es la vara de medir: con ella, `TAMANO` es literalmente
// el lado de una figura cuadrada.
const media =
  FIGURAS.reduce((t, f) => t + Math.sqrt(f.h / f.w), 0) / FIGURAS.length;

const RECURSOS = FIGURAS.map((f) => {
  const porArea = (TAMANO * Math.sqrt(f.h / f.w)) / media;
  const porAncho = (ANCHO_MAXIMO * f.h) / f.w;
  return {
    id: f.n,
    alto: `${Math.min(porArea, porAncho).toFixed(1)}%`,
    proporcion: `${f.w} / ${f.h}`,
    color: f.color,
    recorte: `url(/sobre-mi/recursos/recurso-${f.n}.svg)`,
  };
});

// Lo que dura cada figura en pantalla. Es el número que hay que tocar para
// ajustar el ritmo.
const CADENCIA = 1000;

// El saludo, según la hora de QUIEN MIRA —su reloj, no el mío—. Los tramos son
// los de uso en español, que no coinciden con los ingleses: aquí la tarde
// empieza después de comer y la noche cuando se cena; allí la «afternoon» va del
// mediodía a las seis y luego es «evening».
//
// Sin el signo de apertura: la capitular es la primera letra y delante de ella
// no va nada, que es como está dibujado el título.
function saludo(hora: number) {
  if (hora >= 6 && hora < 14) return { es: "Buenos días!", en: "Good morning!" };
  if (hora >= 14 && hora < 21) return { es: "Buenas tardes!", en: "Good afternoon!" };
  return { es: "Buenas noches!", en: "Good evening!" };
}

export default function SobreMi() {
  const [actual, setActual] = useState(0);
  // La hora no se sabe hasta que la página está en el navegador: en el servidor
  // no hay reloj del visitante, y adivinarla allí daría un saludo que cambia
  // solo al cargar. Hasta entonces, el título va vacío pero ocupando su sitio,
  // así que no hay salto.
  const [hora, setHora] = useState<number | null>(null);
  // La rueda se puede parar: hay quien no quiere movimiento en pantalla
  // mientras lee, y el botón aparece al pasar por encima de la foto.
  const [pausado, setPausado] = useState(false);

  useEffect(() => setHora(new Date().getHours()), []);

  useEffect(() => {
    // Quien pide menos movimiento se queda con una sola figura, quieta. Un
    // parpadeo cada segundo es justo lo que molesta a quien lo pide.
    if (pausado) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setActual((i) => (i + 1) % RECURSOS.length), CADENCIA);
    return () => clearInterval(id);
  }, [pausado]);

  return (
    <div className="sobremi">
      <div className="sobremi-foto">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="sobremi-capa es-fondo" src="/sobre-mi/fondo.webp" alt="" />
        {RECURSOS.map((r, i) => (
          <span
            key={r.id}
            className={`sobremi-capa es-recurso${i === actual ? " es-visible" : ""}`}
            style={{
              height: r.alto,
              aspectRatio: r.proporcion,
              background: r.color,
              WebkitMaskImage: r.recorte,
              maskImage: r.recorte,
            }}
            aria-hidden="true"
          />
        ))}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="sobremi-capa es-figura"
          src="/sobre-mi/figura.webp"
          alt="Sergio, de calle, con cascos y gafas de sol"
        />

        {/* El botón asoma al pasar por encima de la foto, y se queda a la vista
            mientras está parada, que si no no habría manera de volver a
            arrancarla. */}
        <button
          type="button"
          className={`sobremi-pausa${pausado ? " es-pausado" : ""}`}
          onClick={() => setPausado((p) => !p)}
          aria-pressed={pausado}
          aria-label={pausado ? "Reanudar las figuras" : "Parar las figuras"}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            {pausado ? (
              <path d="M9 6.5 L18 12 L9 17.5 Z" fill="currentColor" />
            ) : (
              <>
                <rect x="8.5" y="7" width="2.5" height="10" fill="currentColor" />
                <rect x="13" y="7" width="2.5" height="10" fill="currentColor" />
              </>
            )}
          </svg>
        </button>
      </div>

      <div className="sobremi-texto">
        {/* El marco, dibujado y no como borde del CSS: un borde discontinuo no
            se puede poner en marcha —los guiones son del navegador y no hay
            manera de correrlos—, mientras que el trazo de un SVG sí, moviendo
            su desfase. Va detrás del texto y no recibe pulsaciones. */}
        <svg className="sobremi-marco" aria-hidden="true" focusable="false">
          <rect x="0.5" y="0.5" rx="15.5" ry="15.5" />
        </svg>

        {/* El texto va en su propia caja, por dentro del marco: es la que rueda,
            y así la barra de desplazamiento queda DENTRO del recuadro en vez de
            montarse sobre el hilo. */}
        {/* La barra de desplazamiento toma el color de la figura que se esté
            viendo en ese momento: se lo pasamos como variable y el CSS la pinta
            con ella. */}
        <div
          className="sobremi-scroll"
          style={{ ["--sm-barra" as string]: RECURSOS[actual].color }}
        >
        {/* Con la capitular script, como los demás títulos del sitio. */}
        <h2 className="sobremi-titulo">
          {hora === null ? null : (
            <DropcapTitle es={saludo(hora).es} en={saludo(hora).en} />
          )}
        </h2>
        <p>
          <LangText
            es="Soy **Sergio Martín Barahona**, diseñador gráfico formado en la Escuela Superior de Diseño en Madrid (ESD Madrid)."
            en="I'm **Sergio Martín Barahona**, a graphic designer trained at the Escuela Superior de Diseño in Madrid (ESD Madrid)."
          />
        </p>
        <p>
          <LangText
            es="Desde muy joven, mientras en clase me explicaban el origen de la vida o el verbo «to be», yo iba por otro lado. Me preguntaba quién habría diseñado la portada de aquel workbook, quién habría elegido esa tipografía tan fea del cartel de la sala de profesores, o por qué el cartón de leche del desayuno tenía ese logo y no otro. Años después descubrí que comunicar de forma visual tenía un nombre, y ese nombre era **diseño gráfico**."
            en="From early on, while class was busy explaining the origin of life or the verb “to be”, my head was somewhere else. I wondered who had designed the cover of that workbook, who had picked the ugly typeface on the staff-room notice, or why the breakfast milk carton carried that logo and not another. Years later I found out that communicating visually had a name, and that name was **graphic design**."
          />
        </p>
        <p>
          <LangText
            es="Lo que empezó como un entretenimiento y algún favor a amigos y familiares terminó convirtiéndose en mi profesión. Hoy trabajo creando contenido para particulares y empresas como **Iberdrola**, donde llevo los dos últimos años aprendiendo de todo, desde edición y motion hasta diseño de producto. Photoshop, Illustrator e InDesign para lo editorial, After Effects para dar movimiento, Figma para diseño de producto y Blender para todo lo que necesita una tercera dimensión, son las herramientas con las que trabajo casi a diario."
            en="What started as a pastime and the odd favour for friends and family ended up becoming my profession. Today I make content for individuals and for companies like **Iberdrola**, where I've spent the last two years learning a bit of everything, from editing and motion to product design. Photoshop, Illustrator and InDesign for editorial work, After Effects to set things moving, Figma for product design and Blender for anything that needs a third dimension: those are the tools I work with almost every day."
          />
        </p>
        <p>
          <LangText
            es="Aunque el diseño gráfico en general me apasiona, lo que más me engancha es darle vida a piezas que ya existen, el motion, el diseño de producto como mi propio portfolio, y encontrar la forma más clara, accesible y atractiva de comunicar algo."
            en="Graphic design as a whole is what I love, but what hooks me most is bringing existing pieces to life: motion, product design —this very portfolio, for instance— and finding the clearest, most accessible and most appealing way to say something."
          />
        </p>
        <p>
          <LangText
            es="Me queda muchísimo por aprender de un oficio que no para de reinventarse, y ahí sumo la **IA** como una herramienta más en la caja, no para que piense por mí, sino para moverme más rápido mientras sigo siendo yo quien decide hacia dónde va cada proyecto."
            en="There's a huge amount left to learn in a craft that keeps reinventing itself, and there I count **AI** as one more tool in the box —not to think for me, but to move faster while I'm still the one deciding where each project goes."
          />
        </p>
        <p>
          <LangText
            es="Y si después de leer todo esto piensas que encajamos, el botón de **«Contacto»** de arriba está esperando a que le des al clic."
            en="And if after reading all this you think we'd get on, the **“Contact”** button up top is waiting for you to click it."
          />
        </p>
        </div>
      </div>
    </div>
  );
}
