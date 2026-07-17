"use client";

import { useEffect, useState } from "react";
import { useLang } from "./useLang";
import "./BackToTop.css";

// Botón flotante "volver arriba": aparece al bajar y hace scroll suave al top.
// Reutilizable en cualquier página larga.
export default function BackToTop({ threshold = 400 }: { threshold?: number }) {
  const lang = useLang();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return (
    <button
      className="back-to-top-btn"
      data-show={show}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label={lang === "en" ? "Back to top" : "Volver arriba"}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="12" y1="19" x2="12" y2="5" />
        <polyline points="5 12 12 5 19 12" />
      </svg>
    </button>
  );
}
