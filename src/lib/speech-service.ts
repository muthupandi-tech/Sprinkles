export type AccentRegion = "US" | "UK" | "IN" | "AU";

interface PlayOptions {
  accent?: AccentRegion;
  speed?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onBoundary?: (event: SpeechSynthesisEvent) => void;
  onError?: (event: SpeechSynthesisErrorEvent) => void;
}

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      
      // Voices are sometimes loaded asynchronously
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = this.loadVoices.bind(this);
      }
    }
  }

  private loadVoices() {
    if (this.synth) {
      this.voices = this.synth.getVoices();
    }
  }

  public preload() {
    // Calling getVoices forces the browser to fetch the voices if it hasn't already.
    if (this.synth) {
      this.synth.getVoices();
    }
  }

  private getVoiceForAccent(accent: AccentRegion): SpeechSynthesisVoice | null {
    if (this.voices.length === 0) {
      this.loadVoices();
    }

    const langMap: Record<AccentRegion, string[]> = {
      US: ["en-US"],
      UK: ["en-GB"],
      IN: ["en-IN"],
      AU: ["en-AU"],
    };

    const preferredLangs = langMap[accent];
    
    // 1. Try to find a premium voice (Google, Apple, Microsoft) for the exact language
    let voice = this.voices.find(
      (v) => preferredLangs.includes(v.lang) && (v.name.includes("Google") || v.name.includes("Premium") || v.name.includes("Natural"))
    );

    // 2. Fallback to any voice for the exact language
    if (!voice) {
      voice = this.voices.find((v) => preferredLangs.includes(v.lang));
    }

    // 3. Fallback to the default voice if the specific accent isn't available
    if (!voice) {
      voice = this.voices.find((v) => v.default) || this.voices[0];
    }

    return voice || null;
  }

  public play(text: string, options?: PlayOptions) {
    if (!this.synth) {
      console.warn("SpeechSynthesis API is not supported in this browser.");
      return;
    }

    // Cancel any ongoing speech
    this.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice based on accent
    const voice = this.getVoiceForAccent(options?.accent || "US");
    if (voice) {
      utterance.voice = voice;
    }

    // Set speed (rate)
    utterance.rate = options?.speed || 1.0;

    // Attach event listeners
    if (options?.onStart) utterance.onstart = options.onStart;
    if (options?.onEnd) utterance.onend = options.onEnd;
    if (options?.onBoundary) utterance.onboundary = options.onBoundary;
    if (options?.onError) utterance.onerror = options.onError;

    this.synth.speak(utterance);
  }

  public cancel() {
    if (this.synth && this.synth.speaking) {
      this.synth.cancel();
    }
  }

  public pause() {
    if (this.synth && this.synth.speaking) {
      this.synth.pause();
    }
  }

  public resume() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }
}

// Export a singleton instance
export const speechService = new SpeechService();
