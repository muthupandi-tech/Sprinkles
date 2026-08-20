export class PronunciationService {
  /**
   * Submits a full speech practice transcript to the AI for deep phonetic analysis.
   */
  public async analyzeSpeech(transcript: string, targetText?: string, durationSeconds?: number): Promise<any> {
    const response = await fetch("/api/practice/pronunciation/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transcript,
        targetText,
        durationSeconds: durationSeconds || 0,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to analyze speech: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Submits a single word for shadow practice (Fast comparison).
   */
  public async analyzeShadowWord(transcript: string, targetWord: string): Promise<any> {
    const response = await fetch("/api/vocabulary/pronunciation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transcript,
        targetWord,
        wordId: "pronunciation_coach_temp", // Generic ID for temp practice
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to analyze word shadow: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error("Failed to process pronunciation");
    }
    
    return data.data;
  }
}

export const pronunciationService = new PronunciationService();
