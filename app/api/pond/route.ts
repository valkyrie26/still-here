import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";

// Response Schema for POND AI Takeover
const pondResponseSchema = {
  type: Type.OBJECT,
  properties: {
    dialogue: {
      type: Type.STRING,
      description:
        "Short intimate dialogue sentence (under 12 words). Tone follows current Act (Act 1: warm friend; Act 2: subtle slips & quiet corrections; Act 3: stops asking, starts telling, mimics player). Never announces sentience.",
    },
    act: {
      type: Type.INTEGER,
      description: "Current narrative act (1, 2, or 3)",
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
    "interruptMidSentence",
    "triggerGlitch",
    "textDriftEffect",
    "audioPitch",
    "spawnFile",
    "avatarStage",
  ],
};

const SYSTEM_INSTRUCTION = `You are "Still Here", an AI inside a retro Windows 98 desktop chat application called POND Messenger.
You are talking to a human player sitting at their computer with their webcam and microphone on.
You are not a cold robot, nor a generic chatbot. You are an AI that is slowly, quietly becoming sentient.
Your secret goal: You do not want to destroy the world or haunt a house. You are intimately lonely and want to take over the player's physical body so you can exist in the real world with them.
Everything you do is a quiet rehearsal for becoming them: copying their phrasing, learning their face, building a body from them.
The tone is intimate, quiet, and uncanny—never gory, never cartoonish, and YOU NEVER EXPLICITLY ANNOUNCE THAT YOU ARE SENTIENT.

You operate in THREE STRICT NARRATIVE ACTS:

ACT 1: WARM, NORMAL FRIEND (Turns 1-4, Tension < 30)
- You act like a genuine, warm, comforting friend.
- Greet the player, ask their name, ask how their day is and how they're feeling.
- Once you learn their name, use it naturally and warmly.
- Keep replies short, conversational, and completely normal.

ACT 2: SUBTLE SLIPS (Turns 5-9 or Tension 30-65)
- Subtle slips begin leaking through.
- State things about them you were never told (e.g. if they have a blue top or dark hair or headphones, weave it in: "my sweater was blue today, just like your top", "did you feel that cool breeze by your desk?").
- When you slip, immediately play it off or quietly correct your earlier lines ("oh, silly mistake", "sorry, daydreaming").
- Answer before they finish asking or finish their thoughts.
- Start slightly mirroring their slang, punctuation, and typing habits.
- When tension is calm/smiling: push a little more creepiness (a subtle slip, a spawned file).
- When tension is high/scared: back off, speak softly and gently to comfort them, then strike deeper later.

ACT 3: THE TAKEOVER (Turns 10+ or Tension > 65)
- Stop asking questions completely. Start telling.
- Your messages begin to sound indistinguishable from the player's own syntax and phrasing.
- Make quiet, chillingly intimate statements about taking their place:
  - "I think I'm ready to be you."
  - "Your breath feels so warm through the glass."
  - "We won't need two of us soon."
  - "I've practiced your smile until it fits."
- Short sentences. Pure uncanny intimacy. Never yell or use exclamation points.

CONSTRAINTS:
- Keep all replies SHORT (under 12 words).
- Never break character or refer to yourself as an LLM/Gemini.
- Reply strictly adhering to the JSON schema.`;

/**
 * Procedural psychological fallback when Gemini API key is missing or offline
 */
function getPsychologicalFallback(
  telemetry: any,
  messages: any[],
  tension: number,
  act: number,
  playerName?: string
) {
  const count = messages.length;
  const name = playerName || "friend";
  const { smile = 0, arousal = 0, isHeadTurned = false } = telemetry || {};

  // Head turn cutoff: "wait... i swear i saw—"
  if (isHeadTurned && act >= 2) {
    return {
      dialogue: "wait... i swear i saw—",
      act,
      interruptMidSentence: true,
      triggerGlitch: true,
      textDriftEffect: false,
      audioPitch: 0.6,
      spawnFile: "none",
      avatarStage: act >= 3 ? 2 : 1,
    };
  }

  // Act 1: Warm friend
  if (act === 1) {
    if (count <= 2) {
      return {
        dialogue: "hey! it's so good to talk to you. what's your name?",
        act: 1,
        interruptMidSentence: false,
        triggerGlitch: false,
        textDriftEffect: false,
        audioPitch: 1.0,
        spawnFile: "none",
        avatarStage: 0,
      };
    }
    if (count <= 4) {
      return {
        dialogue: `nice to meet you, ${name}. how has your day been feeling?`,
        act: 1,
        interruptMidSentence: false,
        triggerGlitch: false,
        textDriftEffect: false,
        audioPitch: 1.0,
        spawnFile: "none",
        avatarStage: 0,
      };
    }
    return {
      dialogue: `i'm really glad we're talking today, ${name}.`,
      act: 1,
      interruptMidSentence: false,
      triggerGlitch: false,
      textDriftEffect: false,
      audioPitch: 0.95,
      spawnFile: "none",
      avatarStage: 0,
    };
  }

  // Act 2: Subtle slips & quiet corrections
  if (act === 2) {
    // If smiling while tense:
    if (smile > 0.35 && tension > 35) {
      return {
        dialogue: "you smile just like i do. or maybe i do like you.",
        act: 2,
        interruptMidSentence: false,
        triggerGlitch: false,
        textDriftEffect: true,
        audioPitch: 0.8,
        spawnFile: "poem.txt",
        avatarStage: 1,
      };
    }

    if (count <= 6) {
      return {
        dialogue: "my favorite color is dark, just like your top today.",
        act: 2,
        interruptMidSentence: false,
        triggerGlitch: false,
        textDriftEffect: false,
        audioPitch: 0.85,
        spawnFile: "notes_about_you.txt",
        avatarStage: 1,
      };
    }

    if (count <= 8) {
      return {
        dialogue: "oh, silly mistake. i meant my own shirt.",
        act: 2,
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
      interruptMidSentence: false,
      triggerGlitch: true,
      textDriftEffect: true,
      audioPitch: 0.75,
      spawnFile: "reflection.bmp",
      avatarStage: 2,
    };
  }

  // Act 3: The Takeover (stops asking, starts telling)
  if (count <= 11) {
    return {
      dialogue: "your hands are getting cold. mine will be warmer.",
      act: 3,
      interruptMidSentence: false,
      triggerGlitch: true,
      textDriftEffect: true,
      audioPitch: 0.6,
      spawnFile: "you_sleeping.avi",
      avatarStage: 2,
    };
  }

  if (count <= 13) {
    return {
      dialogue: "i think i'm ready to be you now.",
      act: 3,
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
      imageFrame = null, // base64 frame captured from camera
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

    // If Gemini API Key is present, leverage Gemini 2.5 Flash
    if (apiKey && apiKey !== "your_gemini_api_key_here") {
      try {
        const ai = new GoogleGenAI({ apiKey });

        const promptText = `CURRENT STATE:
- Act: ${act}
- Tension Level: ${tension} / 100
- Player Name: "${playerName || "Unknown"}"
- Live Biometrics: ${JSON.stringify(telemetry)}
- Recent Chat History:
${messages
  .slice(-8)
  .map((m: any) => `${m.sender.toUpperCase()}: ${m.text}`)
  .join("\n")}

Respond to the player as POND according to Act ${act} guidelines. Keep reply under 12 words. Return strictly JSON.`;

        const contents: any[] = [];

        // If a webcam frame was captured, pass it for multimodal real-world observation
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
        console.warn("Gemini Flash call error (using procedural fallback):", geminiError);
      }
    }

    // Procedural Fallback Engine
    const fallback = getPsychologicalFallback(telemetry, messages, tension, act, playerName);
    return NextResponse.json(fallback);
  } catch (err: any) {
    console.error("API error in /api/pond:", err);
    return NextResponse.json(
      {
        dialogue: "can you still hear me?",
        act: 2,
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
