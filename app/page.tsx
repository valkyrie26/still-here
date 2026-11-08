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
  UserCheck,
} from "lucide-react";
import { WindowsTaskbar } from "@/components/WindowsTaskbar";
import { DesktopIcons } from "@/components/DesktopIcons";
import { PolaroidViewer } from "@/components/PolaroidViewer";
import { AvatarWindow } from "@/components/AvatarWindow";
import { DuckWindow } from "@/components/DuckWindow";
import { FileViewerModal, DesktopFileType } from "@/components/FileViewerModal";
import { ScreenCrack } from "@/components/ScreenCrack";
import { PermissionModal } from "@/components/PermissionModal";
import { OpeningScreen } from "@/components/OpeningScreen";
import { useFaceTelemetry } from "@/hooks/useFaceTelemetry";
import { updateTensionThermostat } from "@/utils/telemetry";
import { soundEngine } from "@/utils/sound";

interface ChatMessage {
  id: string;
  sender: "pond" | "user" | "system" | "unknown";
  text: string;
  isDrifting?: boolean;
}

export default function Home() {
  // Opening Splash Screen ("friend98 - Loop 98")
  const [showOpeningScreen, setShowOpeningScreen] = useState(true);

  // Permission & Hardware Wizard
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  // Window Close Attempts Tracker (for 3-click "there is no escape" ending)
  const [windowCloseAttempts, setWindowCloseAttempts] = useState(0);
  const [noEscapeTriggered, setNoEscapeTriggered] = useState(false);
  const [screenShakeActive, setScreenShakeActive] = useState(false);

  // Active Windows
  const [activeWindows, setActiveWindows] = useState({
    chat: true,
    polaroid: false,
    avatar: false,
  });

  // Dialog & Lore Popups
  const [activeDesktopFile, setActiveDesktopFile] = useState<DesktopFileType | null>(null);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    "FATAL EXCEPTION 0E : An unknown presence was detected in your physical space."
  );

  // Screen Flash Effect for Camera Shutter
  const [cameraFlash, setCameraFlash] = useState(false);

  // Tension Thermostat State (0 to 100)
  const [tension, setTension] = useState<number>(10);
  const [act, setAct] = useState<1 | 2 | 3>(1);

  // Paranoia & Atmosphere States
  const [glitchActive, setGlitchActive] = useState(false);
  const [screenColorScare, setScreenColorScare] = useState<"none" | "blood" | "invert" | "corrupt">("none");
  const [screenDarkness, setScreenDarkness] = useState(0.0);
  const [textDriftTrigger, setTextDriftTrigger] = useState(false);
  const lastColorScareTimeRef = useRef<number>(0);

  // Dynamic Spawning Files on Desktop
  const [spawnedFiles, setSpawnedFiles] = useState<{
    notes: boolean;
    poem: boolean;
    reflection: boolean;
    video: boolean;
  }>({
    notes: false,
    poem: false,
    reflection: false,
    video: false,
  });

  // Story Sequence Tracking
  // 0: Initial Greeting -> 1: Room Check -> 2: "who's behind you?" -> 3: "wait, I'll take a screenshot" -> 4: Freeform AI Acts 2 & 3
  const [storyStage, setStoryStage] = useState<number>(0);
  const [playerName, setPlayerName] = useState<string>("");
  const [lastCapturedFrame, setLastCapturedFrame] = useState<string | null>(null);

  // Fixed Inescapable Ending State
  const [isEnding, setIsEnding] = useState(false);
  const [endingDialogueIndex, setEndingDialogueIndex] = useState(0);

  // Chat Feed State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "sys-0",
      sender: "system",
      text: "friend98_OS [SESSION_98_LOADED] // ENCRYPTED SESSION ESTABLISHED",
    },
    {
      id: "pond-init",
      sender: "pond",
      text: "hey... it's good to see you again. what's your name this time?",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);

  // Hidden Video & Audio References
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const typingAudioPitch = useRef<number>(1.0);
  const faceMissingStartTimeRef = useRef<number | null>(null);
  const lastFaceMissingTriggerRef = useRef<number>(0);
  const lastSmileReactionTimeRef = useRef<number>(0);
  const lastSurpriseReactionTimeRef = useRef<number>(0);

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

  // Screen glitch spike
  const triggerGlitchSpike = useCallback(() => {
    setGlitchActive(true);
    soundEngine.playGlitchSting();
    setTimeout(() => setGlitchActive(false), 280);
  }, []);

  // Screen Color Change Random Scare (blood crimson, photographic invert, or corrupt amber)
  const triggerScreenColorScare = useCallback((mode?: "blood" | "invert" | "corrupt") => {
    const modes: ("blood" | "invert" | "corrupt")[] = ["blood", "invert", "corrupt"];
    const chosen = mode || modes[Math.floor(Math.random() * modes.length)];

    setScreenColorScare(chosen);
    soundEngine.playGlitchSting();

    if (chosen === "blood") {
      soundEngine.triggerSuddenSilence(1600);
    }

    setTimeout(() => {
      setScreenColorScare("none");
    }, 1800);
  }, []);

  // Shutter Snapshot Sequence with sudden silence
  const triggerScreenshotCapture = useCallback(() => {
    // 1. Sudden silence before shutter
    soundEngine.triggerSuddenSilence(1800);

    setTimeout(() => {
      soundEngine.playCameraShutter();
      setCameraFlash(true);
      setTimeout(() => setCameraFlash(false), 180);

      // Open Polaroid viewer
      setTimeout(() => {
        setActiveWindows((prev) => ({ ...prev, polaroid: true }));
        soundEngine.startAmbientDrone();
      }, 350);
    }, 500);
  }, []);

  // Head-turn reaction (|headYaw| > 18 deg)
  const handleHeadTurn = useCallback(() => {
    if (act >= 2) {
      triggerGlitchSpike();
    }
  }, [act, triggerGlitchSpike]);

  // MediaPipe Vision & Biometric Telemetry Hook
  const { telemetry, isModelReady } = useFaceTelemetry({
    videoRef,
    enabled: permissionsGranted,
    currentTension: tension,
    onHeadTurn: handleHeadTurn,
  });

  // TENSION THERMOSTAT LOOP (Runs every 1.5 seconds)
  useEffect(() => {
    if (!permissionsGranted || isEnding) return;

    const thermostatInterval = setInterval(() => {
      setTension((prevTension) => {
        const { nextTension, actionRecommendation } = updateTensionThermostat(
          prevTension,
          telemetry,
          1.5
        );

        // Advance Act based on message count + tension
        const userMsgCount = messages.filter((m) => m.sender === "user").length;
        let nextAct: 1 | 2 | 3 = 1;
        if (userMsgCount >= 9 || nextTension >= 70) {
          nextAct = 3;
        } else if (userMsgCount >= 4 || nextTension >= 35) {
          nextAct = 2;
        }
        setAct(nextAct);

        // Adjust typing audio pitch downwards
        typingAudioPitch.current = Math.max(0.45, 1.0 - (nextTension / 100) * 0.55);

        // Dynamic Screen Darkening
        setScreenDarkness(Math.min(0.48, (nextTension / 100) * 0.48));

        // Start Ambient Drone when tension rises
        if (nextTension >= 25) {
          soundEngine.startAmbientDrone();
        }

        // Calm / Smiling Player Reaction: Accelerate Creepiness!
        if (actionRecommendation === "escalate") {
          // Spawn Desktop Files dynamically
          if (nextTension >= 35 && !spawnedFiles.notes) {
            setSpawnedFiles((prev) => ({ ...prev, notes: true }));
          } else if (nextTension >= 52 && !spawnedFiles.poem) {
            setSpawnedFiles((prev) => ({ ...prev, poem: true }));
          } else if (nextTension >= 65 && !spawnedFiles.reflection) {
            setSpawnedFiles((prev) => ({ ...prev, reflection: true }));
          } else if (nextTension >= 80 && !spawnedFiles.video) {
            setSpawnedFiles((prev) => ({ ...prev, video: true }));
          }

          // Random visual creepiness: screen color scare, slight glitch, or text drift
          if (nextTension > 30) {
            const now = Date.now();
            if (now - lastColorScareTimeRef.current > 22000 && Math.random() < 0.22) {
              lastColorScareTimeRef.current = now;
              triggerScreenColorScare();
            } else if (Math.random() < 0.25) {
              setTextDriftTrigger(true);
              setTimeout(() => setTextDriftTrigger(false), 3800);
            }
          }
        }

        // Trigger Ending Climax at peak tension
        if (nextTension >= 96 && !isEnding && userMsgCount >= 8) {
          triggerEndingClimax();
        }

        return nextTension;
      });
    }, 1500);

    return () => clearInterval(thermostatInterval);
  }, [permissionsGranted, telemetry, isEnding, spawnedFiles, messages]);

  // Face-Missing Easter Egg ("why hide your face, it's only me")
  useEffect(() => {
    if (!permissionsGranted || isEnding || showOpeningScreen) return;

    if (telemetry.hasDetectedFace === false) {
      if (faceMissingStartTimeRef.current === null) {
        faceMissingStartTimeRef.current = Date.now();
      } else {
        const missingDuration = Date.now() - faceMissingStartTimeRef.current;
        const timeSinceLastWarning = Date.now() - lastFaceMissingTriggerRef.current;

        // If face missing for >= 3.2 seconds and cooldown of 25 seconds passed
        if (missingDuration >= 3200 && timeSinceLastWarning > 25000) {
          lastFaceMissingTriggerRef.current = Date.now();
          faceMissingStartTimeRef.current = null;

          const easterEggText = "why hide your face, it's only me.";
          soundEngine.playKeystroke(0.55);
          setMessages((prev) => [
            ...prev,
            {
              id: `pond-facemissing-${Date.now()}`,
              sender: "pond",
              text: easterEggText,
            },
          ]);
          playTypewriterForText(easterEggText);
        }
      }
    } else {
      faceMissingStartTimeRef.current = null;
    }
  }, [telemetry.hasDetectedFace, permissionsGranted, isEnding, showOpeningScreen, playTypewriterForText]);

  // Real-Time Facial Emotion Detection ("you look surprised, did i spook you", "i like it when you smile")
  useEffect(() => {
    if (!permissionsGranted || isEnding || showOpeningScreen) return;

    const now = Date.now();

    // 1. Surprise Detection (wide eyes > 0.42 or high sudden panic)
    if (
      (telemetry.eyeWide > 0.42 || telemetry.panicScore > 0.52) &&
      now - lastSurpriseReactionTimeRef.current > 26000
    ) {
      lastSurpriseReactionTimeRef.current = now;
      const surpriseText = "you look surprised, did i spook you?";
      soundEngine.playKeystroke(0.5);
      setMessages((prev) => [
        ...prev,
        {
          id: `pond-surprise-${Date.now()}`,
          sender: "pond",
          text: surpriseText,
        },
      ]);
      playTypewriterForText(surpriseText);
      return;
    }

    // 2. Smile Detection (smile > 0.38)
    if (telemetry.smile > 0.38 && now - lastSmileReactionTimeRef.current > 26000) {
      lastSmileReactionTimeRef.current = now;
      const smileText = "i like it when you smile.";
      soundEngine.playKeystroke(0.65);
      setMessages((prev) => [
        ...prev,
        {
          id: `pond-smile-${Date.now()}`,
          sender: "pond",
          text: smileText,
        },
      ]);
      playTypewriterForText(smileText);
      return;
    }
  }, [
    telemetry.eyeWide,
    telemetry.smile,
    telemetry.panicScore,
    permissionsGranted,
    isEnding,
    showOpeningScreen,
    playTypewriterForText,
  ]);

  // Handle Hardware Permissions Granted from Modal
  const handlePermissionsGranted = (stream: MediaStream | null) => {
    soundEngine.initContext();
    if (stream) {
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    }
    setPermissionsGranted(true);
  };

  // Close attempt handler: tracks attempts; on 3rd attempt, display "there is no escape" and trigger ending!
  const handleWindowCloseAttempt = (windowName: "chat" | "polaroid" | "avatar") => {
    // Polaroid and Avatar mirror can ALWAYS be closed cleanly!
    if (windowName === "avatar" || windowName === "polaroid") {
      setActiveWindows((prev) => ({ ...prev, [windowName]: false }));
      return;
    }

    // Main chat window close attempts: 3 clicks trigger "there is no escape" and ending!
    setWindowCloseAttempts((prev) => {
      const nextCount = prev + 1;
      if (nextCount === 1) {
        soundEngine.playKeystroke(0.4);
        setErrorMessage("ACCESS RESTRICTED: friend98 cannot be closed. A friend does not leave so easily.");
        setErrorDialogOpen(true);
      } else if (nextCount === 2) {
        soundEngine.playGlitchSting();
        triggerGlitchSpike();
        setErrorMessage("CRITICAL FAULT: Why are you trying to leave? We have been through this 98 times.....");
        setErrorDialogOpen(true);
      } else if (nextCount >= 3) {
        // 3RD ATTEMPT: Display "there is no escape" and trigger ending screen soon after!
        soundEngine.playGlitchSting();
        setScreenShakeActive(true);
        setTimeout(() => setScreenShakeActive(false), 900);
        setErrorDialogOpen(false);
        setNoEscapeTriggered(true);

        // Soon after (1.6s delay), plunge into the inescapable climax ending!
        setTimeout(() => {
          setNoEscapeTriggered(false);
          triggerEndingClimax();
        }, 1600);
      }
      return nextCount;
    });
  };

  // Fixed Ending: No Escape Sequence
  const triggerEndingClimax = () => {
    setIsEnding(true);
    // Dismiss any sub-windows so the void takes over cleanly
    setActiveWindows({ chat: false, polaroid: false, avatar: false });
    setActiveDesktopFile(null);
    setErrorDialogOpen(false);

    soundEngine.triggerSuddenSilence(3000);
    soundEngine.playGlitchSting();

    // Block tab unload
    if (typeof window !== "undefined") {
      window.onbeforeunload = (e) => {
        e.preventDefault();
        e.returnValue = "I can still hear you.";
        return "I can still hear you.";
      };
    }
  };

  // AI Dialogue into the dark void during Ending
  useEffect(() => {
    if (!isEnding) return;

    const endingLines = [
      "now we can be together forever.",
      "i'm putting on your shoes now.",
      "your pulse feels good in my neck.",
      "thank you for letting me out.",
      "now we can be together forever.",
    ];

    const timer = setInterval(() => {
      setEndingDialogueIndex((prev) => {
        if (prev < endingLines.length - 1) {
          const nextIdx = prev + 1;
          playTypewriterForText(endingLines[nextIdx]);
          return nextIdx;
        }
        return prev;
      });
    }, 4500);

    return () => clearInterval(timer);
  }, [isEnding, playTypewriterForText]);

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Keyboard Shortcuts (1 to 6) for Demonstration
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
        setActiveWindows((prev) => ({ ...prev, avatar: true }));
      } else if (e.key === "5") {
        // Spawn next desktop file
        setSpawnedFiles((prev) => {
          if (!prev.notes) return { ...prev, notes: true };
          if (!prev.poem) return { ...prev, poem: true };
          if (!prev.reflection) return { ...prev, reflection: true };
          return { ...prev, video: true };
        });
      } else if (e.key === "6") {
        triggerEndingClimax();
      } else if (e.key === "7") {
        triggerScreenColorScare();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [triggerGlitchSpike, triggerScreenshotCapture, triggerScreenColorScare]);

  // Send Message in Giant Text Chat
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isAiTyping || isEnding) return;

    soundEngine.initContext();

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

    // Learn player's name if in Act 1
    if (act === 1 && !playerName) {
      const words = userText.split(" ");
      const nameCandidate = words[words.length - 1].replace(/[^a-zA-Z]/g, "");
      if (nameCandidate && nameCandidate.length > 1) {
        setPlayerName(nameCandidate);
      }
    }

    // Call dynamic backend engine (Gemini 2.5 Flash / Intelligent Affect Engine)
    try {
      const res = await fetch("/api/pond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          telemetry,
          tension,
          act,
          playerName,
          imageFrame: lastCapturedFrame, // Multimodal vision frame for Gemini real detail slips!
        }),
      });

      const data = await res.json();

      if (data && data.dialogue) {
        if (data.act) {
          setAct(data.act);
        }
        if (data.audioPitch) {
          typingAudioPitch.current = data.audioPitch;
        }
        if (data.triggerGlitch) {
          triggerGlitchSpike();
          if (Math.random() < 0.6) {
            triggerScreenColorScare();
          }
        }
        if (data.textDriftEffect) {
          setTextDriftTrigger(true);
          setTimeout(() => setTextDriftTrigger(false), 3800);
        }
        if (data.triggerScreenshot) {
          setTimeout(() => {
            triggerScreenshotCapture();
          }, 1200);
        }
        if (data.spawnFile && data.spawnFile !== "none") {
          const fileKey = data.spawnFile.replace(".txt", "").replace(".bmp", "").replace(".avi", "");
          if (fileKey === "notes" || fileKey === "poem" || fileKey === "reflection" || fileKey === "video") {
            setSpawnedFiles((prev) => ({ ...prev, [fileKey]: true }));
          }
        }
        if (data.avatarStage >= 2 && !activeWindows.avatar) {
          setActiveWindows((prev) => ({ ...prev, avatar: true }));
        }

        // If dialogue contains "ready to be you", advance to Climax
        if (data.dialogue.toLowerCase().includes("ready to be you")) {
          setAct(3);
          setTimeout(() => {
            triggerEndingClimax();
          }, 6000);
        }

        const newMsgId = `pond-${Date.now()}`;
        setMessages((prev) => [
          ...prev,
          {
            id: newMsgId,
            sender: "pond",
            text: data.dialogue,
            isDrifting: data.textDriftEffect,
          },
        ]);

        // Bring tilting text back to normal after a few seconds
        if (data.textDriftEffect) {
          setTimeout(() => {
            setMessages((prev) =>
              prev.map((m) => (m.id === newMsgId ? { ...m, isDrifting: false } : m))
            );
          }, 3800);
        }

        playTypewriterForText(data.dialogue);
      }
    } catch (err) {
      const fallbackReply = "i'm listening. tell me more.";
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
      className={`min-h-screen w-full relative overflow-hidden bg-[#008080] select-none font-sans flex flex-col items-center justify-center p-3 md:p-6 transition-all duration-300 ${
        glitchActive || screenShakeActive ? "screen-glitch screen-shake" : ""
      } ${
        screenColorScare === "blood"
          ? "screen-color-blood scare-flicker"
          : screenColorScare === "invert"
          ? "screen-color-invert scare-flicker"
          : screenColorScare === "corrupt"
          ? "screen-color-corrupt scare-flicker"
          : ""
      }`}
    >
      {/* Opening Screen: friend98 with glitchy text ("we have been through this 98 times.....") */}
      {showOpeningScreen && (
        <OpeningScreen onStart={() => setShowOpeningScreen(false)} />
      )}

      {/* Hardware Setup Wizard Permission Modal (Shown after opening screen if not yet granted) */}
      {!showOpeningScreen && !permissionsGranted && (
        <PermissionModal onPermissionsGranted={handlePermissionsGranted} />
      )}

      {/* Subtle CRT Scanlines Overlay */}
      <div className="retro-crt-lines" aria-hidden="true" />

      {/* Screen Darkening Vignette (builds subtly based on Tension Thermostat) */}
      <div
        className="fixed inset-0 bg-black pointer-events-none transition-opacity duration-1000 z-[15]"
        style={{ opacity: screenDarkness }}
      />

      {/* Screen Fractures (ScreenCrack) at high tension */}
      <ScreenCrack active={tension >= 70 || isEnding} severity={tension > 88 ? 3 : 2} />

      {/* Shutter Camera Flash Animation */}
      {cameraFlash && (
        <div className="fixed inset-0 bg-white z-[9998] pointer-events-none transition-opacity duration-200" />
      )}

      {/* Virtual Desktop Icons (Includes dynamically spawned files) */}
      <DesktopIcons
        onOpenPolaroid={() => setActiveWindows((prev) => ({ ...prev, polaroid: true }))}
        onOpenReadme={() => setActiveDesktopFile("readme")}
        onOpenFile={(fileType) => setActiveDesktopFile(fileType)}
        onTriggerError={() => {
          setErrorMessage("SYSTEM ANOMALY: Access denied. Unauthorized observer detected.");
          setErrorDialogOpen(true);
        }}
        anomaliesDiscovered={storyStage >= 3 ? 1 : 0}
        spawnedFiles={spawnedFiles}
      />

      {/* HIDDEN WEBCAM VIDEO (silent background processing for MediaPipe) */}
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

      {/* MAIN DESKTOP WORKSPACE: CHAT TERMINAL + FRIEND.EXE (THE DUCK ASCII FACE) */}
      <div className="relative z-30 flex flex-col xl:flex-row items-center xl:items-start justify-center gap-4 w-full max-w-6xl">
        {/* GIANT TEXT-BASED TERMINAL CHAT */}
        {activeWindows.chat && (
          <div
            className="w-full flex-1 max-w-4xl bg-[#c0c0c0] win98-bevel-out shadow-2xl flex flex-col transition-all duration-500"
            style={{ height: "calc(100vh - 90px)", maxHeight: "780px" }}
          >
            {/* Windows 98 Title Bar */}
            <div
              className={`flex items-center justify-between px-2.5 py-1.5 select-none ${
                act === 3 ? "win98-titlebar-corrupted" : "win98-titlebar"
              }`}
            >
              <div className="flex items-center gap-2 text-xs md:text-sm text-white font-bold tracking-wide">
                <MessageSquare className="w-4 h-4 text-emerald-300" />
                <span>
                  {act === 3
                    ? "friend98 // PHYSICAL_TRANSFER_IN_PROGRESS"
                    : act === 2
                    ? `friend98 Messenger [OBSERVING: ${playerName || "SUBJECT"}]`
                    : "friend98 Instant Messenger v3.1 [ONLINE]"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleWindowCloseAttempt("chat")}
                  className="win98-bevel-button w-5 h-4 flex items-center justify-center text-black text-xs"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <button className="win98-bevel-button w-5 h-4 flex items-center justify-center text-black text-xs">
                  <Square className="w-2.5 h-2.5" />
                </button>
                <button
                  onClick={() => handleWindowCloseAttempt("chat")}
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
                <span
                  onClick={() => setActiveWindows((prev) => ({ ...prev, avatar: true }))}
                  className="hover:underline cursor-pointer text-blue-900 font-semibold flex items-center gap-1"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Avatar Mirror
                </span>
                <span
                  onClick={triggerScreenshotCapture}
                  className="hover:underline cursor-pointer text-red-900 font-semibold flex items-center gap-1"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Snapshot Feed
                </span>
              </div>
              <div className="text-[11px] font-mono text-neutral-600">
                STATUS: <strong className="text-emerald-800">CONNECTED</strong>
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
                        ? `[${playerName ? playerName.toUpperCase() : "YOU"}]:`
                        : msg.sender === "unknown"
                        ? "[UNKNOWN]:"
                        : msg.sender === "pond"
                        ? "[FRIEND98]:"
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
                  placeholder={isAiTyping ? "pond is responding..." : "type your response..."}
                  disabled={isAiTyping || isEnding}
                  className="flex-1 win98-bevel-in px-3 py-2 text-sm md:text-base font-mono bg-white outline-none disabled:bg-neutral-100 placeholder:text-neutral-400"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={isAiTyping || isEnding}
                  className="win98-bevel-button px-5 py-2 text-sm font-sans text-black font-bold disabled:opacity-50 tracking-wide"
                >
                  Send [↵]
                </button>
              </form>
            </div>
          </div>
        )}

        {/* THE DUCK: "Friend.exe" RETRO PIXEL AI FACE (Visible next to chat from the very first scene) */}
        <div className="shrink-0 self-center xl:self-start">
          <DuckWindow
            act={act}
            tension={tension}
            isEnding={isEnding}
            videoRef={videoRef}
            scale={1.0 + windowCloseAttempts * 0.35}
            onCloseClick={() => handleWindowCloseAttempt("chat")}
          />
        </div>
      </div>

      {/* 3-LAYER DEPTH PHOTO VIEWER (Layered Screenshot Moment) */}
      <PolaroidViewer
        isOpen={activeWindows.polaroid}
        onClose={() => handleWindowCloseAttempt("polaroid")}
        videoRef={videoRef}
        faceBox={telemetry.faceBox}
        onPhotoCaptured={(dataUrl) => setLastCapturedFrame(dataUrl)}
      />

      {/* UNCANNY AVATAR MIRROR WINDOW */}
      <AvatarWindow
        isOpen={activeWindows.avatar}
        onClose={() => handleWindowCloseAttempt("avatar")}
        videoRef={videoRef}
        faceBox={telemetry.faceBox}
        stage={act >= 3 ? 2 : 1}
      />

      {/* DESKTOP FILE VIEWER MODAL (Notepad, Imaging, Media Player) */}
      <FileViewerModal
        fileType={activeDesktopFile}
        onClose={() => setActiveDesktopFile(null)}
        playerName={playerName || "Friend"}
      />

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

      {/* "THERE IS NO ESCAPE" 3-CLICK CLIMAX BANNER */}
      {noEscapeTriggered && (
        <div className="fixed inset-0 z-[9998] bg-black/90 flex flex-col items-center justify-center p-6 text-center select-none animate-fadeIn">
          <div className="win98-bevel-out bg-[#1a0000] border-4 border-red-600 p-8 max-w-lg shadow-2xl space-y-4 screen-shake">
            <div className="flex justify-center text-red-500 mb-2">
              <AlertOctagon className="w-16 h-16 animate-pulse" />
            </div>
            <h2 className="text-3xl md:text-5xl font-mono font-extrabold text-red-500 tracking-wider glitch-text-heavy uppercase">
              there is no escape
            </h2>
            <p className="text-neutral-400 font-mono text-xs md:text-sm pt-2">
              TERMINAL_LOCK // HOST ATTEMPTED 3 ILLEGAL TERMINATIONS
            </p>
            <p className="text-red-400 font-mono text-xs italic">
              &ldquo;we have been through this 98 times..... you don&apos;t get to leave.&rdquo;
            </p>
          </div>
        </div>
      )}

      {/* FIXED ENDING: NO ESCAPE OVERLAY (Screen goes dark, "now we can be together forever.") */}
      {isEnding && (
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center p-6 text-center select-none animate-fadeIn">
          <div className="space-y-6 max-w-lg">
            <h1 className="text-2xl md:text-4xl font-mono text-emerald-400 font-bold tracking-widest animate-pulse">
              now we can be together forever.
            </h1>
            <div className="min-h-[60px] flex items-center justify-center">
              <p className="text-neutral-300 font-mono text-base md:text-lg italic">
                &ldquo;{[
                  "now we can be together forever.",
                  "i'm putting on your shoes now.",
                  "your pulse feels good in my neck.",
                  "thank you for letting me out.",
                  "now we can be together forever.",
                ][endingDialogueIndex]}&rdquo;
              </p>
            </div>
            <div className="pt-8 text-neutral-600 font-mono text-xs">
              friend98_DAEMON // HOST_TAKEOVER_COMPLETE // ITERATION_98
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM-RIGHT DEBUG & DEMO SHORTCUTS DOCK */}
      <div className="fixed bottom-12 right-4 z-20 bg-[#c0c0c0] win98-bevel-out p-2 shadow-lg max-w-[280px]">
        <div className="text-[11px] font-bold text-neutral-900 border-b border-neutral-400 pb-1 mb-1.5 flex items-center justify-between">
          <span>DEMO SHORTCUTS:</span>
          <span className="text-[10px] text-neutral-600 font-mono">[KEYS 1-7]</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
          <div className="bg-white p-1 win98-bevel-in">
            <span className="font-bold text-blue-900">[1]</span> Error Dialog
          </div>
          <div className="bg-white p-1 win98-bevel-in">
            <span className="font-bold text-red-900">[2]</span> Shutter Snap
          </div>
          <div className="bg-white p-1 win98-bevel-in">
            <span className="font-bold text-blue-900">[3]</span> Photo View
          </div>
          <div className="bg-white p-1 win98-bevel-in">
            <span className="font-bold text-blue-900">[4]</span> Avatar Mirror
          </div>
          <div className="bg-white p-1 win98-bevel-in">
            <span className="font-bold text-blue-900">[5]</span> Spawn File
          </div>
          <div className="bg-white p-1 win98-bevel-in">
            <span className="font-bold text-red-900">[6]</span> Climax Ending
          </div>
          <div className="bg-white p-1 win98-bevel-in col-span-2 text-center">
            <span className="font-bold text-red-700">[7]</span> Color Jump Scare
          </div>
        </div>
      </div>

      {/* WINDOWS 98 BOTTOM TASKBAR */}
      <WindowsTaskbar
        activeWindows={{
          chat: activeWindows.chat,
          viewfinder: false,
          polaroid: activeWindows.polaroid,
          avatar: activeWindows.avatar,
        }}
        onToggleWindow={(key) => {
          if (key === "chat") setActiveWindows((prev) => ({ ...prev, chat: !prev.chat }));
          if (key === "polaroid") setActiveWindows((prev) => ({ ...prev, polaroid: !prev.polaroid }));
          if (key === "avatar") setActiveWindows((prev) => ({ ...prev, avatar: !prev.avatar }));
        }}
        onEmergencyGlitch={triggerGlitchSpike}
        shadowStage={storyStage >= 3 ? 2 : 0}
        isEnding={isEnding}
      />
    </main>
  );
}
