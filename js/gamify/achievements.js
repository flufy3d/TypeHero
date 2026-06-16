/* =========================================================
   游戏化：经验/等级、徽章、解锁主题
   纯逻辑模块——数据由调用方传入，不直接读 localStorage
   ========================================================= */
import { WORLDS, isWorldComplete } from '../data/lessons.js';

/* ---------- 经验与等级（每级 100 经验） ---------- */
const XP_PER_LEVEL = 100;

export function levelForXp(xp) {
  return 1 + Math.floor((xp || 0) / XP_PER_LEVEL);
}

export function levelProgress(xp) {
  const into = (xp || 0) % XP_PER_LEVEL;
  return {
    level: levelForXp(xp),
    intoLevel: into,
    span: XP_PER_LEVEL,
    toNext: XP_PER_LEVEL - into,
    pct: Math.round((into / XP_PER_LEVEL) * 100)
  };
}

// 每次完成一关获得的经验
export function xpForResult(result) {
  return result.stars * 10 + 5;
}

/* ---------- 徽章 ----------
   每个 check(ctx) 接收 { profile, result }
   profile 为已更新统计后的档案；result 为本次成绩
*/
export const BADGES = [
  { id: 'first_win', em: '🎬', name: '初次登场', desc: '完成第一关',
    check: (c) => c.profile.stats.lessonsCompleted >= 1 },
  { id: 'three_star', em: '🌟', name: '三星闪耀', desc: '在一关中拿到三颗星',
    check: (c) => c.result.stars >= 3 },
  { id: 'perfect', em: '💯', name: '完美无错', desc: '一关 100% 准确率',
    check: (c) => c.result.acc >= 100 },
  { id: 'combo30', em: '🔥', name: '连击大师', desc: '单关连续打对 30 个',
    check: (c) => c.result.maxCombo >= 30 },
  { id: 'speed20', em: '🚀', name: '小火箭', desc: '速度达到 20 WPM',
    check: (c) => c.profile.stats.bestWpm >= 20 },
  { id: 'speed35', em: '✈️', name: '飞行员', desc: '速度达到 35 WPM',
    check: (c) => c.profile.stats.bestWpm >= 35 },
  { id: 'speed50', em: '🚄', name: '高铁速度', desc: '速度达到 50 WPM',
    check: (c) => c.profile.stats.bestWpm >= 50 },
  { id: 'world1', em: '🏆', name: '通关达人', desc: '完整通关一个世界',
    check: (c) => WORLDS.some((w) => isWorldComplete(c.profile, w.id)) },
  { id: 'collector', em: '🎨', name: '皮肤收藏家', desc: '解锁一个新主题',
    check: (c) => (c.profile.unlocks.themes || []).length >= 2 },
  { id: 'streak3', em: '📅', name: '坚持三天', desc: '连续 3 天来练习',
    check: (c) => c.profile.streak.count >= 3 },
  { id: 'streak7', em: '🗓️', name: '一周不断', desc: '连续 7 天来练习',
    check: (c) => c.profile.streak.count >= 7 },
  { id: 'stars30', em: '⭐', name: '集星 30', desc: '累计获得 30 颗星',
    check: (c) => c.profile.stats.totalStars >= 30 },
  { id: 'graduate', em: '🎓', name: '打字英雄', desc: '通关全部世界',
    check: (c) => WORLDS.every((w) => isWorldComplete(c.profile, w.id)) }
];

export function getBadge(id) {
  return BADGES.find((b) => b.id === id) || null;
}

// 返回本次「新获得」的徽章对象（未在 profile.badges 中且条件达成）
export function evaluateBadges(profile, result) {
  const ctx = { profile, result };
  const have = new Set(profile.badges || []);
  return BADGES.filter((b) => !have.has(b.id) && b.check(ctx));
}

/* ---------- 主题皮肤（按累计星数解锁） ---------- */
export const THEMES = [
  { id: 'default', name: '经典紫', em: '🟣', requiredStars: 0 },
  { id: 'ocean',   name: '海洋蓝', em: '🌊', requiredStars: 5 },
  { id: 'forest',  name: '森林绿', em: '🌲', requiredStars: 15 },
  { id: 'candy',   name: '糖果粉', em: '🍬', requiredStars: 30 },
  { id: 'sunset',  name: '日落橙', em: '🌅', requiredStars: 50 },
  { id: 'cosmos',  name: '星空紫', em: '🌌', requiredStars: 70 }
];

export function getTheme(id) {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}

export function isThemeUnlocked(profile, id) {
  if (id === 'default') return true;
  return (profile.unlocks.themes || []).includes(id);
}

// 根据累计星数，找出「刚刚解锁」的主题（还没记入 unlocks 的）
export function newlyUnlockedThemes(profile) {
  const have = new Set(profile.unlocks.themes || []);
  return THEMES.filter(
    (t) => t.requiredStars > 0 && profile.stats.totalStars >= t.requiredStars && !have.has(t.id)
  );
}
