"use client";

import { useEffect, useRef } from "react";
import { registra, jubila, remueve, tinta, type Instancia } from "./malla";
import "./MeshGradient.css";

type Props = {
  /** Los colores de la malla, en cualquier forma que entienda el CSS. Desde dos:
   *  si hay menos de cinco se repiten en rueda. Es lo que hace que el mismo
   *  botón valga para cualquier paleta. */
  colores: string[];
  /** Enciende el botón sin que haya ratón encima: para la casilla activa, o
   *  para el táctil, donde «pasar por encima» no existe. */
  encendido?: boolean;
  /** Vueltas por segundo del ruido en reposo. A 0 el degradado se queda quieto
   *  —y además deja de pintarse, que es lo más barato de todo—. */
  velocidadReposo?: number;
  /** Vueltas por segundo con el ratón encima. ESTA Y LA DE ARRIBA son las dos
   *  que hay que tocar para que el botón se mueva más o menos. */
  velocidadHover?: number;
  /** Segundos de la transición entre las dos velocidades. Alto, el botón tarda
   *  en arrancar y en frenar; bajo, responde seco. */
  suavizado?: number;
  /** Cuántas manchas caben a lo ancho. Más alto, dibujo más menudo. */
  escala?: number;
  className?: string;
};

// El lienzo del degradado de malla, para poner DETRÁS del contenido de un botón.
//
// Quien lo use tiene que ser `position: relative`, y el texto tiene que ir en su
// propio elemento con `position: relative` también: el lienzo se coloca en el
// fondo del apilado y el texto por encima. Ver MeshGradient.css.
//
// El recorte —las esquinas redondeadas del botón— NO lo hace el shader: lo hace
// el propio botón con `overflow: hidden`. Así vale cualquier radio, incluso uno
// distinto por esquina, sin tener que contárselo al shader ni repetir el número
// en dos sitios.
export default function MeshGradient({
  colores,
  encendido = false,
  velocidadReposo = 0.02,
  velocidadHover = 0.42,
  suavizado = 0.5,
  escala = 1.5,
  className,
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const inst = useRef<Instancia | null>(null);
  // La lista de colores se compara por su contenido y no por identidad: quien
  // usa esto casi siempre le pasa un array recién hecho en cada render, y
  // comparando por identidad se estaría desmontando el lienzo sin parar.
  const firma = colores.join("|");

  useEffect(() => {
    const lienzo = ref.current;
    if (!lienzo) return;
    const padre = lienzo.parentElement;

    // Quien no quiere movimiento no lo tiene: se pinta un fotograma y se queda
    // ahí, que es lo mismo que enseña en reposo.
    const quieto =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const i = registra(lienzo, {
      colores,
      velocidadReposo: quieto ? 0 : velocidadReposo,
      velocidadHover: quieto ? 0 : velocidadHover,
      suavizado,
      escala,
    });
    // Sin WebGL no hay nada que hacer y no pasa nada: debajo del lienzo sigue
    // estando el degradado de CSS del botón, con los mismos colores.
    if (!i) return;
    inst.current = i;

    // El ratón se escucha en el BOTÓN y no en el lienzo: el lienzo no recibe
    // eventos —está detrás y con pointer-events desactivado— y además así el
    // degradado se enciende también al entrar por el texto.
    const entra = () => { i.hover = true; remueve(i); };
    const sale = () => { i.hover = false; remueve(i); };
    padre?.addEventListener("pointerenter", entra);
    padre?.addEventListener("pointerleave", sale);
    // Con el teclado se enciende igual: quien tabula tiene el mismo aviso de
    // «estás aquí» que quien usa ratón.
    padre?.addEventListener("focusin", entra);
    padre?.addEventListener("focusout", sale);

    const diana = padre ?? lienzo;
    // Fuera de pantalla se apaga entero. El margen de sobra es para que llegue
    // ya pintado al asomar, en vez de aparecer en negro y encenderse.
    const ojo = new IntersectionObserver(
      ([e]) => { i.visible = e.isIntersecting; remueve(i); },
      { rootMargin: "150px" }
    );
    ojo.observe(diana);

    // Al cambiar de tamaño hay que volver a pintar aunque esté en reposo: el
    // lienzo se vacía cuando se le cambian los píxeles.
    const cinta = new ResizeObserver(() => remueve(i));
    cinta.observe(diana);

    return () => {
      padre?.removeEventListener("pointerenter", entra);
      padre?.removeEventListener("pointerleave", sale);
      padre?.removeEventListener("focusin", entra);
      padre?.removeEventListener("focusout", sale);
      ojo.disconnect();
      cinta.disconnect();
      jubila(i);
      inst.current = null;
    };
  }, [firma, velocidadReposo, velocidadHover, suavizado, escala]); // eslint-disable-line react-hooks/exhaustive-deps

  // Los colores pueden cambiar sin desmontar nada —otra paleta para el mismo
  // botón—, y entonces solo hay que repintar.
  useEffect(() => {
    const i = inst.current;
    if (!i) return;
    i.tinta = tinta(colores);
    remueve(i);
  }, [firma]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const i = inst.current;
    if (!i) return;
    i.forzado = encendido;
    remueve(i);
  }, [encendido]);

  return <canvas ref={ref} className={`mesh-gradient${className ? ` ${className}` : ""}`} aria-hidden="true" />;
}
