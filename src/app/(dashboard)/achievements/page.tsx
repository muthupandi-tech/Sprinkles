"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Flame, Award, Star, BookOpen, Mic, TrendingUp } from "lucide-react";
import { getGamificationData } from "@/app/actions/gamification";

type LeaderboardEntry = {
  rank: number;
  userId: string;
  name: string;
  score: number;
  streak: number;
  isCurrentUser: boolean;
  avatarInitials: string;
};

type Achievement = {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlockedAt: Date;
};

const IconMap: Record<string, React.ElementType> = {
  Award,
  BookOpen,
  Mic,
  Trophy,
  Medal,
  Star,
  Flame,
};

export default function AchievementsPage() {
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [progress, setProgress] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      const res = await getGamificationData();
      if (res.success) {
        setAchievements(res.achievements || []);
        setLeaderboard(res.leaderboard || []);
        setProgress(res.progress);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600"></div>
        <p className="text-sm font-semibold text-gray-500">Loading achievements...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-extrabold tracking-tight text-gray-900">
          <Trophy className="h-8 w-8 text-orange-500" />
          <span>Achievements & Leaderboard</span>
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Track your progress, unlock badges, and see how you rank among other learners.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Left Column: Streaks & Badges */}
        <div className="space-y-6 md:col-span-2">
          {/* Current Stats */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-white p-5 shadow-sm"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                <Flame className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold tracking-wider text-orange-600 uppercase">
                  Current Streak
                </p>
                <p className="text-2xl font-black text-gray-900">
                  {progress?.currentStreak || 0} Days
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-4 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Star className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold tracking-wider text-blue-600 uppercase">
                  Overall Score
                </p>
                <p className="text-2xl font-black text-gray-900">
                  {Math.round(progress?.overallScore || 0)}%
                </p>
              </div>
            </motion.div>
          </div>

          {/* Badges List */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <h2 className="flex items-center gap-2 border-b border-gray-50 pb-3 text-lg font-bold text-gray-900">
              <Medal className="h-5 w-5 text-yellow-500" />
              Earned Badges
            </h2>

            {achievements.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-gray-400">
                  <Award className="h-8 w-8" />
                </div>
                <p className="mt-3 text-sm font-medium text-gray-900">No badges yet</p>
                <p className="text-xs text-gray-500">
                  Complete practice sessions to earn your first badge!
                </p>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {achievements.map((achievement, idx) => {
                  const Icon = IconMap[achievement.iconName] || Award;
                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * idx }}
                      className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4 transition-all hover:bg-gray-50 hover:shadow-sm"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-yellow-100 to-yellow-50 text-yellow-600 shadow-inner">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">{achievement.title}</h3>
                        <p className="text-xs text-gray-500">{achievement.description}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Column: Leaderboard */}
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <h2 className="flex items-center gap-2 border-b border-gray-50 pb-3 text-lg font-bold text-gray-900">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Global Leaderboard
          </h2>

          <div className="mt-4 flex-1 space-y-3">
            {leaderboard.map((entry) => (
              <div
                key={entry.userId}
                className={`flex items-center justify-between rounded-xl p-3 transition-colors ${
                  entry.isCurrentUser ? "border border-blue-200 bg-blue-50/50" : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      entry.rank === 1
                        ? "bg-yellow-100 text-yellow-700"
                        : entry.rank === 2
                          ? "bg-gray-200 text-gray-700"
                          : entry.rank === 3
                            ? "bg-amber-100 text-amber-700"
                            : "text-gray-400"
                    }`}
                  >
                    {entry.rank}
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 text-xs font-bold text-gray-700">
                    {entry.avatarInitials}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900">
                      {entry.name}
                      {entry.isCurrentUser && (
                        <span className="ml-1 text-[10px] text-blue-600">(You)</span>
                      )}
                    </span>
                    <span className="text-[10px] text-gray-500">{entry.score} pts</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-600">
                  <Flame className="h-3 w-3" />
                  {entry.streak}
                </div>
              </div>
            ))}

            {leaderboard.length === 0 && (
              <p className="py-8 text-center text-sm text-gray-500">
                No leaderboard data available.
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
