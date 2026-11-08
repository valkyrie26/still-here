"use client";

import { useEffect, useRef, useState } from "react";
import { FaceTelemetry, computeAffectFromBlendshapes } from "@/utils/telemetry";

interface UseFaceTelemetryOptions {
  videoRef: React.RefObject<HTMLVideoElement>;
  enabled?: boolean;
  currentTension?: number;
  onHeadTurn?: (yaw: number) => void;
  onViewfinderGaze?: () => void;
}

export function useFaceTelemetry({
  videoRef,
  enabled = true,
  currentTension = 10,
  onHeadTurn,
  onViewfinderGaze,
}: UseFaceTelemetryOptions) {
  const [telemetry, setTelemetry] = useState<FaceTelemetry>({
    valence: 0,
    arousal: 0.1,
    smile: 0,
    eyeWide: 0.2,
    headYaw: 0,
    gazeLocked: true,
    gazeAtViewfinder: false,
    isHeadTurned: false,
    heartRateStress: 68,
    panicScore: 0.1,
    faceBox: {
      centerX: 0.5,
      centerY: 0.5,
      faceWidth: 0.3,
      openRoomSide: "right",
    },
    timeInSession: 0,
    tension: currentTension,
  });

  const [isModelReady, setIsModelReady] = useState(false);
  const landmarkerRef = useRef<any>(null);
  const requestRef = useRef<number | null>(null);
  const sessionStartTime = useRef<number>(Date.now());
  const lastHeadTurnTriggerTime = useRef<number>(0);
  const lastViewfinderGazeTriggerTime = useRef<number>(0);

  const onHeadTurnRef = useRef(onHeadTurn);
  const onViewfinderGazeRef = useRef(onViewfinderGaze);
  const currentTensionRef = useRef(currentTension);

  useEffect(() => {
    onHeadTurnRef.current = onHeadTurn;
    onViewfinderGazeRef.current = onViewfinderGaze;
    currentTensionRef.current = currentTension;
  }, [onHeadTurn, onViewfinderGaze, currentTension]);

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
        console.warn("MediaPipe model loading warning:", err);
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
                sessionElapsed,
                currentTensionRef.current
              );

              setTelemetry(currentTelemetry);

              const now = Date.now();

              // Trigger 1: Head Turn (|headYaw| > 18 deg)
              if (currentTelemetry.isHeadTurned) {
                if (now - lastHeadTurnTriggerTime.current > 1500) {
                  lastHeadTurnTriggerTime.current = now;
                  if (onHeadTurnRef.current) {
                    onHeadTurnRef.current(currentTelemetry.headYaw);
                  }
                }
              }

              // Trigger 2: Direct Gaze at Viewfinder
              if (currentTelemetry.gazeAtViewfinder) {
                if (now - lastViewfinderGazeTriggerTime.current > 2500) {
                  lastViewfinderGazeTriggerTime.current = now;
                  if (onViewfinderGazeRef.current) {
                    onViewfinderGazeRef.current();
                  }
                }
              }
            } else {
              setTelemetry((prev) => ({
                ...prev,
                timeInSession: sessionElapsed,
                tension: currentTensionRef.current,
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
