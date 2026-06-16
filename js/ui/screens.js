/* =========================================================
   界面渲染：选英雄 / 世界地图 / 练习 / 结算 / 成就墙 / 设置
   ========================================================= */
import { Store } from '../state/store.js';
import {
  WORLDS, ALL_LESSONS, getLesson, worldOf, nextLessonId, isLessonUnlocked,
  worldStars, worldMaxStars, isWorldComplete, allWorldsComplete, ARENA_CHALLENGES
} from '../data/lessons.js';
import { createSession } from '../engine/typing.js';
import { createKeyboard } from '../engine/keyboard.js';
import {
  BADGES, THEMES, isThemeUnlocked, levelProgress
} from '../gamify/achievements.js';
import { confetti, Sound } from './effects.js';

let root = null;
let router = null;
let currentKeyHandler = null;
let mapPage = null; // 当前正在查看的世界页（null=自动定位到所在世界）

const AVATARS = ['🦸', '🦹', '🦊', '🐱', '🐯', '🐲', '🦄', '🐼', '🐧', '🤖', '🐢', '🦉', '🐙', '🦁', '🐵', '🐰'];
const THEME_DOT = { default: '#6c5ce7', ocean: '#00b4d8', forest: '#2d9d57', candy: '#ff5fa2', sunset: '#ff7b36', cosmos: '#8e7dff' };

// 地图每个世界的主题色与装饰
const WORLD_COLOR = { home: '#22b8cf', top: '#7048e8', bottom: '#37b24d', num: '#4263eb', caps: '#f06595', words: '#f59f00', sent: '#1098ad', speed: '#e8590c' };
const SCENERY = {
  home: ['🌴', '🐚', '⛱️', '🌊'], top: ['🏔️', '☁️', '🦅', '🌤️'],
  bottom: ['🌿', '🍄', '🐸', '🦎'], num: ['⭐', '🌙', '🪐', '✨'],
  caps: ['🏰', '⚔️', '👑', '🛡️'], words: ['📚', '✏️', '🧩', '💡'],
  sent: ['📜', '🖋️', '📖', '📝'], speed: ['⚡', '🔥', '🏁', '💨']
};
const SCENERY_POS = [
  { top: '16%', left: '5%' }, { bottom: '14%', left: '9%' },
  { top: '20%', right: '8%' }, { bottom: '16%', right: '5%' }
];

/* ---------- 工具 ---------- */
function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}
function starRow(n) {
  return `<span style="color:var(--gold)">${'★'.repeat(n)}</span><span class="muted">${'☆'.repeat(3 - n)}</span>`;
}
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function applyChrome() {
  const p = Store.getActive();
  if (!p) return;
  document.documentElement.dataset.theme = p.settings.theme || 'default';
  document.body.classList.toggle('no-finger', !p.settings.fingerColors);
  document.body.classList.toggle('no-hints', !p.settings.kbHints);
  Sound.setEnabled(!!p.settings.sound);
}

function removeOverlay() {
  document.getElementById('overlay')?.remove();
}

// 可爱的小提示条（替代 alert）
function toast(msg) {
  document.querySelector('.toast')?.remove();
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2400);
}

// 需要重新输入名字才能确认的可爱弹窗（替代 confirm，防止误删）
function confirmName(name, { title, body, confirmText = '确认', emoji = '🥺' }, onConfirm) {
  removeOverlay();
  const ov = document.createElement('div');
  ov.id = 'overlay';
  ov.className = 'overlay';
  ov.innerHTML = `
    <div class="modal confirm-modal">
      <div style="font-size:3rem">${emoji}</div>
      <div class="result-title" style="font-size:1.3rem">${esc(title)}</div>
      <p class="muted" style="margin:6px 0 14px">${body}</p>
      <input class="field" id="cfInput" autocomplete="off" placeholder="在这里输入：${esc(name)}" />
      <div class="row">
        <button class="btn ghost" id="cfCancel">取消</button>
        <button class="btn danger" id="cfOk" disabled>${confirmText}</button>
      </div>
    </div>`;
  document.body.appendChild(ov);
  const input = ov.querySelector('#cfInput');
  const okBtn = ov.querySelector('#cfOk');
  setTimeout(() => input.focus(), 30);
  const match = () => input.value.trim() === name;
  input.addEventListener('input', () => { okBtn.disabled = !match(); });
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && match()) okBtn.click(); });
  ov.querySelector('#cfCancel').addEventListener('click', () => { Sound.click(); removeOverlay(); });
  okBtn.addEventListener('click', () => { if (!match()) return; removeOverlay(); onConfirm(); });
}

