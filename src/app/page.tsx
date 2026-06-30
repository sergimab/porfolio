import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SkillDropClient from "@/components/SkillDropClient";

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <div className="header-wrap">
        <Header />
      </div>
      <main style={{ paddingTop: "24px", paddingBottom: "48px" }}>
        <SkillDropClient />
      </main>
      <div className="header-wrap">
        <Footer />
      </div>
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
