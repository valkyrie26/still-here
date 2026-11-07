"use client";

import React, { useRef, useEffect, useState } from "react";
import { X, Camera, RefreshCw } from "lucide-react";

interface PolaroidViewerProps {
  isOpen: boolean;
  onClose: () => void;
  videoRef: React.RefObject<HTMLVideoElement>;
  clownStage: "none" | "standing_far" | "near_unsmiling" | "jumpscare_smiling";
  openRoomSide?: "left" | "right";
}

/**
 * PolaroidViewer Component
 * Captures the player's live face and composites the custom creepy clown entity
 * standing in their actual room behind them into the Polaroid frame.
 */
export const PolaroidViewer: React.FC<PolaroidViewerProps> = ({
  isOpen,
  onClose,
  videoRef,
  clownStage,
  openRoomSide = "right",
}) => {
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState<string>("");

  const captureAndRenderPolaroid = () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;

    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1. Draw player's video frame (mirrored horizontally)
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    // 2. Vintage camera grading filter
    ctx.fillStyle = "rgba(40, 25, 10, 0.12)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 3. Load and composite the actual clown image in the background of the room
    const clownImg = new Image();
    const imageSrc =
      clownStage === "standing_far"
        ? "/images/creepy_clown_standing.png"
        : "/images/creepy_clown_not_smiling_near.png";

    clownImg.src = imageSrc;
    clownImg.onload = () => {
      ctx.save();

      if (clownStage === "standing_far") {
        // Place standing clown far away in the open room corner
        const clownW = 75;
        const clownH = 120;
        const clownX = openRoomSide === "left" ? 30 : canvas.width - clownW - 30;
        const clownY = 45;

        // Shadow under clown feet
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        ctx.beginPath();
        ctx.ellipse(clownX + clownW / 2, clownY + clownH - 5, 25, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 0.88;
        ctx.drawImage(clownImg, clownX, clownY, clownW, clownH);
      } else {
        // Near clown standing directly behind chair
        const clownW = 130;
        const clownH = 180;
        const clownX = openRoomSide === "left" ? 40 : canvas.width - clownW - 40;
        const clownY = 30;

        ctx.globalAlpha = 0.95;
        ctx.drawImage(clownImg, clownX, clownY, clownW, clownH);
      }
      ctx.restore();

      // 4. Subtle circular vignette
      const vignette = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        canvas.width * 0.28,
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
      setPhotoDataUrl(canvas.toDataURL("image/jpeg", 0.92));
    };

    // Fallback if image load takes time
    setTimeout(() => {
      if (!photoDataUrl) {
        setPhotoDataUrl(canvas.toDataURL("image/jpeg", 0.85));
      }
    }, 200);
  };

  useEffect(() => {
    if (isOpen) {
      captureAndRenderPolaroid();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[8000] flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
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

        {/* Content */}
        <div className="p-4 flex flex-col items-center">
          <div className="polaroid-frame p-3 pb-8 rounded-sm w-[300px] flex flex-col items-center text-neutral-800 transition-transform duration-300 hover:rotate-1">
            <div className="w-[276px] h-[276px] bg-black overflow-hidden relative border border-neutral-300">
              {photoDataUrl ? (
                <img
                  src={photoDataUrl}
                  alt="Captured face Polaroid with clown"
                  className="w-full h-full object-cover filter contrast-[1.12]"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400 font-mono">
                  DEVELOPING FILM...
                </div>
              )}
            </div>

            {/* Handwritten Caption */}
            <div className="w-full mt-3 px-1 flex flex-col items-start font-mono text-[11px] text-neutral-700 tracking-tight">
              <span className="font-semibold text-red-900 italic">
                &quot;who is standing behind you?&quot;
              </span>
              <span className="text-[10px] text-neutral-500 mt-0.5">{timestamp}</span>
            </div>
          </div>

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
