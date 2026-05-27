import { useEffect, useRef, useState } from 'react';

const NOISE_FRAMES  = 80;
const FLASH_FRAMES  = 50;
const TRANSITION_END = NOISE_FRAMES + FLASH_FRAMES;

function makeParticles(W, H) {
  return Array.from({ length: 280 }, () => ({
    x:    Math.random() * W,
    y:    Math.random() * H,
    vx:   (Math.random() - 0.5) * 2,
    vy:   (Math.random() - 0.5) * 2,
    size: 1 + Math.random() * 2,
    hue:  190 + Math.random() * 40,
  }));
}

function drawNoise(ctx, W, H, t) {
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(0, 0, W, H);
  const count = 1800 * (1 - t * 0.6);
  for (let i = 0; i < count; i++) {
    const b = Math.random();
    ctx.fillStyle = `rgba(${180 + b * 75},${200 + b * 55},${230 + b * 25},${b * 0.85})`;
    ctx.fillRect(Math.random() * W, Math.random() * H, 1, 1);
  }
}

function drawConverge(ctx, W, H, cx, cy, t, particles) {
  ctx.fillStyle = 'rgba(0,0,0,0.14)';
  ctx.fillRect(0, 0, W, H);

  particles.forEach(p => {
    const dx = cx - p.x;
    const dy = cy - p.y;
    const dist = Math.sqrt(dx * dx + dy * dy) + 1;
    const pull = 0.015 + t * t * 0.4;
    p.vx += (dx / dist) * pull * (dist / 80);
    p.vy += (dy / dist) * pull * (dist / 80);
    p.vx *= 0.97;
    p.vy *= 0.97;
    p.x  += p.vx;
    p.y  += p.vy;

    ctx.globalAlpha = 0.5 + t * 0.5;
    ctx.fillStyle   = `hsl(${p.hue},70%,${65 + t * 35}%)`;
    ctx.fillRect(p.x, p.y, p.size, p.size);
  });

  const flashR = t * t * 130;
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, flashR);
  g.addColorStop(0,   `rgba(255,255,255,${t * 0.95})`);
  g.addColorStop(0.4, `rgba(150,220,255,${t * 0.5})`);
  g.addColorStop(1,   'rgba(0,0,0,0)');
  ctx.globalAlpha = 1;
  ctx.fillStyle   = g;
  ctx.fillRect(0, 0, W, H);
}

function drawSignal(ctx, W, H, cx, cy, age) {
  ctx.fillStyle = 'rgba(0,0,0,0.055)';
  ctx.fillRect(0, 0, W, H);

  const maxLen  = Math.sqrt(W * W + H * H) / 2;
  const rampIn  = Math.min(age / 45, 1);
  const NUM_RAYS = 12;

  for (let i = 0; i < NUM_RAYS; i++) {
    const angle  = (i / NUM_RAYS) * Math.PI * 2 + Math.sin(age * 0.04 + i * 1.3) * 0.04;
    const len    = maxLen * rampIn;
    const ex     = cx + Math.cos(angle) * len;
    const ey     = cy + Math.sin(angle) * len;
    const width  = (2.5 + Math.sin(age * 0.06 + i) * 1.5) * rampIn;

    const rg = ctx.createLinearGradient(cx, cy, ex, ey);
    rg.addColorStop(0,    `rgba(255,255,255,${0.75 * rampIn})`);
    rg.addColorStop(0.12, `rgba(180,230,255,${0.5  * rampIn})`);
    rg.addColorStop(0.45, `rgba(100,180,255,${0.25 * rampIn})`);
    rg.addColorStop(1,    'rgba(0,0,0,0)');

    ctx.globalAlpha = 1;
    ctx.strokeStyle = rg;
    ctx.lineWidth   = width;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(ex, ey);
    ctx.stroke();
  }

  // Expanding ring
  const ringR     = Math.min(age * 9, maxLen * 1.1);
  const ringAlpha = Math.max(0, 0.7 - ringR / maxLen);
  ctx.globalAlpha = ringAlpha;
  ctx.strokeStyle = 'rgba(160,225,255,1)';
  ctx.lineWidth   = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
  ctx.stroke();

  // Centre glow
  const pulse = 0.85 + Math.sin(age * 0.1) * 0.15;
  const glowR = 55 * pulse;
  const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR * 3.5);
  gg.addColorStop(0,    'rgba(255,255,255,0.95)');
  gg.addColorStop(0.15, 'rgba(200,235,255,0.7)');
  gg.addColorStop(0.4,  'rgba(100,180,255,0.3)');
  gg.addColorStop(1,    'rgba(0,0,0,0)');
  ctx.globalAlpha = 1;
  ctx.fillStyle   = gg;
  ctx.beginPath();
  ctx.arc(cx, cy, glowR * 3.5, 0, Math.PI * 2);
  ctx.fill();
}

export default function WinScreen({ onDismiss }) {
  const canvasRef  = useRef(null);
  const stateRef   = useRef({ frame: 0, signalStart: -1, particles: null });
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    let animId;
    const s = stateRef.current;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      s.particles   = makeParticles(canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const { frame } = s;
      const W  = canvas.width;
      const H  = canvas.height;
      const cx = W / 2;
      const cy = H / 2;

      if (frame < NOISE_FRAMES) {
        drawNoise(ctx, W, H, frame / NOISE_FRAMES);
      } else if (frame < TRANSITION_END) {
        drawConverge(ctx, W, H, cx, cy, (frame - NOISE_FRAMES) / FLASH_FRAMES, s.particles);
      } else {
        if (s.signalStart === -1) {
          s.signalStart = frame;
          setTimeout(() => setShowText(true), 400);
        }
        drawSignal(ctx, W, H, cx, cy, frame - s.signalStart);
      }

      ctx.globalAlpha = 1;
      s.frame++;
      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-50 cursor-pointer rounded overflow-hidden" onClick={onDismiss}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full bg-black" />
      {showText && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center select-none win-text-reveal">
            <p
              className="text-white font-bold text-5xl sm:text-6xl tracking-[0.3em] font-mono"
              style={{ textShadow: '0 0 30px rgba(150,220,255,0.9), 0 0 70px rgba(100,180,255,0.5)' }}
            >
              SIGNAL FOUND
            </p>
            <p className="text-cyan-300/60 text-sm font-mono mt-5 tracking-widest">
              click anywhere to continue
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
