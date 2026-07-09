"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Compass, Volume2 } from "lucide-react";
import Link from "next/link";
import { SpeechRecorder } from "@/components/practice/SpeechRecorder";

const DRILLS = [
  "The enthusiastic weather reporter verified the windy conditions precisely.",
  "She sells seashells by the seashore, and the shells she sells are seashells.",
  "Peter Piper picked a peck of pickled peppers.",
  "How much wood would a woodchuck chuck if a woodchuck could chuck wood?",
  "I thought a thought, but the thought I thought wasn't the thought I thought I thought.",
];

export default function PronunciationPracticePage() {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Pick a drill based on the day of the month
  const today = new Date();
  const drillIndex = today.getDate() % DRILLS.length;
  const todaysDrill = DRILLS[drillIndex];

  const handleAnalyze = async (transcript: string, durationSeconds: number) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/practice/pronunciation/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          targetText: todaysDrill,
          durationSeconds,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze pronunciation");
      }

      const data = await response.json();
      if (data.attemptId) {
        router.push(`/practice/pronunciation/result/${data.attemptId}`);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong during analysis. Please try again.");
      setIsAnalyzing(false);
    }
  };

  const playDrillAudio = () => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(todaysDrill);
      utterance.lang = "en-US";
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/practice"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm transition-colors hover:bg-gray-50"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <Compass className="h-6 w-6 text-orange-500" />
            <span>Pronunciation Drills</span>
          </h1>
          <p className="text-sm text-gray-500">
            Read challenging phonemes, diphthongs, and consonant transitions to improve your accent clarity.
          </p>
        </div>
      </div>

      {/* Daily Drill Card */}
      <div className="flex items-start gap-4 rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-red-50 p-6 shadow-sm relative">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
          <Compass className="h-6 w-6" />
        </div>
        <div className="space-y-2 pr-12">
          <h2 className="text-xs font-bold tracking-wider text-orange-600 uppercase">
            Daily Pronunciation Challenge
          </h2>
          <p className="text-xl font-medium text-gray-900">"{todaysDrill}"</p>
          <p className="text-sm text-gray-600">
            Listen to the correct pronunciation, then start recording and enunciate clearly.
          </p>
        </div>
        
        <button
          onClick={playDrillAudio}
          className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600 transition-colors hover:bg-orange-200"
          title="Listen to pronunciation"
        >
          <Volume2 className="h-5 w-5" />
        </button>
      </div>

      {/* Recorder */}
      <SpeechRecorder onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
    </div>
  );
}
