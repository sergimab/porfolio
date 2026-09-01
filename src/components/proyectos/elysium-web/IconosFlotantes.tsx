"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { crearEstudioIridiscente } from "./estudioIridiscente";

// Los símbolos de las eras flotando sobre la galaxia.
//
// TODOS en una sola escena y un solo canvas. Los móviles permiten muy pocos
// contextos WebGL a la vez, y un canvas por icono se quedaría sin ellos con
// siete piezas en pantalla. Añadir una era es añadir una entrada a la lista.
export type IconoFlotante = {
  era: string;
  modelo: string;
  // Sitio en la pantalla, de -1 a 1: el centro es 0,0, y el 1 es el borde de la
  // ventana. Se da en estas unidades y no en píxeles para que los iconos se
  // queden donde deben en cualquier pantalla, que es lo que pide un fondo a
  // sangre.
  //
  // En la portada hay una cifra que importa: 0,78, que es donde cae el borde
  // del cartel (ver .inicio-cartel). Por dentro el icono se ve borroso a través
  // del cristal; por fuera, nítido. En la pantalla de las eras no hay cartel y
  // se ven todos enteros, que es para lo que está pensada esta composición.
  x: number;
  y: number;
  escala: number;
  // Cómo se mueve. Son dos maneras a propósito, repartidas: si todas hicieran
  // lo mismo el conjunto latiría al unísono y se vería la maquinaria.
  //
  //  · "flota": sube y baja.
  //  · "gira": bascula sobre un eje DIAGONAL, hacia delante y hacia atrás, como
  //    una moneda que se mece. Apenas se mueve de sitio; lo que cambia es la
  //    cara que enseña, y con ella el reflejo.
  movimiento: "flota" | "gira";
  // Y encima, algunas dan vueltas cortas sobre su propio eje vertical. Es una
  // capa aparte y no un tercer modo porque se combina con las otras dos.
  //
  // Vueltas CORTAS, no completas: estas piezas son cintas planas y una vuelta
  // entera las deja de canto dos veces, con lo que desaparecen.
  giraEje?: boolean;
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
  { era: "The Fame Monster", modelo: "/proyectos/elysium-web/era-the-fame-monster.glb", x: -0.60, y: 0.46, escala: 1.15, movimiento: "gira", giraEje: true },
  { era: "ARTPOP",           modelo: "/proyectos/elysium-web/era-artpop.glb",           x: -0.22, y: 0.38, escala: 1.05, movimiento: "flota" },
  { era: "Joanne",           modelo: "/proyectos/elysium-web/era-joanne.glb",           x: 0.36,  y: 0.58, escala: 1.2,  movimiento: "gira" },
  // Abajo: el rayo, el triángulo, la onda y la estrella de púas.
  { era: "The Fame",         modelo: "/proyectos/elysium-web/era-the-fame.glb",         x: -0.78, y: -0.38, escala: 1.05, movimiento: "flota", giraEje: true },
  { era: "Born This Way",    modelo: "/proyectos/elysium-web/era-born-this-way.glb",    x: -0.34, y: -0.56, escala: 1.1,  movimiento: "gira" },
  { era: "Chromatica",       modelo: "/proyectos/elysium-web/era-chromatica.glb",       x: 0.24,  y: -0.28, escala: 1.05, movimiento: "flota", giraEje: true },
  { era: "Mayhem",           modelo: "/proyectos/elysium-web/era-mayhem.glb",           x: 0.70,  y: -0.38, escala: 1.25, movimiento: "gira" },
];

// El resplandor de las piezas encendidas.
//
// Aquí hubo un halo pintado: un círculo degradado detrás de la pieza. Se ha
// quitado porque delataba lo que era —una mancha redonda bajo una forma que no
// lo es— y no se pegaba a la silueta.
//
// Ahora es BLOOM de verdad: se dibuja la pieza a solas en una textura aparte,
// se desenfoca, y ese desenfoque se pinta por detrás sumándose al negro. Como
// el resplandor sale de la pieza misma, rodea su contorno —púas incluidas— y
// arrastra sus propios colores, que es lo que hace que parezca luz que emite
// ella y no un foco puesto debajo.
const VERTEX_QUAD = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

