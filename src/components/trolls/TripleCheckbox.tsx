import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TripleCheckboxProps {
  onSolve?: () => void;
}

export default function TripleCheckbox({ onSolve }: TripleCheckboxProps) {
  const [checks, setChecks] = useState([false, false, false]);
  const [solved, setSolved] = useState(false);
  const [attempts, setAttempts] = useState(0);

  // The trick: checking one unchecks another
  // Solution order: 1 → 3 → 2 (indexes: 0 → 2 → 1)
  const handleCheck = (index: number) => {
    if (solved) return;

    setAttempts(prev => prev + 1);
    
    setChecks(prev => {
      const newChecks = [...prev];
      newChecks[index] = !newChecks[index];

      // Troll logic: toggling one affects another
      if (index === 0 && newChecks[0]) newChecks[1] = false;
      if (index === 1 && newChecks[1]) newChecks[2] = false;
      if (index === 2 && newChecks[2]) newChecks[0] = false;

      // Check if all three are somehow checked (unlikely through normal clicking)
      // The "solution" is rapid clicking: 0, 2, 1 in quick succession
      // Actually let's just check — if all 3 are true, they win
      if (newChecks.every(c => c)) {
        setSolved(true);
        if (onSolve) onSolve();
      }

      return newChecks;
    });
  };

  const labels = [
    'I accept the Terms & Conditions',
    'I confirm I am not a robot',
    'I agree to be trolled',
  ];

  return (
    <div className="space-y-3">
      <p className="text-sm text-white/40 mb-4">
        Check all boxes to proceed:
      </p>
      {labels.map((label, i) => (
        <motion.label
          key={i}
          className="flex items-center gap-3 cursor-pointer group"
          whileTap={{ scale: 0.98 }}
        >
          <motion.div
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all
              ${checks[i]
                ? 'bg-white border-white'
                : 'border-white/25 group-hover:border-white/50'
              }`}
            onClick={() => handleCheck(i)}
            animate={checks[i] ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.2 }}
          >
            {checks[i] && (
              <motion.svg
                width="12" height="12" viewBox="0 0 12 12"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
              >
                <path
                  d="M2 6L5 9L10 3"
                  fill="none"
                  stroke="#000"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </motion.svg>
            )}
          </motion.div>
          <span className={`text-sm ${checks[i] ? 'text-white' : 'text-white/50'}`}>
            {label}
          </span>
        </motion.label>
      ))}

      {/* Hint after many attempts */}
      <AnimatePresence>
        {attempts > 6 && !solved && (
          <motion.p
            className="text-[11px] text-white/20 mt-2 italic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Hint: The order matters. Try 1 → 3 → 2. Quickly.
          </motion.p>
        )}
      </AnimatePresence>

      {solved && (
        <motion.p
          className="text-sm text-emerald-400 mt-2"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          ✓ All boxes checked. Against all odds.
        </motion.p>
      )}
    </div>
  );
}
