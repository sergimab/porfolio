"use client";

import { useEffect, useState } from "react";
import IsoHouse from "./IsoHouse";
import "./IlustracionesSistema.css";

// 3 SVG isométricos por categoría (de 4 disponibles en cada carpeta).
const ISO_TILES: Record<string, { folder: string; files: string[] }> = {
  "Personas":   { folder: "isometric-personas",   files: ["Group 50180.svg", "Group 50181.svg", "Group 523.svg"] },
  "Vehículos":  { folder: "isometric-vehiculos",  files: ["Group 50116.svg", "Group 50117.svg", "Group 50118.svg"] },
  "Energías":   { folder: "isometric-energia",    files: ["Group 50105.svg", "Group 50106.svg", "Group 50107.svg"] },
  "Tecnología": { folder: "isometric-tecnologia", files: ["Group 50111.svg", "Group 50112.svg", "Group 50113.svg"] },
  "Edificios":  { folder: "isometric-edificios",  files: ["Group 50127.svg", "Group 50128.svg", "Group 50129.svg"] },
  "Naturaleza": { folder: "isometric-naturaleza", files: ["Group 50121.svg", "Group 50122.svg", "Group 50123.svg"] },
};

function isoTileSrcs(name: string): string[] {
  const cat = ISO_TILES[name];
  if (!cat) return [];
  return cat.files.map((f) => `/images/${cat.folder}/${encodeURIComponent(f)}`);
}

// 3 SVG planos por categoría (de las carpetas flat-*).
const FLAT_TILES: Record<string, { folder: string; files: string[] }> = {
  "Personas":   { folder: "flat-personas",   files: ["Group 50182.svg", "Group 65.svg", "Grupo 115.svg"] },
  "Vehículos":  { folder: "flat-vehiculos",  files: ["Group.svg", "Group-1.svg", "ilustraciones/Variant11.svg"] },
  "Energías":   { folder: "flat-energia",    files: ["Group 50183.svg", "presa.svg", "red.svg"] },
  "Tecnología": { folder: "flat-tecnologia", files: ["Group 15.svg", "bombilla.svg", "lavadora.svg"] },
  "Edificios":  { folder: "flat-edificios",  files: ["Group 10.svg", "Group.svg", "Group-1.svg"] },
  "Naturaleza": { folder: "flat-naturaleza", files: ["Group 50184.svg", "Grupo 337.svg", "mundo.svg"] },
};

function flatTileSrcs(name: string): string[] {
  const cat = FLAT_TILES[name];
  if (!cat) return [];
  // Codificamos cada segmento por separado para respetar las subcarpetas (p. ej. ilustraciones/…).
  return cat.files.map(
    (f) => `/images/${cat.folder}/${f.split("/").map(encodeURIComponent).join("/")}`
  );
}

// Escenas planas para los 2 recuadros del hero del bloque plano.
const FLAT_SCENES = ["1.svg", "2.svg"].map((f) => `/images/flat-escenas/${f}`);

// Codifica cada segmento de la ruta (respeta espacios y subcarpetas, p. ej. "… - copia").
function catPath(folder: string, file: string): string {
  return "/" + `images/${folder}/${file}`.split("/").map(encodeURIComponent).join("/");
}
function catSrcs(map: Record<string, { folder: string; files: string[] }>, name: string): string[] {
  const cat = map[name];
  if (!cat) return [];
  return cat.files.map((f) => catPath(cat.folder, f));
}

// Subholding · monocromático (carpetas base, sin "copia").
const MONO_TILES: Record<string, { folder: string; files: string[] }> = {
  "Personas":   { folder: "subholding/monocromatic-personas",   files: ["Group 50184.svg", "Group 65.svg", "Grupo 115.svg"] },
  "Vehículos":  { folder: "subholding/monocromatic-vehiculos",  files: ["Group.svg", "Group-1.svg", "fondo.svg"] },
  "Energías":   { folder: "subholding/monocromatic-energia",    files: ["Group 50185.svg", "presa.svg", "red.svg"] },
  "Tecnología": { folder: "subholding/monocromatic-tecnologia", files: ["Group 15.svg", "Group 7.svg", "contador.svg"] },
  "Edificios":  { folder: "subholding/monocromatic-edificios",  files: ["Group 49988.svg", "Group 50187.svg", "Group.svg"] },
  "Naturaleza": { folder: "subholding/monocromatic-naturaleza", files: ["Group 50186.svg", "Grupo 337.svg", "mundo.svg"] },
};

// Subholding · plano monocromático (carpetas "- copia").
const MONO_COPIA_TILES: Record<string, { folder: string; files: string[] }> = {
  "Personas":   { folder: "subholding/monocromatic-personas - copia",   files: ["Character.svg", "Group 50057.svg", "Group 50182.svg"] },
  "Vehículos":  { folder: "subholding/monocromatic-vehiculos - copia",  files: ["Group 50063.svg", "Group 50064.svg", "coche 5.svg"] },
  "Energías":   { folder: "subholding/monocromatic-energia - copia",    files: ["Group 5.svg", "Group 50058.svg", "Group 50183.svg"] },
  "Tecnología": { folder: "subholding/monocromatic-tecnologia - copia", files: ["Group 6.svg", "Group 612.svg", "Group 7.svg"] },
  "Edificios":  { folder: "subholding/monocromatic-edificios - copia",  files: ["Group 50062.svg", "Grupo 22.svg", "factory.svg"] },
  "Naturaleza": { folder: "subholding/monocromatic-naturaleza - copia", files: ["Group 50065.svg", "Group 50067.svg", "Group 50188.svg"] },
};

