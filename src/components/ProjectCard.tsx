"use client";

import Link from "next/link";
import "./ProjectCard.css";

// Pseudo-aleatorio estable a partir del id: cada card obtiene una duración
// y un desfase distintos para que los degradados no vayan sincronizados.
function seeded(id: string, salt: number): number {
  let h = salt >>> 0;
  for (let i = 0; i < id.length; i++) {
    h = Math.imul(h ^ id.charCodeAt(i), 2654435761);
    h = (h ^ (h >>> 13)) >>> 0;
  }
  return (h % 100003) / 100003;
}

// Card de proyecto: cuadrado base con borde del color de la categoría y
// "Ver proyecto" abajo; encima, la imagen de portada con la banda del
// título (degradado animado de la categoría). Al hacer hover la imagen
// se desplaza hacia arriba dejando ver el CTA.
export default function ProjectCard({
  title,
  id,
  hue,
  cover,
  lang,
}: {
  title: string;
  id: string;
  hue: number;
  cover?: string;
  lang: "es" | "en";
}) {
  // Degradado "orgánico": varias manchas de color del hue que derivan en
  // direcciones distintas sobre una base sólida (ver bandDrift en el CSS).
  const gradient = [
    `radial-gradient(130% 110% at 20% 30%, hsl(${hue},78%,64%) 0%, transparent 60%)`,
    `radial-gradient(110% 130% at 80% 15%, hsl(${hue + 25},72%,56%) 0%, transparent 55%)`,
    `radial-gradient(140% 150% at 65% 85%, hsl(${hue},68%,38%) 0%, transparent 62%)`,
    `linear-gradient(hsl(${hue},70%,50%), hsl(${hue},70%,50%))`,
  ].join(", ");
  // Cada card con su propio ritmo: duración 2.6–5s y desfase negativo
  // (empieza a mitad de ciclo), estables entre renders.
  const dur = 2.6 + seeded(id, 17) * 2.4;
  const delay = -(seeded(id, 53) * dur);

  return (
    <Link
      href={`/proyecto/${id}`}
      className="pcard"
      style={{ borderColor: `hsl(${hue}, 70%, 55%)` }}
    >
      <span className="pcard-cta">{lang === "en" ? "View project" : "Ver proyecto"}</span>

      {/* Portada: sube en hover sobresaliendo por arriba de la card */}
      <div className="pcard-media">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="pcard-img" src={cover} alt={title} />
        ) : (
          <div className="pcard-img pcard-placeholder">
            <svg viewBox="0 0 200 200" aria-hidden="true">
              <rect x="30" y="45" width="140" height="100" rx="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="62" cy="72" r="11" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <path d="M30 125 80 90l40 20 50-35" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
        )}
      </div>

      {/* Cinta del título (pieza.svg): estática, de lado a lado. El degradado
          va enmascarado con la forma; el stroke es un SVG superpuesto. */}
      <div className="pcard-bandwrap">
        <div
          className="pcard-band"
          style={{ backgroundImage: gradient, animationDuration: `${dur.toFixed(2)}s`, animationDelay: `${delay.toFixed(2)}s` }}
        />
        <svg className="pcard-band-stroke" viewBox="0 0 230 92" preserveAspectRatio="none" aria-hidden="true">
          <path
            d="M230 92C230 83.1634 222.837 76 214 76H16C7.16345 76 1.41746e-06 83.1634 0 92V0C4.83225e-08 8.83655 7.16345 16 16 16H214C222.837 16 230 8.83656 230 0V92Z"
            fill="none"
            stroke={`hsl(${hue}, 70%, 55%)`}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div className="pcard-band-text">
          <span className="pcard-band-cap">{title.charAt(0)}</span>
          <span className="pcard-band-rest">{title.slice(1)}</span>
        </div>
      </div>
    </Link>
  );
}
