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
 * 1. "standing_far": Stands far away in the open corner of the room, scaled small with room shadows.
 * 2. "near_unsmiling": Lurking directly behind the chair/shoulder, avoiding face overlap.
 * 3. "jumpscare_smiling": Fullscreen horrifying jumpscare.
 */
export const ClownEntity: React.FC<ClownEntityProps> = ({ stage, faceBox }) => {
  if (stage === "none") return null;

  // Determine which side of the background room is open
  const openSide = faceBox?.openRoomSide || "right";

  if (stage === "standing_far") {
    return (
      <div
        className={`absolute pointer-events-none transition-all duration-1000 ease-out select-none ${
          openSide === "left" ? "top-6 left-5" : "top-6 right-5"
        }`}
        style={{
          width: "20%",
          maxHeight: "38%",
          filter:
            "drop-shadow(0 0 12px rgba(0, 0, 0, 0.95)) contrast(1.1) brightness(0.8) blur(0.4px)",
        }}
      >
        {/* Shadow grounded on the room floor */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-3 bg-black/60 rounded-full blur-[2px] pointer-events-none" />

        <img
          src="/images/creepy_clown_standing.png"
          alt="Entity standing in far room corner"
          className="w-full h-auto object-contain opacity-85"
        />
      </div>
    );
  }

  if (stage === "near_unsmiling") {
    return (
      <div
        className={`absolute pointer-events-none transition-all duration-700 ease-out select-none animate-pulse ${
          openSide === "left" ? "top-2 left-6" : "top-2 right-6"
        }`}
        style={{
          width: "36%",
          maxHeight: "65%",
          animationDuration: "4s",
          filter: "drop-shadow(0 0 18px rgba(0, 0, 0, 0.98)) contrast(1.18) brightness(0.88)",
        }}
      >
        <img
          src="/images/creepy_clown_not_smiling_near.png"
          alt="Entity standing directly behind chair"
          className="w-full h-auto object-contain opacity-95"
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
