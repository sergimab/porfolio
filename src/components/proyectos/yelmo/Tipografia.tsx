import { Dosis } from "next/font/google";
import LangText from "@/components/shared/LangText";
import RotuloSeccion from "@/components/shared/RotuloSeccion";
import "./Tipografia.css";

// La tipografía de la marca, con las dos fuentes de verdad puestas.
//
// Dosis viene de Google y la sirve Next con el resto del sitio; Somatic Rounded
// no está en Google, así que va desde /fonts como la Clash Grotesk de Espacio
// vacío. Enseñar una muestra tipográfica en otra fuente sería enseñar otra
// cosa, así que aquí no valen las capturas.
const dosis = Dosis({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--ym-dosis",
  display: "swap",
});

const PESOS = [
  { nombre: "Bold", peso: 700 },
  { nombre: "Medium", peso: 500 },
  { nombre: "Regular", peso: 400 },
  { nombre: "Light", peso: 300 },
];

export default function Tipografia() {
  return (
    <section className={`ym-seccion ym-tipo ${dosis.variable}`}>
      <RotuloSeccion es="Tipografía" en="Typography" />

      <h3 className="ym-subrotulo">
        <LangText es="Corporativa" en="Corporate" />
      </h3>
      <div className="ym-tipo-fila">
        {/* El logotipo está dibujado a partir de ella, así que la muestra es la
            propia marca escrita con la fuente. */}
        <p className="ym-tipo-marca">yelmo</p>
        <div className="ym-tipo-ficha">
          <span className="ym-tipo-etiqueta">
            <LangText es="Nombre" en="Name" />
          </span>
          <div className="ym-tipo-nombre">
            <p className="ym-tipo-familia">
              Somatic
              <br />
              Rounded
            </p>
            <p className="ym-tipo-muestra">Aa 123</p>
          </div>
        </div>
      </div>

      <h3 className="ym-subrotulo">
        <LangText es="Auxiliar" en="Secondary" />
      </h3>
      <div className="ym-tipo-auxiliar">
        <div>
          <span className="ym-tipo-etiqueta">
            <LangText es="Títulos" en="Headings" />
          </span>
          <div className="ym-tipo-par es-dosis">
            <p className="ym-tipo-familia es-oscura">Dosis</p>
            <p className="ym-tipo-muestra es-dosis">Aa 123</p>
          </div>
          <span className="ym-tipo-etiqueta es-pie">Dosis Font</span>
          <ul className="ym-tipo-pesos">
            {PESOS.map((p) => (
              <li key={p.nombre} style={{ fontWeight: p.peso }}>
                <span>{p.nombre}</span>
                <span>AaBbCc 12345</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <span className="ym-tipo-etiqueta">
            <LangText es="Texto corrido" en="Body copy" />
          </span>
          <div className="ym-tipo-par es-dosis">
            <p className="ym-tipo-familia es-ligera">Dosis Light</p>
            <p className="ym-tipo-muestra es-dosis es-ligera">Aa 123</p>
          </div>
          <p className="ym-tipo-parrafo">
            Lorem ipsum dolor sit amet, consecteLorem ipsum dolor sit amet,
            consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut
            laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam,
            quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip
            ex ea commodo consequa amet, consectetuer adipiscing elit, sed diam
            nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
            volutpat. Ut
          </p>
        </div>
      </div>
    </section>
  );
}
