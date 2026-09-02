"use client";

import { useMemo } from "react";
import LienzoMetal from "@/components/proyectos/elysium/LienzoMetal";
import { ERAS, figuraDeEras } from "./simbolo";
import { contarPorEra } from "./canciones";
import { crearEstudioIridiscente } from "./estudioIridiscente";

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

export default function Portada({ seleccion }: { seleccion: Set<string> }) {
  const figura = useMemo(
    () => figuraDeEras(contarPorEra(seleccion, ERAS)),
    [seleccion]
  );

  return (
    <div className="portada">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="portada-capa" src="/proyectos/elysium-web/portada-fondo.webp" alt="" />

      {/* El símbolo va en su propio cuadrado dentro del hueco. El marco tiene
          que ser CUADRADO —la figura es radial y en uno apaisado saldría
          estirada—, así que se toma el lado menor del hueco y se centra. */}
      <div className="portada-hueco">
        {figura.length > 0 && (
          <LienzoMetal
            figura={figura}
            interactivo={false}
            entorno={crearEstudioIridiscente}
            dispersion={0.012}
            capas={0}
            brillo={1.25}
            grosorLibre
            atraccion
            suavizado={0}
            suavidad={9}
            redondeo={2.5}
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
