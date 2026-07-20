
export interface Comment {
  id: string;
  nodeId: string; 
  authorName: string;
  authorInitials: string;
  body: string;
  createdAt: string; // ISO date
  resolved: boolean;
}