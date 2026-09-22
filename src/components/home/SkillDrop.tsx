"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type MatterTypes from "matter-js";
// import ProjectCard from "./ProjectCard"; // diseño anterior (rejilla) — guardado por si volvemos
import BounceCards from "./BounceCards";
import BackToTop from "@/components/layout/BackToTop";
import DropcapTitle from "@/components/shared/DropcapTitle";
import SobreMi from "./SobreMi";
import MarcoHormigas from "@/components/shared/MarcoHormigas";
import { seeded, paletaLegible, degradadoLegible, CAPSULE_DRIFT_SIZE, drift } from "@/components/shared/organico";
import MeshGradient from "@/components/shared/MeshGradient";
import "./SkillDrop.css";

const skills = [
  // Motion y Fotografía se intercambiaron el color: el azul es de Motion y el
  // ámbar de Fotografía. Al cambiar el tono hay que cambiar también el de la
  // página del proyecto de Motion, que lo saca de aquí.
  { id: "motion",     label: "Motion Graphics", labelEn: "Motion Graphics", color: "rgba(37,99,235,0.12)",  border: "rgba(37,99,235,0.6)",   hue: 217 },
  { id: "branding",   label: "Branding",         labelEn: "Branding",        color: "rgba(219,39,119,0.12)", border: "rgba(219,39,119,0.6)",  hue: 330 },
  // Ámbar dorado y no el ocre de antes. El ocre era el mismo tono pero más
  // oscuro y menos saturado, y un color así, rebajado al 15 % sobre un fondo
  // crema —que ya es un beige—, no llega a leerse como color: queda a medio
  // camino entre los dos y ensucia. Subiendo el brillo y la saturación, la
  // cápsula se lee dorada de verdad, y el trazo sube al 85 % porque este tono
  // es más claro y al 70 se quedaba en nada.
  // El tono se mueve solo 6 grados, de 32 a 38, que es lo que permite el hueco:
  // el rojo de Editorial está en el 1 y hay que dejarle sus 31 grados largos.
  { id: "fotografia", label: "Fotografía",        labelEn: "Photography",     color: "rgba(245,158,11,0.17)", border: "rgba(245,158,11,0.85)", hue: 38  },
  { id: "iberdrola",  label: "Iberdrola",         labelEn: "Iberdrola",       color: "rgba(22,163,74,0.12)",  border: "rgba(22,163,74,0.6)",   hue: 142 },
  { id: "uiux",       label: "UI / UX",           labelEn: "UI / UX",         color: "rgba(13,148,136,0.12)", border: "rgba(13,148,136,0.6)",  hue: 175 },
  { id: "3d",         label: "3D",                labelEn: "3D",              color: "rgba(124,58,237,0.12)", border: "rgba(124,58,237,0.6)",  hue: 262 },
  // Rojo, y no el verde lima de antes: aquel tono quedaba a 58° del verde de
  // Iberdrola y a esa distancia los dos verdes se confundían de un vistazo. El
  // 1 es el punto más alejado del hueco que queda libre —a 31° del rosa de
  // Branding por un lado y a 31° del ámbar de Motion por el otro—, así que
  // reparte a partes iguales lo poco que hay.
  { id: "editorial",  label: "Editorial",         labelEn: "Editorial",       color: "rgba(220,38,38,0.13)",  border: "rgba(220,38,38,0.6)",   hue: 1   },
];


const projects: Record<string, { id: string; title: string; titleEn: string; cover?: string }[]> = {
  motion:     [{ id:"m1",title:"Motion Yelmo Cines",titleEn:"Yelmo Cines motion",cover:"/covers/motion-yelmo.webp"},{id:"m2",title:"Motion El Arte del Miedo",titleEn:"The Art of Fear motion",cover:"/covers/el-arte-del-miedo-motion.webp"}],
  branding:   [{ id:"b1",title:"Espacio vacío",titleEn:"Empty space",cover:"/covers/espacio-vacio.webp"},{id:"b2",title:"Rebranding Yelmo Cines",titleEn:"Yelmo Cines rebranding",cover:"/covers/rebranding-yelmo.webp"},{id:"b3",title:"El Arte del Miedo",titleEn:"The Art of Fear",cover:"/covers/el-arte-del-miedo-branding.webp"}],
  fotografia: [{ id:"f1",title:"Afiche Orquesta Tokio",titleEn:"Orquesta Tokio poster",cover:"/covers/orquesta-tokio.webp"}],
  iberdrola:  [{ id:"i2",title:"Sistema de diseño",titleEn:"Design system"},{id:"i5",title:"Sistema de ilustraciones",titleEn:"Illustration system",cover:"/covers/sistema-ilustraciones.svg"},{id:"i1",title:"Infografías",titleEn:"Infographics",cover:"/covers/infografias.webp"},{id:"i3",title:"Newsletters",titleEn:"Newsletters",cover:"/covers/newsletters.webp"},{id:"i4",title:"Iconografía",titleEn:"Iconography",cover:"/covers/iberdrola-iconografia.svg"}],
  uiux:       [{ id:"u1",title:"Web de Elysium",titleEn:"Elysium website",cover:"/covers/elysium-web.webp"},{id:"u2",title:"App Espacio vacío",titleEn:"Empty space app",cover:"/covers/espacio-vacio-app.webp"},{id:"u3",title:"App El Arte del Miedo",titleEn:"The Art of Fear app",cover:"/covers/el-arte-del-miedo-app.webp"}],
  "3d":       [{ id:"d1",title:"Elysium",titleEn:"Elysium",cover:"/covers/elysium-3D.webp"}],
  editorial:  [{ id:"e1",title:"Disco Elysium",titleEn:"Disco Elysium",cover:"/covers/elysium-editorial.webp"}],
};


