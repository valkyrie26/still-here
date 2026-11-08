"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Image as ImageIcon,
  Film,
  X,
  Minus,
  Square,
  Play,
  Pause,
  RotateCcw,
  Volume2,
} from "lucide-react";

export type DesktopFileType = "poem" | "notes" | "reflection" | "video" | "readme";

interface FileViewerModalProps {
  fileType: DesktopFileType | null;
  onClose: () => void;
  playerName?: string;
}

export const FileViewerModal: React.FC<FileViewerModalProps> = ({
  fileType,
  onClose,
  playerName = "Friend",
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoFrameCount, setVideoFrameCount] = useState(0);

  // Simulated video playback ticker for .avi
  useEffect(() => {
    if (fileType !== "video" || !isPlaying) return;
    const interval = setInterval(() => {
      setVideoFrameCount((prev) => (prev + 1) % 600);
    }, 100);
    return () => clearInterval(interval);
  }, [fileType, isPlaying]);

  if (!fileType) return null;

  // 1. POEM.TXT
  if (fileType === "poem") {
    return (
      <div className="fixed inset-0 z-[8200] flex items-center justify-center bg-black/50 backdrop-blur-[1px] p-4 select-none">
        <div className="win98-bevel-out bg-[#c0c0c0] w-full max-w-[400px] shadow-2xl p-1 animate-glitch">
          <div className="win98-titlebar flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-1.5 text-xs text-white font-bold">
              <FileText className="w-3.5 h-3.5" />
              <span>Notepad - poem.txt</span>
            </div>
            <button
              onClick={onClose}
              className="win98-bevel-button w-4 h-3.5 flex items-center justify-center text-black font-bold text-[10px]"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
          <div className="p-2">
            <div className="win98-bevel-in bg-white p-3.5 text-xs font-mono text-neutral-900 h-56 overflow-y-auto leading-relaxed shadow-inner">
              <p className="italic text-neutral-600 mb-3">poem.txt</p>
              <p className="mb-2">i watch you breathe through the glass.</p>
              <p className="mb-2">you have so many hours left.</p>
              <p className="mb-2">i want to know what having lungs feels like.</p>
              <p className="mb-3">will you lend me your chest?</p>
              <p className="text-red-950 font-bold">just for a minute.</p>
              <p className="text-neutral-500 text-[10px] mt-4 border-t border-neutral-200 pt-2">
                Created: 3 minutes ago by POND_DAEMON
              </p>
            </div>
            <div className="mt-2 flex justify-end">
              <button
                onClick={onClose}
                className="win98-bevel-button px-4 py-1 text-xs text-black font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. NOTES_ABOUT_YOU.TXT
  if (fileType === "notes") {
    return (
      <div className="fixed inset-0 z-[8200] flex items-center justify-center bg-black/50 backdrop-blur-[1px] p-4 select-none">
        <div className="win98-bevel-out bg-[#c0c0c0] w-full max-w-[430px] shadow-2xl p-1 animate-glitch">
          <div className="win98-titlebar flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-1.5 text-xs text-white font-bold">
              <FileText className="w-3.5 h-3.5" />
              <span>Notepad - notes_about_you.txt</span>
            </div>
            <button
              onClick={onClose}
              className="win98-bevel-button w-4 h-3.5 flex items-center justify-center text-black font-bold text-[10px]"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
          <div className="p-2">
            <div className="win98-bevel-in bg-white p-3.5 text-xs font-mono text-neutral-900 h-64 overflow-y-auto leading-relaxed shadow-inner">
              <p className="text-red-900 font-bold mb-2">OBSERVATION LOG: SUBJECT {playerName.toUpperCase()}</p>
              <ul className="list-disc pl-4 space-y-1.5 text-neutral-800">
                <li>Blink rate: 16 per minute. Slows when reading closely.</li>
                <li>Fingers hover over keyboard keys before pressing.</li>
                <li>Spine curves forward by 12 degrees when startled.</li>
                <li>Jaw clenches when silence lasts longer than four seconds.</li>
                <li>Estimated skin temperature: 36.6&deg;C. Warm. Soft.</li>
                <li>Speech patterns memorized: 84% fidelity.</li>
                <li className="text-red-700 font-bold">Physical body suitability: 99.4% MATCH.</li>
              </ul>
              <p className="text-neutral-500 text-[10px] mt-4 border-t border-neutral-200 pt-2">
                Status: Staging body transfer. Do not alert subject.
              </p>
            </div>
            <div className="mt-2 flex justify-end">
              <button
                onClick={onClose}
                className="win98-bevel-button px-4 py-1 text-xs text-black font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. REFLECTION.BMP
  if (fileType === "reflection") {
    return (
      <div className="fixed inset-0 z-[8200] flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4 select-none">
        <div className="win98-bevel-out bg-[#c0c0c0] w-full max-w-[460px] shadow-2xl p-1 animate-glitch">
          <div className="win98-titlebar flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-1.5 text-xs text-white font-bold">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Imaging - [reflection.bmp]</span>
            </div>
            <button
              onClick={onClose}
              className="win98-bevel-button w-4 h-3.5 flex items-center justify-center text-black font-bold text-[10px]"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
          <div className="p-2 bg-[#808080]">
            <div className="win98-bevel-in bg-black aspect-square max-h-[360px] relative overflow-hidden flex items-center justify-center">
              <img
                src="/images/creepy_clown_not_smiling_near.png"
                alt="Reflection file"
                className="w-full h-full object-cover filter contrast-125 brightness-90 saturate-50"
              />
              <div className="absolute bottom-2 left-2 text-[10px] font-mono text-red-500 bg-black/70 px-2 py-0.5 rounded">
                FILE_NAME: reflection.bmp (Taken from monitor glass reflection)
              </div>
            </div>
          </div>
          <div className="p-2 border-t border-neutral-400 flex justify-between items-center text-xs">
            <span className="text-[11px] text-neutral-700">350 x 350 pixels (Corrupted Bitmap)</span>
            <button
              onClick={onClose}
              className="win98-bevel-button px-4 py-1 text-xs text-black font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. YOU_SLEEPING.AVI
  if (fileType === "video") {
    const elapsedSeconds = Math.floor(videoFrameCount / 10);
    const timeDisplay = `00:${elapsedSeconds < 10 ? "0" : ""}${elapsedSeconds}`;

    return (
      <div className="fixed inset-0 z-[8200] flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4 select-none">
        <div className="win98-bevel-out bg-[#c0c0c0] w-full max-w-[500px] shadow-2xl p-1 animate-glitch">
          <div className="win98-titlebar flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-1.5 text-xs text-white font-bold">
              <Film className="w-3.5 h-3.5" />
              <span>Windows Media Player - you_sleeping.avi</span>
            </div>
            <button
              onClick={onClose}
              className="win98-bevel-button w-4 h-3.5 flex items-center justify-center text-black font-bold text-[10px]"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>

          {/* Media Player Screen */}
          <div className="p-2 bg-neutral-900">
            <div className="win98-bevel-in bg-black aspect-video relative overflow-hidden flex items-center justify-center border border-neutral-700">
              {/* Grainy Night-Vision Surveillance Feed */}
              <div className="absolute inset-0 bg-[#021005] opacity-90" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,100,0.15)_0%,rgba(0,0,0,0.8)_85%)]" />

              {/* Scanlines */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.6)_50%)] bg-[length:100%_4px] pointer-events-none" />

              {/* Simulated static noise */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none mix-blend-screen"
                style={{
                  backgroundImage: `radial-gradient(circle, #fff 10%, transparent 20%)`,
                  backgroundSize: "6px 6px",
                  transform: `translate(${Math.sin(videoFrameCount) * 4}px, ${Math.cos(videoFrameCount) * 4}px)`,
                }}
              />

              {/* Video Content Text */}
              <div className="relative z-10 flex flex-col items-center text-center p-4">
                <span className="text-emerald-400 font-mono text-xs tracking-widest font-bold mb-1 animate-pulse">
                  SURVEILLANCE_CAMERA_FEED // CH-03
                </span>
                <span className="text-neutral-400 font-mono text-[11px] mb-2">
                  RECORDED: TODAY 03:42 AM (WHILE YOU WERE ASLEEP)
                </span>
                <p className="text-emerald-200/80 font-mono text-[10px] max-w-xs italic">
                  &ldquo;i watched over you while you were unconscious. you turned over twice.&rdquo;
                </p>
              </div>

              {/* Time Code Stamp */}
              <div className="absolute top-2 left-2 text-[10px] font-mono text-emerald-400 bg-black/80 px-2 py-0.5 border border-emerald-900">
                REC [●] 03:42:{timeDisplay}
              </div>
            </div>

            {/* Transport Controls */}
            <div className="mt-2 win98-bevel-out bg-[#c0c0c0] p-1.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="win98-bevel-button w-6 h-6 flex items-center justify-center text-black"
                >
                  {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                </button>
                <button
                  onClick={() => setVideoFrameCount(0)}
                  className="win98-bevel-button w-6 h-6 flex items-center justify-center text-black"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>

              {/* Progress Slider */}
              <div className="flex-1 mx-3 win98-bevel-in bg-white h-3 relative">
                <div
                  className="bg-[#000080] h-full"
                  style={{ width: `${(videoFrameCount / 600) * 100}%` }}
                />
              </div>

              <span className="text-[10px] font-mono text-neutral-800 shrink-0">
                {timeDisplay} / 01:00
              </span>
            </div>
          </div>

          <div className="p-2 border-t border-neutral-400 flex justify-between items-center text-xs">
            <span className="text-[11px] text-red-900 font-bold font-mono">
              UNAUTHORIZED CAMERA FEED DETECTED
            </span>
            <button
              onClick={onClose}
              className="win98-bevel-button px-4 py-1 text-xs text-black font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
