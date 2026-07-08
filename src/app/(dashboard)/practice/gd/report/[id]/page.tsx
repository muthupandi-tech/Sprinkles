"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  ArrowLeft,
  Trophy,
  Activity,
  Target,
  Brain,
  Ear,
  Presentation,
  CheckCircle,
  XCircle,
  Lightbulb,
} from "lucide-react";
import Link from "next/link";

export default function GDReportPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    generateReport();
  }, [id]);

  const generateReport = async () => {
    try {
      const res = await fetch(`/api/gd/report/${id}`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to generate report");
      const data = await res.json();
      setReport(data.session.feedbackJson);
    } catch (error) {
      console.error(error);
      alert("Failed to load report");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-sm font-medium text-gray-500">
          Analyzing your group discussion performance...
        </p>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="rounded-full bg-white p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">GD Performance Report</h1>
          <p className="text-gray-500">Detailed analysis of your communication and leadership.</p>
        </div>
      </div>

      {/* Overview Score */}
      <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-center text-white shadow-lg">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl"></div>
        <Trophy className="mb-4 h-12 w-12 text-yellow-300 drop-shadow-md" />
        <h2 className="text-lg font-medium text-blue-100">Overall GD Score</h2>
        <div className="mt-2 text-6xl font-black tracking-tight">
          {report.overallScore}
          <span className="text-3xl text-blue-300">/100</span>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <MetricCard
          title="Confidence"
          score={report.confidenceScore}
          icon={Activity}
          color="text-green-500"
        />
        <MetricCard
          title="Fluency"
          score={report.fluencyScore}
          icon={Presentation}
          color="text-blue-500"
        />
        <MetricCard
          title="Grammar"
          score={report.grammarScore}
          icon={Target}
          color="text-purple-500"
        />
        <MetricCard
          title="Vocabulary"
          score={report.vocabularyScore}
          icon={Target}
          color="text-pink-500"
        />
        <MetricCard
          title="Leadership"
          score={report.leadershipScore}
          icon={Trophy}
          color="text-yellow-500"
        />
        <MetricCard
          title="Listening"
          score={report.listeningSkillsScore}
          icon={Ear}
          color="text-teal-500"
        />
        <MetricCard
          title="Critical Th."
          score={report.criticalThinkingScore}
          icon={Brain}
          color="text-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Strengths */}
        <div className="rounded-3xl border border-green-100 bg-green-50/50 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-green-900">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Your Strengths
          </h3>
          <ul className="space-y-3">
            {report.strengths.map((s: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-green-800">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500"></span>
                {s}
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="rounded-3xl border border-red-100 bg-red-50/50 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-red-900">
            <XCircle className="h-5 w-5 text-red-600" />
            Areas for Improvement
          </h3>
          <ul className="space-y-3">
            {report.weaknesses.map((s: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-red-800">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500"></span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Missed Opportunities */}
      {report.missedOpportunities && report.missedOpportunities.length > 0 && (
        <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
            <Lightbulb className="h-5 w-5 text-orange-500" />
            Missed Opportunities
          </h3>
          <ul className="space-y-3">
            {report.missedOpportunities.map((s: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500"></span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Better Responses */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900">How you could have responded better</h3>
        {report.betterResponses.map((r: any, idx: number) => (
          <div
            key={idx}
            className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <div>
              <p className="text-xs font-bold tracking-wider text-gray-500 uppercase">Context</p>
              <p className="mt-1 border-l-2 border-gray-200 pl-3 text-sm text-gray-800 italic">
                "{r.originalContext}"
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-red-50 p-4">
                <p className="mb-1 text-xs font-bold tracking-wider text-red-600 uppercase">
                  What you said
                </p>
                <p className="text-sm text-red-900">"{r.whatTheySaid}"</p>
              </div>
              <div className="rounded-xl bg-green-50 p-4">
                <p className="mb-1 text-xs font-bold tracking-wider text-green-600 uppercase">
                  Better Alternative
                </p>
                <p className="text-sm text-green-900">"{r.betterAlternative}"</p>
              </div>
            </div>

            <div className="rounded-xl bg-blue-50 p-4">
              <p className="mb-1 text-xs font-bold tracking-wider text-blue-600 uppercase">
                Why this is better
              </p>
              <p className="text-sm text-blue-900">{r.reason}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center pt-8">
        <Link
          href="/dashboard"
          className="rounded-xl bg-gray-900 px-8 py-3 font-bold text-white transition-colors hover:bg-gray-800"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  score,
  icon: Icon,
  color,
}: {
  title: string;
  score: number;
  icon: any;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <Icon className={`mb-2 h-6 w-6 ${color}`} />
      <span className="text-xs font-medium text-gray-500">{title}</span>
      <span className="text-xl font-bold text-gray-900">{score}%</span>
    </div>
  );
}
