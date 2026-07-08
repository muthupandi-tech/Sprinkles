"use client";

import { useEffect, useState } from "react";
import { BookOpen, TrendingUp, Award, Loader2 } from "lucide-react";

export function VocabularyProgressWidget() {
  const [stats, setStats] = useState({ wordsLearned: 0, mastered: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/vocabulary/bank");
        const json = await res.json();
        if (json.success) {
          const vocab = json.data as any[];
          setStats({
            wordsLearned: vocab.length,
            mastered: vocab.filter((v) => v.masteryLevel === 5).length,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600">
          <BookOpen className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-bold text-green-900">Vocabulary Progress</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-green-100 bg-white p-4 shadow-sm">
          <div className="mb-1 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
              Learned
            </span>
          </div>
          <p className="text-2xl font-extrabold text-gray-900">{stats.wordsLearned}</p>
        </div>

        <div className="rounded-xl border border-green-100 bg-white p-4 shadow-sm">
          <div className="mb-1 flex items-center gap-2">
            <Award className="h-4 w-4 text-yellow-500" />
            <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
              Mastered
            </span>
          </div>
          <p className="text-2xl font-extrabold text-gray-900">{stats.mastered}</p>
        </div>
      </div>
    </div>
  );
}