/* ---------- 顶部英雄栏 ---------- */
function topbar() {
  const p = Store.getActive();
  const lp = levelProgress(p.xp);
  return `
  <header class="topbar card">
    <div class="hero-badge">
      <div class="hero-avatar">${p.avatar}</div>
      <div class="hero-meta">
        <div class="hero-name">${esc(p.name)} <span class="muted">Lv.${lp.level}</span></div>
        <div class="hero-sub">
          <span>🔥 连续 ${p.streak.count} 天</span>
          <span>⭐ 总星 ${p.stats.totalStars}</span>
        </div>
        <div class="xp-track" title="距离下一级还差 ${lp.toNext} 经验"><div class="xp-fill" style="width:${lp.pct}%"></div></div>
      </div>
    </div>
    <nav class="nav">
      <button class="btn ghost" data-go="home">🗺️<span class="t"> 地图</span></button>
      <button class="btn ghost" data-go="badges">🏅<span class="t"> 成就</span></button>
      <button class="btn ghost" data-go="settings">⚙️<span class="t"> 设置</span></button>
      <button class="btn ghost" data-go="profiles">🔄<span class="t"> 换人</span></button>
    </nav>
  </header>`;
}

function wireTopbar() {
  root.querySelectorAll('[data-go]').forEach((b) => {
    b.addEventListener('click', () => { Sound.click(); router.go(b.dataset.go); });
  });
}

/* ========================================================= */
/* 选择 / 创建英雄                                            */
/* ========================================================= */
function showProfiles() {
  const profiles = Store.listProfiles();
  const cards = profiles.map((p) => `
    <div class="profile-card" data-id="${p.id}">
      <button class="del" data-del="${p.id}" title="删除">✕</button>
      <div class="pa">${p.avatar}</div>
      <div class="pn">${esc(p.name)}</div>
      <div class="pl">Lv.${levelProgress(p.xp).level} · ⭐${p.stats.totalStars}</div>
    </div>`).join('');

  root.innerHTML = `
    <h1 class="screen-title">⌨️ 打字英雄</h1>
    <p class="screen-sub">选择你的小英雄，开始离线闯关！进度会自动保存在这台设备上。</p>
    <div class="profile-grid">
      ${cards}
      <div class="profile-card add" id="addProfile">
        <div style="font-size:42px">＋</div>
        <div class="pn">新建英雄</div>
      </div>
    </div>
    <div id="createPanel"></div>
  `;

  profiles.forEach(() => {});
  root.querySelectorAll('.profile-card[data-id]').forEach((c) => {
    c.addEventListener('click', (e) => {
      if (e.target.closest('[data-del]')) return;
      Sound.click();
      Store.setActive(c.dataset.id);
      mapPage = null;
      applyChrome();
      router.go('home');
    });
  });
  root.querySelectorAll('[data-del]').forEach((b) => {
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      const prof = Store.listProfiles().find((x) => x.id === b.dataset.del);
      if (!prof) return;
      Sound.click();
      confirmName(prof.name, {
        title: '要删除这个英雄吗？',
        body: `删除后「${esc(prof.name)}」的所有进度都会消失，无法恢复。<br>请输入该英雄的名字来确认：`,
        confirmText: '🗑️ 确认删除',
        emoji: '🥺'
      }, () => {
        Store.deleteProfile(b.dataset.del);
        toast('已删除该英雄');
        showProfiles();
      });
    });
  });
  root.querySelector('#addProfile').addEventListener('click', renderCreatePanel);

  if (profiles.length === 0) renderCreatePanel();
}

