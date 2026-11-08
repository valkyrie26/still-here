# Implementation Plan: Restoring Tilting Chat Text to Normal

## Overview & Scope
When chat messages tilt or drift as an eerie atmospheric anomaly, the user requested that they return completely to normal after a few seconds instead of staying permanently crooked or displaced.

---

## Files Touched & Specific Modifications

### 1. `app/globals.css`
- Update `.text-drift-fall`:
  - Change the keyframe animation (`letterDrop` or `textTiltWave`) into a seamless round-trip animation:
    - 0%: Normal baseline (`rotate(0deg)`, `translateY(0)`, `opacity: 1`).
    - 30%: Subtle unsettling tilt (`rotate(2deg)`, `translateY(4px)`).
    - 55%: Peak uncanny sag & distortion (`rotate(4.5deg)`, `translateY(9px)`, `opacity: 0.8`).
    - 80%: Straightening back up (`rotate(1.5deg)`, `translateY(2px)`, `opacity: 0.95`).
    - 100%: Completely restored to normal (`rotate(0deg)`, `translateY(0)`, `opacity: 1`).
  - Duration: 3.5s with smooth `ease-in-out` timing.

### 2. `app/page.tsx`
- Ensure message `isDrifting` flags automatically reset to `false` after 3.5 seconds so messages never stay permanently tilted.
- Keep `textDriftTrigger` duration synchronized to ~3.5 seconds.

### 3. `PROGRESS.md`
- Track progress and verification.

---

## Step-by-Step Execution Sequence
1. Update `PLAN.md` (this file).
2. Update `PROGRESS.md`.
3. Update keyframe animation in `app/globals.css`.
4. Update message drift cleanup in `app/page.tsx`.
5. Run `npm run build` to verify zero errors.
6. Commit and push to GitHub `main`.
7. Provide instructions for testing.
