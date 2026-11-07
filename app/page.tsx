"use client";

import React, { useState, useEffect, useRef } from "react";
import { Terminal, ShieldAlert, Radio, Eye, Video } from "lucide-react";

/**
 * Message representation in the POND_OS terminal
 */
interface TerminalMessage {
  id: string;
  sender: "pond" | "user" | "system";
  text: string;
  isDrifting?: boolean;
}

export default function Home() {
  // UI & Paranoia States
  const [messages, setMessages] = useState<TerminalMessage[]>([
    {
      id: "sys-init",
      sender: "system",
      text: "POND_OS v3.1 [DAEMON_LOADED] // SECURE TERMINAL ESTABLISHED",
    },
    {
      id: "pond-hello",
      sender: "pond",
      text: "hello. can you see me clearly?",
    },
  ]);

  const [inputText, setInputText] = useState("");
  const [glitchActive, setGlitchActive] = useState(false);
  const [viewfinderShake, setViewfinderShake] = useState(false);
  const [viewfinderDim, setViewfinderDim] = useState(0); // 0 to -0.6
  const [shadowStage, setShadowStage] = useState<number>(0); // 0: hidden, 1: far corner, 2: closer, 3: behind shoulder
  const [textDriftTrigger, setTextDriftTrigger] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Initialize Webcam for Self-Viewfinder
  useEffect(() => {
    async function startCamera() {
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
    startCamera();

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

  // Keyboard Debug Shortcuts (1-4, Space)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (e.key !== "Escape") return;
      }

      if (e.key === "1") {
        // Trigger 350ms glitch tear
        setGlitchActive(true);
        setTimeout(() => setGlitchActive(false), 350);
      } else if (e.key === "2") {
        // Cycle shadow silhouette stage (0 -> 1 -> 2 -> 3 -> 0)
        setShadowStage((prev) => (prev + 1) % 4);
      } else if (e.key === "3") {
        // Toggle viewfinder camera shake
        setViewfinderShake((prev) => !prev);
      } else if (e.key === "4") {
        // Trigger text drift
        setTextDriftTrigger((prev) => !prev);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: TerminalMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: inputText.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
  };

  return (
    <main
      className={`min-h-screen w-full flex flex-col p-4 md:p-6 bg-void text-crt-green selection:bg-crt-green selection:text-black font-mono transition-all duration-300 ${
        glitchActive ? "screen-glitch" : ""
      }`}
    >
      {/* Top Header: POND_OS Status Banner */}
      <header className="border-b border-crt-dim/60 pb-3 mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Terminal className="w-5 h-5 text-crt-green animate-pulse" />
          <h1 className="text-lg md:text-xl font-bold tracking-widest phosphor-glow">
            POND_OS v3.1 // BLUE_DUCK_DAEMON
          </h1>
        </div>

        <div className="flex items-center gap-4 text-xs tracking-wider text-crt-bright">
          <span className="flex items-center gap-1.5 border border-crt-dim px-2 py-0.5 rounded bg-black/40">
            <Radio className="w-3.5 h-3.5 text-crt-bright animate-ping" />
            FEED: ACTIVE
          </span>
          <span className="flex items-center gap-1.5 border border-crt-dim px-2 py-0.5 rounded bg-black/40">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            TELEMETRY: STANDBY
          </span>
          <span className="hidden sm:inline text-crt-dim">PORT: 8084-SEC</span>
        </div>
      </header>

      {/* Main Terminal Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0">
        {/* Left Column: Teletype Chat Feed (7 cols) */}
        <section className="lg:col-span-7 flex flex-col border border-crt-dim/50 rounded bg-black/60 p-4 relative backdrop-blur-sm shadow-[0_0_15px_rgba(32,194,14,0.1)]">
          <div className="border-b border-crt-dim/40 pb-2 mb-3 flex items-center justify-between text-xs text-crt-dim">
            <span>TERMINAL_SESSION: #4092-A</span>
            <span>ENCRYPTION: QUANTUM_STREAM</span>
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4 scrollbar-thin">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`text-sm md:text-base leading-relaxed ${
                  msg.sender === "user"
                    ? "text-emerald-400 pl-4 border-l border-emerald-600/50"
                    : msg.sender === "pond"
                    ? "text-crt-bright phosphor-glow"
                    : "text-crt-dim italic text-xs"
                } ${textDriftTrigger && msg.sender === "pond" ? "text-drift-fall" : ""}`}
              >
                <span className="text-xs text-crt-dim mr-2 opacity-70">
                  {msg.sender === "user" ? "[YOU]:" : msg.sender === "pond" ? "[POND]:" : "[SYS]:"}
                </span>
                <span>{msg.text}</span>
              </div>
            ))}
            <div ref={chatBottomRef} />
          </div>

          {/* User Input Prompt */}
          <form onSubmit={handleSendMessage} className="relative mt-auto pt-2 border-t border-crt-dim/40 flex items-center">
            <span className="text-crt-green mr-2 text-sm">&gt;</span>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="type your response..."
              className="flex-1 bg-transparent border-none outline-none text-crt-bright placeholder:text-crt-dim/60 text-sm md:text-base caret-crt-bright"
              autoFocus
            />
            <button
              type="submit"
              className="ml-2 text-xs border border-crt-dim px-3 py-1 hover:bg-crt-green hover:text-black transition-colors"
            >
              SEND [↵]
            </button>
          </form>
        </section>

        {/* Right Column: Dynamic Surveillance Viewfinder (5 cols) */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          <div className="border border-crt-dim/60 rounded bg-black/80 p-3 relative flex flex-col shadow-[0_0_20px_rgba(15,89,7,0.25)]">
            {/* Viewfinder Header */}
            <div className="flex items-center justify-between text-xs pb-2 border-b border-crt-dim/40 mb-2">
              <span className="flex items-center gap-1.5 text-crt-green">
                <Video className="w-3.5 h-3.5" />
                CAM_SURVEILLANCE // CH-01
              </span>
              <span className="text-amber-400 animate-pulse font-bold flex items-center gap-1">
                <span className="text-xs">🦆</span> DUCK_REC [●]
              </span>
            </div>

            {/* Video Viewport Container */}
            <div
              className={`relative aspect-[4/3] w-full bg-black overflow-hidden border border-crt-dim/50 rounded flex items-center justify-center ${
                viewfinderShake ? "viewfinder-shake" : ""
              }`}
            >
              {/* Live Webcam with green surveillance filter */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover surveillance-filter -scale-x-100"
              />

              {!cameraActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-crt-dim text-xs gap-2 p-4 text-center">
                  <Eye className="w-8 h-8 opacity-40 animate-pulse" />
                  <span>INITIALIZING WEBCAM STREAM...</span>
                  <span className="text-[10px] opacity-60">PLEASE ALLOW CAMERA ACCESS FOR AFFECT TELEMETRY</span>
                </div>
              )}

              {/* Viewfinder Dimming Overlay (Paranoia Escalation) */}
              <div
                className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-1000"
                style={{ opacity: Math.abs(viewfinderDim) }}
              />

              {/* Shadow Silhouette Overlays (Stages 1 to 3) */}
              {shadowStage >= 1 && (
                <div
                  className={`absolute pointer-events-none transition-all duration-700 ease-out ${
                    shadowStage === 1
                      ? "top-4 right-4 w-20 h-28 opacity-40 blur-[2px] scale-90"
                      : shadowStage === 2
                      ? "top-8 right-12 w-28 h-40 opacity-75 blur-[1px] scale-110"
                      : "top-12 right-20 w-36 h-52 opacity-95 blur-none scale-125"
                  }`}
                >
                  {/* Creepy organic humanoid silhouette SVG */}
                  <svg viewBox="0 0 100 140" className="w-full h-full fill-black drop-shadow-[0_0_12px_rgba(0,0,0,0.9)]">
                    <circle cx="50" cy="30" r="22" />
                    <ellipse cx="50" cy="95" rx="35" ry="45" />
                    {/* Glowing void eye pinpricks for higher stages */}
                    {shadowStage >= 2 && (
                      <>
                        <circle cx="43" cy="28" r="1.5" fill="#3bf824" opacity="0.6" />
                        <circle cx="57" cy="28" r="1.5" fill="#3bf824" opacity="0.6" />
                      </>
                    )}
                  </svg>
                </div>
              )}

              {/* Crosshair & Grid HUD overlay */}
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-2 text-[10px] text-crt-green/40">
                <div className="flex justify-between">
                  <span>+ [TL_BOUND]</span>
                  <span>[TR_BOUND] +</span>
                </div>
                <div className="flex justify-center items-center text-crt-green/20">
                  <span className="text-xl font-thin">+</span>
                </div>
                <div className="flex justify-between">
                  <span>+ [BL_BOUND]</span>
                  <span>SHADOW_STAGE: {shadowStage}/3 +</span>
                </div>
              </div>
            </div>

            {/* Viewfinder Status Footer */}
            <div className="pt-2 mt-2 border-t border-crt-dim/40 flex items-center justify-between text-[11px] text-crt-dim">
              <span>FILTER: MONO_P31_PHOSPHOR</span>
              <span className="text-crt-bright">
                {shadowStage === 0 ? "ROOM: CLEAR" : "ANOMALY: DETECTED"}
              </span>
            </div>
          </div>

          {/* Quick Telemetry & Debug Hotkey Deck */}
          <div className="border border-crt-dim/40 rounded bg-black/40 p-3 text-xs space-y-2">
            <div className="text-crt-bright font-semibold text-[11px] flex items-center justify-between">
              <span>DEMO & DEBUG SHORTCUTS:</span>
              <span className="text-crt-dim text-[10px]">HOTKEYS [1-4]</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-black/50 p-1.5 border border-crt-dim/30 rounded">
                <span className="text-crt-green font-bold">[1]</span> Glitch Tear
              </div>
              <div className="bg-black/50 p-1.5 border border-crt-dim/30 rounded">
                <span className="text-crt-green font-bold">[2]</span> Cycle Shadow ({shadowStage}/3)
              </div>
              <div className="bg-black/50 p-1.5 border border-crt-dim/30 rounded">
                <span className="text-crt-green font-bold">[3]</span> Toggle Shake ({viewfinderShake ? "ON" : "OFF"})
              </div>
              <div className="bg-black/50 p-1.5 border border-crt-dim/30 rounded">
                <span className="text-crt-green font-bold">[4]</span> Text Drift ({textDriftTrigger ? "ON" : "OFF"})
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Bottom Status Ticker */}
      <footer className="mt-4 pt-2 border-t border-crt-dim/40 flex flex-wrap items-center justify-between text-xs text-crt-dim gap-2">
        <div>
          <span>DAEMON: STILL_HERE // VERCEL_BUILD: COMPLIANT</span>
        </div>
        <div className="flex items-center gap-3">
          <span>AFFECT_ENGINE: READY</span>
          <span className="text-crt-bright">GEMINI_API: LINKED</span>
        </div>
      </footer>
    </main>
  );
}
