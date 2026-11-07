"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Video,
  MessageSquare,
  X,
  Minus,
  Square,
  AlertOctagon,
  Eye,
  Camera,
  FileText,
} from "lucide-react";
import { WindowsTaskbar } from "@/components/WindowsTaskbar";
import { DesktopIcons } from "@/components/DesktopIcons";
import { PolaroidViewer } from "@/components/PolaroidViewer";
import { ScreenCrack } from "@/components/ScreenCrack";

interface ChatMessage {
  id: string;
  sender: "pond" | "user" | "system";
  text: string;
  isDrifting?: boolean;
}

export default function Home() {
  // Window Visibility States
  const [activeWindows, setActiveWindows] = useState({
    chat: true,
    viewfinder: true,
    polaroid: false,
  });

  // Dialog & Horror Popups
  const [readmeOpen, setReadmeOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    "FATAL EXCEPTION 0E : An unknown presence was detected in your physical space."
  );

  // Paranoia & Horror States
  const [glitchActive, setGlitchActive] = useState(false);
  const [viewfinderShake, setViewfinderShake] = useState(false);
  const [viewfinderDim, setViewfinderDim] = useState(0); // 0 to -0.6
  const [shadowStage, setShadowStage] = useState<number>(0); // 0 to 3
  const [screenCracked, setScreenCracked] = useState(false);
  const [crackSeverity, setCrackSeverity] = useState<1 | 2 | 3>(1);
  const [textDriftTrigger, setTextDriftTrigger] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [webcamMode, setWebcamMode] = useState<"vintage" | "corrupted">("vintage");

  // Chat Feed State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "sys-0",
      sender: "system",
      text: "POND_OS 99 [DAEMON_LOADED] // SECURE SESSION #4092-A",
    },
    {
      id: "pond-init",
      sender: "pond",
      text: "hello. can you see me clearly?",
    },
  ]);
  const [inputText, setInputText] = useState("");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Initialize Webcam (Natural early 2000s CMOS styling, toned down green)
  useEffect(() => {
    async function initCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: "user" },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }
      } catch (err) {
        console.warn("Camera access denied or unavailable:", err);
      }
    }
    initCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Window Toggling
  const handleToggleWindow = (key: "chat" | "viewfinder" | "polaroid") => {
    setActiveWindows((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Trigger Glitch & Horror Tear
  const triggerGlitchSpike = () => {
    setGlitchActive(true);
    setTimeout(() => setGlitchActive(false), 380);
  };

  // Keyboard Shortcuts (1 to 6)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (e.key !== "Escape") return;
      }

      if (e.key === "1") {
        // Glitch + Error Dialog
        triggerGlitchSpike();
        setErrorDialogOpen(true);
      } else if (e.key === "2") {
        // Cycle Shadow behind shoulder
        setShadowStage((prev) => (prev + 1) % 4);
      } else if (e.key === "3") {
        // Open live creepy face Polaroid
        setActiveWindows((prev) => ({ ...prev, polaroid: true }));
      } else if (e.key === "4") {
        // Toggle screen glass fracture cracks
        setScreenCracked((prev) => !prev);
        setCrackSeverity((prev) => (prev === 3 ? 1 : ((prev + 1) as 1 | 2 | 3)));
      } else if (e.key === "5") {
        // Toggle camera shake
        setViewfinderShake((prev) => !prev);
      } else if (e.key === "6") {
        // Toggle text falling
        setTextDriftTrigger((prev) => !prev);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: inputText.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");

    // Simulated conversational escalation for testing
    setTimeout(() => {
      if (messages.length === 2) {
        setMessages((prev) => [
          ...prev,
          {
            id: `pond-${Date.now()}`,
            sender: "pond",
            text: "your room is very quiet today.",
          },
        ]);
      } else if (messages.length === 4) {
        setMessages((prev) => [
          ...prev,
          {
            id: `pond-${Date.now()}`,
            sender: "pond",
            text: "who's behind you?",
          },
        ]);
        setShadowStage(1);
      }
    }, 1200);
  };

  return (
    <main
      className={`min-h-screen w-full relative overflow-hidden bg-[#008080] select-none font-sans ${
        glitchActive ? "screen-glitch" : ""
      }`}
    >
      {/* Subtle CRT Scanlines */}
      <div className="retro-crt-lines" aria-hidden="true" />

      {/* Screen Crack Glass Shatter Overlay */}
      <ScreenCrack active={screenCracked} severity={crackSeverity} />

      {/* Virtual Desktop Icons */}
      <DesktopIcons
        onOpenPolaroid={() => setActiveWindows((prev) => ({ ...prev, polaroid: true }))}
        onOpenReadme={() => setReadmeOpen(true)}
        onTriggerError={() => {
          setErrorMessage("SYSTEM ANOMALY: Access denied. Unauthorized observer detected.");
          setErrorDialogOpen(true);
        }}
        anomaliesDiscovered={shadowStage}
      />

      {/* WINDOW 1: POND Instant Messenger (Windows 98 Style) */}
      {activeWindows.chat && (
        <div
          className={`absolute top-6 left-28 md:left-36 w-[340px] md:w-[480px] bg-[#c0c0c0] win98-bevel-out shadow-2xl z-30 transition-all ${
            shadowStage >= 2 ? "border-red-900" : ""
          }`}
          style={{ maxHeight: "calc(100vh - 80px)" }}
        >
          {/* Title Bar */}
          <div
            className={`flex items-center justify-between px-2 py-1 select-none ${
              shadowStage >= 2 ? "win98-titlebar-corrupted" : "win98-titlebar"
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs text-white">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>
                {shadowStage >= 2 ? "POND_OS // WHO_IS_THERE?" : "POND Instant Messenger v3.1"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleToggleWindow("chat")}
                className="win98-bevel-button w-4 h-3.5 flex items-center justify-center text-black text-[10px]"
              >
                <Minus className="w-2.5 h-2.5" />
              </button>
              <button className="win98-bevel-button w-4 h-3.5 flex items-center justify-center text-black text-[10px]">
                <Square className="w-2.5 h-2.5" />
              </button>
              <button
                onClick={() => handleToggleWindow("chat")}
                className="win98-bevel-button w-4 h-3.5 flex items-center justify-center text-black text-[10px] font-bold"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>

          {/* Menu Strip */}
          <div className="px-2 py-0.5 border-b border-neutral-400 text-[11px] text-neutral-800 flex gap-3 font-sans">
            <span className="hover:underline cursor-pointer">File</span>
            <span className="hover:underline cursor-pointer">Edit</span>
            <span className="hover:underline cursor-pointer">View</span>
            <span
              onClick={() => setActiveWindows((prev) => ({ ...prev, polaroid: true }))}
              className="hover:underline cursor-pointer text-red-900 font-semibold"
            >
              Examine Photo...
            </span>
          </div>

          {/* Chat Feed Inner Box */}
          <div className="p-2 flex flex-col h-[340px] md:h-[400px]">
            <div className="flex-1 bg-white win98-bevel-in p-2.5 overflow-y-auto space-y-2.5 text-xs font-mono scrollbar-thin">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`leading-relaxed ${
                    msg.sender === "user"
                      ? "text-blue-900"
                      : msg.sender === "pond"
                      ? "text-neutral-900 font-medium"
                      : "text-neutral-500 italic text-[11px]"
                  } ${textDriftTrigger && msg.sender === "pond" ? "text-drift-fall" : ""}`}
                >
                  <span className="font-bold mr-1.5">
                    {msg.sender === "user"
                      ? "[YOU]:"
                      : msg.sender === "pond"
                      ? "[POND]:"
                      : "[SYSTEM]:"}
                  </span>
                  <span>{msg.text}</span>
                </div>
              ))}
              <div ref={chatBottomRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="mt-2 flex gap-1.5">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="type your response..."
                className="flex-1 win98-bevel-in px-2 py-1 text-xs font-mono bg-white outline-none"
                autoFocus
              />
              <button
                type="submit"
                className="win98-bevel-button px-3 py-1 text-xs font-sans text-black font-semibold"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      {/* WINDOW 2: Video Call Viewfinder Window (Natural early 2000s webcam aesthetic) */}
      {activeWindows.viewfinder && (
        <div
          className={`absolute top-6 right-4 md:right-8 w-[320px] md:w-[380px] bg-[#c0c0c0] win98-bevel-out shadow-2xl z-20 ${
            viewfinderShake ? "viewfinder-shake" : ""
          }`}
        >
          {/* Title Bar */}
          <div className="win98-titlebar flex items-center justify-between px-2 py-1 select-none">
            <div className="flex items-center gap-1.5 text-xs text-white">
              <Video className="w-3.5 h-3.5" />
              <span>Video Call // USB_CAM_CH01 (640x480)</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleToggleWindow("viewfinder")}
                className="win98-bevel-button w-4 h-3.5 flex items-center justify-center text-black text-[10px]"
              >
                <Minus className="w-2.5 h-2.5" />
              </button>
              <button
                onClick={() => handleToggleWindow("viewfinder")}
                className="win98-bevel-button w-4 h-3.5 flex items-center justify-center text-black text-[10px] font-bold"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>

          {/* Subheader Status */}
          <div className="px-2 py-1 bg-neutral-200 border-b border-neutral-400 flex items-center justify-between text-[11px] text-neutral-800 font-mono">
            <span className="flex items-center gap-1 text-red-700 font-bold">
              <span>🦆</span> DUCK_REC [●]
            </span>
            <span className="text-neutral-600 text-[10px]">FPS: 30.1 // P31_CORRECTED</span>
          </div>

          {/* Video Viewport Container */}
          <div className="p-2">
            <div className="relative aspect-[4/3] w-full bg-black win98-bevel-in overflow-hidden flex items-center justify-center">
              {/* Natural Live Webcam Video Feed (toned down green, authentic vintage) */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover -scale-x-100 ${
                  webcamMode === "vintage" ? "webcam-vintage-natural" : "webcam-corrupted"
                }`}
              />

              {!cameraActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-400 text-xs gap-2 p-4 text-center">
                  <Eye className="w-8 h-8 opacity-50 animate-pulse text-neutral-300" />
                  <span className="font-mono">CONNECTING USB WEBCAM...</span>
                  <span className="text-[10px] opacity-70">
                    ALLOW CAMERA PERMISSION TO DETECT MICRO-EXPRESSIONS
                  </span>
                </div>
              )}

              {/* Viewfinder Dimming Overlay (Controlled by Paranoia) */}
              <div
                className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-1000"
                style={{ opacity: Math.abs(viewfinderDim) }}
              />

              {/* Creeping Shadow Silhouette Overlay (Stages 1 to 3) */}
              {shadowStage >= 1 && (
                <div
                  className={`absolute pointer-events-none transition-all duration-700 ease-out ${
                    shadowStage === 1
                      ? "top-4 right-4 w-20 h-28 opacity-45 blur-[2px] scale-90"
                      : shadowStage === 2
                      ? "top-8 right-12 w-28 h-40 opacity-75 blur-[1px] scale-110"
                      : "top-12 right-20 w-36 h-52 opacity-95 blur-none scale-125"
                  }`}
                >
                  <svg
                    viewBox="0 0 100 140"
                    className="w-full h-full fill-neutral-950 drop-shadow-[0_0_12px_rgba(0,0,0,0.9)]"
                  >
                    <circle cx="50" cy="30" r="22" />
                    <ellipse cx="50" cy="95" rx="35" ry="45" />
                    {shadowStage >= 2 && (
                      <>
                        <circle cx="43" cy="28" r="1.5" fill="#f0fdf4" opacity="0.8" />
                        <circle cx="57" cy="28" r="1.5" fill="#f0fdf4" opacity="0.8" />
                      </>
                    )}
                  </svg>
                </div>
              )}

              {/* Retro Viewfinder Grid Lines */}
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-2 text-[10px] font-mono text-white/40">
                <div className="flex justify-between">
                  <span>[REC] 00:01:42</span>
                  <span>AUTO-EXPOSURE</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-[9px] text-white/60">CH-01_ROOM_MONITOR</span>
                  <span>{shadowStage > 0 ? "ANOMALY: BEHIND_SUBJECT" : "SUBJECT: ACTIVE"}</span>
                </div>
              </div>
            </div>

            {/* Quick Webcam Snapshot Trigger */}
            <div className="mt-2 flex items-center justify-between">
              <button
                onClick={() => setActiveWindows((prev) => ({ ...prev, polaroid: true }))}
                className="win98-bevel-button px-2 py-1 text-xs text-black font-sans flex items-center gap-1 font-semibold"
              >
                <Camera className="w-3.5 h-3.5 text-neutral-800" />
                Snapshot Polaroid
              </button>
              <button
                onClick={() =>
                  setWebcamMode((prev) => (prev === "vintage" ? "corrupted" : "vintage"))
                }
                className="text-[11px] text-neutral-700 underline font-sans hover:text-black"
              >
                Toggle Night Vision
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WINDOW 3: Creepy Notepad (README.txt Lore) */}
      {readmeOpen && (
        <div className="fixed top-20 left-12 md:left-24 w-[310px] md:w-[380px] bg-[#c0c0c0] win98-bevel-out shadow-2xl z-40">
          <div className="win98-titlebar flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-1 text-xs text-white">
              <FileText className="w-3.5 h-3.5" />
              <span>Notepad - README.txt</span>
            </div>
            <button
              onClick={() => setReadmeOpen(false)}
              className="win98-bevel-button w-4 h-3.5 flex items-center justify-center text-black text-[10px] font-bold"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
          <div className="p-2">
            <div className="win98-bevel-in bg-white p-3 text-xs font-mono text-neutral-800 h-52 overflow-y-auto leading-relaxed">
              <p className="font-bold text-red-900 mb-2">DO NOT TURN AROUND.</p>
              <p className="mb-2">
                If you are looking at the screen, it cannot move. The moment you look away, check
                your shoulder, or look behind your chair, it steps closer.
              </p>
              <p className="mb-2">
                Look at the polaroid in your files. It was already in your room before you launched
                this program.
              </p>
              <p className="text-neutral-500 text-[11px]">
                Last modified: 11:42 PM - Subject #4091 (TERMINATED)
              </p>
            </div>
            <div className="mt-2 flex justify-end">
              <button
                onClick={() => setReadmeOpen(false)}
                className="win98-bevel-button px-3 py-1 text-xs text-black font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WINDOW 4: Windows 98 Critical Exception Error Dialog */}
      {errorDialogOpen && (
        <div className="fixed inset-0 z-[8500] flex items-center justify-center bg-black/30">
          <div className="win98-bevel-out bg-[#c0c0c0] w-[340px] md:w-[420px] p-1 shadow-2xl">
            <div className="win98-titlebar-corrupted flex items-center justify-between px-2 py-1">
              <div className="flex items-center gap-1 text-xs text-white">
                <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
                <span>POND_OS 99 - CRITICAL EXCEPTION</span>
              </div>
              <button
                onClick={() => setErrorDialogOpen(false)}
                className="win98-bevel-button w-4 h-3.5 flex items-center justify-center text-black text-[10px] font-bold"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
            <div className="p-4 flex items-start gap-3">
              <AlertOctagon className="w-9 h-9 text-red-600 shrink-0" />
              <div className="text-xs font-sans text-black leading-relaxed">
                <p className="font-semibold mb-1">Fatal Exception 0E has occurred.</p>
                <p className="text-neutral-800">{errorMessage}</p>
                <p className="mt-2 text-[11px] text-neutral-600 font-mono">
                  * Press any key to continue. It will not help.
                </p>
              </div>
            </div>
            <div className="p-2 border-t border-neutral-400 flex justify-end gap-2">
              <button
                onClick={() => setErrorDialogOpen(false)}
                className="win98-bevel-button px-3 py-1 text-xs text-black font-semibold"
              >
                OK
              </button>
              <button
                onClick={() => setErrorDialogOpen(false)}
                className="win98-bevel-button px-3 py-1 text-xs text-black"
              >
                Ignore
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POLAROID VIEWER POPUP (Live Face Snapshot + Creepy Ghost Behind Shoulder) */}
      <PolaroidViewer
        isOpen={activeWindows.polaroid}
        onClose={() => setActiveWindows((prev) => ({ ...prev, polaroid: false }))}
        videoRef={videoRef}
        shadowStage={shadowStage}
      />

      {/* BOTTOM-RIGHT DEBUG & DEMO SHORTCUTS DOCK */}
      <div className="fixed bottom-12 right-4 z-20 bg-[#c0c0c0] win98-bevel-out p-2 shadow-lg max-w-[280px]">
        <div className="text-[11px] font-bold text-neutral-900 border-b border-neutral-400 pb-1 mb-1.5 flex items-center justify-between">
          <span>DEMO HORROR SHORTCUTS:</span>
          <span className="text-[10px] text-neutral-600 font-mono">[KEYS 1-6]</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
          <div className="bg-white p-1 win98-bevel-in">
            <span className="font-bold text-blue-900">[1]</span> Glitch & Error
          </div>
          <div className="bg-white p-1 win98-bevel-in">
            <span className="font-bold text-blue-900">[2]</span> Shadow ({shadowStage}/3)
          </div>
          <div className="bg-white p-1 win98-bevel-in">
            <span className="font-bold text-red-900">[3]</span> Face Polaroid
          </div>
          <div className="bg-white p-1 win98-bevel-in">
            <span className="font-bold text-blue-900">[4]</span> Screen Cracks ({screenCracked ? `L${crackSeverity}` : "OFF"})
          </div>
          <div className="bg-white p-1 win98-bevel-in">
            <span className="font-bold text-blue-900">[5]</span> Cam Shake
          </div>
          <div className="bg-white p-1 win98-bevel-in">
            <span className="font-bold text-blue-900">[6]</span> Text Drift
          </div>
        </div>
      </div>

      {/* WINDOWS 98 BOTTOM TASKBAR */}
      <WindowsTaskbar
        activeWindows={activeWindows}
        onToggleWindow={handleToggleWindow}
        onEmergencyGlitch={triggerGlitchSpike}
        shadowStage={shadowStage}
      />
    </main>
  );
}
