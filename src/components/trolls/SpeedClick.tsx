import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SpeedClickProps {
  onComplete?: () => void;
}

export default function SpeedClick({ onComplete }: SpeedClickProps) {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'success' | 'fail'>('idle');
  const [targetPosition, setTargetPosition] = useState({ x: 50, y: 50 });
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5);
  const [targetSize, setTargetSize] = useState(60);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const needed = 7;

  const moveTarget = useCallback(() => {
    setTargetPosition({
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
    });
    // Shrink slightly each hit
    setTargetSize(prev => Math.max(25, prev - 4));
  }, []);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(5);
    setTargetSize(60);
    moveTarget();

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) {
          setGameState('fail');
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return +(prev - 0.1).toFixed(1);
      });
    }, 100);
  };

  const handleTargetClick = () => {
    if (gameState !== 'playing') return;

    const newScore = score + 1;
    setScore(newScore);

    if (newScore >= needed) {
      setGameState('success');
      if (timerRef.current) clearInterval(timerRef.current);
      if (onComplete) onComplete();
    } else {
      moveTarget();
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <motion.div
      className="liquid-glass rounded-2xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-white/30 uppercase tracking-widest">Speed Click</p>
        {gameState === 'playing' && (
          <p className={`text-sm font-mono tabular-nums ${timeLeft < 2 ? 'text-red-400' : 'text-white/50'}`}>
            {timeLeft.toFixed(1)}s
          </p>
        )}
      </div>

      <div
        ref={gameAreaRef}
        className="relative w-full h-44 rounded-xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.03)' }}
      >
        {/* Idle state */}
        {gameState === 'idle' && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-xs text-white/30">Click {needed} targets in 5 seconds</p>
            <motion.button
              className="px-6 py-2 rounded-lg bg-white text-black text-sm font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startGame}
            >
              START
            </motion.button>
          </motion.div>
        )}

        {/* Playing — target dot */}
        {gameState === 'playing' && (
          <>
            <motion.div
              className="absolute rounded-full cursor-pointer flex items-center justify-center"
              style={{
                width: targetSize,
                height: targetSize,
                left: `${targetPosition.x}%`,
                top: `${targetPosition.y}%`,
                transform: 'translate(-50%, -50%)',
                background: 'radial-gradient(circle, rgba(255,255,255,0.25), rgba(255,255,255,0.05))',
                border: '2px solid rgba(255,255,255,0.3)',
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              onClick={handleTargetClick}
              whileHover={{ scale: 1.1, borderColor: 'rgba(255,255,255,0.6)' }}
            >
              <div className="w-2 h-2 rounded-full bg-white" />
            </motion.div>
            {/* Score counter */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
              <p className="text-xs text-white/30 tabular-nums">{score}/{needed}</p>
            </div>
          </>
        )}

        {/* Success */}
        {gameState === 'success' && (
          <motion.div
            className="absolute inset-0 bg-emerald-500/5 flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-emerald-400 text-sm font-medium">✓ Speed Demon!</p>
            <p className="text-white/30 text-xs mt-1">
              {timeLeft.toFixed(1)}s remaining
            </p>
          </motion.div>
        )}

        {/* Fail */}
        {gameState === 'fail' && (
          <motion.div
            className="absolute inset-0 bg-red-500/5 flex flex-col items-center justify-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-red-400 text-sm font-medium">
              Too slow. ({score}/{needed})
            </p>
            <motion.button
              className="px-4 py-1.5 rounded-lg border border-white/15 text-white/50 text-xs"
              whileHover={{ scale: 1.05, borderColor: 'rgba(255,255,255,0.3)' }}
              whileTap={{ scale: 0.95 }}
              onClick={startGame}
            >
              Try Again
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
