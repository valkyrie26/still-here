/**
 * Selfie Segmentation & 3-Layer Optical Depth Compositor
 *
 * Strict Layer Ordering:
 * 1. Bottom Layer: Mirrored room background
 * 2. Middle Layer: Dark, blurry, half-hidden ghost (creepy_clown_standing)
 * 3. Top Layer: Player foreground cutout (head & shoulders) with "Smile" movie warp
 *
 * This guarantees the entity appears strictly BEHIND the player, never overlaid on top.
 */

import { FaceBox } from "./telemetry";

let imageSegmenterInstance: any = null;
let isSegmenterLoading = false;

/**
 * Initializes MediaPipe ImageSegmenter (Selfie Segmenter float16)
 */
export async function initSelfieSegmenter() {
  if (imageSegmenterInstance || isSegmenterLoading || typeof window === "undefined") {
    return imageSegmenterInstance;
  }

  try {
    isSegmenterLoading = true;
    const { ImageSegmenter, FilesetResolver } = await import("@mediapipe/tasks-vision");
    const filesetResolver = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

    imageSegmenterInstance = await ImageSegmenter.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite",
        delegate: "GPU",
      },
      runningMode: "IMAGE",
      outputConfidenceMasks: false,
      outputCategoryMask: true,
    });
    isSegmenterLoading = false;
    return imageSegmenterInstance;
  } catch (err) {
    console.warn("MediaPipe Selfie Segmenter init warning (using depth hull fallback):", err);
    isSegmenterLoading = false;
    return null;
  }
}

/**
 * Applies the dramatic "Smile" movie uncanny grin warp:
 * - MODIFIES STRICTLY AND ONLY THE MOUTH. Eyes, nose, cheeks, chin are 100% untouched.
 * - Extends the mouth edges/corners far UPWARDS towards cheekbones.
 * - Does NOT pull lower lips downwards (zero downward dip).
 * - Bilinear interpolation for crisp, photo-realistic blending.
 */