// Desenfoque separable: primero en horizontal y luego en vertical, que sale
// mucho más barato que uno en dos dimensiones de una sola pasada.
const BLUR_QUAD = /* glsl */ `
  varying vec2 vUv;
  uniform sampler2D uTex;
  uniform vec2 uPaso;
  void main() {
    vec4 suma = vec4(0.0);
    suma += texture2D(uTex, vUv - uPaso * 4.0) * 0.028;
    suma += texture2D(uTex, vUv - uPaso * 3.0) * 0.065;
    suma += texture2D(uTex, vUv - uPaso * 2.0) * 0.121;
    suma += texture2D(uTex, vUv - uPaso)       * 0.175;
    suma += texture2D(uTex, vUv)               * 0.198;
    suma += texture2D(uTex, vUv + uPaso)       * 0.175;
    suma += texture2D(uTex, vUv + uPaso * 2.0) * 0.121;
    suma += texture2D(uTex, vUv + uPaso * 3.0) * 0.065;
    suma += texture2D(uTex, vUv + uPaso * 4.0) * 0.028;
    gl_FragColor = suma;
  }
`;

// Y el que estampa el resplandor ya desenfocado.
//
// Hace falta un shader propio, y no un material normal con opacidad, por una
// razón concreta: desparramar una cinta fina sobre una superficie ancha reparte
// su luz y la deja casi negra, así que hay que poder MULTIPLICAR por encima de
// uno para recuperarla. La opacidad solo sabe bajar de uno.
const RESPLANDOR_QUAD = /* glsl */ `
  varying vec2 vUv;
  uniform sampler2D uTex;
  uniform float uFuerza;
  void main() {
    vec4 c = texture2D(uTex, vUv);
    gl_FragColor = vec4(c.rgb * uFuerza, c.a * uFuerza);
  }
`;

