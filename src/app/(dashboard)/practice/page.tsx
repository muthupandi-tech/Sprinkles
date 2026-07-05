"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, BookOpen, Award, Compass, ArrowRight, X, Play, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface PracticeModule {
  id: string;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estTime: string;
  color: string;
  outlineColor: string;
  bubbleColor: string;
  sandboxContent: {
    prompt: string;
    instructions: string[];
    sampleText?: string;
  };
}

export default function PracticeCenterPage() {
  const [selectedModule, setSelectedModule] = useState<PracticeModule | null>(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  const modules: PracticeModule[] = [
    {
      id: "speech",
      title: "Speech Practice",
      desc: "Speak freely on a situational prompt. The coach will analyze your speech speed, sentence flow, filler words, and delivery pacing.",
      icon: Mic,
      difficulty: "Intermediate",
      estTime: "2-3 mins",
      color: "from-blue-500 to-indigo-600 text-white",
      outlineColor: "border-blue-100 hover:border-blue-300",
      bubbleColor: "bg-blue-50 text-blue-600",
      sandboxContent: {
        prompt: "Describe your favorite software application and why you enjoy using it.",
        instructions: [
          "Speak clearly into your microphone.",
          "Aim for a speech length of 60 to 90 seconds.",
          "Try to minimize the use of filler words such as 'uh', 'like', or 'um'.",
        ],
        sampleText:
          "I really enjoy using VS Code because of its massive extension marketplace. The customization options are endless...",
      },
    },
    {
      id: "pronunciation",
      title: "Pronunciation Drills",
      desc: "Read challenging phonemes, diphthongs, and consonant transitions. Ideal for resolving accent clarity issues and mother-tongue influence.",
      icon: Compass,
      difficulty: "Beginner",
      estTime: "1-2 mins",
      color: "from-orange-500 to-red-600 text-white",
      outlineColor: "border-orange-100 hover:border-orange-300",
      bubbleColor: "bg-orange-50 text-orange-600",
      sandboxContent: {
        prompt:
          "Practice clean enunciation on challenging consonant pairs: 'Th', 'V' vs 'W', and end-plosives.",
        instructions: [
          "Enunciate: 'The enthusiastic weather reporter verified the windy conditions precisely.'",
          "Ensure your teeth touch your bottom lip for the 'V' sound.",
          "Round your lips fully for the 'W' sound.",
        ],
      },
    },
    {
      id: "vocabulary",
      title: "Vocabulary SRS Deck",
      desc: "Learn high-utility academic, professional, and descriptive keywords using Spaced Repetition (SRS) flashcards.",
      icon: BookOpen,
      difficulty: "Intermediate",
      estTime: "5 mins",
      color: "from-green-500 to-emerald-600 text-white",
      outlineColor: "border-green-100 hover:border-green-300",
      bubbleColor: "bg-green-50 text-green-600",
      sandboxContent: {
        prompt:
          "Review vocabulary: 'Pragmatic', 'Meticulous', 'Eloquent', 'Articulate', 'Exemplary'.",
        instructions: [
          "Flip each card to reveal the definition, synonyms, and context usage.",
          "Rate your recall speed (Easy, Good, Hard, Again) to schedule the next review timer.",
          "Aim to learn at least 5 new words daily.",
        ],
      },
    },
    {
      id: "interview",
      title: "Mock Interview Prep",
      desc: "Complete a structured, situational behavior mock interview based on common targets for engineering roles.",
      icon: Award,
      difficulty: "Advanced",
      estTime: "10 mins",
      color: "from-red-500 to-rose-600 text-white",
      outlineColor: "border-red-100 hover:border-red-300",
      bubbleColor: "bg-red-50 text-red-600",
      sandboxContent: {
        prompt: "Mock Interview: Behavioral Questions (STAR Method).",
        instructions: [
          "The system will read a behavioral question aloud.",
          "Frame your response using the Situation, Task, Action, and Result (STAR) framework.",
          "Record your answer. The coach will rate your structuring and content confidence.",
        ],
        sampleText:
          "Question 1: 'Tell me about a time when you had to resolve a conflict within your project team.'",
      },
    },
  ];

  const router = useRouter();

  const handleStartSession = () => {
    if (selectedModule?.id === "speech") {
      router.push("/practice/speech");
    } else if (selectedModule?.id === "interview") {
      router.push("/practice/interview");
    } else {
      setSessionActive(true);
    }
  };

  const handleCompleteSession = () => {
    setSessionActive(false);
    setSessionCompleted(true);
  };

  const handleCloseModal = () => {
    setSelectedModule(null);
    setSessionActive(false);
    setSessionCompleted(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-extrabold tracking-tight text-gray-900">
          <Mic className="h-8 w-8 text-blue-600" />
          <span>Practice Center</span>
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Select a learning module below to practice speaking, pronunciation, vocabulary, or mock
          interviews.
        </p>
      </div>

      {/* Grid: Practice Modules */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {modules.map((mod) => {
          const Icon = mod.icon;
          return (
            <motion.div
              key={mod.id}
              whileHover={{ y: -4 }}
              onClick={() => setSelectedModule(mod)}
              className={`flex cursor-pointer flex-col justify-between rounded-2xl border bg-white p-6 shadow-sm transition-all ${mod.outlineColor}`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${mod.bubbleColor}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500 uppercase">
                      {mod.difficulty}
                    </span>
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600 uppercase">
                      {mod.estTime}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-gray-900">{mod.title}</h3>
                  <p className="text-xs leading-relaxed text-gray-500">{mod.desc}</p>
                </div>
              </div>

              <div className="group mt-6 flex items-center gap-1 text-xs font-bold text-blue-600">
                <span>Start Training</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Module Sandbox Modal */}
      <AnimatePresence>
        {selectedModule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-xl overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl"
            >
              {/* Modal Header */}
              <div
                className={`bg-gradient-to-r px-6 py-5 ${selectedModule.color} flex items-center justify-between`}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-white/10 p-2">
                    <selectedModule.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white">{selectedModule.title}</h3>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="cursor-pointer rounded-full p-1.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="space-y-6 p-6">
                {!sessionActive && !sessionCompleted ? (
                  /* State 1: Intro / Instructions */
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h4 className="text-sm font-bold tracking-wider text-gray-400 uppercase">
                        Instructions
                      </h4>
                      <ul className="space-y-2.5">
                        {selectedModule.sandboxContent.instructions.map((inst, idx) => (
                          <li
                            key={idx}
                            className="flex gap-2 text-xs leading-relaxed text-gray-600"
                          >
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[10px] font-bold text-blue-600">
                              {idx + 1}
                            </span>
                            <span>{inst}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={handleStartSession}
                      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-blue-700"
                    >
                      <Play className="h-4 w-4 fill-current" />
                      <span>Start Practice Session</span>
                    </button>
                  </div>
                ) : sessionActive ? (
                  /* State 2: Active Practice Session Mockup */
                  <div className="space-y-6 py-6 text-center">
                    <div className="space-y-3">
                      <div className="mx-auto flex h-14 w-14 animate-pulse items-center justify-center rounded-full border border-red-100 bg-red-50 text-red-600">
                        <Mic className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-gray-900">Active Practice Area</h4>
                        <p className="text-xs text-gray-500">
                          Practice speaking into your microphone now...
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-left">
                      <p className="mb-2 text-xs font-bold tracking-wider text-gray-400 uppercase">
                        Prompt
                      </p>
                      <p className="text-sm leading-relaxed font-semibold text-gray-800">
                        {selectedModule.sandboxContent.prompt}
                      </p>
                      {selectedModule.sandboxContent.sampleText && (
                        <div className="mt-4 border-t border-gray-200/50 pt-3">
                          <p className="mb-1 text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                            Example Template
                          </p>
                          <p className="text-xs leading-relaxed text-gray-500 italic">
                            &quot;{selectedModule.sandboxContent.sampleText}&quot;
                          </p>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleCompleteSession}
                      className="w-full cursor-pointer rounded-xl bg-red-600 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-red-700"
                    >
                      Finish and Generate AI Analysis
                    </button>
                  </div>
                ) : (
                  /* State 3: Completed Session Mockup */
                  <div className="space-y-6 py-4 text-center">
                    <div className="space-y-2">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-green-100 bg-green-50 text-green-600">
                        <CheckCircle className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-gray-900">Analysis Complete!</h4>
                        <p className="text-xs text-gray-500">
                          Your practice scores have been synced to the dashboard.
                        </p>
                      </div>
                    </div>

                    {/* Mock Feedback Stats */}
                    <div className="grid grid-cols-3 gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">Pacing Score</p>
                        <h5 className="mt-0.5 text-lg font-extrabold text-blue-600">85%</h5>
                      </div>
                      <div className="border-x border-gray-200">
                        <p className="text-[9px] font-bold text-gray-400 uppercase">
                          Fluency Score
                        </p>
                        <h5 className="mt-0.5 text-lg font-extrabold text-blue-600">78%</h5>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">Filler Words</p>
                        <h5 className="mt-0.5 text-lg font-extrabold text-red-500">3 counts</h5>
                      </div>
                    </div>

                    <button
                      onClick={handleCloseModal}
                      className="w-full cursor-pointer rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-blue-700"
                    >
                      Return to Practice Center
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
