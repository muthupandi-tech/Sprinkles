"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Briefcase,
  BookOpen,
  Lightbulb,
  MessageSquare,
  ArrowRight,
  Loader2,
  Plus,
} from "lucide-react";

export default function GDSetupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Campus Placement");
  const [topic, setTopic] = useState("");
  const [customMode, setCustomMode] = useState(false);

  const categories = [
    { id: "Campus Placement", icon: Briefcase, color: "text-blue-600 bg-blue-50 border-blue-100" },
    { id: "Technical", icon: Lightbulb, color: "text-purple-600 bg-purple-50 border-purple-100" },
    { id: "Debate", icon: MessageSquare, color: "text-red-600 bg-red-50 border-red-100" },
    { id: "Current Affairs", icon: BookOpen, color: "text-green-600 bg-green-50 border-green-100" },
  ];

  const suggestedTopics = [
    "Should AI replace teachers in the future?",
    "Is remote work better than office work for productivity?",
    "Impact of social media on mental health of students.",
    "Electric vehicles vs Fuel vehicles: The reality.",
    "Startups vs Government Jobs in India.",
    "Climate Change: Individual action vs Government policy.",
    "Digital India: Successes and failures.",
  ];

  const handleStart = async (selectedTopic: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/gd/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: selectedCategory,
          topic: selectedTopic,
        }),
      });

      if (!response.ok) throw new Error("Failed to init session");

      const data = await response.json();
      router.push(`/practice/gd/session/${data.sessionId}`);
    } catch (error) {
      console.error(error);
      alert("Something went wrong starting the GD session.");
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">Group Discussion Simulator</h1>
        <p className="mt-2 text-gray-500">
          Engage in dynamic, multi-agent group discussions. AI participants will react to your
          arguments, challenge your points, and evaluate your leadership and communication skills.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Left Column: Config */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-bold tracking-wider text-gray-500 uppercase">
              1. Select Discussion Mode
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500"
                        : "border-gray-200 bg-white hover:border-blue-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className={`rounded-lg border p-2 ${cat.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span
                      className={`text-sm font-bold ${isSelected ? "text-blue-700" : "text-gray-700"}`}
                    >
                      {cat.id}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-bold tracking-wider text-gray-500 uppercase">
              2. Custom Topic (Optional)
            </h2>
            <p className="mb-3 text-xs text-gray-500">
              Have a specific topic in mind? Enter it below, otherwise pick from the suggested list
              on the right.
            </p>
            <div className="space-y-3">
              <input
                type="text"
                value={topic}
                onChange={(e) => {
                  setTopic(e.target.value);
                  setCustomMode(true);
                }}
                placeholder="E.g., Space Exploration privatization..."
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none"
              />
              {customMode && topic.trim().length > 5 && (
                <button
                  onClick={() => handleStart(topic)}
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Users className="h-4 w-4" />
                  )}
                  Start Custom GD
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Suggested Topics */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold tracking-wider text-gray-500 uppercase">
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            Suggested Topics
          </h2>
          <div className="space-y-3">
            {suggestedTopics.map((t, idx) => (
              <button
                key={idx}
                onClick={() => handleStart(t)}
                disabled={isLoading}
                className="group flex w-full items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 text-left transition-all hover:border-blue-200 hover:bg-blue-50/50 disabled:opacity-50"
              >
                <span className="text-sm font-medium text-gray-700 transition-colors group-hover:text-blue-700">
                  {t}
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-500" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
