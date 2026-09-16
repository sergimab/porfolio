"use client";

import { memo, useEffect, useRef, useState } from "react";
import "./LaminaGuias.css";

// Una lámina de guías —la construcción del logotipo, los márgenes de
// aplicación— dibujándose al llegar.
//
// El SVG va INCRUSTADO y no como <img>: dentro de una imagen no se puede ni
// animar cada guía por separado ni cambiarle el color, que es justo lo que hace
// falta aquí. Incrustado, el color sale de `currentColor` —así que ya no hacen
// falta dos archivos, uno por modo del sitio— y cada línea puede entrar a su
// tiempo.
//
// El marcado se lee del archivo en el servidor y llega como texto: la fuente
// sigue siendo el SVG de la carpeta del proyecto, no una copia pegada aquí.
export default function LaminaGuias({ markup, ancho = 760 }: { markup: string; ancho?: number }) {
  const caja = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  // Las guías se trazan; las letras aparecen después. Se distinguen por el
  // relleno: las guías son las que no tienen ninguno.
  //
  // `pathLength="1"` es lo que permite trazarlas sin saber cuánto mide cada
  // una: normaliza el recorrido a 1, y entonces un guion de 1 con su mismo
  // desfase deja la línea invisible y animarlo hasta 0 la dibuja. Vale igual
  // para una recta que para una circunferencia.
  //
  // El reparto se hace AQUÍ, en el mismo paso que enciende la animación, y no
  // en un efecto aparte: el SVG entra por marcado del servidor, y marcarlo
  // antes de que React termine con él dejaba las clases sin poner.
  useEffect(() => {
    const el = caja.current;
    if (!el) return;

    const preparar = () => {
      const piezas = [...el.querySelectorAll<SVGGeometryElement>("svg [class]")];
      const guias = piezas.filter((p) => getComputedStyle(p).fill === "none");
      // De izquierda a derecha, que es como se levantaría a mano.
      guias
        .map((g) => ({ g, x: g.getBoundingClientRect().left }))
        .sort((a, b) => a.x - b.x)
        .forEach(({ g }, i) => {
          g.setAttribute("pathLength", "1");
          g.classList.add("es-guia");
          g.style.animationDelay = `${i * 26}ms`;
        });
      piezas
        .filter((p) => !guias.includes(p))
        .forEach((p) => p.classList.add("es-letra"));
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          preparar();
          setVisible(true);
          obs.disconnect();
        }
      },
      { rootMargin: "0px 0px -15% 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={caja}
      className={`ym-lamina-guias${visible ? " es-visible" : ""}`}
      style={{ ["--ym-ancho" as string]: `${ancho}px` }}
    >
      <Lienzo markup={markup} />
    </div>
  );
}

// El SVG, aparte y memorizado: así React lo pinta UNA vez y no vuelve a
// tocarlo. Puesto en el mismo elemento que lleva la clase de «ya se ve»,
// cada cambio de estado rehacía su contenido y se llevaba por delante las
// clases y los retardos que el efecto acababa de repartir.
const Lienzo = memo(function Lienzo({ markup }: { markup: string }) {
  return (
    <div
      className="ym-lamina-guias-lienzo"
      // El SVG es un archivo del propio proyecto, no algo que llegue de fuera.
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
});
