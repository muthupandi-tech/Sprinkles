import { prisma } from "@/infrastructure/database/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Compass,
  Zap,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

export default async function PronunciationResultPage({ params }: { params: Promise<{ id: string }> }) {
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
            <h1 className="text-2xl font-bold text-gray-900">Pronunciation Analysis</h1>
            <p className="text-sm text-gray-500">
              Drill Text: <span className="font-medium text-gray-700">{attempt.targetText}</span>
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-extrabold text-orange-600">{feedback.overallScore}%</div>
          <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">Overall Score</p>
        </div>
      </div>

      {/* Score Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ScoreCard
          title="Pronunciation Accuracy"
          score={feedback.pronunciationScore}
          icon={Compass}
          color="bg-orange-100 text-orange-600"
        />
        <ScoreCard
          title="Fluency & Flow"
          score={feedback.fluencyScore}
          icon={Zap}
          color="bg-blue-100 text-blue-600"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Transcripts & Details */}
        <div className="space-y-8 lg:col-span-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
              <MessageSquare className="h-5 w-5 text-gray-400" />
              What We Heard
            </h3>
            <p className="rounded-xl bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
              {attempt.transcription}
            </p>
          </div>

          <div className="rounded-2xl border border-red-100 bg-gradient-to-br from-red-50 to-orange-50 p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-red-900">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Mispronounced Words
            </h3>
            <div className="space-y-4">
              {feedback.mispronouncedWords?.map((item: any, i: number) => (
                <div key={i} className="rounded-xl bg-white/60 p-4 text-sm shadow-sm border border-red-100/50">
                  <div className="flex items-center gap-2 font-bold text-gray-900">
                    <span className="text-red-600">{item.word}</span>
                    <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">/{item.ipa}/</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-700">{item.tip}</p>
                </div>
              ))}
              {(!feedback.mispronouncedWords || feedback.mispronouncedWords.length === 0) && (
                <p className="text-sm text-gray-700">Excellent! No major mispronunciations detected.</p>
              )}
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-bold tracking-wider text-blue-600 uppercase">
                Pronunciation Strengths
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
          <div className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-bold tracking-wider text-purple-600 uppercase">
              Phoneme Feedback
            </h3>
            <ul className="space-y-3">
              {feedback.phonemeFeedback?.map((item: string, i: number) => (
                <li key={i} className="flex gap-2 text-sm text-gray-700">
                  <span className="text-purple-500">→</span>
                  <span>{item}</span>
                </li>
              ))}
              {(!feedback.phonemeFeedback || feedback.phonemeFeedback.length === 0) && (
                <p className="text-sm text-gray-500">Your consonant and vowel sounds were clear.</p>
              )}
            </ul>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold tracking-wider text-gray-900 uppercase">
              <Zap className="h-4 w-4 text-gray-400" />
              Delivery Insights
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500">Speaking Pace</p>
                <p className="font-medium text-gray-900">
                  {feedback.speakingPace} (
                  {feedback.speakingSpeedWpm ? `${feedback.speakingSpeedWpm} WPM` : "N/A"})
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
