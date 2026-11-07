"use client";

import React from "react";

interface GhostFigureProps {
  stage: number; // 0 = hidden, 1 = far corner, 2 = closer, 3 = right behind shoulder
}

/**
 * GhostFigure Component
 * Renders an eerie, translucent spectral ghost with hollow glowing eyes,
 * a pale face mask, and wispy smoky aura peering over the player's shoulder.
 */
export const GhostFigure: React.FC<GhostFigureProps> = ({ stage }) => {
  if (stage <= 0) return null;

  return (
    <div
      className={`absolute pointer-events-none transition-all duration-700 ease-out select-none ${
        stage === 1
          ? "top-3 right-3 w-28 h-36 opacity-70 scale-90 blur-[1px]"
          : stage === 2
          ? "top-6 right-10 w-36 h-48 opacity-85 scale-110 blur-[0.5px]"
          : "top-8 right-16 w-44 h-60 opacity-95 scale-125 blur-none"
      }`}
      style={{
        filter: "drop-shadow(0 0 16px rgba(180, 240, 220, 0.45))",
      }}
    >
      <svg
        viewBox="0 0 160 220"
        className="w-full h-full animate-pulse"
        style={{ animationDuration: stage === 3 ? "1.5s" : "3s" }}
      >
        <defs>
          {/* Spectral Ghostly Radial Gradient */}
          <radialGradient id="ghost-glow" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor="rgba(235, 250, 245, 0.95)" />
            <stop offset="35%" stopColor="rgba(190, 230, 220, 0.8)" />
            <stop offset="70%" stopColor="rgba(130, 185, 175, 0.45)" />
            <stop offset="100%" stopColor="rgba(20, 40, 35, 0)" />
          </radialGradient>

          {/* Shroud / Cloak smoky gradient */}
          <linearGradient id="shroud-fade" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(180, 225, 215, 0.75)" />
            <stop offset="50%" stopColor="rgba(90, 140, 130, 0.45)" />
            <stop offset="100%" stopColor="rgba(10, 20, 15, 0)" />
          </linearGradient>

          {/* Eye Socket Glow */}
          <radialGradient id="eye-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#5bf895" />
            <stop offset="100%" stopColor="rgba(0, 0, 0, 0.9)" />
          </radialGradient>
        </defs>

        {/* Wispy Smoky Outer Shroud */}
        <path
          d="M80 30 Q125 45 135 110 Q145 170 120 215 Q80 200 40 215 Q15 170 25 110 Q35 45 80 30 Z"
          fill="url(#shroud-fade)"
          className="opacity-90"
        />

        {/* Pale Spectral Head & Face Mask */}
        <ellipse cx="80" cy="72" rx="36" ry="46" fill="url(#ghost-glow)" />

        {/* Hollow Sunken Eye Sockets */}
        <ellipse cx="66" cy="68" rx="8" ry="11" fill="#08100c" />
        <ellipse cx="94" cy="68" rx="8" ry="11" fill="#08100c" />

        {/* Glowing Spectral Eye Pinpricks */}
        <circle cx="66" cy="68" r={stage >= 2 ? "3" : "2"} fill="url(#eye-glow)" />
        <circle cx="94" cy="68" r={stage >= 2 ? "3" : "2"} fill="url(#eye-glow)" />

        {/* Distorted Hollow Breathing Mouth */}
        <ellipse
          cx="80"
          cy="96"
          rx={stage === 3 ? "9" : "6"}
          ry={stage === 3 ? "14" : "9"}
          fill="#060c09"
        />

        {/* Fine Ghastly Cheekbone Contours */}
        <path
          d="M52 82 Q65 92 72 96"
          stroke="rgba(80, 120, 110, 0.5)"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M108 82 Q95 92 88 96"
          stroke="rgba(80, 120, 110, 0.5)"
          strokeWidth="1.5"
          fill="none"
        />

        {/* Wispy Tendrils Trailing Down Behind Shoulder */}
        <path
          d="M45 150 Q30 185 35 220 M115 150 Q130 185 125 220"
          stroke="rgba(190, 230, 220, 0.4)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
};