// Un atajo de contacto: el disco con el icono del correo o del teléfono.
//
// DOS COMPORTAMIENTOS, Y NO POR CAPRICHO. Con ratón, acercarse ya es una
// intención y el disco se abre solo para enseñar el dato; ahí un menú sobraría,
// porque pulsar el enlace hace lo evidente. En el móvil no existe acercarse, y
// además pulsar un `tel:` llama de golpe, que no siempre es lo que se quiere:
// muchas veces lo que se busca es quedarse el número para pegarlo en otro
// sitio. Así que allí el disco abre un menú con las dos cosas.
//
// La frontera es la misma que la del CSS, 600, y se mira en el momento de
// pulsar y no al montar el componente: así no hay nada que arreglar si la
// ventana cambia de tamaño, y el servidor y el cliente pintan lo mismo.
function Atajo({
  tipo, valor, href, abierto, onAbrir, onCerrar, lang,
}: {
  tipo: "mail" | "tel";
  valor: string;
  href: string;
  abierto: boolean;
  onAbrir: () => void;
  onCerrar: () => void;
  lang: "es" | "en";
}) {
  const caja = useRef<HTMLDivElement>(null);
  const [copiado, setCopiado] = useState(false);

  // Se cierra al pulsar fuera y con Escape, que es lo que cualquiera espera de
  // algo que se ha abierto encima de la página.
  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: PointerEvent) => {
      if (!caja.current?.contains(e.target as Node)) onCerrar();
    };
    const tecla = (e: KeyboardEvent) => { if (e.key === "Escape") onCerrar(); };
    document.addEventListener("pointerdown", fuera);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("pointerdown", fuera);
      document.removeEventListener("keydown", tecla);
    };
  }, [abierto, onCerrar]);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(valor);
      setCopiado(true);
      // Se cierra solo, pero no de inmediato: hay que darle tiempo a leer que
      // se ha copiado, que es la única señal de que ha pasado algo.
      setTimeout(() => { setCopiado(false); onCerrar(); }, 900);
    } catch {
      // Sin permiso para el portapapeles —o sin portapapeles— no queda nada que
      // hacer desde aquí, así que se deja el menú abierto con el dato a la
      // vista para poder copiarlo a mano.
    }
  };

  const etiqueta = tipo === "mail"
    ? (lang === "en" ? `Email: ${valor}` : `Correo: ${valor}`)
    : (lang === "en" ? `Phone: ${valor}` : `Teléfono: ${valor}`);

  const accion = tipo === "mail"
    ? (lang === "en" ? "Write an email" : "Escribir correo")
    : (lang === "en" ? "Call" : "Llamar");

  const copia = tipo === "mail"
    ? (lang === "en" ? "Copy email" : "Copiar correo")
    : (lang === "en" ? "Copy number" : "Copiar teléfono");

  return (
    <div className="contacto-atajo-caja" ref={caja}>
      <a
        className="contacto-atajo"
        href={href}
        aria-label={etiqueta}
        aria-haspopup="menu"
        aria-expanded={abierto}
        onClick={(e) => {
          if (window.matchMedia("(max-width: 600px)").matches) {
            e.preventDefault();
            onAbrir();
          }
        }}
      >
        <span className="contacto-atajo-icono" aria-hidden="true">
          {tipo === "mail" ? (
            // Sobre: la solapa es una uve y no un triángulo relleno, para que
            // el icono pese lo mismo que el trazo del disco.
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2.75" y="5.25" width="18.5" height="13.5" rx="2.5" />
              <path d="M4 7.5 12 13.2 20 7.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="6.5" y="2.75" width="11" height="18.5" rx="2.5" />
              <path d="M10.5 18.4h3" strokeLinecap="round" />
            </svg>
          )}
        </span>
        <span className="contacto-atajo-texto" aria-hidden="true">
          <span>{valor}</span>
        </span>
      </a>

      {abierto && (
        <div className="contacto-menu" role="menu">
          <button type="button" role="menuitem" onClick={() => { onCerrar(); window.location.href = href; }}>
            {accion}
          </button>
          <button type="button" role="menuitem" onClick={copiar}>
            {copiado ? (lang === "en" ? "Copied" : "Copiado") : copia}
          </button>
        </div>
      )}
    </div>
  );
}

const DZ_H   = 64;
const PILL_W = 140;
const PILL_H = 42;

