// EL CATÁLOGO DE PROYECTOS, en un solo sitio.
//
// Vivía dentro de la home, que es donde se usaba, pero desde que las páginas de
// proyecto también recomiendan proyectos hacía falta en dos sitios a la vez. Y
// un catálogo duplicado es un catálogo que se desincroniza: se le cambia el
// nombre a un proyecto en un lado y en el otro sigue el viejo.
//
// De aquí salen el título en los dos idiomas, la portada y el tono de la
// categoría, que es lo que pinta la banda de color de cada tarjeta.

export type Categoria = {
  id: string;
  label: string;
  labelEn: string;
  color: string;
  border: string;
  hue: number;
  /** La banda al revés: fondo encendido en vez de oscuro. Ver LUMINANCIA_CLARA
   *  en organico.ts. */
  claro?: boolean;
};

export const CATEGORIAS: Categoria[] = [
  // Motion y Fotografía se intercambiaron el color: el azul es de Motion y el
  // ámbar de Fotografía. Al cambiar el tono hay que cambiar también el de la
  // página del proyecto de Motion, que lo saca de aquí.
  { id: "motion",     label: "Motion Graphics", labelEn: "Motion Graphics", color: "rgba(37,99,235,0.12)",  border: "rgba(37,99,235,0.6)",   hue: 217 },
  { id: "branding",   label: "Branding",        labelEn: "Branding",        color: "rgba(219,39,119,0.12)", border: "rgba(219,39,119,0.6)",  hue: 330 },
  // LA ÚNICA CÁPSULA CLARA. Ver LUMINANCIA_CLARA en organico: el naranja es el
  // único tono de las siete que al oscurecerse no se apaga, se convierte en
  // marrón. Así que esta lleva la banda al revés —fondo encendido y nombre en
  // tinta— y es la forma de que se vea naranja de verdad.
  { id: "fotografia", label: "Fotografía",      labelEn: "Photography",     color: "rgba(217,119,6,0.15)",  border: "rgba(217,119,6,0.7)",   hue: 32, claro: true },
  { id: "iberdrola",  label: "Iberdrola",       labelEn: "Iberdrola",       color: "rgba(22,163,74,0.12)",  border: "rgba(22,163,74,0.6)",   hue: 142 },
  { id: "uiux",       label: "UI / UX",         labelEn: "UI / UX",         color: "rgba(13,148,136,0.12)", border: "rgba(13,148,136,0.6)",  hue: 175 },
  { id: "3d",         label: "3D",              labelEn: "3D",              color: "rgba(124,58,237,0.12)", border: "rgba(124,58,237,0.6)",  hue: 262 },
  // Rojo, y no el verde lima de antes: aquel tono quedaba a 58° del verde de
  // Iberdrola y a esa distancia los dos verdes se confundían de un vistazo. El
  // 1 es el punto más alejado del hueco que queda libre —a 31° del rosa de
  // Branding por un lado y a 31° del ámbar de Motion por el otro—, así que
  // reparte a partes iguales lo poco que hay.
  { id: "editorial",  label: "Editorial",       labelEn: "Editorial",       color: "rgba(220,38,38,0.13)",  border: "rgba(220,38,38,0.6)",   hue: 1   },
];

export type Proyecto = { id: string; title: string; titleEn: string; cover?: string };

export const PROYECTOS: Record<string, Proyecto[]> = {
  motion: [
    { id: "m1", title: "Motion Yelmo Cines", titleEn: "Yelmo Cines motion", cover: "/covers/motion-yelmo.webp" },
    { id: "m2", title: "Motion El Arte del Miedo", titleEn: "The Art of Fear motion", cover: "/covers/el-arte-del-miedo-motion.webp" },
  ],
  branding: [
    { id: "b1", title: "Espacio vacío", titleEn: "Empty space", cover: "/covers/espacio-vacio.webp" },
    { id: "b2", title: "Rebranding Yelmo Cines", titleEn: "Yelmo Cines rebranding", cover: "/covers/rebranding-yelmo.webp" },
    { id: "b3", title: "El Arte del Miedo", titleEn: "The Art of Fear", cover: "/covers/el-arte-del-miedo-branding.webp" },
    { id: "b4", title: "Rebranding Sala Equis", titleEn: "Sala Equis rebranding", cover: "/covers/rebranding-sala-equis.webp" },
  ],
  fotografia: [
    { id: "f1", title: "Afiche Orquesta Tokio", titleEn: "Orquesta Tokio poster", cover: "/covers/orquesta-tokio.webp" },
    { id: "f2", title: "Galería Orquesta Tokio", titleEn: "Orquesta Tokio gallery", cover: "/covers/orquesta-tokio-fotos.webp" },
  ],
  iberdrola: [
    { id: "i2", title: "Sistema de diseño", titleEn: "Design system" },
    { id: "i5", title: "Sistema de ilustraciones", titleEn: "Illustration system", cover: "/covers/sistema-ilustraciones.svg" },
    { id: "i1", title: "Infografías", titleEn: "Infographics", cover: "/covers/infografias.webp" },
    { id: "i3", title: "Newsletters", titleEn: "Newsletters", cover: "/covers/newsletters.webp" },
    { id: "i4", title: "Iconografía", titleEn: "Iconography", cover: "/covers/iberdrola-iconografia.svg" },
  ],
  uiux: [
    { id: "u1", title: "Web de Elysium", titleEn: "Elysium website", cover: "/covers/elysium-web.webp" },
    { id: "u2", title: "App Espacio vacío", titleEn: "Empty space app", cover: "/covers/espacio-vacio-app.webp" },
    { id: "u3", title: "App El Arte del Miedo", titleEn: "The Art of Fear app", cover: "/covers/el-arte-del-miedo-app.webp" },
    { id: "u4", title: "Web Portfolio", titleEn: "Portfolio website", cover: "/covers/sistema-porfolio.webp" },
  ],
  "3d": [
    { id: "d1", title: "Elysium", titleEn: "Elysium", cover: "/covers/elysium-3D.webp" },
  ],
  editorial: [
    { id: "e1", title: "Disco Elysium", titleEn: "Disco Elysium", cover: "/covers/elysium-editorial.webp" },
  ],
};

/** Un proyecto con el tono de su categoría, buscado por su id. Devuelve null si
 *  el id no existe, que es mejor que reventar la página por una errata. */
export function buscarProyecto(id: string): (Proyecto & { hue: number; claro?: boolean }) | null {
  for (const cat of CATEGORIAS) {
    const p = PROYECTOS[cat.id]?.find(x => x.id === id);
    if (p) return { ...p, hue: cat.hue, claro: cat.claro };
  }
  return null;
}
