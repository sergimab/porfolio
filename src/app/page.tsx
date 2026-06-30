import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SkillDropClient from "@/components/SkillDropClient";

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--background)" }}>
      <div className="header-wrap">
        <Header />
      </div>
      <main className="main-content" style={{ paddingTop: "24px", paddingBottom: "48px", flex: 1 }}>
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
          .main-content {
            padding-top: 20px;
          }
        }
      `}</style>
    </div>
  );
}
