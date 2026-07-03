import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SkillDropClient from "@/components/SkillDropClient";
import HoverTrail from "@/components/HoverTrail";

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--background)" }}>
      <HoverTrail />
      <div className="header-wrap">
        <Header />
      </div>
      <main className="main-content" style={{ paddingTop: "24px", paddingBottom: "48px", flex: 1 }}>
        <SkillDropClient />
      </main>
      <div style={{ display: "flex", justifyContent: "center", padding: "0 24px 24px" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/tagline-text.svg" alt="" className="tagline-img" style={{ maxWidth: "349px", width: "100%", height: "auto" }} />
      </div>
      <div className="header-wrap">
        <Footer />
      </div>
      <style>{`
        .header-wrap {
          padding: 0 100px;
        }
        [data-theme="dark"] .tagline-img {
          filter: invert(1);
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
