"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Sun,
  Moon,
  Monitor,
  Bell,
  Lock,
  LogOut,
  CheckCircle,
  AlertCircle,
  Save,
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { signOut } from "@/app/auth/actions";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    dailyReminder: true,
    weeklyReport: true,
    accentFeedback: false,
    newMissions: true,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Notification preferences saved successfully!");
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    toast.success("Password updated successfully!");
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-extrabold tracking-tight text-gray-900">
          <Settings className="h-8 w-8 text-blue-600" />
          <span>System Settings</span>
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your interface theme, email reminders, security passwords, and session actions.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Card 1: Theme preferences */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <h2 className="flex items-center gap-1.5 border-b border-gray-50 pb-2 text-sm font-bold tracking-wider text-gray-400 uppercase">
            <Sun className="h-4.5 w-4.5" />
            <span>Theme Preferences</span>
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "light", label: "Light", icon: Sun },
              { id: "dark", label: "Dark", icon: Moon },
              { id: "system", label: "System", icon: Monitor },
            ].map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  onClick={() => setTheme(opt.id as "light" | "dark" | "system")}
                  className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border p-4 transition-all ${
                    theme === opt.id
                      ? "border-blue-600 bg-blue-50/30 text-blue-600"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-bold">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Card 2: Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <h2 className="flex items-center gap-1.5 border-b border-gray-50 pb-2 text-sm font-bold tracking-wider text-gray-400 uppercase">
            <Bell className="h-4.5 w-4.5" />
            <span>Notification Checklist</span>
          </h2>

          <form onSubmit={handleSaveNotifications} className="space-y-4">
            <div className="space-y-3">
              {[
                {
                  key: "dailyReminder",
                  label: "Daily reminder prompts",
                  desc: "Get reminded at your study time to keep up streaks.",
                },
                {
                  key: "weeklyReport",
                  label: "Weekly progress analysis report",
                  desc: "Receive an email detailing vocabulary growth and speech ratings.",
                },
                {
                  key: "accentFeedback",
                  label: "Pronunciation enunciation alerts",
                  desc: "Get notifications when the coach discovers phoneme enunciation errors.",
                },
                {
                  key: "newMissions",
                  label: "New daily mission notifications",
                  desc: "Get notified when the mission list refreshes each morning.",
                },
              ].map((notif) => (
                <div
                  key={notif.key}
                  onClick={() => handleNotificationChange(notif.key as keyof typeof notifications)}
                  className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-3 transition-all hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={notifications[notif.key as keyof typeof notifications]}
                    onChange={() => {}} // Controlled via parent card click
                    className="mt-0.5 shrink-0 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-gray-800">{notif.label}</h4>
                    <p className="mt-0.5 text-[10px] text-gray-400">{notif.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md transition-colors hover:bg-blue-700"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Notification Settings</span>
              </button>
            </div>
          </form>
        </motion.div>

        {/* Card 3: Change Password */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <h2 className="flex items-center gap-1.5 border-b border-gray-50 pb-2 text-sm font-bold tracking-wider text-gray-400 uppercase">
            <Lock className="h-4.5 w-4.5" />
            <span>Update Password</span>
          </h2>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-500">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-medium transition-all focus:border-blue-500 focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-500">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-medium transition-all focus:border-blue-500 focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-500">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-medium transition-all focus:border-blue-500 focus:bg-white focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md transition-colors hover:bg-blue-700"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>Change Password</span>
              </button>
            </div>
          </form>
        </motion.div>

        {/* Card 4: Log out */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-red-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center"
        >
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <LogOut className="h-4.5 w-4.5 text-red-600" />
              <span>Log out of Session</span>
            </h3>
            <p className="mt-1 text-xs text-gray-400">
              Terminate your active cookie session on this browser.
            </p>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-100"
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
