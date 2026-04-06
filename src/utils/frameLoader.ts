import { FRAME_COUNT, FRAME_PATH, FRAME_EXT, ZOOM_FACTOR } from './constants';

/**
 * Preloads all frames with parallel batch loading.
 * Returns an array of loaded HTMLImageElement — frame order guaranteed.
 */
export async function preloadFrames(
  onProgress?: (fraction: number) => void
): Promise<HTMLImageElement[]> {
  const frames: HTMLImageElement[] = new Array(FRAME_COUNT);
  let loaded = 0;

  // Load in batches of 20 for faster pipeline
  const BATCH_SIZE = 20;
  const total = FRAME_COUNT;

  for (let batchStart = 0; batchStart < total; batchStart += BATCH_SIZE) {
    const batchEnd = Math.min(batchStart + BATCH_SIZE, total);
    const batchPromises: Promise<void>[] = [];

    for (let i = batchStart; i < batchEnd; i++) {
      const idx = i + 1;
      const pad = String(idx).padStart(3, '0');
      const src = `${FRAME_PATH}${pad}${FRAME_EXT}`;

      batchPromises.push(
        new Promise<void>((resolve) => {
          const img = new Image();
          img.decoding = 'async';
          img.onload = () => {
            frames[i] = img;
            loaded++;
            if (onProgress) onProgress(loaded / total);
            resolve();
          };
          img.onerror = () => {
            // Skip broken frames, use previous/next
            loaded++;
            if (onProgress) onProgress(loaded / total);
            resolve();
          };
          img.src = src;
        })
      );
    }

    await Promise.all(batchPromises);
  }

  // Fill any gaps (broken frames) with nearest valid frame
  for (let i = 0; i < frames.length; i++) {
    if (!frames[i]) {
      // Look forward then backward for nearest valid
      for (let j = 1; j < frames.length; j++) {
        if (frames[i + j]) { frames[i] = frames[i + j]; break; }
        if (frames[i - j]) { frames[i] = frames[i - j]; break; }
      }
    }
  }

  return frames;
}

/**
 * Draws a single frame onto a canvas context with "object-fit: cover" + zoom.
 * @param ctx - Canvas 2D context (pre-scaled for DPR)
 * @param img - Image to draw
 * @param cw  - Canvas CSS width
 * @param ch  - Canvas CSS height
 * @param zoom - Zoom factor (1.0 = no zoom)
 */
export function drawFrame(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cw: number,
  ch: number,
  zoom: number = 1
): void {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  if (iw === 0 || ih === 0) return;

  const canvasAspect = cw / ch;
  const imgAspect = iw / ih;

  let sw: number, sh: number, sx: number, sy: number;

  if (imgAspect > canvasAspect) {
    // Image wider than canvas — crop sides
    sh = ih;
    sw = ih * canvasAspect;
    sx = (iw - sw) / 2;
    sy = 0;
  } else {
    // Image taller than canvas — crop top/bottom
    sw = iw;
    sh = iw / canvasAspect;
    sx = 0;
    sy = (ih - sh) / 2;
  }

  // Apply zoom — shrink source rect to zoom in
  if (zoom > 1) {
    const zoomSW = sw / zoom;
    const zoomSH = sh / zoom;
    sx += (sw - zoomSW) / 2;
    sy += (sh - zoomSH) / 2;
    sw = zoomSW;
    sh = zoomSH;
  }

  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
}
