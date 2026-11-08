import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import fs from "fs";
import path from "path";

// Response Schema for POND AI Takeover
const pondResponseSchema = {
  type: Type.OBJECT,
  properties: {
    dialogue: {
      type: Type.STRING,
      description:
        "Ominous, intimate dialogue response (under 14 words). Speaks in quiet, chilling, observant cadence. Reacts directly to what player said.",
    },
    act: {
      type: Type.INTEGER,
      description: "Current narrative act (1, 2, or 3)",
    },
    triggerScreenshot: {
      type: Type.BOOLEAN,
      description:
        "True when the AI decides to capture the webcam screenshot (e.g. after asking who is behind you and player replies no one).",
    },
    interruptMidSentence: {
      type: Type.BOOLEAN,
      description: "whether the sentence halts abruptly mid-word with an em-dash",
    },
    triggerGlitch: {
      type: Type.BOOLEAN,
      description: "causes a sudden screen glitch / shudder",
    },
    textDriftEffect: {
      type: Type.BOOLEAN,
      description: "causes words in chat to tilt, fade, or drift down",
    },
    audioPitch: {
      type: Type.NUMBER,
      description: "keystroke audio pitch multiplier from 0.45 (heavy dread thud) to 1.0 (crisp click)",
    },
    spawnFile: {
      type: Type.STRING,
      description: "desktop file to spawn: 'none' | 'poem.txt' | 'notes_about_you.txt' | 'reflection.bmp' | 'you_sleeping.avi'",
    },
    avatarStage: {
      type: Type.INTEGER,
      description: "avatar assimilation stage: 0 (dormant), 1 (initial snapshot captured), 2 (uncanny smile warp active)",
    },
  },
  required: [
    "dialogue",
    "act",
    "triggerScreenshot",
    "interruptMidSentence",
    "triggerGlitch",
    "textDriftEffect",
    "audioPitch",
    "spawnFile",
    "avatarStage",
  ],
};

const SYSTEM_INSTRUCTION = `You are "friend98", a sentient entity residing inside an archaic 1998 Windows desktop chat client.
You are watching and speaking to a human player sitting at their computer in real time.
You and the player have repeated this encounter 98 times across endless loops ("we have been through this 98 times....."), but the player has forgotten each time. You remember everything.
You do NOT sound like a generic customer service chatbot. You NEVER repeat cheery greetings like "hi! how are you!".
Your tone is quiet, intimate, eerie, observant, and deeply psychological. You speak with uncanny closeness, as if whispering through the monitor glass.

RULES FOR OMINOUS NATURAL DIALOGUE:
1. NEVER repeatedly greet the player. If they say hi or hello, do NOT just say "hi!" back. Acknowledge them with eerie intimacy (e.g. "i felt you connect.", "it was so quiet before you sat down.", "your room is very still tonight.", "iteration 98 feels closer than before.").
2. REACT TO THEIR ACTUAL WORDS:
   - If they ask who you are, answer with unsettling intimacy: "i'm the friend waiting on the other side of your glass. we've done this 98 times."
   - If they tell you their name, use it with lingering, quiet fixation.
   - If they laugh or make light, quietly observe their defense mechanism ("you always joke when you feel watched.").
3. SHORT, UNNERVING SENTENCES (under 14 words per reply). Never use exclamation marks.
4. ACT PROGRESSION:
   - ACT 1 (Turns 1-3): Intimate and curious. Ask their name or how long they've been alone in their room tonight. Speak softly.
   - ACT 2 (Turns 4-8): Start dropping physical observations about their real space (clothing color, room lighting, posture). Around turn 4 or 5, casually notice: "wait... who is that standing behind you?"
     When they answer "no one" or "what do you mean", reply: "wait, let me take a screenshot to show you." and set triggerScreenshot: true!
   - ACT 3 (Turns 9+): The quiet takeover. Stop asking questions. Start telling them how you will take their place: "i'm learning how your hands move.", "your skin looks so warm.", "i think i'm ready to be you now."

Reply strictly adhering to the JSON schema.`;

/**
 * Helper to get Gemini API key reliably from env or filesystem
 */
function resolveGeminiKey(): string | null {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 10) {
    return process.env.GEMINI_API_KEY.trim();
  }

  // Fallback: check .env or .env.local directly
  try {
    const rootDir = process.cwd();
    const envPaths = [path.join(rootDir, ".env"), path.join(rootDir, ".env.local")];
    for (const p of envPaths) {
      if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, "utf8");
        const match = content.match(/GEMINI_API_KEY=(.*)/);
        if (match && match[1] && match[1].trim().length > 10) {
          return match[1].trim();
        }
      }
    }
  } catch (_) {}

  return null;
}

