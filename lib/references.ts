export interface Reference {
  id: string;
  label: string; // "Bradley 2011" — auto-derived, see below
  citation: string; // full formatted citation string
}

export interface AttachedReference extends Reference {
  order: number;
}

// Structured input for the "+ New" form — used to construct `citation` and `label`
export interface NewReferenceInput {
  authors: string; // "Bradley JS, et al."
  year: string; // "2011"
  title?: string;
  journal: string; // "Clin Infect Dis"
  volumeIssuePages: string; // "2011;53(7):e25-76"
  doiOrUrl?: string;
}