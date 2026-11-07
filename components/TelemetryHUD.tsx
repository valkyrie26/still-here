"use client";

import React from "react";
import { Activity, Eye, Compass, ShieldAlert, HeartPulse } from "lucide-react";
import { FaceTelemetry } from "@/utils/telemetry";

interface TelemetryHUDProps {
  telemetry: FaceTelemetry;
  isModelReady: boolean;
  clownStage: "none" | "standing_far" | "near_unsmiling" | "jumpscare_smiling";
}

export const TelemetryHUD: React.FC<TelemetryHUDProps> = ({
  telemetry,
  isModelReady,
  clownStage,
}) => {
  const isLookingAway = telemetry.isHeadTurned;
  const isLookingAtViewfinder = telemetry.gazeAtViewfinder;

  return (
    <div className="win98-bevel-in bg-black/90 p-2 text-xs font-mono text-emerald-400 border border-neutral-700 shadow-inner flex flex-wrap items-center justify-between gap-3 select-none">
      {/* MediaPipe & Presage Biometric Status */}
      <div className="flex items-center gap-2">
        <Activity
          className={`w-3.5 h-3.5 ${
            isModelReady ? "text-emerald-400 animate-pulse" : "text-amber-500"
          }`}
        />
        <span className="text-[11px] text-neutral-300">
          BIOMETRIC_AFFECT:{" "}
          <strong className={isModelReady ? "text-emerald-400" : "text-amber-400"}>
            {isModelReady ? "LIVE (30 FPS)" : "CALIBRATING..."}
          </strong>
        </span>
      </div>

      {/* Physiological Pulse/Stress Indicator */}
      <div className="flex items-center gap-1.5 text-[11px]">
        <HeartPulse
          className={`w-3.5 h-3.5 ${
            telemetry.heartRateStress > 85 ? "text-red-500 animate-ping" : "text-emerald-400"
          }`}
        />
        <span className="text-neutral-400">PULSE_LOAD:</span>
        <span
          className={`font-bold ${
            telemetry.heartRateStress > 85 ? "text-red-400 font-extrabold" : "text-neutral-100"
          }`}
        >
          {telemetry.heartRateStress} BPM
        </span>
      </div>

      {/* Head Yaw */}
      <div className="flex items-center gap-1.5 text-[11px]">
        <Compass className="w-3.5 h-3.5 text-blue-400" />
        <span className="text-neutral-400">HEAD_YAW:</span>
        <span
          className={`font-bold ${
            isLookingAway ? "text-red-400 animate-pulse" : "text-neutral-100"
          }`}
        >
          {telemetry.headYaw > 0 ? `+${telemetry.headYaw}°` : `${telemetry.headYaw}°`}{" "}
          {isLookingAway ? "[LOOKING AWAY!]" : "[CENTER]"}
        </span>
      </div>

      {/* Eye Gaze Target */}
      <div className="flex items-center gap-1.5 text-[11px]">
        <Eye className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-neutral-400">GAZE:</span>
        <span
          className={`font-bold ${
            isLookingAtViewfinder
              ? "text-red-400 animate-pulse font-extrabold"
              : telemetry.gazeLocked
              ? "text-emerald-400"
              : "text-amber-300"
          }`}
        >
          {isLookingAtViewfinder
            ? "⚠ AT VIEWFINDER"
            : telemetry.gazeLocked
            ? "READING CHAT"
            : "LOOKING AROUND"}
        </span>
      </div>

      {/* Room Anomaly */}
      <div className="flex items-center gap-1.5 text-[11px]">
        <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
        <span className="text-neutral-400">ANOMALY:</span>
        <span className="text-red-400 font-bold">
          {clownStage === "none"
            ? "CLEAR"
            : clownStage === "standing_far"
            ? `FAR CORNER (${telemetry.faceBox.openRoomSide.toUpperCase()})`
            : clownStage === "near_unsmiling"
            ? "BEHIND CHAIR"
            : "JUMPSCARE"}
        </span>
      </div>
    </div>
  );
};
