"use client";

import { useEffect, useRef, useState } from "react";
import LangText from "@/components/shared/LangText";
import { useLang } from "@/components/shared/useLang";
import "./SimboloScroll.css";

// Cómo nace cada símbolo, contado en tres pasos.
//
// El bloque se queda fijo en pantalla mientras se recorre una pista alta, y lo
// que cambia es el contenido de las dos columnas. Todo se calcula a partir de
// un único número —el avance dentro de la pista—, así que subir deshace el
// recorrido sin necesidad de recordar por qué paso se iba.
//
// No hace falta GSAP ni ScrollTrigger: la posición de la pista respecto a la
// ventana ya da ese número, y se lee una vez por fotograma.

const PASOS = 3;
const ALTURA_PISTA = 300; // en vh: cuánto scroll dura cada paso (100 por paso)
const SOLAPE = 0.35;      // parte del paso que dura el fundido entre uno y otro

const limitar = (v: number) => Math.min(1, Math.max(0, v));
const suave = (t: number) => t * t * (3 - 2 * t);

// Porcentaje de cada álbum en el ejemplo, ya ordenado de mayor a menor: es el
// orden en el que la línea del gráfico va saltando de punta a punta.
const ALBUMES: [string, number][] = [
  ["Chromatica", 90],
  ["Born This Way", 70],
  ["ARTPOP", 60],
  ["Mayhem", 50],
  ["The Fame", 35],
  ["Joanne", 25],
  ["The Fame Monster", 20],
];

const TEXTOS = [
  {
    es: "Cada símbolo de Elysium no lo diseñé yo solo. Nace de una pregunta muy simple. ¿Qué canciones de toda la discografía de Lady Gaga te representan? La respuesta que da cada persona se transforma en una figura completamente propia, generada a partir de sus propios gustos.\n\nTodo parte de un gráfico circular con siete puntas, una por cada álbum de la discografía. Cuantas más canciones eliges de un disco, más se estira la figura hacia esa punta.",
    en: "I didn't design each Elysium symbol on my own. It starts from a very simple question. Which songs from Lady Gaga's whole discography represent you? Each person's answer becomes a figure entirely their own, generated from their own taste.\n\nIt all starts with a circular chart with seven points, one per album in the discography. The more songs you pick from a record, the further the figure stretches towards that point.",
  },
  {
    es: "Con esos datos, el sistema traza una línea. Empieza en el centro, en el cero, y viaja primero hacia el álbum con el porcentaje más alto. De ahí salta al siguiente y al siguiente, uniendo cada punta según cuánto pesa cada disco, hasta que la línea vuelve a cerrarse sobre el punto de partida y ahí nace la figura.",
    en: "With that data, the system draws a line. It starts at the centre, at zero, and travels first to the album with the highest percentage. From there it jumps to the next, and the next, joining each point according to how much each record weighs, until the line closes back on its starting point — and there the figure is born.",
  },
  {
    es: "Como Lady Gaga nunca llegó a responder el cuestionario de verdad, me imaginé qué símbolo se habría generado ella misma si lo hubiese hecho, y ese es el que ves aquí, el icono central de todo el álbum.",
    en: "Since Lady Gaga never actually answered the questionnaire, I imagined what symbol she would have generated herself if she had — and that's the one you see here, the central icon of the whole album.",
  },
];

