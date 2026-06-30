import Header from "@/components/Header";
import SkillDropClient from "@/components/SkillDropClient";

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <div style={{ padding: "0px 100px 0px" }}>
        <Header />
      </div>
      <main style={{ paddingTop: "48px", paddingBottom: "48px" }}>
        <SkillDropClient />
      </main>
    </div>
  );
}
