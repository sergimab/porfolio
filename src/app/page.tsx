import Header from "@/components/Header";

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <div style={{ padding: "0px 100px 0px" }}>
        <Header />
      </div>
      <main className="px-6 py-12">
        {/* contenido de la home aquí */}
      </main>
    </div>
  );
}
