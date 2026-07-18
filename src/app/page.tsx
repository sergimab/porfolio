import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SkillDropClient from "@/components/SkillDropClient";
import "./page.css";

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <main className="main-content" style={{ paddingTop: "24px", paddingBottom: "48px", flex: 1 }}>
        <SkillDropClient />
      </main>
      <div style={{ display: "flex", justifyContent: "center", padding: "0 24px 24px" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/tagline-text.svg" alt="" className="tagline-img" style={{ maxWidth: "190px", width: "100%", height: "auto" }} />
      </div>
      <div className="header-wrap">
        <Footer />
      </div>
    </div>
  );
}
