"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart2, Mic, BookOpen, Clock, Award } from "lucide-react";
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
} from "recharts";

interface AnalyticsClientProps {
  initialData: {
    progress?: {
      overallScore?: number;
      speakingScore?: number;
      vocabularyScore?: number;
      pronunciationScore?: number;
      interviewScore?: number;
      totalPracticeTime?: number;
    } | null;
    speakingTimeline?: {
      date: string;
      score: number;
      fillerWords: number;
    }[];
    vocabularyGrowth?: {
      month: string;
      words: number;
    }[];
    weeklyPracticeTime?: {
      day: string;
      minutes: number;
    }[];
  };
}

export default function AnalyticsClient({ initialData }: AnalyticsClientProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const progress = {
    overallScore: initialData.progress?.overallScore ?? 0,
    speakingScore: initialData.progress?.speakingScore ?? 0,
    vocabularyScore: initialData.progress?.vocabularyScore ?? 0,
    pronunciationScore: initialData.progress?.pronunciationScore ?? 0,
    interviewScore: initialData.progress?.interviewScore ?? 0,
    totalPracticeTime: initialData.progress?.totalPracticeTime ?? 0,
  };

  const speakingTimeline = initialData.speakingTimeline || [];
  const vocabularyGrowth = initialData.vocabularyGrowth || [];
  const weeklyPracticeTime = initialData.weeklyPracticeTime || [];

  // Data for radar chart (Overall proficiency scores across domains)
  const radarData = [
    { subject: "Pronunciation", A: progress.pronunciationScore, fullMark: 100 },
    { subject: "Vocabulary", A: progress.vocabularyScore, fullMark: 100 },
    { subject: "Speaking Speed", A: progress.speakingScore, fullMark: 100 },
    { subject: "Confidence", A: 78, fullMark: 100 },
    { subject: "Interview Prep", A: progress.interviewScore, fullMark: 100 },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-extrabold tracking-tight text-gray-900">
          <BarChart2 className="h-8 w-8 text-blue-600" />
          <span>Performance Analytics</span>
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Detailed metrics charting your vocal pitch, filler words, grammar mastery, and SRS
          vocabulary retention.
        </p>
      </div>

      {/* Grid: Proficiency metrics overview */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase">Speaking Score</p>
          <h3 className="mt-1 text-2xl font-extrabold text-gray-900">
            {progress.speakingScore.toFixed(0)}%
          </h3>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase">Vocabulary Score</p>
          <h3 className="mt-1 text-2xl font-extrabold text-gray-900">
            {progress.vocabularyScore.toFixed(0)}%
          </h3>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase">Pronunciation</p>
          <h3 className="mt-1 text-2xl font-extrabold text-gray-900">
            {progress.pronunciationScore.toFixed(0)}%
          </h3>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase">Mock Interview</p>
          <h3 className="mt-1 text-2xl font-extrabold text-gray-900">
            {progress.interviewScore.toFixed(0)}%
          </h3>
        </div>
      </div>

      {/* Graph Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Chart 1: Speaking Progress */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <Mic className="h-4.5 w-4.5 text-blue-600" />
              <span>Speaking Progress & Filler Words</span>
            </h3>
            <span className="text-[10px] text-gray-400">Weekly timeline</span>
          </div>
          <div className="h-64 w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={speakingTimeline}
                  margin={{ top: 10, right: 5, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="speakColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[50, 100]}
                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10 }} />
                  <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                  <Area
                    name="Speaking Score (%)"
                    type="monotone"
                    dataKey="score"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#speakColor)"
                  />
                  <Line
                    name="Filler Words Count"
                    type="monotone"
                    dataKey="fillerWords"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-xl bg-gray-50 text-xs text-gray-400">
                Loading chart...
              </div>
            )}
          </div>
        </motion.div>

        {/* Chart 2: Vocabulary Growth */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <BookOpen className="h-4.5 w-4.5 text-green-600" />
              <span>Vocabulary Growth (Mastered Words)</span>
            </h3>
            <span className="text-[10px] text-gray-400">Monthly total</span>
          </div>
          <div className="h-64 w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={vocabularyGrowth}
                  margin={{ top: 10, right: 5, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="month"
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
                    name="Mastered Vocabulary"
                    dataKey="words"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-xl bg-gray-50 text-xs text-gray-400">
                Loading chart...
              </div>
            )}
          </div>
        </motion.div>

        {/* Chart 3: Weekly Practice Time */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <Clock className="h-4.5 w-4.5 text-orange-600" />
              <span>Weekly Practice Time (Minutes)</span>
            </h3>
            <span className="text-[10px] text-gray-400">Daily practice logs</span>
          </div>
          <div className="h-64 w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={weeklyPracticeTime}
                  margin={{ top: 10, right: 5, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="day"
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
                  <Line
                    name="Minutes Trained"
                    type="monotone"
                    dataKey="minutes"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-xl bg-gray-50 text-xs text-gray-400">
                Loading chart...
              </div>
            )}
          </div>
        </motion.div>

        {/* Chart 4: Communication Dimension Profile */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <Award className="h-4.5 w-4.5 text-purple-600" />
              <span>Communication Dimension profile</span>
            </h3>
            <span className="text-[10px] text-gray-400">Skills mapping</span>
          </div>
          <div className="flex h-64 w-full items-center justify-center">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#f1f5f9" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fontSize: 10, fill: "#4b5563", fontWeight: 600 }}
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8 }} />
                  <Radar
                    name="Student Proficiency"
                    dataKey="A"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.2}
                  />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10 }} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-xl bg-gray-50 text-xs text-gray-400">
                Loading chart...
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
