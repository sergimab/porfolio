"use client";

import dynamic from "next/dynamic";

const SkillDrop = dynamic(() => import("./SkillDrop"), { ssr: false });

export default function SkillDropClient() {
  return <SkillDrop />;
}
