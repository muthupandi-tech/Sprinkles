"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, XCircle, RefreshCw, Trophy, Target, AlertCircle } from "lucide-react";
import Link from "next/link";

interface Question {
  type: string;
  question: string;
  options?: string[];
  answer: string;
  wordId: string;
  difficulty?: string;
  category?: string;
}

export default function VocabularyQuizPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [answers, setAnswers] = useState<{ wordId: string; correct: boolean }[]>([]);

  const loadQuiz = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/vocabulary/quiz", {
        method: "POST",
        body: JSON.stringify({ action: "generate" }),
        headers: { "Content-Type": "application/json" }
      });
      const json = await res.json();
      
      if (res.ok && json.success) {
        setQuestions(json.quiz.questions);
      } else {
        setError(json.error || "We encountered an issue generating your personalized quiz.");
      }
    } catch (err: any) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQuiz();
  }, [loadQuiz]);

  const handleSelectOption = (opt: string) => {
    if (isSubmitted) return;
    setSelectedAnswer(opt);
  };

  const handleCheck = () => {
    if (!selectedAnswer) return;
    const currentQ = questions[currentIndex];
    // Simple case-insensitive comparison to be more forgiving for fill-in-the-blank
    const correct = selectedAnswer.trim().toLowerCase() === currentQ.answer.trim().toLowerCase();
    setAnswers((prev) => [...prev, { wordId: currentQ.wordId, correct }]);
    setIsSubmitted(true);
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsSubmitted(false);
    } else {
      // Finish Quiz
      const score = answers.filter((a) => a.correct).length;
      await fetch("/api/vocabulary/quiz", {
        method: "POST",
        body: JSON.stringify({
          action: "submit",
          score,
          totalQuestions: questions.length,
          quizData: { answers },
        }),
        headers: { "Content-Type": "application/json" }
      });
      router.push("/practice/vocabulary");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
        <div className="relative">
          <RefreshCw className="h-10 w-10 animate-spin text-indigo-600" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-4 w-4 bg-white rounded-full"></div>
          </div>
        </div>
        <p className="font-medium text-gray-600 animate-pulse">Designing your personalized quiz...</p>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center max-w-md mx-auto">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <AlertCircle className="h-10 w-10 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Quiz Generation Failed</h2>
        <p className="mb-6 text-gray-500">{error || "No questions could be generated."}</p>
        <div className="flex gap-4">
          <Link
            href="/practice/vocabulary"
            className="rounded-xl border border-gray-200 px-6 py-2.5 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Go Back
          </Link>
          <button
            onClick={loadQuiz}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <RefreshCw className="h-4 w-4" /> Try Again
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  // More forgiving check for visual indication
  const isCorrect = selectedAnswer && currentQ.answer && selectedAnswer.trim().toLowerCase() === currentQ.answer.trim().toLowerCase();

  return (
    <div className="mx-auto max-w-2xl space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/practice/vocabulary"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border border-gray-100 transition-colors hover:bg-gray-50"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <div className="flex justify-between items-end mb-2">
            <h1 className="text-xl font-bold text-gray-900">Vocabulary Quiz</h1>
            <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>
          {/* Progress */}
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
              style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        
        {/* Meta badges (difficulty, category) if provided by AI */}
        {(currentQ.difficulty || currentQ.category) && (
           <div className="flex gap-2 mb-4">
             {currentQ.difficulty && (
               <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-1 rounded">
                 {currentQ.difficulty}
               </span>
             )}
             {currentQ.category && (
               <span className="text-xs font-bold uppercase tracking-wider text-blue-500 bg-blue-50 px-2 py-1 rounded">
                 {currentQ.category}
               </span>
             )}
           </div>
        )}

        <h2 className="mb-8 text-2xl leading-relaxed font-bold text-gray-900">
          {currentQ.question}
        </h2>

        {currentQ.type === "multiple_choice" || currentQ.type === "matching" ? (
          <div className="grid grid-cols-1 gap-3">
            {currentQ.options?.map((opt, idx) => {
              const isThisOptionCorrect = opt.trim().toLowerCase() === currentQ.answer.trim().toLowerCase();
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(opt)}
                  disabled={isSubmitted}
                  className={`w-full rounded-xl border-2 p-4 text-left font-medium transition-all ${
                    selectedAnswer === opt
                      ? isSubmitted
                        ? isCorrect
                          ? "border-green-500 bg-green-50 text-green-700 shadow-sm"
                          : "border-red-500 bg-red-50 text-red-700 shadow-sm"
                        : "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm"
                      : isSubmitted && isThisOptionCorrect
                        ? "border-green-500 bg-green-50 text-green-700 shadow-sm" // Reveal correct answer
                        : "border-gray-100 hover:border-indigo-200 hover:bg-slate-50 text-gray-700"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        ) : (
          <input
            type="text"
            value={selectedAnswer || ""}
            onChange={(e) => !isSubmitted && setSelectedAnswer(e.target.value)}
            disabled={isSubmitted}
            className={`w-full rounded-xl border-2 p-4 outline-none font-medium ${
              isSubmitted 
                ? (isCorrect ? "border-green-500 bg-green-50 text-green-700" : "border-red-500 bg-red-50 text-red-700") 
                : "border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            }`}
            placeholder="Type your answer here..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && selectedAnswer && !isSubmitted) {
                handleCheck();
              }
            }}
          />
        )}
      </div>

      {/* Feedback & Actions */}
      <div className="h-24">
        {isSubmitted ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-4">
              {isCorrect ? (
                <div className="bg-green-100 p-2 rounded-full">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
              ) : (
                <div className="bg-red-100 p-2 rounded-full">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              )}
              <div>
                <p className={`font-bold text-lg ${isCorrect ? "text-green-700" : "text-red-700"}`}>
                  {isCorrect ? "Excellent!" : "Not quite right."}
                </p>
                {!isCorrect && (
                  <p className="text-sm text-gray-600 mt-1">
                    Correct Answer:{" "}
                    <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">{currentQ.answer}</span>
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleNext}
              className="rounded-xl bg-gray-900 px-8 py-3 font-bold text-white hover:bg-gray-800 transition-colors shadow-sm whitespace-nowrap"
            >
              {currentIndex < questions.length - 1 ? "Next Question" : "Finish Quiz"}
            </button>
          </div>
        ) : (
          <div className="flex justify-end">
            <button
              onClick={handleCheck}
              disabled={!selectedAnswer}
              className={`rounded-xl px-10 py-3.5 font-bold text-white transition-all ${
                selectedAnswer 
                  ? "bg-indigo-600 shadow-md hover:bg-indigo-700 hover:scale-105" 
                  : "cursor-not-allowed bg-gray-200 text-gray-400"
              }`}
            >
              Check Answer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
