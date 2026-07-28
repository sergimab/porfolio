"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./IconosGaleria.css";

// Galería "viva" con los más de 500 iconos del sistema. La rejilla es mucho
// mayor que el marco y uno se desplaza arrastrando: con el ratón en escritorio
// y con el dedo en tablet y móvil (Pointer Events cubre los dos casos).
// Como en el menú de apps del Apple Watch, cada icono se escala y se atenúa
// según lo lejos que esté del centro del marco, así que la retícula "respira"
// al moverla.

const BASE = "/proyectos/iberdrola/iconografia/svg";
// Unos pocos iconos usan blanco para tapar lo que tienen debajo (el trazo
// grueso de los "tachados", rellenos que hacen de papel). Ese blanco está
// teñido del color de fondo, así que hay una copia por tema en svg-oscuro/.
const BASE_OSCURO = "/proyectos/iberdrola/iconografia/svg-oscuro";
const COLUMNAS = 25;

// El escalado se calcula a mano en cada fotograma en vez de con getBoundingClientRect:
// con 500+ iconos, medir el DOM uno a uno tumbaría la animación. Como la
// posición de cada celda es conocida (fila x columna), sale de una resta.
// Curva suave a propósito: con una caída fuerte solo el icono central queda
// legible y la rejilla parece apagada. Así el grueso del marco se lee bien y el
// centro solo destaca un punto.
const ESCALA_MIN = 0.55;
const CAIDA = 0.5;        // cuánto encoge según se aleja del centro
const CAIDA_OPACIDAD = 0.5;
const OPACIDAD_MIN = 0.28;

type Props = { iconos: string[]; conBlanco?: string[] };

