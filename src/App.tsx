import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Core
import LoadingScreen from './components/LoadingScreen';
import CanvasBackground from './components/CanvasBackground';
import HeroSection from './components/HeroSection';
import Navbar from './components/Navbar';

// Content Sections
import FeaturesSection from './components/sections/FeaturesSection';
import StatsCounter from './components/sections/StatsCounter';
import TestimonialsSection from './components/sections/TestimonialsSection';
import PricingSection from './components/sections/PricingSection';
import FAQSection from './components/sections/FAQSection';
import FooterSection from './components/sections/FooterSection';

// Troll Overlays
import PhantomCursors from './components/trolls/PhantomCursors';
import CookieBanner from './components/trolls/CookieBanner';
import ChatWidget from './components/trolls/ChatWidget';
import NotificationToasts from './components/trolls/NotificationToasts';
import DinoGame from './components/trolls/DinoGame';
import FakeDisconnect from './components/trolls/FakeDisconnect';
import CountdownTimer from './components/trolls/CountdownTimer';
import CaptchaTroll from './components/trolls/CaptchaTroll';

import { preloadFrames } from './utils/frameLoader';
import { initAudio } from './utils/sounds';

export default function App() {
  const [frames, setFrames] = useState<HTMLImageElement[]>([]);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrollFraction, setScrollFraction] = useState(0);
  const [phantomCount, setPhantomCount] = useState(0);
  const [trollsActive, setTrollsActive] = useState(false);

  // New Troll States
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaDismissed, setCaptchaDismissed] = useState(false);
  const [showDisconnect, setShowDisconnect] = useState(false);
  const [showDino, setShowDino] = useState(false);
  const [dinoDismissed, setDinoDismissed] = useState(false);

  const lastScrollRef = useRef(0);

  // ═══════════════════════════════════════════
  // Init
  // ═══════════════════════════════════════════
  useEffect(() => {
    initAudio(); // Hook up user interaction listeners globally
    preloadFrames((fraction) => setLoadProgress(fraction))
      .then((loadedFrames) => {
        setFrames(loadedFrames);
        setTimeout(() => setIsLoaded(true), 600);
      });
  }, []);

  // ═══════════════════════════════════════════
  // Scroll Tracking
  // ═══════════════════════════════════════════
  useEffect(() => {
    let ticking = false;
    const update = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) { ticking = false; return; }

      const fraction = Math.max(0, Math.min(1, scrollY / maxScroll));
      lastScrollRef.current = scrollY;
      setScrollFraction(fraction);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ═══════════════════════════════════════════
  // Trolls by sequence
  // ═══════════════════════════════════════════
  useEffect(() => {
    // Phantom cursors
    if (scrollFraction < 0.08) {
      setPhantomCount(0);
      setTrollsActive(false);
    } else if (scrollFraction < 0.20) {
      setPhantomCount(1);
      setTrollsActive(false);
    } else if (scrollFraction < 0.40) {
      setPhantomCount(3);
      setTrollsActive(true);
    } else if (scrollFraction < 0.70) {
      setPhantomCount(5);
    } else if (scrollFraction < 0.90) {
      setPhantomCount(3);
    } else {
      setPhantomCount(0);
    }

    // Captcha around 85%
    if (scrollFraction > 0.85 && !showCaptcha && !captchaDismissed) {
      setShowCaptcha(true);
    }

    // Final boss: Disconnect at 95%
    if (scrollFraction > 0.95 && !showDisconnect && !showDino && !dinoDismissed) {
      setShowDisconnect(true);
    }

  }, [scrollFraction, showCaptcha, captchaDismissed, showDisconnect, showDino, dinoDismissed]);

  // Tab Title
  useEffect(() => {
    if (showDino) document.title = 'ERR_INTERNET_DISCONNECTED';
    else if (scrollFraction < 0.08) document.title = 'NEXUS™ — Collaborative Platform';
    else if (scrollFraction < 0.20) document.title = 'NEXUS™ — Wait, who moved my cursor?';
    else if (scrollFraction < 0.40) document.title = 'NEXUS™ — 23 visitors online 👀';
    else if (scrollFraction < 0.60) document.title = 'NEXUS™ — Prices may have changed 💸';
    else if (scrollFraction < 0.80) document.title = 'NEXUS™ — Something feels wrong...';
    else if (scrollFraction < 0.95) document.title = 'NEXUS™ — Are you a robot?';
    else document.title = '🎭 You\'ve been NEXUS\'d';
  }, [scrollFraction, showDino]);

  // ═══════════════════════════════════════════
  // Callbacks
  // ═══════════════════════════════════════════
  const handleEmailSubmit = useCallback((email: string) => {
    // We don't do anything with the email except waste their time
    console.log(email);
  }, []);

  return (
    <div>
      {/* Loading */}
      <LoadingScreen progress={loadProgress} isLoaded={isLoaded} />

      {/* Canvas Background */}
      {isLoaded && <CanvasBackground frames={frames} scrollFraction={scrollFraction} />}

      {/* Dark overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background: `rgba(0,0,0,${Math.min(0.65, scrollFraction * 0.8)})`,
          transition: 'background 0.3s',
        }}
      />

      {/* Navbar */}
      <Navbar scrollFraction={scrollFraction} />

      {/* Hero */}
      {isLoaded && <HeroSection scrollFraction={scrollFraction} onEmailSubmit={handleEmailSubmit} />}

      {/* Scroll indicator */}
      <AnimatePresence>
        {scrollFraction < 0.02 && isLoaded && (
          <motion.div
            className="fixed bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            style={{ zIndex: 15 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 2 }}
          >
            <motion.div className="w-5 h-8 rounded-full border-2 border-black/20 flex items-start justify-center p-1">
              <motion.div
                className="w-1 h-2 bg-black/30 rounded-full"
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              />
            </motion.div>
            <span className="text-[10px] text-black/30 tracking-widest uppercase">Scroll</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT SECTIONS */}
      <div className="relative" style={{ zIndex: 5 }}>
        <div style={{ height: '110vh' }} />

        <FeaturesSection isActive={trollsActive} />
        <StatsCounter isActive={scrollFraction > 0.18} />
        <TestimonialsSection isActive={scrollFraction > 0.30} />
        <PricingSection isActive={scrollFraction > 0.40} />
        <FAQSection isActive={scrollFraction > 0.55} />

        {/* Final CTA */}
        <section className="py-24 px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="section-heading text-4xl md:text-5xl font-medium text-white tracking-tight mb-4">
              Ready to <span className="font-serif italic text-white/60">start?</span>
            </h2>
            <p className="section-subtext text-white/30 text-base mb-8 max-w-md mx-auto">
              Join 10 million teams already using NEXUS. Or don't. We'll add you anyway.
            </p>
            <motion.button
              className="px-8 py-4 bg-white text-black text-sm font-bold rounded-xl tracking-wider uppercase"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCaptcha(true)} // Clicking triggers captcha again
            >
              Get Started For Free*
            </motion.button>
            <p className="section-subtext text-[10px] text-white/10 mt-3">*Terms and sanity may apply</p>
          </motion.div>
        </section>

        <FooterSection />

        {/* Empty space at the bottom to trigger disconnect */}
        <section className="py-32" />
      </div>

      {/* OVERLAY TROLLS */}
      {phantomCount > 0 && <PhantomCursors count={phantomCount} />}
      <CookieBanner visible={scrollFraction > 0.15} />
      <ChatWidget visible={scrollFraction > 0.25} />
      <NotificationToasts active={scrollFraction > 0.10} />
      <CountdownTimer visible={scrollFraction > 0.50} />

      {/* High-level sequence blockers */}
      <AnimatePresence>
        {showCaptcha && (
          <CaptchaTroll
            visible={showCaptcha}
            onDismiss={() => {
              setShowCaptcha(false);
              setCaptchaDismissed(true);
            }}
          />
        )}
      </AnimatePresence>

      <FakeDisconnect trigger={showDisconnect} onShowDino={() => setShowDino(true)} />
      <AnimatePresence>
        {showDino && (
          <DinoGame 
            visible={showDino} 
            onDismiss={() => {
              setShowDino(false);
              setDinoDismissed(true);
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
