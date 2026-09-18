// LAS SIETE OBRAS DE LA APP, con la fobia que esconde cada una.
//
// Es el contenido del proyecto, no adorno: la exposición existe para que un
// cuadro sin cartela cuente qué miedo hay dentro, así que estos textos son la
// pieza central. Están transcritos de las pantallas de alta fidelidad, tal cual
// se escribieron allí.
//
// Van en su propio archivo y no dentro del prototipo porque los usan tres sitios
// distintos —la ficha que se abre al escanear, la galería y el listado de
// fobias—, y tenerlos repetidos sería el camino más corto a que una pantalla
// diga una cosa y la de al lado otra.
//
// SIN TRADUCIR. El resto del sitio cambia de idioma, pero estos textos son el
// contenido de la app tal y como se entregó, y traducirlos a ojo sería inventar
// una versión que nunca existió. Lo que sí cambia de idioma es la interfaz que
// los rodea: los botones, los rótulos y los avisos.

export type Fobia = {
  /** Sirve de clave y de nombre de archivo de su cuadro. */
  id: string;
  nombre: string;
  /** Qué es esa fobia. */
  fobia: string;
  /** La obra: título, año y lo que tiene que ver con el miedo. */
  obra: string;
  anio: number;
  cuadro: string;
  /**
   * Cuánto se repite entre los visitantes, de 0 a 1. Es el dato que dibuja la
   * barra del listado.
   */
  peso: number;
};

export const FOBIAS: Fobia[] = [
  // EL ORDEN ES EL DE LA COLECCIÓN: el mismo en que se entregaron las
  // pantallas. Es lo que ve el visitante al abrir la galería, así que no puede
  // quedarse en el orden en que a uno le vino bien escribirlas. El listado de
  // «Analiza» no lo hereda: aquel se ordena solo, de la más común a la menos.
  {
    id: "autofobia",
    nombre: "Autofobia",
    fobia: "Es un padecimiento a nivel psicológico, donde alguien expresa un miedo irracional por quedarse solo, incluso la posibilidad de estar sin compañía por unas horas, les causa espanto. Pero no se trata únicamente de la soledad, de no tener a alguien físicamente, sino esta fobia también abarca el no sentirse querido dentro de un entorno, por eso es tan importante que se busque ayuda emocional para lidiar con todo el proceso, ya que la recuperación suele ser un poco más lenta de lo normal.",
    obra: "El mundo de Christina",
    anio: 1948,
    cuadro: "El cuadro de Andrew Wyeth es un paisaje real sobre el que decidió pintar a Christina Olsen, una mujer que vivía justo a lado de su casa a quien la polio dejó paralítica. En el basto maizal sobre el que vemos tirada a Cristina también percibimos la angustia de sentirse lejos y sola, por lo que la pintura de este artista realista se convierte en el terror más grande de la autofobia.",
    peso: 0.71,
  },
  {
    id: "necrofobia",
    nombre: "Necrofobia",
    fobia: "Es la fobia o miedo a la muerte o a las cosas muertas. Incluye, aunque no se limita, al miedo a la propia muerte. Necrofobia es el miedo a la muerte, a las cosas muertas (por ejemplo, cadáveres) así como a ciertas cosas asociadas a la muerte (por ejemplo, ataúdes). Quienes padecen de esta condición no pueden explicar con claridad el sentimiento escalofriante que experimentan al estar frente a una momia o a un cadáver.",
    obra: "Iván el Terrible y su hijo",
    anio: 1885,
    cuadro: "Iván el Terrible fue un zar ruso que Iliá Yefímovich Repin decidió retratar en una de sus más famosas pinturas para horrorizarnos con la escena en al que Iván abraza a su hijo agonizante, a quien acaba de golpear y herir mortalmente en un arrebato de furia. La mirada de horror de Iván resalta en la profundidad de la pintura y contrasta con la expresión de serenidad de su hijo. Por lo que este óleo se vuelve insoportable para cualquiera que sufra de necrofobia.",
    peso: 0.38,
  },
  {
    id: "entomofobia",
    nombre: "Entomofobia",
    fobia: "La entomofobia es un miedo irracional y persistente que se manifiesta ante la presencia de insectos, y puede aparecer en cualquier lugar, ya sea al acampar en la montaña, al pasear por el parque, al salir a correr por la playa o al visitar una casa rural. Y es que esta fobia, a pesar de que pueda parecer ridícula en algunos casos por la inofensividad de algunos insectos, crea un gran malestar a la persona que lo sufre, que siente una gran ansiedad y angustia y un intento exagerado de evitar el estímulo temido.",
    obra: "El Gran Masturbador",
    anio: 1929,
    cuadro: "Dalí sentía una inexplicable fascinación por las moscas y a su vez padecía una fobia insufrible a los saltamontes. Ese insecto que aparece o se sugiere en algunas de sus obras, era uno de sus mayores temores. Y aunque el excéntrico artista parecía indestructible viajando por París en un Rolls Royce repleto de coliflores o subiendo un caballo blanco a su habitación de hotel en esa misma ciudad, realmente había un bicho que podía perturbarlo hasta la locura.",
    peso: 0.44,
  },
  {
    id: "claustrofobia",
    nombre: "Claustrofobia",
    fobia: "Es la manera de clasificar el miedo a los espacios cerrados. Se trata de un trastorno de ansiedad y se diagnostica como ansiedad de tipo fóbico. Las personas que padecen claustrofobia presentan un miedo intenso e incontrolable a los lugares cerrados de los que creen que no van a poder salir fácilmente, como por ejemplo, un ascensor, una cueva, un túnel, etc. De hecho, son sensaciones que pueden aparecer también en pruebas médicas como la resonancia magnética.",
    obra: "Étant donnés",
    anio: 1966,
    cuadro: "La gran obra de Marcel Duchamp paralizó al mundo al percibir la limitación del elemento principal de su pintura, un cuerpo desnudo, encerrado entre hojarasca y una sombra negra que no se alcanza a distinguir del todo. Cualquier claustrofóbico se identificaría con la obra de Duchamp, pero también se alteraría al no encontrar la salida en este agujero artístico.",
    peso: 1,
  },
  {
    id: "acrofobia",
    nombre: "Acrofobia",
    fobia: "Las personas que presentan acrofobia experimentan miedo intenso e inmediato cuando están en lugares con elevada altura, por ejemplo, un puente o mirar por la ventana de un edificio o un balcón. Incluso sufren ansiedad anticipatoria al momento de encontrarse en estos lugares. Por esa razón, estas personas tienden a evitar encontrarse en esas situaciones relacionadas con la altura o si se ven en ellas sin poder escapar, el malestar que sienten es muy elevado.",
    obra: "Relatividad",
    anio: 1953,
    cuadro: "Para Maurits Cornelis Escher, la percepción, realidad, los mundos imposibles y las leyes de la física fueron parte esencial de su obra. La cual retrata de manera poética el miedo a las alturas y el vértigo que una espiral interminable le causan a las personas no toleren la sensación de encontrarse al filo de una profunda caída.",
    peso: 0.72,
  },
  {
    id: "agorafobia",
    nombre: "Agorafobia",
    fobia: "La agorafobia es la aparición de temor o ansiedad por el hecho de estar en situaciones o en lugares (por ejemplo, en multitudes y centros comerciales o mientras se conduce) donde puede resultar difícil escapar o en los que puede que no se disponga de ayuda si aparece una angustia intensa. Estas situaciones o lugares a menudo se evitan o bien se toleran con mucha angustia.",
    obra: "Tarde de primavera en la calle Karl Johan",
    anio: 1892,
    cuadro: "Edvard Munch fue un pintor expresionista y simbolista que a partir de escenarios lúgubres, colores tenebrosos y personajes de rostros angustiados representó en varias ocasiones las obsesiones que atemorizan al hombre. El terror a los espacios abiertos es una de las fobias que refleja en «Tarde de primavera en la calle Karl Johan» a través de un paisaje de colores muy particulares, que provocan en el espectador un gran desasosiego.",
    peso: 0.63,
  },
  {
    id: "pirofobia",
    nombre: "Pirofobia",
    fobia: "La pirofobia es el miedo irracional al fuego y a los incendios. Esta fobia probablemente sea tan antigua como el propio descubrimiento del fuego por parte de la humanidad. El temor al fuego tiene la función de mantenerte a salvo en caso de incendio o evitar que te quemes al tocar las llamas. Pero cuando este miedo se convierte en fobia, puede hacer que sientas ansiedad sólo con ver una vela o un mechero encendidos.",
    obra: "Incendio del parlamento",
    anio: 1835,
    cuadro: "El incendio del parlamento fue un hecho real ocurrido en Londres en 1834. Joseph Mallord William Turner decidió inmortalizar el ángulo de aquel suceso que había quedado en su memoria. La obra se convirtió en una impresionante réplica del lugar que quedó en ruinas y cenizas, por lo que hoy es una de las piezas que más alteran a quienes padecen de un temor irracional al incompatible poder del fuego.",
    peso: 0.55,
  },
];

