"use client";

import React, { useEffect, useState } from "react";
import { X, Camera, RefreshCw, AlertTriangle } from "lucide-react";
import { FaceBox } from "@/utils/telemetry";

interface PhotoViewerProps {
  isOpen: boolean;
  onClose: () => void;
  videoRef: React.RefObject<HTMLVideoElement>;
  faceBox?: FaceBox;
}

/**
 * ScreenshotViewer Component
 * Captures the player's real webcam frame and composites a human-scaled, faded
 * ghostly clown lurking directly behind their head/shoulder like a shadow.
 */
export const PolaroidViewer: React.FC<PhotoViewerProps> = ({
  isOpen,
  onClose,
  videoRef,
  faceBox,
}) => {
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState<string>("");
  const [developing, setDeveloping] = useState(true);

  const captureAndRenderScreenshot = () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;

    setDeveloping(true);

    const canvas = document.createElement("canvas");
    canvas.width = 540;
    canvas.height = 420;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1. Draw player's webcam frame (mirrored)
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    // 2. Vintage surveillance CCTV grading
    ctx.fillStyle = "rgba(10, 20, 15, 0.15)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 3. Composite human-scaled, faded ghostly clown hiding behind shoulder/head
    const clownImg = new Image();
    // Using near unsmiling clown for life-sized shoulder/head reference
    clownImg.src = "/images/creepy_clown_not_smiling_near.png";

    clownImg.onload = () => {
      ctx.save();

      // Determine placement matching player's head position
      const headCenterX = faceBox ? faceBox.centerX * canvas.width : canvas.width * 0.5;
      const headCenterY = faceBox ? faceBox.centerY * canvas.height : canvas.height * 0.45;
      const openSide = faceBox?.openRoomSide || "right";

      // Scale clown to match human proportions right behind them
      const clownW = 220;
      const clownH = 260;

      // Position: hiding right behind user's shoulder / head
      const clownX =
        openSide === "right"
          ? Math.min(canvas.width - clownW - 20, headCenterX + 35)
          : Math.max(20, headCenterX - clownW - 35);
      const clownY = Math.max(15, headCenterY - 110);

      // Eerie shadow aura behind clown
      const aura = ctx.createRadialGradient(
        clownX + clownW / 2,
        clownY + clownH / 2,
        20,
        clownX + clownW / 2,
        clownY + clownH / 2,
        clownW / 2 + 30
      );
      aura.addColorStop(0, "rgba(0, 0, 0, 0.6)");
      aura.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = aura;
      ctx.fillRect(clownX - 30, clownY - 30, clownW + 60, clownH + 60);

      // Faded, ghostly opacity (~75%) so it blends eerily like a shadow into the real room
      ctx.globalAlpha = 0.78;
      ctx.filter = "contrast(1.2) brightness(0.85) blur(0.6px)";
      ctx.drawImage(clownImg, clownX, clownY, clownW, clownH);
      ctx.restore();

      // 4. Subtle camera vignette & scanline grain
      const vignette = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        canvas.width * 0.3,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width * 0.75
      );
      vignette.addColorStop(0, "rgba(0,0,0,0)");
      vignette.addColorStop(1, "rgba(5,10,5,0.65)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const now = new Date();
      setTimestamp(
        `AUTO_SCREENSHOT_CH01 // ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`
      );
      setPhotoDataUrl(canvas.toDataURL("image/jpeg", 0.92));
      setDeveloping(false);
    };

    // Fallback if image caching takes a moment
    setTimeout(() => {
      if (!photoDataUrl) {
        setPhotoDataUrl(canvas.toDataURL("image/jpeg", 0.85));
        setDeveloping(false);
      }
    }, 400);
  };

  useEffect(() => {
    if (isOpen) {
      captureAndRenderScreenshot();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[8000] flex items-center justify-center bg-black/70 backdrop-blur-[3px] p-4">
      {/* Windows 98 Image Viewer Window */}
      <div className="win98-bevel-out bg-[#c0c0c0] p-1 w-full max-w-[560px] shadow-2xl animate-glitch">
        {/* Title Bar */}
        <div className="win98-titlebar-corrupted flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-1.5 text-xs text-white">
            <Camera className="w-3.5 h-3.5 text-red-300" />
            <span>POND_OS // CAPTURED_FRAME_094.BMP</span>
          </div>
          <button
            onClick={onClose}
            className="win98-bevel-button w-5 h-4 flex items-center justify-center text-black font-bold text-xs"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 flex flex-col items-center">
          {/* Photo Frame */}
          <div className="win98-bevel-in bg-black w-full aspect-[4/3] max-h-[380px] overflow-hidden relative flex items-center justify-center">
            {photoDataUrl && !developing ? (
              <img
                src={photoDataUrl}
                alt="Captured camera frame with shadow entity"
                className="w-full h-full object-cover filter contrast-[1.08]"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-neutral-400 font-mono text-xs">
                <RefreshCw className="w-6 h-6 animate-spin text-neutral-300" />
                <span>PROCESSING SURVEILLANCE BUFFER...</span>
              </div>
            )}

            {/* Red REC Watermark */}
            <div className="absolute top-2 left-2 flex items-center gap-1.5 text-[10px] font-mono text-red-500 font-bold bg-black/60 px-2 py-0.5 rounded">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              <span>RECORDED_FRAME</span>
            </div>
          </div>

          {/* Caption Ticker */}
          <div className="w-full mt-2.5 px-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1 font-mono text-[11px] text-neutral-800">
            <span className="text-red-900 font-bold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-red-700 inline" />
              &quot;look behind you. what is that?&quot;
            </span>
            <span className="text-[10px] text-neutral-600">{timestamp}</span>
          </div>

          {/* Action Buttons */}
          <div className="w-full mt-3 pt-2 border-t border-neutral-400 flex items-center justify-between text-xs font-mono">
            <span className="text-neutral-600 text-[11px]">FORMAT: RAW_RGB_FRAME</span>
            <div className="flex gap-2">
              <button
                onClick={captureAndRenderScreenshot}
                className="win98-bevel-button px-2.5 py-1 text-black flex items-center gap-1 text-[11px]"
              >
                <RefreshCw className="w-3 h-3" />
                Retake
              </button>
              <button
                onClick={onClose}
                className="win98-bevel-button px-4 py-1 text-black font-semibold text-[11px]"
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
