import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DecoyFormsProps {
  onValidSubmit: (email: string) => void;
}

export default function DecoyForms({ onValidSubmit }: DecoyFormsProps) {
  const [inputs, setInputs] = useState(['', '', '']);
  const [realFormIndex] = useState(() => 2); // Form 3 is always real, but don't tell them
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showError, setShowError] = useState(false);
  const [splitButton, setSplitButton] = useState(false);
  const [splitCorrect, setSplitCorrect] = useState<number | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [finalEmail, setFinalEmail] = useState('');

  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...inputs];

    if (index === 0) {
      // Form 1: text appears in Form 2 instead (mirror troll)
      newInputs[1] = value;
      newInputs[0] = ''; // Keep form 1 visually empty
    } else if (index === 1) {
      // Form 2: types in reverse
      newInputs[1] = value.split('').reverse().join('');
    } else {
      // Form 3: works correctly
      newInputs[2] = value;
    }

    setInputs(newInputs);
  };

  const handleSubmit = (index: number) => {
    if (index !== realFormIndex) {
      setErrorMsg(index === 0
        ? "Your text went somewhere else. Look around."
        : "Impressive typing, but... backwards?");
      setShowError(true);
      setTimeout(() => setShowError(false), 2500);
      return;
    }

    const email = inputs[realFormIndex];
    if (!email || !email.includes('@')) {
      setErrorMsg("That doesn't look like an email. Try harder.");
      setShowError(true);
      setTimeout(() => setShowError(false), 2000);
      return;
    }

    // Trigger the split button troll
    setFinalEmail(email);
    setSplitButton(true);
    setSplitCorrect(Math.random() > 0.5 ? 0 : 1);
  };

  const handleSplitClick = (index: number) => {
    if (index === splitCorrect) {
      // Show fake confirmation modal
      setShowConfirmModal(true);
    } else {
      // Wrong split — shrink animation handled by component
      setErrorMsg("That one's a decoy. Look at the stable one.");
      setShowError(true);
      setTimeout(() => setShowError(false), 2000);
    }
  };

  const handleConfirm = (button: 'yes' | 'definitely') => {
    if (button === 'yes') {
      setShowConfirmModal(false);
      setErrorMsg("That wasn't enthusiastic enough.");
      setShowError(true);
      setTimeout(() => {
        setShowError(false);
        setShowConfirmModal(true);
      }, 1500);
    } else {
      // Actually submit
      setShowConfirmModal(false);
      setSubmitted(true);
      onValidSubmit(finalEmail);
    }
  };

  if (submitted) {
    return (
      <motion.div
        className="text-center py-12"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <motion.div
          className="text-5xl mb-4"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: 2, duration: 0.3 }}
        >
          📧
        </motion.div>
        <p className="text-white text-lg font-medium">Subscribed!</p>
        <p className="text-white/40 text-sm mt-2">
          That was the hardest email signup in internet history.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      <p className="text-sm text-white/40 text-center mb-2">
        Enter your email to subscribe:
      </p>

      {/* Three Forms Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="liquid-glass rounded-2xl p-4 space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
          >
            <p className="text-[10px] text-white/25 uppercase tracking-widest">
              Form {i + 1}
            </p>
            <input
              type="email"
              value={inputs[i]}
              onChange={(e) => handleInputChange(i, e.target.value)}
              placeholder="your@email.com"
              className="w-full bg-white/5 rounded-lg px-4 py-3 text-sm text-white 
                         placeholder:text-white/20 outline-none border border-white/10
                         focus:border-white/30 transition-colors"
              id={`decoy-form-${i}`}
            />

            {/* Submit or Split Button */}
            {!splitButton || i !== realFormIndex ? (
              <motion.button
                className="w-full py-2.5 rounded-lg bg-white text-black text-sm font-semibold
                           hover:bg-white/90 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSubmit(i)}
              >
                Subscribe
              </motion.button>
            ) : (
              /* Split Button Troll */
              <div className="flex gap-2">
                {[0, 1].map((si) => (
                  <motion.button
                    key={si}
                    className="flex-1 py-2.5 rounded-lg bg-white text-black text-sm font-semibold
                               transition-colors"
                    whileHover={{
                      scale: si === splitCorrect ? 1.02 : 0.85,
                      opacity: si === splitCorrect ? 1 : 0.5,
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSplitClick(si)}
                    animate={si !== splitCorrect ? { x: [0, -2, 2, 0] } : {}}
                    transition={si !== splitCorrect ? { repeat: Infinity, duration: 2 } : {}}
                  >
                    Subscribe
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Error Messages */}
      <AnimatePresence>
        {showError && (
          <motion.p
            className="text-center text-sm text-red-400/70"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {errorMsg}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Fake Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="liquid-glass rounded-2xl p-8 max-w-sm w-full mx-4 text-center"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <p className="text-lg font-medium text-white mb-6">Are you sure?</p>
              <div className="flex gap-3">
                <motion.button
                  className="flex-1 py-3 rounded-lg border border-white/20 text-white/60 text-sm font-medium
                             hover:border-white/40 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleConfirm('yes')}
                >
                  Yes
                </motion.button>
                <motion.button
                  className="flex-1 py-3 rounded-lg bg-white text-black text-sm font-semibold
                             hover:bg-white/90 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleConfirm('definitely')}
                >
                  Definitely Yes
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
