"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

// El ancho de referencia del hueco, en píxeles de CSS, y los ajustes de
// material medidos sobre él.
//
// Hacen falta porque `redondeo` y `suavidad` van en PÍXELES, no en fracciones:
// el redondeo es un desenfoque y la suavidad, a qué distancia se toman las
// muestras que dan la normal. En escritorio el hueco mide unos 260 px y en un
// móvil 183, así que los mismos números pesan ahí un 40% más y se comen el
// cuerpo de la pieza —el desenfoque baja la altura del campo, y sobre una cinta
// de menos píxeles la baja proporcionalmente más—. Por eso el símbolo salía
// deshilachado en móvil aunque la figura fuera idéntica.
//
// Escalándolos con el ancho real, el material se ve igual a cualquier tamaño.
const ANCHO_BASE = 260;
const REDONDEO_BASE = 2;
const SUAVIDAD_BASE = 9;

export default function Portada({ seleccion }: { seleccion: Set<string> }) {
  // El ancho real del hueco, para escalar con él los ajustes que van en
  // píxeles.
  const huecoRef = useRef<HTMLDivElement>(null);
  const [ancho, setAncho] = useState(ANCHO_BASE);
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
  const k = ancho / ANCHO_BASE;

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
      <div className="portada-hueco" ref={huecoRef}>
        {figura.length > 0 && (
          <LienzoMetal
            figura={figura}
            interactivo={false}
            // El plató de la portada, no el del espacio: un metal devuelve el
            // color de lo que le rodea, así que para que la pieza pertenezca a
            // la carátula hay que cambiarle la habitación, no el material.
            entorno={crearEstudioPortada}
            // Vidrio, pero conservando el tono neutro: los canales se separan
            // lo justo para que el filo saque arcoíris sin teñir el cuerpo.
            // Subiendo más, el color invade la superficie y la pieza deja de
            // pertenecer a la carátula.
            dispersion={0.015}
            // Y CON líneas interiores, que es lo que de verdad distingue el
            // vidrio del metal: un canto grueso de vidrio no devuelve un solo
            // reflejo, devuelve el borde repetido hacia dentro porque el rayo
            // rebota en la cara de atrás antes de salir. Tres es lo que cabe en
            // un montante de este grosor; con más se apelotonan.
            capas={3}
            brillo={1.95}
            grosorLibre
            atraccion
            suavizado={0}
            suavidad={Math.max(3, Math.round(SUAVIDAD_BASE * k))}
            // Contenido. Subirlo a 6,5 para fundir las uniones ROMPIÓ la
            // figura: el desenfoque baja la altura del campo, las partes finas
            // cayeron por debajo del umbral y la pieza salió a trozos. El
            // desenfoque es acabado, no forma.
            redondeo={REDONDEO_BASE * k}
            // Las uniones se suavizan aquí, en la LUZ. El filo bajo quita el
            // hilo duro que perfilaba cada tramo y hacía que un encuentro se
            // leyera como dos piezas soldadas; el grano alto hace que una
            // pendiente media incline menos, con lo que el pliegue de la unión
            // se aplana y el brazo conserva su bombeo. Ninguno de los dos toca
            // la geometría, así que no pueden partir nada.
            filo={0.9}
            grano={0.1}
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
