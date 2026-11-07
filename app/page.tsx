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

  // Psychological Story Arc Step
  // 0: Calibration/Casual -> 1: Far Clown Spawn -> 2: Turned & Vanished -> 3: Cutoff & Glitch -> 4: Reconnected -> 5: Creeping Near -> 6: Jumpscare
  const [storyStep, setStoryStep] = useState<number>(0);

  // Paranoia & FX States
  const [glitchActive, setGlitchActive] = useState(false);
  const [viewfinderShake, setViewfinderShake] = useState(false);
  const [viewfinderDim, setViewfinderDim] = useState(0);
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

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const typingAudioPitch = useRef<number>(1.0);

  // Typewriter character sound effect
  const playTypewriterForText = useCallback((text: string) => {
    let index = 0;
    const interval = setInterval(() => {
      soundEngine.playKeystroke(typingAudioPitch.current);
      index++;
      if (index >= text.length) {
        clearInterval(interval);
      }
    }, 45);
  }, []);

  // Trigger violent screen glitch
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
    // If the clown was standing in the far corner, turning around causes it to DISAPPEAR!
    if (clownStage === "standing_far") {
      setClownStage("none"); // It vanishes!
      setStoryStep(2);

      // Mid-sentence cutoff sequence
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

        // Glitch & Simulated Disconnect
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

          // Reconnect casually after 3 seconds
          setTimeout(() => {
            typingAudioPitch.current = 0.75;
            soundEngine.startAmbientDrone();
            setStoryStep(4);
            setMessages((prev) => [
              ...prev,
              {
                id: `pond-reconnect-${Date.now()}`,
                sender: "pond",
                text: "sorry about that. glitch in the line. what were we talking about?",
              },
            ]);
            playTypewriterForText("sorry about that. glitch in the line. what were we talking about?");
          }, 3000);
        }, 1200);
      }, 700);
    }
  }, [clownStage, triggerGlitchSpike, playTypewriterForText]);

  // GAZE AT VIEWFINDER DETECTED (Player looks directly at the clown window!)
  const handleViewfinderGaze = useCallback(() => {
    // If the clown is near behind the chair and player looks right at it:
    if (clownStage === "near_unsmiling") {
      // 1. Intruder message from "unknown"
      setMessages((prev) => [
        ...prev,
        {
          id: `unknown-${Date.now()}`,
          sender: "unknown",
          text: "you smell nice.",
        },
      ]);
      soundEngine.stopAllSound();

      // 2. Jumpscare after brief dread pause
      setTimeout(() => {
        triggerJumpscare();
      }, 900);
    }
  }, [clownStage, triggerJumpscare]);

  // MediaPipe Vision Telemetry Hook
  const { telemetry, isModelReady } = useFaceTelemetry({
    videoRef,
    enabled: true,
    onHeadTurn: handleHeadTurn,
    onViewfinderGaze: handleViewfinderGaze,
  });

  // Initialize Webcam (Natural early 2000s CMOS styling)
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
        // Cycle Clown Stage manually for testing
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
        // Open live creepy face Polaroid
        setActiveWindows((prev) => ({ ...prev, polaroid: true }));
      } else if (e.key === "4") {
        // Toggle screen glass fracture cracks
        setScreenCracked((prev) => !prev);
        setCrackSeverity((prev) => (prev === 3 ? 1 : ((prev + 1) as 1 | 2 | 3)));
      } else if (e.key === "5") {
        // Trigger Gaze Trap & Jumpscare manually
        handleViewfinderGaze();
      } else if (e.key === "6") {
        // Reset Story Arc to Start
        setClownStage("none");
        setStoryStep(0);
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

  // User sends message in POND Messenger
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: userText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");

    // Psychological Narrative Script progression based on storyStep:
    setTimeout(() => {
      if (storyStep === 0) {
        // Calibration 1 -> ask if in room
        const reply = "cool. thanks for hopping on. are you in your room right now?";
        setMessages((prev) => [
          ...prev,
          { id: `pond-${Date.now()}`, sender: "pond", text: reply },
        ]);
        playTypewriterForText(reply);
        setStoryStep(1);
      } else if (storyStep === 1) {
        // Calibration 2 -> trigger the far clown standing
        const reply = "wait... who's behind you?";
        setMessages((prev) => [
          ...prev,
          { id: `pond-${Date.now()}`, sender: "pond", text: reply },
        ]);
        playTypewriterForText(reply);

        // Spawn Clown far away in the back corner!
        setTimeout(() => {
          setClownStage("standing_far");
        }, 800);
      } else if (storyStep === 4) {
        // Reconnected -> noticing subtle wrong details
        const reply = "your door was closed earlier, right?";
        setMessages((prev) => [
          ...prev,
          { id: `pond-${Date.now()}`, sender: "pond", text: reply },
        ]);
        playTypewriterForText(reply);
        setStoryStep(5);
      } else if (storyStep === 5) {
        // Creeping near & warn not to look
        const reply = "do not look at your viewfinder. it only moves when you look.";
        setMessages((prev) => [
          ...prev,
          { id: `pond-${Date.now()}`, sender: "pond", text: reply },
        ]);
        playTypewriterForText(reply);

        // Reappear closer behind chair!
        setTimeout(() => {
          setClownStage("near_unsmiling");
          setViewfinderDim(-0.25);
        }, 1200);
      }
    }, 1100);
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
                  } ${textDriftTrigger && msg.sender === "pond" ? "text-drift-fall" : ""}`}
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

      {/* WINDOW 2: Video Call Viewfinder Window with Player's Clown Entity */}
      {activeWindows.viewfinder && (
        <div
          className={`absolute top-14 right-4 md:right-8 w-[320px] md:w-[380px] bg-[#c0c0c0] win98-bevel-out shadow-2xl z-20 ${
            viewfinderShake ? "viewfinder-shake" : ""
          }`}
          onMouseEnter={() => {
            // Mouse hover also triggers gaze detection if near clown
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
              YAW: {telemetry.headYaw}° | FPS: 30
            </span>
          </div>

          {/* Video Viewport Container */}
          <div className="p-2">
            <div className="relative aspect-[4/3] w-full bg-black win98-bevel-in overflow-hidden flex items-center justify-center">
              {/* Natural Live Webcam Video Feed */}
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
                    ALLOW CAMERA PERMISSION FOR AFFECT TRACKING
                  </span>
                </div>
              )}

              {/* Viewfinder Dimming Overlay */}
              <div
                className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-1000"
                style={{ opacity: Math.abs(viewfinderDim) }}
              />

              {/* CLOWN ENTITY IN VIEWFINDER: standing far or creeping near behind chair */}
              {clownStage !== "jumpscare_smiling" && <ClownEntity stage={clownStage} />}

              {/* Retro Viewfinder Grid Lines */}
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-2 text-[10px] font-mono text-white/40">
                <div className="flex justify-between">
                  <span>[REC] 00:01:42</span>
                  <span>AUTO-EXPOSURE</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-[9px] text-white/60">CH-01_ROOM_MONITOR</span>
                  <span className={clownStage !== "none" ? "text-red-300 font-bold" : "text-white/60"}>
                    {clownStage === "standing_far"
                      ? "ENTITY: FAR CORNER"
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

      {/* POLAROID VIEWER POPUP (Live Face Snapshot) */}
      <PolaroidViewer
        isOpen={activeWindows.polaroid}
        onClose={() => setActiveWindows((prev) => ({ ...prev, polaroid: false }))}
        videoRef={videoRef}
        shadowStage={clownStage === "none" ? 0 : clownStage === "standing_far" ? 1 : 2}
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
