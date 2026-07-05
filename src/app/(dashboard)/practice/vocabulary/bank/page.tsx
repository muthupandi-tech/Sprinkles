"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Search, Bookmark, BookmarkPlus, Play, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface UserVocab {
  id: string;
  isBookmarked: boolean;
  masteryLevel: number;
  word: {
    id: string;
    word: string;
    meaning: string;
    pronunciation: string;
    partOfSpeech: string;
    exampleSentence: string;
  };
}

export default function VocabularyBankPage() {
  const [vocabList, setVocabList] = useState<UserVocab[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "bookmarked" | "mastered">("all");

  useEffect(() => {
    async function loadBank() {
      try {
        const res = await fetch("/api/vocabulary/bank");
        const json = await res.json();
        if (json.success) {
          setVocabList(json.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadBank();
  }, []);

  const toggleBookmark = async (vocabId: string, currentStatus: boolean) => {
    // Optimistic UI update
    setVocabList(prev => prev.map(v => v.id === vocabId ? { ...v, isBookmarked: !currentStatus } : v));
    
    try {
      await fetch("/api/vocabulary/bookmark", {
        method: "PATCH",
        body: JSON.stringify({ userVocabId: vocabId, isBookmarked: !currentStatus })
      });
    } catch (e) {
      // Revert on error
      setVocabList(prev => prev.map(v => v.id === vocabId ? { ...v, isBookmarked: currentStatus } : v));
    }
  };

  const playAudio = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  const filteredList = vocabList.filter(v => {
    if (filter === "bookmarked" && !v.isBookmarked) return false;
    if (filter === "mastered" && v.masteryLevel < 5) return false;
    if (searchQuery) {
      return v.word.word.toLowerCase().includes(searchQuery.toLowerCase()) || 
             v.word.meaning.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/practice/vocabulary" className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm transition-colors hover:bg-gray-50">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Personal Word Bank</h1>
            <p className="text-sm text-gray-500">Review your learned words and track your mastery.</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search words or meanings..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm focus:border-green-500 focus:ring-green-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setFilter("all")} className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${filter === "all" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>All Words</button>
          <button onClick={() => setFilter("bookmarked")} className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${filter === "bookmarked" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>Bookmarked</button>
          <button onClick={() => setFilter("mastered")} className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${filter === "mastered" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>Mastered</button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-12 text-center text-gray-500">Loading your vocabulary...</div>
      ) : filteredList.length === 0 ? (
        <div className="py-12 text-center">
          <Bookmark className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-900">No words found</h3>
          <p className="text-gray-500">Try adjusting your filters or learning more daily words.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredList.map(v => (
            <div key={v.id} className="group relative flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{v.word.word}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-semibold text-gray-500">{v.word.partOfSpeech}</span>
                      <span className="text-xs text-green-600">/{v.word.pronunciation}/</span>
                      <button onClick={() => playAudio(v.word.word)} className="ml-1 text-gray-400 hover:text-green-600"><Play className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleBookmark(v.id, v.isBookmarked)}
                    className={`rounded-full p-2 transition-colors ${v.isBookmarked ? 'bg-yellow-50 text-yellow-500' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                  >
                    <Bookmark className="h-4 w-4" fill={v.isBookmarked ? "currentColor" : "none"} />
                  </button>
                </div>
                <p className="mt-4 text-sm text-gray-700 line-clamp-2">{v.word.meaning}</p>
                <p className="mt-2 text-xs italic text-gray-500 line-clamp-2">&quot;{v.word.exampleSentence}&quot;</p>
              </div>
              
              <div className="mt-6 flex items-center justify-between border-t border-gray-50 pt-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`h-1.5 w-4 rounded-full ${i < v.masteryLevel ? 'bg-green-500' : 'bg-gray-100'}`} />
                  ))}
                </div>
                {v.masteryLevel === 5 && (
                  <span className="flex items-center gap-1 text-xs font-bold text-blue-600">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Mastered
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
