"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { crearEstudioIridiscente } from "./estudioIridiscente";

// Los símbolos de las eras flotando sobre la galaxia.
//
// TODOS en una sola escena y un solo canvas, aunque hoy solo haya uno. No es
// prematuro: los móviles permiten muy pocos contextos WebGL a la vez, y un
// canvas por icono se quedaría sin ellos en cuanto entren las siete eras. Así,
// añadir una era es añadir una entrada a la lista.
export type IconoFlotante = {
  modelo: string;
  // Sitio en la pantalla, de -1 a 1: el centro es 0,0, y el 1 es el borde de la
  // ventana. Se da en estas unidades y no en píxeles para que los iconos se
  // queden donde deben en cualquier pantalla, que es lo que pide un fondo a
  // sangre.
  //
  // La cifra que importa para colocarlos es 0,78: es donde cae el borde del
  // cartel (ver .inicio-cartel, que mide el 78% del ancho). Por dentro de eso
  // el icono se ve borroso a través del cristal; por fuera, nítido. Puestos
  // justo encima de esa línea se ven las dos cosas a la vez, que es el efecto
  // del diseño. Más allá de 0,9 empiezan a comerse el borde de la ventana.
  x: number;
  y: number;
  escala: number;
  // Cómo se mueve. Son dos maneras a propósito, repartidas: si todas hicieran
  // lo mismo el conjunto latiría al unísono y se vería la maquinaria.
  //
  //  · "flota": sube y baja, con muy poco recorrido.
  //  · "gira": bascula sobre un eje DIAGONAL, hacia delante y hacia atrás, como
  //    una moneda que se mece. Apenas se mueve de sitio; lo que cambia es la
  //    cara que enseña, y con ella el reflejo.
  //
  // En los dos casos el recorrido es corto. Estas piezas son cintas planas: en
  // cuanto se pasa de ahí se ponen de canto y desaparecen.
  movimiento: "flota" | "gira";
};

// Las siete eras, colocadas como en el render del fondo.
//
// El orden en pantalla no es el de la discografía: es la composición del
// render, con las masas repartidas para que el conjunto quede equilibrado. Las
// coordenadas salen de medir esa imagen.
//
// Qué símbolo es cada una lo dicen dos cosas que coinciden: los nodos de los
// .glb vienen numerados (1 the fame … 7 mayhem) y el propio texto del proyecto
// nombra "el rayo de The Fame, el triángulo invertido de Born This Way, la
// esfera de ARTPOP, la onda de Chromatica".
export const FLOTANTES: IconoFlotante[] = [
  // Arriba: la cruz, la esfera y el sombrero.
  { modelo: "/proyectos/elysium-web/era-the-fame-monster.glb", x: -0.60, y: 0.46, escala: 1.15, movimiento: "gira" },
  { modelo: "/proyectos/elysium-web/era-artpop.glb",           x: -0.22, y: 0.38, escala: 1.05, movimiento: "flota" },
  { modelo: "/proyectos/elysium-web/era-joanne.glb",           x: 0.36,  y: 0.58, escala: 1.2,  movimiento: "gira" },
  // Abajo: el rayo, el triángulo, la onda y la estrella de púas.
  { modelo: "/proyectos/elysium-web/era-the-fame.glb",         x: -0.78, y: -0.38, escala: 1.05, movimiento: "flota" },
  { modelo: "/proyectos/elysium-web/era-born-this-way.glb",    x: -0.34, y: -0.56, escala: 1.1,  movimiento: "gira" },
  { modelo: "/proyectos/elysium-web/era-chromatica.glb",       x: 0.24,  y: -0.28, escala: 1.05, movimiento: "flota" },
  { modelo: "/proyectos/elysium-web/era-mayhem.glb",           x: 0.70,  y: -0.38, escala: 1.25, movimiento: "gira" },
];