export default function IconosFlotantes({
  iconos = FLOTANTES,
  // En la portada los iconos son fondo y no se tocan; en la pantalla de las
  // eras son el contenido y se pulsan.
  interactivo = false,
  onElegir,
}: {
  iconos?: IconoFlotante[];
  interactivo?: boolean;
  onElegir?: (era: string) => void;
}) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  // El manejador se guarda en un ref para que el efecto pesado —que crea el
  // contexto WebGL y carga siete modelos— no dependa de él. Si dependiera, cada
  // render del padre con una función nueva volvería a montar toda la escena.
  const onElegirRef = useRef(onElegir);
  onElegirRef.current = onElegir;

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

    // ── Montaje del bloom ────────────────────────────────────────────────────
    //
    // Dos destinos a baja resolución para el ping-pong del desenfoque. Bajos a
    // propósito: lo que se guarda ahí es una mancha borrosa, así que el detalle
    // sobra, y a un tercio de tamaño cada pasada cuesta la novena parte.
    const opcionesRT = { depthBuffer: false, stencilBuffer: false };
    const rtA = new THREE.WebGLRenderTarget(1, 1, opcionesRT);
    const rtB = new THREE.WebGLRenderTarget(1, 1, opcionesRT);
    const matBlur = new THREE.ShaderMaterial({
      vertexShader: VERTEX_QUAD,
      fragmentShader: BLUR_QUAD,
      uniforms: { uTex: { value: null }, uPaso: { value: new THREE.Vector2() } },
      // Sin mezcla: el desenfoque no pinta encima de nada, calcula.
      transparent: false,
      blending: THREE.NoBlending,
    });
    const escenaQuad = new THREE.Scene();
    const camaraQuad = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), matBlur);
    escenaQuad.add(quad);

    // El cuadro que lleva el resplandor ya desenfocado, a pantalla completa y
    // POR DETRÁS de las piezas: así las rodea sin lavarles el metal.
    const matResplandor = new THREE.ShaderMaterial({
      vertexShader: VERTEX_QUAD,
      fragmentShader: RESPLANDOR_QUAD,
      uniforms: { uTex: { value: rtA.texture }, uFuerza: { value: 0 } },
      transparent: true,
      depthTest: false,
      depthWrite: false,
      // Suma pura: lo que sale del shader se añade a lo que hay debajo, sin
      // que el alfa vuelva a escalarlo. Con AdditiveBlending a secas el color
      // se multiplicaría otra vez por el alfa y el resplandor se apagaría justo
      // en su falda, que es donde tiene que verse.
      blending: THREE.CustomBlending,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneFactor,
    });
    // En su PROPIA escena, no en la de las piezas.
    //
    // Es lo que permite pintarlo antes que ellas y que quede por DETRÁS. Metido
    // en la escena principal acabaría dibujándose después —los materiales con
    // mezcla van siempre detrás de los opacos en el orden de dibujo— y el
    // resplandor se sumaría también sobre el metal, lavándolo justo donde tiene
    // que estar más limpio.
    const escenaResplandor = new THREE.Scene();
    escenaResplandor.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), matResplandor));

    type Vaiven = {
      amplitud: [number, number];
      ritmo: [number, number];
      fase: [number, number];
      base: THREE.Vector2;
      // Eje sobre el que bascula la pieza que "gira". Es diagonal, no vertical
      // ni horizontal, y cada una lleva el suyo con una inclinación distinta.
      eje: THREE.Vector3;
      balanceo: number;
      ejeCentral: number;
      // Tamaño de reposo, que fija medir(). El pulso del clic se aplica encima,
      // así que hace falta tenerlo guardado: leyéndolo de la propia escala, cada
      // pulso partiría del tamaño ya hinchado por el anterior.
      tam: number;
    };
    type Pieza = {
      grupo: THREE.Group;
      def: IconoFlotante;
      vaiven: Vaiven;
      // Cuadro invisible que recoge el ratón. Va SUELTO de la pieza, no
      // colgando de ella: colgando, bascularía con ella y acertarle se
      // convertiría en un juego de puntería.
      blanco: THREE.Mesh;
      // Cuánto está encendida, de 0 a 1. Se persigue al objetivo en vez de
      // saltar, que es lo que hace que encienda y apague con suavidad.
      brillo: number;
      // Acuse de recibo del clic: sube a 1 y se desinfla sola. Mientras el clic
      // no lleve a ninguna parte es lo único que dice que ha llegado, y aun
      // cuando lleve seguirá haciendo falta —pulsar algo y que no se inmute es
      // lo que hace dudar de si se ha pulsado.
      pulso: number;
    };
    const alAzar = (min: number, max: number) => min + Math.random() * (max - min);

    const piezas: Pieza[] = [];
    let vivo = true;
    const loader = new GLTFLoader();

    for (const def of iconos) {
      const grupo = new THREE.Group();
      escena.add(grupo);

      const blanco = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        // Invisible pero presente: con visible=false el rayo ni lo mira, así
        // que la pieza dejaría de poder pulsarse.
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
      );
      escena.add(blanco);

      piezas.push({
        grupo,
        def,
        blanco,
        brillo: 0,
        pulso: 0,
        vaiven: {
          // La onda larga es el viaje de subida y bajada; la corta, el temblor
          // que le quita la regularidad. La que bascula se desplaza menos: su
          // movimiento es el del eje, y sumarle un paseo largo sería pedirle
          // dos cosas a la vez.
          amplitud:
            def.movimiento === "flota"
              ? [alAzar(0.09, 0.15), alAzar(0.025, 0.045)]
              : [alAzar(0.03, 0.055), alAzar(0.012, 0.024)],
          ritmo: [alAzar(0.00012, 0.00021), alAzar(0.00027, 0.00046)],
          fase: [alAzar(0, Math.PI * 2), alAzar(0, Math.PI * 2)],
          base: new THREE.Vector2(),
          // Diagonal, con la inclinación repartida al azar para que no basculen
          // todas sobre la misma línea.
          eje: new THREE.Vector3(alAzar(0.5, 1), alAzar(0.5, 1), 0)
            .multiply(new THREE.Vector3(Math.random() < 0.5 ? -1 : 1, 1, 0))
            .normalize(),
          balanceo: def.movimiento === "gira" ? alAzar(0.38, 0.6) : alAzar(0.1, 0.18),
          ejeCentral: def.giraEje ? alAzar(0.55, 0.95) : 0,
          tam: 1,
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
              // Se enciende al pasar por encima. Va en negro de partida para
              // que no cambie nada mientras está apagada.
              emissive: 0x000000,
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
        //
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

      // Los destinos del desenfoque, a un tercio: lo que guardan es una mancha
      // borrosa y el detalle sobra, así que cada pasada cuesta la novena parte.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const anchoRT = Math.max(2, Math.round(width * dpr * 0.34));
      const altoRT = Math.max(2, Math.round(height * dpr * 0.34));
      rtA.setSize(anchoRT, altoRT);
      rtB.setSize(anchoRT, altoRT);

      for (const { grupo, def, vaiven, blanco } of piezas) {
        // Se guarda el sitio de reposo; la deriva se suma encima en cada
        // fotograma. Si aquí se escribiera la posición final, el vaivén se
        // reiniciaría de golpe cada vez que se cambia el tamaño de la ventana.
        vaiven.base.set(def.x * aspecto, def.y);
        grupo.position.set(vaiven.base.x, vaiven.base.y, 0);
        // El tamaño se mide sobre el ALTO, pero encogido cuando la ventana es
        // estrecha.
        //
        // Sobre el alto porque atado al ancho los iconos se encogerían hasta
        // desaparecer en un móvil. Pero solo sobre el alto tampoco vale: en una
        // pantalla alta y estrecha, un 21% del alto es media pantalla de ancho,
        // y las siete piezas se montaban unas encima de otras. El factor las
        // devuelve a una talla que cabe, y deja la composición intacta a partir
        // de una ventana apaisada normal.
        const compacto = Math.min(1, aspecto / 1.5);
        const tam = def.escala * 0.42 * compacto;
        vaiven.tam = tam;
        grupo.scale.setScalar(tam);
        // El cuadro que recoge el ratón va algo más grande que la pieza: son
        // formas caladas y llenas de huecos, y pedir que se acierte en el metal
        // mismo convertiría pulsarlas en un juego de puntería.
        blanco.scale.setScalar(tam * 1.25);
      }
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(cont);

    // ── Ratón ────────────────────────────────────────────────────────────────
    const raton = new THREE.Vector2();
    const rayo = new THREE.Raycaster();
    let encima: Pieza | null = null;
    let hayRaton = false;

    const cualEsta = (ev: PointerEvent): Pieza | null => {
      const r = cont.getBoundingClientRect();
      raton.x = ((ev.clientX - r.left) / r.width) * 2 - 1;
      raton.y = -((ev.clientY - r.top) / r.height) * 2 + 1;
      rayo.setFromCamera(raton, camara);
      const tocados = rayo.intersectObjects(piezas.map((p) => p.blanco), false);
      if (!tocados.length) return null;
      return piezas.find((p) => p.blanco === tocados[0].object) ?? null;
    };

    const alMover = (ev: PointerEvent) => {
      hayRaton = true;
      encima = cualEsta(ev);
      cont.style.cursor = encima ? "pointer" : "default";
    };
    const alSalir = () => {
      hayRaton = false;
      encima = null;
      cont.style.cursor = "default";
    };
    const alPulsar = (ev: PointerEvent) => {
      const p = cualEsta(ev);
      if (!p) return;
      p.pulso = 1;
      onElegirRef.current?.(p.def.era);
    };

    if (interactivo) {
      cont.addEventListener("pointermove", alMover);
      cont.addEventListener("pointerleave", alSalir);
      cont.addEventListener("click", alPulsar);
    }

    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const qBascula = new THREE.Quaternion();
    const qCentral = new THREE.Quaternion();
    const ejeY = new THREE.Vector3(0, 1, 0);

    const bucle = (t: number) => {
      raf = requestAnimationFrame(bucle);
      for (const pieza of piezas) {
        const { grupo, vaiven, blanco } = pieza;
        if (!quieto) {
          const [a1, a2] = vaiven.amplitud;
          const [w1, w2] = vaiven.ritmo;
          const [f1, f2] = vaiven.fase;
          // Sube y baja: dos ondas sumadas que nunca vuelven a coincidir.
          grupo.position.y =
            vaiven.base.y + a1 * Math.sin(t * w1 + f1) + a2 * Math.sin(t * w2 + f2);
          // Y una deriva lateral mucho más corta. Sin ella el movimiento se lee
          // como un ascensor: lo que flota nunca sube en línea recta.
          grupo.position.x = vaiven.base.x + a2 * 0.7 * Math.sin(t * w2 * 0.7 + f1);

          // Dos giros compuestos: el bamboleo sobre el eje diagonal y, en
          // algunas, la vuelta corta sobre su propio eje vertical.
          //
          // Se componen con cuaterniones y no con rotation.x/.y/.z porque eso
          // son giros encadenados sobre ejes FIJOS: encadenados, el segundo se
          // aplica sobre unos ejes que el primero ya movió y el resultado sale
          // retorcido en vez de mecerse limpio.
          qBascula.setFromAxisAngle(vaiven.eje, vaiven.balanceo * Math.sin(t * w1 * 1.35 + f2));
          if (vaiven.ejeCentral) {
            qCentral.setFromAxisAngle(ejeY, vaiven.ejeCentral * Math.sin(t * w2 * 0.42 + f1));
            grupo.quaternion.copy(qBascula).multiply(qCentral);
          } else {
            grupo.quaternion.copy(qBascula);
          }
        }

        // El cuadro sigue a la pieza, pero solo en POSICIÓN.
        blanco.position.set(grupo.position.x, grupo.position.y, 0);

        // El pulso del clic se desinfla solo y mientras dura hincha la pieza.
        // Va sobre el tamaño de reposo guardado, no sobre la escala actual, o
        // cada pulso partiría del tamaño que dejó el anterior.
        if (pieza.pulso > 0.001) {
          pieza.pulso *= 0.9;
          grupo.scale.setScalar(vaiven.tam * (1 + pieza.pulso * 0.16));
        } else if (pieza.pulso !== 0) {
          pieza.pulso = 0;
          grupo.scale.setScalar(vaiven.tam);
        }

        // Encendido y apagado suaves. El 0,12 es la parte del camino que
        // recorre en cada fotograma: sube en unas décimas y baja igual, sin el
        // parpadeo que daría cambiar de golpe al entrar y salir del cuadro.
        const objetivo = pieza === encima ? 1 : 0;
        pieza.brillo += (objetivo - pieza.brillo) * 0.12;
      }

      // ── El resplandor ─────────────────────────────────────────────────────
      //
      // Tres pasos: dibujar a solas las piezas encendidas, desenfocar lo
      // dibujado, y dejar ese desenfoque puesto por detrás de todo.
      const fuerza = piezas.reduce(
        (m, p) => Math.max(m, p.brillo + p.pulso * 0.6),
        0
      );
      const hayResplandor = fuerza > 0.004;
      if (hayResplandor) {
        // 1. La silueta: solo las piezas encendidas, a solas.
        for (const p of piezas) p.grupo.visible = p.brillo > 0.004 || p.pulso > 0.004;
        renderer.setRenderTarget(rtA);
        renderer.setClearColor(0x000000, 0);
        renderer.clear();
        renderer.render(escena, camara);

        // 2. El desenfoque, en tres vueltas con el paso cada vez más largo. Con
        //    una sola vuelta el resplandor queda corto y con el borde a la
        //    vista; encadenando pasos crecientes se consigue una falda ancha y
        //    suave sin un kernel enorme.
        quad.material = matBlur;
        for (const paso of [1.5, 3, 5.5]) {
          matBlur.uniforms.uTex.value = rtA.texture;
          matBlur.uniforms.uPaso.value.set(paso / rtA.width, 0);
          renderer.setRenderTarget(rtB);
          renderer.render(escenaQuad, camaraQuad);

          matBlur.uniforms.uTex.value = rtB.texture;
          matBlur.uniforms.uPaso.value.set(0, paso / rtA.height);
          renderer.setRenderTarget(rtA);
          renderer.render(escenaQuad, camaraQuad);
        }

        // 3. Todas vuelven a verse.
        for (const p of piezas) p.grupo.visible = true;
        matResplandor.uniforms.uFuerza.value = fuerza * 2.9;
      }

      // Y el dibujo final, en dos capas: primero el resplandor y encima las
      // piezas. Con autoClear apagado entre las dos, para que la segunda no
      // borre la primera.
      renderer.setRenderTarget(null);
      renderer.clear();
      if (hayResplandor) {
        renderer.autoClear = false;
        renderer.render(escenaResplandor, camaraQuad);
      }
      renderer.autoClear = false;
      renderer.render(escena, camara);
      renderer.autoClear = true;
    };
    raf = requestAnimationFrame(bucle);

    // El puntero puede quedarse encima de una pieza que se aparta sola: el
    // ratón no se mueve, pero la pieza sí. Sin esto, el halo se quedaría
    // encendido bajo un icono que ya no está debajo del cursor.
    const revisar = setInterval(() => {
      if (!interactivo || !hayRaton) return;
      rayo.setFromCamera(raton, camara);
      const tocados = rayo.intersectObjects(piezas.map((p) => p.blanco), false);
      encima = tocados.length
        ? piezas.find((p) => p.blanco === tocados[0].object) ?? null
        : null;
      cont.style.cursor = encima ? "pointer" : "default";
    }, 180);

    return () => {
      vivo = false;
      cancelAnimationFrame(raf);
      clearInterval(revisar);
      ro.disconnect();
      cont.removeEventListener("pointermove", alMover);
      cont.removeEventListener("pointerleave", alSalir);
      cont.removeEventListener("click", alPulsar);
      escena.traverse((h) => {
        const m = h as THREE.Mesh;
        if (m.isMesh) {
          m.geometry?.dispose();
          const mat = m.material;
          if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
          else mat?.dispose();
        }
      });
      rtA.dispose();
      rtB.dispose();
      matBlur.dispose();
      matResplandor.dispose();
      estudio.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [iconos, interactivo]);

  return (
    <div
      ref={contenedorRef}
      className={`flotantes${interactivo ? " es-pulsable" : ""}`}
      aria-hidden={!interactivo}
    />
  );
}
