// Los datos de la marca de Yelmo, transcritos del manual.
//
// Los archivos de dibujo son siluetas monocromas, así que en la página no se
// ponen como imagen sino como MÁSCARA: el SVG recorta y el color lo pone el
// fondo. Es lo que permite pintar la misma pieza en morado en un sitio y con el
// degradado de su submarca en otro, sin exportar una versión por color.
//
// La proporción de cada pieza va aquí porque la caja de la máscara no la puede
// deducir del archivo: se midió una vez sobre el dibujo real —no sobre la mesa
// de trabajo de 2000 × 2000, que es casi todo aire— y los viewBox se recortaron
// a ese mismo encuadre.

export const RUTA = "/proyectos/yelmo/branding";

// El logotipo y el isotipo sueltos. Ahora mismo no los usa ninguna lámina —la
// de «logotipo e isotipo» se quitó—, pero las proporciones están medidas sobre
// el dibujo y recuperarlas cuesta, así que se quedan aquí.
export const PIEZAS = {
  logotipo: { archivo: "logotipo.svg", ratio: 1407.9 / 406.2 },
  isotipo: { archivo: "isotipo.svg", ratio: 405.2 / 481.7 },
} as const;

// La paleta corporativa: tres morados y el turquesa que los despierta.
export const TINTAS = [
  { hex: "#2D1E73", rgb: "45 30 115", cmyk: "100 100 21 6" },
  { hex: "#5025A0", rgb: "80 37 160", cmyk: "86 90 0 0" },
  { hex: "#AB5EEC", rgb: "171 94 236", cmyk: "58 67 0 0" },
  { hex: "#00FFE2", rgb: "0 255 226", cmyk: "58 0 29 0" },
] as const;

// Las tres gradaciones del manual, de un extremo al otro.
export const GRADACIONES = [
  { de: "#2D1E73", a: "#5025A0" },
  { de: "#00FFE2", a: "#2D1E73" },
  { de: "#00FFE2", a: "#AB5EEC" },
] as const;

// Las cuatro submarcas. Cada una se queda con el mismo isotipo y cambia de
// color: es lo que el manual llama inclusión dinámica.
//
// El degradado va de abajo arriba porque así está dibujado en las láminas: el
// tono vivo abajo y el profundo arriba.
export type Submarca = {
  id: string;
  nombre: string;
  archivo: string;
  ratio: number;
  // El degradado de la barra, con todas sus paradas, y el de la pieza, que en
  // junior es más corto: la marca va de amarillo a rosa, y metiéndole el azul
  // se comía el rosa de arriba.
  degradado: string[];
  degradadoPieza?: string[];
  tintas: { hex: string; rgb: string; cmyk: string }[];
};

export const SUBMARCAS: Submarca[] = [
  {
    id: "luxury",
    nombre: "luxury",
    archivo: "submarca-luxury.svg",
    ratio: 1425.8 / 605,
    degradado: ["#B6B7B5", "#264655"],
    tintas: [
      { hex: "#B6B7B5", rgb: "45 30 115", cmyk: "32 23 26 4" },
      { hex: "#264655", rgb: "30 70 85", cmyk: "86 58 45 41" },
    ],
  },
  {
    id: "junior",
    nombre: "junior",
    archivo: "submarca-junior.svg",
    ratio: 1438.4 / 607.4,
    degradado: ["#009FE3", "#3AAA35", "#FFED00", "#DF3088"],
    degradadoPieza: ["#3AAA35", "#FFED00", "#DF3088"],
    tintas: [
      { hex: "#DF3088", rgb: "223 48 136", cmyk: "7 90 2 0" },
      { hex: "#FFED00", rgb: "245 223 15", cmyk: "8 6 92 0" },
      { hex: "#3AAA35", rgb: "122 184 41", cmyk: "59 0 100 0" },
      { hex: "#009FE3", rgb: "90 143 203", cmyk: "68 36 0 0" },
    ],
  },
  {
    id: "mas-que-cine",
    nombre: "+ que cine",
    archivo: "submarca-mas-que-cine.svg",
    ratio: 1422.6 / 606.3,
    degradado: ["#F70388", "#620983"],
    tintas: [
      { hex: "#F70388", rgb: "247 3 136", cmyk: "0 93 0 0" },
      { hex: "#620983", rgb: "98 9 131", cmyk: "80 100 8 1" },
    ],
  },
  {
    id: "macro-xe",
    nombre: "macro xe",
    archivo: "submarca-macro-xe.svg",
    ratio: 1439.4 / 590.4,
    degradado: ["#DB3262", "#1C1124"],
    tintas: [
      { hex: "#DB3262", rgb: "223 55 101", cmyk: "5 89 38 0" },
      { hex: "#1C1124", rgb: "31 17 36", cmyk: "87 91 50 74" },
    ],
  },
];
