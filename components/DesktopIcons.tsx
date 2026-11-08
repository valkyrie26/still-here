"use client";

import React from "react";
import { Monitor, Trash2, FileText, Image as ImageIcon } from "lucide-react";

interface DesktopIconProps {
  onOpenPolaroid: () => void;
  onOpenReadme: () => void;
  onTriggerError: () => void;
  anomaliesDiscovered: number;
}

export const DesktopIcons: React.FC<DesktopIconProps> = ({
  onOpenPolaroid,
  onOpenReadme,
  onTriggerError,
  anomaliesDiscovered,
}) => {
  return (
    <div className="absolute top-12 left-4 flex flex-col gap-6 z-10 select-none">
      {/* My Computer */}
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

      {/* Recycle Bin */}
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

      {/* README.txt */}
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

      {/* SURVEILLANCE_01.bmp */}
      <button
        onDoubleClick={onOpenPolaroid}
        onClick={onOpenPolaroid}
        className="flex flex-col items-center w-20 p-1 rounded hover:bg-blue-900/40 focus:bg-blue-900/60 focus:outline-dashed focus:outline-1 focus:outline-white text-white group"
      >
        <div className="w-10 h-10 bg-neutral-100 rounded-sm border-2 border-red-800 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform relative">
          <ImageIcon className="w-6 h-6 text-neutral-800" />
          {anomaliesDiscovered > 0 && (
            <span className="absolute -bottom-1 -right-1 bg-red-600 text-white text-[9px] px-1 rounded-sm font-bold">
              !
            </span>
          )}
        </div>
        <span className="text-[11px] mt-1 font-sans text-center drop-shadow-[0_1px_2px_rgba(0,0,0,1)] text-red-300 font-bold">
          ROOM_01.bmp
        </span>
      </button>
    </div>
  );
};
