"use client";

import { useEffect, useState } from "react";
import LangText from "@/components/shared/LangText";
import "./SobreMi.css";

// La imagen de «Sobre mí»: la foto en dos capas —el fondo y yo recortado— y,
// metidas entre las dos, unas figuras que se van turnando. Al ir en medio,
// aparecen por detrás de la figura y por delante de la calle, como si
// estuvieran pintadas en la pared.
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
// cuadrada; las demás salen de ahí.
const TAMANO = 56;

const media =
  FIGURAS.reduce((t, f) => t + Math.sqrt(f.h / f.w), 0) / FIGURAS.length;

const RECURSOS = FIGURAS.map((f) => ({
  src: `/sobre-mi/recursos/recurso-${f.n}.svg`,
  alto: `${((TAMANO * Math.sqrt(f.h / f.w)) / media).toFixed(1)}%`,
}));

// Lo que dura cada figura en pantalla. Es el número que hay que tocar para
// ajustar el ritmo.
const CADENCIA = 1000;

export default function SobreMi() {
  const [actual, setActual] = useState(0);

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
        <h2 className="sobremi-titulo">
          <LangText es="Hola, soy Sergio" en="Hi, I'm Sergio" />
        </h2>
        {/* TEXTO DE EJEMPLO, para ver la caja con algo dentro. Se cambia por el
            de verdad en cuanto esté escrito. */}
        <p>
          <LangText
            es="Soy **diseñador gráfico**, y lo que más me gusta es la parte en la que una marca deja de ser un logotipo y empieza a ser una manera de hablar: el color, el ritmo, cómo se mueve."
            en="I'm a **graphic designer**, and my favourite part is when a brand stops being a logo and starts being a way of speaking: the colour, the rhythm, the way it moves."
          />
        </p>
        <p>
          <LangText
            es="Me formé en la **ESD Madrid** y desde entonces he andado entre el branding, la animación y el diseño de producto, que para mí son el mismo oficio mirado desde tres sitios."
            en="I trained at **ESD Madrid** and since then I've moved between branding, motion and product design, which to me are the same craft seen from three places."
          />
        </p>
        <p>
          <LangText
            es="Fuera de la pantalla: música todo el rato, caminar por Madrid sin destino y una colección de camisetas que ya no cabe en el armario."
            en="Away from the screen: music non-stop, walking around Madrid with no destination, and a T-shirt collection that no longer fits in the wardrobe."
          />
        </p>
      </div>
    </div>
  );
}
