"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  Sparkles,
  Mic,
  BookOpen,
  Award,
  BarChart2,
  CheckSquare,
  Square,
  Activity,
  Flame,
  Clock,
  Compass,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
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
} from "recharts";
import { toggleMission } from "@/app/actions/profile";
import { LearningPlanWidget } from "@/components/dashboard/LearningPlanWidget";
import { SmartSuggestionsWidget } from "@/components/dashboard/SmartSuggestionsWidget";
import { VocabularyProgressWidget } from "@/components/dashboard/VocabularyProgressWidget";

interface Mission {
  id: string;
  title: string;
  description: string | null;
  type: string;
  points: number;
  completed: boolean;
}

interface RecentSession {
  id: string;
  type: string;
  durationMinutes: number;
  score: number;
  feedback: string | null;
  createdAt: string | Date;
}

interface DashboardClientProps {
  initialData: {
    profile?: {
      fullName?: string | null;
      englishProficiency?: string;
      preferredAccent?: string;
      dailyPracticeGoal?: number;
    } | null;
    progress?: {
      currentStreak?: number;
      overallScore?: number;
      speakingScore?: number;
      vocabularyScore?: number;
      pronunciationScore?: number;
      interviewScore?: number;
      totalPracticeTime?: number;
    } | null;
    missions?: Mission[];
    recentSessions?: RecentSession[];
    achievements?: {
      id: string;
      title: string;
      description: string;
      iconName: string;
    }[];
  };
}

