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
  // Cuánto se balancea sobre su eje vertical, en radianes, y hacia qué lado
  // empieza (el signo).
  //
  // Es un BALANCEO y no un giro completo, y la razón es la forma de las piezas:
  // son cintas planas, así que un giro entero las deja de canto dos veces por
  // vuelta y desaparecen de la pantalla. Acotado a media vuelta escasa, la
  // pieza nunca se pierde de vista, el reflejo sigue moviéndose y además se
  // queda cerca del ángulo en que están en el render original.
  giro: number;
};

// Al exportar las demás eras, cada una es una línea más aquí.
export const FLOTANTES: IconoFlotante[] = [
  { modelo: "/proyectos/elysium-web/era-the-fame.glb", x: -0.82, y: 0.30, escala: 1.15, giro: 1.1 },
  { modelo: "/proyectos/elysium-web/era-the-fame-monster.glb", x: 0.84, y: -0.24, escala: 1.1, giro: -0.95 },
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
          // que le quita la regularidad.
          amplitud: [alAzar(0.07, 0.13), alAzar(0.02, 0.045)],
          ritmo: [alAzar(0.00013, 0.00022), alAzar(0.00029, 0.00048)],
          fase: [alAzar(0, Math.PI * 2), alAzar(0, Math.PI * 2)],
          base: new THREE.Vector2(),
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
        const orientador = new THREE.Group();
        if (tam.y < tam.x && tam.y < tam.z) orientador.rotation.x = Math.PI / 2;
        else if (tam.x < tam.y && tam.x < tam.z) orientador.rotation.y = Math.PI / 2;
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
      for (const { grupo, def, vaiven } of piezas) {
        if (!quieto) {
          const [a1, a2] = vaiven.amplitud;
          const [w1, w2] = vaiven.ritmo;
          const [f1, f2] = vaiven.fase;
          // Sube y baja: dos ondas sumadas que nunca vuelven a coincidir.
          grupo.position.y =
            vaiven.base.y + a1 * Math.sin(t * w1 + f1) + a2 * Math.sin(t * w2 + f2);
          // Y un balanceo lateral mucho más corto. No se pide, pero sin él el
          // movimiento se lee como un ascensor: lo que flota nunca sube en
          // línea recta.
          grupo.position.x = vaiven.base.x + a2 * 0.6 * Math.sin(t * w2 * 0.7 + f1);
          // El cabeceo va atado a la onda larga, así que la pieza se inclina
          // acompañando su propia subida en vez de por su cuenta.
          grupo.rotation.x = Math.sin(t * w1 * 1.7 + f2) * 0.2;
          // Y el balanceo, con su propio ritmo para que no vaya sincronizado
          // con la subida: si girase al compás, se vería el mecanismo.
          grupo.rotation.y = def.giro * Math.sin(t * w2 * 0.55 + f1);
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
