import "./TextoPapel.css";

// EL TEXTO SOBRE PAPEL: el bloque de lectura de las páginas de proyecto.
//
// Estaba escrito cuatro veces —El Arte del Miedo, Sala Equis, Orquesta Tokio y
// la propia página del sistema— con cuatro nombres distintos, las mismas
// medidas y el mismo comentario. Era el ejemplo de manual de una pieza que pide
// ser un componente, y lo denunciaba la página del sistema de diseño.
//
// Qué resuelve, que es lo que justifica que exista: por detrás de estas páginas
// pasa la trama animada del fondo, y sobre un párrafo compite con lo que hay
// que leer. Así que el bloque es opaco. Pero pegado al texto, el papel se ve
// como un recorte a ras de letra, de modo que lleva relleno para respirar y un
// margen negativo que lo devuelve a su sitio: el texto sigue alineado con el
// rótulo de arriba y lo único que sobresale es el papel.
export default function TextoPapel({ children }: { children: React.ReactNode }) {
  return <div className="papel">{children}</div>;
}
