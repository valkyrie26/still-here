"use client";

import React from "react";

export type ClownStage = "none" | "standing_far" | "near_unsmiling" | "jumpscare_smiling";

interface ClownEntityProps {
  stage: ClownStage;
  onViewfinderHover?: () => void;
}

/**
 * ClownEntity Component
 * Places the player's custom clown entity in the room video feed:
 * 1. "standing_far": Stands far away in the back corner of the room.
 * 2. "near_unsmiling": Lurking right behind the chair, watching without smiling.
 * 3. "jumpscare_smiling": Fullscreen horrifying jumpscare with violent glitch shake.
 */
export const ClownEntity: React.FC<ClownEntityProps> = ({ stage, onViewfinderHover }) => {
  if (stage === "none") return null;

  if (stage === "standing_far") {
    return (
      <div
        className="absolute top-4 right-4 w-28 md:w-32 aspect-[3/4] pointer-events-none transition-all duration-1000 ease-out select-none"
        style={{
          filter: "drop-shadow(0 0 10px rgba(0, 0, 0, 0.85)) contrast(1.1) brightness(0.85)",
        }}
      >
        <img
          src="/images/creepy_clown_standing.png"
          alt="Entity standing in far corner"
          className="w-full h-full object-contain opacity-85 hover:opacity-100"
        />
        {/* Subtle shadowy corner vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
      </div>
    );
  }

  if (stage === "near_unsmiling") {
    return (
      <div
        className="absolute top-6 right-10 w-44 md:w-52 aspect-[3/4] pointer-events-none transition-all duration-700 ease-out select-none animate-pulse"
        style={{
          animationDuration: "4s",
          filter: "drop-shadow(0 0 15px rgba(0, 0, 0, 0.95)) contrast(1.15) brightness(0.9)",
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
          {/* Blood-red vignette flash */}
          <div className="absolute inset-0 bg-red-900/30 mix-blend-overlay animate-ping" />
        </div>
      </div>
    );
  }

  return null;
};
