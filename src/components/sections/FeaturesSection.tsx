import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { playHover } from '../../utils/sounds';

const FEATURES = [
  { icon: '⚡', title: 'Real-time Sync', desc: 'Collaborate with your team in real-time. Changes appear instantly across all devices.' },
  { icon: '🔒', title: 'Enterprise Security', desc: 'Bank-grade encryption with SOC2 compliance. Your data is always protected.' },
  { icon: '🧠', title: 'AI-Powered Insights', desc: 'Machine learning algorithms analyze your workflow and suggest optimizations.' },
  { icon: '📊', title: 'Advanced Analytics', desc: 'Comprehensive dashboards with 50+ metrics to track team performance.' },
  { icon: '🔗', title: 'Seamless Integrations', desc: 'Connect with 200+ tools including Slack, Notion, GitHub, and Figma.' },
  { icon: '🌍', title: 'Global CDN', desc: 'Lightning-fast performance worldwide with edge computing in 150+ regions.' },
];

interface FeaturesSectionProps {
  isActive: boolean;
}

export default function FeaturesSection({ isActive }: FeaturesSectionProps) {
  const [positions, setPositions] = useState(FEATURES.map((_, i) => i));
  const swapCountRef = useRef(0);

  // TROLL: When hovering a card, it swaps position with another random card
  const handleHover = (currentIndex: number) => {
    if (!isActive) return;
    swapCountRef.current++;

    // First 2 hovers are normal, then start swapping
    if (swapCountRef.current < 3) return;

    setPositions(prev => {
      const next = [...prev];
      // Pick a random OTHER card to swap with
      let swapWith = currentIndex;
      while (swapWith === currentIndex) {
        swapWith = Math.floor(Math.random() * FEATURES.length);
      }
      const temp = next[currentIndex];
      next[currentIndex] = next[swapWith];
      next[swapWith] = temp;
      return next;
    });
  };

  return (
    <section className="relative py-24 px-6" id="features-section">
      {/* Section header */}
      <motion.div
        className="text-center mb-16 max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.7 }}
      >
        <p className="text-[10px] tracking-[6px] uppercase text-white/25 mb-4">Why NEXUS</p>
        <h2 className="section-heading text-4xl md:text-5xl font-medium text-white tracking-tight mb-4">
          Everything you need.
          <br />
          <span className="font-serif italic text-white/60">Nothing you'd expect.</span>
        </h2>
        <p className="section-subtext text-white/30 text-base">
          Built for teams that value speed, security, and a little bit of chaos.
        </p>
      </motion.div>

      {/* Feature grid */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {positions.map((featureIdx, gridPos) => {
          const feature = FEATURES[featureIdx];
          return (
            <motion.div
              key={featureIdx}
              className="liquid-glass rounded-2xl p-6 cursor-default group"
              layout
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onMouseEnter={() => { handleHover(gridPos); playHover(); }}
              whileHover={{ scale: 1.02, y: -4 }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-white font-medium text-lg mb-2">{feature.title}</h3>
              <p className="text-white/35 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
