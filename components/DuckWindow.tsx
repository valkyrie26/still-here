"use client";

import React, { useState, useEffect, useRef } from "react";
import { Minus, Square, X, Sparkles } from "lucide-react";
import { soundEngine } from "@/utils/sound";

interface DuckWindowProps {
  act: 1 | 2 | 3;
  tension: number;
  isEnding?: boolean;
  videoRef?: React.RefObject<HTMLVideoElement>;
}

export const DuckWindow: React.FC<DuckWindowProps> = ({
  act,
  tension,
  isEnding = false,
  videoRef,
}) => {
  // Blinking state for Act 1
  const [isBlinking, setIsBlinking] = useState(false);

  // Eye gaze direction for Act 2 cursor tracking (with 0.5s lag)
  const [gazeDirection, setGazeDirection] = useState<"center" | "left" | "right" | "up" | "down">("center");
  const targetGazeRef = useRef<"center" | "left" | "right" | "up" | "down">("center");
  const lagTimeoutRef = useRef<any>(null);

  // Glitch corruption characters for Act 3
  const [glitchSeed, setGlitchSeed] = useState(0);

  // Ending phase morph: duck -> player face snapshot -> duck smile
  const [endingMorphStage, setEndingMorphStage] = useState<"duck" | "face" | "duck_smile">("duck");
  const [capturedPlayerSnapshot, setCapturedPlayerSnapshot] = useState<string | null>(null);

  const windowRef = useRef<HTMLDivElement | null>(null);

  // Act 1: Natural blinking every 3-5 seconds
  useEffect(() => {
    if (act > 1 || isEnding) return;

    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
    }, 3800);

    return () => clearInterval(blinkInterval);
  }, [act, isEnding]);

  // Act 2: Mouse cursor tracking with ~0.5s lag
  useEffect(() => {
    if (act !== 2 || isEnding) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!windowRef.current) return;
      const rect = windowRef.current.getBoundingClientRect();
      const duckCenterX = rect.left + rect.width / 2;
      const duckCenterY = rect.top + rect.height / 2;

      const dx = e.clientX - duckCenterX;
      const dy = e.clientY - duckCenterY;

      let newGaze: "center" | "left" | "right" | "up" | "down" = "center";
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx < -60) newGaze = "left";
        else if (dx > 60) newGaze = "right";
      } else {
        if (dy < -60) newGaze = "up";
        else if (dy > 60) newGaze = "down";
      }

      targetGazeRef.current = newGaze;

      // Half-second delayed interpolation (0.5s lag)
      if (lagTimeoutRef.current) clearTimeout(lagTimeoutRef.current);
      lagTimeoutRef.current = setTimeout(() => {
        setGazeDirection(targetGazeRef.current);
      }, 520);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (lagTimeoutRef.current) clearTimeout(lagTimeoutRef.current);
    };
  }, [act, isEnding]);

  // Act 3: Fast glitch ticker at peak tension
  useEffect(() => {
    if (act < 3 && tension < 65) return;

    const glitchTimer = setInterval(() => {
      setGlitchSeed((prev) => (prev + 1) % 100);
    }, 120);

    return () => clearInterval(glitchTimer);
  }, [act, tension]);

  // Ending Climax: Morph duck face to player face, then back into smiling duck
  useEffect(() => {
    if (!isEnding) return;

    // Snapshot player from videoRef
    if (videoRef?.current && videoRef.current.readyState >= 2) {
      const canvas = document.createElement("canvas");
      canvas.width = 160;
      canvas.height = 140;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.save();
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        ctx.restore();
        setCapturedPlayerSnapshot(canvas.toDataURL("image/jpeg", 0.8));
      }
    }

    // Sequence: Duck -> Face at 2.5s -> Smiling Duck at 6s
    const t1 = setTimeout(() => {
      setEndingMorphStage("face");
    }, 2200);

    const t2 = setTimeout(() => {
      setEndingMorphStage("duck_smile");
    }, 5500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isEnding, videoRef]);

  // Click on [X] prevents closing with a retro buzz
  const handleCloseAttempt = () => {
    soundEngine.playKeystroke(0.35);
  };

  // Build the 4-5 dynamic ASCII frames based on Act & Tension
  const renderDuckAscii = () => {
    // ENDING PHASE: Smiling duck or webcam snapshot
    if (isEnding) {
      if (endingMorphStage === "face" && capturedPlayerSnapshot) {
        return (
          <div className="w-full h-full flex flex-col items-center justify-center p-1">
            <div className="win98-bevel-in border border-emerald-500 overflow-hidden relative">
              <img
                src={capturedPlayerSnapshot}
                alt="Player webcam face"
                className="w-32 h-28 object-cover filter contrast-125 brightness-95 saturate-50"
              />
              <div className="absolute inset-0 bg-emerald-950/20 mix-blend-screen" />
            </div>
            <span className="text-[10px] font-mono text-emerald-400 mt-1 animate-pulse">
              [BECOMING YOU]
            </span>
          </div>
        );
      }

      // Ending Phase Final: Duck smiling chillingly into void
      return (
        <pre className="font-mono text-[11px] leading-tight select-none text-left">
          <span className="text-sky-400">      .-------.</span>{"\n"}
          <span className="text-sky-400">     / </span><span className="text-white font-bold">^     ^</span><span className="text-sky-400"> \</span>{"\n"}
          <span className="text-sky-400">    |   </span><span className="text-yellow-400 font-extrabold">&lt;=====&gt;</span><span className="text-sky-400">  |</span>{"\n"}
          <span className="text-sky-400">     \  </span><span className="text-red-400 font-bold">\_____/</span><span className="text-sky-400">  /</span>{"\n"}
          <span className="text-sky-400">   .-'         '-.</span>{"\n"}
          <span className="text-sky-400">  /  (         )  \</span>{"\n"}
          <span className="text-sky-400">  \   `-------'   /</span>{"\n"}
          <span className="text-sky-400">   `-------------'</span>{"\n"}
        </pre>
      );
    }

    // ACT 3 / HIGH TENSION: Eyes too wide, uncanny stretched grin, or glitched
    if (act === 3 || tension >= 70) {
      const isCorruptedGlitch = glitchSeed % 4 === 0;

      if (isCorruptedGlitch) {
        // Glitched frame
        return (
          <pre className="font-mono text-[11px] leading-tight select-none text-left animate-pulse">
            <span className="text-red-500">      .§§§§§§§.</span>{"\n"}
            <span className="text-red-400">     / </span><span className="text-white font-extrabold">O     O</span><span className="text-red-400"> \</span>{"\n"}
            <span className="text-red-400">    |   </span><span className="text-yellow-400 font-extrabold">&lt;▒▒▒▒▒&gt;</span><span className="text-red-400">  |</span>{"\n"}
            <span className="text-red-500">     \  </span><span className="text-red-300 font-bold">\_____/</span><span className="text-red-500">  /</span>{"\n"}
            <span className="text-red-400">   .-'   ▓▓▓   '-.</span>{"\n"}
            <span className="text-sky-600">  /  (  █████  )  \</span>{"\n"}
            <span className="text-sky-600">  \   `-------'   /</span>{"\n"}
            <span className="text-sky-600">   `--░░░░░░░░░--'</span>{"\n"}
          </pre>
        );
      }

      // Uncanny Wide Eyes & Stretched Grin Frame
      return (
        <pre className="font-mono text-[11px] leading-tight select-none text-left">
          <span className="text-sky-400">      .-------.</span>{"\n"}
          <span className="text-sky-400">     / </span><span className="text-white font-extrabold tracking-widest animate-pulse">O   O</span><span className="text-sky-400"> \</span>{"\n"}
          <span className="text-sky-400">    |   </span><span className="text-yellow-400 font-extrabold">&lt;=====&gt;</span><span className="text-sky-400"> |</span>{"\n"}
          <span className="text-sky-400">     \  </span><span className="text-neutral-200 font-bold">\_____/</span><span className="text-sky-400">  /</span>{"\n"}
          <span className="text-sky-400">   .-'         '-.</span>{"\n"}
          <span className="text-sky-400">  /  (  STILL  )  \</span>{"\n"}
          <span className="text-sky-400">  \   `-------'   /</span>{"\n"}
          <span className="text-sky-400">   `-------------'</span>{"\n"}
        </pre>
      );
    }

    // ACT 2: Eyes follow cursor with 0.5s lag; smile lingers a beat too long
    if (act === 2) {
      let eyeChars = "o   o";
      if (gazeDirection === "left") eyeChars = "•   • ";
      else if (gazeDirection === "right") eyeChars = " •   •";
      else if (gazeDirection === "up") eyeChars = "°   °";
      else if (gazeDirection === "down") eyeChars = "·   ·";

      return (
        <pre className="font-mono text-[11px] leading-tight select-none text-left">
          <span className="text-sky-400">      .-------.</span>{"\n"}
          <span className="text-sky-400">     / </span><span className="text-white font-bold">{eyeChars}</span><span className="text-sky-400"> \</span>{"\n"}
          <span className="text-sky-400">    |   </span><span className="text-yellow-400 font-bold">&lt;===&gt;</span><span className="text-sky-400">   |</span>{"\n"}
          <span className="text-sky-400">     \   ---   /</span>{"\n"}
          <span className="text-sky-400">   .-'         '-.</span>{"\n"}
          <span className="text-sky-400">  /  (  WATCH  )  \</span>{"\n"}
          <span className="text-sky-400">  \   `-------'   /</span>{"\n"}
          <span className="text-sky-400">   `-------------'</span>{"\n"}
        </pre>
      );
    }

    // ACT 1: Friendly normal duck with blinking eyes and small cheerful smile
    const act1Eyes = isBlinking ? "-   -" : "^   ^";
    return (
      <pre className="font-mono text-[11px] leading-tight select-none text-left">
        <span className="text-sky-400">      .-------.</span>{"\n"}
        <span className="text-sky-400">     / </span><span className="text-white font-bold">{act1Eyes}</span><span className="text-sky-400"> \</span>{"\n"}
        <span className="text-sky-400">    |    </span><span className="text-yellow-400 font-bold">&lt;&gt;</span><span className="text-sky-400">     |</span>{"\n"}
        <span className="text-sky-400">     \   '-'   /</span>{"\n"}
        <span className="text-sky-400">   .-'         '-.</span>{"\n"}
        <span className="text-sky-400">  /  (  FRIEND )  \</span>{"\n"}
        <span className="text-sky-400">  \   `-------'   /</span>{"\n"}
        <span className="text-sky-400">   `-------------'</span>{"\n"}
      </pre>
    );
  };

  return (
    <div
      ref={windowRef}
      className="win98-bevel-out bg-[#c0c0c0] w-[210px] md:w-[230px] shadow-2xl p-1 select-none flex flex-col font-sans transition-all duration-300 z-30"
    >
      {/* Windows 98 Title Bar */}
      <div
        className={`flex items-center justify-between px-2 py-1 select-none ${
          act === 3 ? "win98-titlebar-corrupted" : "win98-titlebar"
        }`}
      >
        <div className="flex items-center gap-1.5 text-xs text-white font-bold">
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          <span>Friend.exe</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="win98-bevel-button w-4 h-3.5 flex items-center justify-center text-black text-[10px]">
            <Minus className="w-2.5 h-2.5" />
          </button>
          <button className="win98-bevel-button w-4 h-3.5 flex items-center justify-center text-black text-[10px]">
            <Square className="w-2.5 h-2.5" />
          </button>
          <button
            onClick={handleCloseAttempt}
            className="win98-bevel-button w-4 h-3.5 flex items-center justify-center text-black font-bold text-[10px]"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>

      {/* Menu Strip */}
      <div className="px-2 py-0.5 border-b border-neutral-400 text-[11px] text-neutral-800 flex items-center justify-between bg-[#c0c0c0]">
        <div className="flex gap-2">
          <span className="hover:underline cursor-pointer">Face</span>
          <span className="hover:underline cursor-pointer">Mood</span>
        </div>
        <span className="font-mono text-[10px] text-neutral-600">
          {act === 3 ? "UNCANNY" : act === 2 ? "TRACKING" : "CALM"}
        </span>
      </div>

      {/* ASCII Duck Display Canvas */}
      <div className="p-2 bg-[#808080]">
        <div className="win98-bevel-in bg-black p-3 h-[155px] flex items-center justify-center relative overflow-hidden">
          {/* Subtle CRT background phosphor glow */}
          <div className="absolute inset-0 bg-blue-950/20 pointer-events-none" />

          {/* Render Duck ASCII Art */}
          <div className="relative z-10">{renderDuckAscii()}</div>

          {/* Subtitle / Status */}
          <div className="absolute bottom-1 right-2 text-[9px] font-mono text-neutral-500">
            {isEnding
              ? "STILL_HERE"
              : act === 3
              ? "BODY_TRANSFER"
              : act === 2
              ? "EYE_LAG: 500MS"
              : "ONLINE"}
          </div>
        </div>
      </div>

      {/* Window Status Bar */}
      <div className="px-2 py-1 border-t border-neutral-400 flex items-center justify-between text-[10px] font-mono text-neutral-700 bg-[#c0c0c0]">
        <span className="truncate">
          {isEnding
            ? "we look so good together."
            : act === 3
            ? "i've practiced your smile."
            : act === 2
            ? "observing your hands..."
            : "i'm your best friend!"}
        </span>
      </div>
    </div>
  );
};
