export type ArtifactCategory = "figure" | "table" | "flowchart" | "chart" | "pdf";

export interface Artifact {
  id: string;
  guideline_id: string;
  name: string;
  category: ArtifactCategory | null;
  caption: string | null;
  storage_path: string;
  mime_type: string;
  size_bytes: number;
  uploaded_by: string | null;
  created_at: string;
  url: string; // signed URL, derived at request time — not a stored column
}