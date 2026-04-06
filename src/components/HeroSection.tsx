import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users } from 'lucide-react';
import { WRONG_BUTTON_MESSAGES } from '../utils/constants';
import { playClick } from '../utils/sounds';

interface HeroSectionProps {
  scrollFraction: number;
  onEmailSubmit: (email: string) => void;
}

export default function HeroSection({ scrollFraction, onEmailSubmit }: HeroSectionProps) {
  const [email, setEmail] = useState('');
  const [wrongMsg, setWrongMsg] = useState('');
  const [showWrongMsg, setShowWrongMsg] = useState(false);
  const [correctBtnIndex] = useState(() => Math.floor(Math.random() * 3));

  // Hero fades out between 5-15% scroll
  const heroOpacity = Math.max(0, 1 - scrollFraction * 12);

  // Color transition: BLACK -> WHITE as background darkens
  // scrollFraction 0 = white bg = need BLACK text
  // scrollFraction 0.08+ = darkening bg = need WHITE text
  const t = Math.min(1, scrollFraction * 14); // 0→1 over first ~7% scroll

  // Text goes from BLACK (0,0,0) to WHITE (255,255,255)
  const textR = Math.round(t * 255);
  const textColor = `rgb(${textR}, ${textR}, ${textR})`;
  // Inverted for button backgrounds
  const invertR = Math.round((1 - t) * 255);
  const invertedTextColor = `rgb(${invertR}, ${invertR}, ${invertR})`;
  // Subtitle with reduced opacity
  const subtitleColor = `rgba(${textR}, ${textR}, ${textR}, 0.55)`;

  const handleWrongButton = () => {
    playClick();
    const msg = WRONG_BUTTON_MESSAGES[Math.floor(Math.random() * WRONG_BUTTON_MESSAGES.length)];
    setWrongMsg(msg);
    setShowWrongMsg(true);
    setTimeout(() => setShowWrongMsg(false), 2000);
  };

  const handleCorrectButton = () => {
    playClick();
    window.scrollTo({ top: window.innerHeight * 1.5, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onEmailSubmit(email);
    }
  };

  if (heroOpacity <= 0) return null;

  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center px-6"
      style={{
        opacity: heroOpacity,
        pointerEvents: heroOpacity > 0.1 ? 'auto' : 'none',
        zIndex: 10,
      }}
    >
      {/* Avatar Stack */}
      <motion.div
        className="flex items-center gap-3 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <div className="flex -space-x-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-semibold"
              style={{
                borderColor: `rgba(${textR}, ${textR}, ${textR}, 0.15)`,
                background: `rgba(${textR}, ${textR}, ${textR}, ${0.05 + i * 0.03})`,
                color: textColor,
              }}
            >
              <Users size={14} />
            </div>
          ))}
        </div>
        <span className="text-sm font-medium" style={{ color: subtitleColor }}>
          2,847 people already joined
        </span>
      </motion.div>

      {/* Main Heading */}
      <motion.h1
        className="section-heading text-5xl md:text-7xl lg:text-8xl font-medium tracking-[-2px] text-center leading-[0.95] mb-5"
        style={{ color: textColor }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.7 }}
      >
        Where great minds
        <br />
        <span className="font-serif italic">connect.</span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="section-subtext text-lg md:text-xl max-w-lg text-center mb-10 font-light"
        style={{ color: subtitleColor }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
      >
        The collaborative platform that brings minds together.
      </motion.p>

      {/* Liquid Glass Email Form */}
      <motion.form
        onSubmit={handleSubmit}
        className="rounded-full p-2 max-w-lg w-full flex items-center gap-2"
        style={{
          background: t < 0.5 ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)',
          border: `1px solid rgba(${textR}, ${textR}, ${textR}, 0.12)`,
          backdropFilter: 'blur(24px) saturate(1.2)',
          boxShadow: t < 0.5
            ? '0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.5)'
            : '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.6 }}
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email to join"
          className="flex-1 bg-transparent px-4 py-3 text-sm outline-none placeholder:opacity-40"
          style={{ color: textColor, caretColor: textColor }}
          id="hero-email-input"
        />
        <motion.button
          type="submit"
          className="rounded-full px-8 py-3 text-sm font-semibold tracking-wide whitespace-nowrap"
          style={{ background: textColor, color: invertedTextColor }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          id="hero-subscribe-btn"
        >
          JOIN NEXUS
        </motion.button>
      </motion.form>

      {/* Triple CTA Buttons — TROLL #1 */}
      <motion.div
        className="flex gap-4 mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.6 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.button
            key={i}
            className="px-6 py-3 text-xs font-semibold tracking-[2px] uppercase rounded-lg border transition-all"
            style={{
              borderColor: `rgba(${textR}, ${textR}, ${textR}, 0.15)`,
              color: textColor,
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={i === correctBtnIndex ? handleCorrectButton : handleWrongButton}
            id={`cta-btn-${i}`}
          >
            GET STARTED
          </motion.button>
        ))}
      </motion.div>

      {/* Wrong Button Message */}
      <AnimatePresence>
        {showWrongMsg && (
          <motion.div
            className="mt-4 px-4 py-2 rounded-full text-sm font-medium"
            style={{
              background: `rgba(${textR}, ${textR}, ${textR}, 0.08)`,
              color: textColor,
            }}
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
          >
            {wrongMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
