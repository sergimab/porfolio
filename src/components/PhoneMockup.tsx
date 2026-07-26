"use client";

import { useRef } from "react";
import "./PhoneMockup.css";

// Marco de móvil (SVG) con una newsletter cargada en un iframe con scroll.
// El borde del móvil se pinta por CSS (theme-aware). La barra de scroll del
// iframe se oculta inyectando CSS en su documento (mismo origen).
export default function PhoneMockup({ src, title }: { src: string; title: string }) {
  const ref = useRef<HTMLIFrameElement>(null);

  const onLoad = () => {
    try {
      const doc = ref.current?.contentDocument;
      if (!doc) return;
      const style = doc.createElement("style");
      style.textContent =
        "html{scrollbar-width:none;-ms-overflow-style:none}body{scrollbar-width:none}::-webkit-scrollbar{width:0;height:0;display:none}";
      doc.head.appendChild(style);
    } catch {
      /* cross-origin: se ignora */
    }
  };

  return (
    <div className="phone">
      <iframe ref={ref} className="phone-screen" src={src} title={title} onLoad={onLoad} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="phone-frame" src="/images/phone-frame.svg" alt="" aria-hidden="true" />
    </div>
  );
}