// EL LISTADO DE «ANALIZA» ES MÁS LARGO QUE LAS OBRAS, y tiene que serlo: lo que
// enseña esa pantalla es qué miedos son más comunes ENTRE LOS VISITANTES, no
// qué cuadros hay colgados. Si solo saliesen las siete obras de la sala, la
// pantalla estaría contando el catálogo en vez de a la gente, y además no daría
// para desplazarse, que es lo que hace que se lea como una lista larga de
// respuestas y no como un resumen.
//
// Las siete primeras salen de las obras y llevan su mismo peso, así que si allí
// se cambia un número, aquí cambia solo.
const OTRAS: { nombre: string; peso: number }[] = [
  { nombre: "Nictofobia", peso: 0.52 },
  { nombre: "Antropofobia", peso: 0.11 },
  { nombre: "Ablutofobia", peso: 0.2 },
  { nombre: "Catoptrofobia", peso: 0.5 },
  { nombre: "Homiclofobia", peso: 0.09 },
  { nombre: "Eurotofobia", peso: 0.16 },
  { nombre: "Pagofobia", peso: 0.36 },
  { nombre: "Selafobia", peso: 0.05 },
  { nombre: "Talasofobia", peso: 0.78 },
  { nombre: "Lilapsofobia", peso: 0.13 },
  { nombre: "Tocofobia", peso: 0.35 },
  { nombre: "Aracnofobia", peso: 0.68 },
  { nombre: "Tripofobia", peso: 0.29 },
  { nombre: "Ceraunofobia", peso: 0.22 },
  { nombre: "Amaxofobia", peso: 0.41 },
  { nombre: "Hematofobia", peso: 0.47 },
  { nombre: "Coulrofobia", peso: 0.18 },
];

export const LISTADO: { nombre: string; peso: number }[] = [
  ...FOBIAS.map((f) => ({ nombre: f.nombre, peso: f.peso })),
  ...OTRAS,
].sort((a, b) => b.peso - a.peso);
