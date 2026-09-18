import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SkillDropClient from "@/components/home/SkillDropClient";
import "./page.css";

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <main className="main-content" style={{ paddingTop: "48px", paddingBottom: "48px", flex: 1 }}>
        {/* El título de la página, solo para quien la escucha. A la vista no
            hace falta —el saludo de la cabecera y las cápsulas ya dicen dónde
            estás—, pero sin él esta página no tenía encabezado de primer nivel:
            quien la abre con un lector de pantalla y pide «el título» no
            encontraba nada, y los buscadores tampoco. */}
        <h1 className="sr-only">Sergio Martín Barahona · Diseñador gráfico</h1>
        <SkillDropClient />
        {/* El lema, DENTRO del main: colgado fuera se quedaba en tierra de nadie
            —ni contenido principal ni pie— y quien navega por regiones con el
            lector de pantalla no llegaba a él por ningún lado. */}
        <div style={{ display: "flex", justifyContent: "center", padding: "24px 24px 0" }}>
        <div className="tagline-wrap" style={{ maxWidth: "240px", width: "100%" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {/* Con alt, y no vacío: el archivo es TEXTO dibujado, así que vaciarle
              el alt lo borra para quien no ve la imagen. */}
          <img src="/marca/tagline-text.svg" alt="Diving into the digital art ocean" className="tagline-img" style={{ width: "100%", height: "auto" }} />
          </div>
        </div>
      </main>
      <div className="header-wrap">
        <Footer />
      </div>
    </div>
  );
}
