import LangText from "@/components/shared/LangText";

// El marco en el que se enseña cada pieza del muestrario: su nombre, la pieza
// funcionando y, debajo, para qué sirve y de qué está hecha.
//
// La pieza va VIVA dentro del marco, no dibujada: son los componentes de verdad
// traídos de la misma carpeta que usa el resto del sitio.
export default function Pieza({
  nombre,
  nombreEn,
  de,
  deEn,
  ancha,
  fondo,
  children,
}: {
  nombre: string;
  nombreEn: string;
  /** De qué está hecha: los átomos o moléculas que la componen. */
  de?: string;
  deEn?: string;
  /** Las que necesitan el renglón entero, como una cabecera. */
  ancha?: boolean;
  /** Un color propio para el hueco de la muestra, para lo que vive sobre
   *  oscuro. */
  fondo?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`sd-pieza${ancha ? " es-ancha" : ""}`}>
      <span className="sd-pieza-nombre">
        <LangText es={nombre} en={nombreEn} />
      </span>
      <div className="sd-pieza-caja" style={fondo ? { background: fondo } : undefined}>
        {children}
      </div>
      {de && (
        <span className="sd-pieza-de">
          <LangText es={de} en={deEn ?? de} />
        </span>
      )}
    </div>
  );
}
