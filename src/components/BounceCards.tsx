"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import "./BounceCards.css";

// Adaptación del componente BounceCards (React Bits) al portfolio: cada card
// es un proyecto (portada + nombre siempre visible) enlazado a su página.
// Mantiene el borde por categoría y el tamaño cuadrado de las cards actuales.

type Item = { id: string; title: string; titleEn: string; cover?: string };

// Composición de rotaciones "desordenada" pero fija (mismo resultado entre
// renders). Se recorre el pool por índice para dar un aspecto natural.
// Ángulos suaves: cards casi horizontales, solo ligeramente inclinadas.
const ANGLE_POOL = [-5, 3, -2, 5, -3, 2, -4, 4, -2];
// Rotación orgánica (más sutil) para el grid en móvil.
const MOBILE_ANGLE_POOL = [-3, 2.5, -2, 3, -2.5, 2, -3];

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

  const cardInner = (item: Item) => (
    <>
      {item.cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="bc-img" src={item.cover} alt={lang === "en" ? item.titleEn : item.title} />
      ) : (
        <div className="bc-img bc-placeholder" aria-hidden="true">
          <svg viewBox="0 0 200 200">
            <rect x="45" y="60" width="110" height="80" rx="6" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="72" cy="86" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M45 122 82 92l30 16 40-28" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
      )}
      <span className="bc-name">{lang === "en" ? item.titleEn : item.title}</span>
    </>
  );

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
              borderColor: `hsl(${hue}, 70%, 55%)`,
              transform: `rotate(${MOBILE_ANGLE_POOL[idx % MOBILE_ANGLE_POOL.length]}deg)`,
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
            style={{ transform: transformStyles[idx], borderColor: `hsl(${hue}, 70%, 55%)` }}
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
