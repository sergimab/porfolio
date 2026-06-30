import Header from "@/components/Header";
import dynamic from "next/dynamic";

const SkillDrop = dynamic(() => import("@/components/SkillDrop"), { ssr: false });

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <div style={{ padding: "0px 100px 0px" }}>
        <Header />
      </div>
      <main style={{ paddingTop: "48px", paddingBottom: "48px" }}>
        <SkillDrop />
      </main>
    </div>
  );
}
