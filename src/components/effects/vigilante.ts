// EL VIGILANTE DE FOTOGRAMAS.
//
// Mide cómo va la página los primeros segundos y, si va mal, avisa para que se
// apague el fondo animado.
//
// Existe por un caso real: alguien abrió el sitio en un ordenador de mesa
// potente y lo vio lentísimo. Aquí no se reproduce —en producción van 120
// fotogramas por segundo sin una sola tarea larga—, así que el problema no está
// en lo que hace la página sino en con qué lo dibuja la máquina de enfrente. La
// sospecha más probable es la aceleración por hardware desactivada, que es
// corriente en ordenadores de oficina: entonces el fondo, que es un shader a
// pantalla completa, se dibuja con el procesador y se arrastra todo.
//
// No se puede preguntar eso. Lo que sí se puede es MIRAR EL RESULTADO, que es lo
// único que importa: si los fotogramas no llegan, el fondo sobra.
//
// Tres decisiones que lo hacen fiable:
//
//  · SE ESPERA ANTES DE EMPEZAR A MEDIR. El primer segundo de una página son
//    fuentes, imágenes y react montándose; medir ahí daría por mala una máquina
//    que solo estaba ocupada arrancando.
//  · SE MIDE POR TRAMOS Y HACEN FALTA VARIOS SEGUIDOS. Un tirón lo tiene
//    cualquiera —otra pestaña compilando, el sistema indexando—, y apagar el
//    fondo por un bache sería castigar a quien no lo merece.
//  · LA DECISIÓN SE GUARDA PARA LA SESIÓN. Si esta máquina no puede, no puede
//    tampoco en la página siguiente; volver a medir en cada página sería volver
//    a regalarle tres segundos malos en cada una.
//
// Y solo apaga. Nunca vuelve a encender a mitad de sesión: una página que
// recupera el fondo de golpe mientras la lees es más raro que una que no lo
// tiene.

const CLAVE = "fondo-apagado-por-lento";

// Cuánto se deja arrancar antes de empezar a contar.
const GRACIA = 1200;
// Cada cuánto se cierra un tramo y se mira el resultado.
const TRAMO = 1000;
// Por debajo de esto el tramo cuenta como malo. 24 y no 30: el fondo pide 30,
// así que un umbral pegado a 30 daría por mala cualquier máquina que se quede
// un pelo corta, que es casi cualquiera con la pantalla llena.
const MINIMO = 24;
// Cuántos tramos malos seguidos hacen falta para apagar.
const PACIENCIA = 3;

export function yaSeSabeQueVaLento(): boolean {
  try {
    return sessionStorage.getItem(CLAVE) === "1";
  } catch {
    // Sin almacenamiento —ventana privada, cookies bloqueadas— se mide otra vez
    // en cada página. Es peor, pero funciona.
    return false;
  }
}

// Arranca la vigilancia. Devuelve la función para pararla.
export function vigilarFotogramas(alIrLento: () => void): () => void {
  let raf = 0;
  let parado = false;
  let cuadros = 0;
  let malos = 0;
  let abreTramo = 0;
  const nace = performance.now();

  const paso = (ahora: number) => {
    if (parado) return;
    raf = requestAnimationFrame(paso);

    if (ahora - nace < GRACIA) return;
    if (!abreTramo) {
      abreTramo = ahora;
      cuadros = 0;
      return;
    }

    cuadros++;
    const va = ahora - abreTramo;
    if (va < TRAMO) return;

    const fps = (cuadros * 1000) / va;
    // UNA PESTAÑA ESCONDIDA NO PINTA, así que su cuenta sale malísima y no
    // significa nada. Ese tramo se tira entero.
    if (document.hidden) {
      malos = 0;
    } else {
      malos = fps < MINIMO ? malos + 1 : 0;
    }
    abreTramo = ahora;
    cuadros = 0;

    if (malos >= PACIENCIA) {
      parado = true;
      cancelAnimationFrame(raf);
      try {
        sessionStorage.setItem(CLAVE, "1");
      } catch {
        // Si no se puede guardar, se apaga igual en esta página.
      }
      alIrLento();
    }
  };

  raf = requestAnimationFrame(paso);
  return () => {
    parado = true;
    cancelAnimationFrame(raf);
  };
}
