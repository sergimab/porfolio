import { Raleway } from "next/font/google";

// Raleway, la tipografía del proyecto.
//
// Con `next/font/google` y no con un <link> a fonts.googleapis.com: así el
// archivo se sirve desde el propio sitio —no hay una segunda conexión a un
// dominio ajeno antes de poder pintar el texto— y Next solo lo carga en las
// páginas que la usan, que aquí son las de este proyecto y no las demás.
//
// Sin lista de pesos: en Google, Raleway es VARIABLE, así que un solo archivo
// cubre de 100 a 900. Pidiendo pesos sueltos se descargaría uno por cada uno.
//
// `swap`: mientras llega, el texto se lee con la del sistema en vez de quedarse
// invisible. En una lámina de muestra eso significa ver la letra equivocada un
// instante, que es mucho mejor que ver un hueco en blanco.
export const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
  display: "swap",
});
