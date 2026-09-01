import type { TrazoHecho } from "@/components/proyectos/elysium/LienzoMetal";

// El generador de símbolos de Elysium.
//
// La regla es la que cuenta la propia página de Elysium: hay un gráfico
// circular con siete puntas, una por álbum, y cuantas más canciones eliges de
// un disco más se estira la figura hacia su punta. La línea empieza en el
// centro, en el cero, viaja primero al álbum con el porcentaje más alto, salta
// al siguiente y al siguiente, y se cierra sobre su punto de partida.
//
// Todo el carácter de la figura sale de que esos dos órdenes NO son el mismo:
// las puntas están repartidas en orden de DISCOGRAFÍA, mientras que el
// recorrido va de más a menos votado. Si coincidieran, la línea daría la vuelta
// al círculo sin cruzarse nunca y saldría un polígono; al no coincidir, la
// línea se cruza consigo misma y de esos cruces nacen las masas.

// Las siete puntas, en el orden en que salieron los discos. Es el que fija
// dónde cae cada una alrededor del círculo.
export const ERAS = [
  "The Fame",
  "The Fame Monster",
  "Born This Way",
  "ARTPOP",
  "Joanne",
  "Chromatica",
  "Mayhem",
] as const;

export type Era = (typeof ERAS)[number];

// Cuánto del ancho del lienzo ocupa la figura de lado a lado, como mucho. No
// llega a 1 para que las agujas de los vértices —que salen POR FUERA de la
// línea— quepan dentro y no se corten contra el borde.
const EXTENSION = 0.4;
// Radio mínimo de una punta, en fracción de la mayor. Un álbum sin nada elegido
// NO se salta: se le deja una punta corta.
//
// Es lo que hace que toda figura tenga las siete direcciones y, con ellas,
// carácter. Saltándose los ceros, quien elige de dos discos obtiene una línea
// de ida y vuelta —dos vértices— que no es un símbolo, es una raya; y quien
// elige de uno, una línea doblada sobre sí misma. Con la punta corta, esos
// mismos casos salen como una estrella muy asimétrica: un brazo largo y seis
// cortos. Y sigue diciendo la verdad, porque cerca del centro es exactamente lo
// que significa no haber elegido nada de ese disco.
const RADIO_MINIMO = 0.22;
// Lo que debe medir la figura de lado a lado una vez encajada, en fracción del
// lienzo. Ver el reencuadre al final.
const ENCAJE = 0.66;
// Grosor de la cinta, en la misma escala relativa. Es el radio, no el ancho.
//
// Va en fracción del lienzo y no en píxeles a propósito: así la figura se ve
// igual de proporcionada en el marco grande de escritorio que en el de móvil.
// En píxeles, un valor bueno en uno de los dos sale de alambre en el otro.
//
// Subió de 0,016 al encajar la figura. Encajarla la agranda, y como el grosor
// es constante, la cinta se quedaba proporcionalmente el doble de fina: un
// alambre. Y un alambre no tiene sitio para el material —ni cara ancha que
// refleje el cielo ni fondo donde quepan las líneas del canto—, así que por muy
// bien resuelto que esté el vidrio, no se ve. El grosor es lo que le da
// superficie donde ocurrir.
//
// Y una segunda subida, hasta 0,044, buscando la referencia: allí las caras
// anchas son casi blancas porque son PLANAS y reflejan el cielo de frente. Con
// la cinta estrecha casi todo es canto volcado, y el canto refleja el suelo,
// que es oscuro. La cara ancha solo aparece si hay ancho.
const GROSOR = 0.044;
// Puntos por tramo recto. El lienzo remuestrea por su cuenta, pero necesita
// bastantes puntos crudos para que su suavizado no redondee los vértices, que
// es justo donde nacen las puntas.
const POR_TRAMO = 14;

