"use client";

import { useState } from "react";
import { Play, Mic, Square, Zap, ChevronDown, ChevronUp, Check, Volume2, Info } from "lucide-react";
import { speechService } from "@/lib/speech-service";
import { pronunciationService } from "@/lib/services/pronunciation.service";
import { MouthAnimation } from "./MouthAnimation";

interface MispronouncedWordProps {
  word: string;
  studentTranscriptWord?: string;
  ipa: string;
  reason?: string;
  mouthPosition?: string;
  tonguePosition?: string;
  airFlow?: string;
  voiceOnOff?: string;
  tip: string;
  minimalPairs?: string[];
}

export function InteractiveMispronouncedWord({ item }: { item: MispronouncedWordProps }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Shadowing state
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [shadowingScore, setShadowingScore] = useState<number | null>(null);
  const [oldScore, setOldScore] = useState<number | null>(null);
  
  // Animation state
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [currentPlayingWord, setCurrentPlayingWord] = useState<string | null>(null);
  
  const recognitionRef = useState<any>(null);

  const playWithAnimation = (text: string, speed: number) => {
    speechService.cancel();
    setCurrentPlayingWord(text);
    speechService.play(text, { 
      speed, 
      accent: "US",
      onStart: () => setIsAudioPlaying(true),
      onEnd: () => {
        setIsAudioPlaying(false);
        setCurrentPlayingWord(null);
      },
      onError: () => {
        setIsAudioPlaying(false);
        setCurrentPlayingWord(null);
      }
    });
  };

  const handlePlayCorrect = (speed: number) => {
    playWithAnimation(item.word, speed);
  };

  const handlePlayStudent = () => {
    if (item.studentTranscriptWord) {
      playWithAnimation(item.studentTranscriptWord, 1.0);
    }
  };

  const handlePlayIPA = () => {
    playWithAnimation(item.word, 0.4);
  };

  const handlePlayMinimalPair = (pairWord: string) => {
    playWithAnimation(pairWord, 1.0);
  };

  const startShadowing = () => {
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Speech recognition not supported in this browser.");
        return;
      }
      
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";
      
      recognition.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsRecording(false);
        await analyzeShadowing(transcript);
      };
      
      recognition.onerror = () => {
        setIsRecording(false);
      };
      
      recognition.start();
      setIsRecording(true);
      recognitionRef[1](recognition);
      
      // Save current score as old score if retrying
      if (shadowingScore !== null) {
        setOldScore(shadowingScore);
      }
      setShadowingScore(null);
    } catch (e) {
      console.error(e);
      setIsRecording(false);
    }
  };

  const stopShadowing = () => {
    if (recognitionRef[0]) {
      recognitionRef[0].stop();
    }
    setIsRecording(false);
  };

  const analyzeShadowing = async (transcript: string) => {
    setIsAnalyzing(true);
    try {
      const data = await pronunciationService.analyzeShadowWord(transcript, item.word);
      setShadowingScore(data.score);
    } catch (e) {
      console.error(e);
      alert("Failed to analyze pronunciation");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm border border-red-100 transition-all hover:shadow-md overflow-hidden relative">
      
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-red-600">{item.word}</span>
            <span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded flex items-center gap-2 cursor-pointer hover:bg-gray-200" onClick={handlePlayIPA} title="Play IPA sound">
              /{item.ipa}/ <Volume2 className="h-3 w-3" />
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-700">{item.tip}</p>
        </div>
        
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-50"
        >
          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
      </div>

      {/* Audio Comparison & Quick Actions */}
      <div className="mt-4 flex flex-wrap gap-4 border-t border-gray-50 pt-4">
        <div className="flex-1 min-w-[200px]">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Correct Pronunciation</p>
          <div className="flex gap-2">
            <button 
              onClick={() => handlePlayCorrect(1.0)}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-50 text-green-700 px-3 py-2 text-sm font-medium hover:bg-green-100 transition-colors"
            >
              <Play className="h-4 w-4" /> Normal
            </button>
            <button 
              onClick={() => handlePlayCorrect(0.6)}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-50 text-green-700 px-3 py-2 text-sm font-medium hover:bg-green-100 transition-colors"
            >
              <Play className="h-4 w-4" /> Slow
            </button>
          </div>
        </div>

        {item.studentTranscriptWord && (
          <div className="flex-1 min-w-[200px]">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Your Pronunciation</p>
            <button 
              onClick={handlePlayStudent}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-50 text-red-700 px-3 py-2 text-sm font-medium hover:bg-red-100 transition-colors"
              title={`You said roughly: "${item.studentTranscriptWord}"`}
            >
              <Play className="h-4 w-4" /> Hear Mistake
            </button>
          </div>
        )}
      </div>

      {/* Deep Dive & Practice Section (Expanded) */}
      {isExpanded && (
        <div className="mt-6 space-y-6 border-t border-gray-100 pt-6 animate-in slide-in-from-top-4 duration-300">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Why this happened */}
            {(item.reason || item.mouthPosition) && (
              <div className="rounded-xl bg-orange-50 p-4 border border-orange-100 h-full flex flex-col justify-center">
                <h4 className="flex items-center gap-2 font-bold text-orange-900 mb-3">
                  <Info className="h-4 w-4 text-orange-600" />
                  Why this happened
                </h4>
                {item.reason && <p className="text-sm text-orange-800 mb-4">{item.reason}</p>}
                
                <div className="grid grid-cols-2 gap-4 text-xs">
                  {item.mouthPosition && (
                    <div><span className="font-bold text-orange-700">Mouth:</span> <span className="text-orange-900">{item.mouthPosition}</span></div>
                  )}
                  {item.tonguePosition && (
                    <div><span className="font-bold text-orange-700">Tongue:</span> <span className="text-orange-900">{item.tonguePosition}</span></div>
                  )}
                  {item.airFlow && (
                    <div><span className="font-bold text-orange-700">Air Flow:</span> <span className="text-orange-900">{item.airFlow}</span></div>
                  )}
                  {item.voiceOnOff && (
                    <div><span className="font-bold text-orange-700">Voice:</span> <span className="text-orange-900">{item.voiceOnOff}</span></div>
                  )}
                </div>
              </div>
            )}

            {/* AI Mouth Animation */}
            <div className="flex flex-col items-center justify-center bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">AI Mouth Mechanics</h4>
              <MouthAnimation 
                mouthPosition={item.mouthPosition}
                tonguePosition={item.tonguePosition}
                voiceOnOff={item.voiceOnOff}
                airFlow={item.airFlow}
                isPlaying={isAudioPlaying && currentPlayingWord === item.word} 
              />
            </div>
          </div>

          {/* Minimal Pairs */}
          {item.minimalPairs && item.minimalPairs.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-3">Minimal Pair Practice</h4>
              <div className="flex flex-wrap gap-2">
                {item.minimalPairs.map((pair, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePlayMinimalPair(pair)}
                    className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
                  >
                    <Volume2 className="h-3 w-3 text-gray-400" /> {pair}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Shadowing Practice */}
          <div className="rounded-xl bg-blue-50/50 p-5 border border-blue-100">
            <h4 className="flex items-center gap-2 font-bold text-blue-900 mb-2">
              <Zap className="h-4 w-4 text-blue-600" />
              Practice with AI
            </h4>
            <p className="text-xs text-blue-700 mb-4">Listen to the word, then repeat it back to the AI coach for instant scoring.</p>
            
            <div className="flex items-center gap-4">
              {isRecording ? (
                <button
                  onClick={stopShadowing}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 shadow-sm transition-all hover:bg-red-200"
                >
                  <Square className="h-5 w-5 fill-current" />
                </button>
              ) : (
                <button
                  onClick={startShadowing}
                  disabled={isAnalyzing}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm transition-all hover:bg-blue-700 hover:scale-105 disabled:opacity-50"
                >
                  <Mic className="h-5 w-5" />
                </button>
              )}
              
              <div className="flex-1">
                {isRecording && <div className="text-sm font-medium text-blue-800 animate-pulse">Listening... Speak now!</div>}
                {isAnalyzing && <div className="text-sm font-medium text-gray-600 animate-pulse">Analyzing pronunciation...</div>}
                
                {shadowingScore !== null && !isRecording && !isAnalyzing && (
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Score</span>
                      <div className={`text-2xl font-bold ${shadowingScore >= 80 ? 'text-green-600' : 'text-orange-500'}`}>
                        {shadowingScore}%
                      </div>
                    </div>

                    {oldScore !== null && (
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Improvement</span>
                        <div className={`text-xl font-bold ${shadowingScore > oldScore ? 'text-green-600' : shadowingScore < oldScore ? 'text-red-500' : 'text-gray-500'}`}>
                          {shadowingScore > oldScore ? "+" : ""}{shadowingScore - oldScore}%
                        </div>
                      </div>
                    )}
                    
                    <div className="text-xs font-medium text-gray-500 mt-2">
                      {shadowingScore >= 80 ? <span className="text-green-600 flex items-center gap-1"><Check className="h-3 w-3"/> Great job!</span> : "Keep trying!"}
                    </div>
                  </div>
                )}
                {!isRecording && !isAnalyzing && shadowingScore === null && (
                  <div className="text-sm font-medium text-gray-500">Click microphone to practice</div>
                )}
              </div>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}
