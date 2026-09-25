"use client";

// PROVISIONAL: comprobación contra el generador original.
// Los porcentajes de la captura, en fracciones exactas de cada tracklist suyo.
import LienzoGaga from "@/components/proyectos/elysium-web/LienzoGaga";

const VALORES = [
  1,       // The Fame       100%  (14/14)
  5 / 8,   // Fame Monster    63%  (5/8)
  0,       // Born This Way    0%
  8 / 15,  // ARTPOP          53%  (8/15)
  10 / 11, // Joanne          91%  (10/11)
  11 / 16, // Chromatica      69%  (11/16)
  7 / 14,  // Mayhem          50%  (7/14)
];

export default function Prueba() {
  return (
    <div style={{ background: "#fff", minHeight: "100dvh", padding: 20 }}>
      <style>{".prueba-lienzo{display:block;width:100%;height:100%}"}</style>
      <div style={{ width: 600, height: 600, position: "relative" }}>
        <LienzoGaga valores={VALORES} material="cromo" animar={false} className="prueba-lienzo" />
      </div>
    </div>
  );
}
