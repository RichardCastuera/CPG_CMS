"use client";
import { ArtifactCard } from "@/components/Artifact/ArtifactCard";
import { CategoryFilterTabs } from "@/components/Artifact/CaegoryFilterTabs";
import React, { useState } from "react";

// const Artifacts = () => {
//   return <div>Artifacts</div>;
// };

// export default Artifacts;

// temporary preview, e.g. in app/artifacts/page.tsx while building

export default function Preview() {
  const [active, setActive] = useState<"all" | any>("all");
  return <CategoryFilterTabs active={active} onChange={setActive} />;
}
