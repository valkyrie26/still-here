"use client";

import React, { useState, useEffect, useRef } from "react";
import { Minus, Square, X, Sparkles } from "lucide-react";
import { soundEngine } from "@/utils/sound";

interface DuckWindowProps {
  act: 1 | 2 | 3;
  tension: number;
  isEnding?: boolean;
  videoRef?: React.RefObject<HTMLVideoElement>;
  scale?: number;
  onCloseClick?: () => void;
}

export const DuckWindow: React.FC<DuckWindowProps> = ({
  act,
  tension,
  isEnding = false,
  videoRef,
  scale = 1.0,
  onCloseClick,
}) => {
  // Blinking state for Act 1
  const [isBlinking, setIsBlinking] = useState(false);

  // Eye gaze direction for Act 2 cursor tracking (with 0.5s lag)
  const [gazeDirection, setGazeDirection] = useState<"center" | "left" | "right" | "up" | "down">("center");
  const targetGazeRef = useRef<"center" | "left" | "right" | "up" | "down">("center");
  const lagTimeoutRef = useRef<any>(null);

  // Glitch corruption ticker for Act 3
  const [glitchSeed, setGlitchSeed] = useState(0);

  // Ending phase morph: duck -> player face snapshot -> duck smile
  const [endingMorphStage, setEndingMorphStage] = useState<"duck" | "face" | "duck_smile">("duck");
  const [capturedPlayerSnapshot, setCapturedPlayerSnapshot] = useState<string | null>(null);

  const windowRef = useRef<HTMLDivElement | null>(null);

  // Act 1: Natural blinking every 3.5 seconds
  useEffect(() => {
    if (act > 1 || isEnding) return;

    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 180);
    }, 3400);

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
      }, 500);
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
    }, 150);

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

  const handleCloseAttempt = () => {
    soundEngine.playKeystroke(0.35);
    if (onCloseClick) {
      onCloseClick();
    }
  };

  /**
   * Retro Pixel Art Blue Duck with Yellow Beak
   * Rendered crisp on a 24x24 pixel grid with SVG crispEdges
   */
  const renderPixelDuck = () => {
    // Ending Phase: Player Webcam morph
    if (isEnding && endingMorphStage === "face" && capturedPlayerSnapshot) {
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
            [NOW WE ARE ONE]
          </span>
        </div>
      );
    }

    const isAct3Corrupt = (act === 3 || tension >= 70) && glitchSeed % 4 === 0;

    // Palette Colors
    const cOutline = isAct3Corrupt ? "#581c87" : "#0369a1"; // Deep outline
    const cBlue = isAct3Corrupt ? "#dc2626" : "#38bdf8";    // Sky blue duck body
    const cBlueLight = isAct3Corrupt ? "#f87171" : "#7dd3fc"; // Highlight
    const cBlueDark = isAct3Corrupt ? "#991b1b" : "#0284c7";  // Shading
    const cYellow = "#facc15";      // Bright yellow beak
    const cYellowDark = "#ca8a04";  // Beak shadow / crease
    const cWhite = "#ffffff";
    const cBlack = "#0f172a";
    const cCheek = "#fda4af";       // Cute blush

    // Calculate eye offsets for cursor tracking (Act 2)
    let eyeOffsetX = 0;
    let eyeOffsetY = 0;
    if (act === 2) {
      if (gazeDirection === "left") eyeOffsetX = -1;
      if (gazeDirection === "right") eyeOffsetX = 1;
      if (gazeDirection === "up") eyeOffsetY = -1;
      if (gazeDirection === "down") eyeOffsetY = 1;
    }

    const isWideUncanny = act === 3 || isEnding;

    return (
      <svg
        viewBox="0 0 24 24"
        className="w-32 h-32 select-none"
        style={{
          imageRendering: "pixelated",
          shapeRendering: "crispEdges",
        }}
      >
        {/* DUCK HEAD BASE (Rows 3-12) */}
        {/* Top head tuft / outline */}
        <rect x="10" y="2" width="3" height="1" fill={cOutline} />
        <rect x="8" y="3" width="7" height="1" fill={cOutline} />
        <rect x="7" y="4" width="9" height="1" fill={cBlueLight} />
        <rect x="6" y="5" width="11" height="8" fill={cBlue} />

        {/* Head Highlights & Shadows */}
        <rect x="7" y="5" width="2" height="4" fill={cBlueLight} />
        <rect x="16" y="6" width="2" height="6" fill={cBlueDark} />
        <rect x="6" y="4" width="1" height="8" fill={cOutline} />
        <rect x="17" y="4" width="1" height="8" fill={cOutline} />

        {/* DUCK BODY (Rows 12-21) */}
        <rect x="5" y="13" width="13" height="6" fill={cBlue} />
        <rect x="4" y="14" width="15" height="5" fill={cBlue} />
        <rect x="6" y="19" width="11" height="1" fill={cBlueDark} />
        <rect x="7" y="20" width="9" height="1" fill={cOutline} />

        {/* Body Outlines & Wings */}
        <rect x="4" y="13" width="1" height="6" fill={cOutline} />
        <rect x="19" y="13" width="1" height="6" fill={cOutline} />
        {/* Left Wing */}
        <rect x="5" y="15" width="3" height="3" fill={cBlueDark} />
        <rect x="5" y="18" width="2" height="1" fill={cOutline} />
        {/* Right Wing */}
        <rect x="15" y="15" width="3" height="3" fill={cBlueDark} />
        <rect x="16" y="18" width="2" height="1" fill={cOutline} />

        {/* CUTE BLUSH CHEEKS (Act 1 only) */}
        {act === 1 && (
          <>
            <rect x="6" y="10" width="2" height="1" fill={cCheek} />
            <rect x="15" y="10" width="2" height="1" fill={cCheek} />
          </>
        )}

        {/* EYES RENDERING */}
        {act === 1 ? (
          // ACT 1: Cute eyes with natural blinking
          isBlinking ? (
            <>
              {/* Blinking horizontal slits */}
              <rect x="8" y="8" width="2" height="1" fill={cBlack} />
              <rect x="13" y="8" width="2" height="1" fill={cBlack} />
            </>
          ) : (
            <>
              {/* Left eye */}
              <rect x="8" y="7" width="2" height="2" fill={cBlack} />
              <rect x="8" y="7" width="1" height="1" fill={cWhite} />
              {/* Right eye */}
              <rect x="13" y="7" width="2" height="2" fill={cBlack} />
              <rect x="13" y="7" width="1" height="1" fill={cWhite} />
            </>
          )
        ) : isWideUncanny ? (
          // ACT 3 / ENDING: Uncanny Wide Staring Eyes with contracted pupils
          <>
            {/* Left Wide Eye */}
            <rect x="7" y="6" width="3" height="3" fill={cWhite} />
            <rect x="7" y="6" width="3" height="1" fill={cOutline} />
            <rect x="8" y="7" width="1" height="1" fill={isAct3Corrupt ? "#ff0000" : cBlack} />

            {/* Right Wide Eye */}
            <rect x="13" y="6" width="3" height="3" fill={cWhite} />
            <rect x="13" y="6" width="3" height="1" fill={cOutline} />
            <rect x="14" y="7" width="1" height="1" fill={isAct3Corrupt ? "#ff0000" : cBlack} />
          </>
        ) : (
          // ACT 2: Eye sockets with pupil shifting based on cursor position
          <>
            {/* Left Eye */}
            <rect x="7" y="7" width="3" height="3" fill={cWhite} />
            <rect
              x={8 + eyeOffsetX}
              y={8 + eyeOffsetY}
              width="1"
              height="1"
              fill={cBlack}
            />
            {/* Right Eye */}
            <rect x="13" y="7" width="3" height="3" fill={cWhite} />
            <rect
              x={14 + eyeOffsetX}
              y={8 + eyeOffsetY}
              width="1"
              height="1"
              fill={cBlack}
            />
          </>
        )}

        {/* YELLOW BEAK RENDERING */}
        {isWideUncanny ? (
          // Uncanny stretched wide grin across beak in Act 3 / Ending
          <>
            <rect x="7" y="10" width="9" height="3" fill={cYellow} />
            <rect x="6" y="10" width="11" height="1" fill={cYellowDark} />
            <rect x="7" y="13" width="9" height="1" fill={cYellowDark} />
            {/* Stretched eerie teeth / mouth line */}
            <rect x="8" y="11" width="7" height="1" fill="#78350f" />
            <rect x="7" y="10" width="1" height="1" fill="#78350f" />
            <rect x="15" y="10" width="1" height="1" fill="#78350f" />
          </>
        ) : (
          // Normal cute yellow duck bill (Act 1 & 2)
          <>
            <rect x="9" y="9" width="5" height="1" fill={cYellowDark} />
            <rect x="8" y="10" width="7" height="2" fill={cYellow} />
            <rect x="9" y="12" width="5" height="1" fill={cYellowDark} />
            {/* Nostrils */}
            <rect x="10" y="10" width="1" height="1" fill="#b45309" />
            <rect x="12" y="10" width="1" height="1" fill="#b45309" />
          </>
        )}

        {/* LITTLE ORANGE WEBBED FEET */}
        <rect x="8" y="21" width="2" height="1" fill="#f97316" />
        <rect x="13" y="21" width="2" height="1" fill="#f97316" />
      </svg>
    );
  };

  return (
    <div
      ref={windowRef}
      style={{
        transform: `scale(${scale})`,
        transformOrigin: "top center",
        transition: "transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)",
        zIndex: scale > 1 ? 45 : 30,
      }}
      className="win98-bevel-out bg-[#c0c0c0] w-[210px] md:w-[230px] shadow-2xl p-1 select-none flex flex-col font-sans transition-all duration-300"
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
          <span className="hover:underline cursor-pointer">Pixel</span>
          <span className="hover:underline cursor-pointer">Mood</span>
        </div>
        <span className="font-mono text-[10px] text-neutral-600">
          {act === 3 ? "UNCANNY" : act === 2 ? "TRACKING" : "CALM"}
        </span>
      </div>

      {/* Retro Pixel Duck Display Area */}
      <div className="p-2 bg-[#808080]">
        <div className="win98-bevel-in bg-black p-2 h-[155px] flex items-center justify-center relative overflow-hidden">
          {/* Subtle CRT background phosphor glow */}
          <div className="absolute inset-0 bg-blue-950/20 pointer-events-none" />

          {/* Render Crisp Pixel Duck */}
          <div className="relative z-10 flex items-center justify-center">
            {renderPixelDuck()}
          </div>

          {/* Subtitle / Status */}
          <div className="absolute bottom-1 right-2 text-[9px] font-mono text-neutral-500">
            {isEnding
              ? "TOGETHER"
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
            ? "now we can be together forever."
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
