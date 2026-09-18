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
// EL PASE ES UNA BARAJA, no un fundido. Los cinco están siempre puestos, uno
// encima de otro, y lo que cambia es la PROFUNDIDAD de cada uno: el de delante
// se va hacia la izquierda girando y pasa detrás, y el que venía detrás entra a
// ocupar su sitio enderezándose. Así no es una imagen que se sustituye por
// otra, sino cinco piezas que existen a la vez y se van colocando, que es lo
// que son.
//
// La profundidad de cada cartel se saca de su distancia al de turno, y como la
// cuenta es circular, el que estaba delante salta de 0 a 4 de golpe: o sea,
// hace en una sola transición el viaje entero del frente al fondo. Eso no es un
// defecto del cálculo, es justo el movimiento que se busca —y por eso el
// abanico tiene que estar escrito como una escalera de puestos y no como una
// animación con fotogramas: el viaje sale solo—.
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

      {/* Los cinco están montados a la vez, así que el navegador los tiene todos
          descargados desde el principio y la baraja no se queda esperando a
          ninguno. */}
      <figure className="am-carteles-pase">
        {CARTELES.map((c, i) => {
          // Cuántos puestos hay de este cartel al de turno, contando en círculo.
          // 0 es el de delante.
          const fondo = (i - actual + CARTELES.length) % CARTELES.length;
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={c}
              src={`${RUTA}/${c}.webp`}
              // Las tres primeras se ven; de la cuarta en adelante el hueco ya
              // no daría para distinguirlas y solo ensuciarían el borde de
              // arriba, así que esperan escondidas en el fondo de la pila.
              // AQUÍ NO SE ESCRIBE LA POSICIÓN, SOLO EL PUESTO. El desvío, el
              // giro y el encogimiento de cada puesto están en el CSS, porque
              // no son los mismos en una pantalla ancha que en uno estrecha
              // —en el móvil el abanico tiene que ser más corto o se sale de la
              // página—, y eso es cosa de una media query, no de JavaScript.
              // Lo único que sabe el componente es a qué distancia está cada
              // cartel del de turno.
              style={{
                zIndex: CARTELES.length - fondo,
                ["--f" as string]: fondo,
                opacity: fondo < 3 ? 1 : 0,
              }}
              alt={
                i === 0
                  ? "Los cinco carteles de la exposición, cada uno con una obra distinta"
                  : ""
              }
              aria-hidden={i === 0 ? undefined : true}
            />
          );
        })}
      </figure>
    </div>
  );
}
