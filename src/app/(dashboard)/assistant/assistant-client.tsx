"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, CheckCircle2, Calendar, Clock, BookOpen, Target, Loader2, RefreshCw, Plus, Bell } from "lucide-react";

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
    <div className="flex h-full flex-col p-4 md:p-8 overflow-y-auto bg-gray-50/50">
      {/* Motivation Header */}
      <div className="mb-8 rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 opacity-90">
            <Sparkles className="h-5 w-5" />
            <span className="font-medium uppercase tracking-wider text-sm">AI Coach Motivation</span>
          </div>
          {loadingMotivation ? (
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin" />
              <h2 className="text-2xl font-bold">Crafting your message...</h2>
            </div>
          ) : (
            <h2 className="text-3xl font-bold leading-tight max-w-3xl">
              "{motivation}"
            </h2>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
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
                  : "bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200"
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
    setMissions(missions.map(m => m.id === id ? { ...m, completed } : m));
    try {
      await fetch("/api/assistant/missions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ missionId: id, completed })
      });
    } catch (e) {
      // Revert on error
      setMissions(missions.map(m => m.id === id ? { ...m, completed: !completed } : m));
    }
  }

  const completedCount = missions.filter(m => m.completed).length;
  const progressPercent = missions.length > 0 ? Math.round((completedCount / missions.length) * 100) : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Today's Missions</h3>
          <p className="text-gray-500 text-sm">Complete these tasks to earn points and stay on track.</p>
        </div>
        <button
          onClick={generateNewMissions}
          disabled={generating}
          className="flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-100 transition disabled:opacity-50"
        >
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Generate New
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="font-bold text-gray-700">Progress</span>
          <span className="font-bold text-blue-600">{progressPercent}%</span>
        </div>
        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
      ) : missions.length === 0 ? (
        <div className="text-center p-8 bg-white rounded-2xl border border-gray-100 border-dashed">
          <p className="text-gray-500 mb-4">No missions set for today.</p>
          <button onClick={generateNewMissions} className="text-blue-600 font-semibold hover:underline">Generate Missions</button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {missions.map((mission) => (
            <div 
              key={mission.id} 
              className={`flex items-start gap-4 rounded-2xl border p-5 transition-all cursor-pointer ${mission.completed ? 'bg-green-50/50 border-green-200' : 'bg-white border-gray-200 hover:border-blue-300 shadow-sm'}`}
              onClick={() => toggleMission(mission.id, !mission.completed)}
            >
              <div className={`mt-1 rounded-full p-1 ${mission.completed ? 'text-green-600 bg-green-100' : 'text-gray-400 bg-gray-100'}`}>
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className={`font-bold ${mission.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{mission.title}</h4>
                <p className={`text-sm mt-1 ${mission.completed ? 'text-gray-400' : 'text-gray-500'}`}>{mission.description}</p>
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
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Weekly Study Plan</h3>
          <p className="text-gray-500 text-sm">Your AI-generated roadmap for the next 7 days.</p>
        </div>
        <button
          onClick={generatePlan}
          disabled={generating}
          className="flex items-center gap-2 rounded-xl bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-600 hover:bg-purple-100 transition disabled:opacity-50"
        >
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {plan ? "Regenerate" : "Generate Plan"}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
      ) : !plan ? (
        <div className="text-center p-12 bg-white rounded-2xl border border-gray-100 border-dashed">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4 font-medium">No active weekly plan.</p>
          <button onClick={generatePlan} className="rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-800">
            Create AI Plan
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {(plan.tasksJson as any[]).map((day, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex justify-between items-center">
                <span className="font-bold text-gray-900">{day.dayName}</span>
                <span className="text-xs font-semibold text-gray-500 bg-gray-200/50 px-2 py-1 rounded-md">Day {idx + 1}</span>
              </div>
              <div className="p-5 flex-1 space-y-3">
                {day.tasks.map((t: any, i: number) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-full bg-blue-100 p-1 flex-shrink-0">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 leading-snug">{t.title}</p>
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t.type}</span>
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
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900">Your Calendar</h3>
        <p className="text-gray-500 text-sm">Track your practice history and upcoming interviews.</p>
      </div>

      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
        {loading ? (
           <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
        ) : events.length === 0 ? (
          <div>
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No events found for this month.</p>
          </div>
        ) : (
          <div className="text-left space-y-4 max-w-2xl mx-auto">
            {events.map(ev => (
              <div key={ev.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                <div className="bg-white border shadow-sm rounded-lg p-2 text-center min-w-[60px]">
                  <div className="text-xs font-bold text-red-500 uppercase">{new Date(ev.date).toLocaleString('default', { month: 'short' })}</div>
                  <div className="text-xl font-black text-gray-900">{new Date(ev.date).getDate().toString().padStart(2, '0')}</div>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900">{ev.title}</h4>
                  <p className="text-sm text-gray-500 capitalize">{ev.type}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${ev.completed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {ev.completed ? 'Completed' : 'Upcoming'}
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
        body: JSON.stringify({ title: newTitle, time: newTime, type: "custom", enabled: true, days: [1,2,3,4,5] })
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
    setReminders(reminders.map(r => r.id === id ? { ...r, enabled } : r));
    try {
      await fetch("/api/assistant/reminders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, enabled })
      });
    } catch (e) {
      setReminders(reminders.map(r => r.id === id ? { ...r, enabled: !enabled } : r));
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Smart Reminders</h3>
          <p className="text-gray-500 text-sm">Stay consistent with customizable practice nudges.</p>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 transition"
        >
          <Plus className="h-4 w-4" />
          Add Reminder
        </button>
      </div>

      {isCreating && (
        <form onSubmit={createReminder} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-500 mb-1">Title</label>
            <input required value={newTitle} onChange={e => setNewTitle(e.target.value)} type="text" className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none" placeholder="e.g. Daily Vocabulary Practice" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Time</label>
            <input required value={newTime} onChange={e => setNewTime(e.target.value)} type="time" className="rounded-xl border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none" />
          </div>
          <button type="submit" className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700">Save</button>
        </form>
      )}

      {loading ? (
         <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
      ) : (
        <div className="space-y-3 max-w-3xl">
          {reminders.map(reminder => (
            <div key={reminder.id} className="flex items-center justify-between p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${reminder.enabled ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <h4 className={`font-bold ${reminder.enabled ? 'text-gray-900' : 'text-gray-500'}`}>{reminder.title}</h4>
                  <p className="text-sm text-gray-500 font-medium">{reminder.time} • Weekdays</p>
                </div>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={reminder.enabled} onChange={(e) => toggleReminder(reminder.id, e.target.checked)} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
