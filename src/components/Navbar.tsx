import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  scrollFraction: number;
}

export default function Navbar({ scrollFraction }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [rotationDeg, setRotationDeg] = useState(0);
  const [navLinks] = useState(['Features', 'Pricing', 'Team', 'FAQ']);
  const [clickedLink, setClickedLink] = useState('');
  const [showFakeLoad, setShowFakeLoad] = useState(false);

  // Only show navbar after hero fades (>8% scroll)
  const visible = scrollFraction > 0.06;
  const bgOpacity = Math.min(0.95, (scrollFraction - 0.06) * 8);

  // Dark mode toggle → rotates the entire page instead!
  const handleDarkMode = () => {
    setDarkMode(!darkMode);
    const newRotation = rotationDeg + 180;
    setRotationDeg(newRotation);
    document.documentElement.style.transition = 'transform 0.8s cubic-bezier(0.68,-0.55,0.27,1.55)';
    document.documentElement.style.transform = `rotate(${newRotation}deg)`;
    setTimeout(() => {
      document.documentElement.style.transition = 'transform 1.2s ease';
      document.documentElement.style.transform = 'rotate(0deg)';
    }, 1500);
  };

  // Nav link click → fake loading screen then scroll to nowhere useful
  const handleNavClick = (link: string) => {
    setClickedLink(link);
    setShowFakeLoad(true);
    setTimeout(() => {
      setShowFakeLoad(false);
      // Scroll to a random position — never the right section
      const randomOffset = 500 + Math.random() * 2000;
      window.scrollTo({ top: randomOffset, behavior: 'smooth' });
    }, 2000 + Math.random() * 1500);
  };

  if (!visible) return null;

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 right-0 flex items-center justify-between px-6 py-3"
        style={{
          zIndex: 100,
          background: `rgba(0,0,0,${bgOpacity})`,
          backdropFilter: 'blur(20px) saturate(1.4)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
        initial={{ y: -60 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-white text-lg font-medium tracking-[-0.5px]">
            NEXUS<span className="font-serif italic text-white/40">™</span>
          </span>
          <span className="text-[9px] bg-white/10 text-white/40 px-2 py-0.5 rounded-full uppercase tracking-wider">
            beta
          </span>
        </div>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <button
              key={link}
              className="text-sm text-white/50 hover:text-white transition-colors"
              onClick={() => handleNavClick(link)}
            >
              {link}
            </button>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Dark mode toggle — troll */}
          <motion.button
            className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-white/40 hover:text-white/80 hover:border-white/20 transition-all"
            onClick={handleDarkMode}
            whileTap={{ scale: 0.9, rotate: 180 }}
            title="Toggle dark mode"
          >
            {darkMode ? '☀️' : '🌙'}
          </motion.button>

          {/* CTA */}
          <motion.button
            className="px-4 py-2 bg-white text-black text-xs font-semibold rounded-lg tracking-wider uppercase"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            Sign Up
          </motion.button>
        </div>
      </motion.nav>

      {/* Fake page loading overlay */}
      <AnimatePresence>
        {showFakeLoad && (
          <motion.div
            className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center"
            style={{ zIndex: 200 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center gap-2 mb-4">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-white"
                  animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                />
              ))}
            </div>
            <p className="text-white/40 text-sm">Loading {clickedLink}...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
