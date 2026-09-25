import type { Era } from "./simbolo";

// El repertorio del test, por álbum.
//
// Vive aquí y no dentro de una pantalla porque ya lo usan dos: el popup de cada
// era, donde se marcan las canciones, y la pantalla que genera el símbolo. Con
// una copia en cada sitio, añadir un tema al tracklist arreglaría una y dejaría
// la otra contando mal.
//
// Los tracklists completos, tal y como los pasó Sergio. El orden es el del
// disco, no el alfabético: en un álbum el orden ES parte de la obra.
//
// Ojo a una consecuencia de tenerlos completos: las listas son MUY desiguales
// —siete canciones The Fame Monster, diecisiete Mayhem—, y eso no distorsiona
// la figura porque lo que la decide es el reparto entre discos y no el número
// absoluto. Pero sí quiere decir que marcar "todo Mayhem" pesa mucho más que
// marcar "todo The Fame Monster".
export const CANCIONES: Record<Era, string[]> = {
  "The Fame": [
    "Just Dance", "LoveGame", "Paparazzi", "Poker Face",
    "Eh, Eh (Nothing Else I Can Say)", "Beautiful, Dirty, Rich", "The Fame",
    "Money Honey", "Starstruck", "Boys Boys Boys", "Paper Gangsta",
    "Brown Eyes", "Summerboy", "Disco Heaven",
  ],
  "The Fame Monster": [
    "Bad Romance", "Alejandro", "Monster", "Speechless", "Dance in the Dark",
    "Telephone", "So Happy I Could Die", "Teeth",
  ],
  "Born This Way": [
    "Marry the Night", "Born This Way", "Government Hooker", "Judas",
    "Americano", "Hair", "Scheiße", "Bloody Mary", "Bad Kids",
    "Highway Unicorn (Road To Love)", "Heavy Metal Lover", "Electric Chapel",
    "Yoü And I", "The Edge Of Glory",
  ],
  ARTPOP: [
    "Aura", "Venus", "G.U.Y.", "Sexxx Dreams", "Jewels N' Drugs", "MANiCURE",
    "Do What U Want", "ARTPOP", "Swine", "Donatella", "Fashion!",
    "Mary Jane Holland", "Dope", "Gypsy", "Applause",
  ],
  Joanne: [
    "Diamond Heart", "A-Yo", "Joanne", "John Wayne", "Dancin' in Circles",
    "Perfect Illusion", "Million Reasons", "Sinner's Prayer", "Come to Mama",
    "Hey Girl", "Angel Down",
  ],
  Chromatica: [
    "Chromatica I", "Alice", "Stupid Love", "Rain On Me", "Free Woman",
    "Fun Tonight", "Chromatica II", "911", "Plastic Doll", "Sour Candy",
    "Enigma", "Replay", "Chromatica III", "Sine From Above", "1000 Doves",
    "Babylon",
  ],
  Mayhem: [
    "Disease", "Abracadabra", "Garden of Eden", "Perfect Celebrity",
    "Can't Stop the High", "Vanish Into You", "Killah", "Zombieboy",
    "The Dead Dance", "LoveDrug", "How Bad Do U Want Me", "Don't Call Tonight",
    "Kill for Love", "Shadow of a Man", "The Beast", "Blade of Grass",
    "Die With a Smile",
  ],
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

// Una selección al azar, para probar formas deprisa.
//
// PROVISIONAL: existe solo para el botón de pruebas de la pantalla de las eras.
// Cuando el test esté cerrado, se van los dos.
//
// El azar está sesgado a propósito. Repartiendo uniformemente, casi todas las
// tiradas salen con los siete discos a media tabla y las figuras se parecen
// entre sí; lo interesante de probar son los extremos —un disco arrasando, dos
// o tres a cero—, así que se sortea primero QUÉ PERFIL tiene esta tirada y
// luego se rellena en consecuencia.
export function seleccionAlAzar(eras: readonly Era[]): Set<string> {
  const puesta = new Set<string>();
  const dado = (n: number) => Math.floor(Math.random() * n);

  // Cuántos discos se quedan sin nada: de cero a tres.
  const vacios = new Set<Era>();
  const cuantosVacios = dado(4);
  while (vacios.size < cuantosVacios) vacios.add(eras[dado(eras.length)]);

  for (const era of eras) {
    if (vacios.has(era)) continue;
    const lista = CANCIONES[era];
    // Entre una canción y el disco entero, con el sesgo hacia abajo para que
    // haya brazos finos: elevar al cuadrado un número entre 0 y 1 amontona los
    // resultados cerca del cero.
    const t = Math.random() * Math.random();
    const cuantas = 1 + Math.floor(t * (lista.length - 1));
    const barajada = [...lista].sort(() => Math.random() - 0.5);
    for (const cancion of barajada.slice(0, cuantas)) {
      puesta.add(claveCancion(era, cancion));
    }
  }
  return puesta;
}

// Lo que pide el generador: la fracción marcada de cada disco, de 0 a 1, en el
// orden de ERAS. Es el dato del gráfico —cada eje un álbum, cada valor su
// porcentaje— y de él sale la figura entera.
export function fraccionPorEra(
  seleccion: Set<string>,
  eras: readonly Era[]
): number[] {
  const cuenta = contarPorEra(seleccion, eras);
  return eras.map((e) => cuenta[e] / CANCIONES[e].length);
}
