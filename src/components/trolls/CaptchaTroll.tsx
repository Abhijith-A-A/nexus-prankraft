import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playError } from '../../utils/sounds';

// ══════════════════════════════════════════
// CAPTCHA TROLL
// Looks like a real CAPTCHA but impossible
// "Select all images with traffic lights"
// but images are ambiguous / change after selection
// ══════════════════════════════════════════

interface CaptchaTrollProps {
  visible: boolean;
  onDismiss: () => void;
}

const PROMPTS = [
  'Select all images with traffic lights',
  'Select all images with crosswalks',
  'Select all images that spark joy',
  'Select all images you find personally threatening',
  'Select all images that contain the meaning of life',
  'Click on the images that are secretly watching you',
];

// We use colored gradient squares that look like blurry photos
const CELL_COLORS = [
  ['#3a5a3a', '#556b2f'], // green (traffic light?)
  ['#8b4513', '#654321'], // brown
  ['#4a4a6a', '#2f2f4f'], // blue/grey
  ['#6b3a3a', '#8b2500'], // red (traffic light?)
  ['#4a6a4a', '#2f5f2f'], // green
  ['#5a5a5a', '#3a3a3a'], // grey
  ['#7a5a3a', '#5a3a1a'], // amber (traffic light?)
  ['#3a4a6a', '#2a3a5a'], // blue
  ['#6a6a3a', '#4a4a1a'], // yellow (traffic light?)
];

export default function CaptchaTroll({ visible, onDismiss }: CaptchaTrollProps) {
  const [promptIdx, setPromptIdx] = useState(0);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [attempts, setAttempts] = useState(0);
  const [message, setMessage] = useState('');
  const [cellSeed, setCellSeed] = useState(0);
  const [verifying, setVerifying] = useState(false);

  const handleCellClick = (idx: number) => {
    if (verifying) return;
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleVerify = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setAttempts(a => a + 1);
      playError();

      if (attempts >= 3) {
        setMessage('*sigh* Fine. You pass. (You didn\'t.)');
        setTimeout(onDismiss, 2000);
      } else {
        const messages = [
          'Incorrect. Please try again.',
          'Still wrong. Are you a robot?',
          'Nope. Maybe you ARE a robot.',
          'Last chance. Just kidding, there are infinite chances.',
        ];
        setMessage(messages[Math.min(attempts, messages.length - 1)]);
        // Scramble everything
        setPromptIdx(p => (p + 1) % PROMPTS.length);
        setSelected(new Set());
        setCellSeed(s => s + 1);
      }
    }, 1500);
  };

  if (!visible) return null;

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 70, background: 'rgba(0,0,0,0.7)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-lg overflow-hidden shadow-2xl max-w-xs w-full"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
      >
        {/* Blue header (reCAPTCHA style) */}
        <div className="bg-[#4a90d9] px-4 py-3 relative">
          <button 
            className="absolute top-2 right-3 text-white/70 hover:text-white text-lg leading-none"
            onClick={onDismiss}
            aria-label="Close"
          >
            ×
          </button>
          <p className="text-white text-sm font-medium pr-6">{PROMPTS[promptIdx]}</p>
          <p className="text-white/60 text-[10px] mt-0.5">
            Click verify when done
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 gap-0.5 p-0.5 bg-gray-200">
          {[...Array(9)].map((_, i) => {
            const colors = CELL_COLORS[(i + cellSeed) % CELL_COLORS.length];
            return (
              <motion.button
                key={`${i}-${cellSeed}`}
                className="aspect-square relative"
                style={{
                  background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
                }}
                onClick={() => handleCellClick(i)}
                whileTap={{ scale: 0.95 }}
              >
                {/* Fake image details */}
                <div className="absolute inset-0 overflow-hidden opacity-30">
                  <div className="absolute w-2 h-12 bg-black/30 left-1/2 top-0" />
                  <div className="absolute w-full h-1 bg-white/20 top-1/3" />
                </div>
                {/* Selection overlay */}
                {selected.has(i) && (
                  <motion.div
                    className="absolute inset-0 bg-blue-500/40 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <span className="text-white text-2xl">✓</span>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2">
            <img
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Ctext y='18' font-size='16'%3E🔒%3C/text%3E%3C/svg%3E"
              alt=""
              className="w-5 h-5"
            />
            <div>
              <p className="text-[9px] text-gray-400">reCAPTCHA</p>
              <p className="text-[7px] text-gray-300">Privacy - Terms</p>
            </div>
          </div>
          <button
            className={`px-4 py-2 rounded text-sm font-medium transition-all ${
              verifying
                ? 'bg-gray-300 text-gray-500'
                : 'bg-[#4a90d9] text-white hover:bg-[#3a7bc8]'
            }`}
            onClick={handleVerify}
            disabled={verifying}
          >
            {verifying ? 'Verifying...' : 'VERIFY'}
          </button>
        </div>

        {/* Error message */}
        {message && (
          <motion.p
            className="px-3 py-2 text-xs text-red-600 bg-red-50 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {message}
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  );
}
