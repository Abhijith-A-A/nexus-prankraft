import { motion } from 'framer-motion';
import { SCROLL_PERSONALITIES } from '../../utils/constants';

interface ScoreScreenProps {
  stats: {
    timeSpent: number; // seconds
    wrongClicks: number;
    phantomsSeen: number;
    challengesCompleted: number;
    scrollDistance: number; // pixels
    dodgeAttempts: number;
  };
  onReplay: () => void;
}

export default function ScoreScreen({ stats, onReplay }: ScoreScreenProps) {
  const totalScore = Math.min(100, Math.round(
    (stats.challengesCompleted * 15) +
    (stats.wrongClicks * 2) +
    Math.min(stats.timeSpent * 0.2, 20) +
    (stats.dodgeAttempts * 3)
  ));

  // Determine scroll personality
  const scrollSpeed = stats.scrollDistance / Math.max(stats.timeSpent, 1);
  let personality: string;
  if (scrollSpeed > 800) personality = SCROLL_PERSONALITIES.fast;
  else if (scrollSpeed < 200) personality = SCROLL_PERSONALITIES.slow;
  else if (stats.wrongClicks > 8) personality = SCROLL_PERSONALITIES.erratic;
  else personality = SCROLL_PERSONALITIES.steady;

  const statRows = [
    { label: 'Time Survived', value: `${Math.round(stats.timeSpent)}s` },
    { label: 'Wrong Buttons Clicked', value: stats.wrongClicks.toString() },
    { label: 'Phantoms Witnessed', value: stats.phantomsSeen.toString() },
    { label: 'Challenges Completed', value: `${stats.challengesCompleted}/4` },
    { label: 'Total Scroll Distance', value: `${(stats.scrollDistance / 1000).toFixed(1)}k px` },
    { label: 'Button Dodge Attempts', value: stats.dodgeAttempts.toString() },
  ];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div
        className="liquid-glass rounded-3xl p-8 md:p-12 max-w-md w-full mx-4"
        initial={{ scale: 0.8, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
      >
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-[10px] tracking-[6px] uppercase text-white/30 mb-3">
            Experience Complete
          </p>
          <h2 className="text-4xl font-medium tracking-tight text-white">
            SCORE: <span className="font-serif italic">{totalScore}</span>
          </h2>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          {statRows.map((row, i) => (
            <motion.div
              key={row.label}
              className="score-stat"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + i * 0.1 }}
            >
              <span className="label">{row.label}</span>
              <span className="value">{row.value}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll Personality */}
        <motion.div
          className="bg-white/5 rounded-xl p-4 mb-8 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
        >
          <p className="text-[10px] tracking-[3px] uppercase text-white/30 mb-2">
            Your Scroll Personality
          </p>
          <p className="text-sm text-white/70">{personality}</p>
        </motion.div>

        {/* Reveal Message */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
        >
          <p className="text-sm text-white/40 leading-relaxed">
            Every cursor was fake. Every trap was designed.
            <br />
            But your frustration was real.
            <br />
            <span className="text-white/60 font-medium mt-2 inline-block">
              Happy April Fools. 🎭
            </span>
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          className="flex gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2 }}
        >
          <motion.button
            className="flex-1 py-3 rounded-xl bg-white text-black font-semibold text-sm
                       hover:bg-white/90 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onReplay}
          >
            PLAY AGAIN
          </motion.button>
          <motion.button
            className="flex-1 py-3 rounded-xl border border-white/20 text-white/60 font-medium text-sm
                       hover:border-white/40 hover:text-white/80 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              const text = `I survived NEXUS™ with a score of ${totalScore}/100. Can you beat me? 🎭`;
              if (navigator.share) {
                navigator.share({ title: 'NEXUS™ Score', text, url: window.location.href });
              } else {
                navigator.clipboard.writeText(text + ' ' + window.location.href);
              }
            }}
          >
            SHARE SCORE
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
