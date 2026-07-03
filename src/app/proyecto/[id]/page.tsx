import Link from "next/link";

const titles: Record<string, string> = {
  m1: "Proyecto Motion 01", m2: "Proyecto Motion 02", m3: "Proyecto Motion 03",
  b1: "Proyecto Branding 01", b2: "Proyecto Branding 02", b3: "Proyecto Branding 03",
  f1: "Proyecto Foto 01", f2: "Proyecto Foto 02", f3: "Proyecto Foto 03",
  i1: "Infografías", i2: "Sistema de diseño", i3: "Newsletters", i4: "Iconografía",
  u1: "Proyecto UI/UX 01", u2: "Proyecto UI/UX 02", u3: "Proyecto UI/UX 03",
  d1: "Proyecto 3D 01", d2: "Proyecto 3D 02", d3: "Proyecto 3D 03",
};

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const title = titles[id] ?? "Proyecto";

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: "16px",
      background: "var(--background)", color: "var(--foreground)",
      fontFamily: "var(--font-geist-sans), sans-serif", padding: "24px", textAlign: "center",
    }}>
      <span style={{ fontSize: "13px", color: "var(--muted)" }}>Próximamente</span>
      <h1 style={{ fontSize: "22px", fontWeight: 500 }}>{title}</h1>
      <p style={{ fontSize: "13px", color: "var(--muted)", maxWidth: "360px" }}>
        Esta página está en construcción. Aquí se mostrará el proyecto completo.
      </p>
      <Link href="/" style={{ fontSize: "13px", color: "var(--foreground)", marginTop: "12px" }}>
        ← Volver al inicio
      </Link>
    </div>
  );
}
