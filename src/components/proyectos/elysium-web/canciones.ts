import type { Era } from "./simbolo";

// El repertorio del test, por álbum.
//
// Vive aquí y no dentro de una pantalla porque ya lo usan dos: el popup de cada
// era, donde se marcan las canciones, y la pantalla que genera el símbolo. Con
// una copia en cada sitio, añadir un tema al tracklist arreglaría una y dejaría
// la otra contando mal.
//
// Son seis canciones conocidas por disco, no la discografía entera. Es una
// MUESTRA deliberada: basta para que el mecanismo se vea, y lo que decide la
// figura es el REPARTO entre discos, no cuántas canciones tenga la lista.
// Cambiarla por el tracklist completo es tocar solo este archivo.
export const CANCIONES: Record<Era, string[]> = {
  "The Fame": ["Just Dance", "Poker Face", "LoveGame", "Paparazzi", "Beautiful, Dirty, Rich", "The Fame"],
  "The Fame Monster": ["Bad Romance", "Telephone", "Alejandro", "Monster", "Speechless", "Dance in the Dark"],
  "Born This Way": ["Born This Way", "Judas", "The Edge of Glory", "Yoü and I", "Marry the Night", "Hair"],
  ARTPOP: ["Applause", "Do What U Want", "G.U.Y.", "Venus", "Dope", "Gypsy"],
  Joanne: ["Perfect Illusion", "Million Reasons", "Joanne", "A-YO", "Diamond Heart", "Grigio Girls"],
  Chromatica: ["Rain on Me", "Stupid Love", "911", "Alice", "Free Woman", "Sour Candy"],
  Mayhem: ["Abracadabra", "Disease", "Garden of Eden", "Vanish Into You", "Die With a Smile", "Perfect Celebrity"],
};

// La clave con la que se guarda una canción marcada. En un solo sitio porque la
// escriben y la leen pantallas distintas: si una compusiera la clave de otra
// manera, lo marcado en un lado no se vería en el otro.
export const claveCancion = (era: Era, cancion: string) => `${era}|${cancion}`;

// Cuántas ha marcado de cada disco. Es el dato del que sale todo lo demás: los
// álbumes sin nada elegido y, al final, los porcentajes de la figura.
export function contarPorEra(
  seleccion: Set<string>,
  eras: readonly Era[]
): Record<Era, number> {
  const cuenta = Object.fromEntries(eras.map((e) => [e, 0])) as Record<Era, number>;
  for (const era of eras) {
    for (const cancion of CANCIONES[era]) {
      if (seleccion.has(claveCancion(era, cancion))) cuenta[era]++;
    }
  }
  return cuenta;
}
