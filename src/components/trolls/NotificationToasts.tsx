import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NOTIFICATIONS = [
  { text: '🎉 Someone in Mumbai just subscribed!', delay: 5000 },
  { text: '🔥 NEXUS is trending on Product Hunt', delay: 12000 },
  { text: '👀 47 people are viewing this page', delay: 20000 },
  { text: '⚡ New feature: AI-powered coffee ordering', delay: 28000 },
  { text: '🏆 You\'re our 10,000th visitor today!', delay: 35000 },
  { text: '📧 Your free trial ends in -3 days', delay: 42000 },
  { text: '🤖 Our AI just became self-aware', delay: 50000 },
  { text: '🍕 Someone in Tokyo ordered pizza through NEXUS', delay: 58000 },
  { text: '⚠️ Warning: Excessive scrolling detected', delay: 65000 },
  { text: '💀 Your cursor has been reported for suspicious activity', delay: 75000 },
];

interface NotificationToastsProps {
  active: boolean;
}

export default function NotificationToasts({ active }: NotificationToastsProps) {
  const [visibleToasts, setVisibleToasts] = useState<Array<{ id: number; text: string }>>([]);
  const [nextId, setNextId] = useState(0);

  useEffect(() => {
    if (!active) return;

    const timers = NOTIFICATIONS.map((notif, i) => {
      return setTimeout(() => {
        const id = Date.now() + i;
        setVisibleToasts(prev => [...prev.slice(-2), { id, text: notif.text }]);
        // Auto-remove after 4 seconds
        setTimeout(() => {
          setVisibleToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
      }, notif.delay);
    });

    return () => timers.forEach(clearTimeout);
  }, [active]);

  return (
    <div className="fixed top-16 left-5 flex flex-col gap-2" style={{ zIndex: 85, maxWidth: '300px' }}>
      <AnimatePresence>
        {visibleToasts.map((toast) => (
          <motion.div
            key={toast.id}
            className="rounded-xl px-4 py-3 text-xs text-white/60"
            style={{
              background: 'rgba(20,20,20,0.92)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
            initial={{ opacity: 0, x: -100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -100, scale: 0.8 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            {toast.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
