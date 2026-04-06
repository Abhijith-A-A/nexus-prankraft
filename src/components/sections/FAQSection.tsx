import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playClick } from '../../utils/sounds';

const QUESTIONS = [
  {
    q: 'What is NEXUS?',
    answers: [
      'NEXUS is a next-generation collaborative platform designed for modern teams.',
      'NEXUS is a state-of-the-art procrastination engine disguised as productivity software.',
      'We\'re not entirely sure anymore. It started as a to-do list and evolved into... this.',
      'NEXUS is whatever you need it to be. Just like that ex who kept changing.',
    ],
  },
  {
    q: 'Is my data secure?',
    answers: [
      'Absolutely. We use AES-256 encryption, SOC2 compliance, and regular security audits.',
      'Your data is stored in a vault guarded by three caffeinated interns.',
      'Define "secure." Technically, shouting passwords is air-gapped communication.',
      'We haven\'t been hacked yet. Emphasis on "yet."',
    ],
  },
  {
    q: 'Can I cancel anytime?',
    answers: [
      'Yes! Cancel anytime with no questions asked. It\'s that simple.',
      'You can try. The button is around here somewhere.',
      'Technically yes, but our cancellation flow has 47 steps and a CAPTCHA.',
      'We prefer the term "permanent commitment with flexible crying."',
    ],
  },
  {
    q: 'Do you offer a free trial?',
    answers: [
      'Yes, enjoy a 14-day free trial with full access to all Pro features.',
      'The free trial starts now and ends before you finish reading this sentence.',
      'Our free trial is free in the same way "free" parking at the airport is "free."',
      'Sure! *rubs hands together* Sure we do.',
    ],
  },
  {
    q: 'How does AI integration work?',
    answers: [
      'Our AI analyzes team patterns and suggests workflow optimizations automatically.',
      'You give us your data. We give it to a very smart parrot. The parrot speaks.',
      'It works exactly like regular software, except we added the word "AI" to the pricing page.',
      'Step 1: AI. Step 2: ???. Step 3: Profit.',
    ],
  },
];

interface FAQSectionProps {
  isActive: boolean;
}

export default function FAQSection({ isActive }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState(-1);
  const [answerIndices, setAnswerIndices] = useState(QUESTIONS.map(() => 0));
  const [clickCounts, setClickCounts] = useState(QUESTIONS.map(() => 0));

  // TROLL: Each time you open a question, the answer changes
  const handleToggle = useCallback((index: number) => {
    playClick();
    if (openIndex === index) {
      setOpenIndex(-1);
      return;
    }
    setOpenIndex(index);

    if (!isActive) return;

    setClickCounts(prev => {
      const next = [...prev];
      next[index]++;

      // After 2nd click, start cycling through sarcastic answers
      if (next[index] > 1) {
        setAnswerIndices(prevAns => {
          const nextAns = [...prevAns];
          nextAns[index] = Math.min(next[index] - 1, QUESTIONS[index].answers.length - 1);
          return nextAns;
        });
      }
      return next;
    });
  }, [openIndex, isActive]);

  return (
    <section className="relative py-24 px-6" id="faq-section">
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <p className="text-[10px] tracking-[6px] uppercase text-white/25 mb-4">FAQ</p>
        <h2 className="section-heading text-4xl font-medium text-white tracking-tight">
          Got <span className="font-serif italic text-white/60">questions?</span>
        </h2>
      </motion.div>

      <div className="max-w-2xl mx-auto space-y-3">
        {QUESTIONS.map((item, i) => (
          <motion.div
            key={i}
            className="liquid-glass rounded-2xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
          >
            <button
              className="w-full px-6 py-5 flex items-center justify-between text-left group"
              onClick={() => handleToggle(i)}
            >
              <span className="text-white/70 text-sm font-medium group-hover:text-white transition-colors">
                {item.q}
              </span>
              <motion.span
                className="text-white/30 text-lg"
                animate={{ rotate: openIndex === i ? 45 : 0 }}
                transition={{ duration: 0.2 }}
              >
                +
              </motion.span>
            </button>

            <AnimatePresence>
              {openIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="px-6 pb-5">
                    <motion.p
                      key={answerIndices[i]}
                      className="text-white/35 text-sm leading-relaxed"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {item.answers[answerIndices[i]]}
                    </motion.p>
                    {answerIndices[i] > 0 && (
                      <p className="text-[10px] text-white/10 mt-2 italic">
                        Wait, did the answer just change?
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
