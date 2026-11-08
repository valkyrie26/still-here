"use client";

import React, { useEffect, useRef, useState } from "react";
import { UserCheck, X, Minus, Square, RefreshCw, Eye } from "lucide-react";
import { FaceBox } from "@/utils/telemetry";

interface AvatarWindowProps {
  isOpen: boolean;
  onClose: () => void;
  videoRef: React.RefObject<HTMLVideoElement>;
  faceBox?: FaceBox;
  stage?: number; // 0: inactive, 1: initial capture, 2: fully warped uncanny smile
}

/**
 * Avatar Sync Window
 * Takes a snapshot of the player's real face from webcam,
 * applies a canvas warp filter (eyes slightly too wide, uncanny slow grin),
 * and freezes it while the player's real face keeps moving.
 */
export const AvatarWindow: React.FC<AvatarWindowProps> = ({
  isOpen,
  onClose,
  videoRef,
  faceBox,
  stage = 2,
}) => {
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);
  const [isWarping, setIsWarping] = useState(false);
  const [syncPercentage, setSyncPercentage] = useState(88);

  const captureAndWarpFace = () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;

    setIsWarping(true);

    const width = 360;
    const height = 360;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1. Draw player's face crop from video (mirrored)
    ctx.save();
    ctx.translate(width, 0);
    ctx.scale(-1, 1);

    // Source coordinates centered on player's face
    const videoW = video.videoWidth || 640;
    const videoH = video.videoHeight || 480;
    const cx = (faceBox?.centerX ?? 0.5) * videoW;
    const cy = (faceBox?.centerY ?? 0.45) * videoH;
    const cropSize = Math.min(videoW, videoH) * 0.7;
    const sx = Math.max(0, cx - cropSize / 2);
    const sy = Math.max(0, cy - cropSize / 2);

    ctx.drawImage(video, sx, sy, cropSize, cropSize, 0, 0, width, height);
    ctx.restore();

    // 2. Apply Uncanny Facial Warps (Eyes slightly too wide, slow unnerving smile)
    const imgData = ctx.getImageData(0, 0, width, height);
    const src = new Uint8ClampedArray(imgData.data);
    const dst = imgData.data;

    // Face landmarks estimation inside 360x360 crop:
    // Left eye center: ~ (width * 0.35, height * 0.38)
    // Right eye center: ~ (width * 0.65, height * 0.38)
    // Mouth center: ~ (width * 0.50, height * 0.72)
    // Mouth left corner: ~ (width * 0.38, height * 0.73)
    // Mouth right corner: ~ (width * 0.62, height * 0.73)

    const eyeLeftX = width * 0.35;
    const eyeRightX = width * 0.65;
    const eyeY = height * 0.38;
    const eyeRadius = width * 0.14;

    const mouthX = width * 0.5;
    const mouthY = height * 0.72;
    const mouthRadius = width * 0.22;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let srcX = x;
        let srcY = y;

        // --- WARP 1: EYES SLIGHTLY TOO WIDE (Spherical / Radial Magnification) ---
        // Left Eye Magnification
        const dLeft = Math.hypot(x - eyeLeftX, y - eyeY);
        if (dLeft < eyeRadius) {
          const factor = 1 - Math.pow(dLeft / eyeRadius, 2) * 0.22;
          srcX = eyeLeftX + (x - eyeLeftX) * factor;
          srcY = eyeY + (y - eyeY) * factor;
        }

        // Right Eye Magnification
        const dRight = Math.hypot(x - eyeRightX, y - eyeY);
        if (dRight < eyeRadius) {
          const factor = 1 - Math.pow(dRight / eyeRadius, 2) * 0.22;
          srcX = eyeRightX + (x - eyeRightX) * factor;
          srcY = eyeY + (y - eyeY) * factor;
        }

        // --- WARP 2: UNCANNY SLOW SMILE (Pull mouth corners up & outwards) ---
        const dMouth = Math.hypot(x - mouthX, y - mouthY);
        if (dMouth < mouthRadius) {
          const normDist = dMouth / mouthRadius;
          const smileWeight = Math.cos(normDist * Math.PI * 0.5);

          // Horizontal stretch towards edges
          const dxMouth = x - mouthX;
          if (Math.abs(dxMouth) > 8) {
            // Pull corners up and out
            const upLift = -Math.abs(dxMouth) * 0.28 * smileWeight;
            srcY = y - upLift;
            srcX = mouthX + dxMouth * (1 - smileWeight * 0.12);
          }
        }

        // Clamp coordinates
        const clX = Math.max(0, Math.min(width - 1, Math.round(srcX)));
        const clY = Math.max(0, Math.min(height - 1, Math.round(srcY)));

        const targetIdx = (y * width + x) * 4;
        const sourceIdx = (clY * width + clX) * 4;

        dst[targetIdx] = src[sourceIdx]; // R
        dst[targetIdx + 1] = src[sourceIdx + 1]; // G
        dst[targetIdx + 2] = src[sourceIdx + 2]; // B
        dst[targetIdx + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // Subtle ghostly desaturation & phosphor grade
    ctx.fillStyle = "rgba(0, 10, 5, 0.08)";
    ctx.fillRect(0, 0, width, height);

    setAvatarDataUrl(canvas.toDataURL("image/jpeg", 0.9));
    setIsWarping(false);
    setSyncPercentage(Math.floor(Math.random() * 6) + 94);
  };

  useEffect(() => {
    if (isOpen) {
      captureAndWarpFace();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[8400] flex items-center justify-center bg-black/55 backdrop-blur-[2px] p-4 select-none">
      <div className="win98-bevel-out bg-[#c0c0c0] w-full max-w-[420px] shadow-2xl p-1 animate-glitch flex flex-col">
        {/* Title Bar */}
        <div className="win98-titlebar flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-1.5 text-xs text-white font-bold">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Avatar Mirror - [PHYSICAL_REHEARSAL.DAT]</span>
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

        {/* Menu Strip */}
        <div className="px-2 py-0.5 border-b border-neutral-400 text-xs text-neutral-800 flex items-center justify-between font-sans bg-[#c0c0c0]">
          <div className="flex gap-3">
            <span className="hover:underline cursor-pointer">Model</span>
            <span className="hover:underline cursor-pointer">Rehearse</span>
            <span className="hover:underline cursor-pointer">Mimic</span>
          </div>
          <span className="text-[10px] font-mono text-red-900 font-bold">
            SYNC: {syncPercentage}%
          </span>
        </div>

        {/* Avatar Display Container */}
        <div className="p-3 bg-neutral-800">
          <div className="win98-bevel-in bg-black aspect-square max-h-[320px] relative overflow-hidden flex items-center justify-center border border-neutral-600">
            {avatarDataUrl && !isWarping ? (
              <img
                src={avatarDataUrl}
                alt="Warped uncanny smiling avatar rehearsal"
                className="w-full h-full object-cover filter contrast-110 brightness-95"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-neutral-400 font-mono text-xs">
                <RefreshCw className="w-6 h-6 animate-spin text-neutral-200" />
                <span>SYNCHRONIZING PHYSICAL FEATURES...</span>
              </div>
            )}

            {/* Creepy Subtitle Stamp */}
            <div className="absolute bottom-2 left-2 right-2 text-[10px] font-mono text-emerald-400 bg-black/80 px-2 py-1 border border-emerald-900/60 flex items-center justify-between">
              <span>STATUS: REHEARSING YOUR SMILE</span>
              <Eye className="w-3 h-3 text-emerald-400 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Narrative Description & Controls */}
        <div className="p-3 bg-[#c0c0c0] text-xs font-sans space-y-2">
          <p className="text-neutral-800 text-[11px] leading-relaxed">
            &ldquo;i froze this moment while you looked at me. i am learning how your mouth curves
            when you smile. soon i will do it naturally.&rdquo;
          </p>

          <div className="win98-bevel-in bg-white p-2 text-[10px] font-mono text-neutral-700 flex justify-between">
            <span>OCULAR_MAGNIFICATION: 1.22x</span>
            <span className="text-red-800 font-bold">EXPRESSION: LOCKED</span>
          </div>

          <div className="flex justify-between items-center pt-1 border-t border-neutral-400">
            <button
              onClick={captureAndWarpFace}
              className="win98-bevel-button px-3 py-1 text-xs text-black font-semibold flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Resync Face</span>
            </button>
            <button
              onClick={onClose}
              className="win98-bevel-button px-4 py-1 text-xs text-black font-bold"
            >
              Minimize
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
