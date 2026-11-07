"use client";

import React from "react";
import { Activity, Eye, Compass, ShieldAlert } from "lucide-react";
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
      {/* MediaPipe Status */}
      <div className="flex items-center gap-2">
        <Activity
          className={`w-3.5 h-3.5 ${
            isModelReady ? "text-emerald-400 animate-pulse" : "text-amber-500"
          }`}
        />
        <span className="text-[11px] text-neutral-300">
          AFFECT_CORE:{" "}
          <strong className={isModelReady ? "text-emerald-400" : "text-amber-400"}>
            {isModelReady ? "ONLINE (30 FPS)" : "CALIBRATING..."}
          </strong>
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
        <span className="text-neutral-400">GAZE_TRACK:</span>
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
            ? "⚠ VIEWING CAM (DANGER!)"
            : telemetry.gazeLocked
            ? "READING CHAT"
            : "LOOKING AROUND"}
        </span>
      </div>

      {/* Entity Stage */}
      <div className="flex items-center gap-1.5 text-[11px]">
        <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
        <span className="text-neutral-400">ROOM_ANOMALY:</span>
        <span className="text-red-400 font-bold">
          {clownStage === "none"
            ? "CLEAR (0/3)"
            : clownStage === "standing_far"
            ? "FAR CORNER (1/3)"
            : clownStage === "near_unsmiling"
            ? "BEHIND CHAIR (2/3)"
            : "JUMPSCARE (3/3)"}
        </span>
      </div>
    </div>
  );
};
