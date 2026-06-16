/* =========================================================
   课程数据：世界(World) → 关卡(Lesson)
   - title 中文，target 为要打的英文内容
   - targetWpm 用于评 3 星的速度门槛
   想增删关卡/调难度，改这里即可。
   ========================================================= */

export const WORLDS = [
  {
    id: 'home', name: '基础指法岛', emoji: '🏝️',
    intro: '把左手放 A S D F、右手放 J K L ;。摸到 F 和 J 上的小凸起就找对位置啦！',
    lessons: [
      { id: 'home-1', title: 'F 与 J 定位', tip: '食指：左手按 F，右手按 J', target: 'fff jjj fff jjj fj fj jf jf fjfj jfjf', targetWpm: 12 },
      { id: 'home-2', title: 'D 与 K', tip: '中指负责 D 和 K', target: 'ddd kkk dkdk kdkd dk kd dkkd kddk', targetWpm: 12 },
      { id: 'home-3', title: 'S 与 L', tip: '无名指负责 S 和 L', target: 'sss lll slsl lsls sl ls slls lssl', targetWpm: 12 },
      { id: 'home-4', title: 'A 与 ;', tip: '小指负责 A 和 分号', target: 'aaa ;;; a;a; ;a;a a; ;a a;;a ;aa;', targetWpm: 12 },
      { id: 'home-5', title: 'G 与 H', tip: '食指伸一下：G 给左手，H 给右手', target: 'ggg hhh ghgh hghg gh hg ghhg hggh', targetWpm: 13 },
      { id: 'home-6', title: '中排大混合', tip: '保持手指放在原位哦', target: 'asdf jkl; gh fjdk sla; ghjk asdf jkl;', targetWpm: 14 },
      { id: 'home-7', title: '中排小单词', tip: '全部用中排手指完成', target: 'as ask dad sad all fall hall lash flask glad', targetWpm: 15 },
      { id: 'home-boss', boss: true, emoji: '🦀', title: '寄居蟹船长', tip: '用中排所有手指打败螃蟹船长！', target: 'a glad lass had a flask; dad asks all sad lads', targetWpm: 16 }
    ]
  },
  {
    id: 'top', name: '上排高原', emoji: '⛰️',
    intro: '手指从中排往上一格，记得打完回到 F J 原位！',
    lessons: [
      { id: 'top-1', title: 'Q W E R', tip: '左手四指，从小指到食指', target: 'qqq www eee rrr qwer qwer we er we re', targetWpm: 14 },
      { id: 'top-2', title: 'T Y U I O P', tip: '右手回家，别忘了原位', target: 'ttt yyy uuu iii ooo ppp type tour', targetWpm: 14 },
      { id: 'top-3', title: '上排连打', tip: '眼睛看屏幕，不看键盘', target: 'we type were tower equip your quiet pretty', targetWpm: 15 },
      { id: 'top-4', title: '上排单词', tip: '一个词一个词来', target: 'tree power write outer rope quote your true', targetWpm: 16 },
      { id: 'top-5', title: '中+上排', tip: '两排一起用', target: 'the they tea read seat hear rate hate three', targetWpm: 17 },
      { id: 'top-boss', boss: true, emoji: '🦅', title: '高原飞鹰', tip: '中上两排联动，稳住节奏！', target: 'we type quiet poetry, your true power is upper', targetWpm: 18 }
    ]
  },
  {
    id: 'bottom', name: '下排丛林', emoji: '🌴',
    intro: '手指往下一格探险，打完依然回到中排哦！',
    lessons: [
      { id: 'bot-1', title: 'Z X C V B', tip: '左手下排五个键', target: 'zzz xxx ccc vvv bbb zxcv vex box cab', targetWpm: 14 },
      { id: 'bot-2', title: 'N M 与逗号句号', tip: '右手下排', target: 'nnn mmm man mob nob ban men mind name', targetWpm: 14 },
      { id: 'bot-3', title: '下排连打', tip: '稳稳地敲', target: 'van cab numb mix zoom comb brave clever', targetWpm: 15 },
      { id: 'bot-4', title: '三排大冒险', tip: '中、上、下排都用上', target: 'number combine velvet bronze maze vivid', targetWpm: 16 },
      { id: 'bot-5', title: '逗号和句号', tip: '逗号用右中指，句号用右无名指', target: 'cats, dogs. run, jump. yes, no. go now.', targetWpm: 16 },
      { id: 'bot-boss', boss: true, emoji: '🐍', title: '丛林巨蟒', tip: '三排联动，别看键盘！', target: 'brave zebras mixed seven vivid number combos', targetWpm: 18 }
    ]
  },
  {
    id: 'num', name: '数字星空', emoji: '🌌',
    intro: '数字在最上面一行，手指要伸长一点点，敲完马上回原位！',
    lessons: [
      { id: 'num-1', title: '1 2 3', tip: '左手：小指1、无名2、中指3', target: '111 222 333 123 321 12 23 13 132', targetWpm: 11 },
      { id: 'num-2', title: '4 5 6', tip: '4 5 用左食指，6 用右食指', target: '444 555 666 456 654 45 56 46 564', targetWpm: 11 },
      { id: 'num-3', title: '7 8 9 0', tip: '右手：食7、中8、无名9、小指0', target: '777 888 999 000 7890 0987 78 90', targetWpm: 11 },
      { id: 'num-4', title: '数字大混合', tip: '别低头，凭感觉找', target: '1 22 333 4444 90 80 70 60 50 19 28', targetWpm: 12 },
      { id: 'num-5', title: '数字应用', tip: '字母和数字一起来', target: 'room 101 year 2025 call 911 buy 3 get 1', targetWpm: 14 },
      { id: 'num-boss', boss: true, emoji: '👾', title: '数字怪兽', tip: '数字和字母交替来！', target: 'call 911 in 2025, room 404 has 28 new toys', targetWpm: 14 }
    ]
  },
  {
    id: 'caps', name: '大写符号城', emoji: '🏰',
    intro: '按住 Shift 再敲字母就是大写！左边字母用右手 Shift，右边字母用左手 Shift。',
    lessons: [
      { id: 'cap-1', title: '首字母大写', tip: '用对面的 Shift 更顺手', target: 'Cat Dog Sun Moon Star Tree Fish Bird', targetWpm: 13 },
      { id: 'cap-2', title: '名字与地点', tip: '专有名词都要大写', target: 'Tom Mia Leo Anna China Paris Tokyo', targetWpm: 14 },
      { id: 'cap-3', title: '句子开头大写', tip: '句号结尾，下句再大写', target: 'I am happy. We can play. You are kind.', targetWpm: 15 },
      { id: 'cap-4', title: '问号与叹号', tip: '感叹用 Shift+1，问号在右下', target: 'Wow! Really? Yes! Are you ok? Great job!', targetWpm: 15 },
      { id: 'cap-5', title: '标点大综合', tip: '注意逗号、撇号和大小写', target: "Hello, friend! How are you? I'm fine, thanks.", targetWpm: 16 },
      { id: 'cap-boss', boss: true, emoji: '🐲', title: '符号巨龙', tip: '大写、逗号、问号、叹号全都要！', target: "Wow, Tom! Are you ready? Yes, let's go now!", targetWpm: 16 }
    ]
  },
  {
    id: 'words', name: '单词工坊', emoji: '🧩',
    intro: '这些是英语里最常见的词，记住它们的手感，打字会越来越快！',
    lessons: [
      { id: 'wrd-1', title: '高频词 ①', tip: '别看键盘，相信手指', target: 'the and you that was for are with his they', targetWpm: 18 },
      { id: 'wrd-2', title: '高频词 ②', tip: '节奏均匀', target: 'this have from one had word but not what all', targetWpm: 18 },
      { id: 'wrd-3', title: '高频词 ③', tip: '错了不要紧，打对再继续', target: 'were when your can said there use each which', targetWpm: 19 },
      { id: 'wrd-4', title: '高频词 ④', tip: '稳定比快更重要', target: 'she will many about how then them these some', targetWpm: 20 },
      { id: 'wrd-5', title: '常用短语', tip: '一组一组地打', target: 'in the morning at school with my friends every day', targetWpm: 20 },
      { id: 'wrd-boss', boss: true, emoji: '🤖', title: '词汇机器人', tip: '高频词连打，冲刺！', target: 'they will use these words about your school every day', targetWpm: 22 }
    ]
  },
  {
    id: 'sent', name: '句子王国', emoji: '📜',
    intro: '现在来打完整的句子吧，注意空格、大写和句号！',
    lessons: [
      { id: 'sen-1', title: '小猫与垫子', tip: '注意句号', target: 'A smart cat sat on a soft mat.', targetWpm: 20 },
      { id: 'sen-2', title: '公园游戏', tip: '空格用大拇指', target: 'We love to play games in the park.', targetWpm: 21 },
      { id: 'sen-3', title: '蓝天白云', tip: '保持节奏', target: 'The sun is bright and the sky is blue.', targetWpm: 21 },
      { id: 'sen-4', title: '我的小狗', tip: '别低头看键盘', target: 'My dog can run very fast and jump high.', targetWpm: 22 },
      { id: 'sen-5', title: '读书真好', tip: '一气呵成', target: 'Reading books makes me feel happy and smart.', targetWpm: 22 },
      { id: 'sen-6', title: '神奇全字母句', tip: '这句话用到了 26 个字母！', target: 'The quick brown fox jumps over the lazy dog.', targetWpm: 23 },
      { id: 'sen-boss', boss: true, emoji: '🦉', title: '智慧猫头鹰', tip: '完整句子，注意大写和句号', target: 'The wise owl reads many good books under a bright moon.', targetWpm: 24 }
    ]
  },
  {
    id: 'speed', name: '极速挑战', emoji: '⚡',
    intro: '终极考验！又快又准才能拿到三颗星，加油打字小英雄！',
    lessons: [
      { id: 'spd-1', title: '成为打字英雄', tip: '相信自己', target: 'Practice every day to become a typing hero!', targetWpm: 26 },
      { id: 'spd-2', title: '飞快的手指', tip: '眼睛盯屏幕', target: 'Fast fingers win the race, so keep your eyes on the screen.', targetWpm: 27 },
      { id: 'spd-3', title: '调皮的斑马', tip: '又一句全字母句', target: 'How vexingly quick daft zebras jump!', targetWpm: 27 },
      { id: 'spd-4', title: '相信你自己', tip: '深呼吸，开始', target: 'Believe in yourself and you can do amazing things.', targetWpm: 28 },
      { id: 'spd-5', title: '五位魔法师', tip: '最后的全字母句挑战', target: 'The five boxing wizards jump quickly every night.', targetWpm: 28 },
      { id: 'spd-boss', boss: true, final: true, emoji: '👑', title: '字母之王', tip: '集结所有本领，打败字母之王！', target: 'The quick brown fox and five boxing wizards jump over my lazy dog!', targetWpm: 30 }
    ]
  }
];

