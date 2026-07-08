"use client";

import { useEffect, useState } from "react";
import { Bell, Clock, Loader2 } from "lucide-react";
import Link from "next/link";

export function RemindersWidget() {
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReminders() {
      try {
        const res = await fetch("/api/assistant/reminders");
        const data = await res.json();
        if (data.success) {
          setReminders(data.reminders.filter((r: any) => r.enabled).slice(0, 3));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadReminders();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
          <Bell className="h-5 w-5 text-indigo-600" />
          <span>Active Reminders</span>
        </h2>
        <div className="flex justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative space-y-4 overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="pointer-events-none absolute top-0 right-0 p-4 opacity-5">
        <Bell className="h-24 w-24" />
      </div>
      <div className="relative z-10">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <Bell className="h-5 w-5 text-indigo-600" />
            <span>Active Reminders</span>
          </h2>
          <Link href="/assistant" className="text-xs font-bold text-indigo-600 hover:underline">
            Manage
          </Link>
        </div>

        {reminders.length === 0 ? (
          <p className="text-xs text-gray-400">No active reminders set.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {reminders.map((reminder, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{reminder.title}</p>
                  <p className="text-xs font-medium text-gray-500">{reminder.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
