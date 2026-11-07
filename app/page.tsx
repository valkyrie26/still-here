"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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
  RefreshCw,
} from "lucide-react";
import { WindowsTaskbar } from "@/components/WindowsTaskbar";
import { DesktopIcons } from "@/components/DesktopIcons";
import { PolaroidViewer } from "@/components/PolaroidViewer";
import { ScreenCrack } from "@/components/ScreenCrack";
import { ClownEntity, ClownStage } from "@/components/ClownEntity";
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

  // Clown Entity Stage: "none" | "standing_far" | "near_unsmiling" | "jumpscare_smiling"
  const [clownStage, setClownStage] = useState<ClownStage>("none");

  // Paranoia & FX States
  const [glitchActive, setGlitchActive] = useState(false);
  const [viewfinderShake, setViewfinderShake] = useState(false);
  const [viewfinderDim, setViewfinderDim] = useState(0); // Clamped between 0 and 0.4
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
      text: "hey! can you hear me alright?",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);

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
    }, 40);
  }, []);

  // Violent screen glitch
  const triggerGlitchSpike = useCallback(() => {
    setGlitchActive(true);
    soundEngine.playGlitchSting();
    setTimeout(() => setGlitchActive(false), 380);
  }, []);

  // JUMPSCARE TRIGGER
  const triggerJumpscare = useCallback(() => {
    setClownStage("jumpscare_smiling");
    soundEngine.playJumpscareSting();
    setScreenCracked(true);
    setCrackSeverity(3);
    setViewfinderShake(true);

    setTimeout(() => {
      setClownStage("none");
      setViewfinderShake(false);
      setErrorMessage("FATAL EXCEPTION 0E : IT IS RIGHT BEHIND YOU.");
      setErrorDialogOpen(true);
    }, 1100);
  }, []);

  // HEAD-TURN DETECTED (|headYaw| > 18 deg)
  const handleHeadTurn = useCallback(() => {
    if (clownStage === "standing_far") {
      setClownStage("none"); // It vanishes from the far corner!

      setTimeout(() => {
        soundEngine.stopAllSound();
        setMessages((prev) => [
          ...prev,
          {
            id: `pond-cutoff-${Date.now()}`,
            sender: "pond",
            text: "wait... it's gone? i swear i saw—",
          },
        ]);

        triggerGlitchSpike();
        setScreenCracked(true);
        setCrackSeverity(1);

        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: `sys-dc-${Date.now()}`,
              sender: "system",
              text: "CONNECTION LOST... ATTEMPTING RECONNECT...",
            },
          ]);

          setTimeout(() => {
            typingAudioPitch.current = 0.75;
            soundEngine.startAmbientDrone();
            const reMsg = "sorry about that. glitch in the line. what were we talking about?";
            setMessages((prev) => [
              ...prev,
              {
                id: `pond-reconnect-${Date.now()}`,
                sender: "pond",
                text: reMsg,
              },
            ]);
            playTypewriterForText(reMsg);
          }, 3000);
        }, 1200);
      }, 700);
    }
  }, [clownStage, triggerGlitchSpike, playTypewriterForText]);

  // GAZE AT VIEWFINDER DETECTED (Looking directly at clown in top-right)
  const handleViewfinderGaze = useCallback(() => {
    if (clownStage === "near_unsmiling") {
      setMessages((prev) => [
        ...prev,
        {
          id: `unknown-${Date.now()}`,
          sender: "unknown",
          text: "you smell nice.",
        },
      ]);
      soundEngine.stopAllSound();

      setTimeout(() => {
        triggerJumpscare();
      }, 900);
    }
  }, [clownStage, triggerJumpscare]);

  // MediaPipe Vision & Presage Biometric Telemetry Hook
  const { telemetry, isModelReady } = useFaceTelemetry({
    videoRef,
    enabled: true,
    onHeadTurn: handleHeadTurn,
    onViewfinderGaze: handleViewfinderGaze,
  });

  // CAMERA INITIALIZATION & ATTACHMENT
  const startCamera = useCallback(async () => {
    try {
      if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        console.warn("getUserMedia not available");
        return;
      }

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
        audio: false,
      });

      mediaStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch((e) => console.warn("Video play error:", e));
        };
        videoRef.current.play().catch(() => {});
      }
      setCameraActive(true);
    } catch (err) {
      console.warn("Camera init failed:", err);
      setCameraActive(false);
    }
  }, []);

  useEffect(() => {
    startCamera();

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [startCamera]);

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Window Toggling
  const handleToggleWindow = (key: "chat" | "viewfinder" | "polaroid") => {
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
        setClownStage((prev) =>
          prev === "none"
            ? "standing_far"
            : prev === "standing_far"
            ? "near_unsmiling"
            : prev === "near_unsmiling"
            ? "jumpscare_smiling"
            : "none"
        );
      } else if (e.key === "3") {
        setActiveWindows((prev) => ({ ...prev, polaroid: true }));
      } else if (e.key === "4") {
        setScreenCracked((prev) => !prev);
        setCrackSeverity((prev) => (prev === 3 ? 1 : ((prev + 1) as 1 | 2 | 3)));
      } else if (e.key === "5") {
        handleViewfinderGaze();
      } else if (e.key === "6") {
        setClownStage("none");
        setScreenCracked(false);
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
  }, [triggerGlitchSpike, handleViewfinderGaze]);

  // SEND MESSAGE TO GEMINI / BIO-ADAPTIVE BACKEND
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

    try {
      // Call Gemini 2.5 Flash route with player's real-time biometric telemetry
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

        if (data.clownStage && data.clownStage !== "none" && clownStage === "none") {
          setClownStage(data.clownStage as ClownStage);
        } else if (data.clownStage === "near_unsmiling") {
          setClownStage("near_unsmiling");
        }

        if (data.triggerGlitch) {
          triggerGlitchSpike();
        }

        if (data.viewfinderShake) {
          setViewfinderShake(true);
          setTimeout(() => setViewfinderShake(false), 800);
        }

        if (data.textDriftEffect) {
          setTextDriftTrigger(true);
        }

        if (typeof data.viewfinderDimDelta === "number") {
          setViewfinderDim((prev) => Math.min(0.4, Math.max(0, prev + Math.abs(data.viewfinderDimDelta))));
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
      console.warn("Backend chat error:", err);
      const fallbackReply = "are you still listening?";
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
      className={`min-h-screen w-full relative overflow-hidden bg-[#008080] select-none font-sans ${
        glitchActive ? "screen-glitch" : ""
      }`}
    >
      {/* CRT Scanlines Overlay */}
      <div className="retro-crt-lines" aria-hidden="true" />

      {/* Screen Crack Glass Shatter Overlay */}
      <ScreenCrack active={screenCracked} severity={crackSeverity} />

      {/* Fullscreen Smiling Clown Jumpscare */}
      <ClownEntity stage={clownStage === "jumpscare_smiling" ? "jumpscare_smiling" : "none"} />

      {/* Virtual Desktop Icons */}
      <DesktopIcons
        onOpenPolaroid={() => setActiveWindows((prev) => ({ ...prev, polaroid: true }))}
        onOpenReadme={() => setReadmeOpen(true)}
        onTriggerError={() => {
          setErrorMessage("SYSTEM ANOMALY: Access denied. Unauthorized observer detected.");
          setErrorDialogOpen(true);
        }}
        anomaliesDiscovered={clownStage === "none" ? 0 : 1}
      />

      {/* TOP DOCKED: Real-Time Affect & Head-Turn Telemetry HUD */}
      <div className="absolute top-1 left-28 right-4 md:left-36 md:right-8 z-20">
        <TelemetryHUD
          telemetry={telemetry}
          isModelReady={isModelReady}
          clownStage={clownStage}
        />
      </div>

      {/* WINDOW 1: POND Instant Messenger (Windows 98 Style) */}
      {activeWindows.chat && (
        <div
          className={`absolute top-14 left-28 md:left-36 w-[340px] md:w-[480px] bg-[#c0c0c0] win98-bevel-out shadow-2xl z-30 transition-all ${
            clownStage === "near_unsmiling" ? "border-red-900" : ""
          }`}
          style={{ maxHeight: "calc(100vh - 120px)" }}
        >
          {/* Title Bar */}
          <div
            className={`flex items-center justify-between px-2 py-1 select-none ${
              clownStage === "near_unsmiling" ? "win98-titlebar-corrupted" : "win98-titlebar"
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs text-white">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>
                {clownStage === "near_unsmiling"
                  ? "POND_OS // UNKNOWN_OBSERVER_PRESENT"
                  : "POND Instant Messenger v3.1"}
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
          <div className="p-2 flex flex-col h-[320px] md:h-[370px]">
            <div className="flex-1 bg-white win98-bevel-in p-2.5 overflow-y-auto space-y-2.5 text-xs font-mono scrollbar-thin">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`leading-relaxed ${
                    msg.sender === "user"
                      ? "text-blue-900"
                      : msg.sender === "unknown"
                      ? "text-red-600 font-extrabold tracking-widest animate-pulse"
                      : msg.sender === "pond"
                      ? "text-neutral-900 font-medium"
                      : "text-neutral-500 italic text-[11px]"
                  } ${(textDriftTrigger || msg.isDrifting) && msg.sender === "pond" ? "text-drift-fall" : ""}`}
                >
                  <span className="font-bold mr-1.5">
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
            <form onSubmit={handleSendMessage} className="mt-2 flex gap-1.5">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isAiTyping ? "pond is observing..." : "type your response..."}
                disabled={isAiTyping}
                className="flex-1 win98-bevel-in px-2 py-1 text-xs font-mono bg-white outline-none disabled:bg-neutral-100"
                autoFocus
              />
              <button
                type="submit"
                disabled={isAiTyping}
                className="win98-bevel-button px-3 py-1 text-xs font-sans text-black font-semibold disabled:opacity-50"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      {/* WINDOW 2: Video Call Viewfinder Window */}
      {activeWindows.viewfinder && (
        <div
          className={`absolute top-14 right-4 md:right-8 w-[320px] md:w-[380px] bg-[#c0c0c0] win98-bevel-out shadow-2xl z-20 ${
            viewfinderShake ? "viewfinder-shake" : ""
          }`}
          onMouseEnter={() => {
            if (clownStage === "near_unsmiling") {
              handleViewfinderGaze();
            }
          }}
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
            <span className="text-neutral-600 text-[10px]">
              ROOM_OPEN: {telemetry.faceBox.openRoomSide.toUpperCase()} // FPS: 30
            </span>
          </div>

          {/* Video Viewport Container */}
          <div className="p-2">
            <div className="relative aspect-[4/3] w-full bg-black win98-bevel-in overflow-hidden flex items-center justify-center">
              {/* Natural Live Webcam Video Feed */}
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
                className={`w-full h-full object-cover -scale-x-100 ${
                  webcamMode === "vintage" ? "webcam-vintage-natural" : "webcam-corrupted"
                }`}
              />

              {/* Re-attach button if camera is paused/offline */}
              {!cameraActive && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-neutral-400 text-xs gap-2 p-4 text-center bg-black/80">
                  <Eye className="w-8 h-8 opacity-50 animate-pulse text-neutral-300" />
                  <span className="font-mono">CAMERA PERMISSION REQUIRED</span>
                  <button
                    onClick={startCamera}
                    className="win98-bevel-button px-3 py-1.5 text-xs text-black font-semibold flex items-center gap-1.5 mt-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Enable Camera Feed
                  </button>
                </div>
              )}

              {/* Viewfinder Dimming Overlay (Paranoia effect) */}
              <div
                className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-1000 z-[5]"
                style={{ opacity: Math.min(0.4, Math.abs(viewfinderDim)) }}
              />

              {/* CLOWN ENTITY IN VIEWFINDER: positioned smartly in background based on surroundings */}
              {clownStage !== "jumpscare_smiling" && (
                <ClownEntity stage={clownStage} faceBox={telemetry.faceBox} />
              )}

              {/* Retro Viewfinder Grid Lines */}
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-2 text-[10px] font-mono text-white/50 z-[7]">
                <div className="flex justify-between">
                  <span>[REC] 00:01:42</span>
                  <span>AUTO-EXPOSURE</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-[9px] text-white/60">CH-01_ROOM_MONITOR</span>
                  <span className={clownStage !== "none" ? "text-red-300 font-bold" : "text-white/60"}>
                    {clownStage === "standing_far"
                      ? `ENTITY: FAR CORNER (${telemetry.faceBox.openRoomSide.toUpperCase()})`
                      : clownStage === "near_unsmiling"
                      ? "⚠ ENTITY: BEHIND CHAIR"
                      : "SUBJECT: ACTIVE"}
                  </span>
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
              <div className="flex items-center gap-2">
                <button
                  onClick={startCamera}
                  title="Reconnect Camera"
                  className="win98-bevel-button p-1 text-neutral-700 hover:text-black"
                >
                  <RefreshCw className="w-3 h-3" />
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
        </div>
      )}

      {/* WINDOW 3: Creepy Notepad (README.txt Lore) */}
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
                If you look at the chat, it stays still. The moment you glance at it in your
                viewfinder or turn your head to check your room, it takes another step forward.
              </p>
              <p className="mb-2">
                If it whispers to you in the chat, do not look into the camera.
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

      {/* POLAROID VIEWER POPUP (Live Face Snapshot with Actual Clown Entity) */}
      <PolaroidViewer
        isOpen={activeWindows.polaroid}
        onClose={() => setActiveWindows((prev) => ({ ...prev, polaroid: false }))}
        videoRef={videoRef}
        clownStage={clownStage}
        openRoomSide={telemetry.faceBox.openRoomSide}
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
            <span className="font-bold text-blue-900">[2]</span> Clown ({clownStage})
          </div>
          <div className="bg-white p-1 win98-bevel-in">
            <span className="font-bold text-red-900">[3]</span> Face Polaroid
          </div>
          <div className="bg-white p-1 win98-bevel-in">
            <span className="font-bold text-blue-900">[4]</span> Screen Cracks ({screenCracked ? `L${crackSeverity}` : "OFF"})
          </div>
          <div className="bg-white p-1 win98-bevel-in">
            <span className="font-bold text-red-900">[5]</span> Gaze Trap Scare
          </div>
          <div className="bg-white p-1 win98-bevel-in">
            <span className="font-bold text-blue-900">[6]</span> Reset Arc
          </div>
        </div>
      </div>

      {/* WINDOWS 98 BOTTOM TASKBAR */}
      <WindowsTaskbar
        activeWindows={activeWindows}
        onToggleWindow={handleToggleWindow}
        onEmergencyGlitch={triggerGlitchSpike}
        shadowStage={clownStage === "none" ? 0 : 2}
      />
    </main>
  );
}
