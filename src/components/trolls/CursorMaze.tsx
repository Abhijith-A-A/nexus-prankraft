import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CursorMazeProps {
  onComplete?: () => void;
}

// Simple maze: guide cursor from start to end through a narrow path
export default function CursorMaze({ onComplete }: CursorMazeProps) {
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [failed, setFailed] = useState(false);
  const [failCount, setFailCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const mazeRef = useRef<HTMLDivElement>(null);

  // Path checkpoints the cursor must pass through
  const checkpoints = [
    { x: 10, y: 50 },  // Start
    { x: 25, y: 30 },
    { x: 40, y: 70 },
    { x: 55, y: 25 },
    { x: 70, y: 60 },
    { x: 85, y: 40 },
    { x: 95, y: 50 },  // End
  ];

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!started || completed || failed) return;

    const rect = mazeRef.current?.getBoundingClientRect();
    if (!rect) return;

    const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const yPercent = ((e.clientY - rect.top) / rect.height) * 100;

    // Check if cursor is within the "safe zone" (±15% of the path)
    const currentCheckpoint = checkpoints[progress];
    const nextCheckpoint = checkpoints[Math.min(progress + 1, checkpoints.length - 1)];

    // Interpolate between current and next checkpoint
    const dx = nextCheckpoint.x - currentCheckpoint.x;
    const dy = nextCheckpoint.y - currentCheckpoint.y;

    if (dx === 0 && dy === 0) return;

    // Project cursor position onto the line between checkpoints
    const t = Math.max(0, Math.min(1,
      ((xPercent - currentCheckpoint.x) * dx + (yPercent - currentCheckpoint.y) * dy) /
      (dx * dx + dy * dy)
    ));

    const closestX = currentCheckpoint.x + t * dx;
    const closestY = currentCheckpoint.y + t * dy;

    const distance = Math.sqrt((xPercent - closestX) ** 2 + (yPercent - closestY) ** 2);

    // Within safe zone
    if (distance < 18) {
      // Check if reached next checkpoint
      const distToNext = Math.sqrt(
        (xPercent - nextCheckpoint.x) ** 2 + (yPercent - nextCheckpoint.y) ** 2
      );

      if (distToNext < 12 && progress < checkpoints.length - 1) {
        setProgress(prev => {
          const next = prev + 1;
          if (next >= checkpoints.length - 1) {
            setCompleted(true);
            if (onComplete) onComplete();
          }
          return next;
        });
      }
    } else {
      // Too far from path — fail!
      setFailed(true);
      setFailCount(prev => prev + 1);
      setTimeout(() => {
        setFailed(false);
        setStarted(false);
        setProgress(0);
      }, 800);
    }
  }, [started, completed, failed, progress, checkpoints, onComplete]);

  return (
    <motion.div
      className="liquid-glass rounded-2xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-white/30 uppercase tracking-widest">Cursor Maze</p>
        <p className="text-xs text-white/20">
          {failCount > 0 && `fails: ${failCount}`}
        </p>
      </div>

      <div
        ref={mazeRef}
        className="relative w-full h-40 rounded-xl overflow-hidden cursor-crosshair"
        style={{ background: 'rgba(255,255,255,0.03)' }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => !completed && setStarted(true)}
      >
        {/* Path visualization */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="mazeGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
            </linearGradient>
          </defs>
          <polyline
            points={checkpoints.map(cp => `${cp.x},${cp.y}`).join(' ')}
            fill="none"
            stroke="url(#mazeGrad)"
            strokeWidth="2"
            strokeDasharray="4 3"
          />
          {/* Progress line */}
          <polyline
            points={checkpoints.slice(0, progress + 1).map(cp => `${cp.x},${cp.y}`).join(' ')}
            fill="none"
            stroke="rgba(255,255,255,0.6)"
            strokeWidth="2"
          />
          {/* Checkpoints */}
          {checkpoints.map((cp, i) => (
            <circle
              key={i}
              cx={cp.x}
              cy={cp.y}
              r={i === 0 || i === checkpoints.length - 1 ? 3 : 1.5}
              fill={i <= progress ? 'white' : 'rgba(255,255,255,0.2)'}
            />
          ))}
        </svg>

        {/* Start indicator */}
        {!started && !completed && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-xs text-white/30">
              Hover to start — follow the path
            </p>
          </div>
        )}

        {/* Fail flash */}
        <AnimatePresence>
          {failed && (
            <motion.div
              className="absolute inset-0 bg-red-500/10 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <p className="text-red-400 text-sm font-medium">OFF THE PATH!</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Complete */}
        {completed && (
          <motion.div
            className="absolute inset-0 bg-emerald-500/5 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <p className="text-emerald-400 text-sm font-medium">✓ Maze Complete!</p>
          </motion.div>
        )}
      </div>

      {/* Hint after 3 fails */}
      {failCount >= 3 && !completed && (
        <p className="text-[10px] text-white/15 mt-2 italic text-center">
          Pro tip: move slowly. Or just move on with your life.
        </p>
      )}
    </motion.div>
  );
}