// Parejas de escenas de ejemplo (2 recuadros) de cada bloque subholding.
const EJEMPLOS_1 = ["Frame 48524.svg", "Frame.svg"].map((f) => catPath("subholding/ejemplos-1", f));
const EJEMPLOS_2 = ["12.svg", "Frame 32.svg"].map((f) => catPath("subholding/ejemplos-2", f));

type Block = {
  title: string;
  style: string;
  hero: "tech" | "info";
  heroCount: number;
  tiles: string[];
  iso?: boolean;
  flat?: boolean;
  heroImages?: string[];              // hero de 2 escenas lado a lado (carrusel en móvil)
  tileSet?: "mono" | "monoCopia";     // origen de los SVG de los tiles
  blueprint?: boolean;                // tiles con fondo fijo #00402A
  heroNoBorder?: boolean;             // escenas del hero sin borde
};

function tileSrcsFor(b: Block, name: string): string[] {
  if (b.iso) return isoTileSrcs(name);
  if (b.flat) return flatTileSrcs(name);
  if (b.tileSet === "mono") return catSrcs(MONO_TILES, name);
  if (b.tileSet === "monoCopia") return catSrcs(MONO_COPIA_TILES, name);
  return [];
}

const CONTENT: Record<"holding" | "subholding", Block[]> = {
  holding: [
    {
      title: "Para infografías técnicas",
      style: "Estilo isométrico",
      hero: "tech",
      heroCount: 3,
      iso: true,
      tiles: ["Personas", "Vehículos", "Energías", "Tecnología", "Edificios", "Naturaleza"],
    },
    {
      title: "Para infografías informativas",
      style: "Estilo plano",
      hero: "info",
      heroCount: 2,
      flat: true,
      tiles: ["Personas", "Vehículos", "Energías", "Naturaleza", "Tecnología", "Edificios"],
    },
  ],
  subholding: [
    {
      title: "Para infografías técnicas",
      style: "Estilo blueprint",
      hero: "info",
      heroCount: 2,
      heroImages: EJEMPLOS_1,
      tileSet: "mono",
      blueprint: true,
      tiles: ["Personas", "Vehículos", "Energías", "Tecnología", "Edificios", "Naturaleza"],
    },
    {
      title: "Para infografías informativas",
      style: "Estilo plano monocromático",
      hero: "info",
      heroCount: 2,
      heroImages: EJEMPLOS_2,
      tileSet: "monoCopia",
      heroNoBorder: true,
      tiles: ["Personas", "Vehículos", "Energías", "Naturaleza", "Tecnología", "Edificios"],
    },
  ],
};

export default function IlustracionesSistema() {
  const [tab, setTab] = useState<"holding" | "subholding">("holding");
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActiveIndex((i) => (i + 1) % 3), 2600);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="ilu-sys">
      <div className="ilu-tabs">
        <button className="ilu-tab" data-active={tab === "holding"} onClick={() => setTab("holding")}>
          Holding
        </button>
        <button className="ilu-tab" data-active={tab === "subholding"} onClick={() => setTab("subholding")}>
          Subholding
        </button>
      </div>

      <div className="ilu-box" data-tab={tab}>
      {CONTENT[tab].map((b, i) => (
        <section className="ilu-block" key={`${tab}-${i}`}>
          <h3 className="ilu-block-title">
            {b.title} <span className="ilu-block-style">- {b.style}</span>
          </h3>
          <div className="ilu-divider" />

          {b.iso ? (
            <div className="ilu-hero ilu-hero-tech">
              <div className="ilu-frame iso-scene">
                <img src="/images/isometric-escenas/Group%2050179.svg" alt="" />
              </div>
              <div className="ilu-frame iso-scene">
                <img src="/images/isometric-escenas/4.svg" alt="" />
              </div>
              <div className="iso-house-frame">
                <IsoHouse />
              </div>
            </div>
          ) : b.flat ? (
            <div className="ilu-hero ilu-hero-info">
              {FLAT_SCENES.map((src, j) => (
                <div className="ilu-frame flat-scene" key={j}>
                  <img src={src} alt="" />
                </div>
              ))}
            </div>
          ) : b.heroImages ? (
            <div className={`ilu-hero hero-pair${b.heroNoBorder ? " hero-pair-noborder" : ""}`}>
              {b.heroImages.map((src, j) => (
                <div className="ilu-frame flat-scene" key={j}>
                  <img src={src} alt="" />
                </div>
              ))}
            </div>
          ) : (
            <div className={`ilu-hero ilu-hero-${b.hero}`}>
              {Array.from({ length: b.heroCount }).map((_, j) => (
                <div className="ilu-frame" key={j} />
              ))}
            </div>
          )}

          <div className={`ilu-tiles${b.blueprint ? " ilu-tiles-blueprint" : ""}`}>
            {b.tiles.map((name) => (
              <div className="ilu-tile" key={name}>
                <div className="ilu-tile-box">
                  {tileSrcsFor(b, name).map((src, k) => (
                    <img
                      key={k}
                      className="ilu-tile-img"
                      src={src}
                      alt=""
                      data-active={k === activeIndex}
                    />
                  ))}
                </div>
                <span className="ilu-tile-name">{name}</span>
              </div>
            ))}
          </div>
        </section>
      ))}
      </div>
    </div>
  );
}
