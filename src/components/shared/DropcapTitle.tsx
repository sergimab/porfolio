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
  //
  // «Primera letra», no «primer carácter»: un título como «¡Buenas tardes!»
  // empieza por un signo, y hacer del signo la capitular la dejaba en una marca
  // suelta en cursiva. El signo se queda delante, con el resto del texto.
  const i = texto.search(/\p{L}/u);
  const corte = i < 0 ? 0 : i;
  const antes = texto.slice(0, corte);
  const inicial = texto.slice(corte, corte + 1);
  const resto = texto.slice(corte + 1);

  return (
    <span className="dropcap-title">
      {antes ? <span className="dropcap-rest">{antes}</span> : null}
      <span className="dropcap-letter">{inicial}</span>
      <span className="dropcap-rest">{resto}</span>
    </span>
  );
}
