import { useState, useRef, useCallback } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';

interface ShyButtonProps {
  label?: string;
  onCatch?: () => void;
}

export default function ShyButton({ label = 'Learn More', onCatch }: ShyButtonProps) {
  const [dodgeCount, setDodgeCount] = useState(0);
  const [caught, setCaught] = useState(false);
  const [caughtMsg, setCaughtMsg] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouseEnter = useCallback(() => {
    if (caught) return;

    const maxDodge = 80 + dodgeCount * 15;
    const angle = Math.random() * Math.PI * 2;
    const distance = maxDodge * (0.5 + Math.random() * 0.5);

    x.set(Math.cos(angle) * distance);
    y.set(Math.sin(angle) * distance);

    setDodgeCount(prev => {
      const next = prev + 1;
      // After 6 attempts, surrender
      if (next >= 6) {
        setCaught(true);
        x.set(0);
        y.set(0);
        setCaughtMsg("Fine. You win. I'll stay.");
        setTimeout(() => setCaughtMsg(''), 2500);
      }
      return next;
    });
  }, [caught, dodgeCount, x, y]);

  const handleClick = () => {
    if (caught) {
      // Scroll to a section that ironically says "Less"
      setCaughtMsg('You wanted "More"? Here\'s "Less."');
      setTimeout(() => setCaughtMsg(''), 2500);
      if (onCatch) onCatch();
    }
  };

  const scale = useTransform(x, [-100, 0, 100], [0.95, 1, 0.95]);

  return (
    <div ref={containerRef} className="relative inline-block" style={{ minHeight: '60px', minWidth: '200px' }}>
      <motion.button
        className="px-8 py-3 rounded-lg border border-white/15 text-white/80 text-sm font-medium 
                   tracking-wide hover:border-white/40 transition-colors cursor-pointer"
        style={{ x, y, scale }}
        onMouseEnter={handleMouseEnter}
        onClick={handleClick}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        whileTap={{ scale: 0.9 }}
        id="shy-button"
      >
        {caught ? '😤 ' : ''}{label}
      </motion.button>

      {/* Dodge count indicator */}
      {dodgeCount > 0 && !caught && (
        <motion.p
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-white/30 whitespace-nowrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Attempts: {dodgeCount}/6
        </motion.p>
      )}

      {/* Caught message */}
      <AnimatePresence>
        {caughtMsg && (
          <motion.p
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-white/50 whitespace-nowrap"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {caughtMsg}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
