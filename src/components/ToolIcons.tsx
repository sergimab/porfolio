"use client";

import { useLang } from "./useLang";
import "./ToolIcons.css";

// Herramientas usadas. Iconos monocromos (var(--muted)) que al hacer hover
// se pintan de su color de marca (brand).
const TOOLS: { name: string; brand: string; node: React.ReactNode }[] = [
  {
    name: "Figma",
    brand: "#F24E1E",
    node: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M15.852 8.981h-4.588V0h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491zM12.735 7.51h3.117c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-3.117V7.51zm0 1.471H8.148c-2.476 0-4.49-2.014-4.49-4.49S5.672 0 8.148 0h4.588v8.981zm-4.587-7.51c-1.665 0-3.019 1.355-3.019 3.019s1.354 3.02 3.019 3.02h3.117V1.471H8.148zm4.587 15.019H8.148c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h4.588v8.98zM8.148 8.981c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h3.117V8.981H8.148zM8.172 24c-2.489 0-4.515-2.014-4.515-4.49s2.014-4.49 4.49-4.49h4.588v4.441c0 2.503-2.047 4.539-4.563 4.539zm-.024-7.51a3.023 3.023 0 0 0-3.019 3.019c0 1.665 1.365 3.019 3.044 3.019 1.705 0 3.093-1.376 3.093-3.068v-2.97H8.148zm7.704 0h-.098c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h.098c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.49-4.49 4.49zm-.097-7.509c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h.098c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-.098z"
        />
      </svg>
    ),
  },
  {
    name: "Visual Studio Code",
    brand: "#007ACC",
    node: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352zm-5.146 14.861L10.826 12l7.178-5.448v10.896z"
        />
      </svg>
    ),
  },
  {
    name: "After Effects",
    brand: "#9999FF",
    node: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="1.5" y="1.5" width="21" height="21" rx="4.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <text x="12" y="12.4" textAnchor="middle" dominantBaseline="central" fontSize="9.5" fontWeight="600" fill="currentColor">Ae</text>
      </svg>
    ),
  },
  {
    name: "Illustrator",
    brand: "#FF9A00",
    node: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="1.5" y="1.5" width="21" height="21" rx="4.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <text x="12" y="12.4" textAnchor="middle" dominantBaseline="central" fontSize="9.5" fontWeight="600" fill="currentColor">Ai</text>
      </svg>
    ),
  },
  {
    name: "Blender",
    brand: "#F5792A",
    node: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12.51 13.214c.046-.8.438-1.506 1.03-2.006a3.424 3.424 0 0 1 2.212-.79c.85 0 1.631.3 2.211.79.592.5.983 1.206 1.028 2.005.045.823-.285 1.586-.865 2.153a3.389 3.389 0 0 1-2.374.938 3.393 3.393 0 0 1-2.376-.938c-.58-.567-.91-1.33-.865-2.152M7.35 14.831c.006.314.106.922.256 1.398a7.372 7.372 0 0 0 1.593 2.757 8.227 8.227 0 0 0 2.787 2.001 8.947 8.947 0 0 0 3.66.76 8.964 8.964 0 0 0 3.657-.772 8.285 8.285 0 0 0 2.785-2.01 7.428 7.428 0 0 0 1.592-2.762 6.964 6.964 0 0 0 .25-3.074 7.123 7.123 0 0 0-1.016-2.779 7.764 7.764 0 0 0-1.852-2.043h.002L13.566 2.55l-.02-.015c-.492-.378-1.319-.376-1.86.002-.547.382-.609 1.015-.123 1.415l-.001.001 3.126 2.543-9.53.01h-.013c-.788.001-1.545.518-1.695 1.172-.154.665.38 1.217 1.2 1.22V8.9l4.83-.01-8.62 6.617-.034.025c-.813.622-1.075 1.658-.563 2.313.52.667 1.625.668 2.447.004L7.414 14s-.069.52-.063.831zm12.09 1.741c-.97.988-2.326 1.548-3.795 1.55-1.47.004-2.827-.552-3.797-1.538a4.51 4.51 0 0 1-1.036-1.622 4.282 4.282 0 0 1 .282-3.519 4.702 4.702 0 0 1 1.153-1.371c.942-.768 2.141-1.183 3.396-1.185 1.256-.002 2.455.41 3.398 1.175.48.391.87.854 1.152 1.367a4.28 4.28 0 0 1 .522 1.706 4.236 4.236 0 0 1-.239 1.811 4.54 4.54 0 0 1-1.035 1.626"
        />
      </svg>
    ),
  },
  {
    // Stripo (editor de emails): logo oficial. Monocromo (currentColor) y verde en hover.
    name: "Stripo",
    brand: "#31CA4B",
    node: (
      <svg viewBox="0 0 118 216" aria-hidden="true">
        <g fill="currentColor">
          <path d="M47.24,133.24c-6.17,7.11-17.28,19.24-26.16,16.14-11.8-4.12-7.22-29.56-.76-37.99,10.03,3.38,21.39-8.28,27.44-15.64l19.41-23.61c6.18-7.52,21.64-22.52,31.03-17.13,10.1,5.8,9.08,33.52,7.61,45.25-3.98-7.69-12.24-10.46-19.95-6.38-7.4,3.92-13.12,9.96-18.64,16.32l-19.99,23.03Z" />
          <path d="M11.37,122.1c-.61-21.02-1.98-37.1,8.81-55.18,12.55-21.03,27.06-40.13,42.71-59.01l.04,40.02c-13.23,14.99-25.81,29.59-37.09,45.91-5.72,9.48-11.58,17.94-14.47,28.26Z" />
          <path d="M85.42,152.38c-12.07,17.37-22.96,37.23-26.13,57.72-1.61-29.47-.48-53.42,16.21-78.69l22.36-33.84c3.57,1.67,4.63,4.82,5.32,8.24,3.66,18.03-7.63,31.98-17.77,46.57Z" />
        </g>
      </svg>
    ),
  },
];

// `tools` filtra y ordena qué programas mostrar (por nombre). Si se omite,
// se muestran todos.
export default function ToolIcons({ tools }: { tools?: string[] }) {
  const lang = useLang();
  const list = tools
    ? tools.map((name) => TOOLS.find((t) => t.name === name)).filter((t): t is (typeof TOOLS)[number] => Boolean(t))
    : TOOLS;

  return (
    <div className="tool-icons">
      <span className="tool-icons-label">{lang === "en" ? "Crafted with" : "Hecho con"}</span>
      <ul className="tool-icons-list">
        {list.map((t) => (
          <li
            key={t.name}
            className="tool-icon"
            title={t.name}
            aria-label={t.name}
            style={{ ["--brand" as string]: t.brand }}
          >
            {t.node}
          </li>
        ))}
      </ul>
    </div>
  );
}