// De porcentajes a la figura, en las coordenadas relativas del lienzo.
//
// `pesos` no tiene por qué sumar 100 ni estar acotado: lo único que importa es
// la proporción entre unos y otros, porque la figura se NORMALIZA —el álbum más
// votado llega siempre al borde—. Sin normalizar, alguien que eligiera pocas
// canciones obtendría una figura diminuta, más pequeña que la distancia a la
// que el metal se funde, y saldría un borrón en vez de un símbolo. Lo que dice
// algo de una persona es el reparto entre discos, no cuántas canciones marcó.
export function figuraDeEras(pesos: Record<Era, number>): TrazoHecho[] {
  const maximo = Math.max(...ERAS.map((e) => pesos[e] || 0));
  // Nadie ha elegido nada: no hay figura que dibujar. Devolver un trazo aquí
  // pintaría un punto en medio del lienzo como si fuera un resultado.
  if (maximo <= 0) return [];

  const cx = 0.5;
  // El lienzo mide la y en fracción del ANCHO, no del alto. Que el centro
  // vertical sea también 0,5 no es casualidad ni descuido: es que el marco del
  // símbolo es CUADRADO —lo fija .testsim-simbolo en el CSS— porque la figura
  // es radial y en un marco apaisado saldría estirada. Si ese marco dejara de
  // ser cuadrado, este número deja de valer.
  const cy = 0.5;

  const punto = (era: Era): [number, number] => {
    const i = ERAS.indexOf(era);
    // Se empieza arriba y se gira a favor del reloj.
    const angulo = (-90 + (i * 360) / ERAS.length) * (Math.PI / 180);
    const proporcion = (pesos[era] || 0) / maximo;
    // El mínimo se suma por debajo en vez de sustituir: así un disco con una
    // canción sigue quedando por delante de uno con ninguna, que es lo que
    // hace que el reparto se siga leyendo en la forma.
    const radio = EXTENSION * (RADIO_MINIMO + (1 - RADIO_MINIMO) * proporcion);
    return [cx + radio * Math.cos(angulo), cy + radio * Math.sin(angulo)];
  };

  // Ahora se visitan los SIETE, de más votado a menos. Los empates —y los ceros
  // lo son entre sí— se deshacen por el orden de la discografía, que es un
  // criterio fijo: sin él, dos personas con las mismas respuestas podrían
  // obtener figuras distintas según cómo hubiera ordenado el navegador.
  const recorrido = [...ERAS].sort(
    (a, b) => (pesos[b] || 0) - (pesos[a] || 0) || ERAS.indexOf(a) - ERAS.indexOf(b)
  );

  let vertices: [number, number][] = [
    [cx, cy],
    ...recorrido.map(punto),
    [cx, cy],
  ];

  // Encaje: se lleva la figura al centro del lienzo y se escala para que ocupe
  // siempre lo mismo.
  //
  // Sin esto, el tamaño y la posición dependían de qué eras se hubieran elegido:
  // una figura tirando a un solo lado se iba a esa esquina y dejaba media
  // pantalla vacía, y una de radios parecidos ocupaba el doble que otra de
  // radios pequeños. Midiendo su caja y ajustándola, todas llegan igual de
  // grandes y centradas, y lo que las distingue pasa a ser su FORMA, que es lo
  // único que debería distinguirlas.
  const xs = vertices.map((v) => v[0]);
  const ys = vertices.map((v) => v[1]);
  const ancho = Math.max(...xs) - Math.min(...xs);
  const alto = Math.max(...ys) - Math.min(...ys);
  const mayor = Math.max(ancho, alto);
  if (mayor > 1e-4) {
    const k = ENCAJE / mayor;
    const mx = (Math.min(...xs) + Math.max(...xs)) / 2;
    const my = (Math.min(...ys) + Math.max(...ys)) / 2;
    vertices = vertices.map(([x, y]) => [cx + (x - mx) * k, cy + (y - my) * k]);
  }

  // Un solo trazo, sin levantar el lápiz: es lo que hace que la figura se funda
  // consigo misma en el centro, donde convergen las siete líneas.
  const trazo: TrazoHecho = [];
  for (let i = 0; i < vertices.length - 1; i++) {
    const [x1, y1] = vertices[i];
    const [x2, y2] = vertices[i + 1];
    for (let k = 0; k < POR_TRAMO; k++) {
      const t = k / POR_TRAMO;
      trazo.push({ x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t, r: GROSOR });
    }
  }
  const [ux, uy] = vertices[vertices.length - 1];
  trazo.push({ x: ux, y: uy, r: GROSOR });
  return [trazo];
}