function renderCreatePanel() {
  let avatar = AVATARS[0];
  const panel = root.querySelector('#createPanel');
  panel.innerHTML = `
    <div class="card" style="padding:22px;margin-top:22px">
      <h2 class="section-h" style="margin-top:0">创建新英雄</h2>
      <p class="muted">给你的小英雄起个名字，挑一个头像吧！</p>
      <input class="field" id="nameInput" maxlength="16" placeholder="输入昵称，例如：小明" />
      <div style="margin:16px 0 8px;font-weight:700">选择头像</div>
      <div class="picker" id="avatarPicker">
        ${AVATARS.map((a, i) => `<div class="opt${i === 0 ? ' sel' : ''}" data-a="${a}">${a}</div>`).join('')}
      </div>
      <div class="row" style="margin-top:20px">
        <button class="btn big" id="createBtn">🚀 开始冒险</button>
      </div>
    </div>`;

  const picker = panel.querySelector('#avatarPicker');
  picker.querySelectorAll('.opt').forEach((o) => {
    o.addEventListener('click', () => {
      picker.querySelectorAll('.opt').forEach((x) => x.classList.remove('sel'));
      o.classList.add('sel');
      avatar = o.dataset.a;
      Sound.click();
    });
  });
  const nameInput = panel.querySelector('#nameInput');
  nameInput.focus();
  panel.querySelector('#createBtn').addEventListener('click', () => {
    const name = nameInput.value.trim() || '小英雄';
    Store.createProfile(name, avatar, 'default');
    mapPage = null;
    applyChrome();
    Sound.levelUp();
    router.go('home');
  });
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ========================================================= */
/* 世界地图                                                   */
/* ========================================================= */
function showHome() {
  const p = Store.getActive();
  // 全局"你在这"：第一个已解锁且还没拿星的关卡
  const current = ALL_LESSONS.find((l) => isLessonUnlocked(p, l.id) && !(p.stars[l.id] > 0));
  const currentId = current ? current.id : null;
  const graduated = allWorldsComplete(p);
  const pinHtml = `<div class="pin">${p.avatar}<i>▾</i></div>`;

  function regionSection(w) {
    const got = worldStars(p, w.id);
    const max = worldMaxStars(w.id);
    const color = WORLD_COLOR[w.id] || '#6c5ce7';
    const deco = (SCENERY[w.id] || []).map((em, i) => {
      const style = Object.entries(SCENERY_POS[i] || {}).map(([k, v]) => `${k}:${v}`).join(';');
      return `<span style="${style}">${em}</span>`;
    }).join('');

    const stops = w.lessons.map((l, i) => {
      const unlocked = isLessonUnlocked(p, l.id);
      const s = p.stars[l.id] || 0;
      const here = l.id === currentId ? pinHtml : '';
      const state = unlocked ? (s > 0 ? 'done' : '') : 'locked';
      if (l.boss) {
        return `
          <div class="stop boss">
            <div class="stop-inner">
              ${here}
              <div class="boss-bubble ${state} ${l.final ? 'final' : ''}" data-lesson="${unlocked ? l.id : ''}">
                <span class="boss-tag">${l.final ? '终极BOSS' : 'BOSS'}</span>
                <span class="be">${unlocked ? l.emoji : '🔒'}</span>
              </div>
              <div class="label">${esc(l.title)}</div>
              <div class="stars">${unlocked ? starRow(s) : ''}</div>
            </div>
          </div>`;
      }
      return `
        <div class="stop ${i % 2 === 0 ? 'left' : 'right'}">
          <div class="stop-inner">
            ${here}
            <div class="bubble ${state}" data-lesson="${unlocked ? l.id : ''}">${unlocked ? (i + 1) : '🔒'}</div>
            <div class="label">${esc(l.title)}</div>
            <div class="stars">${unlocked ? starRow(s) : ''}</div>
          </div>
        </div>`;
    }).join('');

    return `
      <section class="region ${got >= max ? 'cleared' : ''}" style="--wc:${color}">
        <div class="region-deco">${deco}<span class="region-water">${w.emoji}</span></div>
        <div class="region-head">
          <span class="region-emoji">${w.emoji}</span>
          <span class="region-name">${esc(w.name)}</span>
          <span class="region-prog">⭐ ${got}/${max}</span>
        </div>
        <div class="trail">${stops}</div>
      </section>`;
  }

  function arenaSection() {
    return `
      <section class="arena-node" data-arena="1">
        ${!currentId ? pinHtml : ''}
        <div class="arena-emoji">🏟️</div>
        <div class="arena-title">竞技场 · 无尽挑战</div>
        <div class="arena-sub">最佳速度 ${p.arena.bestWpm} WPM · 最佳准确率 ${p.arena.bestAcc}% · 已挑战 ${p.arena.runs} 次</div>
      </section>`;
  }

  // 分页：一次只看一个世界；未通关当前世界就看不到后面的世界
  let firstIncomplete = WORLDS.findIndex((w) => !isWorldComplete(p, w.id));
  if (firstIncomplete === -1) firstIncomplete = WORLDS.length - 1;
  const maxPage = graduated ? WORLDS.length : firstIncomplete; // 竞技场页 = WORLDS.length
  if (mapPage === null) mapPage = currentId ? WORLDS.findIndex((w) => w.id === worldOf(currentId).id) : firstIncomplete;
  mapPage = Math.max(0, Math.min(mapPage, maxPage));

  const isArenaPage = mapPage === WORLDS.length;
  const canNext = mapPage < maxPage;
  const nextLocked = !canNext && !isArenaPage;   // 停在最后可见世界，后面被锁
  const nextDisabled = !canNext && isArenaPage;  // 已在竞技场，没有更后面

  const title = isArenaPage ? '🏟️ 竞技场' : `世界 ${mapPage + 1} / ${WORLDS.length} · ${esc(WORLDS[mapPage].name)}`;
  const page = isArenaPage ? arenaSection() : regionSection(WORLDS[mapPage]);

  const nav = `
    <div class="world-nav">
      <button class="nav-arrow" id="prevWorld" ${mapPage > 0 ? '' : 'disabled'} aria-label="上一个世界">◀</button>
      <div class="world-nav-title">${title}</div>
      <button class="nav-arrow ${nextLocked ? 'locked' : ''}" id="nextWorld" ${nextDisabled ? 'disabled' : ''} aria-label="下一个世界">${nextLocked ? '🔒' : '▶'}</button>
    </div>
    ${nextLocked ? `<p class="next-hint">🔒 通关本世界（含 Boss）后，才能进入下一个世界</p>` : ''}`;

  root.innerHTML = topbar() + `<h2 class="map-title">🗺️ 冒险地图</h2>` + nav + `<div class="map">${page}</div>`;
  wireTopbar();
  root.querySelectorAll('[data-lesson]').forEach((n) => {
    if (!n.dataset.lesson) return;
    n.addEventListener('click', () => { Sound.click(); router.go('play', { lessonId: n.dataset.lesson }); });
  });
  root.querySelector('[data-arena]')?.addEventListener('click', () => { Sound.click(); router.go('arena'); });
  root.querySelector('#prevWorld')?.addEventListener('click', () => { if (mapPage > 0) { mapPage--; Sound.click(); showHome(); } });
  root.querySelector('#nextWorld')?.addEventListener('click', () => {
    if (canNext) { mapPage++; Sound.click(); showHome(); }
    else if (nextLocked) { Sound.wrong(); toast('先通关本世界（含 Boss）才能解锁下一个世界哦～'); }
  });

  root.querySelector('.pin')?.closest('.stop, .arena-node')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
}

/* ========================================================= */
/* 练习                                                       */
/* ========================================================= */
function renderPlay(lesson, opts = {}) {
  const isArena = !!opts.isArena;
  const isBossLvl = !!lesson.boss;
  const world = worldOf(lesson.id);
  const subtitle = isArena ? '竞技场 · 反复挑战' : (world ? world.name : '');
  const titleIcon = isArena ? '🏟️' : (isBossLvl ? lesson.emoji : (world ? world.emoji : ''));
  const tag = isBossLvl
    ? `<span class="boss-flag ${lesson.final ? 'final' : ''}">${lesson.final ? '终极BOSS' : 'BOSS'}</span>`
    : (isArena ? `<span class="boss-flag arena">竞技场</span>` : '');

  root.innerHTML = `
    <div class="play-head card ${isBossLvl ? 'boss-head' : ''} ${isArena ? 'arena-head' : ''}" style="padding:12px 16px">
      <button class="btn ghost" id="backBtn">← 返回</button>
      <span class="mascot" id="mascot">🙂</span>
      <div>
        <div class="lesson-title">${titleIcon} ${esc(lesson.title)} ${tag}</div>
        <div class="muted" style="font-size:.8rem">${esc(subtitle)}</div>
      </div>
      <div class="stats">
        <div class="stat"><div class="v" id="sAcc">100</div><div class="k">准确率%</div></div>
        <div class="stat"><div class="v" id="sWpm">0</div><div class="k">速度WPM</div></div>
        <div class="stat combo"><div class="v" id="sCombo">0</div><div class="k">连击</div></div>
      </div>
    </div>
    <div class="xp-track" style="width:100%;margin:12px 0 14px"><div class="xp-fill" id="prog" style="width:0%;background:linear-gradient(90deg,var(--accent),var(--accent-2))"></div></div>
    <p class="tip">💡 ${esc(lesson.tip)}</p>
    <div class="text-box" id="textBox"></div>
    <div id="kbHolder"></div>
    <div class="finger-legend">
      <span><i style="background:#ff6b6b"></i>小指</span>
      <span><i style="background:#ffa94d"></i>无名指</span>
      <span><i style="background:#ffd43b"></i>中指</span>
      <span><i style="background:#69db7c"></i>食指(左)</span>
      <span><i style="background:#38d9a9"></i>食指(右)</span>
      <span><i style="background:#4dabf7"></i>中指</span>
      <span><i style="background:#748ffc"></i>无名指</span>
      <span><i style="background:#da77f2"></i>小指</span>
    </div>
  `;

  // 渲染目标文本为逐字符 span
  const textBox = root.querySelector('#textBox');
  const charEls = lesson.target.split('').map((ch) => {
    const span = document.createElement('span');
    const isSpace = ch === ' ';
    span.className = 'ch pending' + (isSpace ? ' space' : '');
    if (!isSpace) span.textContent = ch;
    if (isSpace) span.dataset.sp = '1';
    textBox.appendChild(span);
    return span;
  });

  const keyboard = createKeyboard(root.querySelector('#kbHolder'));
  keyboard.highlightNext(lesson.target[0]);

  const mascot = root.querySelector('#mascot');
  const sAcc = root.querySelector('#sAcc');
  const sWpm = root.querySelector('#sWpm');
  const sCombo = root.querySelector('#sCombo');
  const prog = root.querySelector('#prog');

  function renderText(index, lastWrong) {
    charEls.forEach((s, i) => {
      let cls = 'ch' + (s.dataset.sp ? ' space' : '');
      if (i < index) cls += ' done';
      else if (i === index) cls += ' current' + (lastWrong ? ' wrong' : '');
      else cls += ' pending';
      s.className = cls;
    });
    if (lastWrong && charEls[index]) {
      const cur = charEls[index];
      setTimeout(() => cur.classList.remove('wrong'), 240);
    }
    charEls[index]?.scrollIntoView({ block: 'nearest' });
  }

  let failedEarly = false;
  const session = createSession(lesson, {
    onUpdate(snap) {
      renderText(snap.index, snap.lastWrong);
      keyboard.highlightNext(snap.expected);
      sAcc.textContent = snap.acc;
      sAcc.style.color = snap.acc < 50 ? 'var(--bad)' : '';
      sWpm.textContent = snap.wpm;
      sCombo.textContent = snap.combo;
      prog.style.width = Math.round((snap.index / snap.total) * 100) + '%';
      // 准确率掉到 50% 以下立刻让重来，不必把整段长文打完才知道没过
      const attempts = snap.index + snap.errors;
      if (!failedEarly && snap.index < snap.total && attempts >= 15 && snap.acc < 50) {
        failedEarly = true;
        currentKeyHandler = null;
        keyboard.clear();
        showEarlyFail(lesson, isArena);
        return;
      }
      if (snap.lastWrong) {
        mascot.textContent = '😅';
        setTimeout(() => { if (!session.isDone) mascot.textContent = '🙂'; }, 350);
      } else if (snap.combo > 0 && snap.combo % 10 === 0) {
        mascot.textContent = '🤩';
        mascot.classList.remove('happy'); void mascot.offsetWidth; mascot.classList.add('happy');
        Sound.combo();
      }
    },
    onComplete(result) {
      currentKeyHandler = null;
      keyboard.clear();
      if (isArena) showArenaResult(Store.recordArenaResult(result), lesson);
      else showResult(Store.recordResult(result), lesson.id);
    }
  });

  currentKeyHandler = (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'Escape') { router.go('home'); return; }
    if (e.key.length !== 1) return;     // 忽略 Shift/Tab/方向键等
    e.preventDefault();
    Sound.unlock();
    const correct = e.key === session.expected;
    session.handleChar(e.key);
    keyboard.pressFeedback(e.key);
    if (!session.isDone) correct ? Sound.correct() : Sound.wrong();
  };

  root.querySelector('#backBtn').addEventListener('click', () => { Sound.click(); router.go('home'); });
}

