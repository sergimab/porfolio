import LangText from "@/components/shared/LangText";
import RotuloSeccion from "@/components/shared/RotuloSeccion";
import "./Aplicaciones.css";

// Las aplicaciones de la marca, montadas como la lámina del proyecto: sobre el
// morado con el isotipo repetido y torcido, y las piezas superpuestas entre sí
// —las palomitas arriba, el mupi a la derecha, las entradas cruzando por
// delante, la fachada abajo y las butacas cerrando—.
//
// Cada pieza va colocada en PORCENTAJES sobre una caja de proporción fija: así
// la composición se mantiene igual a cualquier ancho, que es lo que la hace una
// lámina y no cuatro fotos seguidas.
const RUTA = "/proyectos/yelmo/branding/aplicaciones";

const PIEZAS = [
  {
    archivo: "palomitas.webp",
    clase: "es-palomitas",
    alt: "Cajas de palomitas con la marca Yelmo",
  },
  {
    archivo: "mupi.webp",
    clase: "es-mupi",
    alt: "Mupi digital con la promoción del menú de cine",
  },
  {
    archivo: "moviles.webp",
    clase: "es-moviles",
    alt: "Entradas digitales en el móvil",
  },
  {
    archivo: "fachada.webp",
    clase: "es-fachada",
    alt: "Rótulo de Yelmo luxury en la fachada del cine",
  },
  {
    archivo: "asientos.webp",
    clase: "es-asientos",
    alt: "Butacas de sala con la marca",
  },
];

export default function Aplicaciones() {
  return (
    <section className="ym-seccion">
      <RotuloSeccion es="Aplicaciones" en="Applications" />
      <p className="ym-entradilla">
        <LangText
          es="La marca puesta a trabajar: el envase de palomitas, la cartelería del hall, la entrada en el móvil, el rótulo de la fachada y la sala."
          en="The brand at work: the popcorn box, the lobby signage, the ticket on your phone, the sign on the building and the screening room."
        />
      </p>

      <div className="ym-lamina-apps">
        {PIEZAS.map((p) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={p.archivo} className={`ym-app ${p.clase}`} src={`${RUTA}/${p.archivo}`} alt={p.alt} />
        ))}
      </div>
    </section>
  );
}
