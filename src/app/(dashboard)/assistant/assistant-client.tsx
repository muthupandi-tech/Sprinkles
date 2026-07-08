"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  CheckCircle2,
  Calendar,
  Clock,
  BookOpen,
  Target,
  Loader2,
  RefreshCw,
  Plus,
  Bell,
} from "lucide-react";

type Tab = "missions" | "planner" | "calendar" | "reminders";

export function AssistantClient() {
  const [activeTab, setActiveTab] = useState<Tab>("missions");
  const [motivation, setMotivation] = useState("Loading AI insights...");
  const [loadingMotivation, setLoadingMotivation] = useState(true);

  useEffect(() => {
    async function loadMotivation() {
      try {
        const res = await fetch("/api/assistant/motivation");
        const data = await res.json();
        if (data.success) {
          setMotivation(data.message);
        } else {
          setMotivation("Keep pushing forward! Every minute of practice counts.");
        }
      } catch (e) {
        setMotivation("Keep pushing forward! Every minute of practice counts.");
      } finally {
        setLoadingMotivation(false);
      }
    }
    loadMotivation();
  }, []);

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-gray-50/50 p-4 md:p-8">
      {/* Motivation Header */}
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 text-white shadow-lg">
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="relative z-10">
          <div className="mb-2 flex items-center gap-2 opacity-90">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-medium tracking-wider uppercase">
              AI Coach Motivation
            </span>
          </div>
          {loadingMotivation ? (
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin" />
              <h2 className="text-2xl font-bold">Crafting your message...</h2>
            </div>
          ) : (
            <h2 className="max-w-3xl text-3xl leading-tight font-bold">"{motivation}"</h2>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="scrollbar-hide mb-6 flex space-x-2 overflow-x-auto pb-2">
        {[
          { id: "missions", label: "Daily Missions", icon: Target },
          { id: "planner", label: "Weekly Planner", icon: BookOpen },
          { id: "calendar", label: "Calendar", icon: Calendar },
          { id: "reminders", label: "Reminders", icon: Bell },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
                isActive
                  ? "bg-gray-900 text-white shadow-md"
                  : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          {activeTab === "missions" && <MissionsView key="missions" />}
          {activeTab === "planner" && <PlannerView key="planner" />}
          {activeTab === "calendar" && <CalendarView key="calendar" />}
          {activeTab === "reminders" && <RemindersView key="reminders" />}
        </AnimatePresence>
      </div>
    </div>
  );
}

// --- View Components ---

function MissionsView() {
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  async function fetchMissions() {
    setLoading(true);
    try {
      const res = await fetch("/api/assistant/missions");
      const data = await res.json();
      if (data.success) {
        setMissions(data.missions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMissions();
  }, []);

  async function generateNewMissions() {
    setGenerating(true);
    try {
      const res = await fetch("/api/assistant/missions", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setMissions(data.missions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  }

  async function toggleMission(id: string, completed: boolean) {
    // Optimistic update
    setMissions(missions.map((m) => (m.id === id ? { ...m, completed } : m)));
    try {
      await fetch("/api/assistant/missions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ missionId: id, completed }),
      });
    } catch (e) {
      // Revert on error
      setMissions(missions.map((m) => (m.id === id ? { ...m, completed: !completed } : m)));
    }
  }

  const completedCount = missions.filter((m) => m.completed).length;
  const progressPercent =
    missions.length > 0 ? Math.round((completedCount / missions.length) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Today's Missions</h3>
          <p className="text-sm text-gray-500">
            Complete these tasks to earn points and stay on track.
          </p>
        </div>
        <button
          onClick={generateNewMissions}
          disabled={generating}
          className="flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-100 disabled:opacity-50"
        >
          {generating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Generate New
        </button>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <span className="font-bold text-gray-700">Progress</span>
          <span className="font-bold text-blue-600">{progressPercent}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : missions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-100 bg-white p-8 text-center">
          <p className="mb-4 text-gray-500">No missions set for today.</p>
          <button
            onClick={generateNewMissions}
            className="font-semibold text-blue-600 hover:underline"
          >
            Generate Missions
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {missions.map((mission) => (
            <div
              key={mission.id}
              className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-5 transition-all ${mission.completed ? "border-green-200 bg-green-50/50" : "border-gray-200 bg-white shadow-sm hover:border-blue-300"}`}
              onClick={() => toggleMission(mission.id, !mission.completed)}
            >
              <div
                className={`mt-1 rounded-full p-1 ${mission.completed ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}
              >
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4
                  className={`font-bold ${mission.completed ? "text-gray-500 line-through" : "text-gray-900"}`}
                >
                  {mission.title}
                </h4>
                <p
                  className={`mt-1 text-sm ${mission.completed ? "text-gray-400" : "text-gray-500"}`}
                >
                  {mission.description}
                </p>
                <div className="mt-3 inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                  {mission.points} Points
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function PlannerView() {
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  async function fetchPlan() {
    setLoading(true);
    try {
      const res = await fetch("/api/assistant/weekly-plan");
      const data = await res.json();
      if (data.success) {
        setPlan(data.plan);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPlan();
  }, []);

  async function generatePlan() {
    setGenerating(true);
    try {
      const res = await fetch("/api/assistant/weekly-plan", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setPlan(data.plan);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Weekly Study Plan</h3>
          <p className="text-sm text-gray-500">Your AI-generated roadmap for the next 7 days.</p>
        </div>
        <button
          onClick={generatePlan}
          disabled={generating}
          className="flex items-center gap-2 rounded-xl bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-600 transition hover:bg-purple-100 disabled:opacity-50"
        >
          {generating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {plan ? "Regenerate" : "Generate Plan"}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : !plan ? (
        <div className="rounded-2xl border border-dashed border-gray-100 bg-white p-12 text-center">
          <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <p className="mb-4 font-medium text-gray-500">No active weekly plan.</p>
          <button
            onClick={generatePlan}
            className="rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Create AI Plan
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {(plan.tasksJson as any[]).map((day, idx) => (
            <div
              key={idx}
              className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-5 py-3">
                <span className="font-bold text-gray-900">{day.dayName}</span>
                <span className="rounded-md bg-gray-200/50 px-2 py-1 text-xs font-semibold text-gray-500">
                  Day {idx + 1}
                </span>
              </div>
              <div className="flex-1 space-y-3 p-5">
                {day.tasks.map((t: any, i: number) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 flex-shrink-0 rounded-full bg-blue-100 p-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm leading-snug font-medium text-gray-800">{t.title}</p>
                      <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                        {t.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function CalendarView() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch("/api/assistant/calendar");
        const data = await res.json();
        if (data.success) {
          setEvents(data.events);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-xl font-bold text-gray-900">Your Calendar</h3>
        <p className="text-sm text-gray-500">
          Track your practice history and upcoming interviews.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
        {loading ? (
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-400" />
        ) : events.length === 0 ? (
          <div>
            <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p className="text-gray-500">No events found for this month.</p>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-4 text-left">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4"
              >
                <div className="min-w-[60px] rounded-lg border bg-white p-2 text-center shadow-sm">
                  <div className="text-xs font-bold text-red-500 uppercase">
                    {new Date(ev.date).toLocaleString("default", { month: "short" })}
                  </div>
                  <div className="text-xl font-black text-gray-900">
                    {new Date(ev.date).getDate().toString().padStart(2, "0")}
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900">{ev.title}</h4>
                  <p className="text-sm text-gray-500 capitalize">{ev.type}</p>
                </div>
                <div
                  className={`rounded-full px-3 py-1 text-xs font-bold ${ev.completed ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                >
                  {ev.completed ? "Completed" : "Upcoming"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function RemindersView() {
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTime, setNewTime] = useState("09:00");

  useEffect(() => {
    fetchReminders();
  }, []);

  async function fetchReminders() {
    try {
      const res = await fetch("/api/assistant/reminders");
      const data = await res.json();
      if (data.success) {
        setReminders(data.reminders);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function createReminder(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/assistant/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          time: newTime,
          type: "custom",
          enabled: true,
          days: [1, 2, 3, 4, 5],
        }),
      });
      if (res.ok) {
        setNewTitle("");
        setIsCreating(false);
        fetchReminders();
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function toggleReminder(id: string, enabled: boolean) {
    setReminders(reminders.map((r) => (r.id === id ? { ...r, enabled } : r)));
    try {
      await fetch("/api/assistant/reminders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, enabled }),
      });
    } catch (e) {
      setReminders(reminders.map((r) => (r.id === id ? { ...r, enabled: !enabled } : r)));
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Smart Reminders</h3>
          <p className="text-sm text-gray-500">
            Stay consistent with customizable practice nudges.
          </p>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          <Plus className="h-4 w-4" />
          Add Reminder
        </button>
      </div>

      {isCreating && (
        <form
          onSubmit={createReminder}
          className="flex items-end gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <div className="flex-1">
            <label className="mb-1 block text-xs font-bold text-gray-500">Title</label>
            <input
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              type="text"
              className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="e.g. Daily Vocabulary Practice"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-gray-500">Time</label>
            <input
              required
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              type="time"
              className="rounded-xl border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
          >
            Save
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="max-w-3xl space-y-3">
          {reminders.map((reminder) => (
            <div
              key={reminder.id}
              className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`rounded-full p-3 ${reminder.enabled ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-400"}`}
                >
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <h4
                    className={`font-bold ${reminder.enabled ? "text-gray-900" : "text-gray-500"}`}
                  >
                    {reminder.title}
                  </h4>
                  <p className="text-sm font-medium text-gray-500">{reminder.time} • Weekdays</p>
                </div>
              </div>

              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={reminder.enabled}
                  onChange={(e) => toggleReminder(reminder.id, e.target.checked)}
                />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-blue-600 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
              </label>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
