"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { crearEstudio } from "@/components/proyectos/elysium/LienzoMetal";
import "./VisorEra.css";

// Visor de los símbolos de las eras en 3D, tal y como los importaría la web
// real: el .glb que salió de Blender, cargado en el navegador y girando.
//
// El plató es el MISMO que ilumina el lienzo de metal. No es ahorro de código:
// es que si cada pieza usara su propia luz, el símbolo que dibujas y el modelo
// importado se leerían como dos cromos distintos pegados en la misma página.

// Las siete eras. `modelo` es opcional a propósito: hoy solo está exportada
// The Fame, y las demás aparecerán en el visor con solo dejar su .glb en
// public/proyectos/elysium-web/ y escribir aquí la ruta. Ninguna otra parte del
// código hay que tocar.
export type EraModelo = { nombre: string; modelo?: string };

export const ERAS_3D: EraModelo[] = [
  { nombre: "The Fame", modelo: "/proyectos/elysium-web/era-the-fame.glb" },
  { nombre: "The Fame Monster" },
  { nombre: "Born This Way" },
  { nombre: "ARTPOP" },
  { nombre: "Joanne" },
  { nombre: "Chromatica" },
  { nombre: "Mayhem" },
];

export default function VisorEra() {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const disponibles = ERAS_3D.filter((e) => e.modelo);
  const [activa, setActiva] = useState(0);
  const [estado, setEstado] = useState<"cargando" | "listo" | "error">("cargando");
  // Igual que el lienzo: WebGL no se enciende hasta que el bloque se acerca a
  // la pantalla. La página ya tiene otros contextos y los móviles son estrictos
  // con cuántos permiten a la vez.
  const [cerca, setCerca] = useState(false);

  useEffect(() => {
    const cont = contenedorRef.current;
    if (!cont) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setCerca(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    io.observe(cont);
    return () => io.disconnect();
  }, []);

  const ruta = disponibles[activa]?.modelo;

  useEffect(() => {
    const cont = contenedorRef.current;
    if (!cont || !cerca || !ruta) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      setEstado("error");
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    cont.appendChild(renderer.domElement);

    const escena = new THREE.Scene();
    const camara = new THREE.PerspectiveCamera(35, 1, 0.1, 100);

    // El plató del lienzo, convertido en mapa de entorno. Sin él el modelo sale
    // gris: un metal sin nada que reflejar no es metal.
    const estudio = new THREE.CanvasTexture(crearEstudio());
    estudio.mapping = THREE.EquirectangularReflectionMapping;
    estudio.colorSpace = THREE.SRGBColorSpace;
    escena.environment = estudio;

    const grupo = new THREE.Group();
    escena.add(grupo);

    let vivo = true;
    let raf = 0;
    const loader = new GLTFLoader();
    loader.load(
      ruta,
      (gltf) => {
        if (!vivo) return;
        const modelo = gltf.scene;
        // El material del archivo se descarta: queremos el cromo de la pieza,
        // no lo que viniera puesto del export.
        modelo.traverse((hijo) => {
          if ((hijo as THREE.Mesh).isMesh) {
            (hijo as THREE.Mesh).material = new THREE.MeshStandardMaterial({
              color: 0xf2f4f8,
              metalness: 1,
              roughness: 0.14,
            });
          }
        });
        // Centrar y escalar a partir de su caja: los .glb vienen con el origen y
        // el tamaño que tuvieran en Blender, y sin esto el modelo aparece fuera
        // de cuadro o del tamaño de una casa.
        const caja = new THREE.Box3().setFromObject(modelo);
        const centro = caja.getCenter(new THREE.Vector3());
        const tam = caja.getSize(new THREE.Vector3());
        const mayor = Math.max(tam.x, tam.y, tam.z) || 1;
        modelo.position.sub(centro);
        grupo.scale.setScalar(1.6 / mayor);
        grupo.add(modelo);
        setEstado("listo");
      },
      undefined,
      () => vivo && setEstado("error")
    );

    const medir = () => {
      const { width, height } = cont.getBoundingClientRect();
      renderer.setSize(width, height, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      camara.aspect = width / Math.max(1, height);
      camara.position.set(0, 0, 4.2);
      camara.updateProjectionMatrix();
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(cont);

    const girar = () => {
      raf = requestAnimationFrame(girar);
      grupo.rotation.y += 0.006;
      renderer.render(escena, camara);
    };
    girar();

    return () => {
      vivo = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      // Las geometrías y materiales del .glb ocupan memoria de vídeo y no se
      // liberan solos al quitar el nodo.
      grupo.traverse((h) => {
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
  }, [cerca, ruta]);

  if (!disponibles.length) return null;

  return (
    <div className="visor3d">
      <div ref={contenedorRef} className="visor3d-lienzo">
        {estado !== "listo" && (
          <p className="visor3d-estado">
            {estado === "error" ? "No se pudo cargar el modelo" : "Cargando el modelo…"}
          </p>
        )}
      </div>

      {/* El selector solo tiene sentido con más de un modelo. Con uno sería un
          botón que no hace nada. */}
      {disponibles.length > 1 && (
        <div className="visor3d-eras">
          {disponibles.map((e, i) => (
            <button
              key={e.nombre}
              type="button"
              className={`visor3d-era${i === activa ? " es-activa" : ""}`}
              onClick={() => setActiva(i)}
              aria-pressed={i === activa}
            >
              {e.nombre}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
