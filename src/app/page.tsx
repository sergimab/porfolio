import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SkillDropClient from "@/components/home/SkillDropClient";
import "./page.css";

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <main className="main-content" style={{ paddingTop: "48px", paddingBottom: "48px", flex: 1 }}>
        <SkillDropClient />
      </main>
      <div style={{ display: "flex", justifyContent: "center", padding: "0 24px 24px" }}>
        <div className="tagline-wrap" style={{ maxWidth: "240px", width: "100%" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/marca/tagline-text.svg" alt="" className="tagline-img" style={{ width: "100%", height: "auto" }} />
        </div>
      </div>
      <div className="header-wrap">
        <Footer />
      </div>
    </div>
  );
}
