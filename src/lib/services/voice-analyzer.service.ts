export class VoiceAnalyzerService {
  private recognition: any = null;
  private onResultCallback: ((transcript: string, isFinal: boolean) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;
  private isListening = false;
  private fullTranscript = "";
  private autoRestart = true; // Auto restart if recognition drops due to silence

  public initialize(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: string) => void
  ) {
    this.onResultCallback = onResult;
    this.onErrorCallback = onError;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = "en-US";

    this.recognition.onresult = (event: any) => {
      let currentInterim = "";
      let newFinal = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          newFinal += event.results[i][0].transcript + " ";
        } else {
          currentInterim += event.results[i][0].transcript;
        }
      }

      if (newFinal) {
        this.fullTranscript = (this.fullTranscript + " " + newFinal).trim();
        if (this.onResultCallback) {
          this.onResultCallback(this.fullTranscript, true);
        }
      } else if (currentInterim) {
        if (this.onResultCallback) {
          // Send combined transcript for live updating
          this.onResultCallback((this.fullTranscript + " " + currentInterim).trim(), false);
        }
      }
    };

    this.recognition.onerror = (event: any) => {
      const err = event.error || "";
      console.error("Speech recognition error:", err);

      if (err === "no-speech" || err === "aborted") {
        // Ignorable errors, usually means silence timeout
        return;
      }
      
      if (err === "not-allowed") {
        this.autoRestart = false; // Stop restarting if permission denied
      }

      if (this.onErrorCallback) {
        this.onErrorCallback(err);
      }
    };

    this.recognition.onend = () => {
      // Auto-restart if we are supposed to be listening (workaround for Chrome 60-second limit)
      if (this.isListening && this.autoRestart) {
        try {
          this.recognition.start();
        } catch (e) {
          console.error("Failed to auto-restart recognition", e);
        }
      }
    };
  }

  public start() {
    if (!this.recognition) return;
    this.isListening = true;
    this.autoRestart = true;
    this.fullTranscript = ""; // Reset transcript
    try {
      this.recognition.start();
    } catch (e) {
      console.warn("Recognition already started", e);
    }
  }

  public stop() {
    if (!this.recognition) return;
    this.isListening = false;
    this.autoRestart = false;
    try {
      this.recognition.stop();
    } catch (e) {
      console.warn("Recognition already stopped", e);
    }
  }

  public resetTranscript() {
    this.fullTranscript = "";
  }

  public getTranscript(): string {
    return this.fullTranscript;
  }
}

export const voiceAnalyzerService = new VoiceAnalyzerService();
