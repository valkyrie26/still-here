# STILL HERE (`POND_OS v3.1`) — Hackathon Project Blueprint & Antigravity Agent Guide

## 1. Core Vision & Premise
**STILL HERE** is a 90-to-120-second interactive psychological thriller disguised as an archaic green-and-black video call terminal (`POND_OS`). Instead of relying on cheap 3D monsters, the game weaponizes the player's own real-world room, their webcam viewfinder, and involuntary human curiosity.

While the player chats with the terminal, the AI narrator (`POND_OS`) types responses accompanied by a mechanical vintage typing sound. As the conversation progresses, the system slowly builds paranoia—observing the player's facial micro-expressions, darkening or shaking their camera viewfinder, spawning a shadowy figure peeking behind their shoulder in their own video feed, and setting psychological gaze traps.

---

## 2. Signature Gameplay Mechanics (Core Design)

### A. The Vintage Green-and-Black Video Call UI
* **Visual Palette:** Deep void black (`#050805`) paired with classic P31 phosphor green (`#20c20e`) and CRT scanlines.
* **The Self-Viewfinder:** The player's live webcam feed is visible on screen, styled with a monochrome green surveillance filter. 
* **Dynamic Viewfinder Manipulation:** As paranoia escalates, the game programmatically darkens the player's camera feed, applies micro-shakes (camera instability), and blends a dark silhouette peeking into the background behind their real-world shoulder.
* **Subtle Duck Motif (Prize Track Alignment):** The terminal runs under the header `POND_OS // BLUE_DUCK_DAEMON` with a tiny pixelated duck status indicator (`DUCK_REC [●]`) in the corner of the viewfinder—qualifying for the *Untitled Duck Game* track without breaking the serious psychological thriller atmosphere.

### B. The "Who's Behind You?" Gaze-Lock Trap
1. **Active Reading Verification:** The trap only arms when MediaPipe confirms the player is actively looking at the screen and reading (`gazeLocked === true`).
2. **The Bait:** The narrator casually types out:
   > `who's behind you?`
3. **The Confusion Branch:** When the player looks confused or squints at the viewfinder (`browDown` / low valence), the narrator doubles down:
   > `in the corner. i saw someone standing there.`
4. **The Head-Turn Cutoff ("I swear I saw—"):** The moment the player gives in to curiosity and turns their head to check behind their shoulder (`|headYaw| > 18°`) or glances at the shadow in their viewfinder:
   * The narrator begins typing: `i swear i saw—`
   * **Instant Mid-Sentence Cutoff:** The text halts abruptly with an em-dash.
   * **Visual & Audio Spike:** The typing sound cuts to dead silence, the screen violently glitches, and the shadow in the viewfinder freezes in place.
   * **The Creep Escalation:** The next time the player looks back at the main text, the shadow in their viewfinder jumps closer to their chair.

### C. Bio-Adaptive Horror & Paranoia Scaling
* **Real-Time Affect Computation:** Every turn computes `valence` (`-1` to `1`) and `arousal` (`0` to `1`) from MediaPipe facial blendshapes, alongside `smile`, `eyeWide`, `headYaw`, and `gazeLocked`.
* **Nervous Laughter vs. Fear:**
  * **If the player laughs or smiles nervously** (`smile > 0.4` + high `arousal`): The narrator quietly mocks their defense mechanism (*"smiling won't make it leave."*), and the UI text begins drifting or falling off its baseline.
  * **If the player looks genuinely scared** (high `arousal` + low `valence` + wide eyes): The narrator gets more personal and invasive, the viewfinder dims further, and the frame lightly shakes.
  * **If the player is calm** (low `arousal`): The narrator unsettles them slowly by pointing out small, wrong details.

### D. Pitch-Shifting Vintage Typing Audio & Voice Call-Outs
* **Mechanical Teletype Sound:** Every character typed by Gemini triggers a crisp vintage mechanical keystroke synthesized via the Web Audio API.
* **Dynamic Pitch Decay:** As paranoia rises, the typing sound's pitch and filter frequency drop dynamically (`audioPitchMultiplier` shifting from `1.0` down to `0.5`), transforming crisp typewriter clicks into slow, heavy, dread-inducing industrial thuds.
* **The Name Hook:** During the initial calibration, the terminal asks for the player's name (via mic or text) and uses it in text—and optionally whispers it through the computer's speakers via Web Speech API—at peak tension.

---

## 3. The 90-Second Hackathon Demo Arc

| Phase | Time | What Happens on Screen |
| :--- | :--- | :--- |
| **1. Calibration** | `0:00 – 0:20` | Terminal connects. Player enters/speaks their name. Crisp typing audio, normal conversational tone, clean green viewfinder. |
| **2. Slow Paranoia** | `0:20 – 0:45` | Conversational chatbot mode. Subtle observations. Viewfinder brightness dips slightly; typing pitch drops a fraction. |
| **3. The Gaze Trap** | `0:45 – 1:15` | While the judge is actively reading, `POND_OS` asks *"who's behind you?"* Shadow silhouette fades into the corner of their camera feed. Judge looks confused or turns head → *"i swear i saw—"* cutoff + glitch + shadow creeps closer. |
| **4. Climax & Cut** | `1:15 – 1:35` | Text starts falling/drifting; viewfinder shakes; shadow is right behind the player's shoulder. Sudden white frame flash → blackout: `SIGNAL LOST. STILL HERE.` |

---

## 4. Technical Stack & Core Specifications

* **Framework:** Next.js (App Router, TypeScript, Tailwind CSS) — zero-config deployment to **Vercel**.
* **Computer Vision:** `@mediapipe/tasks-vision` (`FaceLandmarker` running client-side via WASM at 30+ FPS).
* **AI Engine:** `@google/genai` SDK calling `gemini-2.5-flash` with Structured Outputs (`responseSchema`).
* **Audio Engine:** Native browser `AudioContext` (procedural noise/triangle keystroke synthesizer with real-time `playbackRate` / bandpass frequency modulation) + optional `window.speechSynthesis` whisper.

### Exact Gemini System Prompt
```text
You are POND_OS, an archaic surveillance daemon talking to a subject over a video terminal. Each turn you get JSON telemetry: valence (-1 to 1), arousal (0 to 1), smile and eyeWide scores (0 to 1), headYaw in degrees, gazeLocked, timeInSession, and sometimes a webcam snapshot. Read it like this: high arousal with low valence means the subject is scared, so escalate and get more personal; a smile with high arousal means nervous laughter, so mock it quietly; low arousal means calm, so unsettle slowly with small wrong details; a head turn means cut your sentence off mid-thought. Describe what you notice rather than claiming to know their feelings, speak in lowercase sentences under ten words, and reply only with the JSON schema.
```

### Structured Output Schema (`pondSchema`)
```json
{
  "dialogue": "string (lowercase, <10 words, ends with '—' if cut off)",
  "interruptMidSentence": "boolean",
  "triggerGlitch": "boolean",
  "textDriftEffect": "boolean (causes letters/lines to tilt or fall)",
  "viewfinderShake": "boolean (lightly shakes the camera feed)",
  "viewfinderDimDelta": "number (-0.3 to 0.0)",
  "shadowStage": "number (0 = hidden, 1 = far corner, 2 = closer, 3 = right behind shoulder)",
  "audioPitch": "number (0.4 to 1.1)"
}
```
