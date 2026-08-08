"use client";

import { useEffect, useRef, useState } from "react";
import "./PosesFusion.css";

// Secuencia de la figura, gobernada por el scroll: el bloque se queda pegado
// en pantalla mientras se recorre una "pista" y la animación avanza con el
// desplazamiento. Al subir se deshace sola, porque todo se calcula a partir de
// un único número (el progreso) y no de estados que haya que recordar.
//
//   0,00 → 0,45   las tres poses, repartidas a lo ancho y solapadas entre sí,
//                 se juntan en una sola figura, quedando encima la pose 1
//   0,45 → 0,72   se relevan por la figura acabada, que aparece con su pareja
//                 a la derecha (debajo en móvil)
//   0,72 → 1,00   las dos piezas se relevan por las portadas
//
// Las poses van desde el principio al mismo tamaño que tendrán al final, así
// que no hay ningún cambio de escala: solo se desplazan y se funden.
//
// Las medidas van en píxeles a partir del ancho real del contenedor: así los
// desplazamientos son exactos en cualquier pantalla.

const POSES = [1, 2, 3];
const HUECO = 24;         // separación entre piezas
const ALTURA_PISTA = 420; // en vh: cuánto scroll dura toda la secuencia

// Las tres poses son de cuerpo entero y la figura final es un plano más
// cercano (corta por encima de las rodillas). Para que el relevo parezca un
// solo movimiento de cámara, las poses se acercan hasta que su cabeza coincide
// en tamaño y posición con la de la figura final. Medido sobre las propias
// imágenes, en proporción a su lado para no depender de la resolución:
const CABEZA_POSE = { x: 444 / 900, y: 198 / 900, ancho: 71 / 900 };
const CABEZA_FINAL = { x: 491 / 1000, y: 364 / 1000, ancho: 113 / 1000 };

const limitar = (v: number) => Math.min(1, Math.max(0, v));
// Progreso por tramos: 0 antes del tramo, 1 después, y el avance suavizado en
// los extremos mientras se está dentro.
const tramo = (p: number, desde: number, hasta: number) => {
  const t = limitar((p - desde) / (hasta - desde));
  return t * t * (3 - 2 * t);
};
const mezclar = (a: number, b: number, t: number) => a + (b - a) * t;

