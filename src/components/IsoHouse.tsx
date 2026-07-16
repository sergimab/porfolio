"use client";

import { useEffect, useRef, useState } from "react";
import "./IsoHouse.css";

const B = "/images/isometric-escenas/house";

export default function IsoHouse() {
  const ref = useRef<HTMLDivElement>(null);
  const [deployed, setDeployed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Solo se despliega cuando la casa entra de verdad en la vista: recortamos
    // el 30% inferior del viewport, así en móvil no se dispara mientras todavía
    // estás mirando la escena de arriba y la casa apenas asoma.
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setDeployed(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -30% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="iso-house" ref={ref} data-deployed={deployed}>
      <img className="iso-facade" src={`${B}/Group.svg`} alt="Casa cerrada" />
      <img className="iso-layer iso-top"  src={`${B}/top.svg`}  alt="" />
      <img className="iso-layer iso-mid"  src={`${B}/mid.svg`}  alt="" />
      <img className="iso-layer iso-add"  src={`${B}/add.svg`}  alt="" />
      <img className="iso-layer iso-bot"  src={`${B}/bot.svg`}  alt="" />
      <img className="iso-layer iso-down" src={`${B}/down.svg`} alt="" />
    </div>
  );
}