export default function IconosGaleria({ iconos, conBlanco = [] }: Props) {
  const [oscuro, setOscuro] = useState(false);
  const conBlancoSet = useMemo(() => new Set(conBlanco), [conBlanco]);

  // El atributo data-theme puede aplicarse después de montar el componente, así
  // que además del evento manual se observa el atributo (leerlo solo al montar
  // deja los iconos con la variante equivocada).
  useEffect(() => {
    const leer = () =>
      setOscuro(document.documentElement.getAttribute("data-theme") === "dark");
    leer();
    const mo = new MutationObserver(leer);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const onTema = (e: Event) => {
      const t = (e as CustomEvent).detail;
      if (t === "light" || t === "dark") setOscuro(t === "dark");
    };
    window.addEventListener("themechange", onTema);
    return () => {
      mo.disconnect();
      window.removeEventListener("themechange", onTema);
    };
  }, []);

  const marcoRef = useRef<HTMLDivElement>(null);
  const rejillaRef = useRef<HTMLDivElement>(null);
  const celdasRef = useRef<HTMLElement[]>([]);

  // Estado del arrastre y de la inercia, en refs para no re-renderizar por frame
  const pan = useRef({ x: 0, y: 0 });
  const vel = useRef({ x: 0, y: 0 });
  const arrastrando = useRef(false);
  const ultimo = useRef({ x: 0, y: 0, t: 0 });
  const raf = useRef(0);

  const pintar = useCallback(() => {
    const marco = marcoRef.current;
    const rejilla = rejillaRef.current;
    if (!marco || !rejilla) return;

    rejilla.style.transform = `translate3d(${pan.current.x}px, ${pan.current.y}px, 0)`;

    const anchoMarco = marco.clientWidth;
    const altoMarco = marco.clientHeight;
    const cx = anchoMarco / 2;
    const cy = altoMarco / 2;
    // radio de referencia: media diagonal del marco
    const radio = Math.hypot(cx, cy);

    const celdas = celdasRef.current;
    const lado = rejilla.firstElementChild
      ? (rejilla.firstElementChild as HTMLElement).offsetWidth
      : 72;
    const hueco = parseFloat(getComputedStyle(rejilla).gap) || 0;
    const paso = lado + hueco;

    for (let i = 0; i < celdas.length; i++) {
      const col = i % COLUMNAS;
      const fil = Math.floor(i / COLUMNAS);
      const x = col * paso + lado / 2 + pan.current.x;
      const y = fil * paso + lado / 2 + pan.current.y;

      // fuera del marco con margen: se apaga y no se toca más
      if (x < -paso || x > anchoMarco + paso || y < -paso || y > altoMarco + paso) {
        const el = celdas[i];
        if (el.dataset.oculto !== "1") {
          el.dataset.oculto = "1";
          el.style.opacity = "0";
          el.style.transform = `scale(${ESCALA_MIN})`;
        }
        continue;
      }

      const d = Math.hypot(x - cx, y - cy) / radio;
      const escala = Math.max(ESCALA_MIN, 1 - d * CAIDA);
      const el = celdas[i];
      el.dataset.oculto = "0";
      el.style.opacity = String(Math.max(OPACIDAD_MIN, 1 - d * CAIDA_OPACIDAD));
      el.style.transform = `scale(${escala.toFixed(3)})`;
    }
  }, []);

  const limitar = useCallback(() => {
    const marco = marcoRef.current;
    const rejilla = rejillaRef.current;
    if (!marco || !rejilla) return;
    const minX = Math.min(0, marco.clientWidth - rejilla.scrollWidth);
    const minY = Math.min(0, marco.clientHeight - rejilla.scrollHeight);
    pan.current.x = Math.max(minX, Math.min(0, pan.current.x));
    pan.current.y = Math.max(minY, Math.min(0, pan.current.y));
  }, []);

  // Inercia al soltar: sigue deslizando y frena poco a poco.
  const inercia = useCallback(() => {
    if (arrastrando.current) return;
    vel.current.x *= 0.94;
    vel.current.y *= 0.94;
    if (Math.abs(vel.current.x) < 0.05 && Math.abs(vel.current.y) < 0.05) return;
    pan.current.x += vel.current.x;
    pan.current.y += vel.current.y;
    limitar();
    pintar();
    raf.current = requestAnimationFrame(inercia);
  }, [limitar, pintar]);

  // Arranca centrada. El primer efecto puede correr antes de que el CSS esté
  // aplicado, y entonces todo mide 0 y el centrado saldría a cero; por eso se
  // espera a tener medidas reales y se vigilan marco y rejilla. Una vez
  // centrada, los cambios de tamaño solo reajustan los límites, para no
  // arrancar al usuario del sitio por el que estaba navegando.
  const centrado = useRef(false);

  useEffect(() => {
    const marco = marcoRef.current;
    const rejilla = rejillaRef.current;
    if (!marco || !rejilla) return;

    const ajustar = () => {
      if (!marco.clientWidth || !rejilla.scrollWidth) return; // aún sin layout
      if (!centrado.current) {
        pan.current.x = (marco.clientWidth - rejilla.scrollWidth) / 2;
        pan.current.y = (marco.clientHeight - rejilla.scrollHeight) / 2;
        centrado.current = true;
      }
      limitar();
      pintar();
    };

    ajustar();
    const ro = new ResizeObserver(ajustar);
    ro.observe(marco);
    ro.observe(rejilla);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf.current);
    };
  }, [limitar, pintar]);

  const onPointerDown = (e: React.PointerEvent) => {
    cancelAnimationFrame(raf.current);
    arrastrando.current = true;
    vel.current = { x: 0, y: 0 };
    ultimo.current = { x: e.clientX, y: e.clientY, t: performance.now() };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!arrastrando.current) return;
    const dx = e.clientX - ultimo.current.x;
    const dy = e.clientY - ultimo.current.y;
    const dt = Math.max(1, performance.now() - ultimo.current.t);
    vel.current = { x: (dx / dt) * 16, y: (dy / dt) * 16 };
    ultimo.current = { x: e.clientX, y: e.clientY, t: performance.now() };
    pan.current.x += dx;
    pan.current.y += dy;
    limitar();
    pintar();
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!arrastrando.current) return;
    arrastrando.current = false;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    raf.current = requestAnimationFrame(inercia);
  };

  return (
    <div
      className="icgal"
      ref={marcoRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div
        className="icgal-rejilla"
        ref={rejillaRef}
        style={{ ["--icgal-columnas" as string]: COLUMNAS }}
      >
        {iconos.map((nombre, i) => (
          <span
            key={nombre}
            className="icgal-celda"
            ref={(el) => {
              if (el) celdasRef.current[i] = el;
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${oscuro && conBlancoSet.has(nombre) ? BASE_OSCURO : BASE}/${encodeURIComponent(nombre)}`}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              draggable={false}
            />
          </span>
        ))}
      </div>
    </div>
  );
}
