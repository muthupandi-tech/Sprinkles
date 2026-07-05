"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Send } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "coach";
  text: string;
  timestamp: Date;
  tip?: {
    word: string;
    pronunciation: string;
    meaning: string;
  };
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: "1",
      sender: "coach",
      text: "Hi there! I am Sprinkles, your AI communication mentor. How can I help you improve your confidence, vocabulary, or speaking accent today?",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: inputText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setTyping(true);

    // Mock replies based on user's keywords
    setTimeout(() => {
      setTyping(false);
      let replyText =
        "That sounds interesting! Let's work on enunciation. Can you read this aloud: 'The enthusiastic weather reporter verified the windy conditions precisely.'?";
      let tipData;

      const lowerInput = inputText.toLowerCase();
      if (lowerInput.includes("interview") || lowerInput.includes("job")) {
        replyText =
          "Preparing for an interview is highly effective here! Try speaking on the prompt: 'Why do you want to join our company?' Focus on structuring with the STAR framework (Situation, Task, Action, Result).";
      } else if (lowerInput.includes("vocab") || lowerInput.includes("word")) {
        replyText =
          "Building vocabulary is essential! Here is a high-utility word for technical discussions:";
        tipData = {
          word: "Meticulous",
          pronunciation: "/məˈtikyələs/",
          meaning: "Showing great attention to detail; very careful and precise.",
        };
      } else if (lowerInput.includes("accent") || lowerInput.includes("pronounce")) {
        replyText =
          "For pronunciation coaching, enunciation is key. Let's practice contrasting the /v/ and /w/ sounds. Ensure your top teeth touch your lower lip for /v/, and round your lips fully for /w/. Try saying: 'very well'.";
      }

      const coachMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "coach",
        text: replyText,
        timestamp: new Date(),
        tip: tipData,
      };

      setMessages((prev) => [...prev, coachMessage]);
    }, 1500);
  };

  const handleSpeechSuggestion = (text: string) => {
    setInputText(text);
  };

  const suggestions = [
    "I want to practice for a software job interview.",
    "Give me an advanced vocabulary word to learn.",
    "Help me improve my accent pronunciation.",
  ];

  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col md:h-[calc(100vh-6rem)]">
      {/* 1. Page Header */}
      <div className="mb-4 shrink-0">
        <h1 className="flex items-center gap-2 text-3xl font-extrabold tracking-tight text-gray-900">
          <Sparkles className="h-8 w-8 animate-pulse text-blue-600" />
          <span>AI Communication Coach</span>
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Simulate interviews, receive pronunciation tips, and build your corporate communication
          grammar style.
        </p>
      </div>

      {/* 2. Chat Box Wrapper */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {/* Messages Body */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4 md:p-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex max-w-[80%] gap-3 ${msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
            >
              {/* Avatar circle */}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  msg.sender === "user" ? "bg-blue-600 text-white" : "bg-purple-100 text-purple-700"
                }`}
              >
                {msg.sender === "user" ? "U" : "S"}
              </div>

              {/* Message block */}
              <div className="space-y-2">
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed font-medium ${
                    msg.sender === "user"
                      ? "rounded-tr-none bg-blue-600 text-white"
                      : "rounded-tl-none border border-gray-100 bg-gray-50 text-gray-800"
                  }`}
                >
                  <p>{msg.text}</p>
                </div>

                {/* Vocabulary Card Tip */}
                {msg.tip && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-sm space-y-2 rounded-xl border border-green-100 bg-green-50/50 p-4"
                  >
                    <div className="flex items-baseline justify-between">
                      <h4 className="text-sm font-extrabold text-green-800">{msg.tip.word}</h4>
                      <span className="text-[10px] text-green-600 italic">
                        {msg.tip.pronunciation}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed font-medium text-green-700">
                      {msg.tip.meaning}
                    </p>
                  </motion.div>
                )}

                {/* Message Timestamp */}
                <p
                  className={`text-[9px] font-medium text-gray-400 ${msg.sender === "user" ? "text-right" : "text-left"}`}
                >
                  {msg.timestamp.toLocaleTimeString(undefined, {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {typing && (
            <div className="mr-auto flex max-w-[80%] items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700">
                S
              </div>
              <div className="flex items-center gap-1 rounded-2xl rounded-tl-none border border-gray-100 bg-gray-50 px-4 py-3 text-sm">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"></span>
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:0.2s]"></span>
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}

          <div ref={scrollRef}></div>
        </div>

        {/* Suggestion Chips */}
        {messages.length === 1 && (
          <div className="flex shrink-0 flex-wrap gap-2 border-t border-gray-50 bg-gray-50/20 px-6 py-3">
            {suggestions.map((sug) => (
              <button
                key={sug}
                onClick={() => handleSpeechSuggestion(sug)}
                className="cursor-pointer rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-500 transition-all hover:border-blue-500 hover:text-blue-600"
              >
                {sug}
              </button>
            ))}
          </div>
        )}

        {/* Chat Input Footer */}
        <form
          onSubmit={handleSendMessage}
          className="flex shrink-0 gap-2 border-t border-gray-100 bg-white p-4"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask Sprinkles a question or type 'vocab'..."
            className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium transition-all focus:border-blue-500 focus:bg-white focus:outline-none"
            disabled={typing}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || typing}
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-blue-600 text-white shadow-md transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            <Send className="h-4.5 w-4.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