export default function DashboardClient({ initialData }: DashboardClientProps) {
  const [mounted, setMounted] = useState(false);
  const [missions, setMissions] = useState<Mission[]>(initialData.missions || []);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const handleToggleMission = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    // Optimistic UI update
    setMissions((prev: Mission[]) =>
      prev.map((m) => (m.id === id ? { ...m, completed: newStatus } : m))
    );

    startTransition(async () => {
      const res = await toggleMission(id, newStatus);
      if (!res.success) {
        // Rollback on error
        setMissions((prev: Mission[]) =>
          prev.map((m) => (m.id === id ? { ...m, completed: currentStatus } : m))
        );
      }
    });
  };

  const progress = {
    currentStreak: initialData.progress?.currentStreak ?? 0,
    overallScore: initialData.progress?.overallScore ?? 0,
    speakingScore: initialData.progress?.speakingScore ?? 0,
    vocabularyScore: initialData.progress?.vocabularyScore ?? 0,
    pronunciationScore: initialData.progress?.pronunciationScore ?? 0,
    interviewScore: initialData.progress?.interviewScore ?? 0,
    totalPracticeTime: initialData.progress?.totalPracticeTime ?? 0,
  };

  const profile = {
    fullName: initialData.profile?.fullName ?? "Student",
    dailyPracticeGoal: initialData.profile?.dailyPracticeGoal ?? 20,
    englishProficiency: initialData.profile?.englishProficiency ?? "Intermediate",
    preferredAccent: initialData.profile?.preferredAccent ?? "American",
  };

  const recentSessions = initialData.recentSessions || [];

  // Recharts Chart Data
  const weeklyData = [
    { name: "Mon", minutes: 15 },
    { name: "Tue", minutes: 20 },
    { name: "Wed", minutes: 10 },
    { name: "Thu", minutes: 30 },
    { name: "Fri", minutes: 0 },
    { name: "Sat", minutes: 15 },
    { name: "Sun", minutes: 25 },
  ];

  const scoreHistory = [
    { date: "Mon", score: 68 },
    { date: "Tue", score: 70 },
    { date: "Wed", score: 74 },
    { date: "Thu", score: 72 },
    { date: "Fri", score: 78 },
    { date: "Sat", score: 76 },
    { date: "Sun", score: 81 },
  ];

  const actions = [
    {
      label: "AI Assistant",
      desc: "Chat with your AI coach",
      href: "/ai-assistant",
      icon: Sparkles,
      color: "text-purple-600 bg-purple-50 border-purple-100",
    },
    {
      label: "Speech Practice",
      desc: "Speak & get pacing feedback",
      href: "/practice",
      icon: Mic,
      color: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
      label: "Vocabulary",
      desc: "SRS vocabulary deck drill",
      href: "/practice",
      icon: BookOpen,
      color: "text-green-600 bg-green-50 border-green-100",
    },
    {
      label: "Pronunciation",
      desc: "Phoneme enunciation drill",
      href: "/practice",
      icon: Compass,
      color: "text-orange-600 bg-orange-50 border-orange-100",
    },
    {
      label: "Mock Interview",
      desc: "Interactive behavioral prep",
      href: "/practice",
      icon: Award,
      color: "text-red-600 bg-red-50 border-red-100",
    },
    {
      label: "Progress Analytics",
      desc: "Review visual graph reports",
      href: "/analytics",
      icon: BarChart2,
      color: "text-cyan-600 bg-cyan-50 border-cyan-100",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Welcome back, {profile.fullName}!
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Proficiency Target:{" "}
            <span className="font-semibold text-blue-600">{profile.englishProficiency}</span> •
            Accent Target:{" "}
            <span className="font-semibold text-blue-600">{profile.preferredAccent}</span>
          </p>
        </div>
      </div>

      {/* 2. Top Stats Overview Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric Card 1: Communication Score */}
        <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
              Overall Score
            </p>
            <h3 className="mt-0.5 text-2xl font-extrabold text-gray-900">
              {progress.overallScore.toFixed(0)}%
            </h3>
            <p className="mt-0.5 text-[10px] font-bold text-green-600">Top 15% of your class</p>
          </div>
        </div>

        {/* Metric Card 2: Streak */}
        <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
            <Flame className="h-6 w-6 fill-current" />
          </div>
          <div>
            <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
              Practice Streak
            </p>
            <h3 className="mt-0.5 text-2xl font-extrabold text-gray-900">
              {progress.currentStreak} Days
            </h3>
            <p className="mt-0.5 text-[10px] font-bold text-orange-600">Keep the fire burning!</p>
          </div>
        </div>

        {/* Metric Card 3: Today's Goal Progress */}
        <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
            <Clock className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
              Today&apos;s Goal
            </p>
            <h3 className="mt-0.5 text-2xl font-extrabold text-gray-900">
              15 / {profile.dailyPracticeGoal} m
            </h3>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-green-500"
                style={{ width: `${Math.min(100, (15 / profile.dailyPracticeGoal) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Metric Card 4: Total Time */}
        <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
              Total Practice
            </p>
            <h3 className="mt-0.5 text-2xl font-extrabold text-gray-900">
              {progress.totalPracticeTime} mins
            </h3>
            <p className="mt-0.5 text-[10px] font-bold text-purple-600">
              2.4 hours logged this month
            </p>
          </div>
        </div>
      </div>

      {/* 3. Main Split Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Quick Actions & Charts (2 Cols on large screens) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Quick Action Grid */}
          <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <Compass className="h-5 w-5 text-blue-600" />
              <span>Quick Actions</span>
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {actions.map((act) => {
                const Icon = act.icon;
                return (
                  <Link
                    key={act.label}
                    href={act.href}
                    className="group flex items-start gap-4 rounded-xl border border-gray-100 p-4 transition-all hover:border-blue-200 hover:bg-blue-50/10"
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${act.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-gray-900 transition-colors group-hover:text-blue-600">
                        {act.label}
                      </h4>
                      <p className="mt-0.5 truncate text-xs text-gray-500">{act.desc}</p>
                    </div>
                    <ArrowRight className="align-self-center h-4 w-4 shrink-0 text-gray-400 transition-transform group-hover:translate-x-1" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Simple Charts Block */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Chart 1: Speaking Performance */}
            <div className="space-y-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">Speaking Score Trend</h3>
                <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600">
                  Weekly
                </span>
              </div>
              <div className="h-44 w-full">
                {mounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={scoreHistory}
                      margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
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
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10 }} />
                      <Area
                        type="monotone"
                        dataKey="score"
                        stroke="#2563eb"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#scoreColor)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-xl bg-gray-50 text-xs text-gray-400">
                    Loading chart...
                  </div>
                )}
              </div>
            </div>

            {/* Chart 2: Practice Time */}
            <div className="space-y-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">Practice Minutes</h3>
                <span className="rounded-md bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-600">
                  Daily Goals
                </span>
              </div>
              <div className="h-44 w-full">
                {mounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="name"
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
                      <Bar dataKey="minutes" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-xl bg-gray-50 text-xs text-gray-400">
                    Loading chart...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Daily Mission & Activity */}
        <div className="space-y-6">
          <VocabularyProgressWidget />
          <LearningPlanWidget />
          <SmartSuggestionsWidget />

          {/* Daily Missions Card */}
          <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                <CheckSquare className="h-5 w-5 text-blue-600" />
                <span>Daily Missions</span>
              </h2>
              <p className="mt-0.5 text-xs text-gray-400">
                Complete missions to level up your English skills
              </p>
            </div>

            <div className="space-y-3">
              {missions.map((mission: Mission) => (
                <button
                  key={mission.id}
                  onClick={() => handleToggleMission(mission.id, mission.completed)}
                  disabled={isPending}
                  className={`flex w-full cursor-pointer items-start gap-3 rounded-xl border p-3 text-left transition-all ${
                    mission.completed
                      ? "border-green-100 bg-green-50/30 text-gray-500"
                      : "border-gray-50 bg-gray-50/50 text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {mission.completed ? (
                      <CheckSquare className="h-5 w-5 rounded-md bg-white fill-current text-green-600" />
                    ) : (
                      <Square className="h-5 w-5 rounded-md bg-white text-gray-300" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4
                      className={`text-xs leading-tight font-bold ${mission.completed ? "line-through" : ""}`}
                    >
                      {mission.title}
                    </h4>
                    <p className="mt-0.5 text-[10px] text-gray-400">{mission.description}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                      mission.completed
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    +{mission.points} XP
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <Activity className="h-5 w-5 text-blue-600" />
              <span>Recent Activity</span>
            </h2>

            <div className="space-y-4">
              {recentSessions.length === 0 ? (
                <p className="py-4 text-center text-xs text-gray-400">
                  No recent activities logged.
                </p>
              ) : (
                recentSessions.map((sess: RecentSession) => (
                  <div
                    key={sess.id}
                    className="flex items-start gap-3 border-b border-gray-50 pb-3 last:border-b-0 last:pb-0"
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold ${
                        sess.type === "Speaking"
                          ? "border border-blue-100 bg-blue-50 text-blue-600"
                          : sess.type === "Pronunciation"
                            ? "border border-orange-100 bg-orange-50 text-orange-600"
                            : "border border-green-100 bg-green-50 text-green-600"
                      }`}
                    >
                      {sess.type.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between">
                        <h4 className="text-xs font-bold text-gray-900">{sess.type} Practice</h4>
                        <span className="text-[10px] text-gray-400">
                          {new Date(sess.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-[10px] text-gray-500">{sess.feedback}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-blue-700">
                          Score: {sess.score}%
                        </span>
                        <span className="flex items-center gap-0.5 text-[9px] font-bold text-gray-400">
                          <Clock className="h-2.5 w-2.5" />
                          {sess.durationMinutes}m
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
