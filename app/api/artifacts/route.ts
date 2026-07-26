import { NextRequest, NextResponse } from "next/server";

// TODO: replace with real DB query joined against guideline metadata
const MOCK_LIBRARY_ARTIFACTS: any[] = [
  {
    id: "art-1",
    name: "Sample name",
    category: "figure",
    fileFormat: "JPG",
    sizeLabel: "1.4 MB",
    guidelineVersionLabel: "cpg v1.0",
    guidelineId: "cap-children",
  },
  // ...more mock rows
];

export async function GET() {
  return NextResponse.json(MOCK_LIBRARY_ARTIFACTS);
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const name = formData.get("name") as string;
  const selectedCategory = formData.get("category") as string;
  const guidelineId = formData.get("guidelineId") as string;
  const file = formData.get("file") as File;

  // PDF is auto-detected from mimetype, not user-selected —
  // overrides whatever "Kind" the dropdown submitted, since PDF
  // was never actually a selectable option there to begin with.
  const category = file.type === "application/pdf" ? "pdf" : selectedCategory;

  const artifact = {
    id: crypto.randomUUID(),
    name,
    category,
    fileFormat: file.name.split(".").pop()?.toUpperCase() ?? "FILE",
    sizeLabel: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
    guidelineVersionLabel: "cpg v1.0",
    guidelineId,
  };

  MOCK_LIBRARY_ARTIFACTS.push(artifact);
  return NextResponse.json(artifact);
}