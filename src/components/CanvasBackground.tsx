import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { drawFrame } from '../utils/frameLoader';
import { ZOOM_FACTOR, CANVAS_SCALE, PARALLAX_INTENSITY, FRAME_COUNT } from '../utils/constants';

interface CanvasBackgroundProps {
  frames: HTMLImageElement[];
  scrollFraction: number;
}

export default function CanvasBackground({ frames, scrollFraction }: CanvasBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const scrollRef = useRef(0);
  const targetScrollRef = useRef(scrollFraction);
  const lastFrameRef = useRef(-1);
  const loopIdRef = useRef(0);

  // Sync props → refs (avoids stale closures)
  framesRef.current = frames;
  targetScrollRef.current = scrollFraction;

  // ─── Persistent render loop — runs every frame, independent of React ───
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set initial size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function loop() {
      const f = framesRef.current;
      if (f.length === 0) {
        loopIdRef.current = requestAnimationFrame(loop);
        return;
      }

      // Smoothly interpolate current scroll towards the target
      scrollRef.current += (targetScrollRef.current - scrollRef.current) * 0.08;

      const frameIndex = Math.max(0, Math.min(
        Math.floor(scrollRef.current * (FRAME_COUNT - 1)),
        FRAME_COUNT - 1
      ));

      // Only redraw if frame changed
      if (frameIndex !== lastFrameRef.current) {
        const img = f[frameIndex];
        const currentCanvas = canvasRef.current;
        const currentCtx = currentCanvas?.getContext('2d');
        if (img && img.complete && img.naturalWidth > 0 && currentCanvas && currentCtx) {
          const w = currentCanvas.width;
          const h = currentCanvas.height;
          currentCtx.clearRect(0, 0, w, h);
          drawFrame(currentCtx, img, w, h, ZOOM_FACTOR);
          lastFrameRef.current = frameIndex;
        }
      }

      loopIdRef.current = requestAnimationFrame(loop);
    }

    loopIdRef.current = requestAnimationFrame(loop);

    // Resize handler
    const onResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      lastFrameRef.current = -1; // Force redraw
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(loopIdRef.current);
      window.removeEventListener('resize', onResize);
    };
  }, []); // Empty deps — runs once, loops forever

  // ─── Mouse parallax ───
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onMove = (e: MouseEvent) => {
      const xOff = (e.clientX / window.innerWidth - 0.5) * 2;
      const yOff = (e.clientY / window.innerHeight - 0.5) * 2;
      gsap.to(container, {
        x: -xOff * PARALLAX_INTENSITY,
        y: -yOff * PARALLAX_INTENSITY,
        duration: 0.8,
        ease: 'power2.out',
      });
    };

    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        transform: `scale(${CANVAS_SCALE})`,
        transformOrigin: 'center center',
        overflow: 'hidden',
      }}
    >
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </div>
  );
}
