"use client";

import React from "react";
import { FaceBox } from "@/utils/telemetry";

export type ClownStage = "none" | "standing_far" | "near_unsmiling" | "jumpscare_smiling";

interface ClownEntityProps {
  stage: ClownStage;
  faceBox?: FaceBox;
}

/**
 * ClownEntity Component
 * Places the player's custom clown entity in the room video feed:
 * 1. "standing_far": Stands far away in the open corner of the room (clear, unmistakable, scaled to distance).
 * 2. "near_unsmiling": Lurking directly behind the chair/shoulder.
 * 3. "jumpscare_smiling": Fullscreen horrifying jumpscare.
 */
export const ClownEntity: React.FC<ClownEntityProps> = ({ stage, faceBox }) => {
  if (stage === "none") return null;

  const openSide = faceBox?.openRoomSide || "right";

  if (stage === "standing_far") {
    return (
      <div
        className={`absolute z-[6] pointer-events-none transition-all duration-700 ease-out select-none ${
          openSide === "left" ? "top-3 left-3" : "top-3 right-3"
        } w-24 md:w-28 aspect-square flex flex-col items-center justify-center`}
        style={{
          filter: "drop-shadow(0 0 10px rgba(0, 0, 0, 0.9))",
        }}
      >
        <img
          src="/images/creepy_clown_standing.png"
          alt="Entity standing in far room corner"
          className="w-full h-full object-contain opacity-95"
        />
        {/* Subtle shadow beneath his feet */}
        <div className="w-14 h-2 bg-black/60 rounded-full blur-[2px] -mt-1" />
      </div>
    );
  }

  if (stage === "near_unsmiling") {
    return (
      <div
        className={`absolute z-[6] pointer-events-none transition-all duration-500 ease-out select-none animate-pulse ${
          openSide === "left" ? "top-1 left-2" : "top-1 right-2"
        } w-40 md:w-48 aspect-square flex flex-col items-center justify-center`}
        style={{
          animationDuration: "3.5s",
          filter: "drop-shadow(0 0 16px rgba(0, 0, 0, 0.95)) contrast(1.15)",
        }}
      >
        <img
          src="/images/creepy_clown_not_smiling_near.png"
          alt="Entity standing directly behind chair"
          className="w-full h-full object-contain opacity-95"
        />
      </div>
    );
  }

  if (stage === "jumpscare_smiling") {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center pointer-events-none overflow-hidden screen-glitch">
        <div className="relative w-[90vw] md:w-[650px] aspect-square flex items-center justify-center animate-glitch scale-125">
          <img
            src="/images/creepy_clown_smiling_near.png"
            alt="JUMPSCARE"
            className="w-full h-full object-contain filter contrast-150 saturate-150 drop-shadow-[0_0_50px_rgba(255,0,0,0.9)]"
          />
          <div className="absolute inset-0 bg-red-900/30 mix-blend-overlay animate-ping" />
        </div>
      </div>
    );
  }

  return null;
};
