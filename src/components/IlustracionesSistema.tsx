"use client";

import { useState } from "react";
import IsoHouse from "./IsoHouse";
import "./IlustracionesSistema.css";

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
                <div className="ilu-tile-box" />
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
