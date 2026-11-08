# Implementation Plan: Reactive Emotion Dialogue & Removing Top Debug HUD

## Overview & Scope
This plan implements two updates requested by the user:
1. **Reactive Emotion Detection Lines**:
   - Add real-time AI reactions based on biometric facial telemetry:
     - Surprised face (`eyeWide > 0.42` or sudden panic jump): friend98 says *"you look surprised, did i spook you?"*
     - Smiling face (`smile > 0.38`): friend98 says *"i like it when you smile."*
   - Handled both via live telemetry event monitors in `app/page.tsx` (with cooldown to prevent spam) and in `app/api/pond/route.ts` via Gemini prompt and fallback logic.
2. **Remove Top Bar Debug Logs**:
   - Remove the `TelemetryHUD` component from the top bar so debug statistics (valence, smile %, panic score, tension %) no longer clutter the retro desktop.
   - Clean up the menu strip in `app/page.tsx` to display authentic Windows 98 status instead of raw debug metrics.

---

## Files Touched & Specific Modifications

### 1. `app/page.tsx`
- **Remove Top Debug HUD**:
  - Remove `<TelemetryHUD>` docked at the top bar.
  - Clean up the chat menu bar to display `STATUS: ONLINE` instead of raw `ACT: 1 | TENSION: 25%`.
- **Reactive Emotion Dialogue**:
  - Track `lastSmileReactionTimeRef` and `lastSurpriseReactionTimeRef`.
  - In the telemetry loop, detect when player smiles (`telemetry.smile > 0.38`) and trigger *"i like it when you smile."*
  - Detect when player looks surprised (`telemetry.eyeWide > 0.42` or `panicScore > 0.52`) and trigger *"you look surprised, did i spook you?"*
  - Ensure cooldown of ~28 seconds so the lines feel spontaneous and eerie rather than repetitive.

### 2. `app/api/pond/route.ts`
- Direct Gemini in `SYSTEM_INSTRUCTION` to actively react to the player's live emotional expressions (`telemetry.smile` and `telemetry.eyeWide`):
  - Mentioning *"i like it when you smile"* or *"you look surprised, did i spook you"* when appropriate.
- Update `getPsychologicalFallback()` to provide these reactions when smile or surprise is elevated.

### 3. `PROGRESS.md`
- Track progress and verification.

---

## Step-by-Step Execution Sequence
1. Write `PLAN.md` (this file).
2. Update `PROGRESS.md`.
3. Remove top debug HUD in `app/page.tsx`.
4. Implement reactive emotion detection in `app/page.tsx` and `app/api/pond/route.ts`.
5. Run `npm run build` to verify zero errors.
6. Commit and push to GitHub `main`.
7. Provide exact instructions for testing the features.
