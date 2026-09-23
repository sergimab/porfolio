"use client";

import Link from "next/link";
import DropcapTitle from "./DropcapTitle";
import MeshGradient from "./MeshGradient";
import { useLang } from "./useLang";
import { buscarProyecto } from "./proyectos";
import { paletaLegible, degradadoLegible, paletaClara, degradadoClaro, CAPSULE_DRIFT_SIZE, drift } from "./organico";
import "./Recomendados.css";

// «Proyectos recomendados»: la misma sección en la home y al pie de cada página
// de proyecto.
//
// UN SOLO COMPONENTE PARA LOS DOS SITIOS. Antes eran dos cosas distintas —el
// abanico de tarjetas de la home y los banners de las páginas— y cada una se
// retocaba por su lado. Ahora es este, y lo único que cambia de un sitio a otro
// es la lista de proyectos que se le pasa.
//
// CÓMO SE REPARTEN. Hasta tres, las tarjetas se reparten el ancho de la página:
// el alto es fijo y el ancho, lo que toque. De cuatro en adelante pasan a medir
// lo mismo y la fila se desplaza de lado, porque repartir seis en el ancho de
// una página las dejaría en nada.
// La tarjeta de muestra del muestrario: la pieza de verdad, con una foto y un
// nombre genéricos y sin enlace. Así lo que se enseña es la forma de la
// tarjeta, no un proyecto concreto que luego haya que ir a cambiar.
const MUESTRA = {
  id: "muestra",
  title: "Nombre del proyecto",
  titleEn: "Project name",
  cover: "/sistema/muestra-cover.webp",
  hue: 32,
  claro: false,
};

export default function Recomendados({
  ids,
  titulo = { es: "Proyectos recomendados", en: "Featured projects" },
  className,
  muestra,
}: {
  ids: string[];
  titulo?: { es: string; en: string };
  className?: string;
  /** Sin enlace y con contenido genérico, para el muestrario del sistema. */
  muestra?: boolean;
}) {
  const lang = useLang();
  // Un id que no existe se cae de la lista en vez de tirar la página abajo.
  const proyectos = muestra
    ? [MUESTRA]
    : ids.map(buscarProyecto).filter((p): p is NonNullable<typeof p> => p !== null);
  if (!proyectos.length) return null;

  const enFila = proyectos.length <= 3;

  return (
    <section className={`rec${className ? ` ${className}` : ""}`}>
      <h2 className="rec-titulo">
        <DropcapTitle es={titulo.es} en={titulo.en} />
      </h2>

      <div
        className={enFila ? "rec-fila" : "rec-tira"}
        style={enFila ? { gridTemplateColumns: `repeat(${proyectos.length}, 1fr)` } : undefined}
      >
        {proyectos.map(p => {
          const nombre = lang === "en" ? p.titleEn : p.title;
          // La banda va del color de su categoría, con la misma paleta legible
          // que las cápsulas de la home: el nombre en blanco encima da 5,1:1 en
          // cualquier punto del degradado.
          const pintura = p.claro ? degradadoClaro(p.hue) : degradadoLegible(p.hue);
          const colores = p.claro ? paletaClara(p.hue) : paletaLegible(p.hue);
          const Caja = muestra
            ? ({ children }: { children: React.ReactNode }) => <span className="rec-card">{children}</span>
            : ({ children }: { children: React.ReactNode }) => (
                <Link href={`/proyecto/${p.id}`} className="rec-card">{children}</Link>
              );
          return (
            <Caja key={p.id}>
              <span className="rec-img">
                {p.cover ? (
                  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
                  /* Sin alt: el nombre va escrito justo debajo, y repetirlo aquí
                     hace que un lector de pantalla lo diga dos veces. */
                  <img src={p.cover} alt="" loading="lazy" />
                ) : (
                  <span className="rec-sinfoto" aria-hidden="true">
                    <svg viewBox="0 0 200 160">
                      <rect x="45" y="40" width="110" height="80" rx="6" fill="none" stroke="currentColor" strokeWidth="2" />
                      <circle cx="72" cy="66" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
                      <path d="M45 102 82 72l30 16 40-28" fill="none" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </span>
                )}
              </span>
              <span
                className="rec-nombre"
                style={{ backgroundImage: pintura, backgroundSize: CAPSULE_DRIFT_SIZE, ...drift(p.id) }}
              >
                <MeshGradient
                  colores={colores}
                  selectorEscucha=".rec-card"
                  /* Quieta en reposo: puede haber seis a la vista y moverse
                     todas todo el rato es gastar fotogramas en algo que casi no
                     se nota. Al acercarse, se enciende. */
                  velocidadReposo={0}
                  velocidadHover={0.35}
                  suavizado={0.5}
                  escala={0.8}
                />
                <span className="mesh-encima">{nombre}</span>
              </span>
            </Caja>
          );
        })}
      </div>
    </section>
  );
}
