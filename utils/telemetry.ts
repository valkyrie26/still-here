/**
 * Face telemetry & spatial surroundings extracted from MediaPipe FaceLandmarker
 */
export interface FaceBox {
  centerX: number; // 0 (left) to 1 (right)
  centerY: number; // 0 (top) to 1 (bottom)
  faceWidth: number; // relative width of head (e.g. 0.25 to 0.45)
  openRoomSide: "left" | "right"; // the background room side with the most open space
}

export interface FaceTelemetry {
  valence: number; // -1 (fear/negative) to +1 (positive/smiling)
  arousal: number; // 0 (calm) to 1 (intense/agitated)
  smile: number; // 0 to 1
  eyeWide: number; // 0 to 1
  headYaw: number; // degrees: negative = left, positive = right
  gazeLocked: boolean; // true when reading screen center
  gazeAtViewfinder: boolean; // true when looking at top-right camera window
  isHeadTurned: boolean; // true when |headYaw| > 18°
  heartRateStress: number; // 0 to 100 physiological stress index
  panicScore: number; // 0.0 to 1.0 combined fear index
  faceBox: FaceBox; // spatial surroundings data
  timeInSession: number; // seconds
}

/**
 * Computes psychological affect, physiological stress indicators,
 * and spatial room layout from MediaPipe 52 blendshapes and 478 landmarks.
 */
export function computeAffectFromBlendshapes(
  blendshapes: { categoryName: string; score: number }[],
  landmarks: { x: number; y: number; z: number }[],
  timeInSession: number
): FaceTelemetry {
  const scores: Record<string, number> = {};
  for (const b of blendshapes) {
    scores[b.categoryName] = b.score;
  }

  const get = (name: string) => scores[name] || 0;

  // 1. Positive cues
  const posCues =
    (get("mouthSmileLeft") +
      get("mouthSmileRight") +
      get("cheekSquintLeft") +
      get("cheekSquintRight")) /
    2;

  // 2. Negative cues (furrow, frown, sneer)
  const negCues =
    (get("browDownLeft") +
      get("browDownRight") +
      get("mouthFrownLeft") +
      get("mouthFrownRight") +
      get("noseSneerLeft") +
      get("noseSneerRight")) /
    3;

  const valence = Math.max(-1, Math.min(1, posCues - negCues));

  // Arousal: eye wide, jaw drop, brow raise, mouth tension
  const eyeWideLeft = get("eyeWideLeft");
  const eyeWideRight = get("eyeWideRight");
  const jawOpen = get("jawOpen");
  const browInnerUp = get("browInnerUp");
  const mouthStretch = (get("mouthStretchLeft") + get("mouthStretchRight")) / 2;

  const arousal = Math.max(
    0,
    Math.min(
      1,
      eyeWideLeft * 0.225 +
        eyeWideRight * 0.225 +
        jawOpen * 0.25 +
        browInnerUp * 0.2 +
        mouthStretch * 0.1
    )
  );

  const smile = Math.max(0, Math.min(1, (get("mouthSmileLeft") + get("mouthSmileRight")) / 2));
  const eyeWide = Math.max(0, Math.min(1, (eyeWideLeft + eyeWideRight) / 2));

  // 3. Spatial Surroundings Analysis (where is the user sitting vs open room)
  let minX = 1,
    maxX = 0,
    minY = 1,
    maxY = 0;
  let headYaw = 0;

  if (landmarks && landmarks.length > 454) {
    // Landmark 1: Nose tip, 234: Left tragus, 454: Right tragus
    const nose = landmarks[1];
    const leftTragus = landmarks[234];
    const rightTragus = landmarks[454];

    // Compute bounding coordinates
    landmarks.forEach((p) => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });

    const distToLeft = Math.abs(nose.x - leftTragus.x);
    const distToRight = Math.abs(rightTragus.x - nose.x);
    const totalDist = distToLeft + distToRight;

    if (totalDist > 0.001) {
      const ratio = distToLeft / totalDist;
      headYaw = (ratio - 0.5) * 110;
    }
  }

  const centerX = minX < maxX ? (minX + maxX) / 2 : 0.5;
  const centerY = minY < maxY ? (minY + maxY) / 2 : 0.5;
  const faceWidth = minX < maxX ? maxX - minX : 0.3;

  // The side with MORE open background room
  // Note: video feed is mirrored horizontally (-scale-x-100)
  // If player is on left of video, open room is on the right
  const openRoomSide: "left" | "right" = centerX > 0.52 ? "left" : "right";

  const faceBox: FaceBox = {
    centerX: parseFloat(centerX.toFixed(2)),
    centerY: parseFloat(centerY.toFixed(2)),
    faceWidth: parseFloat(faceWidth.toFixed(2)),
    openRoomSide,
  };

  // Gaze tracking
  const gazeLocked = Math.abs(headYaw) <= 6;
  const eyeLookOutRight = get("eyeLookOutRight") || get("eyeLookInLeft");
  const gazeAtViewfinder =
    (headYaw >= 5 && headYaw <= 17) || (headYaw >= 3 && eyeLookOutRight > 0.3);
  const isHeadTurned = Math.abs(headYaw) > 18;

  // Physiological stress estimation (Presage-style biometric affect signals)
  // Heart rate stress proxy: increases with higher arousal, brow furrows, and eye wideness
  const rawStress = arousal * 65 + (valence < 0 ? Math.abs(valence) * 35 : 0);
  const heartRateStress = Math.round(Math.max(45, Math.min(130, 60 + rawStress * 0.7)));

  // Panic Score: combination of negative valence and high arousal
  const panicScore = Math.max(
    0,
    Math.min(1, arousal * 0.6 + (valence < 0 ? Math.abs(valence) * 0.4 : 0))
  );

  return {
    valence: parseFloat(valence.toFixed(2)),
    arousal: parseFloat(arousal.toFixed(2)),
    smile: parseFloat(smile.toFixed(2)),
    eyeWide: parseFloat(eyeWide.toFixed(2)),
    headYaw: parseFloat(headYaw.toFixed(1)),
    gazeLocked,
    gazeAtViewfinder,
    isHeadTurned,
    heartRateStress,
    panicScore: parseFloat(panicScore.toFixed(2)),
    faceBox,
    timeInSession,
  };
}
