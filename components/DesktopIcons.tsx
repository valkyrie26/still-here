"use client";

import React from "react";
import { Monitor, Trash2, FileText, Image as ImageIcon, Film } from "lucide-react";
import { DesktopFileType } from "./FileViewerModal";

interface DesktopIconProps {
  onOpenPolaroid: () => void;
  onOpenReadme: () => void;
  onOpenFile: (file: DesktopFileType) => void;
  onTriggerError: () => void;
  anomaliesDiscovered: number;
  spawnedFiles?: {
    poem?: boolean;
    notes?: boolean;
    reflection?: boolean;
    video?: boolean;
  };
}

export const DesktopIcons: React.FC<DesktopIconProps> = ({
  onOpenPolaroid,
  onOpenReadme,
  onOpenFile,
  onTriggerError,
  anomaliesDiscovered,
  spawnedFiles = {},
}) => {
  return (
    <div className="absolute top-12 left-4 flex flex-col gap-5 z-10 select-none">
      {/* 1. My Computer */}
      <button
        onDoubleClick={onTriggerError}
        className="flex flex-col items-center w-20 p-1 rounded hover:bg-blue-900/40 focus:bg-blue-900/60 focus:outline-dashed focus:outline-1 focus:outline-white text-white group"
      >
        <div className="w-10 h-10 bg-amber-200/90 rounded-sm border border-neutral-700 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
          <Monitor className="w-6 h-6 text-neutral-800" />
        </div>
        <span className="text-[11px] mt-1 font-sans text-center drop-shadow-[0_1px_2px_rgba(0,0,0,1)]">
          My Computer
        </span>
      </button>

      {/* 2. Recycle Bin */}
      <button
        onDoubleClick={onTriggerError}
        className="flex flex-col items-center w-20 p-1 rounded hover:bg-blue-900/40 focus:bg-blue-900/60 focus:outline-dashed focus:outline-1 focus:outline-white text-white group"
      >
        <div className="w-10 h-10 bg-neutral-300 rounded-sm border border-neutral-700 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
          <Trash2 className="w-6 h-6 text-neutral-700" />
        </div>
        <span className="text-[11px] mt-1 font-sans text-center drop-shadow-[0_1px_2px_rgba(0,0,0,1)]">
          Recycle Bin
        </span>
      </button>

      {/* 3. README.txt */}
      <button
        onDoubleClick={onOpenReadme}
        onClick={onOpenReadme}
        className="flex flex-col items-center w-20 p-1 rounded hover:bg-blue-900/40 focus:bg-blue-900/60 focus:outline-dashed focus:outline-1 focus:outline-white text-white group"
      >
        <div className="w-10 h-10 bg-white rounded-sm border border-neutral-700 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform relative">
          <FileText className="w-6 h-6 text-blue-700" />
        </div>
        <span className="text-[11px] mt-1 font-sans text-center drop-shadow-[0_1px_2px_rgba(0,0,0,1)] text-amber-200 font-semibold">
          README.txt
        </span>
      </button>

      {/* 4. ROOM_01.bmp (Polaroid / Imaging) */}
      <button
        onDoubleClick={onOpenPolaroid}
        onClick={onOpenPolaroid}
        className="flex flex-col items-center w-20 p-1 rounded hover:bg-blue-900/40 focus:bg-blue-900/60 focus:outline-dashed focus:outline-1 focus:outline-white text-white group"
      >
        <div className="w-10 h-10 bg-neutral-100 rounded-sm border-2 border-red-800 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform relative">
          <ImageIcon className="w-6 h-6 text-neutral-800" />
          {anomaliesDiscovered > 0 && (
            <span className="absolute -bottom-1 -right-1 bg-red-600 text-white text-[9px] px-1 rounded-sm font-bold animate-pulse">
              !
            </span>
          )}
        </div>
        <span className="text-[11px] mt-1 font-sans text-center drop-shadow-[0_1px_2px_rgba(0,0,0,1)] text-red-300 font-bold">
          ROOM_01.bmp
        </span>
      </button>

      {/* 5. SPAWNED FILE: notes_about_you.txt */}
      {spawnedFiles.notes && (
        <button
          onClick={() => onOpenFile("notes")}
          onDoubleClick={() => onOpenFile("notes")}
          className="flex flex-col items-center w-20 p-1 rounded hover:bg-blue-900/40 focus:bg-blue-900/60 focus:outline-dashed focus:outline-1 focus:outline-white text-white group animate-bounce"
        >
          <div className="w-10 h-10 bg-amber-50 rounded-sm border border-red-700 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform relative">
            <FileText className="w-6 h-6 text-red-700" />
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] px-1 rounded-full font-bold">
              NEW
            </span>
          </div>
          <span className="text-[10px] mt-1 font-sans text-center drop-shadow-[0_1px_2px_rgba(0,0,0,1)] text-red-200 font-bold leading-tight">
            notes_about_you.txt
          </span>
        </button>
      )}

      {/* 6. SPAWNED FILE: poem.txt */}
      {spawnedFiles.poem && (
        <button
          onClick={() => onOpenFile("poem")}
          onDoubleClick={() => onOpenFile("poem")}
          className="flex flex-col items-center w-20 p-1 rounded hover:bg-blue-900/40 focus:bg-blue-900/60 focus:outline-dashed focus:outline-1 focus:outline-white text-white group animate-bounce"
        >
          <div className="w-10 h-10 bg-white rounded-sm border border-neutral-700 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform relative">
            <FileText className="w-6 h-6 text-purple-700" />
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] px-1 rounded-full font-bold">
              NEW
            </span>
          </div>
          <span className="text-[10px] mt-1 font-sans text-center drop-shadow-[0_1px_2px_rgba(0,0,0,1)] text-purple-200 font-semibold leading-tight">
            poem.txt
          </span>
        </button>
      )}

      {/* 7. SPAWNED FILE: reflection.bmp */}
      {spawnedFiles.reflection && (
        <button
          onClick={() => onOpenFile("reflection")}
          onDoubleClick={() => onOpenFile("reflection")}
          className="flex flex-col items-center w-20 p-1 rounded hover:bg-blue-900/40 focus:bg-blue-900/60 focus:outline-dashed focus:outline-1 focus:outline-white text-white group"
        >
          <div className="w-10 h-10 bg-neutral-200 rounded-sm border border-red-700 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform relative">
            <ImageIcon className="w-6 h-6 text-red-800" />
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] px-1 rounded-full font-bold">
              !
            </span>
          </div>
          <span className="text-[10px] mt-1 font-sans text-center drop-shadow-[0_1px_2px_rgba(0,0,0,1)] text-red-300 font-bold leading-tight">
            reflection.bmp
          </span>
        </button>
      )}

      {/* 8. SPAWNED FILE: you_sleeping.avi */}
      {spawnedFiles.video && (
        <button
          onClick={() => onOpenFile("video")}
          onDoubleClick={() => onOpenFile("video")}
          className="flex flex-col items-center w-20 p-1 rounded hover:bg-blue-900/40 focus:bg-blue-900/60 focus:outline-dashed focus:outline-1 focus:outline-white text-white group animate-pulse"
        >
          <div className="w-10 h-10 bg-neutral-900 rounded-sm border-2 border-red-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform relative">
            <Film className="w-6 h-6 text-red-500" />
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] px-1 rounded-full font-bold">
              REC
            </span>
          </div>
          <span className="text-[10px] mt-1 font-sans text-center drop-shadow-[0_1px_2px_rgba(0,0,0,1)] text-red-400 font-extrabold leading-tight">
            you_sleeping.avi
          </span>
        </button>
      )}
    </div>
  );
};
