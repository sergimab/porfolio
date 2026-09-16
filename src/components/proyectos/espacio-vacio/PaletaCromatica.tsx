import LangText from "@/components/shared/LangText";
import RotuloSeccion from "@/components/shared/RotuloSeccion";
import "./PaletaCromatica.css";

// La lámina de paleta cromática del manual, montada en web.
//
// Se respeta su composición asimétrica —los neutros arriba a la derecha y los
// cromáticos abajo a la izquierda—, porque en la lámina el espacio vacío entre
// los dos bloques es parte del diseño y no una casualidad del maquetado.
//
// Los datos van transcritos del manual. Dos cosas se corrigieron al pasarlos, y
// conviene saberlo por si hay que volver al archivo original: el blanco venía
// escrito con cuatro efes en vez de seis, y el negro traía cuatro números en el
// HSL, donde solo caben tres.
type Muestra = {
  nombre: string;
  nombreEn: string;
  hex: string;
  rgb: string;
  hsl: string;
  cmyk: string;
  // Para el blanco: sin contorno se pierde contra el papel.
  contorno?: boolean;
  // Para qué sirve ese color dentro de la app.
  uso?: string;
  usoEn?: string;
};

const NEUTROS: Muestra[] = [
  { nombre: "Negro", nombreEn: "Black", hex: "#252221", rgb: "37 34 34", hsl: "0 4 14", cmyk: "0 8 8 85" },
  { nombre: "Blanco", nombreEn: "White", hex: "#FFFFFF", rgb: "255 255 255", hsl: "0 0 100", cmyk: "0 0 0 0", contorno: true },
  { nombre: "Gris", nombreEn: "Grey", hex: "#EDEDED", rgb: "237 237 237", hsl: "0 0 93", cmyk: "9 7 7 0" },
];

const CROMATICOS: Muestra[] = [
  {
    nombre: "Morado", nombreEn: "Purple", hex: "#A484FF", rgb: "164 132 255", hsl: "256 100 76", cmyk: "36 48 0 0",
    uso: "Aficiones", usoEn: "Hobbies",
  },
  {
    nombre: "Rosa", nombreEn: "Pink", hex: "#FF5C5C", rgb: "255 92 92", hsl: "0 100 68", cmyk: "0 64 64 0",
    uso: "Relaciones personales", usoEn: "Personal relationships",
  },
  {
    nombre: "Naranja", nombreEn: "Orange", hex: "#FFAE11", rgb: "255 174 17", hsl: "40 100 53", cmyk: "0 32 93 0",
    uso: "Logros", usoEn: "Achievements",
  },
  {
    nombre: "Verde", nombreEn: "Green", hex: "#A1F08D", rgb: "161 240 141", hsl: "108 77 75", cmyk: "97 29 0 71",
    uso: "Hábitos saludables", usoEn: "Healthy habits",
  },
];

function Ficha({ m }: { m: Muestra }) {
  return (
    <figure className="ev-muestra">
      {m.uso && (
        <figcaption className="ev-muestra-uso">
          <LangText es={m.uso} en={m.usoEn ?? m.uso} />
        </figcaption>
      )}
      <span
        className={`ev-muestra-disco${m.contorno ? " es-contorno" : ""}`}
        style={{ background: m.hex }}
        aria-hidden="true"
      />
      <div className="ev-muestra-datos">
        <p className="ev-muestra-nombre">
          <LangText es={m.nombre} en={m.nombreEn} />
        </p>
        {/* Los cuatro sistemas, cada uno en su línea y con la etiqueta delante,
            que es como están en la lámina. El hex va sin etiqueta porque ahí
            tampoco la lleva: se reconoce por la almohadilla. */}
        <p className="ev-muestra-valores">
          {m.hex}
          <br />
          RGB: {m.rgb}
          <br />
          HSL: {m.hsl}
          <br />
          CMYK: {m.cmyk}
        </p>
      </div>
    </figure>
  );
}

export default function PaletaCromatica() {
  return (
    <section className="ev-paleta">
      <RotuloSeccion className="ev-paleta-titulo" es="Paleta cromática" en="Colour palette" />

      {/* Los neutros, arriba y a la derecha. */}
      <div className="ev-paleta-fila es-derecha">
        {NEUTROS.map((m) => (
          <Ficha key={m.hex} m={m} />
        ))}
      </div>

      {/* Y los cuatro colores de la app, abajo y a la izquierda. Cada uno
          nombra una de las cosas que la persona registra a mano, así que el
          color no es decoración: es lo que distingue una actividad de otra en
          toda la interfaz. */}
      <div className="ev-paleta-fila es-izquierda">
        {CROMATICOS.map((m) => (
          <Ficha key={m.hex} m={m} />
        ))}
      </div>
    </section>
  );
}
