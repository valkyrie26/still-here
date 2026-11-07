"use client";

import React, { useRef, useEffect, useState } from "react";
import { X, Camera, RefreshCw } from "lucide-react";

interface PolaroidViewerProps {
  isOpen: boolean;
  onClose: () => void;
  videoRef: React.RefObject<HTMLVideoElement>;
  shadowStage: number;
}

/**
 * PolaroidViewer Component
 * Captures the player's live face and synthesizes an eerie, aged polaroid snapshot
 * with a spectral shadow figure standing in their actual room behind them.
 */
export const PolaroidViewer: React.FC<PolaroidViewerProps> = ({
  isOpen,
  onClose,
  videoRef,
  shadowStage,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState<string>("");

  // Function to capture frame and composite the spectral figure
  const captureAndRenderPolaroid = () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;

    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1. Draw player's video frame (mirrored)
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    // 2. Apply vintage polaroid camera grading (slight desaturation, vintage grain)
    ctx.fillStyle = "rgba(40, 25, 10, 0.15)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 3. Composite ghostly shadow silhouette lurking behind shoulder
    const shadowOpacity = Math.max(0.45, Math.min(0.85, 0.35 + shadowStage * 0.18));
    ctx.save();
    ctx.fillStyle = `rgba(10, 12, 10, ${shadowOpacity})`;
    ctx.filter = "blur(5px)";

    // Shadow head & shoulders in the background corner
    const shadowX = canvas.width * 0.22;
    const shadowY = canvas.height * 0.28;

    ctx.beginPath();
    ctx.arc(shadowX, shadowY, 32, 0, Math.PI * 2); // Head
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(shadowX, shadowY + 65, 48, 60, 0, 0, Math.PI * 2); // Torso/shoulders
    ctx.fill();

    // Subtle haunting glowing eye pinpricks if high paranoia
    if (shadowStage >= 2) {
      ctx.filter = "none";
      ctx.fillStyle = "rgba(220, 240, 220, 0.85)";
      ctx.beginPath();
      ctx.arc(shadowX - 9, shadowY - 4, 2, 0, Math.PI * 2);
      ctx.arc(shadowX + 9, shadowY - 4, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 4. Subtle circular vignette
    const vignette = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      canvas.width * 0.25,
      canvas.width / 2,
      canvas.height / 2,
      canvas.width * 0.75
    );
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(1, "rgba(10,15,10,0.6)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const now = new Date();
    setTimestamp(
      `FILE_094 // ${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    );
    setPhotoDataUrl(canvas.toDataURL("image/jpeg", 0.9));
  };

  useEffect(() => {
    if (isOpen) {
      captureAndRenderPolaroid();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[8000] flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
      {/* Windows 98 Window Wrapper */}
      <div className="win98-bevel-out bg-[#c0c0c0] p-1 w-[360px] md:w-[410px] shadow-2xl animate-glitch">
        {/* Title Bar */}
        <div className="win98-titlebar flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-1.5 text-xs text-white">
            <Camera className="w-3.5 h-3.5" />
            <span>IMAGE_VIEWER // SURVEILLANCE_SNAPSHOT.POL</span>
          </div>
          <button
            onClick={onClose}
            className="win98-bevel-button w-5 h-4 flex items-center justify-center text-black font-bold text-xs"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Window Content */}
        <div className="p-4 flex flex-col items-center">
          {/* Physical Polaroid Card */}
          <div className="polaroid-frame p-3 pb-8 rounded-sm w-[300px] flex flex-col items-center text-neutral-800 transition-transform duration-300 hover:rotate-1">
            {/* The Photo itself */}
            <div className="w-[276px] h-[276px] bg-black overflow-hidden relative border border-neutral-300">
              {photoDataUrl ? (
                <img
                  src={photoDataUrl}
                  alt="Captured face Polaroid"
                  className="w-full h-full object-cover filter contrast-[1.15]"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400">
                  DEVELOPING FILM...
                </div>
              )}
            </div>

            {/* Handwritten Polaroid Bottom Caption */}
            <div className="w-full mt-3 px-1 flex flex-col items-start font-mono text-[11px] text-neutral-700 tracking-tight">
              <span className="font-semibold text-red-900 italic">
                &quot;who is standing behind you?&quot;
              </span>
              <span className="text-[10px] text-neutral-500 mt-0.5">{timestamp}</span>
            </div>
          </div>

          {/* Action Footer */}
          <div className="w-full mt-4 flex items-center justify-between text-xs font-mono">
            <span className="text-neutral-700 text-[11px]">STATUS: CACHED_LOCALLY</span>
            <div className="flex gap-2">
              <button
                onClick={captureAndRenderPolaroid}
                className="win98-bevel-button px-2 py-1 text-black flex items-center gap-1 text-[11px]"
              >
                <RefreshCw className="w-3 h-3" />
                Retake
              </button>
              <button
                onClick={onClose}
                className="win98-bevel-button px-3 py-1 text-black font-semibold text-[11px]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
