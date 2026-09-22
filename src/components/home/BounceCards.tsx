"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { organicGradient, paletaLegible, degradadoLegible, CAPSULE_DRIFT_SIZE, drift } from "@/components/shared/organico";
import MeshGradient from "@/components/shared/MeshGradient";
import "./BounceCards.css";

// Adaptación del componente BounceCards (React Bits) al portfolio: cada card
// es un proyecto (portada + nombre siempre visible) enlazado a su página.
// Mantiene el borde por categoría y el tamaño cuadrado de las cards actuales.

type Item = {
  id: string;
  title: string;
  titleEn: string;
  cover?: string;
  /** El tono de SU categoría. Lo llevan las tarjetas de una parrilla mezclada
   *  —los proyectos recomendados, que vienen de sitios distintos—; en una
   *  parrilla de una sola categoría no hace falta, y manda el de la parrilla. */
  hue?: number;
};

// Color de texto accesible (blanco o casi-negro) sobre la banda hsl(hue,70%,55%)
// de la categoría: se elige el que da más contraste según WCAG en vez de fijar
// siempre blanco, porque tonos como el verde de Iberdrola son demasiado claros
// para texto blanco.
// Composición de rotaciones "desordenada" pero fija (mismo resultado entre
// renders). Se recorre el pool por índice para dar un aspecto natural.
// Ángulos suaves: cards casi horizontales, solo ligeramente inclinadas.
const ANGLE_POOL = [-5, 3, -2, 5, -3, 2, -4, 4, -2];
// Rotación y desplazamiento vertical orgánicos para el grid en móvil: cada
// card "flota" a una altura distinta (vía transform, no afecta al flujo de
// las demás) para romper la simetría de la rejilla de 2 columnas.
const MOBILE_ANGLE_POOL = [-3, 2.5, -2, 3, -2.5, 2, -3];
const MOBILE_OFFSET_POOL = [0, 24, -10, 16, -16, 8, -6, 20, -12];

// Cards en línea horizontal con rotación variada (no un abanico simétrico).
function fanTransforms(n: number): string[] {
  const center = (n - 1) / 2;
  const spread = 145; // px horizontales entre cards
  return Array.from({ length: n }, (_, i) => {
    const d = i - center;
    const rot = ANGLE_POOL[i % ANGLE_POOL.length];
    return `rotate(${rot}deg) translate(${(d * spread).toFixed(1)}px)`;
  });
}

