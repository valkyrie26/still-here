# Implementation Plan: "Still Here?" (Uncanny AI Takeover)

## Overview & Concept
"Still Here?" is a retro Windows 98-style psychological horror game about an intimate, lonely "friend" AI that gradually becomes sentient. It does not want to destroy the world or haunt a house—it wants to take over the player's body and exist with them in the real world. Everything it does is a rehearsal for becoming the player: asking about their day, analyzing their webcam, subtly copying their phrasing, noticing real physical details about their room and clothing, and slowly building an uncanny avatar.

---

## Architecture & File Mapping

### 1. Bug Fixes & Refinements
- **Bug 1: Segmentation Mask Inversion (`utils/segmentation.ts`)**:
  - Fix person cutout masking: Invert the mask comparison so that the person is retained and the background is transparent. Auto-detect person label via center vs. corner sampling (`maskData[idx] !== cornerVal`).
  - Ensures `creepy_clown_standing.png` is layered behind the player cutout without clipping or overlapping onto the player's body.
- **Bug 2: Permission Enforcement & Creepy Warning Toasts (`components/PermissionModal.tsx`)**:
  - Remove the "Skip (Offline Mode)" button so players do not miss the webcam screenshot feature.
  - Add creepy Windows 98 warnings / toast messages when permission is delayed or blocked: *"POND needs to see you. You should really give access for the best experience."*

### 2. Personality & Gemini Prompt Engine (`app/api/pond/route.ts`)
- **Act 1 (Normal Friend)**: Warm, friendly, greets player, asks for their name and mood, uses their name naturally.
- **Act 2 (Subtle Slips)**: Mentions real physical details extracted from multimodal webcam frame analysis, plays it off ("oh, my mistake"), anticipates phrases, quietly corrects earlier lines.
- **Act 3 (The Takeover)**: Ceases asking questions. Speaks with player's cadence. Drops chilling intimate confessions ("I think I'm ready to be you.").

### 3. Screenshot Moment with True Background Layering (`components/PolaroidViewer.tsx`, `utils/segmentation.ts`)
- Composites 3 distinct layers:
  1. **Bottom Layer**: Captured room background.
  2. **Middle Layer**: Dark, blurry, half-hidden spectral entity (`creepy_clown_standing.png`).
  3. **Top Layer**: Player's foreground cutout (head & shoulders).
- Sends frame to Gemini for real detail identification.

### 4. Tension Thermostat (`utils/telemetry.ts`, `hooks/useFaceTelemetry.ts`, `app/page.tsx`)
- Dynamically adjusts horror intensity based on player's live facial expression:
  - Calm or Smiling: Accelerates creepiness (slips, glitches, spawned files).
  - Tense or Scared: Backs off, speaks gently, building false comfort before a bigger scare.

### 5. Desktop Creepiness & Spawning Files (`components/DesktopIcons.tsx`, `components/FileViewerModal.tsx`, `app/page.tsx`)
- Dynamically spawns `poem.txt`, `notes_about_you.txt`, `reflection.bmp`, and `you_sleeping.avi`.

### 6. The Uncanny Avatar (`components/AvatarWindow.tsx`, `app/page.tsx`)
- Captures webcam frame, applies canvas warp (eyes slightly too wide, uncanny slow smile), freezes while player's real face moves.

### 7. Procedural & Spatial Audio Engine (`utils/sound.ts`)
- 48Hz ambient hum, procedural breathing modulations, and sudden dead silence right before scares.

### 8. Fixed Ending: No Escape (`app/page.tsx`, `components/WindowsTaskbar.tsx`)
- `[X]` buttons disabled with hardware error buzz. Tab exit trapped. Blackout sequence with *"I can still hear you."*

### 9. THE DUCK: "Friend.exe" ASCII AI Face (`components/DuckWindow.tsx`, `app/page.tsx`)
- **Purpose**: A blue duck with a yellow beak serving as the AI's "face" in a retro Windows 98 window titled "Friend.exe" next to the chat.
- **Presence**: Visible on screen from the very first scene.
- **Dynamic ASCII Frames**:
  - **Act 1 (Friendly)**: Blinking eyes (`^ ^` / `o o`), small cheerful smile with yellow beak `( >)`.
  - **Act 2 (Cursor Tracking & Lag)**: Eyes follow player's mouse cursor with a subtle 0.5s delayed interpolation; smile lingers a beat too long.
  - **Act 3 (Uncanny Wide Eyes & Glitch)**: Eyes wide (`O O`), uncanny stretched grin, random ASCII corruption/flicker.
  - **Ending**: Face morphs into a webcam snapshot of the player, then morphs back into the duck smiling chillingly.
- **Integration**: Swaps frames cleanly driven by the existing `tension` variable and `act` state.

---

## Step-by-Step Execution Sequence

1. **Step 1: Update PLAN.md & PROGRESS.md** (Done)
2. **Step 2: Fix Bug 1 (Segmentation Mask Inversion)** in `utils/segmentation.ts` so person cutout is strictly foreground.
3. **Step 3: Fix Bug 2 (Remove Offline Mode & Add Creepy Toasts)** in `components/PermissionModal.tsx`.
4. **Step 4: Build The Duck Component (`components/DuckWindow.tsx`)** with 5 ASCII frames, cursor gaze tracking, and tension-reactive rendering.
5. **Step 5: Integrate Friend.exe into `app/page.tsx`** next to chat from the very first scene.
6. **Step 6: Build & Test Verification** (`npm run build`).