export default function IconosFlotantes({ iconos = FLOTANTES }: { iconos?: IconoFlotante[] }) {
  const contenedorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cont = contenedorRef.current;
    if (!cont || !iconos.length) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      // Sin WebGL se queda solo la galaxia. Es un fondo: mejor eso que un
      // hueco o un mensaje de error en mitad de la portada.
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    cont.appendChild(renderer.domElement);

    const escena = new THREE.Scene();
    // Cámara ortográfica: los iconos son elementos gráficos colocados sobre un
    // fondo, no objetos en un espacio. Con perspectiva, los de los bordes
    // saldrían escorados y se leerían como un error de encuadre.
    const camara = new THREE.OrthographicCamera(-1, 1, 1, -1, -100, 100);
    camara.position.z = 10;

    const estudio = new THREE.CanvasTexture(crearEstudioIridiscente());
    estudio.mapping = THREE.EquirectangularReflectionMapping;
    estudio.colorSpace = THREE.SRGBColorSpace;
    escena.environment = estudio;

    // El vaivén de cada pieza. Son DOS ondas de periodos que no encajan entre
    // sí, y ahí está todo el truco: una sola onda es un balanceo de metrónomo
    // que se delata en cuanto lo miras dos segundos, mientras que dos que nunca
    // vuelven a coincidir no repiten nunca y se leen como algo que flota. Los
    // números salen al azar en cada visita, así que tampoco es la misma
    // coreografía cada vez.
    type Vaiven = {
      amplitud: [number, number];
      ritmo: [number, number];
      fase: [number, number];
      base: THREE.Vector2;
      // Eje sobre el que bascula la pieza que "gira". Es diagonal, no vertical
      // ni horizontal, y cada una lleva el suyo con una inclinación distinta.
      eje: THREE.Vector3;
      balanceo: number;
    };
    const alAzar = (min: number, max: number) => min + Math.random() * (max - min);

    const piezas: { grupo: THREE.Group; def: IconoFlotante; vaiven: Vaiven }[] = [];
    let vivo = true;
    const loader = new GLTFLoader();

    for (const def of iconos) {
      const grupo = new THREE.Group();
      escena.add(grupo);
      piezas.push({
        grupo,
        def,
        vaiven: {
          // La onda larga es el viaje de subida y bajada; la corta, el temblor
          // que le quita la regularidad. La que bascula apenas se desplaza: su
          // movimiento es el del eje, y sumarle un paseo largo sería pedirle
          // dos cosas a la vez.
          amplitud:
            def.movimiento === "flota"
              ? [alAzar(0.035, 0.06), alAzar(0.012, 0.022)]
              : [alAzar(0.012, 0.022), alAzar(0.006, 0.012)],
          ritmo: [alAzar(0.00012, 0.00021), alAzar(0.00027, 0.00046)],
          fase: [alAzar(0, Math.PI * 2), alAzar(0, Math.PI * 2)],
          base: new THREE.Vector2(),
          // Diagonal, con la inclinación repartida al azar para que no basculen
          // todas sobre la misma línea.
          eje: new THREE.Vector3(alAzar(0.5, 1), alAzar(0.5, 1), 0)
            .multiply(new THREE.Vector3(Math.random() < 0.5 ? -1 : 1, 1, 0))
            .normalize(),
          balanceo: def.movimiento === "gira" ? alAzar(0.26, 0.42) : alAzar(0.05, 0.1),
        },
      });
      loader.load(def.modelo, (gltf) => {
        if (!vivo) return;
        const modelo = gltf.scene;
        modelo.traverse((hijo) => {
          if ((hijo as THREE.Mesh).isMesh) {
            // Físico y no estándar por una sola cosa: la iridiscencia, que es
            // la película fina que hace virar el tono con el ángulo. El plató
            // ya trae el color; esto es lo que hace que además CAMBIE al girar
            // la pieza, que es lo que se ve en el render de Blender.
            (hijo as THREE.Mesh).material = new THREE.MeshPhysicalMaterial({
              color: 0xeef2f8,
              metalness: 1,
              roughness: 0.09,
              iridescence: 1,
              iridescenceIOR: 1.8,
              // El grosor de la película decide qué colores salen. Este rango
              // es el que da verdes azulados y corales; subiéndolo se va a
              // morados y amarillos y deja de parecerse a la referencia.
              iridescenceThicknessRange: [130, 460],
            });
          }
        });
        // Centrar y normalizar el tamaño, en este orden y con el centro DIVIDIDO
        // por la escala.
        //
        // La división no es un detalle: la escala de un nodo se aplica a sus
        // hijos, no a su propia posición, que se mide en unidades del padre. Los
        // .glb vienen con el origen donde lo tuvieran en Blender —el de The Fame
        // Monster, a más de cinco unidades del suyo—, así que restando el centro
        // en crudo la pieza se iba de la pantalla mientras la geometría, esa sí
        // reducida, se quedaba diminuta en la nada.
        const caja = new THREE.Box3().setFromObject(modelo);
        const centro = caja.getCenter(new THREE.Vector3());
        const tam = caja.getSize(new THREE.Vector3());
        const mayor = Math.max(tam.x, tam.y, tam.z) || 1;
        modelo.scale.setScalar(1 / mayor);
        modelo.position.copy(centro).multiplyScalar(-1 / mayor);

        // Enderezar la pieza para que enseñe su cara ancha.
        //
        // Los .glb no vienen todos con la misma orientación —el de The Fame
        // Monster sale tumbado 90° respecto al de The Fame—, y como son cintas
        // planas, uno tumbado se ve de canto: una raya. En vez de corregirlo a
        // mano era por era, se mira cuál de sus tres dimensiones es la más
        // fina, que en una cinta es siempre el grosor, y se gira para poner esa
        // de frente. Así cualquier export cae bien orientado sin tocar nada.
        //
        // Va en un grupo aparte porque el giro tiene que ocurrir DESPUÉS de
        // centrar: aplicado al mismo nodo, giraría la pieza alrededor del
        // origen del archivo y volvería a descolocarla.
        // Solo se endereza si la pieza es CLARAMENTE plana: que su dimensión
        // menor no llegue a la mitad de la mayor. Con siete formas distintas,
        // alguna puede ser casi tan honda como ancha —una espiral, un aro
        // combado—, y en ese caso no hay un "grosor" que valga: el criterio se
        // quedaría con la diferencia de unos milímetros y la giraría por nada.
        const orientador = new THREE.Group();
        const menor = Math.min(tam.x, tam.y, tam.z);
        if (menor < mayor * 0.5) {
          if (menor === tam.y) orientador.rotation.x = Math.PI / 2;
          else if (menor === tam.x) orientador.rotation.y = Math.PI / 2;
        }
        orientador.add(modelo);
        grupo.add(orientador);
      });
    }

    const medir = () => {
      const { width, height } = cont.getBoundingClientRect();
      renderer.setSize(width, height, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      // El encuadre se estira con la ventana para que el sistema de
      // coordenadas -1..1 siga cayendo en las esquinas reales de la pantalla.
      const aspecto = width / Math.max(1, height);
      camara.left = -aspecto;
      camara.right = aspecto;
      camara.top = 1;
      camara.bottom = -1;
      camara.updateProjectionMatrix();
      for (const { grupo, def, vaiven } of piezas) {
        // Se guarda el sitio de reposo; la deriva se suma encima en cada
        // fotograma. Si aquí se escribiera la posición final, el vaivén se
        // reiniciaría de golpe cada vez que se cambia el tamaño de la ventana.
        vaiven.base.set(def.x * aspecto, def.y);
        grupo.position.set(vaiven.base.x, vaiven.base.y, 0);
        // El tamaño se ata al ALTO y no al ancho: atado al ancho, en un móvil
        // estrecho los iconos se encogerían hasta desaparecer.
        grupo.scale.setScalar(def.escala * 0.42);
      }
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(cont);

    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const bucle = (t: number) => {
      raf = requestAnimationFrame(bucle);
      for (const { grupo, vaiven } of piezas) {
        if (!quieto) {
          const [a1, a2] = vaiven.amplitud;
          const [w1, w2] = vaiven.ritmo;
          const [f1, f2] = vaiven.fase;
          // Sube y baja: dos ondas sumadas que nunca vuelven a coincidir.
          grupo.position.y =
            vaiven.base.y + a1 * Math.sin(t * w1 + f1) + a2 * Math.sin(t * w2 + f2);
          // Y una deriva lateral mucho más corta. No se pide, pero sin ella el
          // movimiento se lee como un ascensor: lo que flota nunca sube en
          // línea recta.
          grupo.position.x = vaiven.base.x + a2 * 0.6 * Math.sin(t * w2 * 0.7 + f1);
          // El bamboleo sobre el eje diagonal: hacia delante y hacia atrás.
          //
          // Se pone con setRotationFromAxisAngle y no con rotation.x/.y porque
          // eso son tres giros encadenados sobre ejes fijos, y encadenándolos
          // el movimiento sale retorcido en vez de mecerse limpio sobre una
          // sola línea. Aquí hay un eje y un ángulo, que es justo lo que se
          // quiere decir con "bascular sobre su eje".
          grupo.setRotationFromAxisAngle(
            vaiven.eje,
            vaiven.balanceo * Math.sin(t * w1 * 1.35 + f2)
          );
        }
      }
      renderer.render(escena, camara);
    };
    raf = requestAnimationFrame(bucle);

    return () => {
      vivo = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      escena.traverse((h) => {
        const m = h as THREE.Mesh;
        if (m.isMesh) {
          m.geometry?.dispose();
          const mat = m.material;
          if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
          else mat?.dispose();
        }
      });
      estudio.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [iconos]);

  return <div ref={contenedorRef} className="flotantes" aria-hidden="true" />;
}