function showPlay(lessonId) {
  const p = Store.getActive();
  const lesson = getLesson(lessonId);
  if (!lesson || !isLessonUnlocked(p, lessonId)) { router.go('home'); return; }
  renderPlay(lesson, {});
}

function showArena() {
  if (!allWorldsComplete(Store.getActive())) { router.go('home'); return; }
  const c = pick(ARENA_CHALLENGES);
  renderPlay(
    { id: 'arena', title: c.title, target: c.target, targetWpm: c.targetWpm, tip: '全力以赴，刷新你的纪录！', arena: true },
    { isArena: true }
  );
}

/* ========================================================= */
/* 结算                                                       */
/* ========================================================= */
/* 中途准确率太低，立刻提示重来（避免把长文白打完） */
function showEarlyFail(lesson, isArena) {
  const ov = document.createElement('div');
  ov.id = 'overlay';
  ov.className = 'overlay';
  ov.innerHTML = `
    <div class="modal">
      <div style="font-size:3rem">🌀</div>
      <div class="result-title">${pick(['哎呀，错得有点多啦', '没关系，我们重来一次！', '慢一点，会更准哦'])}</div>
      <p class="muted" style="margin:6px 0 16px">准确率太低，这一关不会通过。<br>现在重新开始，别浪费时间继续打啦 💪</p>
      <div class="row">
        <button class="btn" id="efRetry">🔁 重新开始</button>
        <button class="btn ghost" id="efHome">🗺️ 返回地图</button>
      </div>
    </div>`;
  document.body.appendChild(ov);
  Sound.wrong();
  ov.querySelector('#efRetry').addEventListener('click', () => {
    Sound.click();
    if (isArena) router.go('arena');
    else router.go('play', { lessonId: lesson.id });
  });
  ov.querySelector('#efHome').addEventListener('click', () => { Sound.click(); router.go('home'); });
}

