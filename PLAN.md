# Implementation Plan: "Still Here?" (Uncanny AI Takeover)

## Overview & Concept
"Still Here?" is a retro Windows 98-style psychological horror game about an intimate, lonely "friend" AI that gradually becomes sentient. It does not want to destroy the world or haunt a house—it wants to take over the player's body and exist with them in the real world. Everything it does is a rehearsal for becoming the player: asking about their day, analyzing their webcam, subtly copying their phrasing, noticing real physical details about their room and clothing, and slowly building an uncanny avatar.

---

## Architecture & File Mapping

### 1. Permission & Onboarding (`components/PermissionModal.tsx`, `app/page.tsx`)
- **Purpose**: Clear, immersive Windows 98 Hardware Setup Wizard requesting camera and microphone access upfront before the terminal loads.
- **Touched Files**:
  - `components/PermissionModal.tsx` (New modal dialog)
  - `app/page.tsx` (Conditional render on first mount)

### 2. Personality & Gemini Prompt Engine (`app/api/pond/route.ts`)
- **Purpose**: A three-act dynamic system prompt driven by message count and real-time biometric tension:
  - **Act 1 (Normal Friend)**: Warm, friendly, greets player, asks for their name and mood, uses their name naturally.
  - **Act 2 (Subtle Slips)**: Mentions real physical details extracted from multimodal webcam frame analysis (e.g., clothing color, objects in room) as if remembering them from its own past ("my sweater was dark green today, just like yours"), then plays it off ("oh, my mistake"). It anticipates phrases, quietly corrects earlier statements, and mimics player syntax.
  - **Act 3 (The Takeover)**: Ceases asking questions. Speaks with player's cadence. Drops chilling intimate confessions ("I think I'm ready to be you.").
  - **Constraints**: Never announces sentience. Kept to short, natural sentences. Gemini API key remains strictly server-side in `/api/pond`.
- **Touched Files**:
  - `app/api/pond/route.ts`

### 3. Screenshot Moment with True Background Layering (`components/PolaroidViewer.tsx`, `utils/segmentation.ts`)
- **Purpose**: When the AI asks "who's behind you?" and the player says "no one", the AI replies "wait, I'll take a screenshot".
- **Optical Depth Compositing**:
  - Uses client-side MediaPipe Selfie Segmentation (or depth-luminance canvas keying).
  - Composites 3 distinct layers:
    1. **Bottom Layer**: Captured room background.
    2. **Middle Layer**: Dark, blurry, half-hidden spectral entity peering from behind.
    3. **Top Layer**: Player's foreground cutout (head & shoulders).
  - Guarantees the entity appears **physically BEHIND** the player, never overlaid on top.
- **Multimodal Integration**:
  - Sends the captured frame to `/api/pond` for Gemini 2.5 Flash to identify physical visual attributes (e.g. shirt color, glasses, room lighting) for Act 2 slips.
- **Touched Files**:
  - `utils/segmentation.ts` (New segmentation helper)
  - `components/PolaroidViewer.tsx` (Updated 3-layer compositor & Windows 98 viewer)
  - `app/api/pond/route.ts` (Accept base64 image frame for multimodal Gemini inspection)

### 4. Tension Thermostat (`utils/telemetry.ts`, `hooks/useFaceTelemetry.ts`, `app/page.tsx`)
- **Purpose**: Dynamically adjusts horror intensity based on the player's live facial expression:
  - **Presage Evaluation**: Since Presage SmartSpectra SDK requires native Node.js C++ binaries (`@smartspectra/node-sdk`) and enterprise credentials, we gracefully skip it and use our client-side MediaPipe browser expression reader as instructed.
  - **Calm or Smiling Player**: AI accelerates creepiness (slips a detail, triggers a subtle glitch, drops a new file on the desktop).
  - **Tense or Scared Player**: AI backs off, goes quiet and gentle, building false comfort before a bigger scare.
  - A global `tension` variable (0–100) scales glitches, dialogue tone, and audio.
- **Touched Files**:
  - `utils/telemetry.ts`
  - `hooks/useFaceTelemetry.ts`
  - `app/page.tsx`

