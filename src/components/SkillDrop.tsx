"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type MatterTypes from "matter-js";

const skills = [
  { id: "motion",     label: "Motion Graphics", labelEn: "Motion Graphics", color: "rgba(217,119,6,0.15)",   border: "rgba(217,119,6,0.7)"   },
  { id: "branding",   label: "Branding",         labelEn: "Branding",        color: "rgba(219,39,119,0.12)", border: "rgba(219,39,119,0.6)"  },
  { id: "fotografia", label: "Fotografía",        labelEn: "Photography",     color: "rgba(37,99,235,0.12)",  border: "rgba(37,99,235,0.6)"   },
  { id: "iberdrola",  label: "Iberdrola",         labelEn: "Iberdrola",       color: "rgba(22,163,74,0.12)",  border: "rgba(22,163,74,0.6)"   },
  { id: "uiux",       label: "UI / UX",           labelEn: "UI / UX",         color: "rgba(124,58,237,0.12)", border: "rgba(124,58,237,0.6)"  },
];

const projects: Record<string, { id: string; title: string }[]> = {
  motion:     [{ id:"m1",title:"Proyecto Motion 01"},{id:"m2",title:"Proyecto Motion 02"},{id:"m3",title:"Proyecto Motion 03"}],
  branding:   [{ id:"b1",title:"Proyecto Branding 01"},{id:"b2",title:"Proyecto Branding 02"},{id:"b3",title:"Proyecto Branding 03"}],
  fotografia: [{ id:"f1",title:"Proyecto Foto 01"},{id:"f2",title:"Proyecto Foto 02"},{id:"f3",title:"Proyecto Foto 03"}],
  iberdrola:  [{ id:"i1",title:"Proyecto Iberdrola 01"},{id:"i2",title:"Proyecto Iberdrola 02"},{id:"i3",title:"Proyecto Iberdrola 03"}],
  uiux:       [{ id:"u1",title:"Proyecto UI/UX 01"},{id:"u2",title:"Proyecto UI/UX 02"},{id:"u3",title:"Proyecto UI/UX 03"}],
};

function ProjectCard({ title }: { title: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"8px", cursor:"pointer" }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width:"100%", aspectRatio:"1",
          border:"1px solid var(--foreground)", borderRadius:"8px",
          position:"relative", overflow:"hidden",
          transition:"background 0.3s",
          background: hovered ? "var(--surface)" : "transparent",
        }}
      >
        <svg viewBox="0 0 200 200" style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:hovered?0:1, transition:"opacity 0.3s" }}>
          <rect x="30" y="30" width="140" height="100" rx="4" fill="none" stroke="var(--foreground)" strokeWidth="1"/>
          <circle cx="60" cy="55" r="12" fill="none" stroke="var(--foreground)" strokeWidth="1"/>
          <line x1="30" y1="110" x2="80" y2="75" stroke="var(--foreground)" strokeWidth="1"/>
          <line x1="80" y1="75" x2="120" y2="95" stroke="var(--foreground)" strokeWidth="1"/>
          <line x1="120" y1="95" x2="170" y2="60" stroke="var(--foreground)" strokeWidth="1"/>
        </svg>
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", opacity:hovered?1:0, transition:"opacity 0.3s" }}>
          <span style={{ fontSize:"12px", color:"var(--muted)" }}>Ver proyecto</span>
        </div>
      </div>
      <span style={{ fontSize:"13px", color:"var(--foreground)", textAlign:"center" }}>{title}</span>
    </div>
  );
}

const BOX_W  = 500;
const DZ_H   = 64;
const PHYS_H = 340;
const BOX_H  = PHYS_H + DZ_H;
const PILL_W = 170;
const PILL_H = 42;

