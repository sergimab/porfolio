import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "../../page.css";
import "@/components/SkillDrop.css";

const titles: Record<string, string> = {
  m1: "Proyecto Motion 01", m2: "Proyecto Motion 02", m3: "Proyecto Motion 03",
  b1: "Proyecto Branding 01", b2: "Proyecto Branding 02", b3: "Proyecto Branding 03",
  f1: "Proyecto Foto 01", f2: "Proyecto Foto 02", f3: "Proyecto Foto 03",
  i1: "Infografías", i2: "Sistema de diseño", i3: "Newsletters", i4: "Iconografía", i5: "Sistema de ilustraciones",
  u1: "Proyecto UI/UX 01", u2: "Proyecto UI/UX 02", u3: "Proyecto UI/UX 03",
  d1: "Proyecto 3D 01", d2: "Proyecto 3D 02", d3: "Proyecto 3D 03",
};

function Placeholder({ ratio = "1" }: { ratio?: string }) {
  return (
    <div style={{
      width: "100%", aspectRatio: ratio, borderRadius: "8px",
      border: "1px solid var(--foreground)", position: "relative", overflow: "hidden",
    }}>
      <svg viewBox="0 0 200 200" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <rect x="30" y="30" width="140" height="100" rx="4" fill="none" stroke="var(--muted)" strokeWidth="1"/>
        <circle cx="60" cy="55" r="12" fill="none" stroke="var(--muted)" strokeWidth="1"/>
        <line x1="30" y1="110" x2="80" y2="75" stroke="var(--muted)" strokeWidth="1"/>
        <line x1="80" y1="75" x2="120" y2="95" stroke="var(--muted)" strokeWidth="1"/>
        <line x1="120" y1="95" x2="170" y2="60" stroke="var(--muted)" strokeWidth="1"/>
      </svg>
    </div>
  );
}

function Swatches({ label, colors }: { label: string; colors: string[] }) {
  return (
    <div>
      <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {label}
      </span>
      <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
        {colors.map((c, i) => (
          <div key={i} style={{ width: "24px", height: "24px", borderRadius: "6px", background: c, border: "1px solid var(--border)" }} />
        ))}
      </div>
    </div>
  );
}

const categorias = ["Personas", "Vehículos", "Energía", "Naturaleza", "Tecnología", "Edificios"];