/* ---------- 派生与辅助 ---------- */

// 按世界顺序展平的关卡列表（决定解锁顺序）
export const ALL_LESSONS = WORLDS.flatMap((w) =>
  w.lessons.map((l) => ({ ...l, worldId: w.id }))
);

const INDEX = new Map(ALL_LESSONS.map((l, i) => [l.id, i]));

export function getLesson(id) {
  const i = INDEX.get(id);
  return i == null ? null : ALL_LESSONS[i];
}

export function worldOf(lessonId) {
  const l = getLesson(lessonId);
  return l ? WORLDS.find((w) => w.id === l.worldId) : null;
}

export function nextLessonId(id) {
  const i = INDEX.get(id);
  if (i == null || i + 1 >= ALL_LESSONS.length) return null;
  return ALL_LESSONS[i + 1].id;
}

// 解锁规则：第一关永远开放；其余需要前一关至少 1 星
export function isLessonUnlocked(profile, id) {
  const i = INDEX.get(id);
  if (i == null) return false;
  if (i === 0) return true;
  const prev = ALL_LESSONS[i - 1];
  return (profile.stars?.[prev.id] || 0) >= 1;
}

export function worldStars(profile, worldId) {
  const w = WORLDS.find((x) => x.id === worldId);
  if (!w) return 0;
  return w.lessons.reduce((s, l) => s + (profile.stars?.[l.id] || 0), 0);
}

