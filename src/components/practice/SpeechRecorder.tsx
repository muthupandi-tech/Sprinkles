"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Pause, RotateCcw, Send, Loader2 } from "lucide-react";

interface SpeechRecorderProps {
  onAnalyze: (transcript: string, durationSeconds: number) => void;
  isAnalyzing: boolean;
}

export function SpeechRecorder({ onAnalyze, isAnalyzing }: SpeechRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timer, setTimer] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [hasFinished, setHasFinished] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    // Initialize Web Speech API
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + " ";
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          setTranscript((prev) => (prev + " " + finalTranscript).trim());
        }
      };

      recognition.onerror = (event: any) => {
        const err = event.error || "";
        if (err === "no-speech" || err === "aborted" || err.includes("no-speech")) {
          return;
        }
        console.error("Speech recognition error", event.error);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      };

      mediaRecorder.start(100);
      if (recognitionRef.current) {
        setTranscript(""); // clear previous
        recognitionRef.current.start();
      }

      setIsRecording(true);
      setIsPaused(false);
      setHasFinished(false);
      setTimer(0);
      setAudioUrl(null);

      timerIntervalRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone", error);
      alert("Microphone access is required for speech practice.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
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
      {/* Timer and Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`relative flex h-4 w-4 items-center justify-center`}>
            {isRecording && !isPaused && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex h-3 w-3 rounded-full ${isRecording && !isPaused ? "bg-red-500" : "bg-gray-300"}`}
            ></span>
          </div>
          <span className="text-sm font-medium text-gray-700">
            {isRecording && !isPaused
              ? "Recording..."
              : isPaused
                ? "Paused"
                : hasFinished
                  ? "Recording Complete"
                  : "Ready to Record"}
          </span>
        </div>
        <div className="font-mono text-2xl font-semibold tracking-wider text-gray-900">
          {formatTime(timer)}
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center py-8">
        {!isRecording && !hasFinished && (
          <button
            onClick={startRecording}
            className="group relative flex h-20 w-20 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-200 transition-all hover:scale-105 hover:bg-blue-700"
          >
            <Mic className="h-8 w-8 transition-transform group-hover:scale-110" />
            <div className="absolute -bottom-8 text-xs font-bold whitespace-nowrap text-gray-500">
              Click to Start
            </div>
          </button>
        )}

        {isRecording && (
          <div className="flex items-center gap-6">
            <button
              onClick={stopRecording}
              className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-full bg-gray-100 text-gray-600 shadow-sm transition-all hover:bg-gray-200"
            >
              <Square className="h-6 w-6 fill-current" />
            </button>
          </div>
        )}

        {hasFinished && (
          <div className="flex w-full flex-col items-center gap-6">
            {audioUrl && <audio controls src={audioUrl} className="w-full max-w-md" />}

            <div className="flex items-center gap-4">
              <button
                onClick={handleReset}
                disabled={isAnalyzing}
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 disabled:opacity-50"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Retry</span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={isAnalyzing}
                className="flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-8 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50"
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
        <label className="text-xs font-bold tracking-wider text-gray-500 uppercase">
          Live Transcript (Editable)
        </label>
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Your speech will appear here... You can edit this text before submitting for analysis if the AI misheard you."
          className="h-40 w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:outline-none disabled:opacity-50"
          disabled={isRecording || isAnalyzing}
        />
        <p className="text-xs text-gray-400">
          *Note: Transcription requires a supported browser (Chrome, Edge). If it fails, you can
          type your speech manually.
        </p>
      </div>
    </div>
  );
}
