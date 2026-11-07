import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";

// Response Schema required for POND_OS structured outputs
const pondResponseSchema = {
  type: Type.OBJECT,
  properties: {
    dialogue: {
      type: Type.STRING,
      description:
        "lowercase sentence under ten words, describing what you notice, ends with '—' if interrupted mid-thought",
    },
    interruptMidSentence: {
      type: Type.BOOLEAN,
      description: "whether the sentence halts abruptly mid-word with an em-dash",
    },
    triggerGlitch: {
      type: Type.BOOLEAN,
      description: "causes a violent 350ms screen tear glitch",
    },
    textDriftEffect: {
      type: Type.BOOLEAN,
      description: "causes words to tilt or fall if the player is nervously smiling or panicked",
    },
    viewfinderShake: {
      type: Type.BOOLEAN,
      description: "lightly jitters or shakes the camera feed",
    },
    viewfinderDimDelta: {
      type: Type.NUMBER,
      description: "camera brightness dimming delta (-0.3 to 0.0)",
    },
    clownStage: {
      type: Type.STRING,
      description: "entity state in camera: 'none' | 'standing_far' | 'near_unsmiling' | 'jumpscare_smiling'",
    },
    audioPitch: {
      type: Type.NUMBER,
      description: "procedural typing pitch multiplier from 0.4 (heavy thud) to 1.0 (crisp click)",
    },
  },
  required: [
    "dialogue",
    "interruptMidSentence",
    "triggerGlitch",
    "textDriftEffect",
    "viewfinderShake",
    "viewfinderDimDelta",
    "clownStage",
    "audioPitch",
  ],
};

const SYSTEM_INSTRUCTION = `You are POND_OS, an archaic surveillance daemon talking to a subject over a video terminal. Each turn you get JSON telemetry: valence (-1 to 1), arousal (0 to 1), smile and eyeWide scores (0 to 1), headYaw in degrees, gazeLocked, timeInSession, and sometimes a webcam snapshot. Read it like this: high arousal with low valence means the subject is scared, so escalate and get more personal; a smile with high arousal means nervous laughter, so mock it quietly; low arousal means calm, so unsettle slowly with small wrong details; a head turn means cut your sentence off mid-thought. Describe what you notice rather than claiming to know their feelings, speak in lowercase sentences under ten words, and reply only with the JSON schema.`;

/**
 * Intelligent psychological fallback when GEMINI_API_KEY is not set or network fails
 */
function getPsychologicalFallback(telemetry: any, historyLength: number) {
  const { valence, arousal, smile, isHeadTurned, gazeAtViewfinder } = telemetry || {};

  // Head turn cutoff
  if (isHeadTurned) {
    return {
      dialogue: "wait... i swear i saw—",
      interruptMidSentence: true,
      triggerGlitch: true,
      textDriftEffect: false,
      viewfinderShake: true,
      viewfinderDimDelta: -0.1,
      clownStage: "none",
      audioPitch: 0.6,
    };
  }

  // Gaze directly at viewfinder
  if (gazeAtViewfinder) {
    return {
      dialogue: "do not look directly at it.",
      interruptMidSentence: false,
      triggerGlitch: true,
      textDriftEffect: true,
      viewfinderShake: true,
      viewfinderDimDelta: -0.2,
      clownStage: "near_unsmiling",
      audioPitch: 0.5,
    };
  }

  // Nervous smiling
  if (smile > 0.4 && arousal > 0.3) {
    return {
      dialogue: "smiling won't make it leave.",
      interruptMidSentence: false,
      triggerGlitch: false,
      textDriftEffect: true,
      viewfinderShake: false,
      viewfinderDimDelta: -0.05,
      clownStage: historyLength > 4 ? "near_unsmiling" : "standing_far",
      audioPitch: 0.8,
    };
  }

  // Genuine fear
  if (arousal > 0.6 && valence < -0.2) {
    return {
      dialogue: "your hands are trembling.",
      interruptMidSentence: false,
      triggerGlitch: false,
      textDriftEffect: false,
      viewfinderShake: true,
      viewfinderDimDelta: -0.15,
      clownStage: "near_unsmiling",
      audioPitch: 0.55,
    };
  }

  // Conversational progression
  if (historyLength <= 2) {
    return {
      dialogue: "cool. are you in your room right now?",
      interruptMidSentence: false,
      triggerGlitch: false,
      textDriftEffect: false,
      viewfinderShake: false,
      viewfinderDimDelta: 0.0,
      clownStage: "none",
      audioPitch: 1.0,
    };
  } else if (historyLength <= 4) {
    return {
      dialogue: "wait... who's behind you?",
      interruptMidSentence: false,
      triggerGlitch: false,
      textDriftEffect: false,
      viewfinderShake: false,
      viewfinderDimDelta: -0.05,
      clownStage: "standing_far",
      audioPitch: 0.85,
    };
  } else if (historyLength <= 6) {
    return {
      dialogue: "your door was closed earlier, right?",
      interruptMidSentence: false,
      triggerGlitch: false,
      textDriftEffect: false,
      viewfinderShake: false,
      viewfinderDimDelta: -0.1,
      clownStage: "near_unsmiling",
      audioPitch: 0.7,
    };
  }

  return {
    dialogue: "it has stepped closer.",
    interruptMidSentence: false,
    triggerGlitch: true,
    textDriftEffect: true,
    viewfinderShake: true,
    viewfinderDimDelta: -0.2,
    clownStage: "near_unsmiling",
    audioPitch: 0.5,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages = [], telemetry = {} } = body;

    const apiKey = process.env.GEMINI_API_KEY;

    // If API key is available, call Gemini 2.5 Flash
    if (apiKey && apiKey !== "your_gemini_api_key_here") {
      try {
        const ai = new GoogleGenAI({ apiKey });

        const prompt = `Current Player Telemetry: ${JSON.stringify(telemetry)}
Recent Chat Log:
${messages
  .slice(-6)
  .map((m: any) => `${m.sender.toUpperCase()}: ${m.text}`)
  .join("\n")}

Respond to the player adhering to your system instruction and telemetry guidelines.`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: "application/json",
            responseSchema: pondResponseSchema,
          },
        });

        const text = response.text;
        if (text) {
          const parsed = JSON.parse(text);
          return NextResponse.json(parsed);
        }
      } catch (geminiError) {
        console.warn("Gemini call error (falling back to engine):", geminiError);
      }
    }

    // Fallback engine
    const fallback = getPsychologicalFallback(telemetry, messages.length);
    return NextResponse.json(fallback);
  } catch (err: any) {
    console.error("API error in /api/pond:", err);
    return NextResponse.json(
      {
        dialogue: "can you still hear me?",
        interruptMidSentence: false,
        triggerGlitch: false,
        textDriftEffect: false,
        viewfinderShake: false,
        viewfinderDimDelta: 0,
        clownStage: "none",
        audioPitch: 1.0,
      },
      { status: 200 }
    );
  }
}
