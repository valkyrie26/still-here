"use client";

import React, { useEffect, useState, useRef } from "react";
import { X, Minus, Square, Image as ImageIcon, RefreshCw, ZoomIn, Printer } from "lucide-react";
import { FaceBox } from "@/utils/telemetry";
import { compositeLayeredScreenshot } from "@/utils/segmentation";

interface PhotoViewerProps {
  isOpen: boolean;
  onClose: () => void;
  videoRef: React.RefObject<HTMLVideoElement>;
  faceBox?: FaceBox;
  onPhotoCaptured?: (dataUrl: string) => void;
}

/**
 * Clean Windows 98 Photo Viewer ("Imaging for Windows")
 * Composites 3 Layers:
 * 1. Background room
 * 2. Ghost entity (creepy_clown_standing, dark, blurry, half-hidden, grounded from bottom)
 * 3. Person Cutout strictly ON TOP so ghost is physically BEHIND player.
 */
export const PolaroidViewer: React.FC<PhotoViewerProps> = ({
  isOpen,
  onClose,
  videoRef,
  faceBox,
  onPhotoCaptured,
}) => {
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState<string>("");
  const [developing, setDeveloping] = useState(true);
  const clownImageRef = useRef<HTMLImageElement | null>(null);

  // Preload clown standing image
  useEffect(() => {
    const img = new Image();
    img.src = "/images/creepy_clown_standing.png";
    clownImageRef.current = img;
  }, []);

  const captureAndRenderScreenshot = async () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;

    setDeveloping(true);

    try {
      let clownImg = clownImageRef.current;
      if (!clownImg || !clownImg.complete) {
        clownImg = new Image();
        clownImg.src = "/images/creepy_clown_standing.png";
        await new Promise((resolve) => {
          clownImg!.onload = resolve;
          clownImg!.onerror = resolve;
        });
      }

      // True 3-layer compositing: Background -> Ghost -> Person Cutout on top
      const dataUrl = await compositeLayeredScreenshot(video, clownImg!, { faceBox });

      const now = new Date();
      setTimestamp(`${now.toLocaleDateString()} ${now.toLocaleTimeString()}`);
      setPhotoDataUrl(dataUrl);
      setDeveloping(false);

      if (onPhotoCaptured && dataUrl) {
        onPhotoCaptured(dataUrl);
      }
    } catch (err) {
      console.warn("Screenshot compositing error:", err);
      setDeveloping(false);
    }
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
            UNIDENTIFIED ENTITY DETECTED BEHIND PLAYER
          </span>
        </div>

        {/* Image Content Container */}
        <div className="p-2.5 bg-[#808080]">
          <div className="win98-bevel-in bg-black w-full aspect-[4/3] max-h-[420px] overflow-hidden relative flex items-center justify-center">
            {photoDataUrl && !developing ? (
              <img
                src={photoDataUrl}
                alt="Captured surveillance frame with entity standing behind player"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-neutral-400 font-mono text-xs">
                <RefreshCw className="w-6 h-6 animate-spin text-neutral-300" />
                <span>COMPOSITING 3-LAYER DEPTH BITMAP...</span>
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
            <span className="font-mono text-red-800 font-bold">DEPTH: BEHIND SUBJECT</span>
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
