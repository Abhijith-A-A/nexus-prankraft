import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playJump, playDeath, playDramatic } from '../../utils/sounds';

// ══════════════════════════════════════════
// IMPOSSIBLE DINO GAME
// Looks like Chrome's offline dino game but
// after ~5 successful jumps, impossible events happen:
// - Asteroid falls from sky
// - Ground cracks open
// - Cactus teleports behind dino
// - Obstacles jump over themselves
// - Giant wall appears
// - Gravity flips
// ══════════════════════════════════════════

interface DinoGameProps {
  visible: boolean;
  onDismiss: () => void;
}

type ImpossibleEvent = 'asteroid' | 'crack' | 'giant' | 'reverse' | 'teleport' | 'flying_cactus';

const IMPOSSIBLE_EVENTS: ImpossibleEvent[] = ['asteroid', 'crack', 'giant', 'flying_cactus', 'reverse', 'teleport'];

const W = 600;
const H = 200;
const GROUND_Y = 160;
const DINO_W = 20;
const DINO_H = 30;
const GRAVITY = 0.6;
const JUMP_FORCE = -11;

export default function DinoGame({ visible, onDismiss }: DinoGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'dead'>('idle');
  const [score, setScore] = useState(0);
  const [deathMsg, setDeathMsg] = useState('');
  const gameRef = useRef({
    dinoY: GROUND_Y - DINO_H,
    dinoVy: 0,
    jumping: false,
    obstacles: [] as Array<{ x: number; w: number; h: number; type: string }>,
    frameCount: 0,
    speed: 4,
    score: 0,
    jumpsSuccessful: 0,
    impossibleTriggered: false,
    impossibleType: '' as ImpossibleEvent | '',
    impossibleFrame: 0,
    asteroidY: -50,
    crackX: 0,
    running: false,
    groundOffset: 0,
  });

  const DEATH_MESSAGES: Record<ImpossibleEvent, string> = {
    asteroid: '☄️ Extinction event. The dinosaurs never stood a chance.',
    crack: '🌋 The earth opened up. Geography was never your strong suit.',
    giant: '🌲 That tree is bigger than your dreams.',
    reverse: '🔄 The cactus learned to fly. Evolution is wild.',
    teleport: '✨ The obstacle teleported. Nothing personnel, kid.',
    flying_cactus: '🌵 Cacti can fly now. Science has gone too far.',
  };

  const jump = useCallback(() => {
    const g = gameRef.current;
    if (gameState === 'idle') {
      setGameState('playing');
      g.running = true;
      g.score = 0;
      g.speed = 4;
      g.jumpsSuccessful = 0;
      g.impossibleTriggered = false;
      g.obstacles = [];
      g.frameCount = 0;
      g.dinoY = GROUND_Y - DINO_H;
      g.dinoVy = 0;
      return;
    }
    if (gameState === 'dead') {
      setGameState('idle');
      setScore(0);
      return;
    }
    if (!g.jumping) {
      g.jumping = true;
      g.dinoVy = JUMP_FORCE;
      playJump();
    }
  }, [gameState]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const g = gameRef.current;
    let animId = 0;

    const loop = () => {
      g.frameCount++;
      g.groundOffset = (g.groundOffset + g.speed) % 20;

      // Physics
      g.dinoVy += GRAVITY;
      g.dinoY += g.dinoVy;
      if (g.dinoY >= GROUND_Y - DINO_H) {
        g.dinoY = GROUND_Y - DINO_H;
        g.dinoVy = 0;
        g.jumping = false;
      }

      // Spawn obstacles
      if (g.frameCount % Math.max(50, 90 - g.score) === 0) {
        const h = 20 + Math.random() * 20;
        g.obstacles.push({ x: W + 20, w: 15, h, type: 'cactus' });
      }

      // Move obstacles
      g.obstacles.forEach(o => { o.x -= g.speed; });
      g.obstacles = g.obstacles.filter(o => o.x > -40);

      // Score from passed obstacles
      g.obstacles.forEach(o => {
        if (o.x + o.w < 50 && o.type === 'cactus' && !(o as any).counted) {
          g.score++;
          g.jumpsSuccessful++;
          (o as any).counted = true;
          setScore(g.score);
        }
      });

      // Speed up
      g.speed = 4 + g.score * 0.3;

      // ═══ IMPOSSIBLE EVENTS (after 4-6 successful jumps) ═══
      if (g.jumpsSuccessful >= 4 + Math.floor(Math.random() * 3) && !g.impossibleTriggered) {
        g.impossibleTriggered = true;
        g.impossibleType = IMPOSSIBLE_EVENTS[Math.floor(Math.random() * IMPOSSIBLE_EVENTS.length)];
        g.impossibleFrame = g.frameCount;

        if (g.impossibleType === 'asteroid') {
          g.asteroidY = -60;
        } else if (g.impossibleType === 'crack') {
          g.crackX = 220;
        } else if (g.impossibleType === 'giant') {
          g.obstacles.push({ x: W + 10, w: 100, h: 150, type: 'giant' });
        } else if (g.impossibleType === 'flying_cactus') {
          g.obstacles.push({ x: W + 10, w: 15, h: 25, type: 'flying' });
        } else if (g.impossibleType === 'reverse') {
          // Existing obstacles start moving backward
        } else if (g.impossibleType === 'teleport') {
          // Obstacle will teleport right in front of dino
          g.obstacles.push({ x: 80, w: 15, h: 30, type: 'cactus' });
        }
        playDramatic();
      }

      // Animate impossible events
      if (g.impossibleTriggered) {
        const elapsed = g.frameCount - g.impossibleFrame;

        if (g.impossibleType === 'asteroid') {
          g.asteroidY += 3;
        } else if (g.impossibleType === 'reverse') {
          g.obstacles.forEach(o => { o.x += g.speed * 2; }); // Move backwards!
          if (elapsed > 30) {
            g.obstacles.push({ x: 80, w: 15, h: 35, type: 'cactus' });
            g.impossibleType = 'teleport'; // Chain into teleport
          }
        } else if (g.impossibleType === 'flying_cactus') {
          // Flying cactus moves up and down
          g.obstacles.forEach(o => {
            if (o.type === 'flying') {
              (o as any).flyY = GROUND_Y - 80 + Math.sin(elapsed * 0.15) * 30;
            }
          });
        }
      }

      // ═══ COLLISION DETECTION ═══
      const dinoBox = { x: 50, y: g.dinoY, w: DINO_W, h: DINO_H };

      // Check obstacle collision
      for (const o of g.obstacles) {
        const oy = o.type === 'flying' ? ((o as any).flyY || GROUND_Y - 60) : GROUND_Y - o.h;
        if (
          dinoBox.x < o.x + o.w &&
          dinoBox.x + dinoBox.w > o.x &&
          dinoBox.y < oy + o.h &&
          dinoBox.y + dinoBox.h > oy
        ) {
          die(g.impossibleType as ImpossibleEvent || 'giant');
          return;
        }
      }

      // Asteroid collision
      if (g.impossibleType === 'asteroid' && g.asteroidY > g.dinoY - 10) {
        die('asteroid');
        return;
      }

      // Crack collision
      if (g.impossibleType === 'crack') {
        const crackElapsed = g.frameCount - g.impossibleFrame;
        if (crackElapsed > 40 && dinoBox.x + dinoBox.w > g.crackX && dinoBox.x < g.crackX + 60) {
          die('crack');
          return;
        }
      }

      // ═══ DRAW ═══
      ctx.clearRect(0, 0, W, H);

      // Ground
      ctx.strokeStyle = '#535353';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(W, GROUND_Y);
      ctx.stroke();

      // Ground texture
      for (let x = -g.groundOffset; x < W; x += 20) {
        ctx.fillStyle = '#d4d4d4';
        ctx.fillRect(x + 5, GROUND_Y + 4, 8, 1);
        ctx.fillRect(x + 15, GROUND_Y + 8, 5, 1);
      }

      // Crack
      if (g.impossibleType === 'crack') {
        const crackElapsed = g.frameCount - g.impossibleFrame;
        const crackWidth = Math.min(60, crackElapsed * 2);
        ctx.save();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(g.crackX, GROUND_Y);
        ctx.lineTo(g.crackX + 10, GROUND_Y + 40);
        ctx.lineTo(g.crackX + crackWidth / 2, H);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(g.crackX + crackWidth, GROUND_Y);
        ctx.lineTo(g.crackX + crackWidth - 10, GROUND_Y + 30);
        ctx.lineTo(g.crackX + crackWidth / 2 + 5, H);
        ctx.stroke();
        // Red glow from crack
        if (crackElapsed > 20) {
          ctx.fillStyle = `rgba(255, 60, 0, ${Math.min(0.4, (crackElapsed - 20) * 0.02)})`;
          ctx.fillRect(g.crackX - 5, GROUND_Y, crackWidth + 10, H - GROUND_Y);
        }
        ctx.restore();
      }

      // Obstacles
      for (const o of g.obstacles) {
        ctx.fillStyle = o.type === 'giant' ? '#2a2a2a' : '#535353';
        const oy = o.type === 'flying' ? ((o as any).flyY || GROUND_Y - 60) : GROUND_Y - o.h;
        ctx.fillRect(o.x, oy, o.w, o.h);
        // Cactus details
        if (o.type === 'cactus' || o.type === 'flying') {
          ctx.fillRect(o.x - 4, oy + 8, 5, 3);
          ctx.fillRect(o.x + o.w - 1, oy + 14, 5, 3);
        }
        if (o.type === 'giant') {
          // Giant tree with crown
          ctx.fillStyle = '#1a1a1a';
          ctx.beginPath();
          ctx.arc(o.x + o.w / 2, oy - 10, 50, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Asteroid
      if (g.impossibleType === 'asteroid' && g.asteroidY > -60) {
        ctx.save();
        ctx.fillStyle = '#8B0000';
        ctx.beginPath();
        ctx.arc(55, g.asteroidY, 25, 0, Math.PI * 2);
        ctx.fill();
        // Fire trail
        ctx.fillStyle = `rgba(255, 100, 0, 0.6)`;
        ctx.beginPath();
        ctx.moveTo(35, g.asteroidY - 15);
        ctx.lineTo(55, g.asteroidY - 40);
        ctx.lineTo(75, g.asteroidY - 15);
        ctx.fill();
        // Text
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 8px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('RIP', 55, g.asteroidY + 3);
        ctx.restore();
      }

      // Dino (pixel-art T-Rex)
      ctx.fillStyle = '#535353';
      const dy = g.dinoY;
      // Body
      ctx.fillRect(50, dy, DINO_W, DINO_H);
      // Head
      ctx.fillRect(55, dy - 8, 15, 12);
      // Eye
      ctx.fillStyle = '#f7f7f7';
      ctx.fillRect(64, dy - 5, 3, 3);
      ctx.fillStyle = '#535353';
      // Legs (animate while running)
      const legFrame = Math.floor(g.frameCount / 5) % 2;
      if (!g.jumping) {
        ctx.fillRect(52, dy + DINO_H, 4, 8);
        ctx.fillRect(60, dy + DINO_H, 4, legFrame ? 6 : 8);
      } else {
        ctx.fillRect(52, dy + DINO_H, 4, 6);
        ctx.fillRect(60, dy + DINO_H, 4, 6);
      }
      // Tail
      ctx.fillRect(42, dy + 4, 10, 4);

      // Score
      ctx.fillStyle = '#535353';
      ctx.font = 'bold 14px Inter, monospace';
      ctx.textAlign = 'right';
      ctx.fillText(String(g.score).padStart(5, '0'), W - 15, 25);

      // HI label
      ctx.fillStyle = '#999';
      ctx.font = '10px Inter';
      ctx.fillText('HI 99999', W - 80, 25);

      animId = requestAnimationFrame(loop);
    };

    const die = (event: ImpossibleEvent) => {
      g.running = false;
      setGameState('dead');
      setDeathMsg(DEATH_MESSAGES[event] || 'Game Over');
      playDeath();
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameState]);

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [jump]);

  if (!visible) return null;

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center p-6"
      style={{ zIndex: 60 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="max-w-[640px] w-full">
        {/* Fake Chrome error style */}
        <motion.div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(10,10,10,0.95)', border: '1px solid rgba(255,255,255,0.08)' }}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
        >
          {/* Chrome-like header */}
          <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-white/10" />
              <div className="w-3 h-3 rounded-full bg-white/10" />
              <div className="w-3 h-3 rounded-full bg-white/10" />
              <p className="text-[10px] text-white/20 ml-2 tracking-wider">chrome://network-error</p>
            </div>
            <button 
              className="text-white/30 hover:text-white transition-colors"
              onClick={onDismiss}
              aria-label="Close game"
            >
              ✕
            </button>
          </div>

          <div className="p-5">
            <div className="text-center mb-3">
              <p className="text-white/40 text-xs mb-1">⚠️ Connection lost. Here's a game while you wait.</p>
              <p className="text-white/15 text-[10px]">
                {gameState === 'idle' ? 'Press SPACE or tap to start' : gameState === 'dead' ? 'Press SPACE to retry' : `Score: ${score}`}
              </p>
            </div>

            {/* Canvas */}
            <canvas
              ref={canvasRef}
              width={W}
              height={H}
              className="dino-game-canvas w-full"
              onClick={jump}
              style={{ maxWidth: W }}
            />

            {/* Death message */}
            <AnimatePresence>
              {gameState === 'dead' && (
                <motion.p
                  className="text-center text-xs text-white/50 mt-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {deathMsg}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
