import Header from "@/components/Header";
import SkillDropClient from "@/components/SkillDropClient";

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <div className="header-wrap">
        <Header />
      </div>
      <main style={{ paddingTop: "48px", paddingBottom: "48px" }}>
        <SkillDropClient />
      </main>
      <style>{`
        .header-wrap {
          padding: 0 100px;
        }
        @media (max-width: 768px) {
          .header-wrap {
            padding: 0 16px;
          }
        }
      `}</style>
    </div>
  );
}