export default function SkillDrop() {
  const sceneRef     = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef     = useRef<HTMLDivElement>(null);
  const engineRef    = useRef<MatterTypes.Engine | null>(null);
  const runnerRef    = useRef<MatterTypes.Runner | null>(null);
  const renderRef    = useRef<MatterTypes.Render | null>(null);
  const pillsRef     = useRef<{ body: MatterTypes.Body; id: string }[]>([]);
  const draggedRef   = useRef<string | null>(null);
  const droppedRef   = useRef<string | null>(null);
  const resettingRef = useRef<boolean>(false);
  const genRef       = useRef<number>(0);
  const rafRef       = useRef<number>(0);
  const boxWRef      = useRef<number>(500);
  const boxHRef      = useRef<number>(500);

  const [boxH, setBoxH]           = useState<number>(500);
  const [pillPos, setPillPos]     = useState<{ id:string; x:number; y:number; angle:number }[]>([]);
  const [dropped, setDropped]     = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isOver, setIsOver]       = useState(false);
  const [falling, setFalling]     = useState(false);
  const [lang, setLang]           = useState<"es"|"en">("es");
  const [theme, setTheme]         = useState<"light"|"dark">("light");
  const [selectedPanel, setSelectedPanel] = useState<string>("contacto");
  // Dos maneras de elegir categoría: las cápsulas que se arrastran, y un menú
  // vertical corriente. Lo segundo no es un modo «de repuesto»: arrastrar pide
  // ratón, pulso y ver la pantalla, y hay quien no tiene las tres cosas. La
  // elección se recuerda, que quien la necesita la necesita siempre.
  const [modoLista, setModoLista] = useState(false);
  const cvIframeRef = useRef<HTMLIFrameElement>(null);
  const [cvHeight, setCvHeight] = useState(900);
  // El CV se ve agrandado en pantallas anchas. Su maqueta mide 780 px y el
  // panel casi 1000, así que sobraban cien píxeles de aire a cada lado y la
  // letra se quedaba pequeña de más. En vez de tocar el documento —que también
  // se imprime y se abre suelto—, se amplía desde fuera.
  const [cvZoom, setCvZoom] = useState(1);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [contactStatus, setContactStatus] = useState<"idle"|"sending"|"success"|"error">("idle");
  // Cuál de los dos atajos de contacto tiene el menú abierto, si alguno. Vive
  // aquí y no en cada atajo para que abrir uno cierre el otro: dos menús
  // abiertos a la vez se solaparían, que están a diez píxeles.
  const [atajoMenu, setAtajoMenu] = useState<"mail"|"tel"|null>(null);

  const handleContactSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setContactStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      });
      if (!res.ok) throw new Error();
      setContactStatus("success");
      setContactForm({ name: "", email: "", message: "" });
    } catch {
      setContactStatus("error");
    }
  }, [contactForm]);

  useEffect(() => {
    if (dropped) setSelectedPanel(dropped);
  }, [dropped]);

  useEffect(() => {
    try {
      if (localStorage.getItem("skill-modo") === "lista") setModoLista(true);
    } catch {
      // Navegación privada o almacenamiento bloqueado: se queda en cápsulas.
    }
  }, []);

  const cambiarModo = () => {
    setModoLista(m => {
      try { localStorage.setItem("skill-modo", m ? "capsulas" : "lista"); } catch {}
      return !m;
    });
  };

  // Arriving from a project page (e.g. /?cat=iberdrola): dock that category's
  // capsule in the drop zone (as if dropped), open its projects and scroll to them.
  useEffect(() => {
    const cat = new URLSearchParams(window.location.search).get("cat");
    if (!cat || !(cat in projects)) return;
    let cancelled = false;
    setSelectedPanel(cat);

    (async () => {
      // Wait until the physics pill for this category has been created.
      for (let i = 0; i < 60 && !cancelled; i++) {
        const pill = pillsRef.current.find(p => p.id === cat);
        if (pill && engineRef.current) {
          const { Composite } = await import("matter-js");
          Composite.remove(engineRef.current.world, pill.body);
          pillsRef.current = pillsRef.current.filter(p => p.id !== cat);
          droppedRef.current = cat;
          setDropped(cat);
          panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }
        await new Promise(r => setTimeout(r, 50));
      }
    })();

    return () => { cancelled = true; };
  }, []);

  // El ancho de la maqueta del CV: 780 de página y 20 de aire a cada lado. Es
  // lo que hay que llevar de un borde al otro del panel.
  const CV_ANCHO = 820;

  const medirCv = useCallback(() => {
    const el = cvIframeRef.current;
    const doc = el?.contentWindow?.document;
    if (!el || !doc) return;
    // El hueco de verdad, descontando el respiro de la caja: `clientWidth` lo
    // incluye, y con él la hoja se ampliaba hasta comerse ese margen.
    const caja = el.parentElement;
    if (!caja) return;
    const cs = getComputedStyle(caja);
    const panel =
      caja.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    // Solo se agranda, nunca se encoge: por debajo de su ancho natural la
    // maqueta ya se adapta sola y forzarla sería empeorarla. Y con tope, que
    // pasado cierto punto la letra se vuelve un cartel.
    const z = panel > CV_ANCHO ? Math.min(panel / CV_ANCHO, 1.3) : 1;
    setCvZoom(z);
    setCvHeight(doc.documentElement.scrollHeight);
  }, []);

  // Al cambiar el ancho de la ventana, el aumento cambia con él.
  useEffect(() => {
    window.addEventListener("resize", medirCv);
    return () => window.removeEventListener("resize", medirCv);
  }, [medirCv]);


  useEffect(() => {
    const stored = localStorage.getItem("lang") as "es"|"en"|null;
    if (stored) setLang(stored);
    const onLang = (e: Event) => { const l = (e as CustomEvent).detail; if (l === "es" || l === "en") setLang(l); };
    window.addEventListener("langchange", onLang);
    return () => window.removeEventListener("langchange", onLang);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("theme") as "light"|"dark"|null;
    if (stored) setTheme(stored);
    const onTheme = (e: Event) => { const t = (e as CustomEvent).detail; if (t === "light" || t === "dark") setTheme(t); };
    window.addEventListener("themechange", onTheme);
    return () => window.removeEventListener("themechange", onTheme);
  }, []);

  const getLabel = (skill: typeof skills[0]) => lang === "en" ? skill.labelEn : skill.label;

  const droppedSkill = skills.find(s => s.id === dropped);
  const draggedSkill = skills.find(s => s.id === draggedId);

  const startPhysics = useCallback(async (activeIds: string[], boxW: number, boxH: number) => {
    const myGen = ++genRef.current;
    const Matter = await import("matter-js");
    const { Engine, Render, Runner, Bodies, Body, Composite, Mouse, MouseConstraint, Events, Query } = Matter;

    // Bail out if a newer init started while we were awaiting the import
    // (e.g. rapid resize events) — avoids stacking multiple physics worlds.
    if (myGen !== genRef.current) return () => {};

    if (renderRef.current) { Matter.Render.stop(renderRef.current); renderRef.current.canvas.remove(); }
    if (runnerRef.current) Matter.Runner.stop(runnerRef.current);
    if (engineRef.current) Matter.Engine.clear(engineRef.current);
    cancelAnimationFrame(rafRef.current);

    const engine = Engine.create({ gravity: { x:0, y:0 }, positionIterations:6, velocityIterations:4 });
    engineRef.current = engine;

    const render = Render.create({
      element: sceneRef.current!,
      engine,
      options: { width: boxW, height: boxH, wireframes: false, background: "transparent" },
    });
    renderRef.current = render;

    const wo = { isStatic:true, render:{ fillStyle:"transparent", strokeStyle:"transparent", lineWidth:0 } };
    Composite.add(engine.world, [
      Bodies.rectangle(-25,       boxH/2,  50,      boxH*2,  wo),
      Bodies.rectangle(boxW+25,   boxH/2,  50,      boxH*2,  wo),
      Bodies.rectangle(boxW/2,    -25,     boxW*2,  50,      wo),
      Bodies.rectangle(boxW/2,    boxH+25, boxW*2,  50,      wo),
      // El mordisco del botón de cambio, arriba a la izquierda: es un muro más,
      // para que ninguna cápsula pueda esconderse detrás de él. Mide lo que el
      // botón cerrado; cuando se abre al pasar por encima es cosa de un
      // instante y ahí sí puede taparse algo.
      Bodies.rectangle(24,        23,      48,      46,      wo),
    ]);

    const activePills = skills.filter(s => activeIds.includes(s.id));
    const colW = boxW / 3;
    const pillBodies = activePills.map((skill, i) => {
      const x = colW * (i % 3) + colW / 2;
      const y = 60 + Math.floor(i / 3) * 150;
      const body = Bodies.rectangle(x, y, PILL_W, PILL_H, {
        restitution: 0.4, friction: 0, frictionAir: 0.012,
        chamfer: { radius: PILL_H / 2 },
        render: { fillStyle:"transparent", strokeStyle:"transparent", lineWidth:0 },
        label: skill.id,
      });
      Body.setAngle(body, (Math.random() - 0.5) * 0.3);
      Body.setVelocity(body, { x: (Math.random()-0.5)*2.5, y: (Math.random()-0.5)*2.5 });
      return { body, id: skill.id };
    });

    pillsRef.current = pillBodies;
    Composite.add(engine.world, pillBodies.map(p => p.body));

    const mouse = Mouse.create(render.canvas);
    // matter-js se apunta él solo a los eventos táctiles del lienzo y los corta
    // todos —llama a preventDefault en cada uno— para poder arrastrar cuerpos
    // con el dedo. Eso dejaba el panel como una trampa en el móvil: tocaras
    // donde tocaras, la página no rodaba. Aquí el táctil lo llevamos nosotros
    // —más abajo, distinguiendo si hay cápsula debajo o no—, así que se le
    // quitan esas tres escuchas y se queda solo con el ratón.
    const m = mouse as unknown as {
      element: HTMLElement;
      mousedown: EventListener;
      mousemove: EventListener;
      mouseup: EventListener;
      mousewheel: EventListener;
    };
    m.element.removeEventListener("touchstart", m.mousedown);
    m.element.removeEventListener("touchmove", m.mousemove);
    m.element.removeEventListener("touchend", m.mouseup);
    // Y lo mismo con la rueda del ratón: matter-js la escucha para hacer zoom y
    // la corta, así que con el cursor encima del panel la página se quedaba
    // clavada. Aquí no hay nada que ampliar; la rueda es de quien lee.
    m.element.removeEventListener("wheel", m.mousewheel);
    m.element.removeEventListener("mousewheel", m.mousewheel);
    m.element.removeEventListener("DOMMouseScroll", m.mousewheel);
    const mc = MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.15, render: { visible: false } },
    });
    Composite.add(engine.world, mc);
    render.mouse = mouse;

    Events.on(mc, "startdrag", (e: any) => {
      const id = e.body?.label ?? null;
      draggedRef.current = id;
      setDraggedId(id);
    });
    Events.on(mc, "enddrag", () => {
      draggedRef.current = null;
      setDraggedId(null);
      setIsOver(false);
    });

    const MAX_SPEED = 3;
    const physH   = boxH - DZ_H;
    const CLAMP_Y = physH - PILL_H / 2 - 2;

    Events.on(engine, "afterUpdate", () => {
      for (const { body } of pillsRef.current) {
        if (body.label !== draggedRef.current && body.position.y > CLAMP_Y) {
          Body.setPosition(body, { x: body.position.x, y: CLAMP_Y });
          Body.setVelocity(body, { x: body.velocity.x, y: Math.min(0, body.velocity.y) });
        }
        const v = body.velocity;
        const speed = Math.sqrt(v.x * v.x + v.y * v.y);
        if (speed > MAX_SPEED) {
          const scale = MAX_SPEED / speed;
          Body.setVelocity(body, { x: v.x * scale, y: v.y * scale });
        }
        if (Math.abs(body.angularVelocity) > 0.05) {
          Body.setAngularVelocity(body, body.angularVelocity * 0.85);
        }
      }
    });

    const releasePill = (id: string) => {
      const skill = skills.find(s => s.id === id);
      if (!skill) return;
      const x = boxW / 2 + (Math.random() - 0.5) * 100;
      const body = Bodies.rectangle(x, PILL_H / 2 + 4, PILL_W, PILL_H, {
        restitution: 0.4, friction: 0, frictionAir: 0.012,
        chamfer: { radius: PILL_H / 2 },
        render: { fillStyle:"transparent", strokeStyle:"transparent", lineWidth:0 },
        label: skill.id,
      });
      Body.setVelocity(body, { x: (Math.random()-0.5)*1.5, y: 1.5 });
      Composite.add(engine.world, body);
      pillsRef.current = [...pillsRef.current, { body, id: skill.id }];
    };

    // Suelta lo que el ratón tuviera agarrado, pase lo que pase.
    //
    // matter-js escucha el ratón EN EL CANVAS, así que si sueltas el botón
    // fuera de él —arrastrando una cápsula más abajo del recuadro, por
    // ejemplo— nunca se entera: se queda con el cuerpo agarrado y el botón
    // pulsado. El siguiente clic no agarra nada, porque para él ya está
    // arrastrando; y el de después sí, porque su mouseup por fin llega dentro.
    // De ahí el "al primer clic no va y al segundo sí".
    //
    // Esto va colgado de la VENTANA, que es donde el navegador entrega el
    // mouseup siempre, y deshace el agarre a mano.
    const soltarRaton = () => {
      // Los tipos de matter-js declaran estos campos como no nulos, pero la
      // librería los pone a null justo aquí: es su forma de decir "no hay nada
      // agarrado". Se afloja el tipo en vez de inventar un cuerpo vacío.
      const constraint = mc.constraint as unknown as Record<string, unknown>;
      constraint.bodyB = null;
      constraint.pointB = null;
      (mc as unknown as Record<string, unknown>).body = null;
      mouse.button = -1;
    };

    const checkDrop = () => {
      soltarRaton();
      const id = draggedRef.current;
      draggedRef.current = null;
      setDraggedId(null);
      setIsOver(false);
      if (!id) return;
      const pill = pillsRef.current.find(p => p.id === id);
      if (!pill) return;
      if (pill.body.position.y > physH - PILL_H / 2) {
        Composite.remove(engine.world, pill.body);
        pillsRef.current = pillsRef.current.filter(p => p.id !== id);
        // If another capsule is mid-release (X button / panel switch), its own
        // handleReset already owns returning it — don't release it a second time.
        if (droppedRef.current && droppedRef.current !== id && !resettingRef.current) {
          releasePill(droppedRef.current);
        }
        droppedRef.current = id;
        setDropped(id);
      }
    };

    const checkOver = () => {
      if (!draggedRef.current) { setIsOver(false); return; }
      const pill = pillsRef.current.find(p => p.id === draggedRef.current);
      setIsOver(pill ? pill.body.position.y > physH - PILL_H / 2 : false);
    };

    // Custom touch drag — directly moves matter-js bodies (bypasses MouseConstraint for touch)
    const canvas = render.canvas;
    let touchBody: MatterTypes.Body | null = null;
    let touchOffsetX = 0;
    let touchOffsetY = 0;

    const canvasPos = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = boxW / rect.width;
      const scaleY = boxH / rect.height;
      return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
    };

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      const pos = canvasPos(t.clientX, t.clientY);
      const found = Query.point(pillsRef.current.map(p => p.body), pos);
      const hit = found[0] ?? null;
      // Sin cápsula debajo, el dedo no es para arrastrar: se le deja al
      // navegador para que la página ruede. Cortar el gesto aquí dejaba el
      // panel como una trampa en el móvil —se tocaba el hueco entre cápsulas y
      // la página se quedaba clavada—.
      if (!hit) return;
      e.preventDefault();
      touchBody = hit;
      touchOffsetX = pos.x - hit.position.x;
      touchOffsetY = pos.y - hit.position.y;
      Body.setVelocity(hit, { x: 0, y: 0 });
      Body.setAngularVelocity(hit, 0);
      draggedRef.current = hit.label;
      setDraggedId(hit.label);
    };

    const onTouchMove = (e: TouchEvent) => {
      // Solo se corta el desplazamiento mientras se lleva una cápsula en el
      // dedo; si no, el gesto es de la página.
      if (!touchBody) return;
      e.preventDefault();
      const t = e.touches[0];
      const pos = canvasPos(t.clientX, t.clientY);
      Body.setPosition(touchBody, { x: pos.x - touchOffsetX, y: pos.y - touchOffsetY });
      Body.setVelocity(touchBody, { x: 0, y: 0 });
      checkOver();
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (touchBody) e.preventDefault();
      touchBody = null;
      // En táctil no hay "salir con el ratón": si un toque llega a disparar un
      // mousemove sintético, la cápsula se quedaría encendida para siempre.
      setHoveredId(null);
      checkDrop();
    };

    // Hover: qué cápsula hay bajo el cursor. Hay que preguntárselo al motor
    // de física, no al DOM, porque las cápsulas que se ven son divs con
    // pointer-events desactivado —sus posiciones las manda matter-js— y quien
    // recibe el ratón es el canvas. Query.point hace justo eso: qué cuerpo
    // ocupa ese punto.
    const onHover = (e: MouseEvent) => {
      const pos = canvasPos(e.clientX, e.clientY);
      const found = Query.point(pillsRef.current.map(p => p.body), pos);
      setHoveredId(found[0]?.label ?? null);
    };
    const onLeaveCanvas = () => setHoveredId(null);
    canvas.addEventListener("mousemove", onHover);
    canvas.addEventListener("mouseleave", onLeaveCanvas);

    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove",  onTouchMove,  { passive: false });
    canvas.addEventListener("touchend",   onTouchEnd,   { passive: false });

    window.addEventListener("mouseup",   checkDrop);
    window.addEventListener("mousemove", checkOver);

    Render.run(render);
    const runner = Runner.create();
    runnerRef.current = runner;
    Runner.run(runner, engine);

    const tick = () => {
      setPillPos(pillsRef.current.map(({ body, id }) => ({
        id, x: body.position.x, y: body.position.y, angle: body.angle,
      })));
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      canvas.removeEventListener("mousemove", onHover);
      canvas.removeEventListener("mouseleave", onLeaveCanvas);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove",  onTouchMove);
      canvas.removeEventListener("touchend",   onTouchEnd);
      window.removeEventListener("mouseup",   checkDrop);
      window.removeEventListener("mousemove", checkOver);
    };
  }, []);

  // Init physics once container is measured
  useEffect(() => {
    if (!containerRef.current) return;
    let cleanup: (() => void) | undefined;

    const init = (w: number) => {
      const h = window.innerWidth <= 768 ? w : Math.round(w * 0.65);
      boxWRef.current = w;
      boxHRef.current = h;
      setBoxH(h);
      const activeIds = skills.map(s => s.id).filter(id => id !== droppedRef.current);
      startPhysics(activeIds, w, h).then(fn => { cleanup = fn; });
    };

    const ro = new ResizeObserver(entries => {
      const w = Math.floor(entries[0].contentRect.width);
      if (w > 0 && w !== boxWRef.current) {
        cleanup?.();
        init(w);
      }
    });
    ro.observe(containerRef.current);
    init(containerRef.current.offsetWidth || 500);

    return () => { ro.disconnect(); cleanup?.(); cancelAnimationFrame(rafRef.current); };
  }, [startPhysics]);

  const handleReset = async () => {
    const id = dropped;
    if (!id || resettingRef.current) return;
    resettingRef.current = true;
    // Keep droppedRef pointing at this id for the whole animation, so a
    // resize-triggered physics re-init still excludes it (it isn't back
    // in the floating set yet) — only clear it once the pill actually returns.
    setFalling(true);
    await new Promise(r => setTimeout(r, 480));

    const Matter = await import("matter-js");
    const { Bodies, Body, Composite } = Matter;
    const engine = engineRef.current;
    if (!engine) { resettingRef.current = false; return; }

    const skill = skills.find(s => s.id === id)!;
    const boxW = boxWRef.current;
    void boxHRef.current;
    const x = boxW / 2 + (Math.random() - 0.5) * 100;
    const body = Bodies.rectangle(x, PILL_H / 2 + 4, PILL_W, PILL_H, {
      restitution: 0.4, friction: 0, frictionAir: 0.012,
      chamfer: { radius: PILL_H / 2 },
      render: { fillStyle:"transparent", strokeStyle:"transparent", lineWidth:0 },
      label: skill.id,
    });
    Body.setVelocity(body, { x: (Math.random()-0.5)*1.5, y: 1.5 });
    Composite.add(engine.world, body);
    pillsRef.current = [...pillsRef.current, { body, id: skill.id }];

    setFalling(false);
    if (droppedRef.current === id) droppedRef.current = null;
    setDropped(prev => (prev === id ? null : prev));
    resettingRef.current = false;
  };

  // If the user navigates to another panel (About/CV/Contact) while a skill
  // capsule is still docked in the drop zone, release it back into the box.
  useEffect(() => {
    if (dropped && selectedPanel !== dropped) {
      handleReset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPanel]);

  // On mobile, jump down to the panel content when a tile is tapped —
  // it lives below the fold otherwise.
  const scrollToPanel = () => {
    if (window.innerWidth <= 768) {
      requestAnimationFrame(() => {
        panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  };

  return (
    <div className="skill-drop">
      <div className="skill-grid">

        {/* "Sobre mí / Redes / CV" — first in DOM → top on mobile.
            height es dinámico (JS iguala ambas cajas); el resto en CSS. */}
        <div className="box-soon" style={{ height:`${boxH}px` }}>
          {/* Sobre mí — selects the "about" panel below */}
          <a
            href="#"
            className="panel-btn panel-btn-tile"
            data-active={selectedPanel === "about"}
            onClick={(e) => { e.preventDefault(); setSelectedPanel("about"); scrollToPanel(); }}
          >
            <span className="panel-btn-label">
              {lang==="en" ? "About me" : "Sobre mí"}
            </span>
          </a>

          {/* CV — selects the "cv" panel below */}
          <a
            href="#"
            className="panel-btn panel-btn-tile"
            data-active={selectedPanel === "cv"}
            onClick={(e) => { e.preventDefault(); setSelectedPanel("cv"); scrollToPanel(); }}
          >
            <span className="panel-btn-label">CV</span>
          </a>

          {/* Contacto — selected by default */}
          <a
            href="#"
            className="panel-btn panel-btn-tile"
            data-active={selectedPanel === "contacto"}
            onClick={(e) => { e.preventDefault(); setSelectedPanel("contacto"); scrollToPanel(); }}
          >
            <span className="panel-btn-label">
              {lang==="en" ? "Contact" : "Contacto"}
            </span>
          </a>
        </div>

        {/* Skills box — shown first (left) on desktop */}
        <div className={`box-skills${modoLista ? " es-lista" : ""}`} ref={containerRef} style={{ height:`${boxH}px` }}>
          {/* El lienzo de física se queda montado siempre, también en modo
              lista: desmontarlo obligaría a rehacer el mundo entero al volver,
              y ahí no se ve nada —las cápsulas son HTML, no dibujo—. */}
          <div ref={sceneRef} className="skill-scene" />

          <button type="button" className="skill-cambio" onClick={cambiarModo}>
            {/* Dos flechas en sentidos contrarios: el signo de «cambiar a la
                otra forma», que es lo que hace. */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 8h13" />
              <polyline points="13.5 4.5 17 8 13.5 11.5" />
              <path d="M20 16H7" />
              <polyline points="10.5 12.5 7 16 10.5 19.5" />
            </svg>
            <span className="skill-cambio-texto">
              {modoLista
                ? (lang==="en" ? "Capsules" : "Cápsulas")
                : (lang==="en" ? "Simple menu" : "Menú simple")}
            </span>
          </button>

          {modoLista && (
            <ul className="skill-lista">
              {/* De más proyectos a menos: la lista es para ir al grano, así que
                  arriba lo que más hay que enseñar. Los empates mantienen el
                  orden de las cápsulas. */}
              {[...skills]
                .sort((a, b) => (projects[b.id]?.length ?? 0) - (projects[a.id]?.length ?? 0))
                .map(skill => (
                <li key={skill.id}>
                  <button
                    type="button"
                    /* El degradado de CSS se queda DEBAJO como red: si el
                       navegador no da WebGL, el botón sigue pintándose del color
                       de su categoría, solo que sin el fluido. */
                    style={{
                      ["--fila-color" as string]: degradadoLegible(skill.hue),
                      ["--fila-medida" as string]: CAPSULE_DRIFT_SIZE,
                      ...drift(skill.id),
                    }}
                    data-activa={selectedPanel === skill.id}
                    onClick={() => { setSelectedPanel(skill.id); scrollToPanel(); }}
                  >
                    {/* La malla, calculada en el shader. Los colores son los de
                        la categoría; la casilla activa va encendida sin ratón,
                        que es la única manera de que se note en un móvil. */}
                    <MeshGradient
                      colores={paletaLegible(skill.hue)}
                      encendido={selectedPanel === skill.id}
                      /* Cero en reposo: la casilla apagada no se ve —el lienzo
                         está a opacidad 0—, así que además de invisible se
                         queda parada y no gasta fotogramas. */
                      velocidadReposo={0}
                      velocidadHover={0.45}
                      suavizado={0.5}
                      escala={1.0}
                    />
                    <span className="mesh-encima">{getLabel(skill)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {!modoLista && (<>

          {pillPos.map(({ id, x, y, angle }) => {
            const skill = skills.find(s => s.id === id);
            if (!skill) return null;
            const isDragged = id === draggedId;
            // El hover se pinta igual que el arrastre: relleno de color con su
            // degradado en movimiento, texto en blanco y sin borde ni aro. Lo
            // que NO comparte es la levitación, que sigue solo al arrastre: la
            // cápsula sobre la que pasas el ratón sigue flotando como las demás.
            const encendida = isDragged || id === hoveredId;

            const levitateDur   = 3 + seeded(id, 7) * 2.2;
            const levitateDelay = -(seeded(id, 13) * levitateDur);
            const trimDur       = 7 + seeded(id, 29) * 5;
            const trimDelay     = -(seeded(id, 41) * trimDur);

            return (
              <div key={id} style={{
                position:"absolute", left:x, top:y,
                transform:`translate(-50%,-50%) rotate(${angle}rad)`,
                width:`${PILL_W}px`, height:`${PILL_H}px`,
                pointerEvents:"none", userSelect:"none",
              }}>
                <div style={{
                  position:"relative", width:"100%", height:"100%",
                  animation: isDragged ? undefined : `capsuleLevitate ${levitateDur}s ease-in-out ${levitateDelay}s infinite`,
                }}>
                  <div style={{
                    position:"relative",
                    // El recorte de la píldora. Es esto lo que le da la forma al
                    // lienzo del degradado, que por su cuenta es un rectángulo.
                    overflow:"hidden",
                    width:"100%", height:"100%",
                    borderRadius:"999px",
                    border: encendida ? "none" : "1px solid var(--foreground)",
                    backgroundColor: encendida ? undefined : "var(--background)",
                    // El degradado de CSS se queda debajo como red, por si no
                    // hay WebGL.
                    backgroundImage: encendida ? degradadoLegible(skill.hue, 85) : undefined,
                    backgroundSize: encendida ? CAPSULE_DRIFT_SIZE : undefined,
                    animation: encendida ? "capsuleDrift 13s ease-in-out infinite" : undefined,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:"13px", fontWeight: encendida ? 500 : 400,
                    color: encendida ? "#fff" : "var(--foreground)",
                    whiteSpace:"nowrap",
                    transition:"background 0.15s, color 0.15s",
                  }}>
                    {/* Aquí el encendido NO puede venir del ratón: las cápsulas
                        llevan los eventos desactivados —quien los recibe es el
                        lienzo de la física, que es quien sabe sobre cuál está el
                        cursor—, así que se lo dice `encendida`. */}
                    <MeshGradient
                      colores={paletaLegible(skill.hue, 85)}
                      encendido={encendida}
                      velocidadReposo={0}
                      velocidadHover={0.4}
                      suavizado={0.45}
                      escala={0.85}
                      className={encendida ? undefined : "es-apagado"}
                    />
                    <span className="mesh-encima">{getLabel(skill)}</span>
                  </div>

                  {!encendida && (
                    <div style={{
                      position:"absolute", inset:0,
                      borderRadius:"999px",
                      border: `2px solid hsl(${skill.hue}, 85%, 55%)`,
                      opacity: 0,
                      animation: `capsuleGlow ${trimDur}s ease-in-out ${trimDelay}s infinite`,
                    }} />
                  )}
                </div>
              </div>
            );
          })}

          {/* Drop zone overlay */}
          <div style={{
            position:"absolute", bottom:0, left:0, right:0, height:`${DZ_H}px`,
            borderTop:`1px dashed ${dropped ? droppedSkill!.border : isOver && draggedSkill ? draggedSkill.border : "var(--muted)"}`,
            display:"flex", alignItems:"center", justifyContent:"center",
            transition:"background 0.2s",
            background: dropped ? droppedSkill!.color : isOver && draggedSkill ? draggedSkill.color : "transparent",
            pointerEvents:"none",
            zIndex:1,
          }}>
            {dropped ? (
              <div style={{
                position:"relative", display:"flex", alignItems:"center", pointerEvents:"all",
                animation: falling ? "dropExit 0.45s ease-in forwards" : "none",
              }}>
                <div style={{
                  width:`${PILL_W}px`, height:`${PILL_H}px`,
                  borderRadius:"999px",
                  padding:"2px",
                  backgroundImage: degradadoLegible(droppedSkill!.hue),
                  backgroundSize: CAPSULE_DRIFT_SIZE,
                  animation:"capsuleDrift 15s ease-in-out infinite",
                  flexShrink:0,
                }}>
                  <div style={{
                    width:"100%", height:"100%", borderRadius:"999px",
                    fontSize:"13px", fontWeight:500, color:"var(--foreground)",
                    background: "var(--background)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                  }}>
                    {droppedSkill ? getLabel(droppedSkill) : ""}
                  </div>
                </div>
                {!falling && (
                  // En absoluto para no desplazar la cápsula del centro
                  <button onClick={() => { setSelectedPanel("contacto"); handleReset(); }} style={{ position:"absolute", left:"calc(100% + 10px)", background:"none", border:"none", cursor:"pointer", color:"var(--muted)", fontSize:"20px", lineHeight:1, padding:0 }} aria-label="Quitar">×</button>
                )}
              </div>
            ) : (
              <div style={{ position:"relative", display:"flex", alignItems:"center" }}>
                {/* Flecha animada que señala la zona de soltar (en absoluto
                    para no desplazar la caja del centro) */}
                <svg className="dz-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="4" y1="12" x2="19" y2="12" />
                  <polyline points="13 6 19 12 13 18" />
                </svg>
                <div style={{
                  width:`${PILL_W}px`, height:`${PILL_H}px`,
                  borderRadius:"999px",
                  border:`1.5px dashed ${isOver && draggedSkill ? draggedSkill.border : "var(--muted)"}`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  transition:"border-color 0.15s",
                }}>
                  <span style={{ fontSize:"12px", color: isOver && draggedSkill ? draggedSkill.border : "var(--muted)" }}>
                    {isOver ? (lang==="en"?"Drop here":"Suelta aquí") : (lang==="en"?"Drag here":"Arrastra aquí")}
                  </span>
                </div>
              </div>
            )}
          </div>
          </>)}
        </div>
      </div>

      <div ref={panelRef} className="skill-panels">
      {selectedPanel in projects && (
        <BounceCards
          items={projects[selectedPanel]}
          lang={lang}
          hue={skills.find(s => s.id === selectedPanel)?.hue ?? 0}
        />
      )}

      {selectedPanel === "about" && (
        <div className="home-panel panel-about">
          <SobreMi />
        </div>
      )}

      {selectedPanel === "cv" && (
        <div
          className="home-panel panel-cv"
          /* La ampliación no ocupa sitio en la maqueta —es un dibujado, no una
             medida—, así que el alto de la caja hay que ponerlo ya crecido. */
          style={{ height: `${Math.round(cvHeight * cvZoom)}px`, ["--cv-zoom" as string]: cvZoom }}
        >
          {/* El mismo marco de guiones en marcha que «Sobre mí». */}
          <MarcoHormigas />
          <iframe
            key={`${lang}-${theme}`}
            ref={cvIframeRef}
            src={`${lang === "en" ? "/cv-en/index.html" : "/cv/index.html"}${theme === "dark" ? "?theme=dark" : ""}`}
            title="CV"
            scrolling="no"
            onLoad={medirCv}
            style={{ height:`${cvHeight}px` }}
          />
        </div>
      )}

      {selectedPanel === "contacto" && (
        <div className="home-panel panel-contacto">
          {/* El título a un lado y las dos puertas directas al otro. Estaban en
              una caja aparte debajo del formulario, con el dato siempre a la
              vista; aquí se quedan en dos discos que solo se abren al
              acercarse, porque en esta esquina lo que tiene que leerse es
              «Hablemos», y el correo y el teléfono son la alternativa a
              rellenar el formulario, no lo primero que hay que mirar. */}
          <div className="contacto-cabecera">
            <DropcapTitle es="Hablemos" en="Let's talk" />

            <div className="contacto-atajos">
              <Atajo
                tipo="mail"
                valor="sergioomb96@gmail.com"
                href="mailto:sergioomb96@gmail.com"
                abierto={atajoMenu === "mail"}
                onAbrir={() => setAtajoMenu(m => (m === "mail" ? null : "mail"))}
                onCerrar={() => setAtajoMenu(null)}
                lang={lang}
              />
              <Atajo
                tipo="tel"
                valor="+34 626 17 36 61"
                href="tel:+34626173661"
                abierto={atajoMenu === "tel"}
                onAbrir={() => setAtajoMenu(m => (m === "tel" ? null : "tel"))}
                onCerrar={() => setAtajoMenu(null)}
                lang={lang}
              />
            </div>
          </div>

          <form onSubmit={handleContactSubmit} className="contact-form">
            <input
              type="text"
              required
              placeholder={lang==="en" ? "Name" : "Nombre"}
              value={contactForm.name}
              onChange={(e) => setContactForm(f => ({ ...f, name: e.target.value }))}
              className="contact-input"
            />
            <input
              type="email"
              required
              placeholder="Email"
              value={contactForm.email}
              onChange={(e) => setContactForm(f => ({ ...f, email: e.target.value }))}
              className="contact-input"
            />
            <textarea
              required
              rows={5}
              placeholder={lang==="en" ? "Message" : "Mensaje"}
              value={contactForm.message}
              onChange={(e) => setContactForm(f => ({ ...f, message: e.target.value }))}
              className="contact-input"
            />
            <button
              type="submit"
              disabled={contactStatus === "sending"}
              className="panel-btn panel-btn-pill contact-submit"
            >
              <span className="panel-btn-label">
                {contactStatus === "sending"
                  ? (lang==="en" ? "Sending..." : "Enviando...")
                  : (lang==="en" ? "Send" : "Enviar")}
              </span>
            </button>

            {contactStatus === "success" && (
              <span className="contact-status">
                {lang==="en" ? "Message sent — thanks!" : "Mensaje enviado — ¡gracias!"}
              </span>
            )}
            {contactStatus === "error" && (
              <span className="contact-status-error">
                {lang==="en" ? "Something went wrong. Try again." : "Algo ha fallado. Inténtalo de nuevo."}
              </span>
            )}
          </form>

        </div>
      )}

      </div>

      <BackToTop />

    </div>
  );
}
