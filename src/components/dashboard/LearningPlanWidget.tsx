"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Circle, Loader2, Sparkles } from "lucide-react";

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

interface LearningPlan {
  id: string;
  title: string;
  tasksJson: Task[];
}

export function LearningPlanWidget() {
  const [plan, setPlan] = useState<LearningPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchPlan = async () => {
    try {
      const res = await fetch("/api/learning-plan");
      const data = await res.json();
      if (data.success && data.plan) {
        setPlan(data.plan);
      }
    } catch (e) {
      console.error("Failed to fetch plan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, []);

  const generatePlan = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/learning-plan", { method: "POST" });
      const data = await res.json();
      if (data.success && data.plan) {
        setPlan(data.plan);
      }
    } catch (e) {
      console.error("Failed to generate plan");
    } finally {
      setGenerating(false);
    }
  };

  const toggleTask = async (taskId: string, currentCompleted: boolean) => {
    if (!plan) return;

    // Optimistic UI update
    const updatedTasks = plan.tasksJson.map((t) =>
      t.id === taskId ? { ...t, completed: !currentCompleted } : t
    );
    setPlan({ ...plan, tasksJson: updatedTasks });

    try {
      await fetch("/api/learning-plan", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id, taskId, completed: !currentCompleted }),
      });
    } catch (e) {
      console.error("Failed to update task");
      // Revert if failed (omitted for brevity)
    }
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-blue-200 bg-blue-50/50 p-6 text-center shadow-sm">
        <Sparkles className="mb-3 h-8 w-8 text-blue-500" />
        <h3 className="mb-1 text-lg font-bold text-gray-900">Daily Learning Plan</h3>
        <p className="mb-4 max-w-[250px] text-sm text-gray-500">
          Get a personalized daily practice plan from your AI Coach.
        </p>
        <button
          onClick={generatePlan}
          disabled={generating}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {generating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Generate Today's Plan
        </button>
      </div>
    );
  }

  const completedCount = plan.tasksJson.filter((t) => t.completed).length;
  const totalCount = plan.tasksJson.length;
  const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{plan.title}</h3>
          <p className="text-sm text-gray-500">
            {completedCount} of {totalCount} completed
          </p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 font-bold text-blue-600">
          {progressPercent}%
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6 h-2.5 w-full rounded-full bg-gray-100">
        <div
          className="h-2.5 rounded-full bg-blue-600 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      <div className="space-y-3">
        {plan.tasksJson.map((task) => (
          <button
            key={task.id}
            onClick={() => toggleTask(task.id, task.completed)}
            className="group flex w-full items-start gap-3 rounded-xl border border-gray-100 p-3 transition-all hover:border-blue-200 hover:bg-blue-50/30"
          >
            <div className="mt-0.5 shrink-0 text-blue-500 transition-transform group-hover:scale-110">
              {task.completed ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <Circle className="h-5 w-5 text-gray-300" />
              )}
            </div>
            <span
              className={`text-left text-sm transition-colors ${task.completed ? "text-gray-400 line-through" : "font-medium text-gray-700"}`}
            >
              {task.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
