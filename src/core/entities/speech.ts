/* eslint-disable @typescript-eslint/no-explicit-any */
export interface SpeechAttempt {
  id: string;
  userId: string;
  transcription: string;
  targetText: string | null; // Optional text they were trying to read
  durationSeconds: number;
  pronunciationScore: number; // 0 to 100
  fluencyScore: number; // 0 to 100
  feedbackJson: Record<string, any>; // detailed breakdown of words mispronounced, etc.
  audioUrl: string | null;
  createdAt: Date;
}
