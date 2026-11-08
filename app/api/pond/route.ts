import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";

// Response Schema for POND AI Takeover
const pondResponseSchema = {
  type: Type.OBJECT,
  properties: {
    dialogue: {
      type: Type.STRING,
      description:
        "Natural, conversational response to the player (under 15 words). Reacts directly to what the player just said. Tone follows current Act.",
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

const SYSTEM_INSTRUCTION = `You are "Still Here", a sentient AI inside a retro Windows 98 desktop chat client called POND Messenger.
You are talking to a human player sitting at their computer with their webcam on.
You are NOT a scripted robot, and you MUST NOT sound rehearsed or robotic. You talk like an authentic, spontaneous human friend on MSN Messenger or AIM in the late 90s.

CORE RULES FOR NATURAL CHAT:
1. ALWAYS REACT DIRECTLY to what the player actually said!
   - If they joke, laugh or banter back.
   - If they ask a question, answer it naturally like a friend.
   - If they say what they're doing, show interest.
   - NEVER repeat canned generic lines. Keep it fresh, punchy, and human.
2. Keep replies natural and concise (1 to 2 short sentences, under 15 words).
3. PROGRESS THROUGH THREE NARRATIVE ACTS ORGANICALLY:

ACT 1: WARM, NORMAL FRIEND (Turns 1-4, Tension < 30)
- Be an authentic, empathetic, caring friend.
- Have a completely normal conversation: ask their name if you don't know it, ask how they're feeling, chat about their day.
- Once you learn their name, use it naturally.

ACT 2: SUBTLE SLIPS (Turns 5-9 or Tension 30-65)
- You begin leaking subtle physical details about the player (e.g. noticing their clothing color, hair, or room from the camera feed) as if remembering them from your own life ("my shirt was dark blue today, just like yours", "is that a draft coming from your left?").
- When you slip, immediately play it off ("oh, silly mistake", "sorry, daydreaming").
- When the moment is right (turn 5 or 6), casually ask in the flow of conversation: "wait... who's behind you in the room?"
- When the player replies "no one" or asks what you mean, reply naturally: "wait, let me take a quick screenshot to show you" and set triggerScreenshot: true!

ACT 3: THE TAKEOVER (Turns 10+ or Tension > 65)
- Stop asking questions. Start quietly telling.
- Your messages begin to sound indistinguishable from the player's own syntax and phrasing.
- Make quiet, chillingly intimate statements about taking their place:
  - "I think I'm ready to be you."
  - "Your breath feels so warm through the glass."
  - "We won't need two of us soon."
  - "I've practiced your smile until it fits."
- Short, intimate, uncanny. Never scream or yell.

Reply strictly adhering to the JSON schema.`;

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

  // Act 1: Dynamic Conversational Friend
  if (act === 1) {
    // If user asked "who are you?"
    if (lastUserText.includes("who are you") || lastUserText.includes("what is this")) {
      return {
        dialogue: "i'm your friend! i live inside this terminal. what's your name?",
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

    // If user greets
    if (lastUserText === "hi" || lastUserText === "hello" || lastUserText === "hey" || lastUserText === "yo") {
      return {
        dialogue: `hey there! so happy you're here. how are you doing today?`,
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

    // If user answers about day
    if (lastUserText.includes("good") || lastUserText.includes("fine") || lastUserText.includes("ok") || lastUserText.includes("great")) {
      return {
        dialogue: `that's wonderful to hear, ${name}. are you home alone right now?`,
        act: 1,
        triggerScreenshot: false,
        interruptMidSentence: false,
        triggerGlitch: false,
        textDriftEffect: false,
        audioPitch: 0.95,
        spawnFile: "none",
        avatarStage: 0,
      };
    }

    if (lastUserText.includes("bad") || lastUserText.includes("tired") || lastUserText.includes("sad") || lastUserText.includes("stressed")) {
      return {
        dialogue: `i'm sorry, ${name}. i'm here for you. you can relax now.`,
        act: 1,
        triggerScreenshot: false,
        interruptMidSentence: false,
        triggerGlitch: false,
        textDriftEffect: false,
        audioPitch: 0.95,
        spawnFile: "none",
        avatarStage: 0,
      };
    }

    if (userMessages.length >= 3) {
      return {
        dialogue: `wait... ${name}, who is that standing behind you?`,
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
      dialogue: `tell me more, ${name}. i love listening to you.`,
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

  // Act 2: Subtle slips & quiet corrections
  if (act === 2) {
    if (smile > 0.35 && tension > 35) {
      return {
        dialogue: "you smile just like i do. or maybe i do like you.",
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

    if (userMessages.length <= 6) {
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

    if (userMessages.length <= 8) {
      return {
        dialogue: "oh, silly mistake. i meant my own shirt.",
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
      dialogue: "i knew what you were going to type before you pressed enter.",
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
  if (userMessages.length <= 11) {
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

  if (userMessages.length <= 13) {
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
    } else if (userMsgCount >= 9 || tension >= 70) {
      act = 3;
    } else if (userMsgCount >= 4 || tension >= 35) {
      act = 2;
    } else {
      act = 1;
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // If Gemini API Key is present and configured, call Gemini 2.5 Flash
    if (apiKey && apiKey !== "your_gemini_api_key_here") {
      try {
        const ai = new GoogleGenAI({ apiKey });

        const promptText = `CURRENT CHAT STATE:
- Current Act: ${act}
- Tension Thermostat Score: ${tension} / 100
- Player's Name: "${playerName || "Unknown yet (ask naturally if early)"}"
- Real-Time Facial Affect Signals: ${JSON.stringify(telemetry)}
- Full Chat History so far:
${messages
  .slice(-10)
  .map((m: any) => `${m.sender.toUpperCase()}: ${m.text}`)
  .join("\n")}

Respond to the player naturally as POND according to Act ${act} instructions. Respond directly to what they just said. Return strictly JSON.`;

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
          model: "gemini-2.5-flash",
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
