/* eslint-disable @typescript-eslint/no-explicit-any */
export interface AIService {
  evaluateSpeech(
    transcription: string,
    targetText?: string | null
  ): Promise<{
    pronunciationScore: number;
    fluencyScore: number;
    feedbackJson: Record<string, any>;
  }>;

  generateLearningPlan(
    careerGoal: string,
    metrics: { spokenEnglishLevel: string; vocabularyScore: number; pronunciationScore: number }
  ): Promise<{
    title: string;
    description: string;
    tasks: Array<{
      title: string;
      description: string;
      type: "vocabulary" | "pronunciation" | "speech" | "interview";
    }>;
  }>;
}