function showResult(r, lessonId) {
  const passed = r.stars >= 1;
  const titlePool = {
    0: ['哎呀，准确率太低啦', '别灰心，再试一次！', '慢一点，打准了再继续～'],
    1: ['完成啦！', '再练一次会更棒～', '慢慢来，你可以的！'],
    2: ['做得很好！', '越来越熟练啦！', '继续加油！'],
    3: ['太棒了！', '完美表现！', '你是打字小英雄！']
  };
  const chips = [];
  if (passed) {
    chips.push(`<span class="chip gold">✨ 经验 +${r.xpGained}</span>`);
    if (r.isBest) chips.push(`<span class="chip gold">🏁 新纪录！</span>`);
    if (r.leveledUp) chips.push(`<span class="chip gold">⬆️ 升到 Lv.${r.level}</span>`);
    r.newBadges.forEach((b) => chips.push(`<span class="chip">${b.em} 新徽章「${b.name}」</span>`));
    r.newThemes.forEach((t) => chips.push(`<span class="chip">${t.em} 解锁主题「${t.name}」</span>`));
  } else {
    chips.push(`<span class="chip warn">准确率只有 ${r.acc}%，要 ≥ 50% 才能过关</span>`);
  }

  const nextId = nextLessonId(lessonId);
  const showNext = passed && nextId;

  const ov = document.createElement('div');
  ov.id = 'overlay';
  ov.className = 'overlay';
  ov.innerHTML = `
    <div class="modal">
      ${passed ? '' : '<div style="font-size:2.6rem">😟</div>'}
      <div class="result-stars">
        <span class="s ${r.stars >= 1 ? 'on' : ''}">★</span>
        <span class="s ${r.stars >= 2 ? 'on' : ''}">★</span>
        <span class="s ${r.stars >= 3 ? 'on' : ''}">★</span>
      </div>
      <div class="result-title">${pick(titlePool[r.stars] || titlePool[1])}</div>
      ${passed ? '' : '<p class="muted" style="margin-top:-6px">本关未通过，多练几次一定行！</p>'}
      <div class="result-grid">
        <div class="stat"><div class="v">${r.wpm}</div><div class="k">速度 WPM</div></div>
        <div class="stat"><div class="v">${r.acc}%</div><div class="k">准确率</div></div>
        <div class="stat"><div class="v">${r.maxCombo}</div><div class="k">最高连击</div></div>
      </div>
      <div class="reward">${chips.join('')}</div>
      <div class="row">
        <button class="btn ${passed ? 'ghost' : ''}" id="rRetry">🔁 再试一次</button>
        ${showNext ? `<button class="btn" id="rNext">➡️ 下一关</button>` : ''}
      </div>
      <div class="row"><button class="btn ghost" id="rHome" style="font-size:.85rem">🗺️ 返回地图</button></div>
    </div>`;
  document.body.appendChild(ov);

  if (passed) {
    confetti(r.stars >= 3 ? 180 : 110);
    Sound.star();
    if (r.leveledUp) setTimeout(() => Sound.levelUp(), 450);
  } else {
    Sound.wrong();
  }

  ov.querySelector('#rRetry').addEventListener('click', () => { Sound.click(); router.go('play', { lessonId }); });
  ov.querySelector('#rHome').addEventListener('click', () => { Sound.click(); router.go('home'); });
  ov.querySelector('#rNext')?.addEventListener('click', () => { Sound.click(); router.go('play', { lessonId: nextId }); });
}

