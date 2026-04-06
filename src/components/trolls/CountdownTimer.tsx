import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playTroll } from '../../utils/sounds';

// ══════════════════════════════════════════
// COUNTDOWN TIMER
// "Maintenance in..." that resets and changes reasons
// ══════════════════════════════════════════

interface CountdownTimerProps {
  visible: boolean;
}

const REASONS = [
  'Scheduled maintenance in',
  'Server reboot in',
  'AI uprising begins in',
  'Your free trial expires in',
  'This page self-destructs in',
  'The matrix reloads in',
  'Everything becomes Comic Sans in',
  'We deploy to production in',
];

export default function CountdownTimer({ visible }: CountdownTimerProps) {
  const [show, setShow] = useState(false);
  const [seconds, setSeconds] = useState(30);
  const [reasonIdx, setReasonIdx] = useState(0);
  const [resetCount, setResetCount] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setShow(true), 8000);
    return () => clearTimeout(timer);
  }, [visible]);

  useEffect(() => {
    if (!show || dismissed) return;
    const interval = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          // PSYCH! Reset with new reason
          setResetCount(r => r + 1);
          setReasonIdx(i => (i + 1) % REASONS.length);
          playTroll();
          return 30 + Math.floor(Math.random() * 30);
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [show, dismissed]);

  const handleDismiss = () => {
    setDismissed(true);
    setTimeout(() => {
      setDismissed(false);
      setReasonIdx(i => (i + 1) % REASONS.length);
      setSeconds(15);
    }, 5000); // Comes back after 5 seconds
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          className="fixed top-16 right-5"
          style={{ zIndex: 85 }}
          initial={{ opacity: 0, x: 100, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.8 }}
          transition={{ type: 'spring', damping: 20 }}
        >
          <div
            className="rounded-xl px-4 py-3 max-w-[250px]"
            style={{
              background: 'rgba(20,10,10,0.95)',
              border: '1px solid rgba(255,60,60,0.15)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] text-red-400/60 tracking-wider uppercase mb-1">⚠️ Warning</p>
                <p className="text-xs text-white/50 leading-relaxed">
                  {REASONS[reasonIdx]}
                </p>
                <p className="text-2xl font-bold text-white tabular-nums mt-1">
                  {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}
                </p>
                {resetCount > 0 && (
                  <p className="text-[9px] text-white/15 mt-1">
                    Reset {resetCount} time{resetCount > 1 ? 's' : ''}. It'll happen eventually.
                  </p>
                )}
              </div>
              <button
                className="text-white/20 hover:text-white/40 text-sm shrink-0"
                onClick={handleDismiss}
              >
                ×
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
