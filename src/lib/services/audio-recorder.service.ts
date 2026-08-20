export class AudioRecorderService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;

  // VAD and Silence Detection
  private silenceTimer: NodeJS.Timeout | null = null;
  private readonly SILENCE_THRESHOLD = 5; // Minimal volume threshold out of 255
  private readonly MAX_SILENCE_MS = 5000; // Auto-stop after 5 seconds of silence
  private vadInterval: NodeJS.Timeout | null = null;
  private onSilenceAutoStop: (() => void) | null = null;

  public async startRecording(onSilenceAutoStop?: () => void): Promise<void> {
    this.onSilenceAutoStop = onSilenceAutoStop || null;

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
        },
      });

      // Setup Web Audio API for waveform and VAD
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.source = this.audioContext.createMediaStreamSource(this.stream);
      this.source.connect(this.analyser);

      // Start VAD check
      this.startSilenceDetection();

      // Setup MediaRecorder
      // Safari might only support audio/mp4, Chrome/Firefox support audio/webm
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : "";

      this.mediaRecorder = new MediaRecorder(this.stream, mimeType ? { mimeType } : undefined);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(100); // collect 100ms chunks
    } catch (error) {
      console.error("Failed to start audio recording:", error);
      throw error;
    }
  }

  public pauseRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
      this.mediaRecorder.pause();
      this.stopSilenceDetection();
    }
  }

  public resumeRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === "paused") {
      this.mediaRecorder.resume();
      this.startSilenceDetection();
    }
  }

  public stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        return reject(new Error("No active recording"));
      }

      this.stopSilenceDetection();

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: this.mediaRecorder?.mimeType || "audio/webm" });
        this.cleanup();
        resolve(audioBlob);
      };

      if (this.mediaRecorder.state !== "inactive") {
        this.mediaRecorder.stop();
      } else {
        // If it was already inactive (e.g. stopped manually right after starting)
        const audioBlob = new Blob(this.audioChunks, { type: this.mediaRecorder?.mimeType || "audio/webm" });
        this.cleanup();
        resolve(audioBlob);
      }
    });
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  private startSilenceDetection(): void {
    if (!this.analyser) return;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    this.vadInterval = setInterval(() => {
      if (!this.analyser) return;
      
      this.analyser.getByteFrequencyData(dataArray);
      
      // Calculate max volume in current frame
      let maxVol = 0;
      for (let i = 0; i < dataArray.length; i++) {
        if (dataArray[i] > maxVol) maxVol = dataArray[i];
      }

      if (maxVol < this.SILENCE_THRESHOLD) {
        // Silence detected
        if (!this.silenceTimer) {
          this.silenceTimer = setTimeout(() => {
            if (this.onSilenceAutoStop) {
              this.onSilenceAutoStop();
            }
          }, this.MAX_SILENCE_MS);
        }
      } else {
        // Voice detected, reset silence timer
        if (this.silenceTimer) {
          clearTimeout(this.silenceTimer);
          this.silenceTimer = null;
        }
      }
    }, 250); // Check every 250ms
  }

  private stopSilenceDetection(): void {
    if (this.vadInterval) {
      clearInterval(this.vadInterval);
      this.vadInterval = null;
    }
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
  }

  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.audioContext && this.audioContext.state !== "closed") {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.mediaRecorder = null;
    this.analyser = null;
  }
}

// Singleton instance
export const audioRecorderService = new AudioRecorderService();
