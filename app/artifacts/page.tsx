import { ArtifactCard } from "@/components/Artifact/ArtifactCard";
import React from "react";

// const Artifacts = () => {
//   return <div>Artifacts</div>;
// };

// export default Artifacts;

// temporary preview, e.g. in app/artifacts/page.tsx while building

const MOCK_CARDS = [
  { name: "Sample name", category: "figure" as const },
  { name: "Sample name", category: "table" as const },
  { name: "Sample name", category: "flowchart" as const },
  { name: "Sample name", category: "chart" as const },
  { name: "Sample name", category: "pdf" as const },
  { name: "Sample name", category: "figure" as const },
];

export default function ArtifactsPreview() {
  return (
    <div className="grid grid-cols-3 gap-4 p-6">
      {MOCK_CARDS.map((card, i) => (
        <ArtifactCard
          key={i}
          name={card.name}
          category={card.category}
          fileFormat="JPG"
          sizeLabel="1.4 MB"
          guidelineVersionLabel="cpg v1.0"
        />
      ))}
    </div>
  );
}
