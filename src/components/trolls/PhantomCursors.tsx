import { useEffect, useRef, useState, useCallback } from 'react';

interface PhantomCursor {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  visible: boolean;
}

interface PhantomCursorsProps {
  count: number;
}

// System cursor SVG — identical to default OS pointer
const SYSTEM_CURSOR = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 320 512" style="filter:drop-shadow(0 1px 1px rgba(0,0,0,0.15))"><path d="M0 55.2V426c0 12.2 9.9 22 22 22c6.3 0 12.4-2.7 16.6-7.5L121.2 346l58.1 116.3c7.9 15.8 27.1 22.2 42.9 14.3s22.2-27.1 14.3-42.9L178.3 317.4l118.3 0c12.2 0 22-9.9 22-22c0-6.3-2.7-12.4-7.5-16.6L38.6 7.5C34.4 2.7 28.3 0 22 0C9.9 0 0 9.9 0 22V55.2z" fill="#fff" stroke="#000" stroke-width="25"/></svg>`;

// Cleaner cursor path
const CURSOR_PATH = "M 0,0 L 0,18 L 4.5,14.5 L 8,22 L 10.5,21 L 7,13.5 L 12,13.5 Z";

export default function PhantomCursors({ count }: PhantomCursorsProps) {
  const [cursors, setCursors] = useState<PhantomCursor[]>([]);
  const animRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });

  // Track real mouse
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Initialize phantoms with fixed offsets from mouse
  useEffect(() => {
    const newCursors: PhantomCursor[] = [];
    for (let i = 0; i < count; i++) {
      // Pick random relative offsets that will be locked to the real cursor
      const offsetX = (Math.random() < 0.5 ? 1 : -1) * (50 + Math.random() * 200);
      const offsetY = (Math.random() < 0.5 ? 1 : -1) * (50 + Math.random() * 200);
      newCursors.push({
        id: `phantom-${i}`,
        x: mouseRef.current.x + offsetX,
        y: mouseRef.current.y + offsetY,
        targetX: offsetX,     // We store the offset in targetX/Y for convenience
        targetY: offsetY,
        speed: 1, // Instantly tracks
        visible: true,
      });
    }
    setCursors(newCursors);
  }, [count]);

  // Animation loop locking to real mouse
  const updateCursors = useCallback(() => {
    setCursors(prev => prev.map(cursor => {
      // The cursor literally mirrors the mouse position plus its fixed offset
      return {
        ...cursor,
        x: mouseRef.current.x + cursor.targetX,
        y: mouseRef.current.y + cursor.targetY,
      };
    }));

    animRef.current = requestAnimationFrame(updateCursors);
  }, []);

  useEffect(() => {
    animRef.current = requestAnimationFrame(updateCursors);
    return () => cancelAnimationFrame(animRef.current);
  }, [updateCursors]);

  return (
    <>
      {cursors.map(cursor => (
        cursor.visible && (
          <div
            key={cursor.id}
            style={{
              position: 'fixed',
              left: cursor.x,
              top: cursor.y,
              pointerEvents: 'none',
              zIndex: 9999,
              width: 0,
              height: 0,
            }}
          >
            {/* Identical to system cursor — plain black arrow with white edge */}
            <svg
              width="14"
              height="22"
              viewBox="0 0 14 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                filter: 'drop-shadow(0 0.5px 0.5px rgba(0,0,0,0.1))',
                position: 'absolute',
                top: 0,
                left: 0,
              }}
            >
              <path
                d={CURSOR_PATH}
                fill="#000"
                stroke="#fff"
                strokeWidth="1"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )
      ))}
    </>
  );
}
