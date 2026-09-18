import ArteMiedo from "./ArteMiedo";
import AppApartados from "./AppApartados";
import DropcapTitle from "@/components/shared/DropcapTitle";
import CtaBanner from "@/components/shared/CtaBanner";
import "./ArteMiedo.css";

// La pata de UI/UX del proyecto: la app que hace legible la exposición.
//
// ESTÁ MONTADA COMO LA APP DE ESPACIO VACÍO, y a propósito: son la misma clase
// de página —el diseño de producto de un proyecto que además tiene su página de
// marca— y el visitante que venga de una debería reconocer la otra. De ahí las
// dos pestañas, el prototipo primero y el sistema después, y la salida al final
// hacia la otra mitad del proyecto.
//
// Lo de arriba —cabecera, ficha y entradilla— no se escribe aquí: es común a
// las tres disciplinas y vive en ArteMiedo.
export default function UiuxLanding() {
  return (
    <ArteMiedo disciplina="uiux">
      <AppApartados />

      {/* Y de vuelta a la marca, que es de donde sale todo esto: la textura del
          escáner que llevan estas pantallas es la misma de los carteles. */}
      <section className="am-seccion">
        <h2 className="project-h2">
          <DropcapTitle es="Páginas recomendadas" en="Recommended pages" />
        </h2>
        <CtaBanner
          href="/proyecto/b3"
          es="Ver la marca de la exposición"
          en="See the exhibition's brand"
          imagen="/banners/el-arte-del-miedo-branding.webp"
          imagenMovil="/banners/el-arte-del-miedo-branding-movil.webp"
          alt="Los carteles de la exposición pegados en un panel de la calle"
        />
      </section>
    </ArteMiedo>
  );
}
