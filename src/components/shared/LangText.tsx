"use client";

import { useLang } from "./useLang";

// Texto que cambia con el idioma. Se usa dentro de elementos server (p. ej.
// los párrafos de las páginas de proyecto).
//
// Para poner algo en negrita, se rodea con dobles asteriscos dentro del propio
// texto: "una **figura** construida pieza a pieza". No hace falta escribir
// etiquetas HTML.
function conNegritas(texto: string): React.ReactNode[] {
  // Los trozos impares del split son los que iban entre ** y **.
  return texto.split("**").map((trozo, i) =>
    i % 2 === 1 ? <strong key={i}>{trozo}</strong> : <span key={i}>{trozo}</span>
  );
}

export default function LangText({ es, en }: { es: string; en: string }) {
  const lang = useLang();
  return <>{conNegritas(lang === "en" ? en : es)}</>;
}
