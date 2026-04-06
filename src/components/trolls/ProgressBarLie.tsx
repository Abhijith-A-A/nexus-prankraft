import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface ProgressBarLieProps {
  onComplete?: () => void;
}

export default function ProgressBarLie({ onComplete }: ProgressBarLieProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0); // 0: filling, 1: rewind1, 2: filling2, 3: rewind2, 4: complete
  const [complete, setComplete] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let targetProgress = 0;

    const runPhase = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);

      intervalRef.current = setInterval(() => {
        setProgress(prev => {
          if (phase === 0) {
            // Fill to 99%
            if (prev >= 99) {
              setPhase(1);
              return 99;
            }
            return prev + 0.8;
          } else if (phase === 1) {
            // Pause at 99, then rewind to 73
            setTimeout(() => {
              setProgress(73);
              setPhase(2);
            }, 2000);
            return prev;
          } else if (phase === 2) {
            // Fill from 73 to 99 again
            if (prev >= 99) {
              setPhase(3);
              return 99;
            }
            return prev + 1.2;
          } else if (phase === 3) {
            // Rewind to 88
            setTimeout(() => {
              setProgress(88);
              setPhase(4);
            }, 1500);
            return prev;
          } else if (phase === 4) {
            // Final push to 100
            if (prev >= 100) {
              setComplete(true);
              if (onComplete) onComplete();
              if (intervalRef.current) clearInterval(intervalRef.current);
              return 100;
            }
            return prev + 0.5;
          }
          return prev;
        });
      }, 50);
    };

    runPhase();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase, onComplete]);

  const messages = [
    'Loading feature demo...',
    'Almost there...',
    'Wait, something went wrong...',
    'Recalibrating...',
    'OK for real this time...',
  ];

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-between items-center mb-2">
        <p className="text-xs text-white/40">
          {messages[Math.min(phase, messages.length - 1)]}
        </p>
        <p className="text-xs text-white/50 font-mono tabular-nums">
          {Math.round(Math.min(progress, 100))}%
        </p>
      </div>

      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            width: `${Math.min(progress, 100)}%`,
            background: complete
              ? 'linear-gradient(90deg, #4ade80, #22c55e)'
              : 'linear-gradient(90deg, rgba(255,255,255,0.6), rgba(255,255,255,0.9))',
          }}
          animate={{
            opacity: phase === 1 || phase === 3 ? [1, 0.5, 1] : 1,
          }}
          transition={{ duration: 0.5, repeat: phase === 1 || phase === 3 ? Infinity : 0 }}
        />
      </div>

      {complete && (
        <motion.div
          className="mt-4 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-sm text-white/60">
            Worth the wait? No? Same.
          </p>
        </motion.div>
      )}
    </div>
  );
}
