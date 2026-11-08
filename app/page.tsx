"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MessageSquare,
  X,
  Minus,
  Square,
  AlertOctagon,
  Camera,
  FileText,
} from "lucide-react";
import { WindowsTaskbar } from "@/components/WindowsTaskbar";
import { DesktopIcons } from "@/components/DesktopIcons";
import { PolaroidViewer } from "@/components/PolaroidViewer";
import { TelemetryHUD } from "@/components/TelemetryHUD";
import { useFaceTelemetry } from "@/hooks/useFaceTelemetry";
import { soundEngine } from "@/utils/sound";

interface ChatMessage {
  id: string;
  sender: "pond" | "user" | "system" | "unknown";
  text: string;
  isDrifting?: boolean;
}

export default function Home() {
  // Window Visibility States (No live viewfinder box!)
  const [activeWindows, setActiveWindows] = useState({
    chat: true,
    viewfinder: false,
    polaroid: false,
  });

  // Dialog & Lore Popups
  const [readmeOpen, setReadmeOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    "FATAL EXCEPTION 0E : An unknown presence was detected in your physical space."
  );

  // Screen Flash Effect for Camera Shutter
  const [cameraFlash, setCameraFlash] = useState(false);

  // Paranoia & Atmosphere States (Building subtly over time)
  const [glitchActive, setGlitchActive] = useState(false);
  const [screenDarkness, setScreenDarkness] = useState(0.0); // 0.0 to 0.4
  const [textDriftTrigger, setTextDriftTrigger] = useState(false);

  // Story Sequence Tracking
  // 0: Initial greeting -> 1: Room check -> 2: "who's behind you?" -> 3: "here let me take a screenshot" -> 4: Escalation
  const [storyStage, setStoryStage] = useState<number>(0);

  // Chat Feed State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "sys-0",
      sender: "system",
      text: "POND_OS 99 [DAEMON_LOADED] // SECURE TERMINAL ESTABLISHED",
    },
    {
      id: "pond-init",
      sender: "pond",
      text: "hey! can you hear me alright?",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);

  // Hidden Video Ref for background MediaPipe telemetry & frame capture
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const typingAudioPitch = useRef<number>(1.0);

  // Typewriter audio playback
  const playTypewriterForText = useCallback((text: string) => {
    let index = 0;
    const interval = setInterval(() => {
      soundEngine.playKeystroke(typingAudioPitch.current);
      index++;
      if (index >= text.length) {
        clearInterval(interval);
      }
    }, 38);
  }, []);

  // Subtle screen glitch
  const triggerGlitchSpike = useCallback(() => {
    setGlitchActive(true);
    soundEngine.playGlitchSting();
    setTimeout(() => setGlitchActive(false), 280);
  }, []);

  // Shutter Snapshot Flash Sequence
  const triggerScreenshotCapture = useCallback(() => {
    soundEngine.playCameraShutter();
    setCameraFlash(true);
    setTimeout(() => setCameraFlash(false), 180);

    // Pop open the screenshot window after shutter
    setTimeout(() => {
      setActiveWindows((prev) => ({ ...prev, polaroid: true }));
    }, 350);
  }, []);

  // HEAD-TURN DETECTED (|headYaw| > 18 deg)
  const handleHeadTurn = useCallback(() => {
    if (storyStage >= 2) {
      triggerGlitchSpike();
    }
  }, [storyStage, triggerGlitchSpike]);

  // MediaPipe Vision & Presage Biometric Telemetry Hook (runs silently via hidden video)
  const { telemetry, isModelReady } = useFaceTelemetry({
    videoRef,
    enabled: true,
    onHeadTurn: handleHeadTurn,
  });

  // Background Camera Initialization
  useEffect(() => {
    let isCancelled = false;

    async function initHiddenCamera() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) return;
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user",
          },
          audio: false,
        });

        if (isCancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(() => {});
          };
          videoRef.current.play().catch(() => {});
        }
      } catch (err) {
        console.warn("Background camera initialization:", err);
      }
    }

    initHiddenCamera();

    return () => {
      isCancelled = true;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Subtle Random Atmospheric Glitches as session progresses
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (storyStage >= 2) {
        setGlitchActive(true);
        soundEngine.playKeystroke(0.5);
        setTimeout(() => setGlitchActive(false), 160);
      }
    }, 20000);

    return () => clearInterval(glitchInterval);
  }, [storyStage]);

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Window Toggling
  const handleToggleWindow = (key: "chat" | "polaroid") => {
    setActiveWindows((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Keyboard Shortcuts (1 to 6)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (e.key !== "Escape") return;
      }

      if (e.key === "1") {
        triggerGlitchSpike();
        setErrorDialogOpen(true);
      } else if (e.key === "2") {
        triggerScreenshotCapture();
      } else if (e.key === "3") {
        setActiveWindows((prev) => ({ ...prev, polaroid: true }));
      } else if (e.key === "4") {
        setTextDriftTrigger((prev) => !prev);
      } else if (e.key === "5") {
        setScreenDarkness((prev) => (prev > 0 ? 0 : 0.35));
      } else if (e.key === "6") {
        // Reset
        setStoryStage(0);
        setScreenDarkness(0);
        typingAudioPitch.current = 1.0;
        setMessages([
          {
            id: "sys-0",
            sender: "system",
            text: "POND_OS 99 [SESSION RESET] // SYSTEM NORMAL",
          },
          {
            id: "pond-init",
            sender: "pond",
            text: "hey! can you hear me alright?",
          },
        ]);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [triggerGlitchSpike, triggerScreenshotCapture]);

  // Send Message in Giant Text Chat
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isAiTyping) return;

    const userText = inputText.trim();
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: userText,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText("");
    setIsAiTyping(true);

    // Subtle screen darkening escalates
    setScreenDarkness((prev) => Math.min(0.38, prev + 0.08));

    // EXACT STORY SCRIPT MILESTONES:
    if (storyStage === 0) {
      setTimeout(() => {
        const reply = "cool. are you in your room right now?";
        setMessages((prev) => [
          ...prev,
          { id: `pond-${Date.now()}`, sender: "pond", text: reply },
        ]);
        playTypewriterForText(reply);
        setStoryStage(1);
        setIsAiTyping(false);
      }, 900);
      return;
    }

    if (storyStage === 1) {
      setTimeout(() => {
        const reply = "wait... who's behind you?";
        setMessages((prev) => [
          ...prev,
          { id: `pond-${Date.now()}`, sender: "pond", text: reply },
        ]);
        playTypewriterForText(reply);
        setStoryStage(2);
        setIsAiTyping(false);
      }, 1100);
      return;
    }

    if (storyStage === 2) {
      // User says "no one" -> POND replies "here let me take a screenshot"
      setTimeout(() => {
        const reply = "here let me take a screenshot";
        setMessages((prev) => [
          ...prev,
          { id: `pond-${Date.now()}`, sender: "pond", text: reply },
        ]);
        playTypewriterForText(reply);
        setStoryStage(3);
        setIsAiTyping(false);

        // Take snapshot right after message is typed
        setTimeout(() => {
          triggerScreenshotCapture();
          soundEngine.startAmbientDrone();
          typingAudioPitch.current = 0.7;
        }, 1500);
      }, 900);
      return;
    }

    // Step 4+: Subsequent turns driven by Gemini 2.5 Flash
    try {
      const res = await fetch("/api/pond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          telemetry,
        }),
      });

      const data = await res.json();

      if (data && data.dialogue) {
        if (data.audioPitch) {
          typingAudioPitch.current = data.audioPitch;
        }

        if (data.triggerGlitch) {
          triggerGlitchSpike();
        }

        if (data.textDriftEffect) {
          setTextDriftTrigger(true);
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `pond-${Date.now()}`,
            sender: "pond",
            text: data.dialogue,
            isDrifting: data.textDriftEffect,
          },
        ]);

        playTypewriterForText(data.dialogue);
      }
    } catch (err) {
      const fallbackReply = "look closely at the photo.";
      setMessages((prev) => [
        ...prev,
        { id: `pond-${Date.now()}`, sender: "pond", text: fallbackReply },
      ]);
      playTypewriterForText(fallbackReply);
    } finally {
      setIsAiTyping(false);
    }
  };

  return (
    <main
      className={`min-h-screen w-full relative overflow-hidden bg-[#008080] select-none font-sans flex flex-col items-center justify-center p-3 md:p-6 transition-all duration-1000 ${
        glitchActive ? "screen-glitch" : ""
      }`}
    >
      {/* Subtle CRT Scanlines Overlay */}
      <div className="retro-crt-lines" aria-hidden="true" />

      {/* Screen Darkening Vignette (builds subtly over time) */}
      <div
        className="fixed inset-0 bg-black pointer-events-none transition-opacity duration-1000 z-[15]"
        style={{ opacity: screenDarkness }}
      />

      {/* Shutter Camera Flash Animation */}
      {cameraFlash && (
        <div className="fixed inset-0 bg-white z-[9998] pointer-events-none transition-opacity duration-200" />
      )}

      {/* Virtual Desktop Icons */}
      <DesktopIcons
        onOpenPolaroid={() => setActiveWindows((prev) => ({ ...prev, polaroid: true }))}
        onOpenReadme={() => setReadmeOpen(true)}
        onTriggerError={() => {
          setErrorMessage("SYSTEM ANOMALY: Access denied. Unauthorized observer detected.");
          setErrorDialogOpen(true);
        }}
        anomaliesDiscovered={storyStage >= 3 ? 1 : 0}
      />

      {/* TOP DOCKED: Real-Time Affect & Head-Turn Telemetry HUD */}
      <div className="absolute top-1 left-28 right-4 md:left-36 md:right-8 z-20">
        <TelemetryHUD
          telemetry={telemetry}
          isModelReady={isModelReady}
          clownStage={storyStage >= 3 ? "near_unsmiling" : "none"}
        />
      </div>

      {/* HIDDEN WEBCAM (Runs silently in background for MediaPipe telemetry & frame capture) */}
      <video
        ref={(el) => {
          videoRef.current = el;
          if (el && mediaStreamRef.current && el.srcObject !== mediaStreamRef.current) {
            el.srcObject = mediaStreamRef.current;
            el.play().catch(() => {});
          }
        }}
        autoPlay
        playsInline
        muted
        className="hidden"
      />

      {/* GIANT TEXT-BASED TERMINAL CHAT */}
      {activeWindows.chat && (
        <div
          className="relative z-30 w-full max-w-4xl bg-[#c0c0c0] win98-bevel-out shadow-2xl flex flex-col transition-all duration-500"
          style={{ height: "calc(100vh - 90px)", maxHeight: "780px" }}
        >
          {/* Windows 98 Title Bar */}
          <div
            className={`flex items-center justify-between px-2.5 py-1.5 select-none ${
              storyStage >= 3 ? "win98-titlebar-corrupted" : "win98-titlebar"
            }`}
          >
            <div className="flex items-center gap-2 text-xs md:text-sm text-white font-bold tracking-wide">
              <MessageSquare className="w-4 h-4 text-emerald-300" />
              <span>
                {storyStage >= 3
                  ? "POND_OS // UNKNOWN_OBSERVER_PRESENT"
                  : "POND Instant Messenger v3.1 [DAEMON_ACTIVE]"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleToggleWindow("chat")}
                className="win98-bevel-button w-5 h-4 flex items-center justify-center text-black text-xs"
              >
                <Minus className="w-3 h-3" />
              </button>
              <button className="win98-bevel-button w-5 h-4 flex items-center justify-center text-black text-xs">
                <Square className="w-2.5 h-2.5" />
              </button>
              <button
                onClick={() => handleToggleWindow("chat")}
                className="win98-bevel-button w-5 h-4 flex items-center justify-center text-black text-xs font-bold"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Menu Strip */}
          <div className="px-3 py-1 border-b border-neutral-400 text-xs text-neutral-800 flex items-center justify-between font-sans bg-[#c0c0c0]">
            <div className="flex gap-4">
              <span className="hover:underline cursor-pointer">Session</span>
              <span className="hover:underline cursor-pointer">Diagnostics</span>
              <span
                onClick={triggerScreenshotCapture}
                className="hover:underline cursor-pointer text-red-900 font-semibold flex items-center gap-1"
              >
                <Camera className="w-3.5 h-3.5" />
                Snapshot Feed
              </span>
            </div>
            <div className="text-[11px] font-mono text-neutral-600">
              STATUS: <strong className="text-emerald-800">ENCRYPTED_STREAM</strong>
            </div>
          </div>

          {/* Giant Chat Log Content */}
          <div className="p-3 md:p-4 flex-1 flex flex-col min-h-0 bg-[#c0c0c0]">
            <div className="flex-1 bg-white win98-bevel-in p-4 overflow-y-auto space-y-3.5 font-mono text-sm md:text-base leading-relaxed scrollbar-thin shadow-inner">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`leading-relaxed transition-all duration-300 ${
                    msg.sender === "user"
                      ? "text-blue-900 pl-3 border-l-2 border-blue-400"
                      : msg.sender === "unknown"
                      ? "text-red-600 font-extrabold tracking-widest animate-pulse pl-3 border-l-2 border-red-600"
                      : msg.sender === "pond"
                      ? "text-neutral-950 font-medium"
                      : "text-neutral-500 italic text-xs"
                  } ${(textDriftTrigger || msg.isDrifting) && msg.sender === "pond" ? "text-drift-fall" : ""}`}
                >
                  <span className="font-bold mr-2 text-xs md:text-sm">
                    {msg.sender === "user"
                      ? "[YOU]:"
                      : msg.sender === "unknown"
                      ? "[UNKNOWN]:"
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
            <form onSubmit={handleSendMessage} className="mt-3 flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isAiTyping ? "pond is observing..." : "type your response..."}
                disabled={isAiTyping}
                className="flex-1 win98-bevel-in px-3 py-2 text-sm md:text-base font-mono bg-white outline-none disabled:bg-neutral-100 placeholder:text-neutral-400"
                autoFocus
              />
              <button
                type="submit"
                disabled={isAiTyping}
                className="win98-bevel-button px-5 py-2 text-sm font-sans text-black font-bold disabled:opacity-50 tracking-wide"
              >
                Send [↵]
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CLEAN WINDOWS 98 IMAGE VIEWER (Pops open on "here let me take a screenshot") */}
      <PolaroidViewer
        isOpen={activeWindows.polaroid}
        onClose={() => setActiveWindows((prev) => ({ ...prev, polaroid: false }))}
        videoRef={videoRef}
        faceBox={telemetry.faceBox}
      />

      {/* Creepy Notepad (README.txt Lore) */}
      {readmeOpen && (
        <div className="fixed top-24 left-12 md:left-24 w-[310px] md:w-[380px] bg-[#c0c0c0] win98-bevel-out shadow-2xl z-40">
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
              <p className="font-bold text-red-900 mb-2">DO NOT LOOK DIRECTLY AT IT.</p>
              <p className="mb-2">
                It waits until you feel safe. When it asks to take a photo, do not look behind
                your chair.
              </p>
              <p className="mb-2">
                It has been standing in the room with you since you launched this program.
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

      {/* Windows 98 Critical Exception Error Dialog */}
      {errorDialogOpen && (
        <div className="fixed inset-0 z-[8500] flex items-center justify-center bg-black/40">
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
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM-RIGHT DEBUG & DEMO SHORTCUTS DOCK */}
      <div className="fixed bottom-12 right-4 z-20 bg-[#c0c0c0] win98-bevel-out p-2 shadow-lg max-w-[280px]">
        <div className="text-[11px] font-bold text-neutral-900 border-b border-neutral-400 pb-1 mb-1.5 flex items-center justify-between">
          <span>DEMO SHORTCUTS:</span>
          <span className="text-[10px] text-neutral-600 font-mono">[KEYS 1-6]</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
          <div className="bg-white p-1 win98-bevel-in">
            <span className="font-bold text-blue-900">[1]</span> Glitch & Error
          </div>
          <div className="bg-white p-1 win98-bevel-in">
            <span className="font-bold text-red-900">[2]</span> Shutter Snap
          </div>
          <div className="bg-white p-1 win98-bevel-in">
            <span className="font-bold text-blue-900">[3]</span> Photo View
          </div>
          <div className="bg-white p-1 win98-bevel-in">
            <span className="font-bold text-blue-900">[4]</span> Text Drift
          </div>
          <div className="bg-white p-1 win98-bevel-in">
            <span className="font-bold text-blue-900">[5]</span> Darken Screen
          </div>
          <div className="bg-white p-1 win98-bevel-in">
            <span className="font-bold text-blue-900">[6]</span> Reset Arc
          </div>
        </div>
      </div>

      {/* WINDOWS 98 BOTTOM TASKBAR */}
      <WindowsTaskbar
        activeWindows={{
          chat: activeWindows.chat,
          viewfinder: false,
          polaroid: activeWindows.polaroid,
        }}
        onToggleWindow={(key) => {
          if (key === "chat") handleToggleWindow("chat");
          if (key === "polaroid") handleToggleWindow("polaroid");
        }}
        onEmergencyGlitch={triggerGlitchSpike}
        shadowStage={storyStage >= 3 ? 2 : 0}
      />
    </main>
  );
}
