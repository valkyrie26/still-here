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
 * with a spectral ghostly figure standing in their actual room behind them.
 */
export const PolaroidViewer: React.FC<PolaroidViewerProps> = ({
  isOpen,
  onClose,
  videoRef,
  shadowStage,
}) => {
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState<string>("");

  // Function to capture frame and composite the ghostly entity
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

    // 2. Vintage camera grading (slight desaturation and sepia tone)
    ctx.fillStyle = "rgba(35, 25, 15, 0.12)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 3. Composite Pale Spectral Ghost Figure in the room behind the shoulder
    const ghostX = canvas.width * 0.22;
    const ghostY = canvas.height * 0.26;
    const effectiveStage = Math.max(1, shadowStage);

    ctx.save();

    // Ghostly Outer Glow
    const glow = ctx.createRadialGradient(ghostX, ghostY, 10, ghostX, ghostY, 65);
    glow.addColorStop(0, "rgba(220, 245, 235, 0.7)");
    glow.addColorStop(0.5, "rgba(160, 215, 200, 0.4)");
    glow.addColorStop(1, "rgba(20, 40, 30, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(ghostX, ghostY, 65, 0, Math.PI * 2);
    ctx.fill();

    // Ghost Pale Head Oval
    ctx.fillStyle = "rgba(230, 245, 240, 0.82)";
    ctx.beginPath();
    ctx.ellipse(ghostX, ghostY, 26, 34, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ghost Wispy Shroud/Shoulders
    ctx.fillStyle = "rgba(150, 205, 190, 0.55)";
    ctx.beginPath();
    ctx.ellipse(ghostX, ghostY + 48, 42, 45, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sunken Black Eye Sockets
    ctx.fillStyle = "#0a120e";
    ctx.beginPath();
    ctx.ellipse(ghostX - 10, ghostY - 3, 5, 8, 0, 0, Math.PI * 2);
    ctx.ellipse(ghostX + 10, ghostY - 3, 5, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Glowing Spectral Eye Pinpricks
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(ghostX - 10, ghostY - 3, 2, 0, Math.PI * 2);
    ctx.arc(ghostX + 10, ghostY - 3, 2, 0, Math.PI * 2);
    ctx.fill();

    // Distorted Hollow Mouth
    ctx.fillStyle = "#070c09";
    ctx.beginPath();
    ctx.ellipse(ghostX, ghostY + 16, 4, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // 4. Subtle Vignette
    const vignette = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      canvas.width * 0.3,
      canvas.width / 2,
      canvas.height / 2,
      canvas.width * 0.75
    );
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(1, "rgba(10,15,10,0.5)");
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
            {/* The Photo */}
            <div className="w-[276px] h-[276px] bg-black overflow-hidden relative border border-neutral-300">
              {photoDataUrl ? (
                <img
                  src={photoDataUrl}
                  alt="Captured face Polaroid"
                  className="w-full h-full object-cover filter contrast-[1.12]"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400 font-mono">
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
