import "./Movil.css";

// El aparato: marco, pantalla y muesca, dibujados en CSS y no una imagen, así
// que se ven nítidos a cualquier tamaño y pesan cero.
//
// Lo usan las newsletters de Iberdrola, el prototipo de la app de Espacio vacío
// y el de El arte del miedo. Cada uno le pasa SU clase, que es donde declara lo
// que cambia —el ancho, la proporción de la pantalla, su color y la muesca—, y
// con la que sigue apuntando a lo suyo desde su propia hoja de estilos.
export default function Movil({
  className,
  clasePantalla,
  children,
}: {
  /** La clase propia del marco, para las medidas de esa página. */
  className?: string;
  /** La de la pantalla. Ahí es donde el prototipo de El arte del miedo declara
   *  los tokens de su app, así que tiene que poder seguir nombrándola. */
  clasePantalla?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`movil${className ? ` ${className}` : ""}`}>
      <div className={`movil-pantalla${clasePantalla ? ` ${clasePantalla}` : ""}`}>
        <div className="movil-notch" aria-hidden="true" />
        {children}
      </div>
    </div>
  );
}
