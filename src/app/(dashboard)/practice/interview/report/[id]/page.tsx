"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  ArrowLeft,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Target,
  Lightbulb,
  Zap,
  User,
  Bot,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function InterviewReportPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => {
      generateReport(p.id);
    });
  }, [params]);

  const generateReport = async (id: string) => {
    try {
      // POST to report route (it generates if not exists, otherwise returns existing)
      const res = await fetch(`/api/interview/report/${id}`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setSession(data.session);
      } else {
        setError("Failed to generate report.");
      }
    } catch (e) {
      console.error(e);
      setError("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="mb-4 h-10 w-10 animate-spin text-blue-600" />
        <h2 className="text-xl font-bold text-gray-900">Analyzing your interview...</h2>
        <p className="mt-2 text-gray-500">The AI is evaluating your responses.</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <AlertTriangle className="mb-4 h-10 w-10 text-red-500" />
        <h2 className="text-xl font-bold text-gray-900">{error || "Report not found"}</h2>
        <Link href="/practice/interview" className="mt-4 text-blue-600 hover:underline">
          Go back
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/practice"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm transition-colors hover:bg-gray-50"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interview Report</h1>
          <p className="text-sm text-gray-500">
            {session.company} - {session.interviewType} Interview
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Scorecard & Overview */}
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
            <h2 className="mb-4 text-sm font-bold tracking-wider text-gray-500 uppercase">
              Overall Score
            </h2>
            <div className="relative mx-auto flex h-32 w-32 items-center justify-center rounded-full border-8 border-blue-50">
              <svg className="absolute inset-0 h-full w-full -rotate-90 transform">
                <circle
                  cx="60"
                  cy="60"
                  r="56"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className={cn(
                    session.overallScore >= 80
                      ? "text-green-500"
                      : session.overallScore >= 60
                        ? "text-yellow-500"
                        : "text-red-500"
                  )}
                  strokeDasharray="351.858"
                  strokeDashoffset={351.858 - (351.858 * session.overallScore) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-3xl font-black text-gray-900">{session.overallScore}%</span>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              {session.overallScore >= 80
                ? "Excellent job! You're ready."
                : session.overallScore >= 60
                  ? "Good effort, but room for improvement."
                  : "Keep practicing. You'll get there!"}
            </p>
          </div>

          {/* AI Feedback Summary */}
          {session.feedbackJson && (
            <div className="space-y-6">
              {/* Strengths */}
              <div className="rounded-2xl border border-green-100 bg-green-50 p-6">
                <h3 className="mb-3 flex items-center gap-2 font-bold text-green-900">
                  <Zap className="h-5 w-5 text-green-600" /> Key Strengths
                </h3>
                <ul className="space-y-2">
                  {session.feedbackJson.strengths?.map((s: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-green-800">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
                <h3 className="mb-3 flex items-center gap-2 font-bold text-red-900">
                  <Target className="h-5 w-5 text-red-600" /> Areas to Improve
                </h3>
                <ul className="space-y-2">
                  {session.feedbackJson.weaknesses?.map((w: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-red-800">
                      <TrendingUp className="mt-0.5 h-4 w-4 shrink-0" /> <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tips */}
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
                <h3 className="mb-3 flex items-center gap-2 font-bold text-blue-900">
                  <Lightbulb className="h-5 w-5 text-blue-600" /> Expert Tips
                </h3>
                <ul className="space-y-2">
                  {session.feedbackJson.tips?.map((t: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-blue-800">
                      <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />{" "}
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Q&A Breakdown */}
        <div className="space-y-6 lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-900">Detailed Q&A Breakdown</h2>

          <div className="space-y-8">
            {session.questions.map((q: any) => (
              <div
                key={q.id}
                className="space-y-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
              >
                {/* Question */}
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="mb-1 block text-xs font-bold tracking-wider text-gray-400 uppercase">
                      Question {q.order}
                    </span>
                    <p className="text-sm font-semibold text-gray-900">{q.questionText}</p>
                  </div>
                </div>

                {/* Answer */}
                {q.answer && (
                  <div className="space-y-6 pl-12">
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                      <span className="mb-2 block flex items-center gap-2 text-xs font-bold tracking-wider text-gray-400 uppercase">
                        <User className="h-3 w-3" /> Your Answer
                      </span>
                      <p className="text-sm text-gray-700">{q.answer.studentAnswer}</p>
                    </div>

                    {/* Granular Scores */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="rounded-xl border border-gray-100 p-3 text-center">
                        <div className="text-xl font-black text-blue-600">
                          {q.answer.grammarScore}
                        </div>
                        <div className="text-xs font-semibold text-gray-500 uppercase">Grammar</div>
                      </div>
                      <div className="rounded-xl border border-gray-100 p-3 text-center">
                        <div className="text-xl font-black text-blue-600">
                          {q.answer.fluencyScore}
                        </div>
                        <div className="text-xs font-semibold text-gray-500 uppercase">Fluency</div>
                      </div>
                      <div className="rounded-xl border border-gray-100 p-3 text-center">
                        <div className="text-xl font-black text-blue-600">
                          {q.answer.technicalAccuracy}
                        </div>
                        <div className="text-xs font-semibold text-gray-500 uppercase">
                          Accuracy
                        </div>
                      </div>
                    </div>

                    {/* Feedback */}
                    <div className="space-y-4 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                      <div>
                        <span className="mb-1 block text-xs font-bold tracking-wider text-blue-900 uppercase">
                          AI Feedback
                        </span>
                        <p className="text-sm text-blue-800">{q.answer.feedbackJson?.feedback}</p>
                      </div>
                      <div>
                        <span className="mb-1 block text-xs font-bold tracking-wider text-emerald-900 uppercase">
                          Better Sample Answer
                        </span>
                        <p className="text-sm text-emerald-800 italic">
                          "{q.answer.feedbackJson?.betterSampleAnswer}"
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
