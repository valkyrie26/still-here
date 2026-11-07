"use client";

import React from "react";

interface ScreenCrackProps {
  active: boolean;
  severity?: 1 | 2 | 3;
}

/**
 * ScreenCrack Overlay
 * Renders realistic glass fracture patterns across the monitor
 * when paranoia peaks, violent glitch occurs, or screen shatters.
 */
export const ScreenCrack: React.FC<ScreenCrackProps> = ({ active, severity = 1 }) => {
  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9990] overflow-hidden select-none">
      <svg
        className="w-full h-full filter drop-shadow-[0_0_2px_rgba(255,255,255,0.8)]"
        viewBox="0 0 1000 700"
        preserveAspectRatio="none"
      >
        <defs>
          <radialGradient id="impact-glow" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
            <stop offset="10%" stopColor="rgba(255,255,255,0.15)" />
            <stop offset="60%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
        </defs>

        {/* Impact center shatter circle */}
        <circle cx="500" cy="320" r="18" fill="url(#impact-glow)" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" />
        <circle cx="500" cy="320" r="45" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1" strokeDasharray="4 2" />

        {/* Primary radiating fracture lines */}
        <path
          d="M500 320 L380 210 L260 180 L120 90 L0 50"
          fill="none"
          stroke="rgba(255,255,255,0.85)"
          strokeWidth="1.8"
          className="crack-line"
        />
        <path
          d="M500 320 L620 200 L760 140 L880 90 L1000 60"
          fill="none"
          stroke="rgba(255,255,255,0.85)"
          strokeWidth="1.8"
          className="crack-line"
        />
        <path
          d="M500 320 L440 450 L340 540 L220 620 L90 700"
          fill="none"
          stroke="rgba(255,255,255,0.85)"
          strokeWidth="1.8"
          className="crack-line"
        />
        <path
          d="M500 320 L580 440 L690 530 L810 610 L950 700"
          fill="none"
          stroke="rgba(255,255,255,0.85)"
          strokeWidth="1.8"
          className="crack-line"
        />
        <path
          d="M500 320 L510 120 L480 30 L490 0"
          fill="none"
          stroke="rgba(255,255,255,0.8)"
          strokeWidth="1.5"
          className="crack-line"
        />

        {/* Secondary spiderweb branching fissures */}
        <path
          d="M380 210 L410 160 L360 110 M260 180 L290 240 L240 310 M440 450 L480 500 L440 570"
          fill="none"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth="1.2"
        />
        <path
          d="M620 200 L590 150 L640 90 M760 140 L710 200 L780 260 M580 440 L540 510 L600 580"
          fill="none"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth="1.2"
        />

        {/* Severity 2 & 3 extra micro-fractures */}
        {severity >= 2 && (
          <>
            <path
              d="M500 320 L280 360 L140 390 L0 420"
              fill="none"
              stroke="rgba(255,255,255,0.75)"
              strokeWidth="1.4"
            />
            <path
              d="M500 320 L720 350 L870 380 L1000 410"
              fill="none"
              stroke="rgba(255,255,255,0.75)"
              strokeWidth="1.4"
            />
          </>
        )}

        {severity >= 3 && (
          <path
            d="M500 320 L420 280 L350 310 L290 280 L220 310 L150 290 L80 330 L0 320"
            fill="none"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth="2"
          />
        )}
      </svg>
    </div>
  );
};
