"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mic, Lightbulb } from "lucide-react";
import Link from "next/link";
import { SpeechRecorder } from "@/components/practice/SpeechRecorder";

const TOPICS = [
  "Introduce yourself and highlight your key strengths.",
  "Describe your college and your favorite memory there.",
  "Explain your favorite technology and why it excites you.",
  "Talk about your career goals for the next 5 years.",
  "Describe a time you overcame a challenging situation.",
  "What is the most interesting project you've worked on?",
  "How do you handle working in a team?",
  "Describe a hobby or passion outside of academics/work.",
  "Who is your role model and why?",
  "Talk about a recent book or article you read and your takeaways.",
];

export default function SpeechPracticePage() {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Pick a topic based on the day of the month
  const today = new Date();
  const topicIndex = today.getDate() % TOPICS.length;
  const todaysTopic = TOPICS[topicIndex];

  const handleAnalyze = async (transcript: string, durationSeconds: number) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/practice/speech/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          targetText: todaysTopic,
          durationSeconds,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze speech");
      }

      const data = await response.json();
      if (data.attemptId) {
        router.push(`/practice/speech/result/${data.attemptId}`);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong during analysis. Please try again.");
      setIsAnalyzing(false);
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
            <Mic className="h-6 w-6 text-blue-600" />
            <span>Speech Practice</span>
          </h1>
          <p className="text-sm text-gray-500">
            Record your speech, get live transcription, and receive AI feedback on your fluency and grammar.
          </p>
        </div>
      </div>

      {/* Daily Topic Card */}
      <div className="flex items-start gap-4 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-sm">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
          <Lightbulb className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Daily Speaking Challenge
          </h2>
          <p className="text-lg font-medium text-gray-900">{todaysTopic}</p>
          <p className="text-sm text-gray-600">
            Take a deep breath. Speak clearly and naturally. Try to talk for at least 30 seconds.
          </p>
        </div>
      </div>

      {/* Recorder */}
      <SpeechRecorder onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
    </div>
  );
}
