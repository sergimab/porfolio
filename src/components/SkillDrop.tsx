"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type MatterTypes from "matter-js";
import Link from "next/link";
import "./SkillDrop.css";

const skills = [
  { id: "motion",     label: "Motion Graphics", labelEn: "Motion Graphics", color: "rgba(217,119,6,0.15)",   border: "rgba(217,119,6,0.7)",   hue: 32  },
  { id: "branding",   label: "Branding",         labelEn: "Branding",        color: "rgba(219,39,119,0.12)", border: "rgba(219,39,119,0.6)",  hue: 330 },
  { id: "fotografia", label: "Fotografía",        labelEn: "Photography",     color: "rgba(37,99,235,0.12)",  border: "rgba(37,99,235,0.6)",   hue: 217 },
  { id: "iberdrola",  label: "Iberdrola",         labelEn: "Iberdrola",       color: "rgba(22,163,74,0.12)",  border: "rgba(22,163,74,0.6)",   hue: 142 },
  { id: "uiux",       label: "UI / UX",           labelEn: "UI / UX",         color: "rgba(124,58,237,0.12)", border: "rgba(124,58,237,0.6)",  hue: 262 },
  { id: "3d",         label: "3D",                labelEn: "3D",              color: "rgba(13,148,136,0.12)", border: "rgba(13,148,136,0.6)",  hue: 175 },
];

// Deterministic pseudo-random 0..1 from a string, so each capsule gets a
// stable (but different) animation timing that doesn't reset every frame.
function seeded(id: string, salt: number): number {
  let h = salt;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 100003;
  return h / 100003;
}

const projects: Record<string, { id: string; title: string }[]> = {
  motion:     [{ id:"m1",title:"Proyecto Motion 01"},{id:"m2",title:"Proyecto Motion 02"},{id:"m3",title:"Proyecto Motion 03"}],
  branding:   [{ id:"b1",title:"Proyecto Branding 01"},{id:"b2",title:"Proyecto Branding 02"},{id:"b3",title:"Proyecto Branding 03"}],
  fotografia: [{ id:"f1",title:"Proyecto Foto 01"},{id:"f2",title:"Proyecto Foto 02"},{id:"f3",title:"Proyecto Foto 03"}],
  iberdrola:  [{ id:"i2",title:"Sistema de diseño"},{id:"i5",title:"Sistema de ilustraciones"},{id:"i1",title:"Infografías"},{id:"i3",title:"Newsletters"},{id:"i4",title:"Iconografía"}],
  uiux:       [{ id:"u1",title:"Proyecto UI/UX 01"},{id:"u2",title:"Proyecto UI/UX 02"},{id:"u3",title:"Proyecto UI/UX 03"}],
  "3d":       [{ id:"d1",title:"Proyecto 3D 01"},{id:"d2",title:"Proyecto 3D 02"},{id:"d3",title:"Proyecto 3D 03"}],
};

