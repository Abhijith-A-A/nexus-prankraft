import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { playClick } from '../../utils/sounds';

const PLANS = [
  {
    name: 'Starter',
    basePrice: 0,
    period: 'Free forever',
    features: ['5 team members', '10 projects', 'Basic analytics', 'Email support'],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Pro',
    basePrice: 29,
    period: '/month',
    features: ['Unlimited members', 'Unlimited projects', 'Advanced analytics', 'Priority support', 'AI insights', 'Custom integrations'],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    basePrice: 99,
    period: '/month',
    features: ['Everything in Pro', 'Dedicated account manager', 'Custom SLA', 'On-premise option', 'Audit logs', 'SSO & SAML'],
    cta: 'Contact Sales',
    popular: false,
  },
];

interface PricingSectionProps {
  isActive: boolean;
}

export default function PricingSection({ isActive }: PricingSectionProps) {
  const [prices, setPrices] = useState(PLANS.map(p => p.basePrice));
  const [clickedPlan, setClickedPlan] = useState(-1);
  const intervalRef = useRef<number>(0);
  const tickRef = useRef(0);

  // TROLL: Prices slowly inflate over time
  useEffect(() => {
    if (!isActive) return;

    const startTimer = setTimeout(() => {
      intervalRef.current = window.setInterval(() => {
        tickRef.current++;
        setPrices(prev => prev.map((price, i) => {
          if (PLANS[i].basePrice === 0) {
            // Free plan starts costing money after a while
            if (tickRef.current > 8) return Math.min(49, 0 + tickRef.current - 8);
            return 0;
          }
          // Others inflate
          return Math.round(price + (1 + i * 0.5) * (1 + tickRef.current * 0.1));
        }));
      }, 2000);
    }, 4000);

    return () => {
      clearTimeout(startTimer);
      clearInterval(intervalRef.current);
    };
  }, [isActive]);

  const handlePlanClick = (index: number) => {
    playClick();
    setClickedPlan(index);
    setTimeout(() => {
      setClickedPlan(-1);
      // Scramble prices on click
      setPrices(prev => {
        const shuffled = [...prev].sort(() => Math.random() - 0.5);
        return shuffled;
      });
    }, 1200);
  };

  return (
    <section className="relative py-24 px-6" id="pricing-section">
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <p className="text-[10px] tracking-[6px] uppercase text-white/25 mb-4">Pricing</p>
        <h2 className="section-heading text-4xl font-medium text-white tracking-tight mb-3">
          Simple, <span className="font-serif italic text-white/60">transparent</span> pricing.
        </h2>
        <p className="section-subtext text-white/30 text-sm">No hidden fees. No surprises. Probably.</p>
      </motion.div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
        {PLANS.map((plan, i) => (
          <motion.div
            key={i}
            className={`rounded-2xl p-6 relative ${plan.popular ? 'ring-1 ring-white/20' : ''} liquid-glass`}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.03, y: -5 }}
          >
            {/* Popular badge */}
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-white text-black text-[10px] font-bold rounded-full tracking-wider uppercase">
                Most Popular
              </div>
            )}

            <h3 className="text-white font-medium text-lg mb-1">{plan.name}</h3>

            <div className="flex items-baseline gap-1 mb-1">
              <motion.span
                className="text-4xl font-bold text-white tabular-nums"
                key={prices[i]}
                initial={{ opacity: 0.5, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                ${prices[i]}
              </motion.span>
              <span className="text-white/30 text-sm">{prices[i] === 0 && plan.basePrice === 0 ? '' : plan.period}</span>
            </div>

            {/* Price change warning */}
            {prices[i] > plan.basePrice * 1.5 && plan.basePrice > 0 && (
              <motion.p
                className="text-[10px] text-red-400/60 mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                ⚠️ Price updated due to market conditions
              </motion.p>
            )}
            {plan.basePrice === 0 && prices[i] > 0 && (
              <motion.p
                className="text-[10px] text-red-400/60 mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                ⚠️ Free tier discontinued effective immediately
              </motion.p>
            )}

            <div className="h-px bg-white/10 my-4" />

            <ul className="space-y-3 mb-6">
              {plan.features.map((feat, f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-white/40">
                  <span className="text-white/20">✓</span>
                  {feat}
                </li>
              ))}
            </ul>

            <motion.button
              className={`w-full py-3 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                plan.popular
                  ? 'bg-white text-black hover:bg-white/90'
                  : 'border border-white/15 text-white/60 hover:border-white/30 hover:text-white'
              }`}
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePlanClick(i)}
            >
              {clickedPlan === i ? 'Processing...' : plan.cta}
            </motion.button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
