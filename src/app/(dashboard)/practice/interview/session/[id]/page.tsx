"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Mic, Square, Loader2, Send, CheckCircle2, User, Bot, AlertTriangle, PlayCircle } from "lucide-react";
import Link from "next/link";

export default function InterviewSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string>("");
  const [session, setSession] = useState<any>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    params.then(p => {
      setSessionId(p.id);
      loadSession(p.id);
    });
  }, [params]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session, currentQuestion]);

  useEffect(() => {
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + " ";
          }
        }
        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript);
        }
      };
      
      recognitionRef.current.onerror = (event: any) => {
        const err = event.error || "";
        if (err === "no-speech" || err === "aborted" || err.includes("no-speech")) return;
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };
    }
  }, []);

  const loadSession = async (id: string) => {
    try {
      const res = await fetch(`/api/interview/session/${id}`);
      const data = await res.json();
      if (data.success) {
        if (data.session.status === "completed") {
          router.push(`/practice/interview/report/${id}`);
          return;
        }
        setSession(data.session);
        // Find the first question without an answer
        const activeQ = data.session.questions.find((q: any) => !q.answer);
        setCurrentQuestion(activeQ);
      } else {
        setError("Failed to load session");
      }
    } catch (e) {
      console.error(e);
      setError("An error occurred");
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setTranscript("");
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const submitAnswer = async () => {
    if (!transcript.trim()) return;
    
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    setLoadingAction(true);
    try {
      const res = await fetch("/api/interview/answer", {
        method: "POST",
        body: JSON.stringify({
          sessionId,
          questionId: currentQuestion.id,
          studentAnswer: transcript.trim(),
          currentOrder: currentQuestion.order
        })
      });
      const data = await res.json();
      
      if (data.success) {
        setTranscript("");
        if (data.isComplete) {
          router.push(`/practice/interview/report/${sessionId}`);
        } else {
          // Reload to get the new question
          await loadSession(sessionId);
        }
      } else {
        setError("Failed to submit answer.");
      }
    } catch (e) {
      console.error(e);
      setError("An error occurred submitting answer.");
    } finally {
      setLoadingAction(false);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900">{error}</h2>
        <Link href="/practice/interview" className="mt-6 text-blue-600 hover:underline">Return to Setup</Link>
      </div>
    );
  }

  if (!session || !currentQuestion) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900">{session.company} {session.interviewType} Interview</h1>
            <p className="text-xs text-gray-500">Question {currentQuestion.order} of 5</p>
          </div>
        </div>
        <div className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          In Progress
        </div>
      </div>

      {/* Chat History */}
      <div className="space-y-6 rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
        {session.questions.filter((q: any) => q.order <= currentQuestion.order).map((q: any) => (
          <div key={q.id} className="space-y-6">
            {/* AI Question */}
            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl rounded-tl-none bg-blue-50 p-4 text-sm text-gray-800">
                {q.questionText}
              </div>
            </div>

            {/* User Answer (if completed) */}
            {q.answer && (
              <div className="flex gap-4 justify-end">
                <div className="rounded-2xl rounded-tr-none bg-gray-100 p-4 text-sm text-gray-800">
                  {q.answer.studentAnswer}
                </div>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-600">
                  <User className="h-4 w-4" />
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 space-y-4">
        <label className="block text-sm font-bold text-gray-900">Your Answer</label>
        
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Type your answer or use the microphone to speak..."
          className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm focus:border-blue-500 outline-none min-h-[120px]"
          disabled={loadingAction}
        />

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={toggleRecording}
            disabled={loadingAction}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
              isRecording 
                ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isRecording ? <><Square className="h-4 w-4" /> Stop Recording</> : <><Mic className="h-4 w-4" /> Start Speaking</>}
          </button>

          <button
            onClick={submitAnswer}
            disabled={loadingAction || !transcript.trim()}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2 text-sm font-bold text-white transition-all hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loadingAction ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Submit Answer
          </button>
        </div>
      </div>
    </div>
  );
}
