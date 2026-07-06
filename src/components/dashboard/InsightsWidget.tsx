"use client";

import { useEffect, useState } from "react";
import { Sparkles, Loader2, TrendingUp } from "lucide-react";
import Link from "next/link";

interface Insight {
  id: string;
  content: string;
  type: string;
  createdAt: string;
}

export function InsightsWidget() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInsights() {
      try {
        const res = await fetch("/api/analytics");
        if (res.ok) {
          const data = await res.json();
          setInsights(data.recommendations || []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadInsights();
  }, []);

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm h-full min-h-[200px]">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <Sparkles className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Today's Insights</h3>
        <p className="text-sm text-gray-500 mb-4 max-w-[250px]">Practice more to generate AI-driven insights.</p>
        <Link href="/practice" className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
          Start Practicing
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col h-full">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-900">Today's Insights</h3>
        </div>
        <Link href="/analytics" className="text-xs font-semibold text-blue-600 hover:underline">
          View All
        </Link>
      </div>
      
      <div className="flex-1 space-y-3 overflow-y-auto">
        {insights.slice(0, 3).map((insight) => (
          <div key={insight.id} className="rounded-xl border border-blue-100 bg-blue-50 p-3">
            <p className="text-sm font-medium text-gray-800 leading-relaxed">{insight.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
