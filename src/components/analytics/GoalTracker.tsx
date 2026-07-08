"use client";

import { useState } from "react";
import { CheckCircle2, Circle, Plus, Target, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Goal {
  id: string;
  title: string;
  type: string;
  target: number;
  progress: number;
  completed: boolean;
}

interface GoalTrackerProps {
  initialGoals: Goal[];
}

export default function GoalTracker({ initialGoals }: GoalTrackerProps) {
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTarget, setNewTarget] = useState("");
  const [newType, setNewType] = useState("practice_time");

  const handleAddGoal = async () => {
    if (!newTitle || !newTarget) return;

    try {
      const res = await fetch("/api/analytics/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          type: newType,
          target: parseInt(newTarget, 10),
        }),
      });

      if (res.ok) {
        const { goal } = await res.json();
        setGoals([goal, ...goals]);
        setIsAdding(false);
        setNewTitle("");
        setNewTarget("");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900">
          <Target className="h-4.5 w-4.5 text-blue-600" />
          <span>Goal Tracking</span>
        </h3>
        <button onClick={() => setIsAdding(!isAdding)} className="rounded-md p-1 hover:bg-gray-100">
          {isAdding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col gap-2 overflow-hidden rounded-xl bg-gray-50 p-3"
          >
            <input
              type="text"
              placeholder="e.g. Practice 30 minutes daily"
              className="rounded-md border border-gray-200 p-2 text-sm"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Target value"
                className="w-1/3 rounded-md border border-gray-200 p-2 text-sm"
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
              />
              <select
                className="w-2/3 rounded-md border border-gray-200 p-2 text-sm"
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
              >
                <option value="practice_time">Practice Time (mins)</option>
                <option value="interviews">Mock Interviews (count)</option>
                <option value="vocabulary">Vocabulary (words)</option>
                <option value="streak">Streak (days)</option>
              </select>
            </div>
            <button
              onClick={handleAddGoal}
              className="mt-2 w-full rounded-md bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Save Goal
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {goals.map((goal) => {
          const percent = Math.min(Math.round((goal.progress / goal.target) * 100), 100);
          return (
            <div key={goal.id} className="group relative">
              <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {goal.completed ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Circle className="h-4 w-4 text-gray-300" />
                  )}
                  <span
                    className={`text-sm ${goal.completed ? "text-gray-500 line-through" : "font-medium text-gray-700"}`}
                  >
                    {goal.title}
                  </span>
                </div>
                <span className="text-xs font-bold text-gray-900">{percent}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full ${percent === 100 ? "bg-green-500" : "bg-blue-500"}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
        {goals.length === 0 && !isAdding && (
          <p className="text-center text-sm text-gray-500">
            No active goals yet. Click + to add one.
          </p>
        )}
      </div>
    </div>
  );
}
