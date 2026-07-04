export interface StudentProgress {
  id: string;
  userId: string;
  spokenEnglishLevel: string; // e.g. "Beginner", "Intermediate", "Advanced"
  vocabularyScore: number; // 0 to 100
  pronunciationScore: number; // 0 to 100
  confidenceScore: number; // 0 to 100
  careerGoal: string | null; // e.g. "Software Engineer Interview Prep"
  updatedAt: Date;
}
