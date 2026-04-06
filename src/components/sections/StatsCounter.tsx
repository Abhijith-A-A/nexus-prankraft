import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const STATS = [
  { label: 'Active Users', target: 10400000, suffix: '', prefix: '' },
  { label: 'Uptime', target: 99.97, suffix: '%', prefix: '' },
  { label: 'Countries', target: 152, suffix: '', prefix: '' },
  { label: 'Messages Sent', target: 2800000000, suffix: '', prefix: '' },
];

interface StatsCounterProps {
  isActive: boolean;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  if (n % 1 !== 0) return n.toFixed(2);
  return n.toString();
}

export default function StatsCounter({ isActive }: StatsCounterProps) {
  const [values, setValues] = useState(STATS.map(s => s.target));
  const intervalRef = useRef<number>(0);
  const tickRef = useRef(0);

  // TROLL: After initially showing correct numbers, they slowly count DOWN
  useEffect(() => {
    if (!isActive) return;

    // Wait 3 seconds of "trust" then start decrementing
    const startTimer = setTimeout(() => {
      intervalRef.current = window.setInterval(() => {
        tickRef.current++;
        setValues(prev => prev.map((val, i) => {
          const stat = STATS[i];
          // Decrease by a visible but not alarming amount
          if (stat.suffix === '%') {
            return Math.max(0, val - 0.01 * (1 + tickRef.current * 0.2));
          }
          const decrease = stat.target * 0.001 * (1 + tickRef.current * 0.05);
          return Math.max(0, val - decrease);
        }));
      }, 800);
    }, 3000);

    return () => {
      clearTimeout(startTimer);
      clearInterval(intervalRef.current);
    };
  }, [isActive]);

  return (
    <section className="relative py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="liquid-glass rounded-3xl p-8 grid grid-cols-2 md:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {STATS.map((stat, i) => (
            <div key={i} className="text-center">
              <motion.p
                className="text-3xl md:text-4xl font-bold text-white tabular-nums"
                animate={isActive && values[i] < stat.target * 0.9 ? { color: ['#ffffff', '#ff4444', '#ffffff'] } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                {stat.prefix}{formatNumber(values[i])}{stat.suffix}
              </motion.p>
              <p className="text-white/25 text-xs tracking-[3px] uppercase mt-2">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