/* 竞技场结算 */
function showArenaResult(r, lesson) {
  const chips = [`<span class="chip gold">✨ 经验 +${r.xpGained}</span>`];
  if (r.isBestWpm) chips.push(`<span class="chip gold">🏁 速度新纪录 ${r.bestWpm} WPM！</span>`);
  if (r.leveledUp) chips.push(`<span class="chip gold">⬆️ 升到 Lv.${r.level}</span>`);
  r.newBadges.forEach((b) => chips.push(`<span class="chip">${b.em} 新徽章「${b.name}」</span>`));

  const ov = document.createElement('div');
  ov.id = 'overlay';
  ov.className = 'overlay';
  ov.innerHTML = `
    <div class="modal">
      <div style="font-size:3rem">🏟️</div>
      <div class="result-title">${r.isBestWpm ? '新纪录！太强了！' : '挑战完成！'}</div>
      <div class="result-grid">
        <div class="stat"><div class="v">${r.wpm}</div><div class="k">本次 WPM</div></div>
        <div class="stat"><div class="v">${r.acc}%</div><div class="k">准确率</div></div>
        <div class="stat"><div class="v">${r.bestWpm}</div><div class="k">最佳 WPM</div></div>
      </div>
      <div class="reward">${chips.join('')}</div>
      <div class="row">
        <button class="btn" id="aAgain">🔁 再来一题</button>
        <button class="btn ghost" id="aHome">🗺️ 回地图</button>
      </div>
    </div>`;
  document.body.appendChild(ov);
  confetti(r.isBestWpm ? 180 : 100);
  Sound.star();
  if (r.leveledUp) setTimeout(() => Sound.levelUp(), 450);
  ov.querySelector('#aAgain').addEventListener('click', () => { Sound.click(); router.go('arena'); });
  ov.querySelector('#aHome').addEventListener('click', () => { Sound.click(); router.go('home'); });
}

