"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, Camera, AlertTriangle, ShieldCheck, UserCheck } from "lucide-react";

interface WindowsTaskbarProps {
  activeWindows: {
    chat: boolean;
    viewfinder?: boolean;
    polaroid: boolean;
    avatar?: boolean;
  };
  onToggleWindow: (key: "chat" | "polaroid" | "avatar") => void;
  onEmergencyGlitch: () => void;
  shadowStage: number;
  isEnding?: boolean;
}

export const WindowsTaskbar: React.FC<WindowsTaskbarProps> = ({
  activeWindows,
  onToggleWindow,
  onEmergencyGlitch,
  shadowStage,
  isEnding = false,
}) => {
  const [currentTime, setCurrentTime] = useState("");
  const [startMenuOpen, setStartMenuOpen] = useState(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-9 bg-[#c0c0c0] win98-bevel-out z-[9000] flex items-center justify-between px-1 select-none">
      {/* Start Button & Active Task Tabs */}
      <div className="flex items-center gap-1.5 h-full py-0.5">
        {/* Windows 98 Classic Start Button */}
        <button
          onClick={() => setStartMenuOpen((prev) => !prev)}
          className={`win98-bevel-button h-7 px-2.5 flex items-center gap-1.5 font-bold text-xs text-black ${
            startMenuOpen ? "border-t-black border-l-black border-b-white border-r-white bg-neutral-300" : ""
          }`}
        >
          {/* Authentic 4-color Windows 98 Flag */}
          <div className="grid grid-cols-2 gap-0.5 w-3.5 h-3.5 mr-0.5">
            <span className="bg-[#ff4b4b] w-1.5 h-1.5" />
            <span className="bg-[#2eb82e] w-1.5 h-1.5" />
            <span className="bg-[#0080ff] w-1.5 h-1.5" />
            <span className="bg-[#ffb833] w-1.5 h-1.5" />
          </div>
          <span className="tracking-wide">Start</span>
        </button>

        {/* Start Menu Popup */}
        {startMenuOpen && (
          <div className="absolute bottom-9 left-1 w-56 bg-[#c0c0c0] win98-bevel-out shadow-2xl p-1 z-[9999] text-xs text-black font-sans">
            <div className="bg-gradient-to-t from-[#000080] to-[#1084d0] text-white font-bold p-2 mb-1 flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-wider">STILL_HERE 98</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => {
                  onToggleWindow("chat");
                  setStartMenuOpen(false);
                }}
                className="flex items-center gap-2 px-2 py-1.5 hover:bg-[#000080] hover:text-white text-left"
              >
                <MessageSquare className="w-4 h-4 text-emerald-800" />
                <span>POND Messenger</span>
              </button>

              <button
                onClick={() => {
                  onToggleWindow("polaroid");
                  setStartMenuOpen(false);
                }}
                className="flex items-center gap-2 px-2 py-1.5 hover:bg-[#000080] hover:text-white text-left"
              >
                <Camera className="w-4 h-4 text-red-800" />
                <span>Snapshot Viewer</span>
              </button>

              <button
                onClick={() => {
                  onToggleWindow("avatar");
                  setStartMenuOpen(false);
                }}
                className="flex items-center gap-2 px-2 py-1.5 hover:bg-[#000080] hover:text-white text-left"
              >
                <UserCheck className="w-4 h-4 text-blue-800" />
                <span>Avatar Sync</span>
              </button>

              <div className="border-t border-neutral-400 my-1" />

              <button
                onClick={() => {
                  onEmergencyGlitch();
                  setStartMenuOpen(false);
                }}
                className="flex items-center gap-2 px-2 py-1.5 hover:bg-red-800 hover:text-white text-left text-red-900 font-semibold"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>{isEnding ? "NO ESCAPE" : "System Diagnostics"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="h-6 w-0.5 bg-neutral-400 mx-1" />

        {/* Active Application Window Tabs */}
        <button
          onClick={() => onToggleWindow("chat")}
          className={`win98-bevel-button h-7 px-2.5 max-w-[160px] truncate flex items-center gap-1.5 text-xs text-black ${
            activeWindows.chat ? "bg-neutral-200 border-t-black border-l-black border-b-white border-r-white font-semibold" : ""
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
          <span className="truncate">POND Messenger</span>
        </button>

        {activeWindows.polaroid && (
          <button
            onClick={() => onToggleWindow("polaroid")}
            className="win98-bevel-button h-7 px-2.5 max-w-[160px] truncate flex items-center gap-1.5 text-xs text-black bg-neutral-200 border-t-black border-l-black border-b-white border-r-white font-semibold"
          >
            <Camera className="w-3.5 h-3.5 text-red-700" />
            <span className="truncate">Imaging</span>
          </button>
        )}

        {activeWindows.avatar && (
          <button
            onClick={() => onToggleWindow("avatar")}
            className="win98-bevel-button h-7 px-2.5 max-w-[160px] truncate flex items-center gap-1.5 text-xs text-black bg-neutral-200 border-t-black border-l-black border-b-white border-r-white font-semibold"
          >
            <UserCheck className="w-3.5 h-3.5 text-blue-700" />
            <span className="truncate">Avatar Mirror</span>
          </button>
        )}
      </div>

      {/* System Tray (Clock, Status) */}
      <div className="win98-bevel-in bg-[#c0c0c0] h-7 px-2.5 flex items-center gap-3 text-xs font-sans text-neutral-800">
        <div className="flex items-center gap-1 text-[11px] font-mono">
          <span className={shadowStage > 0 ? "text-red-700 font-bold animate-pulse" : "text-neutral-700"}>
            REC [●]
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-1 text-[11px] text-neutral-600 font-mono">
          <ShieldCheck className="w-3 h-3 text-emerald-700" />
          <span>PORT: 8084</span>
        </div>

        {/* Digital Clock */}
        <span className="text-xs font-mono font-medium pl-1 text-black">
          {currentTime || "12:00 PM"}
        </span>
      </div>
    </footer>
  );
};
