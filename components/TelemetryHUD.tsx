"use client";

import React from "react";
import { Activity, Eye, Compass, ShieldAlert } from "lucide-react";
import { FaceTelemetry } from "@/utils/telemetry";

interface TelemetryHUDProps {
  telemetry: FaceTelemetry;
  isModelReady: boolean;
  shadowStage: number;
}

export const TelemetryHUD: React.FC<TelemetryHUDProps> = ({
  telemetry,
  isModelReady,
  shadowStage,
}) => {
  const isLookingAway = telemetry.isHeadTurned;

  return (
    <div className="win98-bevel-in bg-black/90 p-2 text-xs font-mono text-emerald-400 border border-neutral-700 shadow-inner flex flex-wrap items-center justify-between gap-3 select-none">
      {/* MediaPipe Connection Status */}
      <div className="flex items-center gap-2">
        <Activity
          className={`w-3.5 h-3.5 ${
            isModelReady ? "text-emerald-400 animate-pulse" : "text-amber-500"
          }`}
        />
        <span className="text-[11px] text-neutral-300">
          AFFECT_CORE:{" "}
          <strong className={isModelReady ? "text-emerald-400" : "text-amber-400"}>
            {isModelReady ? "ONLINE (30 FPS)" : "INITIALIZING..."}
          </strong>
        </span>
      </div>

      {/* Head Yaw & Angle Tracker */}
      <div className="flex items-center gap-1.5 text-[11px]">
        <Compass className="w-3.5 h-3.5 text-blue-400" />
        <span className="text-neutral-400">YAW:</span>
        <span
          className={`font-bold ${
            isLookingAway ? "text-red-400 animate-pulse" : "text-neutral-100"
          }`}
        >
          {telemetry.headYaw > 0 ? `+${telemetry.headYaw}°` : `${telemetry.headYaw}°`}{" "}
          {isLookingAway ? "[LOOKING AWAY!]" : "[CENTER]"}
        </span>
      </div>

      {/* Gaze Lock Indicator */}
      <div className="flex items-center gap-1.5 text-[11px]">
        <Eye className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-neutral-400">GAZE:</span>
        <span
          className={`font-bold ${
            telemetry.gazeLocked ? "text-emerald-400" : "text-amber-400"
          }`}
        >
          {telemetry.gazeLocked ? "LOCKED (READING)" : "DRIFTING"}
        </span>
      </div>

      {/* Valence / Arousal Stress Metric */}
      <div className="flex items-center gap-2 text-[11px]">
        <span className="text-neutral-400">
          VALENCE:{" "}
          <strong
            className={
              telemetry.valence < -0.2
                ? "text-red-400"
                : telemetry.valence > 0.3
                ? "text-amber-300"
                : "text-neutral-200"
            }
          >
            {telemetry.valence}
          </strong>
        </span>
        <span className="text-neutral-400">
          AROUSAL:{" "}
          <strong
            className={
              telemetry.arousal > 0.5 ? "text-red-400 font-bold" : "text-neutral-200"
            }
          >
            {telemetry.arousal}
          </strong>
        </span>
      </div>

      {/* Threat / Shadow Level */}
      <div className="flex items-center gap-1.5 text-[11px]">
        <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
        <span className="text-neutral-400">ENTITY_PROXIMITY:</span>
        <span className="text-red-400 font-bold">
          {shadowStage === 0
            ? "CLEAR"
            : shadowStage === 1
            ? "FAR CORNER"
            : shadowStage === 2
            ? "BEHIND CHAIR"
            : "LOOMING SHOULDER"}
        </span>
      </div>
    </div>
  );
};
