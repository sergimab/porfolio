import RotuloSeccion from "@/components/shared/RotuloSeccion";
import "./Aplicaciones.css";

// Las aplicaciones de la marca, con la composición tal cual está montada en el
// archivo del proyecto.
//
// Las posiciones NO están puestas a ojo: salen del SVG de la composición, que
// coloca cada imagen con su traslación y su escala sobre un lienzo de
// 1920 × 2958,5. Aquí eso se pasa a porcentajes de ese mismo lienzo —ver el
// CSS—, así que la lámina se ve igual a cualquier ancho.
const RUTA = "/proyectos/yelmo/branding/aplicaciones";

// El orden es el del archivo, que es también el de delante atrás.
const PIEZAS = [
  { archivo: "fachada.webp", clase: "es-fachada", alt: "Rótulo de Yelmo luxury en la fachada del cine" },
  { archivo: "palomitas.webp", clase: "es-palomitas", alt: "Cajas de palomitas con la marca Yelmo" },
  { archivo: "mupi.webp", clase: "es-mupi", alt: "Mupi digital con la promoción del menú de cine" },
  { archivo: "entradas.webp", clase: "es-entradas", alt: "Entradas digitales en el móvil" },
  { archivo: "asientos.webp", clase: "es-asientos", alt: "Butacas de sala con la marca" },
];

export default function Aplicaciones() {
  return (
    <section className="ym-seccion">
      <RotuloSeccion es="Aplicaciones" en="Applications" />

      <div className="ym-lamina-apps">
        {PIEZAS.map((p) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={p.archivo} className={`ym-app ${p.clase}`} src={`${RUTA}/${p.archivo}`} alt={p.alt} />
        ))}
        {/* Los cuatro copos sueltos, que en el archivo van por delante de todo.
            Entran como recorte —máscara— y no como imagen: así el color lo pone
            la página y pueden cambiar con el tema sin duplicar el archivo. */}
        <span
          className="ym-copos"
          style={{
            ["--ym-copos" as string]: `url(${RUTA}/copos.svg)`,
          }}
          aria-hidden="true"
        />
      </div>
    </section>
  );
}
