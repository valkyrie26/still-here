"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { FaceTelemetry, computeAffectFromBlendshapes } from "@/utils/telemetry";

interface UseFaceTelemetryOptions {
  videoRef: React.RefObject<HTMLVideoElement>;
  enabled?: boolean;
  onHeadTurn?: (yaw: number) => void;
}

export function useFaceTelemetry({
  videoRef,
  enabled = true,
  onHeadTurn,
}: UseFaceTelemetryOptions) {
  const [telemetry, setTelemetry] = useState<FaceTelemetry>({
    valence: 0,
    arousal: 0.1,
    smile: 0,
    eyeWide: 0.2,
    headYaw: 0,
    gazeLocked: true,
    isHeadTurned: false,
    timeInSession: 0,
  });

  const [isModelReady, setIsModelReady] = useState(false);
  const landmarkerRef = useRef<any>(null);
  const requestRef = useRef<number | null>(null);
  const sessionStartTime = useRef<number>(Date.now());
  const lastHeadTurnTriggerTime = useRef<number>(0);
  const onHeadTurnRef = useRef(onHeadTurn);

  useEffect(() => {
    onHeadTurnRef.current = onHeadTurn;
  }, [onHeadTurn]);

  // Load MediaPipe FaceLandmarker
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    let isMounted = true;

    async function setupLandmarker() {
      try {
        const { FaceLandmarker, FilesetResolver } = await import(
          "@mediapipe/tasks-vision"
        );

        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

        const landmarker = await FaceLandmarker.createFromOptions(
          filesetResolver,
          {
            baseOptions: {
              modelAssetPath:
                "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
              delegate: "GPU",
            },
            outputFaceBlendshapes: true,
            runningMode: "VIDEO",
            numFaces: 1,
          }
        );

        if (isMounted) {
          landmarkerRef.current = landmarker;
          setIsModelReady(true);
        }
      } catch (err) {
        console.warn("MediaPipe model loading warning (using fallback):", err);
      }
    }

    setupLandmarker();

    return () => {
      isMounted = false;
      if (landmarkerRef.current) {
        try {
          landmarkerRef.current.close();
        } catch (_) {}
      }
    };
  }, [enabled]);

  // Continuous Detection Loop at 30fps
  useEffect(() => {
    if (!isModelReady || !enabled) return;

    let lastVideoTime = -1;

    function detectFrame() {
      const video = videoRef.current;
      const landmarker = landmarkerRef.current;

      if (video && video.readyState >= 2 && landmarker) {
        if (video.currentTime !== lastVideoTime) {
          lastVideoTime = video.currentTime;

          try {
            const results = landmarker.detectForVideo(video, performance.now());
            const sessionElapsed = Math.floor(
              (Date.now() - sessionStartTime.current) / 1000
            );

            if (
              results.faceBlendshapes &&
              results.faceBlendshapes.length > 0 &&
              results.faceLandmarks &&
              results.faceLandmarks.length > 0
            ) {
              const blendshapes = results.faceBlendshapes[0].categories;
              const landmarks = results.faceLandmarks[0];

              const currentTelemetry = computeAffectFromBlendshapes(
                blendshapes,
                landmarks,
                sessionElapsed
              );

              setTelemetry(currentTelemetry);

              // Edge Trigger on Head Turn (|headYaw| > 18 deg)
              if (currentTelemetry.isHeadTurned) {
                const now = Date.now();
                // Throttle triggers to avoid spamming (once every 1.5s)
                if (now - lastHeadTurnTriggerTime.current > 1500) {
                  lastHeadTurnTriggerTime.current = now;
                  if (onHeadTurnRef.current) {
                    onHeadTurnRef.current(currentTelemetry.headYaw);
                  }
                }
              }
            } else {
              // Face temporarily not visible in frame
              setTelemetry((prev) => ({
                ...prev,
                timeInSession: sessionElapsed,
              }));
            }
          } catch (e) {
            // Frame skip
          }
        }
      }

      requestRef.current = requestAnimationFrame(detectFrame);
    }

    requestRef.current = requestAnimationFrame(detectFrame);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isModelReady, enabled, videoRef]);

  return { telemetry, isModelReady };
}
