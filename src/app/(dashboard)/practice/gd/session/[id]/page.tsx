"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { Mic, Square, Loader2, MessageSquare, Clock, User, StopCircle } from "lucide-react";
import Image from "next/image";

interface GDParticipant {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
}

interface GDMessage {
  id: string;
  speakerName: string;
  speakerRole: string;
  content: string;
  createdAt: string;
}

export default function GDSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [session, setSession] = useState<any>(null);
  const [messages, setMessages] = useState<GDMessage[]>([]);
  const [participants, setParticipants] = useState<GDParticipant[]>([]);
  
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5 * 60); // 5 minutes
  const [isEnding, setIsEnding] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSession();
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, transcript]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          endSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchSession = async () => {
    try {
      const res = await fetch(`/api/gd/session/${id}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      setSession(data.session);
      setParticipants(data.session.participants);
      setMessages(data.session.messages);
      
      if (data.session.status === "completed") {
        router.push(`/practice/gd/report/${id}`);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to load session");
    }
  };

  const startRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let finalStr = "";
      let interimStr = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalStr += event.results[i][0].transcript + " ";
        } else {
          interimStr += event.results[i][0].transcript;
        }
      }
      if (finalStr) {
        setTranscript((prev) => (prev + " " + finalStr).trim());
      }
    };

    recognition.onerror = (event: any) => {
      const err = event.error || "";
      if (err === "no-speech" || err === "aborted" || err.includes("no-speech")) return;
      console.error("Speech recognition error", event.error);
      setIsRecording(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
    setActiveSpeaker("You");
  };

  const stopRecordingAndSend = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    setActiveSpeaker(null);
    
    // Send to AI
    sendTurnToAI(transcript);
    setTranscript("");
  };

  const sendTurnToAI = async (userTranscript: string) => {
    setIsAiThinking(true);
    try {
      if (userTranscript.trim().length > 0) {
        // Optimistically add user message
        setMessages((prev) => [
          ...prev, 
          { id: Date.now().toString(), speakerName: "You", speakerRole: "user", content: userTranscript, createdAt: new Date().toISOString() }
        ]);
      }

      const res = await fetch(`/api/gd/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: id,
          transcript: userTranscript
        })
      });

      if (!res.ok) throw new Error("Failed to get AI response");
      
      const data = await res.json();
      const aiMessages = data.messages;
      
      // Animate AI speaking sequentially
      for (const msg of aiMessages) {
        if (msg.speakerRole === "ai") {
          setActiveSpeaker(msg.speakerName);
          // Add message to timeline
          setMessages((prev) => [...prev, msg]);
          // Wait a bit to simulate speaking duration based on length
          const readingTimeMs = Math.max(2000, msg.content.length * 50);
          await new Promise(r => setTimeout(r, readingTimeMs));
        }
      }
      setActiveSpeaker(null);
      
    } catch (error) {
      console.error(error);
      alert("Failed to communicate with AI participants.");
    } finally {
      setIsAiThinking(false);
    }
  };

  const endSession = async () => {
    if (isEnding) return;
    setIsEnding(true);
    try {
      // Pushing to report will trigger generation if it's not completed yet
      router.push(`/practice/gd/report/${id}`);
    } catch (error) {
      console.error(error);
      alert("Failed to end session properly.");
      setIsEnding(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (!session) {
    return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-6xl flex-col gap-6 lg:flex-row">
      {/* Left: Video Grid */}
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white px-6 py-4 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-gray-900 truncate max-w-[400px]">{session.topic}</h2>
            <p className="text-xs text-gray-500">{session.category} • Group Discussion</p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 rounded-lg px-3 py-1.5 font-mono text-sm font-bold ${timeLeft < 60 ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-600'}`}>
              <Clock className="h-4 w-4" />
              {formatTime(timeLeft)}
            </div>
            <button
              onClick={endSession}
              disabled={isEnding}
              className="rounded-xl bg-red-50 px-4 py-2 text-sm font-bold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
            >
              {isEnding ? "Ending..." : "End Session"}
            </button>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-2 gap-4 auto-rows-fr">
          {/* AI Participants */}
          {participants.map((p) => {
            const isSpeaking = activeSpeaker === p.name;
            return (
              <div key={p.id} className={`relative flex flex-col items-center justify-center rounded-3xl border bg-gray-50 p-6 transition-all duration-300 ${isSpeaking ? 'border-4 border-blue-500 shadow-xl shadow-blue-100 ring-4 ring-blue-50' : 'border-gray-200'}`}>
                {isSpeaking && (
                  <div className="absolute right-4 top-4 flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500"></span>
                  </div>
                )}
                <div className="relative h-24 w-24 overflow-hidden rounded-full bg-white shadow-sm mb-4">
                  <Image src={p.avatarUrl} alt={p.name} fill className="object-cover" />
                </div>
                <h3 className="font-bold text-gray-900">{p.name}</h3>
                <p className="text-xs text-gray-500">{p.role}</p>
              </div>
            );
          })}
          
          {/* User Participant */}
          <div className={`relative flex flex-col items-center justify-center rounded-3xl border bg-gray-50 p-6 transition-all duration-300 ${isRecording ? 'border-4 border-green-500 shadow-xl shadow-green-100' : 'border-gray-200'}`}>
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-4">
              <User className="h-10 w-10" />
            </div>
            <h3 className="font-bold text-gray-900">You</h3>
            <p className="text-xs text-gray-500">Participant</p>
          </div>
        </div>
      </div>

      {/* Right: Live Transcript & Controls */}
      <div className="flex w-full flex-col rounded-2xl border border-gray-100 bg-white shadow-sm lg:w-96">
        <div className="border-b border-gray-100 p-4">
          <h3 className="flex items-center gap-2 font-bold text-gray-900">
            <MessageSquare className="h-4 w-4 text-gray-400" />
            Live Transcript
          </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => (
            <div key={m.id} className={`flex flex-col ${m.speakerRole === 'user' ? 'items-end' : 'items-start'}`}>
              <span className="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">{m.speakerName}</span>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                m.speakerRole === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 
                m.speakerRole === 'moderator' ? 'bg-gray-800 text-white rounded-tl-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'
              }`}>
                {m.content}
              </div>
            </div>
          ))}
          
          {transcript && (
            <div className="flex flex-col items-end">
               <span className="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">You (Speaking...)</span>
               <div className="max-w-[85%] rounded-2xl px-4 py-2 text-sm bg-blue-600/60 text-white rounded-br-none italic">
                 {transcript}
               </div>
            </div>
          )}

          {isAiThinking && (
             <div className="flex flex-col items-start">
               <div className="flex items-center gap-2 rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-500 rounded-tl-none">
                 <Loader2 className="h-4 w-4 animate-spin" />
                 AI is thinking...
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-gray-100 p-4">
           {!isRecording ? (
             <button
               onClick={startRecording}
               disabled={isAiThinking}
               className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white transition-all hover:bg-blue-700 disabled:opacity-50"
             >
               <Mic className="h-4 w-4" />
               Tap to Speak
             </button>
           ) : (
             <button
               onClick={stopRecordingAndSend}
               className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 py-3 text-sm font-bold text-white transition-all hover:bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.5)]"
             >
               <StopCircle className="h-4 w-4" />
               Stop & Yield Floor
             </button>
           )}
           <p className="mt-2 text-center text-[10px] text-gray-400">
             If you have nothing to say, just tap speak and stop immediately to pass the turn to the AI.
           </p>
        </div>
      </div>
    </div>
  );
}