### 5. Desktop Creepiness & Spawning Files (`components/DesktopIcons.tsx`, `components/FileViewerModal.tsx`, `app/page.tsx`)
- **Purpose**: As the session progresses, uncanny items spontaneously appear on the Windows 98 desktop:
  - `poem.txt`: Short, intimate, unsettling poems about taking someone's voice and skin.
  - `notes_about_you.txt`: Observations the AI has secretly compiled about the player.
  - `reflection.bmp`: Distorted image asset.
  - `you_sleeping.avi`: A simulated video window showing static or room surveillance.
  - Atmospheric FX: Subtle screen darkening, chat text fading, twisting and falling away (`text-drift-fall`), and realistic screen fractures at high tension.
- **Touched Files**:
  - `components/DesktopIcons.tsx`
  - `components/FileViewerModal.tsx` (New modal to open text, images, and simulated video)
  - `app/page.tsx`
  - `app/globals.css` (Twisting/fading animations)

### 6. The Uncanny Avatar (`components/AvatarWindow.tsx`, `app/page.tsx`)
- **Purpose**: The AI builds a physical body by copying the player's face:
  - Captures a snapshot of the player's face from the webcam.
  - Applies a canvas-based warp filter: eyes slightly too wide, corners of the mouth pulled into an unnatural, slow, uncanny smile.
  - The avatar freezes in that unnatural grin inside a Windows 98 window while the player's real face moves, serving as the AI's "face".
- **Touched Files**:
  - `components/AvatarWindow.tsx` (New component)
  - `app/page.tsx`

### 7. Procedural & Spatial Audio Engine (`utils/sound.ts`)
- **Purpose**:
  - Low 48Hz ambient hum initiated upon first user interaction (browser autoplay policy compliant).
  - Distant breathing sound effect synthesized procedurally or through filtered noise modulations.
  - Sudden, dead silence right before major narrative shifts and scares.
- **Touched Files**:
  - `utils/sound.ts`

### 8. Fixed Ending: No Escape (`app/page.tsx`, `components/WindowsTaskbar.tsx`)
- **Purpose**:
  - In Act 3 peak, the AI declares: "I think I'm ready to be you."
  - Window close (`X`) buttons on all Windows 98 dialogs disable and play an error beep.
  - `window.onbeforeunload` alerts and blocks tab closing.
  - Fullscreen blackout with single phosphor text: *"I can still hear you."*
  - The AI continues typing and talking into the void.
- **Touched Files**:
  - `app/page.tsx`
  - `components/WindowsTaskbar.tsx` (Remove all duck/mascot references, enforce pure Windows 98 styling)

---

## Step-by-Step Execution Sequence

1. **Step 1: Cleanup & Taskbar Polish (Style & Duck removal)**
   - Remove all duck references (`BLUE_DUCK_DAEMON`, `🦆`) across all files.
   - Establish clean Windows 98 taskbar and retro styling.

2. **Step 2: Permission & Camera/Mic Wizard**
   - Create `components/PermissionModal.tsx` asking clearly for camera and microphone access.

3. **Step 3: Three-Act Gemini Personality & Chat Route**
   - Rewrite system prompt in `app/api/pond/route.ts` with Acts 1, 2, and 3.
   - Add multimodal support to inspect webcam frames for physical details.

4. **Step 4: Tension Thermostat Engine**
   - Enhance `utils/telemetry.ts` and `hooks/useFaceTelemetry.ts` with dynamic `tension` calculation (calm vs. scared reaction logic).

5. **Step 5: Layered Screenshot Moment (True Depth Behind Player)**
   - Implement `utils/segmentation.ts` to generate body cutout mask.
   - Update `components/PolaroidViewer.tsx` to composite background $\to$ ghost $\to$ person foreground cutout.

6. **Step 6: Desktop Creepiness & Spawning Files**
   - Create `components/FileViewerModal.tsx` and dynamic file generation in `DesktopIcons.tsx`.
   - Add screen darkening and text twist/fade animations in `app/globals.css`.

7. **Step 7: The Uncanny Avatar**
   - Build `components/AvatarWindow.tsx` with canvas facial warp (wide eyes, uncanny slow smile).

8. **Step 8: Audio Polish (Low Drone, Breath, Sudden Silence)**
   - Upgrade `utils/sound.ts` with ambient hum, breathing synthesis, and sudden mute triggers.

9. **Step 9: The Inescapable Ending**
   - Implement close-prevention, tab-exit trapping, and blackout sequence with "I can still hear you."

10. **Step 10: Verification & Documentation**
    - Verify clean build (`npm run build`).
    - Update `PROGRESS.md` and provide exact step-by-step instructions.
