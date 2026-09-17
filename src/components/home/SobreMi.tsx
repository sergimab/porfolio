"use client";

import { useEffect, useState } from "react";
import LangText from "@/components/shared/LangText";
import "./SobreMi.css";

// La imagen de «Sobre mí»: la foto en dos capas —el fondo y yo recortado— y,
// metidas entre las dos, unas figuras que se van turnando. Al ir en medio,
// aparecen por detrás de la figura y por delante de la calle, como si
// estuvieran pintadas en la pared.
//
// Las diez figuras se pintan todas a la vez y solo cambia cuál se ve: si se
// cambiara el `src` de una sola, la primera vuelta iría a tirones —cada archivo
// llegaría cuando le tocase— y habría un parpadeo en cada salto. Pesan menos de
// un kilobyte cada una, así que tenerlas las diez puestas no cuesta nada.
const RECURSOS = Array.from({ length: 10 }, (_, i) => `/sobre-mi/recursos/recurso-${i + 1}.svg`);

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
        {RECURSOS.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src}
            className={`sobremi-capa es-recurso${i === actual ? " es-visible" : ""}`}
            src={src}
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
