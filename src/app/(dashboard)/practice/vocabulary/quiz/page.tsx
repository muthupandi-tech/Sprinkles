"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, XCircle, RefreshCw, Trophy, Target } from "lucide-react";
import Link from "next/link";

interface Question {
  type: string;
  question: string;
  options?: string[];
  answer: string;
  wordId: string;
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

  useEffect(() => {
    async function loadQuiz() {
      try {
        const res = await fetch("/api/vocabulary/quiz", {
          method: "POST",
          body: JSON.stringify({ action: "generate" }),
        });
        const json = await res.json();
        if (json.success) {
          setQuestions(json.quiz.questions);
        } else {
          setError(json.error || "Failed to load quiz.");
        }
      } catch (err) {
        setError("Network error.");
      } finally {
        setLoading(false);
      }
    }
    loadQuiz();
  }, []);

  const handleSelectOption = (opt: string) => {
    if (isSubmitted) return;
    setSelectedAnswer(opt);
  };

  const handleCheck = () => {
    if (!selectedAnswer) return;
    const currentQ = questions[currentIndex];
    const correct = selectedAnswer === currentQ.answer;
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
      });
      router.push("/practice/vocabulary");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
        <RefreshCw className="h-8 w-8 animate-spin text-green-600" />
        <p className="font-medium text-gray-500">Generating your personalized quiz...</p>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center">
        <Target className="mb-4 h-12 w-12 text-gray-300" />
        <p className="mb-4 text-gray-500">{error || "No questions generated."}</p>
        <Link
          href="/practice/vocabulary"
          className="rounded-xl bg-gray-900 px-4 py-2 font-semibold text-white"
        >
          Back to Vocab
        </Link>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const isCorrect = selectedAnswer === currentQ.answer;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/practice/vocabulary"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm transition-colors hover:bg-gray-50"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Vocabulary Quiz</h1>
          <p className="text-sm text-gray-500">
            Question {currentIndex + 1} of {questions.length}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full bg-green-500 transition-all duration-300"
          style={{ width: `${(currentIndex / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <h2 className="mb-6 text-2xl leading-relaxed font-bold text-gray-900">
          {currentQ.question}
        </h2>

        {currentQ.type === "multiple_choice" || currentQ.type === "matching" ? (
          <div className="space-y-3">
            {currentQ.options?.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectOption(opt)}
                disabled={isSubmitted}
                className={`w-full rounded-xl border p-4 text-left transition-all ${
                  selectedAnswer === opt
                    ? isSubmitted
                      ? isCorrect
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-red-500 bg-red-50 text-red-700"
                      : "border-blue-500 bg-blue-50 text-blue-700"
                    : isSubmitted && opt === currentQ.answer
                      ? "border-green-500 bg-green-50 text-green-700" // Reveal correct answer
                      : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        ) : (
          <input
            type="text"
            value={selectedAnswer || ""}
            onChange={(e) => !isSubmitted && setSelectedAnswer(e.target.value)}
            disabled={isSubmitted}
            className={`w-full rounded-xl border p-4 outline-none ${isSubmitted ? (isCorrect ? "border-green-500 bg-green-50 text-green-700" : "border-red-500 bg-red-50 text-red-700") : "focus:border-blue-500 focus:ring-1 focus:ring-blue-500"}`}
            placeholder="Type your answer here..."
          />
        )}
      </div>

      {/* Feedback & Actions */}
      <div className="h-24">
        {isSubmitted ? (
          <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              {isCorrect ? (
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              ) : (
                <XCircle className="h-8 w-8 text-red-500" />
              )}
              <div>
                <p className={`font-bold ${isCorrect ? "text-green-600" : "text-red-600"}`}>
                  {isCorrect ? "Excellent!" : "Not quite right."}
                </p>
                {!isCorrect && (
                  <p className="text-sm text-gray-500">
                    Correct Answer:{" "}
                    <span className="font-semibold text-gray-900">{currentQ.answer}</span>
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleNext}
              className="rounded-xl bg-gray-900 px-6 py-3 font-semibold text-white hover:bg-gray-800"
            >
              {currentIndex < questions.length - 1 ? "Continue" : "Finish Quiz"}
            </button>
          </div>
        ) : (
          <div className="flex justify-end">
            <button
              onClick={handleCheck}
              disabled={!selectedAnswer}
              className={`rounded-xl px-8 py-3 font-bold text-white transition-colors ${selectedAnswer ? "bg-green-600 shadow-md hover:bg-green-700" : "cursor-not-allowed bg-gray-300"}`}
            >
              Check
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