function ProjectCard({ title, id, hue }: { title: string; id: string; hue: number }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href={`/proyecto/${id}`}
      style={{ display:"flex", flexDirection:"column", gap:"8px", cursor:"pointer", textDecoration:"none" }}
    >
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width:"100%", aspectRatio:"1",
          borderRadius:"8px",
          padding:"2px",
          background: `linear-gradient(120deg, hsl(${hue},70%,68%), hsl(${hue},70%,48%), hsl(${hue+20},70%,58%), hsl(${hue},70%,68%))`,
          backgroundSize:"300% 300%",
          animation:"capsuleGradient 3.2s ease-in-out infinite",
        }}
      >
        <div style={{
          width:"100%", height:"100%",
          borderRadius:"7px",
          position:"relative", overflow:"hidden",
          transition:"background 0.3s",
          background: hovered ? "var(--surface)" : "var(--background)",
        }}>
          <svg viewBox="0 0 200 200" style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:hovered?0:1, transition:"opacity 0.3s", zIndex:6 }}>
            <rect x="30" y="30" width="140" height="100" rx="4" fill="none" stroke="var(--foreground)" strokeWidth="1"/>
            <circle cx="60" cy="55" r="12" fill="none" stroke="var(--foreground)" strokeWidth="1"/>
            <line x1="30" y1="110" x2="80" y2="75" stroke="var(--foreground)" strokeWidth="1"/>
            <line x1="80" y1="75" x2="120" y2="95" stroke="var(--foreground)" strokeWidth="1"/>
            <line x1="120" y1="95" x2="170" y2="60" stroke="var(--foreground)" strokeWidth="1"/>
          </svg>
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", opacity:hovered?1:0, transition:"opacity 0.3s", zIndex:6 }}>
            <span style={{ fontSize:"12px", color:"var(--muted)" }}>Ver proyecto</span>
          </div>
        </div>
      </div>
      <span style={{ fontSize:"13px", color:"var(--foreground)", textAlign:"center" }}>{title}</span>
    </Link>
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
  const [isOver, setIsOver]       = useState(false);
  const [falling, setFalling]     = useState(false);
  const [lang, setLang]           = useState<"es"|"en">("es");
  const [theme, setTheme]         = useState<"light"|"dark">("light");
  const [selectedPanel, setSelectedPanel] = useState<string>("contacto");
  const cvIframeRef = useRef<HTMLIFrameElement>(null);
  const [cvHeight, setCvHeight] = useState(900);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [contactStatus, setContactStatus] = useState<"idle"|"sending"|"success"|"error">("idle");

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

  const handleCvLoad = useCallback(() => {
    const doc = cvIframeRef.current?.contentWindow?.document;
    if (doc) setCvHeight(doc.documentElement.scrollHeight);
  }, []);

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

    const checkDrop = () => {
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
      e.preventDefault();
      const t = e.touches[0];
      const pos = canvasPos(t.clientX, t.clientY);
      const found = Query.point(pillsRef.current.map(p => p.body), pos);
      const hit = found[0] ?? null;
      if (!hit) return;
      touchBody = hit;
      touchOffsetX = pos.x - hit.position.x;
      touchOffsetY = pos.y - hit.position.y;
      Body.setVelocity(hit, { x: 0, y: 0 });
      Body.setAngularVelocity(hit, 0);
      draggedRef.current = hit.label;
      setDraggedId(hit.label);
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (!touchBody) return;
      const t = e.touches[0];
      const pos = canvasPos(t.clientX, t.clientY);
      Body.setPosition(touchBody, { x: pos.x - touchOffsetX, y: pos.y - touchOffsetY });
      Body.setVelocity(touchBody, { x: 0, y: 0 });
      checkOver();
    };

    const onTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      touchBody = null;
      checkDrop();
    };

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
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"0 24px" }}>
      <div className="skill-grid">

        {/* "Sobre mí / Redes / CV" — first in DOM → top on mobile */}
        <div className="box-soon" style={{
          height:`${boxH}px`,
          border:"1px solid var(--foreground)", borderRadius:"16px",
          position:"relative", overflow:"hidden",
          background:"var(--background)",
          display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:"12px",
          padding:"12px",
        }}>
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
        <div className="box-skills" ref={containerRef} style={{
          height:`${boxH}px`,
          border:"1px solid var(--foreground)",
          borderRadius:"16px",
          background:"var(--background)",
          overflow:"hidden",
          position:"relative",
        }}>
          <div ref={sceneRef} style={{ position:"absolute", inset:0 }} />

          {pillPos.map(({ id, x, y, angle }) => {
            const skill = skills.find(s => s.id === id);
            if (!skill) return null;
            const isDragged = id === draggedId;

            const levitateDur   = 3 + seeded(id, 7) * 2.2;
            const levitateDelay = -(seeded(id, 13) * levitateDur);
            const trimDur       = 9 + seeded(id, 29) * 7;
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
                    width:"100%", height:"100%",
                    borderRadius:"999px",
                    border: isDragged ? "none" : "1px solid var(--foreground)",
                    background: isDragged
                      ? `linear-gradient(120deg, hsl(${skill.hue},85%,72%), hsl(${skill.hue},85%,42%), hsl(${skill.hue+25},85%,60%), hsl(${skill.hue},85%,72%))`
                      : "var(--background)",
                    backgroundSize: isDragged ? "300% 300%" : undefined,
                    animation: isDragged ? "capsuleGradient 1.8s ease-in-out infinite" : undefined,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:"13px", fontWeight: isDragged ? 500 : 400,
                    color: isDragged ? "#fff" : "var(--foreground)",
                    whiteSpace:"nowrap",
                    transition:"background 0.15s, color 0.15s",
                  }}>
                    {getLabel(skill)}
                  </div>

                  {!isDragged && (
                    <svg
                      width={PILL_W} height={PILL_H}
                      viewBox={`0 0 ${PILL_W} ${PILL_H}`}
                      style={{ position:"absolute", inset:0, overflow:"visible" }}
                    >
                      <rect
                        x="1" y="1" width={PILL_W - 2} height={PILL_H - 2} rx={(PILL_H - 2) / 2}
                        fill="none"
                        stroke={`hsl(${skill.hue}, 85%, 55%)`}
                        strokeWidth="2"
                        strokeDasharray="150 210"
                        style={{ animation: `capsuleTrim ${trimDur}s ease-in-out ${trimDelay}s infinite` }}
                      />
                    </svg>
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
                display:"flex", alignItems:"center", gap:"10px", pointerEvents:"all",
                animation: falling ? "dropExit 0.45s ease-in forwards" : "none",
              }}>
                <div style={{
                  width:`${PILL_W}px`, height:`${PILL_H}px`,
                  borderRadius:"999px",
                  padding:"2px",
                  background: `linear-gradient(120deg, hsl(${droppedSkill!.hue},70%,68%), hsl(${droppedSkill!.hue},70%,48%), hsl(${droppedSkill!.hue+20},70%,58%), hsl(${droppedSkill!.hue},70%,68%))`,
                  backgroundSize:"300% 300%",
                  animation:"capsuleGradient 3.2s ease-in-out infinite",
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
                  <button onClick={() => { setSelectedPanel("contacto"); handleReset(); }} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--muted)", fontSize:"20px", lineHeight:1, padding:0 }} aria-label="Quitar">×</button>
                )}
              </div>
            ) : (
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
            )}
          </div>
        </div>
      </div>

      <div ref={panelRef} style={{ width:"100%", display:"flex", flexDirection:"column", alignItems:"center", scrollMarginTop:"24px" }}>
      {selectedPanel in projects && (
        <div style={{ marginTop:"48px", width:"100%", maxWidth:"1024px", display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"24px" }}>
          {projects[selectedPanel].map(p => (
            <ProjectCard key={p.id} id={p.id} title={p.title} hue={skills.find(s => s.id === selectedPanel)?.hue ?? 0} />
          ))}
        </div>
      )}

      {selectedPanel === "about" && (
        <div style={{
          marginTop:"48px", width:"100%", maxWidth:"1024px",
          border:"1px dashed var(--border)", borderRadius:"16px",
          padding:"48px 24px", display:"flex", alignItems:"center", justifyContent:"center",
          background:"var(--background)",
        }}>
          <span style={{ fontSize:"13px", color:"var(--muted)" }}>
            {lang==="en" ? "About me — coming soon" : "Sobre mí — en construcción"}
          </span>
        </div>
      )}

      {selectedPanel === "cv" && (
        <div style={{
          marginTop:"48px", width:"100%", maxWidth:"1024px",
          border:"1px solid var(--foreground)", borderRadius:"16px",
          overflow:"hidden", background:"var(--background)",
        }}>
          <iframe
            key={`${lang}-${theme}`}
            ref={cvIframeRef}
            src={`${lang === "en" ? "/cv-en/index.html" : "/cv/index.html"}${theme === "dark" ? "?theme=dark" : ""}`}
            title="CV"
            scrolling="no"
            onLoad={handleCvLoad}
            style={{ width:"100%", height:`${cvHeight}px`, border:"none", display:"block" }}
          />
        </div>
      )}

      {selectedPanel === "contacto" && (
        <div style={{
          marginTop:"48px", width:"100%", maxWidth:"1024px",
          border:"1px solid var(--foreground)", borderRadius:"16px",
          padding:"40px 32px", background:"var(--background)",
        }}>
          <span className="dropcap-title" style={{ marginBottom:"24px" }}>
            {lang==="en"
              ? <><span className="dropcap-letter">L</span><span className="dropcap-rest">et&apos;s talk</span></>
              : <><span className="dropcap-letter">H</span><span className="dropcap-rest">ablemos</span></>}
          </span>

          <form onSubmit={handleContactSubmit} style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
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
              style={{ resize:"vertical" }}
            />
            <button
              type="submit"
              disabled={contactStatus === "sending"}
              className="panel-btn panel-btn-pill"
              style={{ borderRadius:"999px", padding:"10px 24px", width:"auto", alignSelf:"flex-start", cursor: contactStatus === "sending" ? "default" : "pointer" }}
            >
              <span className="panel-btn-label">
                {contactStatus === "sending"
                  ? (lang==="en" ? "Sending..." : "Enviando...")
                  : (lang==="en" ? "Send" : "Enviar")}
              </span>
            </button>

            {contactStatus === "success" && (
              <span style={{ fontSize:"12px", color:"var(--muted)" }}>
                {lang==="en" ? "Message sent — thanks!" : "Mensaje enviado — ¡gracias!"}
              </span>
            )}
            {contactStatus === "error" && (
              <span style={{ fontSize:"12px", color:"#dc2626" }}>
                {lang==="en" ? "Something went wrong. Try again." : "Algo ha fallado. Inténtalo de nuevo."}
              </span>
            )}
          </form>
        </div>
      )}
      </div>

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label={lang==="en" ? "Back to top" : "Volver arriba"}
        style={{
          position:"fixed", bottom:"24px", right:"24px", zIndex:10,
          width:"44px", height:"44px", borderRadius:"50%",
          border:"1px solid var(--foreground)",
          background:"var(--background)",
          display:"flex", alignItems:"center", justifyContent:"center",
          cursor:"pointer",
          opacity: showBackToTop ? 1 : 0,
          pointerEvents: showBackToTop ? "auto" : "none",
          transform: showBackToTop ? "translateY(0)" : "translateY(12px)",
          transition:"opacity 0.2s, transform 0.2s, background 0.15s",
        }}
        className="back-to-top-btn"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color:"var(--foreground)", position:"relative", zIndex:6 }}>
          <line x1="12" y1="19" x2="12" y2="5" />
          <polyline points="5 12 12 5 19 12" />
        </svg>
      </button>

    </div>
  );
}