export function worldMaxStars(worldId) {
  const w = WORLDS.find((x) => x.id === worldId);
  return w ? w.lessons.length * 3 : 0;
}

export function isWorldComplete(profile, worldId) {
  const w = WORLDS.find((x) => x.id === worldId);
  return !!w && w.lessons.every((l) => (profile.stars?.[l.id] || 0) >= 1);
}

// 评星：完成=1 星；准确率≥90%=2 星；准确率≥97% 且达到速度门槛=3 星
export function computeStars(acc, wpm, targetWpm) {
  if (acc >= 97 && wpm >= targetWpm) return 3;
  if (acc >= 90) return 2;
  return 1;
}

export const BOSS_IDS = ALL_LESSONS.filter((l) => l.boss).map((l) => l.id);
export function isBoss(id) { const l = getLesson(id); return !!(l && l.boss); }

// 是否通关全部世界（含每个世界的 Boss）—— 用于解锁竞技场
export function allWorldsComplete(profile) {
  return WORLDS.every((w) => isWorldComplete(profile, w.id));
}

// 竞技场题库：通关后反复挑战，每次随机抽一题刷新纪录
export const ARENA_CHALLENGES = [
  { title: '全字母句 · 棕狐', target: 'The quick brown fox jumps over the lazy dog.', targetWpm: 32 },
  { title: '全字母句 · 斑马', target: 'How vexingly quick daft zebras jump!', targetWpm: 32 },
  { title: '全字母句 · 黑石', target: 'Sphinx of black quartz, judge my vow.', targetWpm: 32 },
  { title: '全字母句 · 魔法师', target: 'The five boxing wizards jump quickly.', targetWpm: 32 },
  { title: '冲刺 · 打字英雄', target: 'Practice every day to become a typing hero!', targetWpm: 34 },
  { title: '冲刺 · 相信自己', target: 'Believe in yourself and you can do amazing things.', targetWpm: 34 },
  { title: '冲刺 · 飞快手指', target: 'Fast fingers win the race every single time you try.', targetWpm: 34 },
  { title: '终极 · 字母之王', target: 'The quick brown fox and five boxing wizards jump over my lazy dog!', targetWpm: 36 }
];