export function applySmileMovieWarp(
  canvas: HTMLCanvasElement,
  faceBox?: FaceBox
): HTMLCanvasElement {
  const width = canvas.width;
  const height = canvas.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const imgData = ctx.getImageData(0, 0, width, height);
  const src = new Uint8ClampedArray(imgData.data);
  const dst = imgData.data;

  // Compute anatomical face coordinates
  const cx = (faceBox?.centerX ?? 0.5) * width;
  const cy = (faceBox?.centerY ?? 0.45) * height;
  const fw = (faceBox?.faceWidth ?? 0.32) * width;

  // STRICT MOUTH BOUNDING BOX:
  // Mouth center is ~58% of faceWidth below face center
  const mouthX = cx;
  const mouthY = Math.min(height * 0.84, cy + fw * 0.58);
  const mouthRadiusX = fw * 0.42; // Width of mouth influence
  const mouthRadiusY = fw * 0.18; // Height of mouth influence

  // Vertical bounds: completely below nose base and above chin crease
  const yMin = Math.max(0, Math.floor(mouthY - mouthRadiusY * 1.1));
  const yMax = Math.min(height - 1, Math.ceil(mouthY + mouthRadiusY * 1.1));
  const xMin = Math.max(0, Math.floor(mouthX - mouthRadiusX * 1.15));
  const xMax = Math.min(width - 1, Math.ceil(mouthX + mouthRadiusX * 1.15));

  for (let y = yMin; y <= yMax; y++) {
    for (let x = xMin; x <= xMax; x++) {
      const normX = (x - mouthX) / mouthRadiusX;
      const normY = (y - mouthY) / mouthRadiusY;
      const distSq = normX * normX + normY * normY;

      if (distSq < 1.0) {
        // Smooth falloff from center to edge of mouth box
        const weight = (1 - distSq) * (1 - distSq);

        // ONLY LIFT CORNERS UPWARDS:
        // absX is 0 at center lips, 1 at mouth corners
        const absX = Math.abs(normX);
        const cornerFactor = Math.pow(absX, 1.5);

        // Strong upward lift at corners (up to ~35-45px depending on face size)
        const maxUpLift = mouthRadiusY * 1.45;
        const upLift = cornerFactor * maxUpLift * weight;

        // Subtle horizontal widening of the corners
        const stretchX = 0.28 * weight * (x - mouthX);
        const srcX = x - stretchX;

        // INVERSE MAPPING: To lift corners UP, sample from lower down (y + upLift)
        // Center lips have cornerFactor = 0, so NO DOWNWARD OR UPWARD PULL at center!
        const srcY = y + upLift;

        // Bilinear interpolation
        const x0 = Math.max(0, Math.min(width - 1, Math.floor(srcX)));
        const x1 = Math.max(0, Math.min(width - 1, x0 + 1));
        const y0 = Math.max(0, Math.min(height - 1, Math.floor(srcY)));
        const y1 = Math.max(0, Math.min(height - 1, y0 + 1));

        const fx = srcX - Math.floor(srcX);
        const fy = srcY - Math.floor(srcY);

        const i00 = (y0 * width + x0) * 4;
        const i10 = (y0 * width + x1) * 4;
        const i01 = (y1 * width + x0) * 4;
        const i11 = (y1 * width + x1) * 4;

        const targetIdx = (y * width + x) * 4;

        for (let c = 0; c < 4; c++) {
          const top = src[i00 + c] * (1 - fx) + src[i10 + c] * fx;
          const bot = src[i01 + c] * (1 - fx) + src[i11 + c] * fx;
          dst[targetIdx + c] = Math.round(top * (1 - fy) + bot * fy);
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

/**
 * Creates an alpha-cutout canvas of the player
 * Flipped / calibrated so the player's real body is 100% opaque foreground
 * and room background is transparent.
 */
async function extractPlayerForegroundCutout(
  videoCanvas: HTMLCanvasElement,
  faceBox?: FaceBox
): Promise<HTMLCanvasElement | null> {
  const width = videoCanvas.width;
  const height = videoCanvas.height;

  const cutoutCanvas = document.createElement("canvas");
  cutoutCanvas.width = width;
  cutoutCanvas.height = height;
  const cutoutCtx = cutoutCanvas.getContext("2d");
  if (!cutoutCtx) return null;

  try {
    const segmenter = await initSelfieSegmenter();
    if (segmenter) {
      const result = segmenter.segment(videoCanvas);
      if (result && result.categoryMask) {
        const maskData = result.categoryMask.getAsUint8Array();
        const maskWidth = result.categoryMask.width;
        const maskHeight = result.categoryMask.height;

        // Draw original video canvas
        cutoutCtx.drawImage(videoCanvas, 0, 0);

        // Get image data and apply alpha mask from segmentation
        const imgData = cutoutCtx.getImageData(0, 0, width, height);
        const data = imgData.data;

        const scaleX = maskWidth / width;
        const scaleY = maskHeight / height;

        // Auto-detect person category vs room background category:
        // Top-left corner (0,0) is always the room/wall background
        const cornerBgVal = maskData[0];

        // Center point where player's face/chest sits
        const sampleX = Math.min(maskWidth - 1, Math.max(0, Math.floor(maskWidth * (faceBox?.centerX ?? 0.5))));
        const sampleY = Math.min(maskHeight - 1, Math.max(0, Math.floor(maskHeight * (faceBox?.centerY ?? 0.45))));
        const centerPersonVal = maskData[sampleY * maskWidth + sampleX];

        // Person set is distinctly the opposite category of the corner background
        const personCategoryVal = centerPersonVal !== cornerBgVal ? centerPersonVal : (cornerBgVal === 0 ? 1 : 0);

        for (let y = 0; y < height; y++) {
          const maskY = Math.min(maskHeight - 1, Math.floor(y * scaleY));
          for (let x = 0; x < width; x++) {
            const maskX = Math.min(maskWidth - 1, Math.floor(x * scaleX));
            const maskIdx = maskY * maskWidth + maskX;

            // Invert / take the person set:
            const isPerson = maskData[maskIdx] === personCategoryVal;
            const pixelIdx = (y * width + x) * 4;

            if (!isPerson) {
              data[pixelIdx + 3] = 0; // Make background transparent
            } else {
              data[pixelIdx + 3] = 255; // Keep player 100% opaque
            }
          }
        }

        cutoutCtx.putImageData(imgData, 0, 0);
        result.close();
        return cutoutCanvas;
      }
    }
  } catch (e) {
    console.warn("Selfie segmentation execution note:", e);
  }

  // Geometric Anatomical Fallback (Head & Torso Cutout based on face telemetry)
  const cx = (faceBox?.centerX ?? 0.5) * width;
  const cy = (faceBox?.centerY ?? 0.45) * height;
  const fw = (faceBox?.faceWidth ?? 0.32) * width;

  cutoutCtx.save();
  cutoutCtx.beginPath();

  // Head ellipse
  const headRadiusX = fw * 0.75;
  const headRadiusY = fw * 0.95;
  cutoutCtx.ellipse(cx, cy, headRadiusX, headRadiusY, 0, 0, Math.PI * 2);

  // Torso / Shoulders polygon stretching down to bottom edge
  const shoulderHalfWidth = fw * 2.0;
  cutoutCtx.moveTo(cx - headRadiusX * 0.7, cy + headRadiusY * 0.6);
  cutoutCtx.quadraticCurveTo(cx - shoulderHalfWidth, cy + headRadiusY * 1.5, cx - shoulderHalfWidth * 1.2, height);
  cutoutCtx.lineTo(cx + shoulderHalfWidth * 1.2, height);
  cutoutCtx.quadraticCurveTo(cx + shoulderHalfWidth, cy + headRadiusY * 1.5, cx + headRadiusX * 0.7, cy + headRadiusY * 0.6);
  cutoutCtx.closePath();

  cutoutCtx.clip();
  cutoutCtx.drawImage(videoCanvas, 0, 0);
  cutoutCtx.restore();

  return cutoutCanvas;
}

/**
 * Composites the 3-layer screenshot:
 * 1. Room Background
 * 2. Creepy Clown Entity (blurred, dark, grounded from bottom)
 * 3. Person Cutout strictly on top (with uncanny "Smile" movie grin)
 */
export async function compositeLayeredScreenshot(
  video: HTMLVideoElement,
  clownImg: HTMLImageElement,
  options: {
    faceBox?: FaceBox;
  }
): Promise<string> {
  const width = 640;
  const height = 480;

  // Video canvas (mirrored player webcam)
  const videoCanvas = document.createElement("canvas");
  videoCanvas.width = width;
  videoCanvas.height = height;
  const vCtx = videoCanvas.getContext("2d");
  if (!vCtx) return "";

  vCtx.save();
  vCtx.translate(width, 0);
  vCtx.scale(-1, 1);
  vCtx.drawImage(video, 0, 0, width, height);
  vCtx.restore();

  // Composite Master Canvas
  const masterCanvas = document.createElement("canvas");
  masterCanvas.width = width;
  masterCanvas.height = height;
  const ctx = masterCanvas.getContext("2d");
  if (!ctx) return "";

  // LAYER 1: Room Background
  ctx.drawImage(videoCanvas, 0, 0);

  // Atmospheric grading
  ctx.fillStyle = "rgba(10, 15, 20, 0.12)";
  ctx.fillRect(0, 0, width, height);

  // LAYER 2: Ghost Entity (Creepy Clown Standing)
  // Grounded from bottom of frame, blurry, dark, half-hidden
  if (clownImg && clownImg.complete && clownImg.naturalWidth > 0) {
    ctx.save();

    const openSide = options.faceBox?.openRoomSide || "right";
    const clownH = Math.round(height * 0.92);
    const clownW = clownH;
    const clownY = height - clownH + 8; // firmly grounded at floor

    // Place on the side of the room behind the user's shoulder
    const clownX = openSide === "right" ? width - clownW + 35 : -35;

    // Soft drop shadow at feet
    ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
    ctx.beginPath();
    ctx.ellipse(clownX + clownW / 2, height - 10, clownW * 0.35, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dark, blurry, half-hidden ghost filter
    ctx.filter = "blur(2.5px) brightness(0.68) contrast(1.25)";
    ctx.globalAlpha = 0.88;
    ctx.drawImage(clownImg, clownX, clownY, clownW, clownH);
    ctx.restore();
  }

  // LAYER 3: Person Foreground Cutout (Head & Shoulders ON TOP)
  const playerCutout = await extractPlayerForegroundCutout(videoCanvas, options.faceBox);
  if (playerCutout) {
    // Apply uncanny "Smile" movie grin warp to player cutout (mouth only)
    applySmileMovieWarp(playerCutout, options.faceBox);

    ctx.save();
    // Draw the person cutout directly on top of the ghost
    ctx.drawImage(playerCutout, 0, 0);
    ctx.restore();
  }

  // Cinematic Vintage Camera Vignette
  const vignette = ctx.createRadialGradient(
    width / 2,
    height / 2,
    width * 0.32,
    width / 2,
    height / 2,
    width * 0.78
  );
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,10,5,0.48)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);

  return masterCanvas.toDataURL("image/jpeg", 0.92);
}
