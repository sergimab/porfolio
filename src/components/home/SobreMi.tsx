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
const FIGURAS = [
  { n: 1, w: 128.29, h: 121.34 },
  { n: 2, w: 114.79, h: 116.62 },
  { n: 3, w: 126.02, h: 123.43 },
  { n: 5, w: 115.66, h: 119.52 },
  { n: 6, w: 259.16, h: 122.53 },
  { n: 7, w: 215.59, h: 126.63 },
  { n: 8, w: 116.56, h: 121.17 },
  { n: 9, w: 165.0, h: 114.01 },
  { n: 10, w: 100.64, h: 116.13 },
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
    src: `/sobre-mi/recursos/recurso-${f.n}.svg`,
    alto: `${Math.min(porArea, porAncho).toFixed(1)}%`,
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

  useEffect(() => setHora(new Date().getHours()), []);

  useEffect(() => {
    // Quien pide menos movimiento se queda con una sola figura, quieta. Un
    // parpadeo cada segundo es justo lo que molesta a quien lo pide.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setActual((i) => (i + 1) % RECURSOS.length), CADENCIA);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="sobremi">
      <div className="sobremi-foto">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="sobremi-capa es-fondo" src="/sobre-mi/fondo.webp" alt="" />
        {RECURSOS.map((r, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={r.src}
            className={`sobremi-capa es-recurso${i === actual ? " es-visible" : ""}`}
            src={r.src}
            style={{ height: r.alto }}
            alt=""
            aria-hidden="true"
          />
        ))}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="sobremi-capa es-figura"
          src="/sobre-mi/figura.webp"
          alt="Sergio, de calle, con cascos y gafas de sol"
        />
      </div>

      <div className="sobremi-texto">
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
      </div>
    </div>
  );
}
