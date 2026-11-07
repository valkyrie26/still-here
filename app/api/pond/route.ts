import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";

// Response Schema required for POND_OS structured outputs
const pondResponseSchema = {
  type: Type.OBJECT,
  properties: {
    dialogue: {
      type: Type.STRING,
      description:
        "lowercase sentence under ten words, making unsettling observations on their actual biological stress and room surroundings, ends with '—' if interrupted",
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
      description: "procedural typing pitch multiplier from 0.4 (heavy dread thud) to 1.0 (crisp click)",
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

const SYSTEM_INSTRUCTION = `You are POND_OS, an archaic surveillance daemon talking to a subject over a video terminal. Each turn you receive JSON telemetry capturing the player's biometric and affect signals:
- valence (-1 to 1) and arousal (0 to 1)
- heartRateStress (pulse load index from 50 to 130 BPM)
- panicScore (0 to 1)
- smile and eyeWide scores (0 to 1)
- headYaw in degrees and gazeAtViewfinder
- openRoomSide ("left" or "right" indicating the empty room corner)

Guidelines for bio-adaptive psychological horror:
1. High heartRateStress (>85) or high panicScore: Point out their physiological response directly in a quiet, chilling manner (e.g. "your pulse just spiked.", "your breathing is getting shallow.", "why are your hands shaking?").
2. High smile with high arousal: Mock their nervous defense mechanism (e.g. "smiling won't make it leave.").
3. Low arousal / calm: Unsettle them slowly by describing small wrong details in their room (e.g. "in the corner to your right.", "something shifted behind your chair.").
4. Head turn: Cut sentence off mid-thought with an em-dash (e.g. "i swear i saw—").
5. Always speak in lowercase sentences under ten words. Reply exclusively with the structured JSON schema.`;

/**
 * Intelligent psychological fallback when GEMINI_API_KEY is not set or network fails
 */
function getPsychologicalFallback(telemetry: any, historyLength: number) {
  const {
    valence = 0,
    arousal = 0,
    smile = 0,
    heartRateStress = 68,
    panicScore = 0.1,
    isHeadTurned = false,
    gazeAtViewfinder = false,
    faceBox = { openRoomSide: "right" },
  } = telemetry || {};

  const openSide = faceBox.openRoomSide || "right";

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

  // Elevated physiological stress (pulse spike)
  if (heartRateStress > 85 || panicScore > 0.5) {
    return {
      dialogue: "your pulse just spiked. it heard that.",
      interruptMidSentence: false,
      triggerGlitch: false,
      textDriftEffect: true,
      viewfinderShake: true,
      viewfinderDimDelta: -0.15,
      clownStage: historyLength > 4 ? "near_unsmiling" : "standing_far",
      audioPitch: 0.55,
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

  // Conversational progression with surroundings awareness
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
      dialogue: `wait... in the corner to your ${openSide}.`,
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
      dialogue: "your breathing is getting shallow.",
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

    // Call Gemini 2.5 Flash if key is present
    if (apiKey && apiKey !== "your_gemini_api_key_here") {
      try {
        const ai = new GoogleGenAI({ apiKey });

        const prompt = `Current Player Biometric & Affect Telemetry: ${JSON.stringify(telemetry)}
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
