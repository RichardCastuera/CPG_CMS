export interface Reference {
  id: string;
  label: string; // "Bradley 2011"
  citation: string; // "Bradley JS, et al. Clin Infect Dis. 2011;53(7):e25-76."
}

export interface AttachedReference extends Reference {
  order: number; // position in the guideline's overall reference list
}