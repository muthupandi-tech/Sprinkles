"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Mic,
  BookOpen,
  Award,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Compass,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  } as const;

  const features = [
    {
      icon: <Mic className="text-primary h-6 w-6" />,
      title: "Real-time Pronunciation",
      description:
        "Speak directly into your browser and receive instant phonetic feedback on your accents and syllable pacing.",
    },
    {
      icon: <BookOpen className="text-primary h-6 w-6" />,
      title: "Vocabulary Expansion",
      description:
        "Learn context-aware idioms and vocabulary tailored for academic writing or corporate interview scenarios.",
    },
    {
      icon: <Compass className="text-primary h-6 w-6" />,
      title: "Mock Interview Prep",
      description:
        "Practice answering active behavioral questions and receive analytical guidance on answer structuring.",
    },
    {
      icon: <TrendingUp className="text-primary h-6 w-6" />,
      title: "Granular Analytics",
      description:
        "Monitor and display weekly progress logs across clarity, grammar correctness, speech speed, and confidence.",
    },
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/50 to-white py-24 sm:py-32">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-accent text-accent-foreground mb-6 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
            >
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              <span>AI-Powered Personal Mentor for Students</span>
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-4xl leading-none font-extrabold tracking-tight text-gray-900 sm:text-6xl"
            >
              Master spoken English with <span className="text-primary">Sprinkles</span>
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mt-6 text-lg leading-relaxed text-gray-600 sm:text-xl"
            >
              Build conversation confidence, elevate pronunciation, refine professional vocabulary,
              and ace interviews through personalized learning paths.
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-10 flex flex-col justify-center gap-4 sm:flex-row"
            >
              <Link
                href="/auth/signup"
                className="bg-primary hover:bg-primary-hover flex items-center justify-center gap-2 rounded-xl px-8 py-4 font-semibold text-white shadow-md transition-all hover:translate-y-[-1px] hover:shadow-lg"
              >
                <span>Start Practicing Free</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#features"
                className="flex items-center justify-center gap-1 rounded-xl border border-gray-200 bg-white px-8 py-4 font-semibold text-gray-700 transition-all hover:bg-gray-50"
              >
                <span>Explore Features</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-border-color border-y bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to speak fluently
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Sprinkles guides your verbal training step-by-step through interactive AI evaluations.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4"
          >
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="border-border-color shadow-premium flex flex-col items-start rounded-2xl border bg-white p-6 transition-all hover:shadow-md"
              >
                <div className="mb-4 rounded-xl bg-blue-50 p-3">{feature.icon}</div>
                <h3 className="mb-2 text-lg font-bold text-gray-900">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mentorship Section */}
      <section id="mentorship" className="bg-gradient-to-b from-white to-gray-50/50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="items-center lg:grid lg:grid-cols-2 lg:gap-16">
            <div className="max-w-xl">
              <span className="text-primary text-xs font-bold tracking-wider uppercase">
                Smart Curriculum Path
              </span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                A mentor that adapts to your spoken pace
              </h2>
              <p className="mt-4 leading-relaxed text-gray-600">
                {
                  "Sprinkles isn't just an AI sandbox. It acts as an active mentor, continuously evaluating your speech transcripts, noting persistent grammar gaps, recommending curated tasks, and scheduling lessons to build long-term confidence."
                }
              </p>
              <div className="mt-8 space-y-4">
                <div className="flex gap-3">
                  <CheckCircle2 className="text-primary h-5 w-5 shrink-0" />
                  <p className="text-sm font-medium text-gray-600">
                    Daily custom exercises matching your career goal
                  </p>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="text-primary h-5 w-5 shrink-0" />
                  <p className="text-sm font-medium text-gray-600">
                    Phoneme-level analysis on audio recordings
                  </p>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="text-primary h-5 w-5 shrink-0" />
                  <p className="text-sm font-medium text-gray-600">
                    Vocabulary reviews sync based on spaced repetition
                  </p>
                </div>
              </div>
            </div>

            <div className="relative mt-12 flex justify-center lg:mt-0">
              {/* Mock Dashboard Widget */}
              <div className="border-border-color relative z-10 w-full max-w-md rounded-2xl border bg-white p-6 shadow-xl">
                <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-500" />
                    <span className="text-sm font-bold text-gray-800">Active Coach Blueprint</span>
                  </div>
                  <span className="rounded bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
                    94% Mastery
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="mb-1 flex justify-between text-xs font-medium text-gray-500">
                      <span>Clarity & Intonation</span>
                      <span>85%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{ width: "85%" }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-xs font-medium text-gray-500">
                      <span>Grammar Accuracy</span>
                      <span>92%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{ width: "92%" }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-xs font-medium text-gray-500">
                      <span>Vocabulary Variety</span>
                      <span>72%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{ width: "72%" }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 border-t border-gray-100 pt-4">
                  <h4 className="mb-3 text-xs font-bold tracking-wider text-gray-400 uppercase">
                    Next Task Highlight
                  </h4>
                  <div className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/50 p-3 transition-all hover:bg-blue-50">
                    <div>
                      <h5 className="text-sm font-semibold text-gray-900">
                        30-Second Elevator Pitch
                      </h5>
                      <p className="mt-0.5 text-xs text-gray-500">
                        Focus area: Transition words & pause controls
                      </p>
                    </div>
                    <ChevronRight className="text-primary h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary relative overflow-hidden py-24 text-center text-white">
        <div className="via-primary absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500 to-blue-700 opacity-80" />
        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
            Ready to speak with total confidence?
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-100 sm:text-xl">
            Join thousands of student peers learning to structure responses, eliminate filler words,
            and speak fluently.
          </p>
          <div className="mt-10">
            <Link
              href="/auth/signup"
              className="text-primary inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-bold shadow-lg transition-all hover:bg-blue-50"
            >
              <span>Get Started Now</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
