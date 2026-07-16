"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "./useLang";
import "./InfografiasViewer.css";

type Mod = { slug: string; es: string; en: string };

// Módulos clasificados por el ancho para el que fueron diseñados.
const SIZES: { key: "565" | "980" | "1256"; label: string; mods: Mod[] }[] = [
  {
    key: "565",
    label: "Contenido interior",
    mods: [
      { slug: "blade-lifter",               es: "Blade Lifter",                  en: "Blade Lifter" },
      { slug: "palas-aerogenerador",        es: "Palas de un aerogenerador",     en: "Wind turbine blades" },
      { slug: "subestacion-electrica",      es: "Subestación eléctrica",         en: "Electrical substation" },
      { slug: "cobots",                     es: "Cobots",                        en: "Cobots" },
      { slug: "energias-limpias",           es: "Energías limpias",              en: "Clean energy" },
      { slug: "turismo-espacial",           es: "Turismo espacial",              en: "Space tourism" },
    ],
  },
  {
    key: "980",
    label: "Ancho completo",
    mods: [
      { slug: "funcionamiento-visual-bombeo", es: "Funcionamiento hidráulica por bombeo", en: "Pumped-storage hydropower" },
      { slug: "mapa-visual-bombeo",           es: "Mapa de instalaciones por bombeo",     en: "Pumped-storage facilities map" },
      { slug: "tipos-movilidad-sostenible",   es: "Tipos de movilidad sostenible",        en: "Sustainable mobility types" },
    ],
  },
  {
    key: "1256",
    label: "1256px",
    mods: [
      { slug: "grupos-de-interes", es: "Grupos de interés",     en: "Stakeholders" },
      { slug: "mapa-clientes",     es: "Mapa de clientes",      en: "Customer map" },
      { slug: "home-mapa-2025",    es: "Mapa home Iberdrola",   en: "Iberdrola home map" },
    ],
  },
];

// Iframe del módulo activo: alto SIEMPRE ajustado al contenido mediante un
// ResizeObserver dentro del documento, así nunca se corta por abajo.
function ModuleFrame({ slug, lang, size }: { slug: string; lang: "es" | "en"; size: string }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(600);

  useEffect(() => {
    const iframe = ref.current;
    if (!iframe) return;
    let ro: ResizeObserver | null = null;

    const attach = () => {
      const doc = iframe.contentDocument;
      if (!doc?.body) return;
      const fit = () => setHeight(doc.body.scrollHeight);
      fit();
      ro?.disconnect();
      ro = new ResizeObserver(fit);
      ro.observe(doc.body);
    };

    iframe.addEventListener("load", attach);
    attach(); // por si ya estaba cargado
    return () => {
      iframe.removeEventListener("load", attach);
      ro?.disconnect();
    };
  }, [slug, lang]);

  return (
    <iframe
      ref={ref}
      className={`igv-frame igv-frame-${size}`}
      src={`/estaticos/${slug}/index_${lang === "en" ? "EN" : "ES"}.html`}
      title={slug}
      scrolling="no"
      style={{ height: `${height}px` }}
    />
  );
}

export default function InfografiasViewer() {
  const lang = useLang();
  const [sizeKey, setSizeKey] = useState<"565" | "980" | "1256">("565");
  const [menuOpen, setMenuOpen] = useState(false);
  const group = SIZES.find((s) => s.key === sizeKey) ?? SIZES[0];
  const [active, setActive] = useState(group.mods[0].slug);
  const current = group.mods.find((m) => m.slug === active) ?? group.mods[0];
  const label = (m: Mod) => (lang === "en" ? m.en : m.es);

  const changeSize = (key: "565" | "980" | "1256") => {
    setSizeKey(key);
    const g = SIZES.find((s) => s.key === key)!;
    setActive(g.mods[0].slug);
    setMenuOpen(false);
  };

  return (
    <div className="igv-sys">
      <div className="igv-tabs">
        {SIZES.map((s) => (
          <button
            key={s.key}
            className="igv-tab"
            data-active={s.key === sizeKey}
            onClick={() => changeSize(s.key)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="igv-box" data-tab={sizeKey}>
        <div className="igv">
          {/* Móvil: desplegable con la infografía activa; la lista se abre
              POR ENCIMA del contenido inferior, sin desplazarlo. */}
          <div className="igv-dd" data-open={menuOpen}>
            <button className="igv-dd-toggle" onClick={() => setMenuOpen(!menuOpen)}>
              <span>{label(current)}</span>
              <svg className="igv-dd-chevron" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                <path d="M2 5l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {menuOpen && (
              <div className="igv-dd-list">
                {group.mods
                  .filter((m) => m.slug !== current.slug)
                  .map((m) => (
                    <button
                      key={m.slug}
                      className="igv-dd-item"
                      onClick={() => { setActive(m.slug); setMenuOpen(false); }}
                    >
                      {label(m)}
                    </button>
                  ))}
              </div>
            )}
          </div>

          <nav className="igv-nav">
            {group.mods.map((m) => (
              <button
                key={m.slug}
                className="igv-btn"
                data-active={m.slug === current.slug}
                onClick={() => setActive(m.slug)}
              >
                {label(m)}
              </button>
            ))}
          </nav>
          <ModuleFrame slug={current.slug} lang={lang} size={sizeKey} />
        </div>
      </div>
    </div>
  );
}
