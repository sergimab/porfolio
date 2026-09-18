"use client";

import { useEffect, useState } from "react";
import "./Carteles.css";

const RUTA = "/proyectos/el-arte-del-miedo-branding";
const CARTELES = ["cartel-01", "cartel-02", "cartel-03", "cartel-04", "cartel-05"];

// Lo que dura cada cartel a la vista. Más que las pruebas del isotipo: allí son
// figuras de cuadrados que se leen de un golpe, y aquí hay un cuadro, un
// titular y unas fechas que da tiempo a mirar.
const PASO = 2200;

// Los carteles de la exposición: el mockup de la calle a la izquierda y, a su
// derecha, los cinco carteles pasando en bucle.
//
// LOS DOS SE MIDEN SOLOS. El mockup es 3:2 y un cartel es A —uno partido por
// raíz de dos—, así que para que los dos acaben con el MISMO ALTO cada uno
// tiene que llevarse un ancho proporcional a su propia proporción: 1,5 contra
// 0,707. Eso es exactamente lo que hace `flex-grow` con esos dos números, y por
// eso no hay ni un píxel escrito en el CSS: se reparte el ancho que haya y los
// altos salen iguales en cualquier pantalla.
//
// El pase va con fundido y no con corte seco —al revés que las pruebas del
// isotipo— porque aquí lo que cambia es una imagen entera: a corte, cinco
// carteles seguidos parpadean.
export default function Carteles() {
  const [actual, setActual] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const reloj = setInterval(() => setActual((n) => (n + 1) % CARTELES.length), PASO);
    return () => clearInterval(reloj);
  }, []);

  return (
    <div className="am-carteles">
      <figure className="am-carteles-mockup">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${RUTA}/carteles-mockup.webp`}
          alt="Dos carteles de la exposición pegados en un panel de la calle"
        />
      </figure>

      {/* Los cinco están montados a la vez, uno encima de otro, y lo que cambia
          es cuál se ve: así el navegador los tiene todos descargados desde el
          principio y el pase no se queda esperando a ninguno. */}
      <figure className="am-carteles-pase">
        {CARTELES.map((c, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={c}
            src={`${RUTA}/${c}.webp`}
            className={i === actual ? "es-visible" : undefined}
            alt={
              i === 0
                ? "Los cinco carteles de la exposición, cada uno con una obra distinta"
                : ""
            }
            aria-hidden={i === 0 ? undefined : true}
          />
        ))}
      </figure>
    </div>
  );
}
