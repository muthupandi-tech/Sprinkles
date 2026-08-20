"use client";

import { useEffect, useState } from "react";

interface MouthAnimationProps {
  mouthPosition?: string;
  tonguePosition?: string;
  voiceOnOff?: string;
  airFlow?: string;
  isPlaying: boolean;
}

export function MouthAnimation({
  mouthPosition = "",
  tonguePosition = "",
  voiceOnOff = "",
  airFlow = "",
  isPlaying,
}: MouthAnimationProps) {
  // Simple NLP on the props to determine states
  const hasVoice = voiceOnOff.toLowerCase().includes("on") || voiceOnOff.toLowerCase().includes("vibrate");
  const hasAirflow = airFlow.toLowerCase().includes("continuous") || airFlow.toLowerCase().includes("blowing") || airFlow.toLowerCase().includes("puff");
  
  const isTongueUp = tonguePosition.toLowerCase().includes("roof") || tonguePosition.toLowerCase().includes("alveolar");
  const isTongueBetweenTeeth = tonguePosition.toLowerCase().includes("between teeth");
  const isTongueCurled = tonguePosition.toLowerCase().includes("curl");

  const isLipBiting = mouthPosition.toLowerCase().includes("lower lip") && mouthPosition.toLowerCase().includes("teeth");
  const isMouthOpen = mouthPosition.toLowerCase().includes("open") || mouthPosition.toLowerCase().includes("drop");
  const isMouthWide = mouthPosition.toLowerCase().includes("wide") || mouthPosition.toLowerCase().includes("smile");
  const isMouthRound = mouthPosition.toLowerCase().includes("round") || mouthPosition.toLowerCase().includes("puckered");

  // Determine jaw offset
  const jawOffset = isPlaying ? (isMouthOpen ? 15 : isMouthRound ? 5 : isMouthWide ? 2 : 8) : 0;
  
  // Tongue translation
  let tongueY = 0;
  let tongueX = 0;
  if (isPlaying) {
    if (isTongueUp) { tongueY = -8; tongueX = 2; }
    else if (isTongueBetweenTeeth) { tongueX = 10; }
    else if (isTongueCurled) { tongueY = -4; tongueX = -4; }
  }

  return (
    <div className="relative flex items-center justify-center w-full max-w-sm mx-auto aspect-square bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl overflow-hidden border border-indigo-100 shadow-inner p-4">
      
      {/* Voice Vibration Rings */}
      {isPlaying && hasVoice && (
        <div className="absolute left-1/4 top-1/2 -translate-y-1/2 flex gap-1">
          {[...Array(3)].map((_, i) => (
            <div 
              key={i}
              className="w-1.5 h-8 bg-purple-400 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
          <span className="absolute -top-6 left-0 text-xs font-bold text-purple-600">Voice ON</span>
        </div>
      )}

      {/* SVG Face Profile / Mouth cross section */}
      <svg viewBox="0 0 100 100" className="w-full h-full max-w-[200px]" style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.1))' }}>
        
        {/* Upper Palate / Roof of mouth */}
        <path d="M 20 40 C 40 30 60 30 80 40" fill="none" stroke="#fca5a5" strokeWidth="6" strokeLinecap="round" />
        
        {/* Upper Teeth */}
        <path d="M 78 40 L 80 50 L 74 50 Z" fill="white" stroke="#e2e8f0" strokeWidth="1" />
        
        {/* Lower Jaw (moves) */}
        <g style={{ transform: `translateY(${jawOffset}px)`, transition: 'transform 0.15s ease-out' }}>
          {/* Lower Jaw line */}
          <path d="M 20 60 C 40 70 60 70 76 65" fill="none" stroke="#fca5a5" strokeWidth="6" strokeLinecap="round" />
          
          {/* Lower Teeth */}
          <path d="M 74 64 L 76 54 L 70 55 Z" fill="white" stroke="#e2e8f0" strokeWidth="1" />
          
          {/* Tongue */}
          <path 
            d={isTongueCurled 
                ? "M 30 65 C 40 45 50 40 60 50 C 70 60 65 65 60 62" 
                : "M 30 65 C 50 65 60 60 72 58 C 76 57 78 60 78 63"
              }
            fill="#fb7185" 
            stroke="#e11d48" 
            strokeWidth="2"
            style={{ 
              transform: `translate(${tongueX}px, ${tongueY}px)`, 
              transition: 'transform 0.15s ease-out' 
            }}
          />

          {/* Lower Lip Biting (if required) */}
          {isLipBiting && isPlaying && (
            <path d="M 75 64 C 80 55 85 50 85 45" fill="none" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
          )}
        </g>

        {/* Airflow Arrows */}
        {isPlaying && hasAirflow && (
          <g className="animate-pulse" style={{ animationDuration: '1s' }}>
            <path d="M 60 50 L 95 50 M 85 45 L 95 50 L 85 55" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4" />
            <text x="70" y="45" fontSize="6" fill="#3b82f6" fontWeight="bold">Airflow</text>
          </g>
        )}

      </svg>

      {/* Floating Status Badges */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 items-end">
        {isPlaying && !hasVoice && (
          <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-xs font-bold shadow-sm">
            Voice OFF (Unvoiced)
          </span>
        )}
        {isPlaying && isLipBiting && (
          <span className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs font-bold shadow-sm">
            Lip bites upper teeth
          </span>
        )}
      </div>
    </div>
  );
}
