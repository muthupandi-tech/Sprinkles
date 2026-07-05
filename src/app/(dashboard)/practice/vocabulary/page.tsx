"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Search, BookmarkPlus, Zap, CheckCircle2, Mic, Play, RefreshCw, Layers } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface VocabularyWord {
  id: string;
  word: string;
  meaning: string;
  pronunciation: string;
  partOfSpeech: string;
  synonyms: string[];
  exampleSentence: string;
}

export default function VocabularyPracticePage() {
  const router = useRouter();
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    async function loadWords() {
      try {
        const res = await fetch("/api/vocabulary/daily");
        const json = await res.json();
        if (json.success) {
          setWords(json.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadWords();
  }, []);

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + words.length) % words.length);
    }, 150);
  };

  const playAudio = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
        <RefreshCw className="h-8 w-8 animate-spin text-green-600" />
        <p className="text-gray-500 font-medium tracking-wide">Generating your daily vocabulary...</p>
      </div>
    );
  }

  if (words.length === 0) {
    return <div>No words available today. Check back tomorrow!</div>;
  }

  const currentWord = words[currentIndex];

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/practice" className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm transition-colors hover:bg-gray-50">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
              <BookOpen className="h-6 w-6 text-green-600" />
              <span>Vocabulary Builder</span>
            </h1>
            <p className="text-sm text-gray-500">Learn 5 new words today to elevate your communication.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/practice/vocabulary/bank" className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50">
            <Search className="h-4 w-4" /> Word Bank
          </Link>
          <Link href="/practice/vocabulary/quiz" className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-green-700">
            <Layers className="h-4 w-4" /> Take Quiz
          </Link>
        </div>
      </div>

      {/* Progress */}
      <div className="flex justify-center gap-2">
        {words.map((_, idx) => (
          <div key={idx} className={`h-1.5 w-12 rounded-full transition-colors ${idx === currentIndex ? 'bg-green-600' : 'bg-gray-200'}`} />
        ))}
      </div>

      {/* Flashcard Area */}
      <div className="relative mx-auto h-[400px] w-full max-w-2xl perspective-1000">
        <motion.div
          className="absolute h-full w-full cursor-pointer preserve-3d"
          animate={{ rotateX: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 260, damping: 20 }}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Front */}
          <div className="absolute flex h-full w-full flex-col items-center justify-center rounded-3xl border border-gray-100 bg-white p-8 shadow-md backface-hidden">
            <span className="absolute right-6 top-6 text-xs font-bold uppercase tracking-wider text-gray-400">Tap to flip</span>
            <h2 className="text-5xl font-extrabold text-gray-900">{currentWord.word}</h2>
            <p className="mt-4 text-lg font-medium text-green-600">/{currentWord.pronunciation}/</p>
            <span className="mt-2 rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-600">{currentWord.partOfSpeech}</span>
            <button 
              onClick={(e) => { e.stopPropagation(); playAudio(currentWord.word); }}
              className="mt-8 flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600 transition-colors hover:bg-green-100"
            >
              <Play className="h-6 w-6 ml-1" />
            </button>
          </div>

          {/* Back */}
          <div className="absolute flex h-full w-full flex-col justify-center rounded-3xl border border-gray-100 bg-gray-900 p-8 shadow-md backface-hidden rotate-x-180">
            <span className="absolute right-6 top-6 text-xs font-bold uppercase tracking-wider text-gray-400">Tap to flip</span>
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-green-400">Meaning</h3>
                <p className="mt-1 text-xl font-medium text-white">{currentWord.meaning}</p>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-green-400">Example</h3>
                <p className="mt-1 text-lg italic text-gray-300">&quot;{currentWord.exampleSentence}&quot;</p>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-green-400">Synonyms</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {currentWord.synonyms.map(syn => (
                    <span key={syn} className="rounded-md bg-gray-800 px-2 py-1 text-xs font-medium text-gray-300">{syn}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        <button onClick={handlePrev} className="rounded-xl border border-gray-200 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50">
          Previous
        </button>
        <button onClick={handleNext} className="rounded-xl border border-gray-200 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50">
          Next Word
        </button>
      </div>
    </div>
  );
}
