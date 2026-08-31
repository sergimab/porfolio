import Link from "next/link";
import VisorEra from "./VisorEra";
import TestSimbolo from "./TestSimbolo";
import "./WebSimulada.css";

// La web de Elysium funcionando, a pantalla completa.
//
// Va sin la cabecera ni el pie del portfolio a propósito: metida entre ellos se
// leía como una captura de una web, y lo que tiene que parecer es la web. Lo
// único que queda del portfolio es el hilo para volver, arriba y discreto, que
// sin él esto sería un callejón sin salida.
export default function WebSimulada() {
  return (
    <div className="websim">
      <header className="websim-barra">
        <Link className="websim-volver" href="/proyecto/u1">
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none" stroke="currentColor"
            strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6.5 1 1.5 7l5 6" />
          </svg>
          Volver al proyecto
        </Link>
        <span className="websim-marca">ELYSIUM</span>
      </header>

      <main className="websim-cuerpo">
        <section className="websim-portada">
          <h1 className="websim-titulo">
            ¿Qué canciones
            <br />
            te representan?
          </h1>
          <p className="websim-entradilla">
            Cada era de Lady Gaga tiene su símbolo. El tuyo no existe todavía: se
            genera con lo que elijas, y no se parece al de nadie.
          </p>
        </section>

        <section className="websim-seccion">
          <h2 className="websim-h2">Los símbolos de cada era</h2>
          <p className="websim-texto">
            Los modelos que salieron de Blender, aquí dentro, girando en el
            navegador.
          </p>
          <VisorEra />
        </section>

        <section className="websim-seccion">
          <h2 className="websim-h2">Tu símbolo</h2>
          <p className="websim-texto">
            Marca las canciones que te representan. La figura se va formando
            según cuántas elijas de cada disco.
          </p>
          <TestSimbolo />
        </section>
      </main>
    </div>
  );
}
