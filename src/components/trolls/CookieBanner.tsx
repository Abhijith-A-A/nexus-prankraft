import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CookieBannerProps {
  visible: boolean;
}

export default function CookieBanner({ visible }: CookieBannerProps) {
  const [show, setShow] = useState(false);
  const [swapped, setSwapped] = useState(false);
  const [dismissAttempts, setDismissAttempts] = useState(0);
  const [message, setMessage] = useState('We use cookies to enhance your experience. By continuing, you agree to our cookie policy.');

  const MESSAGES = [
    'We use cookies to enhance your experience. By continuing, you agree to our cookie policy.',
    'Hmm, that didn\'t work. Try the other button?',
    'Getting warmer... or are you?',
    'We admire your persistence. The cookies admire you too.',
    'Fine. We\'ll stop using cookies. We\'ll use cake instead.',
    'This banner is load-bearing. If you remove it, the website collapses.',
    'You\'ve clicked this more times than our CEO clicks "Reply All."',
    'At this point, the cookies are using YOU.',
  ];

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleClick = (button: 'accept' | 'decline') => {
    setDismissAttempts(prev => {
      const next = prev + 1;

      // Swap buttons every other click
      setSwapped(s => !s);

      // Update message
      setMessage(MESSAGES[Math.min(next, MESSAGES.length - 1)]);

      // Briefly hide then show again (fake dismiss)
      if (next % 3 === 0) {
        setShow(false);
        setTimeout(() => {
          setShow(true);
          setMessage('Miss me? 🍪');
        }, 1500);
      }

      return next;
    });
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 p-4"
          style={{ zIndex: 90 }}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
        >
          <div
            className="max-w-2xl mx-auto rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4"
            style={{
              background: 'rgba(20,20,20,0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div className="flex-1">
              <p className="text-white/60 text-sm leading-relaxed">
                🍪 {message}
              </p>
              {dismissAttempts > 2 && (
                <p className="text-[10px] text-white/15 mt-1">
                  Attempts: {dismissAttempts}
                </p>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <motion.button
                className={`px-5 py-2 rounded-lg text-xs font-semibold tracking-wider transition-all ${
                  swapped
                    ? 'bg-white text-black hover:bg-white/90'
                    : 'border border-white/15 text-white/40 hover:text-white/60'
                }`}
                onClick={() => handleClick('decline')}
                whileTap={{ scale: 0.95 }}
                layout
              >
                {swapped ? 'Accept All' : 'Decline'}
              </motion.button>
              <motion.button
                className={`px-5 py-2 rounded-lg text-xs font-semibold tracking-wider transition-all ${
                  !swapped
                    ? 'bg-white text-black hover:bg-white/90'
                    : 'border border-white/15 text-white/40 hover:text-white/60'
                }`}
                onClick={() => handleClick('accept')}
                whileTap={{ scale: 0.95 }}
                layout
              >
                {!swapped ? 'Accept All' : 'Decline'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
