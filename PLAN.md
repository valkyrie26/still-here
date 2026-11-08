# Implementation Plan: "friend98" Opening Screen & 3-Click Escape Trigger

## Overview & Concept
The project is renamed to **friend98**—recontextualized around an intimate, recurring loop where the AI and the player have repeated this encounter 98 times (*"like we have been through this 98 times....."*). 

This plan addresses two core features requested by the user:
1. **Opening Screen with Glitchy Text**:
   - An atmospheric, retro Windows 98 / BIOS boot style opening screen before the desktop.
   - Prominently features the title **friend98** and the eerie refrain: *"we have been through this 98 times....."*.
   - Uses slightly glitchy text effects (CRT scanline drift, chromatic jitter, flickering glyphs).
   - Leads cleanly into the Windows 98 desktop and webcam/hardware wizard upon pressing `[ Enter Session 98 ]` (initializing audio and sound context on this user click).
   - Rebrands all project headers and titles to **friend98**.
2. **"There Is No Escape" 3-Click Window Close Climax Trigger**:
   - Tracks how many times the player attempts to close the window via `[X]` (or close commands).
   - Clicks 1 & 2: Ominously deflect with escalating Windows error warnings (*"friend98 cannot be closed. We've done this 98 times."*).
   - Click 3: The screen shakes, plays an audio glitch sting, and displays a prominent chilling red-and-black banner/modal stating **"there is no escape"**.
   - Soon after (1.5s delay), automatically triggers the final ending screen (`triggerEndingClimax()`), plunging into the void where *"I can still hear you."* appears.

---

## Files Touched & Specific Changes

1. **`components/OpeningScreen.tsx`** (New File)
   - Retro Windows 98 boot & setup splash window.
   - Glitchy typography: Title `friend98` with subtle RGB shift / jitter.
   - Text narrative: *"we have been through this 98 times....."*, *"iteration #98 initialized"*, *"do you really not remember me?"*.
   - Start button: `[ Begin Session 98 ]` that initializes Web Audio and transitions smoothly to the desktop.

2. **`app/globals.css`** (Existing File)
   - Add CSS keyframes and utility classes for `.glitch-text-subtle`, `.glitch-flicker`, and screen shake animations.

3. **`app/page.tsx`** (Existing File)
   - Add state `showOpeningScreen` (default `true`).
   - Track `windowCloseAttempts` (number, starts at 0).
   - Render `OpeningScreen` when `showOpeningScreen` is active.
   - In `handleWindowCloseAttempt`:
     - Increment `windowCloseAttempts`.
     - At 1st attempt: play warning tone, display refusal message.
     - At 2nd attempt: play deeper tone, display *"Why are you trying to leave? We have been through this 98 times."*
     - At 3rd attempt: set `escapeDenied` state showing a full-screen or prominent dialog with the exact text **"there is no escape"**, play glitch sting audio, and schedule `triggerEndingClimax()` to fire ~1.5s later.
   - Rebrand title bar, system logs, and taskbar references from "POND" / "Still Here" to **friend98**.

4. **`app/layout.tsx`** (Existing File)
   - Update metadata title to `"friend98 // iteration 98"` and description to reflect the new lore.

5. **`components/WindowsTaskbar.tsx`** (Existing File)
   - Update Start menu header to `friend98`.

6. **`package.json`** (Existing File)
   - Update name field to `"friend98"`.

7. **`PROGRESS.md`** (Existing File)
   - Keep updated throughout implementation and verification.

---

## Step-by-Step Execution Sequence
1. Write `PLAN.md` (this file).
2. Update `PROGRESS.md` to reflect the new tasks.
3. Add glitch text keyframes to `app/globals.css`.
4. Create `components/OpeningScreen.tsx` with glitchy text and retro Windows 98 styling.
5. Update `app/page.tsx` to handle the opening screen state, 3-click close counter, "there is no escape" display, and ending trigger.
6. Update `app/layout.tsx`, `components/WindowsTaskbar.tsx`, and `package.json` to reflect `friend98`.
7. Verify build (`npm run build`).
8. Stage, commit, and push changes to git.
9. Provide exact walkthrough instructions for running and testing each feature.
