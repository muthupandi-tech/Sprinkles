"use client";

import { useEffect, useState } from "react";
import { Lightbulb, MessageSquare, BookOpen, Target, Loader2 } from "lucide-react";

interface Suggestion {
  id: string;
  type: string;
  content: string;
  createdAt: string;
}

export function SmartSuggestionsWidget() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSuggestions() {
      try {
        const res = await fetch("/api/coach-suggestions");
        const data = await res.json();
        if (data.success) {
          setSuggestions(data.suggestions);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadSuggestions();
  }, []);

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-sm p-6">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm h-full min-h-[250px]">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-50 text-yellow-600">
          <Lightbulb className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Smart Suggestions</h3>
        <p className="text-sm text-gray-500 mb-4 max-w-[250px]">Complete a chat session with your AI Coach to receive personalized feedback and tips.</p>
        <a href="/ai-assistant" className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800">
          Go to AI Coach
        </a>
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "vocabulary": return <BookOpen className="h-4 w-4 text-blue-500" />;
      case "grammar": return <MessageSquare className="h-4 w-4 text-red-500" />;
      case "tip": return <Lightbulb className="h-4 w-4 text-yellow-500" />;
      case "challenge": return <Target className="h-4 w-4 text-purple-500" />;
      default: return <Lightbulb className="h-4 w-4 text-gray-500" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case "vocabulary": return "bg-blue-50 border-blue-100";
      case "grammar": return "bg-red-50 border-red-100";
      case "tip": return "bg-yellow-50 border-yellow-100";
      case "challenge": return "bg-purple-50 border-purple-100";
      default: return "bg-gray-50 border-gray-100";
    }
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col h-full">
      <div className="mb-4 flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-yellow-500" />
        <h3 className="text-lg font-bold text-gray-900">Recent Feedback</h3>
      </div>
      
      <div className="flex-1 space-y-3 overflow-y-auto">
        {suggestions.map(sug => (
          <div key={sug.id} className={`rounded-xl border p-3 ${getBgColor(sug.type)}`}>
            <div className="flex items-center gap-2 mb-1">
              {getIcon(sug.type)}
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700">{sug.type}</span>
            </div>
            <p className="text-sm font-medium text-gray-800 leading-relaxed">{sug.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
