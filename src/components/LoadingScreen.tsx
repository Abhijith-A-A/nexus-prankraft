import { motion } from 'framer-motion';

interface LoadingScreenProps {
  progress: number; // 0 to 1
  isLoaded: boolean;
}

export default function LoadingScreen({ progress, isLoaded }: LoadingScreenProps) {
  return (
    <motion.div
      className={`loading-screen ${isLoaded ? 'loaded' : ''}`}
      initial={{ opacity: 1 }}
      animate={{ opacity: isLoaded ? 0 : 1 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-2xl font-medium tracking-[-1px] text-white mb-1">
          NEXUS<span className="font-serif italic text-white/40">™</span>
        </h1>
        <p className="text-[11px] tracking-[4px] uppercase text-white/30 mb-8">
          Loading Experience
        </p>
        <div className="loading-bar-track">
          <div
            className="loading-bar-fill"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
        <p className="text-[13px] text-white/40 mt-4 font-medium tabular-nums">
          {Math.round(progress * 100)}%
        </p>
      </motion.div>
    </motion.div>
  );
}
