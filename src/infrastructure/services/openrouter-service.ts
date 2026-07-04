/* eslint-disable @typescript-eslint/no-explicit-any */
import { AIService } from "@/core/services/ai-service";

export class OpenRouterService implements AIService {
  private apiKey: string;
  private baseUrl = "https://openrouter.ai/api/v1";

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || "";
  }

  /**
   * Helper method to call OpenRouter API.
   * This is ready to use when AI features are unlocked.
   */
  protected async fetchCompletions(
    messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
    responseFormat?: { type: "json_object" }
  ) {
    if (!this.apiKey || this.apiKey === "placeholder-openrouter-key") {
      console.warn("OpenRouter API key is not configured or is a placeholder.");
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
          "HTTP-Referer": "https://sprinkles.vercel.app",
          "X-Title": "Sprinkles Personal Communication Coach",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages,
          response_format: responseFormat,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.statusText} (${response.status})`);
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to fetch from OpenRouter:", error);
      throw error;
    }
  }

  async evaluateSpeech(
    transcription: string,
    targetText?: string | null
  ): Promise<{
    pronunciationScore: number;
    fluencyScore: number;
    feedbackJson: Record<string, any>;
  }> {
    // Integration stub - ready to expand into full prompt completions
    return {
      pronunciationScore: 85,
      fluencyScore: 80,
      feedbackJson: {
        transcript: transcription,
        targetText: targetText || null,
        detectedErrors: [],
        suggestions: ["Focus on clear articulation of consonants."],
      },
    };
  }

  async generateLearningPlan(
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
  }> {
    // Integration stub - ready to expand into personalized AI mentor guidelines
    return {
      title: `Personalized Mentor Path for ${careerGoal || "General Practice"}`,
      description: `Daily communication syllabus tailored for ${metrics.spokenEnglishLevel} spoken level.`,
      tasks: [
        {
          title: "Elevator Pitch Practice",
          description: "Record a 30-second summary of your career interest.",
          type: "speech",
        },
        {
          title: "Active Vocabulary Mastery",
          description: "Analyze and define 5 advanced vocabulary phrases.",
          type: "vocabulary",
        },
      ],
    };
  }
}
