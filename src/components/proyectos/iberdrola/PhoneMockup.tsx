"use client";

import { useRef } from "react";
import "./PhoneMockup.css";

// Marco de móvil con una newsletter cargada en un iframe con scroll.
//
// El marco es el mismo que el del prototipo de Espacio vacío: dibujado en CSS
// —nada de imagen— con su notch y, en modo oscuro, un hilo claro alrededor para
// que el aparato no se deshaga contra el papel. La barra de scroll del iframe
// se oculta inyectando CSS en su documento (mismo origen).
export default function PhoneMockup({ src, title }: { src: string; title: string }) {
  const ref = useRef<HTMLIFrameElement>(null);

  const onLoad = () => {
    try {
      const doc = ref.current?.contentDocument;
      if (!doc) return;
      // Oculta la barra de scroll (el iframe sigue siendo navegable)
      const style = doc.createElement("style");
      style.textContent =
        "html{scrollbar-width:none;-ms-overflow-style:none}body{scrollbar-width:none}::-webkit-scrollbar{width:0;height:0;display:none}a{cursor:default!important}";
      doc.head.appendChild(style);
      // Anula los enlaces: no redirigen a ningún sitio
      doc.addEventListener(
        "click",
        (e) => {
          const a = (e.target as Element | null)?.closest("a");
          if (a) {
            e.preventDefault();
            e.stopPropagation();
          }
        },
        true
      );
    } catch {
      /* cross-origin: se ignora */
    }
  };

  return (
    <div className="phone">
      <div className="phone-pantalla">
        <div className="phone-notch" aria-hidden="true" />
        <iframe ref={ref} className="phone-screen" src={src} title={title} onLoad={onLoad} />
      </div>
    </div>
  );
}