export default function SimboloScroll() {
  const lang = useLang();
  const pista = useRef<HTMLDivElement>(null);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const [avance, setAvance] = useState(0);

  useEffect(() => {
    // Con "reducir movimiento" no se anima: se deja el último paso a la vista.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setAvance(1);
      return;
    }
    let pendiente = false;
    const calcular = () => {
      pendiente = false;
      const el = pista.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const recorrido = r.height - window.innerHeight;
      setAvance(recorrido > 0 ? limitar(-r.top / recorrido) : 0);
    };
    const alScroll = () => {
      if (pendiente) return;
      pendiente = true;
      requestAnimationFrame(calcular);
    };
    calcular();
    window.addEventListener("scroll", alScroll, { passive: true });
    window.addEventListener("resize", alScroll);
    return () => {
      window.removeEventListener("scroll", alScroll);
      window.removeEventListener("resize", alScroll);
    };
  }, []);

  // Avance repartido entre los pasos: 0 al empezar el primero, 3 al acabar el
  // último. Cada paso se funde con el siguiente en las zonas de solape.
  const t = avance * PASOS;
  const pasoActivo = Math.max(0, Math.min(PASOS - 1, Math.floor(t)));

  // Los vídeos no van en bucle: se reproducen una vez al entrar en su paso y
  // se quedan en el último fotograma. Al volver a entrar, empiezan de nuevo.
  // A los demás no se les toca: si se pausaran al salir del paso, se
  // quedarían congelados a media reproducción en vez de en su final.
  useEffect(() => {
    const v = videos.current[pasoActivo];
    if (!v) return;
    v.currentTime = 0;
    v.play().catch(() => {});
  }, [pasoActivo]);
  const estado = (i: number) => {
    const entra = (t - i + SOLAPE) / SOLAPE;
    const sale = (i + 1 + SOLAPE - t) / SOLAPE;
    const op = suave(limitar(Math.min(entra, sale)));
    // Pequeño desplazamiento vertical acompañando al fundido: entra desde
    // abajo y sale hacia arriba.
    const y = limitar(Math.abs(t - (i + 0.5))) * (t < i + 0.5 ? 22 : -22);
    return { opacity: op, transform: `translateY(${y.toFixed(1)}px)`, visibility: op < 0.01 ? ("hidden" as const) : ("visible" as const) };
  };

  // Avance dentro de un paso concreto (0 al entrar, 1 al salir).
  const dentroDe = (i: number) => limitar(t - i);

  const video = (i: number, src: string, alt: string) => (
    <div className="simbolo-media">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={(el) => {
          videos.current[i] = el;
        }}
        src={src}
        muted
        playsInline
        preload="auto"
        aria-label={alt}
      />
    </div>
  );

  return (
    <section className="simbolo-pista" ref={pista} style={{ height: `${ALTURA_PISTA}vh` }}>
      <div className="simbolo-sticky">
        <div className="simbolo-rejilla">
          {/* Columna de texto */}
          <div className="simbolo-textos">
            {TEXTOS.map((texto, i) => (
              <div className="simbolo-capa" key={i} style={estado(i)}>
                <div className="simbolo-texto">
                  {(lang === "en" ? texto.en : texto.es).split("\n\n").map((parrafo, j) => (
                    <p key={j}>{parrafo}</p>
                  ))}
                </div>

                {/* La tabla acompaña al texto, no al vídeo: el segundo vídeo es
                    la continuación del primero y tiene que quedarse en su
                    misma posición y tamaño. */}
                {i === 1 && (
                  <table className="simbolo-tabla">
                    <thead>
                      <tr>
                        <th scope="col">
                          <LangText es="Álbum" en="Album" />
                        </th>
                        <th scope="col">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ALBUMES.map(([album, pct]) => (
                        <tr key={album}>
                          <td>{album}</td>
                          <td>{pct}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ))}
          </div>

          {/* Columna visual */}
          <div className="simbolo-visuales">
            <div className="simbolo-capa" style={estado(0)}>
              {video(0, "/proyectos/elysium/grafico-radial.mp4", "Formación del gráfico radial")}
            </div>

            <div className="simbolo-capa" style={estado(1)}>
              {video(1, "/proyectos/elysium/simbolo-formacion.mp4", "Formación del símbolo")}
            </div>

            <div className="simbolo-capa" style={estado(2)}>
              <div className="simbolo-media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/proyectos/elysium/icono-render.webp"
                  alt="El icono del álbum, renderizado con su textura metálica"
                  loading="lazy"
                  // El icono entra creciendo conforme se avanza por su paso.
                  style={{ transform: `scale(${(0.72 + 0.28 * suave(dentroDe(2))).toFixed(3)})` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Galería de los símbolos generados con datos de fans reales. Va después del
// bloque fijo, ya con scroll normal.
export function GaleriaSimbolos({ iconos }: { iconos: string[] }) {
  if (!iconos.length) return null;
  return (
    <section className="simbolo-galeria">
      <p className="simbolo-texto simbolo-titular">
        <LangText
          es="Aquí no hay dos símbolos iguales. Son docenas de combinaciones distintas y todas nacen exactamente del mismo sistema de reglas."
          en="No two symbols here are alike. Dozens of different combinations, and every one of them comes out of exactly the same set of rules."
        />
      </p>
      <div className="simbolo-tira">
        {iconos.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={src} src={src} alt={`Símbolo generado a partir de las respuestas de un fan (${i + 1})`} loading="lazy" />
        ))}
      </div>
    </section>
  );
}
