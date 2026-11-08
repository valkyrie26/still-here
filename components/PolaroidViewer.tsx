"use client";

import React, { useEffect, useState } from "react";
import { X, Minus, Square, Image as ImageIcon, RefreshCw, ZoomIn, Printer } from "lucide-react";
import { FaceBox } from "@/utils/telemetry";

interface PhotoViewerProps {
  isOpen: boolean;
  onClose: () => void;
  videoRef: React.RefObject<HTMLVideoElement>;
  faceBox?: FaceBox;
}

/**
 * Clean Windows 98 Photo Viewer ("Imaging for Windows")
 * Captures player's frame and composites creepy_clown_standing standing
 * from the bottom of the frame behind the player like a full-bodied ghost.
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
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1. Draw player's webcam frame (mirrored)
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    // 2. Vintage camera grading
    ctx.fillStyle = "rgba(10, 20, 15, 0.08)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 3. Composite creepy_clown_standing standing from bottom of frame
    const clownImg = new Image();
    clownImg.src = "/images/creepy_clown_standing.png";

    clownImg.onload = () => {
      ctx.save();

      const openSide = faceBox?.openRoomSide || "right";

      // Height: stands tall from the bottom of the frame (approx 85% of frame height)
      const clownH = Math.round(canvas.height * 0.88);
      const clownW = clownH; // 350x350 square image

      // Y position: grounded directly at the bottom edge of the frame
      const clownY = canvas.height - clownH;

      // X position: standing in the room behind the user's shoulder
      const clownX =
        openSide === "right"
          ? canvas.width - clownW + 35
          : -35;

      // Floor shadow under clown's feet
      ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
      ctx.beginPath();
      ctx.ellipse(clownX + clownW / 2, canvas.height - 12, clownW * 0.32, 16, 0, 0, Math.PI * 2);
      ctx.fill();

      // Faded ghostly opacity (~82%) with slight soft edge
      ctx.globalAlpha = 0.82;
      ctx.filter = "contrast(1.15) brightness(0.88)";
      ctx.drawImage(clownImg, clownX, clownY, clownW, clownH);
      ctx.restore();

      // 4. Subtle camera vignette
      const vignette = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        canvas.width * 0.35,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width * 0.75
      );
      vignette.addColorStop(0, "rgba(0,0,0,0)");
      vignette.addColorStop(1, "rgba(0,10,0,0.5)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const now = new Date();
      setTimestamp(`${now.toLocaleDateString()} ${now.toLocaleTimeString()}`);
      setPhotoDataUrl(canvas.toDataURL("image/jpeg", 0.94));
      setDeveloping(false);
    };

    setTimeout(() => {
      if (!photoDataUrl) {
        setPhotoDataUrl(canvas.toDataURL("image/jpeg", 0.88));
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
    <div className="fixed inset-0 z-[8000] flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4 select-none">
      {/* Clean Windows 98 Image Viewer Window */}
      <div className="win98-bevel-out bg-[#c0c0c0] p-1 w-full max-w-[620px] shadow-2xl animate-glitch flex flex-col">
        {/* Title Bar */}
        <div className="win98-titlebar flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-1.5 text-xs text-white font-bold">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Imaging - [SURVEILLANCE_ROOM_01.BMP]</span>
          </div>
          <div className="flex items-center gap-1">
            <button className="win98-bevel-button w-4 h-3.5 flex items-center justify-center text-black text-[10px]">
              <Minus className="w-2.5 h-2.5" />
            </button>
            <button className="win98-bevel-button w-4 h-3.5 flex items-center justify-center text-black text-[10px]">
              <Square className="w-2.5 h-2.5" />
            </button>
            <button
              onClick={onClose}
              className="win98-bevel-button w-4 h-3.5 flex items-center justify-center text-black font-bold text-[10px]"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>

        {/* Windows 98 Menu Bar */}
        <div className="px-2 py-0.5 border-b border-neutral-400 text-xs text-neutral-800 flex items-center gap-3 font-sans bg-[#c0c0c0]">
          <span className="hover:underline cursor-pointer">File</span>
          <span className="hover:underline cursor-pointer">Edit</span>
          <span className="hover:underline cursor-pointer">View</span>
          <span className="hover:underline cursor-pointer">Page</span>
          <span className="hover:underline cursor-pointer">Zoom</span>
          <span className="hover:underline cursor-pointer">Help</span>
        </div>

        {/* Toolbar */}
        <div className="px-2 py-1 border-b border-neutral-400 flex items-center gap-2 bg-[#d4d0c8] text-xs">
          <button
            onClick={captureAndRenderScreenshot}
            className="win98-bevel-button px-2 py-0.5 flex items-center gap-1 text-[11px] text-black"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Refresh</span>
          </button>
          <div className="h-4 w-px bg-neutral-400" />
          <span className="text-[11px] text-neutral-700 flex items-center gap-1">
            <ZoomIn className="w-3 h-3" /> 100%
          </span>
          <div className="h-4 w-px bg-neutral-400" />
          <span className="text-[11px] text-red-900 font-semibold italic ml-auto">
            UNIDENTIFIED SHADOW DETECTED IN ROOM
          </span>
        </div>

        {/* Image Content Container */}
        <div className="p-2.5 bg-[#808080]">
          <div className="win98-bevel-in bg-black w-full aspect-[4/3] max-h-[420px] overflow-hidden relative flex items-center justify-center">
            {photoDataUrl && !developing ? (
              <img
                src={photoDataUrl}
                alt="Captured surveillance frame with standing clown"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-neutral-400 font-mono text-xs">
                <RefreshCw className="w-6 h-6 animate-spin text-neutral-300" />
                <span>RENDERING HIGH-RES BITMAP...</span>
              </div>
            )}

            {/* REC Timestamp Watermark */}
            <div className="absolute top-2 left-2 flex items-center gap-1 text-[10px] font-mono text-white/80 bg-black/60 px-2 py-0.5 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
              <span>CH-01_STILL // {timestamp}</span>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="px-2 py-0.5 border-t border-neutral-400 flex items-center justify-between text-[11px] font-sans text-neutral-700 bg-[#c0c0c0]">
          <span>640 x 480 pixels | 24-bit TrueColor</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-red-800 font-bold">STATUS: OBSERVED</span>
            <button
              onClick={onClose}
              className="win98-bevel-button px-3 py-0.5 text-xs text-black font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
