// ══════════════════════════════════════════
// NEXUS™ — Configuration Constants
// ══════════════════════════════════════════

export const FRAME_COUNT = 296;
export const FRAME_PATH = import.meta.env.BASE_URL + 'Frames/ezgif-frame-';
export const FRAME_EXT = '.jpg';
export const SCROLL_HEIGHT_VH = 800; // 8x viewport — enough for phases without being boring
export const ZOOM_FACTOR = 1.35;
export const PARALLAX_INTENSITY = 20;
export const CANVAS_SCALE = 1.05;

// Phase thresholds — each phase gets good screen time
export const PHASE_THRESHOLDS = {
  TRUST: 0,        // 0-10%   — everything is perfect, build trust
  SUBTLE: 0.10,    // 10-30%  — first phantom, shy button, subtle weirdness
  INVASION: 0.30,  // 30-55%  — full phantom swarm, checkboxes, progress bar
  GAUNTLET: 0.55,  // 55-75%  — email form gauntlet
  RANSOM: 0.75,    // 75-90%  — mini-games
  REVEAL: 0.90,    // 90-100% — score + reveal
};

// Troll messages for wrong button clicks
export const WRONG_BUTTON_MESSAGES = [
  "Nope. Try again.",
  "So close! (not really)",
  "That one's decorative.",
  "Interesting choice. Wrong, but interesting.",
  "The other one. No, the OTHER other one.",
  "This button is on vacation.",
  "Error 404: Luck not found.",
  "Bold strategy. Didn't work though.",
];

// Scroll personality descriptions
export const SCROLL_PERSONALITIES: Record<string, string> = {
  fast: "⚡ Speed Demon — You scroll like you drive: too fast, no seatbelt.",
  slow: "🐌 The Contemplator — You read every pixel. Respect. But also, why?",
  erratic: "🎲 Chaos Agent — Your scroll pattern looks like a seismograph.",
  steady: "📐 The Perfectionist — Consistent scroll speed. You measure your pasta too, don't you?",
};
