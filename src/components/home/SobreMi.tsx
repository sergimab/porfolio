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
function saludo(hora: number) {
  if (hora >= 6 && hora < 14) return { es: "¡Buenos días!", en: "Good morning!" };
  if (hora >= 14 && hora < 21) return { es: "¡Buenas tardes!", en: "Good afternoon!" };
  return { es: "¡Buenas noches!", en: "Good evening!" };
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
            es="Soy **Sergio Martín**, diseñador gráfico formado en la **ESD Madrid**, y lo que me engancha del oficio es el momento en que una marca deja de ser un logotipo y empieza a ser una manera de hablar: el color, el ritmo, el tono, cómo se mueve."
            en="I'm **Sergio Martín**, a graphic designer trained at **ESD Madrid**, and what hooks me about this craft is the moment a brand stops being a logo and starts being a way of speaking: the colour, the rhythm, the tone, the way it moves."
          />
        </p>
        <p>
          <LangText
            es="He trabajado en el universo gráfico de **Iberdrola**, donde me tocó lo que más me gusta: pensar en **sistemas** y no en piezas sueltas. Un sistema de ilustraciones, una iconografía, infografías que explican en un vistazo cosas que no caben en un párrafo, y newsletters que tenían que sonar a la misma voz número tras número. Ahí aprendí que un buen diseño no es el que sorprende una vez, sino el que **aguanta repetido**."
            en="I've worked inside **Iberdrola**'s graphic universe, on exactly the part I like most: thinking in **systems** rather than one-off pieces. An illustration system, an icon set, infographics that explain at a glance what wouldn't fit in a paragraph, and newsletters that had to sound like the same voice issue after issue. That's where I learnt that good design isn't what surprises you once, but what **holds up repeated**."
          />
        </p>
        <p>
          <LangText
            es="En paralelo he llevado proyectos de marca de principio a fin. El **rebranding de Yelmo Cines** lo resolví en tres frentes a la vez —identidad, animación y prototipado web—, y fue la mejor manera de comprobar algo que ya sospechaba: **branding, motion y producto son el mismo oficio mirado desde tres sitios**. Una marca que no sabes cómo se mueve ni cómo se usa está a medio terminar."
            en="Alongside that I've run brand projects end to end. I solved the **Yelmo Cines rebrand** on three fronts at once —identity, motion and web prototyping— and it confirmed something I already suspected: **branding, motion and product are the same craft seen from three places**. A brand you can't move or use is only half finished."
          />
        </p>
        <p>
          <LangText
            es="Me interesa la tipografía cuando se pone seria, el color cuando tiene un motivo, y **el punto donde el diseño toca el código**: esta misma web la he diseñado y programado yo, y he acabado disfrutando tanto del CSS como del Illustrator."
            en="I'm drawn to type when it gets serious, to colour when it has a reason, and to **the place where design meets code**: I designed and built this site myself, and I've ended up enjoying CSS as much as Illustrator."
          />
        </p>
        <p>
          <LangText
            es="Ahora busco **proyectos nuevos y gente de la que aprender**. Me da igual que el encargo sea una marca entera o una pieza pequeña: si hay algo que resolver y alguien con quien discutirlo, me apunto. Si estás leyendo esto y tienes algo entre manos, **escríbeme** —está aquí al lado, en Contacto—."
            en="Right now I'm looking for **new projects and people to learn from**. Whether the job is a whole brand or one small piece doesn't matter: if there's something to solve and someone to argue it out with, I'm in. If you're reading this and you've got something brewing, **drop me a line** —it's right next door, under Contact—."
          />
        </p>
      </div>
    </div>
  );
}