export default function BounceCards({
  items,
  lang,
  hue,
  animationDelay = 0.35,
  animationStagger = 0.08,
  easeType = "elastic.out(1, 0.6)",
  enableHover = true,
}: {
  items: Item[];
  lang: "es" | "en";
  hue: number;
  animationDelay?: number;
  animationStagger?: number;
  easeType?: string;
  enableHover?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const transformStyles = fanTransforms(items.length);
  const [isMobile, setIsMobile] = useState(false);

  // En móvil se muestra un grid normal (2 columnas), no el abanico.
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (isMobile) return; // sin animación/abanico en el grid móvil
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".bc-card",
        { scale: 0 },
        { scale: 1, stagger: animationStagger, ease: easeType, delay: animationDelay }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [animationStagger, easeType, animationDelay, items.length, isMobile]);

  const getNoRotationTransform = (t: string) => {
    if (/rotate\([\s\S]*?\)/.test(t)) return t.replace(/rotate\([\s\S]*?\)/, "rotate(0deg)");
    return t === "none" ? "rotate(0deg)" : `${t} rotate(0deg)`;
  };

  const getPushedTransform = (base: string, offsetX: number) => {
    const re = /translate\(([-0-9.]+)px\)/;
    const m = base.match(re);
    if (m) return base.replace(re, `translate(${parseFloat(m[1]) + offsetX}px)`);
    return base === "none" ? `translate(${offsetX}px)` : `${base} translate(${offsetX}px)`;
  };

  const pushSiblings = (hoveredIdx: number) => {
    if (!enableHover || !containerRef.current) return;
    const q = gsap.utils.selector(containerRef);
    items.forEach((_, i) => {
      const target = q(`.bc-card-${i}`);
      gsap.killTweensOf(target);
      const base = transformStyles[i] || "none";
      if (i === hoveredIdx) {
        gsap.to(target, {
          transform: getNoRotationTransform(base),
          duration: 0.4,
          ease: "back.out(1.4)",
          overwrite: "auto",
        });
      } else {
        const offsetX = i < hoveredIdx ? -70 : 70;
        gsap.to(target, {
          transform: getPushedTransform(base, offsetX),
          duration: 0.4,
          ease: "back.out(1.4)",
          delay: Math.abs(hoveredIdx - i) * 0.05,
          overwrite: "auto",
        });
      }
    });
  };

  const resetSiblings = () => {
    if (!enableHover || !containerRef.current) return;
    const q = gsap.utils.selector(containerRef);
    items.forEach((_, i) => {
      const target = q(`.bc-card-${i}`);
      gsap.killTweensOf(target);
      gsap.to(target, {
        transform: transformStyles[i] || "none",
        duration: 0.4,
        ease: "back.out(1.4)",
        overwrite: "auto",
      });
    });
  };

  // El nombre va SIEMPRE en blanco, en las siete categorías. Antes lo elegía una
  // función que comparaba blanco y tinta contra el color plano de la banda, y de
  // ahí venían unas tarjetas con el nombre en negro y otras en blanco: no era un
  // descuido, era que cada categoría ganaba por un lado. Con la banda igualada
  // de luminancia (ver paletaLegible) ya no hace falta elegir: el blanco da 5,1:1
  // en todas y en cualquier punto del degradado.
  const textColor = "#ffffff";
  // El aro se queda con el degradado VIVO —es el que dice de qué categoría es la
  // tarjeta y no lleva nada escrito encima—; la banda, con el legible.
  const cardInner = (item: Item) => {
    const title = lang === "en" ? item.titleEn : item.title;
    // El tono es el de la tarjeta si lo trae, y si no el de la parrilla.
    const tono = item.hue ?? hue;
    const pintura = { backgroundImage: organicGradient(tono, 70, 55), backgroundSize: CAPSULE_DRIFT_SIZE };
    const pinturaBanda = { backgroundImage: degradadoLegible(tono), backgroundSize: CAPSULE_DRIFT_SIZE };
    // Cada tarjeta deriva a su propio ritmo, sembrado con su id: si
    // compartieran duración, las manchas irían todas a la vez y se leería
    // como un parpadeo del bloque entero en vez de piezas con vida propia.
    const ritmo = drift(item.id);
    return (
      <>
        {/* El aro va en un elemento y no en el borde de la tarjeta: un borde
            no admite degradado. Es un rectángulo con el degradado al que se le
            recorta el centro con una máscara, así que solo queda el filo. */}
        <span className="bc-ring" style={{ ...pintura, ...ritmo }} aria-hidden="true" />
        {/* La portada va en su propia caja y la banda del nombre DEBAJO, no
            encima. Antes la banda flotaba sobre la imagen y se comía su franja
            de abajo, así que había que diseñar cada portada dejando ese hueco
            libre —y aun así tapaba cosas—. Separadas, la portada se ve entera y
            se puede componer centrada.
            El cuadrado sigue siendo la TARJETA: la portada es lo que queda al
            restarle la banda. */}
        <span className="bc-medio">
          {item.cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            /* Sin alt: el nombre del proyecto va escrito justo debajo, en la
               banda, así que repetirlo en la imagen hace que un lector de
               pantalla lo diga dos veces seguidas. La portada no añade nada que
               el nombre no diga ya. */
            // eslint-disable-next-line jsx-a11y/alt-text
            <img className="bc-img" src={item.cover} alt="" />
          ) : (
            <div className="bc-img bc-placeholder" aria-hidden="true">
              <svg viewBox="0 0 200 160">
                <rect x="45" y="40" width="110" height="80" rx="6" fill="none" stroke="currentColor" strokeWidth="2" />
                <circle cx="72" cy="66" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M45 102 82 72l30 16 40-28" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
          )}
        </span>
        {/* La banda del nombre, con el degradado de malla del shader. El aro de
            arriba se queda con el de CSS a propósito: es un filo de dos píxeles
            y un shader ahí costaría lo mismo que una superficie entera para algo
            que no se llega a ver. El de CSS que hay debajo de la banda sigue
            puesto como red, por si no hay WebGL.
            `selectorEscucha`: manda la TARJETA, no la banda, para que el color
            se active al pasar por encima de la portada y no solo de la franja
            de abajo. */}
        <span className="bc-name" style={{ color: textColor, ...pinturaBanda, ...ritmo }}>
          <MeshGradient
            colores={paletaLegible(tono)}
            selectorEscucha=".bc-card"
            /* Quieta en reposo y viva al pasar por encima. En la parrilla hay
               cinco tarjetas a la vez y todas a la vista: moviéndose siempre,
               aunque fuera despacio, serían cinco volcados por fotograma todo
               el rato para algo que casi no se nota. Quietas no cuestan nada, y
               cada una arranca el ruido por un sitio distinto, así que las cinco
               enseñan una mancha diferente. Subir esto a 0,02 las deja
               respirando si se prefiere. */
            velocidadReposo={0}
            velocidadHover={0.35}
            suavizado={0.5}
            escala={0.8}
          />
          <span className="mesh-encima">{title}</span>
        </span>
      </>
    );
  };

  // Móvil: grid normal de 2 columnas, cards rectas.
  if (isMobile) {
    return (
      <div className="bc-grid">
        {items.map((item, idx) => (
          <Link
            key={item.id}
            href={`/proyecto/${item.id}`}
            className="bc-card"
            style={{
              transform: `rotate(${MOBILE_ANGLE_POOL[idx % MOBILE_ANGLE_POOL.length]}deg) translateY(${MOBILE_OFFSET_POOL[idx % MOBILE_OFFSET_POOL.length]}px)`,
            }}
          >
            {cardInner(item)}
          </Link>
        ))}
      </div>
    );
  }

  // Desktop: abanico horizontal con rotación variada y empuje en hover.
  return (
    <div className="bc-fit">
      <div
        className="bounceCardsContainer"
        ref={containerRef}
        style={{ ["--bc-count" as string]: items.length }}
      >
        {items.map((item, idx) => (
          <Link
            key={item.id}
            href={`/proyecto/${item.id}`}
            className={`bc-card bc-card-${idx}`}
            style={{ transform: transformStyles[idx] }}
            onMouseEnter={() => pushSiblings(idx)}
            onMouseLeave={resetSiblings}
          >
            {cardInner(item)}
          </Link>
        ))}
      </div>
    </div>
  );
}
