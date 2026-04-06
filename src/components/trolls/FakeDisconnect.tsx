import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ══════════════════════════════════════════
// FAKE DISCONNECT
// Brief "connection lost" overlay, then recovers
// Triggers the dino game
// ══════════════════════════════════════════

interface FakeDisconnectProps {
  trigger: boolean;
  onShowDino: () => void;
}

export default function FakeDisconnect({ trigger, onShowDino }: FakeDisconnectProps) {
  const [show, setShow] = useState(false);
  const [phase, setPhase] = useState<'glitch' | 'disconnect' | 'dino'>('glitch');

  useEffect(() => {
    if (!trigger) return;
    // Glitch first
    setShow(true);
    setPhase('glitch');

    setTimeout(() => setPhase('disconnect'), 300);
    setTimeout(() => {
      setPhase('dino');
      onShowDino();
      setShow(false);
    }, 2500);
  }, [trigger]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center"
          style={{ zIndex: 150 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {phase === 'glitch' && (
            <motion.div
              className="fixed inset-0 bg-black"
              animate={{
                opacity: [1, 0, 1, 0, 1],
                filter: ['hue-rotate(0deg)', 'hue-rotate(90deg)', 'hue-rotate(180deg)', 'hue-rotate(270deg)', 'hue-rotate(0deg)'],
              }}
              transition={{ duration: 0.3 }}
            />
          )}
          {phase === 'disconnect' && (
            <motion.div className="fixed inset-0 bg-black flex flex-col items-center justify-center">
              <motion.div
                className="text-5xl mb-4 opacity-60"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                📡
              </motion.div>
              <p className="text-white/50 text-sm">No internet connection</p>
              <p className="text-white/20 text-xs mt-1">ERR_INTERNET_DISCONNECTED</p>
              <div className="flex gap-2 mt-4">
                <motion.div className="w-1.5 h-1.5 rounded-full bg-white/30"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                />
                <motion.div className="w-1.5 h-1.5 rounded-full bg-white/30"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                />
                <motion.div className="w-1.5 h-1.5 rounded-full bg-white/30"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                />
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
