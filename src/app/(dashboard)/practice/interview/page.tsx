"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Briefcase, FileText, Loader2, PlayCircle, Target, Users } from "lucide-react";
import Link from "next/link";

const COMPANIES = ["TCS", "Infosys", "Wipro", "Cognizant", "Accenture", "Zoho", "Amazon", "Microsoft", "Google"];
const INTERVIEW_TYPES = [
  { id: "HR", name: "HR Interview", icon: Users },
  { id: "Technical", name: "Technical Interview", icon: Briefcase },
  { id: "Behavioral", name: "Behavioral Interview", icon: Target },
];

export default function MockInterviewSetupPage() {
  const router = useRouter();
  const [selectedCompany, setSelectedCompany] = useState(COMPANIES[0]);
  const [customCompany, setCustomCompany] = useState("");
  const [selectedType, setSelectedType] = useState(INTERVIEW_TYPES[0].id);
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    const companyToUse = selectedCompany === "Custom" ? customCompany : selectedCompany;
    try {
      const res = await fetch("/api/interview/init", {
        method: "POST",
        body: JSON.stringify({
          company: companyToUse,
          interviewType: selectedType,
          resumeContext: resumeText || undefined,
        })
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/practice/interview/session/${data.sessionId}`);
      } else {
        alert("Failed to start session");
        setLoading(false);
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/practice" className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm transition-colors hover:bg-gray-50">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Mock Interview</h1>
          <p className="text-sm text-gray-500">Prepare for placements with realistic, AI-driven interviews.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left Column: Form */}
        <div className="space-y-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          {/* Company Selection */}
          <div>
            <label className="mb-2 block text-sm font-bold text-gray-900">Target Company</label>
            <select 
              value={selectedCompany} 
              onChange={e => setSelectedCompany(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm focus:border-blue-500 focus:ring-blue-500 outline-none"
            >
              {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
              <option value="Custom">Other (Custom)</option>
            </select>
            {selectedCompany === "Custom" && (
              <input 
                type="text" 
                placeholder="Enter company name..."
                value={customCompany}
                onChange={e => setCustomCompany(e.target.value)}
                className="mt-3 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm focus:border-blue-500 outline-none"
              />
            )}
          </div>

          {/* Interview Type */}
          <div>
            <label className="mb-2 block text-sm font-bold text-gray-900">Interview Type</label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {INTERVIEW_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-4 text-center transition-all ${selectedType === type.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:bg-gray-50 text-gray-600'}`}
                >
                  <type.icon className="h-6 w-6" />
                  <span className="text-xs font-semibold">{type.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Resume Upload / Text */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-900">
              <FileText className="h-4 w-4" /> Resume Context (Optional)
            </label>
            <p className="mb-2 text-xs text-gray-500">Paste key sections of your resume (skills, projects) so the AI can ask personalized questions.</p>
            <textarea 
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
              placeholder="e.g. Developed a full-stack React application with Node.js and MongoDB..."
              rows={5}
              className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Right Column: Information & Start */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-blue-900">Ready to begin?</h2>
            <p className="mt-2 text-sm text-blue-800">
              The AI will conduct a 5-question interview based on your selections. Ensure you are in a quiet room and your microphone is ready.
            </p>
            <ul className="mt-6 space-y-3">
              <li className="flex items-center gap-2 text-sm text-blue-900 font-medium"><div className="h-2 w-2 rounded-full bg-blue-500" /> Audio recording enabled</li>
              <li className="flex items-center gap-2 text-sm text-blue-900 font-medium"><div className="h-2 w-2 rounded-full bg-blue-500" /> Real-time feedback generation</li>
              <li className="flex items-center gap-2 text-sm text-blue-900 font-medium"><div className="h-2 w-2 rounded-full bg-blue-500" /> Strict professional persona</li>
            </ul>
            <button
              onClick={handleStart}
              disabled={loading || (selectedCompany === "Custom" && !customCompany)}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 font-bold text-white shadow-md transition-all hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> Preparing Interview...</>
              ) : (
                <><PlayCircle className="h-5 w-5" /> Start Interview</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
