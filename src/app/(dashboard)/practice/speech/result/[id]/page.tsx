import { prisma } from "@/infrastructure/database/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  MessageSquare,
  Mic,
  Zap,
  BookOpen,
} from "lucide-react";

export default async function SpeechResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const attempt = await prisma.speechAttempt.findUnique({
    where: { id },
  });

  if (!attempt) {
    notFound();
  }

  const feedback = attempt.feedbackJson as any;

  const ScoreCard = ({
    title,
    score,
    icon: Icon,
    color,
  }: {
    title: string;
    score: number;
    icon: any;
    color: string;
  }) => (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold text-gray-900">{score}</span>
          <span className="mb-1 text-sm text-gray-400">/ 100</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/practice"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm transition-colors hover:bg-gray-50"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Speech Analysis Result</h1>
            <p className="text-sm text-gray-500">
              Topic: <span className="font-medium text-gray-700">{attempt.targetText}</span>
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-extrabold text-blue-600">{feedback.overallScore}%</div>
          <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">Overall Score</p>
        </div>
      </div>

      {/* Score Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ScoreCard
          title="Grammar"
          score={feedback.grammarScore}
          icon={CheckCircle2}
          color="bg-green-100 text-green-600"
        />
        <ScoreCard
          title="Fluency"
          score={feedback.fluencyScore}
          icon={Zap}
          color="bg-blue-100 text-blue-600"
        />
        <ScoreCard
          title="Pronunciation"
          score={feedback.pronunciationScore}
          icon={Mic}
          color="bg-purple-100 text-purple-600"
        />
        <ScoreCard
          title="Vocabulary"
          score={feedback.vocabularyScore}
          icon={BookOpen}
          color="bg-orange-100 text-orange-600"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Transcripts & Details */}
        <div className="space-y-8 lg:col-span-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
              <MessageSquare className="h-5 w-5 text-gray-400" />
              Your Transcript
            </h3>
            <p className="rounded-xl bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
              {attempt.transcription}
            </p>
          </div>

          <div className="rounded-2xl border border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-green-900">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Corrected Version
            </h3>
            <p className="text-sm leading-relaxed text-green-800">{feedback.correctedVersion}</p>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-bold tracking-wider text-blue-600 uppercase">
                Strengths
              </h3>
              <ul className="space-y-3">
                {feedback.strengths?.map((s: string, i: number) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-700">
                    <span className="text-blue-500">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-bold tracking-wider text-red-600 uppercase">
                Areas to Improve
              </h3>
              <ul className="space-y-3">
                {feedback.areasForImprovement?.map((a: string, i: number) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-700">
                    <span className="text-red-500">•</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: Insights & Recommendations */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold tracking-wider text-gray-900 uppercase">
              <TrendingUp className="h-4 w-4 text-gray-400" />
              Delivery Insights
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500">Speaking Pace & Speed</p>
                <p className="font-medium text-gray-900">
                  {feedback.speakingPace} (
                  {feedback.speakingSpeedWpm ? `${feedback.speakingSpeedWpm} WPM` : "N/A"})
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Pause Analysis</p>
                <p className="text-sm text-gray-700">
                  {feedback.pauseAnalysis || "No pause analysis available."}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Confidence Score</p>
                <div className="mt-1 flex h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div className="bg-blue-500" style={{ width: `${feedback.confidenceScore}%` }} />
                </div>
                <p className="mt-1 text-right text-xs font-medium text-gray-700">
                  {feedback.confidenceScore}%
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Filler Words Detected</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {feedback.fillerWords?.length > 0 ? (
                    feedback.fillerWords.map((word: string, i: number) => (
                      <span
                        key={i}
                        className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800"
                      >
                        {word}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400">None detected! Great job.</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-bold tracking-wider text-purple-600 uppercase">
              Vocabulary Upgrades
            </h3>
            <div className="space-y-4">
              {feedback.betterVocabularySuggestions?.map((item: any, i: number) => (
                <div key={i} className="rounded-xl bg-purple-50 p-3 text-sm">
                  <div className="flex items-center gap-2 font-medium">
                    <span className="text-gray-500 line-through">{item.original}</span>
                    <ArrowLeft className="h-3 w-3 rotate-180 text-purple-400" />
                    <span className="text-purple-700">{item.suggestion}</span>
                  </div>
                  <p className="mt-1 text-xs text-purple-600/80">{item.reason}</p>
                </div>
              ))}
              {(!feedback.betterVocabularySuggestions ||
                feedback.betterVocabularySuggestions.length === 0) && (
                <p className="text-sm text-gray-500">Your vocabulary was excellent.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-bold tracking-wider text-orange-600 uppercase">
              Next Steps
            </h3>
            <ul className="space-y-3">
              {feedback.practiceRecommendations?.map((rec: string, i: number) => (
                <li key={i} className="flex gap-2 text-sm text-gray-700">
                  <span className="text-orange-500">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