function StyleColumn({
  badge, badgeColor, styleName, description, principales, secundarios, dark,
}: {
  badge: string; badgeColor: string; styleName: string; description: string;
  principales: string[]; secundarios: string[]; dark?: boolean;
}) {
  return (
    <div style={{
      border: "1px solid var(--foreground)", borderRadius: "16px", padding: "24px",
      background: dark ? "#12261c" : "var(--background)",
      color: dark ? "#eafff0" : "var(--foreground)",
      display: "flex", flexDirection: "column", gap: "20px",
    }}>
      <span style={{
        alignSelf: "flex-start", fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
        letterSpacing: "0.04em", padding: "4px 10px", borderRadius: "999px",
        background: badgeColor, color: "#fff",
      }}>
        {badge}
      </span>

      <div>
        <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px" }}>
          Estilo <em style={{ fontStyle: "italic" }}>{styleName}</em>
        </h3>
        <p style={{ fontSize: "13px", lineHeight: 1.6, color: dark ? "#c9e8d4" : "var(--muted)" }}>
          {description}
        </p>
      </div>

      <div style={{ display: "flex", gap: "24px" }}>
        <Swatches label="Principales" colors={principales} />
        <Swatches label="Secundarios" colors={secundarios} />
      </div>

      <div>
        <span style={{ fontSize: "12px", fontWeight: 600 }}>Ejemplos de temáticas</span>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginTop: "10px" }}>
          {categorias.map(cat => (
            <div key={cat} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <Placeholder />
              <span style={{ fontSize: "10px", textAlign: "center", color: dark ? "#c9e8d4" : "var(--muted)" }}>{cat}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <span style={{ fontSize: "12px", fontWeight: 600 }}>Ejemplos reales</span>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", marginTop: "10px" }}>
          <Placeholder ratio="4/3" />
          <Placeholder ratio="4/3" />
        </div>
      </div>
    </div>
  );
}

function SectionHeading({ title }: { title: string }) {
  const cap = title.charAt(0);
  const rest = title.slice(1);
  return (
    <h2 className="dropcap-title" style={{ fontSize: "16px", marginBottom: "4px" }}>
      <span className="dropcap-letter" style={{ fontSize: "34px" }}>{cap}</span>
      <span className="dropcap-rest">{rest}</span>
    </h2>
  );
}

function IlustracionesLanding() {
  return (
    <main style={{ flex: 1, paddingBottom: "64px" }}>
      <div className="header-wrap" style={{ paddingTop: "24px" }}>
        <div style={{
          height: "180px", borderRadius: "16px",
          background: "linear-gradient(180deg, #b6f2c0 0%, #22c55e 55%, #16a34a 100%)",
        }} />

        <div style={{
          display: "flex", flexWrap: "wrap", justifyContent: "space-between",
          alignItems: "flex-start", gap: "16px", marginTop: "-18px",
        }}>
          <span style={{
            display: "inline-flex", alignItems: "center",
            border: "1px solid rgba(22,163,74,0.6)", borderRadius: "999px",
            padding: "8px 18px", fontSize: "13px", fontWeight: 500,
            color: "var(--foreground)", background: "var(--background)",
          }}>
            Iberdrola
          </span>

          <div style={{
            border: "1px solid var(--foreground)", borderRadius: "12px",
            padding: "14px 20px", background: "var(--background)",
            display: "flex", flexDirection: "column", gap: "6px",
            marginTop: "18px",
          }}>
            <div style={{ display: "flex", gap: "24px", fontSize: "13px" }}>
              <span style={{ fontWeight: 700, minWidth: "64px" }}>Agencia</span>
              <span>Prodigioso Volcán</span>
            </div>
            <div style={{ display: "flex", gap: "24px", fontSize: "13px" }}>
              <span style={{ fontWeight: 700, minWidth: "64px" }}>Equipo</span>
              <span>Cuatro diseñadores</span>
            </div>
          </div>
        </div>

        <h1 className="project-hero-title" style={{ marginTop: "8px" }}>
          <span className="project-hero-cap">S</span>
          <span className="project-hero-rest">istema de ilustraciones</span>
        </h1>

        <p style={{ fontSize: "14px", color: "var(--foreground)", maxWidth: "520px", lineHeight: 1.6, marginTop: "20px" }}>
          No solo ilustraciones — un lenguaje. Diseñamos en equipo un sistema visual para Iberdrola
          que pusiera orden en el caos: qué estilo, qué piezas, para qué contexto. Infografías,
          banners, web. Y dentro de eso, una distinción clara entre la identidad corporativa de
          Iberdrola y la de su subholding Iberdrola España.
        </p>

        {/* ── Contenidos técnicos ── */}
        <div style={{ marginTop: "56px" }}>
          <SectionHeading title="Ilustraciones para contenidos técnicos" />
          <p style={{ fontSize: "13px", color: "var(--muted)", maxWidth: "560px", marginBottom: "24px" }}>
            Dos lenguajes visuales distintos según el emisor: volumen y perspectiva para holding,
            precisión de plano técnico para subholding.
          </p>
          <div className="style-columns">
            <StyleColumn
              badge="Holding"
              badgeColor="#16a34a"
              styleName="isométrico"
              description="Reservado para casos puntuales de carácter técnico: procesos o elementos arquitectónicos y electromecánicos. El manejo correcto del volumen y la perspectiva facilita entender la estructura y sus componentes, con una comunicación visual atractiva y precisa."
              principales={["#22c55e", "#3b82f6", "#f97316"]}
              secundarios={["#a7f3d0", "#bfdbfe", "#fed7aa", "#0f766e"]}
            />
            <StyleColumn
              badge="Subholding"
              badgeColor="#0f3d24"
              styleName="blueprint"
              description="Aplica al infografiado de contenido técnico de Iberdrola España: fiabilidad y precisión mediante la representación de componentes y procesos como si fueran un plano de ingeniería."
              principales={["#eafff0", "#4ade80", "#16a34a"]}
              secundarios={["#166534", "#052e16", "#bbf7d0"]}
              dark
            />
          </div>
        </div>

        {/* ── Acompañamiento ── */}
        <div style={{ marginTop: "56px" }}>
          <SectionHeading title="Ilustraciones para acompañamiento" />
          <p style={{ fontSize: "13px", color: "var(--muted)", maxWidth: "560px", marginBottom: "24px" }}>
            Piezas más editoriales, pensadas para acompañar texto sin competir con el contenido
            técnico: un estilo plano a color para holding, monocromático para subholding.
          </p>
          <div className="style-columns">
            <StyleColumn
              badge="Holding"
              badgeColor="#16a34a"
              styleName="plano"
              description="El estilo plano se emplea como recurso visual complementario en infografías cuya prioridad no es el contenido técnico o divulgativo, sino acompañar de forma sencilla y visual el discurso escrito."
              principales={["#f97316", "#3b82f6", "#166534"]}
              secundarios={["#fed7aa", "#bfdbfe", "#d9f99d", "#fde68a"]}
            />
            <StyleColumn
              badge="Subholding"
              badgeColor="#0f3d24"
              styleName="plano monocromático"
              description="El estilo plano monocromático emplea una paleta reducida y coherente con la identidad de Iberdrola España, manteniendo la sencillez visual del estilo plano con mayor consistencia entre piezas."
              principales={["#38bdf8", "#0ea5e9", "#0c4a6e"]}
              secundarios={["#bae6fd", "#7dd3fc", "#075985"]}
              dark
            />
          </div>
        </div>
      </div>
    </main>
  );
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const title = titles[id] ?? "Proyecto";

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--background)" }}>
      <Header />

      {id === "i5" ? (
        <IlustracionesLanding />
      ) : (
        <main style={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: "16px",
          color: "var(--foreground)", padding: "24px", textAlign: "center",
        }}>
          <span style={{ fontSize: "13px", color: "var(--muted)" }}>Próximamente</span>
          <h1 style={{ fontSize: "22px", fontWeight: 500 }}>{title}</h1>
          <p style={{ fontSize: "13px", color: "var(--muted)", maxWidth: "360px" }}>
            Esta página está en construcción. Aquí se mostrará el proyecto completo.
          </p>
        </main>
      )}

      <div className="header-wrap">
        <Footer />
      </div>
    </div>
  );
}
