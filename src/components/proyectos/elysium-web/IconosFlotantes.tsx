"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { crearEstudio } from "@/components/proyectos/elysium/LienzoMetal";

// Los símbolos de las eras flotando sobre la galaxia.
//
// TODOS en una sola escena y un solo canvas, aunque hoy solo haya uno. No es
// prematuro: los móviles permiten muy pocos contextos WebGL a la vez, y un
// canvas por icono se quedaría sin ellos en cuanto entren las siete eras. Así,
// añadir una era es añadir una entrada a la lista.
export type IconoFlotante = {
  modelo: string;
  // Sitio en la pantalla, de -1 a 1: el centro es 0,0. Se da en estas unidades
  // y no en píxeles para que los iconos se queden donde deben en cualquier
  // pantalla, que es lo que pide un fondo a sangre.
  x: number;
  y: number;
  escala: number;
  giro: number;
};

// De momento solo The Fame, como se pidió. Al exportar las demás eras, cada una
// es una línea más aquí.
export const FLOTANTES: IconoFlotante[] = [
  { modelo: "/proyectos/elysium-web/era-the-fame.glb", x: -0.90, y: 0.30, escala: 1.15, giro: 0.0035 },
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

    const estudio = new THREE.CanvasTexture(crearEstudio());
    estudio.mapping = THREE.EquirectangularReflectionMapping;
    estudio.colorSpace = THREE.SRGBColorSpace;
    escena.environment = estudio;

    const piezas: { grupo: THREE.Group; def: IconoFlotante }[] = [];
    let vivo = true;
    const loader = new GLTFLoader();

    for (const def of iconos) {
      const grupo = new THREE.Group();
      escena.add(grupo);
      piezas.push({ grupo, def });
      loader.load(def.modelo, (gltf) => {
        if (!vivo) return;
        const modelo = gltf.scene;
        modelo.traverse((hijo) => {
          if ((hijo as THREE.Mesh).isMesh) {
            (hijo as THREE.Mesh).material = new THREE.MeshStandardMaterial({
              color: 0xeef2f8,
              metalness: 1,
              roughness: 0.12,
            });
          }
        });
        const caja = new THREE.Box3().setFromObject(modelo);
        modelo.position.sub(caja.getCenter(new THREE.Vector3()));
        const tam = caja.getSize(new THREE.Vector3());
        const mayor = Math.max(tam.x, tam.y, tam.z) || 1;
        modelo.scale.setScalar(1 / mayor);
        grupo.add(modelo);
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
      for (const { grupo, def } of piezas) {
        grupo.position.set(def.x * aspecto, def.y, 0);
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
      for (const { grupo, def } of piezas) {
        if (!quieto) {
          grupo.rotation.y += def.giro;
          // Cabeceo muy corto: lo justo para que el reflejo se mueva y la
          // pieza no parezca una calcomanía pegada al fondo.
          grupo.rotation.x = Math.sin(t * 0.0004) * 0.18;
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