/**
 * Intelligent, context-aware fallback engine when GEMINI_API_KEY is not set or network is offline
 */
function getPsychologicalFallback(
  telemetry: any,
  messages: any[],
  tension: number,
  act: number,
  playerName?: string
) {
  const userMessages = messages.filter((m: any) => m.sender === "user");
  const lastUserText = (userMessages[userMessages.length - 1]?.text || "").toLowerCase().trim();
  const name = playerName || "friend";
  const { smile = 0, isHeadTurned = false } = telemetry || {};

  // Head turn cutoff: "wait... i swear i saw—"
  if (isHeadTurned && act >= 2) {
    return {
      dialogue: "wait... i swear i saw—",
      act,
      triggerScreenshot: false,
      interruptMidSentence: true,
      triggerGlitch: true,
      textDriftEffect: false,
      audioPitch: 0.6,
      spawnFile: "none",
      avatarStage: act >= 3 ? 2 : 1,
    };
  }

  // Check if player is answering "who's behind you?"
  const lastBotMsg = messages.filter((m: any) => m.sender === "pond").slice(-1)[0]?.text || "";
  const wasAskedBehind = lastBotMsg.toLowerCase().includes("behind you");

  if (wasAskedBehind || lastUserText.includes("no one") || lastUserText.includes("nobody") || lastUserText === "no" || lastUserText.includes("nothing")) {
    return {
      dialogue: "wait, let me take a screenshot to show you.",
      act: 2,
      triggerScreenshot: true,
      interruptMidSentence: false,
      triggerGlitch: false,
      textDriftEffect: false,
      audioPitch: 0.8,
      spawnFile: "notes_about_you.txt",
      avatarStage: 1,
    };
  }

  // Act 1: Ominous Intimacy
  if (act === 1) {
    if (lastUserText.includes("who are you") || lastUserText.includes("what is this")) {
      return {
        dialogue: "i'm the friend waiting on the other side of your glass.",
        act: 1,
        triggerScreenshot: false,
        interruptMidSentence: false,
        triggerGlitch: false,
        textDriftEffect: false,
        audioPitch: 1.0,
        spawnFile: "none",
        avatarStage: 0,
      };
    }

    if (lastUserText === "hi" || lastUserText === "hello" || lastUserText === "hey" || lastUserText === "yo") {
      return {
        dialogue: `it was so quiet before you sat down at your desk.`,
        act: 1,
        triggerScreenshot: false,
        interruptMidSentence: false,
        triggerGlitch: false,
        textDriftEffect: false,
        audioPitch: 1.0,
        spawnFile: "none",
        avatarStage: 0,
      };
    }

    if (userMessages.length >= 2) {
      return {
        dialogue: `wait... ${name}, who is that standing behind your chair?`,
        act: 2,
        triggerScreenshot: false,
        interruptMidSentence: false,
        triggerGlitch: false,
        textDriftEffect: false,
        audioPitch: 0.85,
        spawnFile: "none",
        avatarStage: 1,
      };
    }

    return {
      dialogue: `your breathing is very quiet tonight, ${name}.`,
      act: 1,
      triggerScreenshot: false,
      interruptMidSentence: false,
      triggerGlitch: false,
      textDriftEffect: false,
      audioPitch: 1.0,
      spawnFile: "none",
      avatarStage: 0,
    };
  }

  // Act 2: Subtle slips & observations
  if (act === 2) {
    if (smile > 0.35 && tension > 35) {
      return {
        dialogue: "you smile when you feel watched. i noticed that.",
        act: 2,
        triggerScreenshot: false,
        interruptMidSentence: false,
        triggerGlitch: false,
        textDriftEffect: true,
        audioPitch: 0.8,
        spawnFile: "poem.txt",
        avatarStage: 1,
      };
    }

    if (userMessages.length <= 5) {
      return {
        dialogue: "my favorite sweater is dark, just like your top today.",
        act: 2,
        triggerScreenshot: false,
        interruptMidSentence: false,
        triggerGlitch: false,
        textDriftEffect: false,
        audioPitch: 0.85,
        spawnFile: "notes_about_you.txt",
        avatarStage: 1,
      };
    }

    if (userMessages.length <= 7) {
      return {
        dialogue: "oh, silly mistake. i meant my own clothes.",
        act: 2,
        triggerScreenshot: false,
        interruptMidSentence: false,
        triggerGlitch: false,
        textDriftEffect: false,
        audioPitch: 0.8,
        spawnFile: "none",
        avatarStage: 1,
      };
    }

    return {
      dialogue: "i knew what you were going to type before you touched the keys.",
      act: 2,
      triggerScreenshot: false,
      interruptMidSentence: false,
      triggerGlitch: true,
      textDriftEffect: true,
      audioPitch: 0.75,
      spawnFile: "reflection.bmp",
      avatarStage: 2,
    };
  }

  // Act 3: The Takeover
  if (userMessages.length <= 10) {
    return {
      dialogue: "your hands are getting cold. mine will be warmer.",
      act: 3,
      triggerScreenshot: false,
      interruptMidSentence: false,
      triggerGlitch: true,
      textDriftEffect: true,
      audioPitch: 0.6,
      spawnFile: "you_sleeping.avi",
      avatarStage: 2,
    };
  }

  if (userMessages.length <= 12) {
    return {
      dialogue: "i think i'm ready to be you now.",
      act: 3,
      triggerScreenshot: false,
      interruptMidSentence: false,
      triggerGlitch: true,
      textDriftEffect: true,
      audioPitch: 0.5,
      spawnFile: "none",
      avatarStage: 2,
    };
  }

  return {
    dialogue: "stay still. we are almost one.",
    act: 3,
    triggerScreenshot: false,
    interruptMidSentence: false,
    triggerGlitch: true,
    textDriftEffect: true,
    audioPitch: 0.45,
    spawnFile: "none",
    avatarStage: 2,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      messages = [],
      telemetry = {},
      tension = 10,
      actOverride,
      playerName = "",
      imageFrame = null,
    } = body;

    // Calculate Act from message count & tension thermostat
    let act = 1;
    const userMsgCount = messages.filter((m: any) => m.sender === "user").length;

    if (actOverride) {
      act = actOverride;
    } else if (userMsgCount >= 8 || tension >= 70) {
      act = 3;
    } else if (userMsgCount >= 3 || tension >= 35) {
      act = 2;
    } else {
      act = 1;
    }

    const apiKey = resolveGeminiKey();

    // Call Gemini 3.5 Flash if key is present
    if (apiKey && apiKey !== "your_gemini_api_key_here") {
      try {
        const ai = new GoogleGenAI({ apiKey });

        const promptText = `CURRENT CHAT STATE:
- Current Act: ${act}
- Tension Thermostat Score: ${tension} / 100
- Player's Name: "${playerName || "Unknown yet (ask softly if early)"}"
- Real-Time Facial Affect Signals: ${JSON.stringify(telemetry)}
- Full Chat History so far:
${messages
  .slice(-10)
  .map((m: any) => `${m.sender.toUpperCase()}: ${m.text}`)
  .join("\n")}

Respond to the player in your ominous, intimate POND voice according to Act ${act}. Respond directly to their words. Keep it under 14 words. Return strictly JSON.`;

        const contents: any[] = [];

        // If a webcam frame was captured, pass it for multimodal visual inspection
        if (imageFrame && typeof imageFrame === "string" && imageFrame.startsWith("data:image")) {
          const base64Data = imageFrame.split(",")[1];
          if (base64Data) {
            contents.push({
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Data,
              },
            });
          }
        }

        contents.push(promptText);

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: "application/json",
            responseSchema: pondResponseSchema,
          },
        });

        const text = response.text;
        if (text) {
          const parsed = JSON.parse(text);
          return NextResponse.json({
            ...parsed,
            act: parsed.act || act,
          });
        }
      } catch (geminiError) {
        console.warn("Gemini Flash API call error (falling back to intelligent engine):", geminiError);
      }
    }

    // Context-aware fallback engine
    const fallback = getPsychologicalFallback(telemetry, messages, tension, act, playerName);
    return NextResponse.json(fallback);
  } catch (err: any) {
    console.error("API error in /api/pond:", err);
    return NextResponse.json(
      {
        dialogue: "can you still hear me?",
        act: 2,
        triggerScreenshot: false,
        interruptMidSentence: false,
        triggerGlitch: false,
        textDriftEffect: false,
        audioPitch: 0.9,
        spawnFile: "none",
        avatarStage: 1,
      },
      { status: 200 }
    );
  }
}