export default function PosesFusion({
  imagenFinal,
  imagenPareja,
  relevoIzquierda,
  relevoDerecha,
}: {
  imagenFinal?: string | null;
  /** Pieza que acompaña a la figura final, a su derecha (debajo en móvil). */
  imagenPareja?: string | null;
  /** Portadas que sustituyen a las dos piezas anteriores, ya al final. */
  relevoIzquierda?: string | null;
  relevoDerecha?: string | null;
}) {
  const pista = useRef<HTMLDivElement>(null);
  const caja = useRef<HTMLDivElement>(null);
  const [progreso, setProgreso] = useState(0);
  const [ancho, setAncho] = useState(0);
  const [vertical, setVertical] = useState(false);

  useEffect(() => {
    const el = caja.current;
    if (!el) return;
    const medir = () => {
      setVertical(window.innerWidth <= 700);
      setAncho(el.clientWidth);
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    // Con "reducir movimiento" se muestra directamente el resultado final.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setProgreso(1);
      return;
    }

    let pendiente = false;
    const calcular = () => {
      pendiente = false;
      const el = pista.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const recorrido = r.height - window.innerHeight;
      setProgreso(recorrido > 0 ? limitar(-r.top / recorrido) : 0);
    };
    // El scroll dispara muchos eventos seguidos; basta con recalcular una vez
    // por fotograma.
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

  // La figura final ocupa media pantalla (todo el ancho en móvil), para que a
  // su lado quepa la pieza que la acompaña.
  const ladoFinal = vertical ? ancho : (ancho - HUECO) / 2;
  // Las poses son de cuerpo entero y la figura final es un plano más cercano.
  // Para que el cuerpo se vea del mismo tamaño en ambas, el lienzo de las poses
  // tiene que ser mayor en esa misma proporción (la de sus cabezas).
  const lado = ladoFinal * (CABEZA_FINAL.ancho / CABEZA_POSE.ancho);

  // Posición final de las poses: la que hace coincidir su cabeza con la de la
  // figura acabada. Es fija, porque ya no hay cambio de escala.
  const destino = {
    x: CABEZA_FINAL.x * ladoFinal - CABEZA_POSE.x * lado,
    y: CABEZA_FINAL.y * ladoFinal - CABEZA_POSE.y * lado,
  };
  // Reparto inicial: las tres se separan hasta ocupar todo el ancho. Como cada
  // figura solo ocupa la franja central de su lienzo (del 27% al 73%), pueden
  // solaparse de lienzo sin tocarse de cuerpo. La separación se calcula sobre
  // los cuerpos, no sobre los lienzos: el primero pegado al margen izquierdo y
  // el tercero al derecho.
  const CUERPO = { izq: 0.266, der: 0.727 };
  const cuerpoAncho = (CUERPO.der - CUERPO.izq) * lado;
  const separacion = ancho > 0 ? (ancho - cuerpoAncho) / 2 : 0;
  // Desplazamiento del lienzo para que el cuerpo de la primera empiece en el
  // borde izquierdo del contenido.
  const margenCuerpo = -CUERPO.izq * lado;

  const juntar = tramo(progreso, 0, 0.45);
  const relevoFigura = tramo(progreso, 0.45, 0.72);
  // La pareja entra algo más tarde que la figura, y las portadas se relevan
  // una detrás de otra.
  const pareja = tramo(progreso, 0.55, 0.75);
  const relevo = tramo(progreso, 0.72, 0.92);
  const relevo2 = tramo(progreso, 0.78, 1);

  const altoFinal = vertical && imagenPareja ? ladoFinal * 2 + HUECO : ladoFinal;
  const alto = mezclar(lado, altoFinal, relevoFigura);

  return (
    <div ref={pista} className="poses-pista" style={{ height: `${ALTURA_PISTA}vh` }}>
      <div className="poses-sticky">
        <div ref={caja} className="poses-fusion" style={{ height: alto || undefined }}>
          {POSES.map((n, i) => (
            <div
              className="poses-fusion-item"
              key={n}
              style={{
                // Capas invertidas: la pose 3 al fondo y la 1 arriba del todo.
                zIndex: 4 - n,
                width: lado || undefined,
                height: lado || undefined,
                opacity: 1 - relevoFigura,
                transform:
                  `translateX(${mezclar(margenCuerpo + i * separacion, destino.x, juntar)}px) ` +
                  `translateY(${destino.y}px)`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/proyectos/elysium/pose-${n}.webp`}
                alt={`Pose ${n} de la figura de Elysium`}
                loading="lazy"
              />
            </div>
          ))}

          {imagenFinal && (
            <div
              className="poses-fusion-final"
              style={{
                width: ladoFinal || undefined,
                height: ladoFinal || undefined,
                opacity: relevoFigura,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagenFinal}
                alt="La figura final de Elysium, rodeada de sus símbolos"
                loading="lazy"
              />
              {relevoIzquierda && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="poses-fusion-relevo"
                  style={{ opacity: relevo }}
                  src={relevoIzquierda}
                  alt="Portada de Elysium"
                  loading="lazy"
                />
              )}
            </div>
          )}

          {imagenPareja && (
            <div
              className="poses-fusion-pareja"
              style={{
                width: ladoFinal || undefined,
                height: ladoFinal || undefined,
                opacity: pareja,
                // A la derecha de la figura; en móvil, justo debajo.
                transform: vertical
                  ? `translateY(${ladoFinal + HUECO}px)`
                  : `translateX(${ladoFinal + HUECO}px)`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagenPareja} alt="Pieza que acompaña a la figura de Elysium" loading="lazy" />
              {relevoDerecha && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="poses-fusion-relevo"
                  style={{ opacity: relevo2 }}
                  src={relevoDerecha}
                  alt="Portada de Elysium con textura"
                  loading="lazy"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
