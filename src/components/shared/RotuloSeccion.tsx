import LangText from "./LangText";
import "./RotuloSeccion.css";

// El rótulo que encabeza una sección dentro de una página de proyecto: el
// nombre en una pastilla y, saliendo de ella, la línea que la separa de lo
// anterior. Rótulo y separador son la misma pieza.
//
// `className` es para el sitio que ocupa —el hueco que deja debajo cambia según
// lo que venga detrás—, no para su aspecto.
export default function RotuloSeccion({
  es,
  en,
  className,
}: {
  es: string;
  en: string;
  className?: string;
}) {
  return (
    <h2 className={`rotulo-seccion${className ? ` ${className}` : ""}`}>
      <span className="rotulo-seccion-caja">
        <LangText es={es} en={en} />
      </span>
    </h2>
  );
}
