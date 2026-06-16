/* =========================================================
   界面渲染：选英雄 / 世界地图 / 练习 / 结算 / 成就墙 / 设置
   ========================================================= */
import { Store } from '../state/store.js';
import {
  WORLDS, getLesson, worldOf, nextLessonId, isLessonUnlocked,
  worldStars, worldMaxStars
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

const AVATARS = ['🦸', '🦹', '🦊', '🐱', '🐯', '🐲', '🦄', '🐼', '🐧', '🤖', '🐢', '🦉', '🐙', '🦁', '🐵', '🐰'];
const THEME_DOT = { default: '#6c5ce7', ocean: '#00b4d8', forest: '#2d9d57', candy: '#ff5fa2', sunset: '#ff7b36', cosmos: '#8e7dff' };

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
      applyChrome();
      router.go('home');
    });
  });
  root.querySelectorAll('[data-del]').forEach((b) => {
    b.addEventListener('click', () => {
      const p = Store.listProfiles().find((x) => x.id === b.dataset.del);
      if (confirm(`确定删除「${p?.name}」吗？该英雄的进度会被清除，且无法恢复。`)) {
        Store.deleteProfile(b.dataset.del);
        showProfiles();
      }
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
  const worldsHtml = WORLDS.map((w) => {
    const got = worldStars(p, w.id);
    const max = worldMaxStars(w.id);
    const nodes = w.lessons.map((l, i) => {
      const unlocked = isLessonUnlocked(p, l.id);
      const s = p.stars[l.id] || 0;
      return `
        <div class="node ${unlocked ? (s > 0 ? 'done' : '') : 'locked'}" data-lesson="${unlocked ? l.id : ''}">
          ${unlocked ? `
            <div class="num">${i + 1}</div>
            <div class="lab">${esc(l.title)}</div>
            <div class="stars">${starRow(s)}</div>`
            : `<div class="lock">🔒</div><div class="lab">${esc(l.title)}</div>`}
        </div>`;
    }).join('');
    return `
      <section class="world card">
        <div class="world-head">
          <span class="world-emoji">${w.emoji}</span>
          <span class="world-name">${esc(w.name)}</span>
          <span class="world-prog">⭐ ${got}/${max}</span>
        </div>
        <p class="tip">${esc(w.intro)}</p>
        <div class="nodes">${nodes}</div>
      </section>`;
  }).join('');

  root.innerHTML = topbar() + `<div>${worldsHtml}</div>`;
  wireTopbar();
  root.querySelectorAll('.node[data-lesson]').forEach((n) => {
    if (!n.dataset.lesson) return;
    n.addEventListener('click', () => { Sound.click(); router.go('play', { lessonId: n.dataset.lesson }); });
  });
}

/* ========================================================= */
/* 练习                                                       */
/* ========================================================= */
function showPlay(lessonId) {
  const p = Store.getActive();
  const lesson = getLesson(lessonId);
  if (!lesson || !isLessonUnlocked(p, lessonId)) { router.go('home'); return; }
  const world = worldOf(lessonId);

  root.innerHTML = `
    <div class="play-head card" style="padding:12px 16px">
      <button class="btn ghost" id="backBtn">← 返回</button>
      <span class="mascot" id="mascot">🙂</span>
      <div>
        <div class="lesson-title">${world.emoji} ${esc(lesson.title)}</div>
        <div class="muted" style="font-size:.8rem">${esc(world.name)}</div>
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

  const session = createSession(lesson, {
    onUpdate(snap) {
      renderText(snap.index, snap.lastWrong);
      keyboard.highlightNext(snap.expected);
      sAcc.textContent = snap.acc;
      sWpm.textContent = snap.wpm;
      sCombo.textContent = snap.combo;
      prog.style.width = Math.round((snap.index / snap.total) * 100) + '%';
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
      const summary = Store.recordResult(result);
      showResult(summary, lessonId);
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

/* ========================================================= */
/* 结算                                                       */
/* ========================================================= */
function showResult(r, lessonId) {
  const titlePool = {
    3: ['太棒了！', '完美表现！', '你是打字小英雄！'],
    2: ['做得很好！', '越来越熟练啦！', '继续加油！'],
    1: ['完成啦！', '再练一次会更棒～', '慢慢来，你可以的！']
  };
  const chips = [];
  chips.push(`<span class="chip gold">✨ 经验 +${r.xpGained}</span>`);
  if (r.isBest) chips.push(`<span class="chip gold">🏁 新纪录！</span>`);
  if (r.leveledUp) chips.push(`<span class="chip gold">⬆️ 升到 Lv.${r.level}</span>`);
  r.newBadges.forEach((b) => chips.push(`<span class="chip">${b.em} 新徽章「${b.name}」</span>`));
  r.newThemes.forEach((t) => chips.push(`<span class="chip">${t.em} 解锁主题「${t.name}」</span>`));

  const nextId = nextLessonId(lessonId);

  const ov = document.createElement('div');
  ov.id = 'overlay';
  ov.className = 'overlay';
  ov.innerHTML = `
    <div class="modal">
      <div class="result-stars">
        <span class="s ${r.stars >= 1 ? 'on' : ''}">★</span>
        <span class="s ${r.stars >= 2 ? 'on' : ''}">★</span>
        <span class="s ${r.stars >= 3 ? 'on' : ''}">★</span>
      </div>
      <div class="result-title">${pick(titlePool[r.stars])}</div>
      <div class="result-grid">
        <div class="stat"><div class="v">${r.wpm}</div><div class="k">速度 WPM</div></div>
        <div class="stat"><div class="v">${r.acc}%</div><div class="k">准确率</div></div>
        <div class="stat"><div class="v">${r.maxCombo}</div><div class="k">最高连击</div></div>
      </div>
      <div class="reward">${chips.join('')}</div>
      <div class="row">
        <button class="btn ghost" id="rRetry">🔁 再来一次</button>
        ${nextId ? `<button class="btn" id="rNext">➡️ 下一关</button>` : `<button class="btn" id="rMap">🗺️ 回地图</button>`}
      </div>
      <div class="row"><button class="btn ghost" id="rHome" style="font-size:.85rem">🗺️ 返回地图</button></div>
    </div>`;
  document.body.appendChild(ov);

  confetti(r.stars >= 3 ? 180 : 110);
  Sound.star();
  if (r.leveledUp) setTimeout(() => Sound.levelUp(), 450);

  ov.querySelector('#rRetry').addEventListener('click', () => { Sound.click(); router.go('play', { lessonId }); });
  ov.querySelector('#rHome').addEventListener('click', () => { Sound.click(); router.go('home'); });
  ov.querySelector('#rNext')?.addEventListener('click', () => { Sound.click(); router.go('play', { lessonId: nextId }); });
  ov.querySelector('#rMap')?.addEventListener('click', () => { Sound.click(); router.go('home'); });
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
          applyChrome();
          alert('导入成功！已切换到导入的英雄。');
          router.go('home');
        } catch (e) {
          alert('导入失败：' + e.message);
        }
      };
      reader.readAsText(file);
    });
    input.click();
  });

  // 重置
  root.querySelector('#resetBtn').addEventListener('click', () => {
    if (!confirm('确定要清空这个英雄的所有进度吗？（昵称和头像会保留）')) return;
    Store.update((pr) => {
      pr.xp = 0; pr.stars = {}; pr.best = {}; pr.badges = [];
      pr.stats = { lessonsCompleted: 0, totalStars: 0, totalChars: 0, totalTimeMs: 0, bestWpm: 0, runs: 0 };
      pr.streak = { count: 0, lastDate: null };
      pr.unlocks = { themes: ['default'] };
      pr.settings.theme = 'default';
    });
    applyChrome();
    showSettings();
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
      case 'badges': showBadges(); break;
      case 'settings': showSettings(); break;
      default: showHome();
    }
  }
};
