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

type Block = {
  title: string;
  style: string;
  hero: "tech" | "info";
  heroCount: number;
  tiles: string[];
  iso?: boolean;
};

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
      tiles: ["Personas", "Vehículos", "Energías", "Naturaleza", "Tecnología", "Edificios"],
    },
  ],
  subholding: [
    {
      title: "Para infografías técnicas",
      style: "Estilo blueprint",
      hero: "tech",
      heroCount: 3,
      tiles: ["Personas", "Vehículos", "Energías", "Tecnología", "Edificios", "Naturaleza"],
    },
    {
      title: "Para infografías informativas",
      style: "Estilo plano monocromático",
      hero: "info",
      heroCount: 2,
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
          ) : (
            <div className={`ilu-hero ilu-hero-${b.hero}`}>
              {Array.from({ length: b.heroCount }).map((_, j) => (
                <div className="ilu-frame" key={j} />
              ))}
            </div>
          )}

          <div className="ilu-tiles">
            {b.tiles.map((name) => (
              <div className="ilu-tile" key={name}>
                <div className="ilu-tile-box">
                  {b.iso && isoTileSrcs(name).map((src, k) => (
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
