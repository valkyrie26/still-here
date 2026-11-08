"use client";

import React, { useState } from "react";
import { Camera, Mic, ShieldAlert, Cpu, ArrowRight } from "lucide-react";

interface PermissionModalProps {
  onPermissionsGranted: (stream: MediaStream | null) => void;
}

export const PermissionModal: React.FC<PermissionModalProps> = ({
  onPermissionsGranted,
}) => {
  const [requesting, setRequesting] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const requestHardwareAccess = async () => {
    setRequesting(true);
    setErrorNotice(null);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Hardware access not supported by browser.");
      }

      // Request both camera and microphone as requested
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
        audio: true,
      });

      onPermissionsGranted(stream);
    } catch (err: any) {
      console.warn("Camera/Mic permission prompt error:", err);
      // If audio fails (e.g. mic disabled on Mac), try video only
      try {
        const videoOnlyStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user",
          },
          audio: false,
        });
        onPermissionsGranted(videoOnlyStream);
      } catch (videoErr) {
        setErrorNotice(
          "Camera/Mic permission was not granted. You may proceed in fallback mode or check browser permissions."
        );
        setRequesting(false);
      }
    }
  };

  const handleSimulate = () => {
    onPermissionsGranted(null);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-[3px] p-4 select-none">
      <div className="win98-bevel-out bg-[#c0c0c0] w-full max-w-[490px] shadow-2xl p-1 text-black font-sans">
        {/* Title Bar */}
        <div className="win98-titlebar flex items-center justify-between px-2.5 py-1">
          <div className="flex items-center gap-1.5 text-xs text-white font-bold">
            <Cpu className="w-3.5 h-3.5" />
            <span>POND Hardware Setup Wizard - Audio/Video Configuration</span>
          </div>
        </div>

        {/* Wizard Header Banner */}
        <div className="bg-gradient-to-r from-[#000080] via-[#1084d0] to-[#000080] text-white p-3 border-b border-neutral-500 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-bold tracking-wide">POND Instant Messenger v3.1</h1>
            <p className="text-[11px] text-neutral-200">
              Hardware Calibration & Device Authorization
            </p>
          </div>
          <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded border border-white/20">
            <Camera className="w-4 h-4 text-emerald-300" />
            <Mic className="w-4 h-4 text-amber-300" />
          </div>
        </div>

        {/* Wizard Body Content */}
        <div className="p-4 bg-[#c0c0c0] text-xs space-y-3">
          <div className="flex gap-3 items-start">
            <div className="win98-bevel-in bg-white p-2.5 shrink-0 border border-neutral-600">
              <Camera className="w-8 h-8 text-neutral-800 mx-auto mb-1" />
              <Mic className="w-5 h-5 text-neutral-600 mx-auto" />
            </div>
            <div className="space-y-1.5 text-neutral-900 leading-relaxed">
              <p className="font-semibold text-[13px]">
                Camera and Microphone permissions are required.
              </p>
              <p className="text-neutral-700 text-[11px]">
                To experience &ldquo;Still Here?&rdquo;, POND needs access to your <strong>webcam</strong>{" "}
                and <strong>microphone</strong>. Your video stream is analyzed locally in your browser for
                facial affect and gaze tracking.
              </p>
              <p className="text-neutral-600 text-[10px] italic">
                * No video recordings leave your computer. Processing runs client-side.
              </p>
            </div>
          </div>

          {errorNotice && (
            <div className="win98-bevel-in bg-amber-50 border border-amber-300 p-2 flex items-start gap-2 text-amber-900 text-[11px]">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>{errorNotice}</span>
            </div>
          )}

          <div className="win98-bevel-in bg-white p-2.5 text-[11px] font-mono text-neutral-800 space-y-1">
            <div className="flex items-center justify-between">
              <span>DEVICE [0]: Video Input (User Cam)</span>
              <span className="text-blue-800 font-bold">[READY]</span>
            </div>
            <div className="flex items-center justify-between">
              <span>DEVICE [1]: Audio Input (Microphone)</span>
              <span className="text-blue-800 font-bold">[READY]</span>
            </div>
            <div className="flex items-center justify-between">
              <span>STATUS: Awaiting User Authorization</span>
              <span className="text-amber-800 font-bold animate-pulse">[PENDING]</span>
            </div>
          </div>
        </div>

        {/* Wizard Footer Controls */}
        <div className="p-2.5 border-t border-neutral-400 bg-[#c0c0c0] flex items-center justify-between">
          <button
            onClick={handleSimulate}
            className="win98-bevel-button px-3 py-1.5 text-xs text-neutral-700 hover:text-black"
          >
            Skip (Offline Mode)
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={requestHardwareAccess}
              disabled={requesting}
              className="win98-bevel-button px-4 py-1.5 text-xs font-bold text-black flex items-center gap-1.5 bg-neutral-200"
            >
              <span>{requesting ? "Connecting..." : "Allow Camera & Mic"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
