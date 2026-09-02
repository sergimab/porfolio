"use client";

import { useMemo } from "react";
import LienzoMetal from "@/components/proyectos/elysium/LienzoMetal";
import { ERAS, figuraDeEras } from "./simbolo";
import { contarPorEra } from "./canciones";
import { crearEstudioPortada } from "./estudioPortada";

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

// Cuánto ocupa la figura dentro del hueco. Alto: el símbolo es el sujeto de la
// carátula, no un detalle dentro de la caja.
const ENCAJE_PORTADA = 0.92;

export default function Portada({ seleccion }: { seleccion: Set<string> }) {
  // Más encaje que en la pantalla del trazado: aquí el símbolo va dentro de una
  // caja y tiene que llenarla, mientras que allí va suelto sobre el universo y
  // necesita aire alrededor.
  const figura = useMemo(
    () => figuraDeEras(contarPorEra(seleccion, ERAS), ENCAJE_PORTADA),
    [seleccion]
  );

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
      <div className="portada-hueco">
        {figura.length > 0 && (
          <LienzoMetal
            figura={figura}
            interactivo={false}
            // El plató de la portada, no el del espacio: un metal devuelve el
            // color de lo que le rodea, así que para que la pieza pertenezca a
            // la carátula hay que cambiarle la habitación, no el material.
            entorno={crearEstudioPortada}
            // Cromo, no vidrio: los canales apenas se separan, así que el
            // arcoíris se queda en un hilo en el filo mismo y el cuerpo de la
            // pieza devuelve limpio el rosa y el violeta de la caja. Es lo que
            // la hace mimetizarse con la carátula en vez de destacar sobre
            // ella.
            dispersion={0.006}
            // Y sin líneas interiores: una chapa pulida, no un canto de vidrio.
            capas={0}
            brillo={1.95}
            grosorLibre
            atraccion
            suavizado={0}
            suavidad={9}
            redondeo={3.5}
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
