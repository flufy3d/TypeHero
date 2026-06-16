/* =========================================================
   特效：彩带（Canvas）+ 音效（WebAudio 实时合成，无音频文件）
   ========================================================= */

/* ---------- 彩带 ---------- */
let canvas, ctx, W = 0, H = 0;
let particles = [];
let running = false;

function resize() {
  if (!canvas) return;
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}

export function initFx(c) {
  canvas = c;
  ctx = c.getContext('2d');
  resize();
  window.addEventListener('resize', resize);
}

const COLORS = ['#ff6b81', '#ffd54a', '#51e899', '#4dabf7', '#da77f2', '#4dd0e1', '#ffa94d'];

function loop() {
  if (!ctx) return;
  ctx.clearRect(0, 0, W, H);
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.vy += 0.16;
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
    ctx.restore();
    if (p.y > H + 30) particles.splice(i, 1);
  }
  if (particles.length) {
    requestAnimationFrame(loop);
  } else {
    running = false;
    ctx.clearRect(0, 0, W, H);
  }
}

export function confetti(count = 130) {
  if (!ctx) return;
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * W,
      y: -20 - Math.random() * H * 0.4,
      vx: (Math.random() - 0.5) * 5,
      vy: Math.random() * 3 + 2,
      rot: Math.random() * 6,
      vr: (Math.random() - 0.5) * 0.35,
      size: 8 + Math.random() * 9,
      color: COLORS[i % COLORS.length]
    });
  }
  if (!running) { running = true; requestAnimationFrame(loop); }
}

/* ---------- 音效 ---------- */
let actx = null;
let enabled = true;

function ac() {
  if (!actx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) { try { actx = new AC(); } catch { actx = null; } }
  }
  if (actx && actx.state === 'suspended') actx.resume();
  return actx;
}

function tone(freq, dur = 0.12, type = 'sine', gain = 0.14, when = 0) {
  const c = ac();
  if (!c || !enabled) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  o.connect(g); g.connect(c.destination);
  const t = c.currentTime + when;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.start(t);
  o.stop(t + dur + 0.03);
}

export const Sound = {
  setEnabled(v) { enabled = !!v; },
  isEnabled() { return enabled; },
  // 首次需要在用户手势里唤醒音频上下文
  unlock() { ac(); },
  correct() { tone(680, 0.06, 'triangle', 0.10); },
  wrong() { tone(150, 0.16, 'sawtooth', 0.10); },
  combo() { tone(900, 0.08, 'square', 0.07); },
  click() { tone(520, 0.04, 'square', 0.06); },
  star() { [880, 1175, 1568].forEach((f, i) => tone(f, 0.18, 'sine', 0.12, i * 0.12)); },
  levelUp() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, 'triangle', 0.12, i * 0.1)); }
};
