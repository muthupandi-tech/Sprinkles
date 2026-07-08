"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart2, Mic, BookOpen, Clock, Award, Lightbulb, Sparkles } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import GoalTracker from "@/components/analytics/GoalTracker";
import ReportDownloader from "@/components/analytics/ReportDownloader";

interface AnalyticsClientProps {
  initialData: {
    progress: any;
    analyticsHistory: any[];
    recommendations: any[];
    goals: any[];
  };
}

export default function AnalyticsClient({ initialData }: AnalyticsClientProps) {
  const [mounted, setMounted] = useState(false);
  const [timeRange, setTimeRange] = useState<"7D" | "30D" | "ALL">("30D");

  useEffect(() => {
    setMounted(true);
  }, []);

  const { progress, analyticsHistory, recommendations, goals } = initialData;

  const defaultProgress = progress || {
    overallScore: 0,
    speakingScore: 0,
    vocabularyScore: 0,
    pronunciationScore: 0,
    interviewScore: 0,
    totalPracticeTime: 0,
  };

  // Mock data for cases where history is empty to show the charts properly in demo
  const history =
    analyticsHistory.length > 0
      ? analyticsHistory
      : [
          { date: "2024-01-01", speakingScore: 60, vocabularyScore: 50, practiceTime: 10 },
          { date: "2024-01-02", speakingScore: 65, vocabularyScore: 55, practiceTime: 15 },
          { date: "2024-01-03", speakingScore: 62, vocabularyScore: 58, practiceTime: 20 },
          { date: "2024-01-04", speakingScore: 70, vocabularyScore: 65, practiceTime: 25 },
          { date: "2024-01-05", speakingScore: 75, vocabularyScore: 70, practiceTime: 30 },
        ];

  const chartData = history.map((item) => ({
    ...item,
    date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }));

  const radarData = [
    { subject: "Pronunciation", A: defaultProgress.pronunciationScore, fullMark: 100 },
    { subject: "Vocabulary", A: defaultProgress.vocabularyScore, fullMark: 100 },
    { subject: "Speaking Speed", A: defaultProgress.speakingScore, fullMark: 100 },
    { subject: "Confidence", A: 78, fullMark: 100 },
    { subject: "Interview Prep", A: defaultProgress.interviewScore, fullMark: 100 },
  ];

  const pieData = [
    { name: "Speaking", value: 35 },
    { name: "Vocabulary", value: 25 },
    { name: "Pronunciation", value: 20 },
    { name: "Interviews", value: 20 },
  ];
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-extrabold tracking-tight text-gray-900">
            <BarChart2 className="h-8 w-8 text-blue-600" />
            <span>Analytics Dashboard</span>
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your progress, monitor your goals, and view AI-driven recommendations.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex rounded-lg border border-gray-200 bg-white p-1">
            {["7D", "30D", "ALL"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range as any)}
                className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                  timeRange === range
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <ReportDownloader progress={defaultProgress} recommendations={recommendations} />
        </div>
      </div>

      {/* Widgets */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
        <div className="col-span-2 rounded-xl border border-gray-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 shadow-sm">
          <p className="text-xs font-semibold text-blue-800 uppercase">Overall Score</p>
          <h3 className="mt-1 text-3xl font-extrabold text-blue-900">
            {defaultProgress.overallScore.toFixed(0)}
            <span className="text-lg text-blue-600">/100</span>
          </h3>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase">Practice Time</p>
          <h3 className="mt-1 text-xl font-extrabold text-gray-900">
            {defaultProgress.totalPracticeTime}{" "}
            <span className="text-sm font-normal text-gray-500">mins</span>
          </h3>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase">Speaking</p>
          <h3 className="mt-1 text-xl font-extrabold text-gray-900">
            {defaultProgress.speakingScore.toFixed(0)}%
          </h3>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase">Vocabulary</p>
          <h3 className="mt-1 text-xl font-extrabold text-gray-900">
            {defaultProgress.vocabularyScore.toFixed(0)}%
          </h3>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase">Interview</p>
          <h3 className="mt-1 text-xl font-extrabold text-gray-900">
            {defaultProgress.interviewScore.toFixed(0)}%
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column (Charts) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Chart 1: Progress Over Time (Area Chart) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900">
                <Mic className="h-4.5 w-4.5 text-blue-600" />
                <span>Skill Progression</span>
              </h3>
            </div>
            <div className="h-64 w-full">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSpeaking" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorVocab" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10 }} />
                    <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                    <Area
                      type="monotone"
                      dataKey="speakingScore"
                      name="Speaking"
                      stroke="#2563eb"
                      fillOpacity={1}
                      fill="url(#colorSpeaking)"
                    />
                    <Area
                      type="monotone"
                      dataKey="vocabularyScore"
                      name="Vocabulary"
                      stroke="#10b981"
                      fillOpacity={1}
                      fill="url(#colorVocab)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Chart 2: Practice Time (Bar Chart) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900">
                <Clock className="h-4.5 w-4.5 text-orange-600" />
                <span>Practice Hours</span>
              </h3>
              <div className="h-48 w-full">
                {mounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10, fill: "#9ca3af" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: "#9ca3af" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10 }} />
                      <Bar
                        dataKey="practiceTime"
                        name="Minutes"
                        fill="#f59e0b"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </motion.div>

            {/* Chart 3: Skill Distribution (Pie Chart) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900">
                <BookOpen className="h-4.5 w-4.5 text-purple-600" />
                <span>Skill Distribution</span>
              </h3>
              <div className="h-48 w-full">
                {mounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10 }} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Column (Goals & AI Insights) */}
        <div className="space-y-6">
          {/* AI Insights Panel */}
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900">
                <Sparkles className="h-4.5 w-4.5 text-yellow-500" />
                <span>AI Insights</span>
              </h3>
              <button className="text-xs font-semibold text-blue-600 hover:underline">
                Refresh
              </button>
            </div>

            <div className="space-y-3">
              {recommendations.length > 0 ? (
                recommendations.map((rec) => (
                  <div key={rec.id} className="flex items-start gap-3 rounded-xl bg-blue-50/50 p-3">
                    <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                    <p className="text-sm leading-snug text-gray-700">{rec.content}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-center">
                  <p className="text-sm text-gray-500">Practice more to unlock AI insights!</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Goal Tracker */}
          <GoalTracker initialGoals={goals} />

          {/* Radar Chart */}
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <Award className="h-4.5 w-4.5 text-indigo-600" />
              <span>Dimension Profile</span>
            </h3>
            <div className="flex h-56 w-full items-center justify-center">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="#f1f5f9" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#4b5563" }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8 }} />
                    <Radar dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10 }} />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
