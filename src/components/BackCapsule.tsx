"use client";

import Link from "next/link";
import "./BackCapsule.css";

const CATS: Record<string, { label: string; hue: number }> = {
  motion:     { label: "Motion Graphics", hue: 32  },
  branding:   { label: "Branding",        hue: 330 },
  fotografia: { label: "Fotografía",      hue: 217 },
  iberdrola:  { label: "Iberdrola",       hue: 142 },
  uiux:       { label: "UI / UX",         hue: 262 },
  "3d":       { label: "3D",              hue: 175 },
};

export default function BackCapsule({ category }: { category: string }) {
  const cat = CATS[category] ?? CATS.iberdrola;
  return (
    <Link
      href={`/?cat=${category}`}
      className="back-capsule"
      style={{ "--cap-hue": cat.hue } as React.CSSProperties}
      aria-label={`Volver a los proyectos de ${cat.label}`}
    >
      <svg className="back-capsule-chev" width="8" height="14" viewBox="0 0 8 14" fill="none"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6.5 1 1.5 7l5 6" />
      </svg>
      {cat.label}
    </Link>
  );
}
