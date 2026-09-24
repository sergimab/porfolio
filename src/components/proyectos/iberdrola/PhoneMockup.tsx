"use client";

import { useRef } from "react";
import Movil from "@/components/shared/Movil";
import "./PhoneMockup.css";

// Una newsletter cargada dentro del aparato, en un iframe con scroll.
//
// El marco es el componente compartido, el mismo que llevan los prototipos de
// las dos apps. Lo único de aquí es lo de dentro: la barra de scroll del iframe
// se oculta inyectando CSS en su documento, que es del mismo origen, y se
// anulan sus enlaces para que no lleven a ningún sitio.
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
    <Movil className="nwl-movil">
      <iframe ref={ref} className="phone-screen" src={src} title={title} onLoad={onLoad} />
    </Movil>
  );
}
