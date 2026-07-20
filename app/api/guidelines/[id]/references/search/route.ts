// app/api/references/search/route.ts
import { NextRequest, NextResponse } from "next/server";

const MOCK_CITATIONS = [
  { id: "ref-myers-2013", label: "Myers 2013", citation: "Myers AL, et al. Pediatrics. 2013;131(3):e805-11." },
  { id: "ref-pernica-2021", label: "Pernica 2021", citation: "Pernica JM, et al. JAMA Pediatr. 2021;175(5):475-82." },
  { id: "ref-williams-2017", label: "Williams 2017", citation: "Williams DJ, et al. Pediatrics. 2017;140(2):e20170028." },
  { id: "ref-same-2020", label: "Same-Guerra 2020", citation: "Same RG, et al. Clin Infect Dis. 2020;71(10):e421-8." },
  { id: "ref-bradley-2011", label: "Bradley 2011", citation: "Bradley JS, et al. Clin Infect Dis. 2011;53(7):e25-76." },
  { id: "ref-neuman-2011", label: "Neuman 2011", citation: "Neuman MI, et al. Pediatrics. 2011;128(2):246-53." },
];

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q")?.toLowerCase() ?? "";
  const results = MOCK_CITATIONS.filter(
    (c) => c.label.toLowerCase().includes(query) || c.citation.toLowerCase().includes(query)
  );
  return NextResponse.json(results);
}