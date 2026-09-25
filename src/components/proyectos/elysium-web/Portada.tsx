"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import LienzoGaga from "./LienzoGaga";
import { ERAS } from "./simbolo";
import { fraccionPorEra } from "./canciones";

// La portada del disco con el símbolo dentro del hueco.
//
// Son TRES capas, y el orden es todo el truco:
//
//   1. el fondo — el cuerpo, la caja y su interior oscuro,
//   2. el símbolo, metido en el hueco,
//   3. el frente — las manos, las uñas y los tubos, con transparencia.
//
// No hace falta ninguna máscara de recorte: la transparencia de la capa de
// delante ES la máscara. Lo que en ella es opaco tapa al símbolo, y lo que es
// transparente lo deja ver. Por eso las dos imágenes tienen que estar
// exportadas al mismo tamaño y alineadas: superpuestas sin más reconstruyen la
// portada original, y el símbolo se cuela entre ellas.

// Dónde cae el hueco dentro de la portada, en fracción del cuadro.
//
// Medido sobre la propia imagen del fondo —buscando la mancha oscura más grande
// y su caja— y no a ojo: si la portada se reexporta con el hueco movido, se
// vuelve a medir en vez de andar cuadrando números a mano.
const HUECO = { izq: 0.2233, arriba: 0.2267, ancho: 0.5467, alto: 0.5533 };

// LAS MEDIDAS EN PÍXELES SE FUERON CON EL MOTOR ANTERIOR. Aquel medía el
// material en píxeles —el desenfoque, la distancia a la que se toma la normal—,
// así que el mismo símbolo salía deshilachado en un hueco de móvil y entero en
// uno de escritorio, y había que escalar cada número con el ancho real. El
// generador de ahora trabaja en las coordenadas de la figura, no del lienzo: la
// pieza se ve igual a cualquier tamaño y no hay nada que escalar.

export default function Portada({ seleccion }: { seleccion: Set<string> }) {
  // El ancho real del hueco. Ya no escala ningún ajuste del material —el
  // generador de ahora no mide en píxeles—, pero sí las sombras del CSS.
  const huecoRef = useRef<HTMLDivElement>(null);
  const [ancho, setAncho] = useState(260);
  useEffect(() => {
    const el = huecoRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([e]) => {
      const w = e.contentRect.width;
      if (w > 1) setAncho(w);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const valores = useMemo(() => fraccionPorEra(seleccion, ERAS), [seleccion]);
  const hay = valores.some((v) => v > 0);

  return (
    <div className="portada">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="portada-capa" src="/proyectos/elysium-web/portada-fondo.webp" alt="" />

      {/* La luz de detrás. Va entre el fondo y el símbolo, así que ilumina el
          interior de la caja y la pieza se recorta contra ella: es lo que hace
          que el símbolo parezca estar DENTRO del hueco y no pegado encima. */}
      <div className="portada-luz" aria-hidden="true" />

      {/* El símbolo va en su propio cuadrado dentro del hueco. El marco tiene
          que ser CUADRADO —la figura es radial y en uno apaisado saldría
          estirada—, así que se toma el lado menor del hueco y se centra. */}
      {/* El ancho real del hueco viaja al CSS como variable porque las sombras
          laterales van en PÍXELES —drop-shadow no entiende porcentajes— y sin
          escalarlas con el hueco, en móvil serían el doble de largas en
          proporción. */}
      <div
        className="portada-hueco"
        ref={huecoRef}
        style={{ "--hueco": `${ancho}px` } as React.CSSProperties}
      >
        {hay && (
          <LienzoGaga
            valores={valores}
            // Cromo y no cristal, y por una razón de montaje: el cristal
            // refracta lo que tiene detrás, así que necesita un fondo opaco
            // donde mirar, y ese fondo taparía el interior de la caja. El cromo
            // sale con el fondo transparente y la pieza se recorta contra la luz
            // del hueco, que es lo que la mete dentro de la carátula.
            material="cromo"
            // Y levita. Es la única pantalla donde la pieza se queda a la vista
            // sin nada más que hacer, y quieta dentro de la caja parecía pegada
            // al fondo en vez de suspendida en él.
            flotar={1}
            className="portada-simbolo"
          />
        )}
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="portada-capa es-frente"
        src="/proyectos/elysium-web/portada-frente.webp"
        alt="Portada del disco con el símbolo generado en el hueco central"
      />
    </div>
  );
}

export { HUECO };
