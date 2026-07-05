"use client";

import { useEffect, useState, useTransition } from "react";
import { motion } from "framer-motion";
import {
  User,
  GraduationCap,
  Briefcase,
  Globe,
  Settings,
  Save,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { getStudentProfile, saveStudentProfile, ProfileData } from "@/app/actions/profile";

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Load profile properties
  useEffect(() => {
    async function loadData() {
      const res = await getStudentProfile();
      if (res.success && res.profile) {
        setProfile({
          fullName: res.profile.fullName || "",
          college: res.profile.college || "",
          department: res.profile.department || "",
          yearOfStudy: res.profile.yearOfStudy || "3rd Year",
          careerGoal: res.profile.careerGoal || "",
          targetCompany: res.profile.targetCompany || "",
          englishProficiency: res.profile.englishProficiency || "Intermediate",
          preferredAccent: res.profile.preferredAccent || "Indian",
          dailyPracticeGoal: res.profile.dailyPracticeGoal || 15,
        });
      } else {
        setError(res.error || "Failed to load profile.");
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        [name]: name === "dailyPracticeGoal" ? Number(value) : value,
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        const res = await saveStudentProfile(profile);
        if (res.success) {
          setSuccess("Profile settings updated successfully!");
          // Auto clear success indicator after 3 seconds
          setTimeout(() => setSuccess(null), 3000);
        } else {
          setError(res.error || "Failed to save profile changes.");
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "An unexpected error occurred.";
        setError(message);
      }
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm font-semibold text-gray-500">Loading student profile...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-extrabold tracking-tight text-gray-900">
          <Settings className="h-8 w-8 text-blue-600" />
          <span>Student Profile</span>
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Customize your career goals, accent targets, and vocabulary targets to optimize your AI
          coach settings.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-2xl border border-green-100 bg-green-50 p-4 text-sm text-green-700 shadow-sm">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <p className="font-medium">{success}</p>
        </div>
      )}

      {profile && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Left Card: Avatar & Overview */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-between rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm md:col-span-1"
            >
              <div className="flex flex-col items-center space-y-4">
                {/* Profile Pic Placeholder */}
                <div className="relative">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-blue-100 text-3xl font-extrabold text-blue-600 shadow-md">
                    {profile.fullName.charAt(0).toUpperCase() || "S"}
                  </div>
                  <div className="absolute right-0 bottom-0 rounded-full border-2 border-white bg-blue-600 p-1.5 text-white shadow-sm">
                    <Sparkles className="h-4.5 w-4.5" />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {profile.fullName || "Student"}
                  </h3>
                  <p className="mt-0.5 text-xs font-semibold tracking-wider text-blue-600 uppercase">
                    {profile.englishProficiency} level
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    {profile.preferredAccent} Accent target
                  </p>
                </div>
              </div>

              {/* Stat Briefs */}
              <div className="mt-6 w-full space-y-3 border-t border-gray-50 pt-4 text-left">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-gray-400">Daily Goal</span>
                  <span className="font-bold text-gray-800">{profile.dailyPracticeGoal} mins</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-gray-400">Target Company</span>
                  <span className="font-bold text-gray-800">
                    {profile.targetCompany || "Not Set"}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Right Card: Form Details */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="space-y-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:col-span-2"
            >
              {/* Section 1: Basic Information */}
              <div className="space-y-4">
                <h2 className="flex items-center gap-1.5 border-b border-gray-50 pb-2 text-sm font-bold tracking-wider text-gray-400 uppercase">
                  <User className="h-4 w-4" />
                  <span>Basic Information</span>
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-500">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={profile.fullName}
                      onChange={handleChange}
                      placeholder="Enter full name"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm font-medium transition-all focus:border-blue-500 focus:bg-white focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-500">
                      Daily Practice Goal (minutes)
                    </label>
                    <input
                      type="number"
                      name="dailyPracticeGoal"
                      value={profile.dailyPracticeGoal}
                      onChange={handleChange}
                      min="5"
                      max="120"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm font-medium transition-all focus:border-blue-500 focus:bg-white focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: College & Academic Info */}
              <div className="space-y-4">
                <h2 className="flex items-center gap-1.5 border-b border-gray-50 pb-2 text-sm font-bold tracking-wider text-gray-400 uppercase">
                  <GraduationCap className="h-4.5 w-4.5" />
                  <span>Academics</span>
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs font-semibold text-gray-500">
                      College
                    </label>
                    <input
                      type="text"
                      name="college"
                      value={profile.college}
                      onChange={handleChange}
                      placeholder="e.g. National Engineering College"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm font-medium transition-all focus:border-blue-500 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-500">
                      Year of Study
                    </label>
                    <select
                      name="yearOfStudy"
                      value={profile.yearOfStudy}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm font-medium transition-all focus:border-blue-500 focus:bg-white focus:outline-none"
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="Postgraduate">Postgraduate</option>
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="mb-1.5 block text-xs font-semibold text-gray-500">
                      Department
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={profile.department}
                      onChange={handleChange}
                      placeholder="e.g. Computer Science and Engineering"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm font-medium transition-all focus:border-blue-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Career Aspirations */}
              <div className="space-y-4">
                <h2 className="flex items-center gap-1.5 border-b border-gray-50 pb-2 text-sm font-bold tracking-wider text-gray-400 uppercase">
                  <Briefcase className="h-4 w-4" />
                  <span>Career Aspirations</span>
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-500">
                      Career Goal
                    </label>
                    <input
                      type="text"
                      name="careerGoal"
                      value={profile.careerGoal}
                      onChange={handleChange}
                      placeholder="e.g. Product Manager, Software Developer"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm font-medium transition-all focus:border-blue-500 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-500">
                      Target Company
                    </label>
                    <input
                      type="text"
                      name="targetCompany"
                      value={profile.targetCompany}
                      onChange={handleChange}
                      placeholder="e.g. Google, Microsoft"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm font-medium transition-all focus:border-blue-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: English targets */}
              <div className="space-y-4">
                <h2 className="flex items-center gap-1.5 border-b border-gray-50 pb-2 text-sm font-bold tracking-wider text-gray-400 uppercase">
                  <Globe className="h-4 w-4" />
                  <span>Coach Settings</span>
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-500">
                      English Proficiency Level
                    </label>
                    <select
                      name="englishProficiency"
                      value={profile.englishProficiency}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm font-medium transition-all focus:border-blue-500 focus:bg-white focus:outline-none"
                    >
                      <option value="Beginner">Beginner (Basic grammar & expressions)</option>
                      <option value="Intermediate">Intermediate (Normal daily conversation)</option>
                      <option value="Advanced">Advanced (Professional & interview prep)</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-500">
                      Preferred Accent Coaching
                    </label>
                    <select
                      name="preferredAccent"
                      value={profile.preferredAccent}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm font-medium transition-all focus:border-blue-500 focus:bg-white focus:outline-none"
                    >
                      <option value="American">American Accent</option>
                      <option value="British">British Accent</option>
                      <option value="Indian">Indian Accent</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="mt-6 flex justify-end gap-3 border-t border-gray-50 pt-4">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-colors hover:bg-blue-700 disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </form>
      )}
    </div>
  );
}
