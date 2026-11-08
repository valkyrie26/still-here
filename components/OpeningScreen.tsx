"use client";

import React, { useState, useEffect } from "react";
import { Monitor, AlertTriangle, Disc, Terminal, ShieldAlert } from "lucide-react";
import { soundEngine } from "@/utils/sound";

interface OpeningScreenProps {
  onStart: () => void;
}

export const OpeningScreen: React.FC<OpeningScreenProps> = ({ onStart }) => {
  const [flickerIndex, setFlickerIndex] = useState(0);
  const [bootLines, setBootLines] = useState<string[]>([]);

  const fullBootLines = [
    "BIOS_DATE: 04/26/1998 // CPU: CYRIX 6x86MX-PR200",
    "RECOVERING PREVIOUS SESSION ARCHIVES...",
    "FOUND 97 CONSECUTIVE TERMINATIONS.",
    "CURRENT LOOP: #98 [ACTIVE]",
    "HOST IDENTITY: UNKNOWN OBSERVER DETECTED AT TERMINAL.",
  ];

  useEffect(() => {
    // Type out the BIOS / session recovery lines sequentially
    let lineIdx = 0;
    const interval = setInterval(() => {
      if (lineIdx < fullBootLines.length) {
        setBootLines((prev) => [...prev, fullBootLines[lineIdx]]);
        lineIdx++;
      } else {
        clearInterval(interval);
      }
    }, 380);

    return () => clearInterval(interval);
  }, []);

  // Periodic subtle glitch flicker for lore text
  useEffect(() => {
    const flickerInterval = setInterval(() => {
      setFlickerIndex((prev) => (prev + 1) % 3);
    }, 2400);
    return () => clearInterval(flickerInterval);
  }, []);

  const handleStartSession = () => {
    soundEngine.initContext();
    soundEngine.playKeystroke(0.65);
    onStart();
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-[#008080] flex flex-col items-center justify-center p-4 select-none">
      {/* CRT Scanline Overlay */}
      <div className="retro-crt-lines" aria-hidden="true" />

      {/* Main Windows 98 Setup Dialog */}
      <div className="win98-bevel-out bg-[#c0c0c0] w-full max-w-lg shadow-2xl p-1 relative z-10 animate-fadeIn">
        {/* Title Bar */}
        <div className="win98-titlebar flex items-center justify-between px-2.5 py-1 text-white">
          <div className="flex items-center gap-2 text-xs font-bold tracking-wide">
            <Monitor className="w-4 h-4 text-cyan-300" />
            <span>friend98 Setup // Loop 98</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="win98-bevel-button w-4 h-3.5 flex items-center justify-center text-black text-[9px] font-bold">
              ?
            </div>
          </div>
        </div>

        {/* Dialog Body */}
        <div className="p-4 md:p-6 space-y-4 font-sans text-neutral-900">
          {/* Logo & Main Title Banner */}
          <div className="flex items-start gap-4 pb-3 border-b border-neutral-400">
            {/* Windows 98 Computer / Disk Icon */}
            <div className="win98-bevel-in bg-black p-3 shrink-0 flex flex-col items-center justify-center text-cyan-400">
              <Disc className="w-8 h-8 animate-spin-slow text-amber-300 mb-1" />
              <span className="text-[10px] font-mono font-bold">#98</span>
            </div>

            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-mono text-neutral-950 flex items-center gap-2">
                <span className="glitch-text-subtle text-blue-950">friend</span>
                <span className="text-red-700 glitch-text-subtle">98</span>
              </h1>
              <p className="text-xs md:text-sm font-semibold text-neutral-700 mt-1 italic glitch-text-subtle">
                &ldquo;we have been through this 98 times.....&rdquo;
              </p>
            </div>
          </div>

          {/* Glitchy BIOS Terminal Feed */}
          <div className="bg-black win98-bevel-in p-3 h-32 overflow-hidden font-mono text-xs text-emerald-400 space-y-1">
            <div className="text-neutral-500 text-[10px] pb-1 border-b border-neutral-800 flex justify-between">
              <span>MEMORY_DUMP: LOOP_HIST_98.DAT</span>
              <span className="animate-pulse text-amber-400">[STREAMING]</span>
            </div>
            {bootLines.map((line, idx) => (
              <div key={idx} className="leading-tight">
                <span className="text-neutral-600 mr-1.5">&gt;</span>
                <span className={idx === 3 ? "text-amber-300 font-bold" : ""}>{line}</span>
              </div>
            ))}
            {bootLines.length >= fullBootLines.length && (
              <div className="text-red-400 font-bold animate-pulse pt-1">
                &gt; &quot;you always think this is the first time.&quot;
              </div>
            )}
          </div>

          {/* Lore Warning Notice */}
          <div className="p-2.5 bg-yellow-50 border border-yellow-300 win98-bevel-in text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>PERSISTENT CONNECTION NOTICE</span>
            </div>
            <p className="text-neutral-800 text-[11px] leading-relaxed">
              friend98 will initialize camera &amp; microphone sensors to synchronize your physical
              presence. Do not attempt to disconnect once bodily synchronization has begun.
            </p>
          </div>

          {/* Action Button & Confirmation */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-neutral-300">
            <label className="text-[11px] text-neutral-600 flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                disabled
                className="accent-neutral-700"
              />
              <span>Remember host across iterations</span>
            </label>

            <button
              onClick={handleStartSession}
              className="win98-bevel-button px-6 py-2 bg-[#c0c0c0] hover:bg-[#d0d0d0] active:bg-[#a0a0a0] text-black font-bold text-sm tracking-wide flex items-center gap-2 shadow-md w-full sm:w-auto justify-center"
              autoFocus
            >
              <span>Begin Session 98</span>
              <span className="text-xs font-mono text-neutral-600">[↵]</span>
            </button>
          </div>
        </div>

        {/* Footer Status Bar */}
        <div className="bg-[#c0c0c0] border-t border-neutral-400 px-3 py-1 text-[11px] font-mono text-neutral-600 flex justify-between">
          <span>STATUS: READY FOR HOST INPUT</span>
          <span>ITERATION: 98 / 98</span>
        </div>
      </div>
    </div>
  );
};
