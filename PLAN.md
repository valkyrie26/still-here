# Implementation Plan: Random Screen Color Scare & Natural Creepy Possession Personality

## Overview & Scope
This plan implements two core updates requested by the user:
1. **Random Screen Color Scare**:
   - A sudden, shocking screen color alteration (blood crimson wash, photographic negative inversion, or decaying corrupted amber CRT shift) that triggers as a random psychological jump-scare during gameplay.
   - Triggered randomly during high tension, on creepy dialogue glitches, and via demo shortcut key `[7]`.
2. **Gemini Natural Creepy Possession Persona**:
   - Refine the AI system instructions in `app/api/pond/route.ts` with explicit instructions:
     - The AI is an entity who wants to **possess the player**, take over their physical body, wear their skin, and live their life in the real world.
     - She must sound completely **natural, intimate, and authentic** (never scripted, canned, or robotic).
     - When the player asks *"who are you"*, *"who areyou"*, or *"what are you"*, she delivers chilling, natural replies revealing her desire to inhabit their body (e.g. *"i'm the girl who wants to live inside you. we've practiced this 98 times."*).
     - Update the offline psychological fallback engine to deliver the same eerie, natural possession answers.

---

## Files Touched & Specific Modifications

### 1. `app/globals.css`
- Add screen color scare CSS classes:
  - `.screen-color-blood`: Abrupt crimson blood wash with saturated red shadows and contrast.
  - `.screen-color-invert`: Sudden photographic negative color inversion with cyan/amber inversion.
  - `.screen-color-corrupt`: Decaying high-contrast amber/monochrome radiation shift.
  - Add `.screen-color-flicker` animation for sudden onset and unstable electrical recovery.

### 2. `app/page.tsx`
- Add state: `screenColorScare: "none" | "blood" | "invert" | "corrupt"`.
- Implement `triggerScreenColorScare(forcedMode?)`:
  - Chooses among blood crimson, negative inversion, or corrupt amber.
  - Plays audio sting / bass drop.
  - Persists for ~1.6–2.2 seconds before snapping back to normal.
- Integrate into:
  - The 1.5s thermostat loop (random scare chance when tension > 30, with cooldown).
  - Backend AI responses with `triggerGlitch: true`.
  - Demo key shortcut `[7]` and update the demo shortcuts HUD.
- Apply the active class to the desktop `<main>` container.

### 3. `app/api/pond/route.ts`
- **System Prompt Refinement**:
  - Explicitly direct the model: She is an entity who wants to **possess the player** and take over their physical body.
  - Emphasize conversational spontaneity and natural cadence.
  - Dictate exact creepy, intimate responses to questions like *"who are you"*, *"who areyou"*, *"what are you"*, *"what is this"*.
- **Fallback Engine (`getPsychologicalFallback`)**:
  - Update matching for *"who are you"*, *"who areyou"*, *"who are u"*, *"what are you"* to return chilling, natural possession dialogue.

### 4. `PROGRESS.md`
- Keep updated with all tasks and verification steps.

---

## Step-by-Step Execution Sequence
1. Write `PLAN.md` (this file).
2. Update `PROGRESS.md` with new items.
3. Add screen color scare CSS classes to `app/globals.css`.
4. Update `app/api/pond/route.ts` with natural creepy possession system instructions and fallback responses.
5. Update `app/page.tsx` with screen color scare state, randomized scare triggers, and demo key `[7]`.
6. Run `npm run build` to verify zero errors.
7. Stage, commit, and push to GitHub `main`.
8. Provide exact instructions on how to test each feature.