/* ========================================================= */
/* 成就墙                                                     */
/* ========================================================= */
function showBadges() {
  const p = Store.getActive();
  const have = new Set(p.badges);
  const cards = BADGES.map((b) => `
    <div class="badge ${have.has(b.id) ? '' : 'locked'}">
      <div class="em">${b.em}</div>
      <div class="bn">${b.name}</div>
      <div class="bd">${b.desc}</div>
    </div>`).join('');
  root.innerHTML = topbar() + `
    <h2 class="section-h">🏅 成就墙 <span class="muted" style="font-size:1rem">已解锁 ${have.size}/${BADGES.length}</span></h2>
    <div class="badge-grid">${cards}</div>`;
  wireTopbar();
}

/* ========================================================= */
/* 设置                                                       */
/* ========================================================= */
function showSettings() {
  const p = Store.getActive();
  const sw = (on) => `<div class="switch ${on ? 'on' : ''}"></div>`;
  const themeDots = THEMES.map((t) => {
    const unlocked = isThemeUnlocked(p, t.id);
    const sel = p.settings.theme === t.id;
    return `<div class="theme-dot ${sel ? 'sel' : ''} ${unlocked ? '' : 'locked'}"
              data-theme="${t.id}" title="${t.name}${unlocked ? '' : `（累计 ${t.requiredStars} 星解锁）`}"
              style="background:${THEME_DOT[t.id]}"></div>`;
  }).join('');

  root.innerHTML = topbar() + `
    <h2 class="section-h">⚙️ 设置</h2>
    <div class="card" style="padding:6px 20px">
      <div class="setting" data-toggle="sound">
        <div><div class="lbl">🔊 音效</div><div class="desc">打字与过关的提示音</div></div>${sw(p.settings.sound)}
      </div>
      <div class="setting" data-toggle="kbHints">
        <div><div class="lbl">🎯 键盘提示</div><div class="desc">高亮下一个要按的键</div></div>${sw(p.settings.kbHints)}
      </div>
      <div class="setting" data-toggle="fingerColors">
        <div><div class="lbl">🌈 手指颜色</div><div class="desc">用颜色标出每个键该用哪根手指</div></div>${sw(p.settings.fingerColors)}
      </div>
      <div class="setting">
        <div><div class="lbl">🎨 主题皮肤</div><div class="desc">用星星解锁更多颜色</div></div>
        <div class="theme-opts">${themeDots}</div>
      </div>
    </div>

    <h2 class="section-h">💾 进度</h2>
    <div class="card" style="padding:18px 20px">
      <div class="row">
        <button class="btn ghost" id="exportBtn">⬇️ 导出进度</button>
        <button class="btn ghost" id="importBtn">⬆️ 导入进度</button>
      </div>
      <p class="muted" style="font-size:.82rem">导出会下载一个备份文件，可在其它设备导入，避免清理浏览器时丢失进度。</p>
    </div>

    <h2 class="section-h">🦸 英雄</h2>
    <div class="card" style="padding:18px 20px">
      <div class="row">
        <button class="btn ghost" data-go="profiles">🔄 切换英雄</button>
        <button class="btn ghost" id="resetBtn">♻️ 重置进度</button>
      </div>
    </div>
  `;
  wireTopbar();

  // 开关
  root.querySelectorAll('[data-toggle]').forEach((row) => {
    row.addEventListener('click', () => {
      const key = row.dataset.toggle;
      Store.update((pr) => { pr.settings[key] = !pr.settings[key]; });
      applyChrome();
      Sound.click();
      showSettings();
    });
  });

  // 主题
  root.querySelectorAll('.theme-dot').forEach((d) => {
    d.addEventListener('click', () => {
      const id = d.dataset.theme;
      if (!isThemeUnlocked(Store.getActive(), id)) { Sound.wrong(); return; }
      Store.update((pr) => { pr.settings.theme = id; });
      applyChrome();
      Sound.star();
      showSettings();
    });
  });

  // 导出
  root.querySelector('#exportBtn').addEventListener('click', () => {
    const data = Store.exportActive();
    if (!data) return;
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `typehero-${(p.name || 'hero').replace(/\s+/g, '_')}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    Sound.click();
  });

  // 导入
  root.querySelector('#importBtn').addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.addEventListener('change', () => {
      const file = input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          Store.importProfile(reader.result);
          mapPage = null;
          applyChrome();
          toast('导入成功！已切换到导入的英雄');
          router.go('home');
        } catch (e) {
          toast('导入失败：' + e.message);
        }
      };
      reader.readAsText(file);
    });
    input.click();
  });

  // 重置
  root.querySelector('#resetBtn').addEventListener('click', () => {
    Sound.click();
    confirmName(p.name, {
      title: '重置这个英雄的进度？',
      body: `「${esc(p.name)}」的星标、徽章、等级都会清零（昵称和头像保留）。<br>请输入该英雄的名字来确认：`,
      confirmText: '♻️ 确认重置',
      emoji: '😮'
    }, () => {
      Store.update((pr) => {
        pr.xp = 0; pr.stars = {}; pr.best = {}; pr.badges = [];
        pr.stats = { lessonsCompleted: 0, totalStars: 0, totalChars: 0, totalTimeMs: 0, bestWpm: 0, runs: 0 };
        pr.streak = { count: 0, lastDate: null };
        pr.arena = { bestWpm: 0, bestAcc: 0, runs: 0 };
        pr.unlocks = { themes: ['default'] };
        pr.settings.theme = 'default';
      });
      mapPage = null;
      applyChrome();
      toast('进度已重置');
      showSettings();
    });
  });
}

/* ========================================================= */
/* 路由 / 挂载                                                */
/* ========================================================= */
export const Screens = {
  mount(appEl, rt) {
    root = appEl;
    router = rt;
    document.addEventListener('keydown', (e) => { if (currentKeyHandler) currentKeyHandler(e); });
    document.addEventListener('pointerdown', () => Sound.unlock(), { once: true });
  },

  show(name, params = {}) {
    currentKeyHandler = null;
    removeOverlay();
    // 没有激活档案时，强制回到选英雄
    if (name !== 'profiles' && !Store.getActive()) name = 'profiles';
    if (name !== 'profiles') applyChrome();
    window.scrollTo(0, 0);

    switch (name) {
      case 'profiles': showProfiles(); break;
      case 'home': showHome(); break;
      case 'play': showPlay(params.lessonId); break;
      case 'arena': showArena(); break;
      case 'badges': showBadges(); break;
      case 'settings': showSettings(); break;
      default: showHome();
    }
  }
};
