export interface StudentProgress {
  id: string;
  userId: string;
  currentStreak: number;
  overallScore: number;
  speakingScore: number;
  vocabularyScore: number;
  pronunciationScore: number;
  interviewScore: number;
  totalPracticeTime: number;
  weeklyTimeHistory: any;
  updatedAt: Date;
}
