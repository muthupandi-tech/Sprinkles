"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Mic, Square, Play, Pause, RotateCcw, Send, Loader2, Trash2 } from "lucide-react";
import { audioRecorderService } from "@/lib/services/audio-recorder.service";
import { voiceAnalyzerService } from "@/lib/services/voice-analyzer.service";
import { WaveformVisualizer } from "./WaveformVisualizer";

interface SpeechRecorderProps {
  onAnalyze: (transcript: string, durationSeconds: number) => void;
  isAnalyzing: boolean;
}

export function SpeechRecorder({ onAnalyze, isAnalyzing }: SpeechRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  
  const [timer, setTimer] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  // To re-render child visualizer we pass the AnalyserNode
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleTranscript = useCallback((text: string, isFinal: boolean) => {
    setTranscript(text);
  }, []);

  const handleError = useCallback((err: string) => {
    console.error("SpeechRecognition Error:", err);
    // Don't auto-stop on generic errors, only specific ones if desired
  }, []);

  useEffect(() => {
    voiceAnalyzerService.initialize(handleTranscript, handleError);
    return () => {
      audioRecorderService.pauseRecording(); // cleanup
      voiceAnalyzerService.stop();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [handleTranscript, handleError]);

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        // Prevent default spacebar scrolling if button is focused, but if we are typing in textarea we shouldn't trigger
        if (document.activeElement?.tagName === "TEXTAREA") return;
        e.preventDefault();
        
        if (!isRecording && !hasFinished) {
          startRecording();
        } else if (isRecording && !isPaused) {
          pauseRecording();
        } else if (isRecording && isPaused) {
          resumeRecording();
        }
      }
      if (e.code === "Escape") {
        if (isRecording) stopRecording();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRecording, isPaused, hasFinished]);

  const startRecording = async () => {
    try {
      await audioRecorderService.startRecording(() => {
        // Auto-stop on silence
        stopRecording();
      });
      setAnalyser(audioRecorderService.getAnalyser());
      
      voiceAnalyzerService.start();

      setIsRecording(true);
      setIsPaused(false);
      setHasFinished(false);
      setTimer(0);
      setAudioUrl(null);
      setTranscript("");

      timerIntervalRef.current = setInterval(() => setTimer((prev) => prev + 1), 1000);
    } catch (error) {
      alert("Microphone access is required for speech practice.");
    }
  };

  const pauseRecording = () => {
    audioRecorderService.pauseRecording();
    voiceAnalyzerService.stop();
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setIsPaused(true);
  };

  const resumeRecording = () => {
    audioRecorderService.resumeRecording();
    voiceAnalyzerService.start();
    timerIntervalRef.current = setInterval(() => setTimer((prev) => prev + 1), 1000);
    setIsPaused(false);
  };

  const stopRecording = async () => {
    try {
      const audioBlob = await audioRecorderService.stopRecording();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    } catch (e) {
      console.warn("Failed to stop recording cleanly", e);
    }
    
    voiceAnalyzerService.stop();
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    
    setIsRecording(false);
    setIsPaused(false);
    setHasFinished(true);
  };

  const handleReset = () => {
    setTranscript("");
    setTimer(0);
    setHasFinished(false);
    setAudioUrl(null);
    setIsRecording(false);
    setIsPaused(false);
    voiceAnalyzerService.resetTranscript();
  };

  const handleSubmit = () => {
    if (transcript.trim().length === 0) {
      alert("No transcript found. Please record some speech first or type your transcript.");
      return;
    }
    onAnalyze(transcript, timer);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex h-4 w-4 items-center justify-center">
            {isRecording && !isPaused && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            )}
            <span
              className={`relative inline-flex h-3 w-3 rounded-full ${isRecording && !isPaused ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" : "bg-gray-300"}`}
            />
          </div>
          <span className="text-sm font-medium text-gray-700">
            {isRecording && !isPaused ? "Recording..." : isPaused ? "Paused" : hasFinished ? "Recording Complete" : "Ready to Record"}
          </span>
        </div>
        <div className="font-mono text-2xl font-bold tracking-wider text-gray-900">
          {formatTime(timer)}
        </div>
      </div>

      {/* Visualizer */}
      <WaveformVisualizer analyser={analyser} isRecording={isRecording} isPaused={isPaused} />

      {/* Primary Controls */}
      <div className="flex justify-center py-6">
        {!isRecording && !hasFinished && (
          <button
            onClick={startRecording}
            aria-label="Start recording (Spacebar)"
            className="group relative flex h-20 w-20 cursor-pointer items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200 transition-all hover:scale-105"
          >
            <Mic className="h-8 w-8 transition-transform group-hover:scale-110" />
            <div className="absolute -bottom-8 text-xs font-bold whitespace-nowrap text-gray-500">
              Start
            </div>
          </button>
        )}

        {isRecording && (
          <div className="flex items-center gap-4">
            {isPaused ? (
              <button
                onClick={resumeRecording}
                aria-label="Resume recording (Spacebar)"
                className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600 shadow-sm hover:bg-blue-200 transition-all hover:scale-105"
              >
                <Play className="h-6 w-6 fill-current" />
              </button>
            ) : (
              <button
                onClick={pauseRecording}
                aria-label="Pause recording (Spacebar)"
                className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600 shadow-sm hover:bg-amber-200 transition-all hover:scale-105"
              >
                <Pause className="h-6 w-6 fill-current" />
              </button>
            )}
            
            <button
              onClick={stopRecording}
              aria-label="Stop recording (Escape)"
              className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 shadow-sm hover:bg-red-200 transition-all hover:scale-105"
            >
              <Square className="h-6 w-6 fill-current" />
            </button>
          </div>
        )}

        {hasFinished && (
          <div className="flex w-full flex-col items-center gap-6 animate-in fade-in zoom-in duration-300">
            {audioUrl && (
              <div className="w-full max-w-md bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 ml-2">Playback</p>
                <audio controls src={audioUrl} className="w-full" />
              </div>
            )}

            <div className="flex items-center gap-4">
              <button
                onClick={handleReset}
                disabled={isAnalyzing}
                aria-label="Delete recording and retry"
                className="flex items-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-2.5 text-sm font-medium text-red-600 shadow-sm transition-all hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={isAnalyzing}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:scale-105 hover:shadow-md disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Get AI Feedback</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transcript Textarea */}
      <div className="space-y-2">
        <label className="text-xs font-bold tracking-wider text-gray-500 uppercase flex items-center justify-between">
          <span>Live Transcript</span>
          {transcript && <span className="text-blue-500 animate-pulse">Listening...</span>}
        </label>
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Your speech will appear here... You can edit this text before submitting for analysis if the AI misheard you."
          className="h-32 w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:outline-none disabled:opacity-50"
          disabled={isRecording || isAnalyzing}
        />
        <p className="text-xs text-gray-400">
          *Note: Transcription requires a supported browser (Chrome, Edge). If it fails, you can type your speech manually. Auto-stops after 5 seconds of silence.
        </p>
      </div>
    </div>
  );
}
