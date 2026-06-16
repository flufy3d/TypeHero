/* =========================================================
   档案与进度存储（localStorage，无后端）
   - 支持多档案（多个孩子各自一份）
   - "离线登录" = 选中某个档案为 active
   ========================================================= */
import {
  levelForXp, xpForResult, evaluateBadges, newlyUnlockedThemes
} from '../gamify/achievements.js';

const KEY = 'typehero.v1';
let db = null;

function fresh() { return { activeProfileId: null, profiles: {} }; }

function load() {
  if (db) return db;
  try {
    const raw = localStorage.getItem(KEY);
    db = raw ? JSON.parse(raw) : fresh();
    if (!db || typeof db !== 'object' || !db.profiles) db = fresh();
  } catch {
    db = fresh();
  }
  Object.values(db.profiles).forEach(ensureShape);
  return db;
}

function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(db)); }
  catch (e) { console.warn('保存失败：', e); }
}

function uid() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return 'p' + Date.now().toString(36) + Math.random().toString(16).slice(2, 8);
}

function todayStr(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function newProfile(name, avatar, color) {
  return {
    id: uid(),
    name: (name || '小英雄').slice(0, 16),
    avatar: avatar || '🦸',
    color: color || 'default',
    createdAt: Date.now(),
    xp: 0,
    stars: {},          // { lessonId: bestStarCount }
    best: {},           // { lessonId: { wpm, acc } }
    badges: [],         // [badgeId]
    stats: { lessonsCompleted: 0, totalStars: 0, totalChars: 0, totalTimeMs: 0, bestWpm: 0, runs: 0 },
    streak: { count: 0, lastDate: null },
    arena: { bestWpm: 0, bestAcc: 0, runs: 0 },
    unlocks: { themes: ['default'] },
    settings: { sound: true, kbHints: true, fingerColors: true, theme: 'default' }
  };
}

// 为老档案补齐新增字段，避免升级后报错
function ensureShape(p) {
  if (!p || typeof p !== 'object') return;
  p.stars ||= {}; p.best ||= {}; p.badges ||= [];
  p.stats ||= {};
  const s = p.stats;
  s.lessonsCompleted ??= 0; s.totalStars ??= 0; s.totalChars ??= 0;
  s.totalTimeMs ??= 0; s.bestWpm ??= 0; s.runs ??= 0;
  p.streak ||= { count: 0, lastDate: null };
  p.arena ||= { bestWpm: 0, bestAcc: 0, runs: 0 };
  p.unlocks ||= { themes: ['default'] };
  if (!Array.isArray(p.unlocks.themes)) p.unlocks.themes = ['default'];
  if (!p.unlocks.themes.includes('default')) p.unlocks.themes.unshift('default');
  p.settings ||= {};
  const st = p.settings;
  st.sound ??= true; st.kbHints ??= true; st.fingerColors ??= true; st.theme ??= 'default';
  if (typeof p.xp !== 'number') p.xp = 0;
}

export const Store = {
  listProfiles() {
    return Object.values(load().profiles).sort((a, b) => a.createdAt - b.createdAt);
  },

  getActive() {
    const d = load();
    return d.activeProfileId ? d.profiles[d.activeProfileId] || null : null;
  },

  setActive(id) {
    const d = load();
    if (d.profiles[id]) { d.activeProfileId = id; persist(); }
    return this.getActive();
  },

  createProfile(name, avatar, color) {
    const d = load();
    const p = newProfile(name, avatar, color);
    d.profiles[p.id] = p;
    d.activeProfileId = p.id;
    persist();
    return p;
  },

  deleteProfile(id) {
    const d = load();
    delete d.profiles[id];
    if (d.activeProfileId === id) d.activeProfileId = null;
    persist();
  },

  // 修改当前档案并保存
  update(mutator) {
    const p = this.getActive();
    if (!p) return null;
    mutator(p);
    persist();
    return p;
  },

  save() { persist(); },

  /* 记录一关成绩，返回用于结算页展示的汇总
     result: { stars, wpm, acc, chars, timeMs, maxCombo, lessonId } */
  recordResult(result) {
    const p = this.getActive();
    if (!p) return null;

    const prevStars = p.stars[result.lessonId] || 0;
    const firstClear = prevStars === 0;

    // 星标取历史最佳，并把提升量计入累计星数
    if (result.stars > prevStars) {
      p.stats.totalStars += result.stars - prevStars;
      p.stars[result.lessonId] = result.stars;
    }

    // 个人最佳（按 WPM）
    const prevBest = p.best[result.lessonId];
    const isBest = !prevBest || result.wpm > prevBest.wpm;
    if (isBest) p.best[result.lessonId] = { wpm: result.wpm, acc: result.acc };

    // 累计统计
    if (firstClear) p.stats.lessonsCompleted += 1;
    p.stats.runs += 1;
    p.stats.totalChars += result.chars;
    p.stats.totalTimeMs += result.timeMs;
    p.stats.bestWpm = Math.max(p.stats.bestWpm, result.wpm);

    // 每日连续打卡（每天首次完成才 +1）
    const today = todayStr();
    if (p.streak.lastDate !== today) {
      const yesterday = todayStr(new Date(Date.now() - 86400000));
      p.streak.count = p.streak.lastDate === yesterday ? p.streak.count + 1 : 1;
      p.streak.lastDate = today;
    }

    // 经验与升级
    const xpGained = xpForResult(result);
    const oldLevel = levelForXp(p.xp);
    p.xp += xpGained;
    const newLevel = levelForXp(p.xp);
    const leveledUp = newLevel > oldLevel;

    // 新徽章（在统计更新之后判定）
    const newBadges = evaluateBadges(p, result);
    newBadges.forEach((b) => p.badges.push(b.id));

    // 新解锁主题
    const newThemes = newlyUnlockedThemes(p);
    newThemes.forEach((t) => p.unlocks.themes.push(t.id));

    persist();

    return {
      ...result,
      prevStars, firstClear, isBest,
      xpGained, level: newLevel, leveledUp,
      newBadges, newThemes
    };
  },

  /* 竞技场成绩：刷新个人纪录，不影响关卡星标 */
  recordArenaResult(result) {
    const p = this.getActive();
    if (!p) return null;
    p.arena ||= { bestWpm: 0, bestAcc: 0, runs: 0 };
    p.arena.runs += 1;
    const isBestWpm = result.wpm > p.arena.bestWpm;
    if (isBestWpm) p.arena.bestWpm = result.wpm;
    if (result.acc > p.arena.bestAcc) p.arena.bestAcc = result.acc;

    p.stats.bestWpm = Math.max(p.stats.bestWpm, result.wpm);
    p.stats.runs += 1;
    p.stats.totalChars += result.chars;
    p.stats.totalTimeMs += result.timeMs;

    const xpGained = result.stars * 6 + 4;
    const oldLevel = levelForXp(p.xp);
    p.xp += xpGained;
    const newLevel = levelForXp(p.xp);

    const newBadges = evaluateBadges(p, result);
    newBadges.forEach((b) => p.badges.push(b.id));

    persist();
    return {
      ...result, isBestWpm,
      bestWpm: p.arena.bestWpm, bestAcc: p.arena.bestAcc, runs: p.arena.runs,
      xpGained, level: newLevel, leveledUp: newLevel > oldLevel, newBadges
    };
  },

  /* ---- 进度备份：导出 / 导入 ---- */
  exportActive() {
    const p = this.getActive();
    if (!p) return null;
    return JSON.stringify({ app: 'typehero', v: 1, profile: p }, null, 2);
  },

  importProfile(jsonText) {
    const data = JSON.parse(jsonText);
    const p = data.profile || data;
    if (!p || !p.stats || !p.settings) throw new Error('文件格式不正确');
    const d = load();
    p.id = uid();                       // 重新分配 id，避免覆盖
    p.name = (p.name || '导入英雄') + ' (导入)';
    d.profiles[p.id] = p;
    d.activeProfileId = p.id;
    persist();
    return p;
  }
};
