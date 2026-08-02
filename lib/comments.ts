export interface Comment {
  id: string;
  guideline_id: string;
  section_id: string | null;
  question_id: string | null;
  recommendation_id: string | null;
  author_id: string;
  profiles: { name: string } | null;
  body: string;
  created_at: string; // ISO date
  resolved: boolean;
}