export default function SkillDrop() {
  const sceneRef   = useRef<HTMLDivElement>(null);
  const engineRef  = useRef<MatterTypes.Engine | null>(null);
  const runnerRef  = useRef<MatterTypes.Runner | null>(null);
  const renderRef  = useRef<MatterTypes.Render | null>(null);
  const pillsRef   = useRef<{ body: MatterTypes.Body; id: string }[]>([]);
  const draggedRef = useRef<string | null>(null);
  const rafRef     = useRef<number>(0);

  const [pillPos, setPillPos]     = useState<{ id:string; x:number; y:number; angle:number }[]>([]);
  const [dropped, setDropped]     = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [isOver, setIsOver]       = useState(false);
  const [falling, setFalling]     = useState(false);
  const [lang, setLang]           = useState<"es"|"en">("es");

  useEffect(() => {
    const stored = localStorage.getItem("lang") as "es"|"en"|null;
    if (stored) setLang(stored);
    const onLang = (e: Event) => { const l = (e as CustomEvent).detail; if (l === "es" || l === "en") setLang(l); };
    window.addEventListener("langchange", onLang);
    return () => window.removeEventListener("langchange", onLang);
  }, []);

  const getLabel = (skill: typeof skills[0]) => lang === "en" ? skill.labelEn : skill.label;

  const droppedSkill = skills.find(s => s.id === dropped);
  const draggedSkill = skills.find(s => s.id === draggedId);

  const startPhysics = useCallback(async (activeIds: string[]) => {
    const Matter = await import("matter-js");
    const { Engine, Render, Runner, Bodies, Body, Composite, Mouse, MouseConstraint, Events } = Matter;

    if (renderRef.current) { Matter.Render.stop(renderRef.current); renderRef.current.canvas.remove(); }
    if (runnerRef.current) Matter.Runner.stop(runnerRef.current);
    if (engineRef.current) Matter.Engine.clear(engineRef.current);
    cancelAnimationFrame(rafRef.current);

    const engine = Engine.create({ gravity: { x:0, y:0 }, positionIterations:6, velocityIterations:4 });
    engineRef.current = engine;

    const render = Render.create({
      element: sceneRef.current!,
      engine,
      options: { width: BOX_W, height: BOX_H, wireframes: false, background: "transparent" },
    });
    renderRef.current = render;

    // Walls: left, right, top only — no floor, pills drop through via position clamping
    const wo = { isStatic:true, render:{ fillStyle:"transparent", strokeStyle:"transparent", lineWidth:0 } };
    Composite.add(engine.world, [
      Bodies.rectangle(-25,      BOX_H/2, 50, BOX_H*2, wo),
      Bodies.rectangle(BOX_W+25, BOX_H/2, 50, BOX_H*2, wo),
      Bodies.rectangle(BOX_W/2,  -25,     BOX_W*2, 50, wo),
      Bodies.rectangle(BOX_W/2,  BOX_H+25,BOX_W*2, 50, wo),
    ]);

    const activePills = skills.filter(s => activeIds.includes(s.id));
    const pillBodies = activePills.map((skill, i) => {
      const x = 80 + (i % 3) * 190;
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
    const CLAMP_Y   = PHYS_H - PILL_H / 2 - 2;

    Events.on(engine, "afterUpdate", () => {
      for (const { body } of pillsRef.current) {
        // Clamp non-dragged pills above the drop zone
        if (body.label !== draggedRef.current && body.position.y > CLAMP_Y) {
          Body.setPosition(body, { x: body.position.x, y: CLAMP_Y });
          Body.setVelocity(body, { x: body.velocity.x, y: Math.min(0, body.velocity.y) });
        }
        // Speed cap
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

    const onMouseUp = () => {
      const id = draggedRef.current;
      draggedRef.current = null;
      setDraggedId(null);
      setIsOver(false);
      if (!id) return;
      const pill = pillsRef.current.find(p => p.id === id);
      if (!pill) return;
      // Drop if pill center is in the drop zone
      if (pill.body.position.y > PHYS_H - PILL_H / 2) {
        Composite.remove(engine.world, pill.body);
        pillsRef.current = pillsRef.current.filter(p => p.id !== id);
        setDropped(id);
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!draggedRef.current) { setIsOver(false); return; }
      // Check if dragged pill center is in drop zone using canvas coords
      const pill = pillsRef.current.find(p => p.id === draggedRef.current);
      if (pill) {
        setIsOver(pill.body.position.y > PHYS_H - PILL_H / 2);
      } else {
        setIsOver(false);
      }
      void e;
    };

    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mousemove", onMouseMove);

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
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    startPhysics(skills.map(s => s.id)).then(fn => { cleanup = fn; });
    return () => { cleanup?.(); cancelAnimationFrame(rafRef.current); };
  }, [startPhysics]);

  const handleReset = async () => {
    const id = dropped;
    if (!id) return;
    setFalling(true);
    await new Promise(r => setTimeout(r, 480));

    const Matter = await import("matter-js");
    const { Bodies, Body, Composite } = Matter;
    const engine = engineRef.current;
    if (!engine) return;

    const skill = skills.find(s => s.id === id)!;
    const x = BOX_W / 2 + (Math.random() - 0.5) * 100;
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
    setDropped(null);
  };

  return (
    <div style={{ padding:"0px 100px" }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"24px", alignItems:"start" }}>

        {/* Left: big box — canvas covers everything */}
        <div style={{
          width: `${BOX_W}px`, height: `${BOX_H}px`,
          border: "1px solid var(--foreground)",
          borderRadius: "16px",
          overflow: "hidden",
          position: "relative",
        }}>
          {/* Canvas */}
          <div ref={sceneRef} style={{ position:"absolute", inset:0 }} />

          {/* Pill labels */}
          {pillPos.map(({ id, x, y, angle }) => {
            const skill = skills.find(s => s.id === id);
            if (!skill) return null;
            const isDragged = id === draggedId;
            return (
              <div key={id} style={{
                position:"absolute", left:x, top:y,
                transform:`translate(-50%,-50%) rotate(${angle}rad)`,
                width:`${PILL_W}px`, height:`${PILL_H}px`,
                borderRadius:"999px",
                border: isDragged ? `1px solid ${skill.border}` : "1px solid var(--foreground)",
                background: isDragged ? skill.color : "var(--background)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:"13px", color:"var(--foreground)",
                pointerEvents:"none", userSelect:"none", whiteSpace:"nowrap",
                transition: "background 0.15s, border-color 0.15s",
              }}>
                {getLabel(skill)}
              </div>
            );
          })}

          {/* Drop zone visual overlay — pointer-events none so canvas gets mouse events */}
          <div style={{
            position:"absolute", bottom:0, left:0, right:0, height:`${DZ_H}px`,
            borderTop: `1px dashed ${dropped ? droppedSkill!.border : isOver && draggedSkill ? draggedSkill.border : "var(--muted)"}`,
            display:"flex", alignItems:"center", justifyContent:"center",
            transition:"background 0.2s",
            background: dropped
              ? droppedSkill!.color
              : isOver && draggedSkill ? draggedSkill.color : "transparent",
            pointerEvents:"none",
            zIndex: 1,
          }}>
            {dropped ? (
              <div style={{ display:"flex", alignItems:"center", gap:"10px", pointerEvents:"all" }}>
                <div style={{
                  width:`${PILL_W}px`, height:`${PILL_H}px`,
                  border:`1px solid ${droppedSkill!.border}`,
                  borderRadius:"999px",
                  fontSize:"13px", fontWeight:500, color:"var(--foreground)",
                  background: droppedSkill!.color,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  animation: falling ? "dropExit 0.45s ease-in forwards" : "none",
                  flexShrink: 0,
                }}>
                  {droppedSkill ? getLabel(droppedSkill) : ""}
                </div>
                {!falling && (
                  <button
                    onClick={handleReset}
                    style={{ background:"none", border:"none", cursor:"pointer", color:"var(--muted)", fontSize:"20px", lineHeight:1, padding:0 }}
                    aria-label="Quitar"
                  >×</button>
                )}
              </div>
            ) : (
              // Pill-shaped placeholder
              <div style={{
                width:`${PILL_W}px`, height:`${PILL_H}px`,
                borderRadius:"999px",
                border:`1.5px dashed ${isOver && draggedSkill ? draggedSkill.border : "var(--muted)"}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                transition:"border-color 0.15s",
              }}>
                <span style={{ fontSize:"12px", color: isOver && draggedSkill ? draggedSkill.border : "var(--muted)" }}>
                  {isOver
                    ? (lang === "en" ? "Drop here" : "Suelta aquí")
                    : (lang === "en" ? "Drag here" : "Arrastra aquí")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right */}
        <div style={{
          height:`${BOX_H}px`,
          border:"1px dashed var(--border)", borderRadius:"16px",
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>
          <span style={{ fontSize:"12px", color:"var(--border)" }}>próximamente</span>
        </div>
      </div>

      {dropped && (
        <div style={{ marginTop:"48px", display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"24px" }}>
          {projects[dropped].map(p => <ProjectCard key={p.id} title={p.title} />)}
        </div>
      )}

      <style>{`
        @keyframes dropExit {
          0%   { transform: translateY(0) scale(1);    opacity: 1; }
          60%  { transform: translateY(12px) scale(0.95); opacity: 0.6; }
          100% { transform: translateY(40px) scale(0.9); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
