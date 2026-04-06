import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { playHover, playTroll } from '../../utils/sounds';

const ORIGINALS = [
  { name: 'Sarah Chen', role: 'CEO at TechFlow', text: 'NEXUS transformed how our team collaborates. We ship 3x faster now.', rating: 5 },
  { name: 'Marcus Rivera', role: 'Lead Designer at Pixel', text: 'The AI insights alone saved us 200+ hours last quarter. Incredible tool.', rating: 5 },
  { name: 'Aisha Patel', role: 'VP Engineering at Scale', text: 'After evaluating 30+ tools, NEXUS was the clear winner. Best-in-class security.', rating: 5 },
  { name: 'Tom Anderson', role: 'Founder at LaunchPad', text: 'We went from idea to launch in 2 weeks using NEXUS. Game changer.', rating: 5 },
];

const MORPHED_TEXTS = [
  'NEXUS transformed how our team argues. We break things 3x faster now.',
  'The AI hallucinations alone wasted 200+ hours last quarter. Incredible waste.',
  'After evaluating 30+ tools, we couldn\'t close any of the browser tabs. Best-in-class chaos.',
  'We went from idea to burnout in 2 weeks using NEXUS. Life changer.',
];

interface TestimonialsSectionProps {
  isActive: boolean;
}

export default function TestimonialsSection({ isActive }: TestimonialsSectionProps) {
  const [testimonials, setTestimonials] = useState(ORIGINALS);
  const [morphed, setMorphed] = useState(false);
  const [hoverCount, setHoverCount] = useState(0);

  // TROLL: After 3 hovers, text morphs into sarcastic versions
  const handleHover = useCallback(() => {
    if (!isActive || morphed) return;
    setHoverCount(prev => {
      const next = prev + 1;
      if (next >= 3) {
        setMorphed(true);
        playTroll();
        setTestimonials(ORIGINALS.map((t, i) => ({
          ...t,
          text: MORPHED_TEXTS[i],
          rating: Math.max(1, 5 - i), // Ratings also decrease
        })));
      } else {
        playHover();
      }
      return next;
    });
  }, [isActive, morphed]);

  return (
    <section className="relative py-24 px-6" id="testimonials-section">
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <p className="text-[10px] tracking-[6px] uppercase text-white/25 mb-4">Testimonials</p>
        <h2 className="section-heading text-4xl font-medium text-white tracking-tight">
          Loved by <span className="font-serif italic text-white/60">thousands.</span>
        </h2>
      </motion.div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            className="liquid-glass rounded-2xl p-6 group"
            onMouseEnter={handleHover}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            {/* Stars */}
            <div className="flex gap-0.5 mb-4">
              {[...Array(5)].map((_, s) => (
                <span key={s} className={`text-sm ${s < t.rating ? 'opacity-100' : 'opacity-10'}`}>
                  ⭐
                </span>
              ))}
            </div>

            {/* Quote */}
            <p className="text-white/60 text-sm leading-relaxed mb-5 min-h-[60px] transition-all duration-500">
              "{t.text}"
            </p>

            {/* Author */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center text-sm font-medium text-white/60">
                {t.name.charAt(0)}
              </div>
              <div>
                <p className="text-white/80 text-sm font-medium">{t.name}</p>
                <p className="text-white/25 text-xs">{t.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
