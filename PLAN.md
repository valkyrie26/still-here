# Implementation Plan: Pixel Duck, Growing Duck Window, Face-Missing Easter Egg & Ending Dialog

## Overview & Scope
This plan details four new features requested by the user:
1. **Face Missing Easter Egg**:
   - If the player's face is not visible on camera (e.g., covered or stepped away), the AI triggers an eerie message: *"why hide your face, it's only me"*.
2. **Ending Screen Dialog Change**:
   - Update the end screen dialogue to prominently display: **"now we can be together forever"**.
3. **Growing Duck Window on `[X]` Clicks**:
   - Whenever the player clicks `[X]` to close the window, the Duck window (`Friend.exe`) swells larger and larger on screen (scale increases progressively: 1.0 -> 1.25 -> 1.55 -> 1.95+), looming threateningly over the desktop.
4. **Pixel Art Blue Duck with Yellow Beak**:
   - Replace the ASCII duck in `components/DuckWindow.tsx` with authentic 90s retro pixel graphics (`image-rendering: pixelated`).
   - Features cute retro blue plumage, bright yellow beak, animated eye blinks (Act 1), delayed cursor gaze tracking (Act 2), and wide uncanny grin/corrupted glitch (Act 3).

---

## Files Touched & Specific Modifications

### 1. `hooks/useFaceTelemetry.ts` & `utils/telemetry.ts`
- Add `hasDetectedFace: boolean` to `FaceTelemetry`.
- In the detection loop, set `hasDetectedFace = true` when face landmarks are present, and `false` when no face is found in frame.

### 2. `app/page.tsx`
- **Face Missing Easter Egg**:
  - Add timer ref to monitor continuous absence of face (`hasDetectedFace === false`) when permissions are active and session has started.
  - When no face is detected for 3.5 seconds, push message from friend98: *"why hide your face, it's only me"* (with cooldown to prevent spam).
  - Also trigger a subtle whisper sound and optional toast.
- **Growing Duck Window**:
  - Pass dynamic scale factor based on `windowCloseAttempts` to `DuckWindow`:
    `duckScale = 1.0 + windowCloseAttempts * 0.28`.
  - Also increase z-index and apply smooth CSS transition so the duck looms larger with every attempt to escape.
- **Ending Screen Dialog**:
  - Change the ending dialogue to feature:
    **"now we can be together forever"** as the prominent spoken line and dialogue sequence.

### 3. `components/DuckWindow.tsx`
- Accept `scale?: number` prop and apply transform scaling to window container.
- Replace ASCII `<pre>` block with a retro pixel art canvas / SVG pixel grid:
  - Sky blue body (`#38bdf8`), deep blue shading (`#0284c7`), bright yellow beak (`#facc15` / `#ca8a04`).
  - Render pixel-by-pixel grid (or canvas) at crisp integer scale (`image-rendering: pixelated`).
  - Animate pixel eye blinks (`isBlinking`) in Act 1.
  - Dynamically shift pixel pupils based on `gazeDirection` with delayed tracking in Act 2.
  - Render dilated uncanny wide eyes and stretched eerie pixel smile in Act 3 / high tension.
  - Preserve ending webcam face morph sequence.

### 4. `PROGRESS.md`
- Keep updated with newly completed and verified tasks.

---

## Step-by-Step Execution Sequence
1. Update `PLAN.md` (this file).
2. Update `PROGRESS.md` to list the 4 new tasks.
3. Update `hooks/useFaceTelemetry.ts` & `utils/telemetry.ts` to expose `hasDetectedFace`.
4. Update `components/DuckWindow.tsx` to implement the pixel art blue duck with yellow beak and support `scale`.
5. Update `app/page.tsx` to:
   - Handle face missing easter egg ("why hide your face, it's only me").
   - Track duck scale on `[X]` clicks.
   - Update ending dialogue to "now we can be together forever".
6. Run `npm run build` to verify zero errors.
7. Stage, commit, and push to GitHub `main`.
8. Provide clear walkthrough instructions for testing all 4 features.
