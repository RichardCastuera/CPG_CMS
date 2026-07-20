export interface Artifact {
  id: string;
  guidelineId: string;
  name: string;
  url: string;
  thumbnailUrl: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
  caption?: string;
  attachedToNodeIds: string[];
}