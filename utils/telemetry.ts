/**
 * Face telemetry interface extracted from MediaPipe FaceLandmarker
 */
export interface FaceTelemetry {
  valence: number; // -1 (scared/negative) to 1 (positive/smiling)
  arousal: number; // 0 (calm) to 1 (intense/agitated)
  smile: number; // 0 to 1
  eyeWide: number; // 0 to 1
  headYaw: number; // degrees: negative = looking left, positive = looking right
  gazeLocked: boolean; // true when user is facing center reading text
  gazeAtViewfinder: boolean; // true when user shifts eyes/head directly toward the top-right camera window
  isHeadTurned: boolean; // true when |headYaw| > 18° (turned around)
  timeInSession: number; // seconds since connection
}

/**
 * Computes psychological affect (valence and arousal) and pose metrics
 * from MediaPipe 52 face blendshapes and 478 3D landmarks.
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

  // 2. Negative cues
  const negCues =
    (get("browDownLeft") +
      get("browDownRight") +
      get("mouthFrownLeft") +
      get("mouthFrownRight") +
      get("noseSneerLeft") +
      get("noseSneerRight")) /
    3;

  const valence = Math.max(-1, Math.min(1, posCues - negCues));

  // Arousal
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

  // Compute Head Yaw (degrees)
  let headYaw = 0;
  if (landmarks && landmarks.length > 454) {
    const nose = landmarks[1];
    const leftTragus = landmarks[234];
    const rightTragus = landmarks[454];

    const distToLeft = Math.abs(nose.x - leftTragus.x);
    const distToRight = Math.abs(rightTragus.x - nose.x);
    const totalDist = distToLeft + distToRight;

    if (totalDist > 0.001) {
      const ratio = distToLeft / totalDist;
      headYaw = (ratio - 0.5) * 110;
    }
  }

  // Gaze Locked (reading central chat)
  const gazeLocked = Math.abs(headYaw) <= 6;

  // Gaze at Viewfinder: Head slightly angled towards top-right (between +6° and +17°) or eye look right
  const eyeLookOutRight = get("eyeLookOutRight") || get("eyeLookInLeft");
  const gazeAtViewfinder =
    (headYaw >= 5 && headYaw <= 17) || (headYaw >= 3 && eyeLookOutRight > 0.3);

  // Head Turned Around (|headYaw| > 18 deg)
  const isHeadTurned = Math.abs(headYaw) > 18;

  return {
    valence: parseFloat(valence.toFixed(2)),
    arousal: parseFloat(arousal.toFixed(2)),
    smile: parseFloat(smile.toFixed(2)),
    eyeWide: parseFloat(eyeWide.toFixed(2)),
    headYaw: parseFloat(headYaw.toFixed(1)),
    gazeLocked,
    gazeAtViewfinder,
    isHeadTurned,
    timeInSession,
  };
}
