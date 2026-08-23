"use client";

import { useLang } from "./useLang";
import "./DropcapTitle.css";

// Titular con capitular: la primera letra en la cursiva de la marca y el resto
// en versales. Nació en el panel de contacto ("Hablemos") y ahora es común, así
// que vive aquí en vez de duplicado: si se retoca el estilo, cambia en los dos
// sitios a la vez.
//
// La letra se separa sola del texto porque lleva un contorno del color del
// fondo, que le abre hueco al solaparse con la palabra.
export default function DropcapTitle({ es, en }: { es: string; en: string }) {
  const lang = useLang();
  const texto = lang === "en" ? en : es;
  // El corte es por carácter, no por palabra: la capitular es solo la primera
  // letra y el resto va en versales, incluido lo que queda de esa palabra.
  const inicial = texto.slice(0, 1);
  const resto = texto.slice(1);

  return (
    <span className="dropcap-title">
      <span className="dropcap-letter">{inicial}</span>
      <span className="dropcap-rest">{resto}</span>
    </span>
  );
}
