/* =========================================================
   打字引擎：管理单关的一次练习
   - 必须打对当前字符才前进（更利于练准确度）
   - 实时计算 WPM、准确率、连击
   ========================================================= */
import { computeStars } from '../data/lessons.js';

export function createSession(lesson, { onUpdate, onComplete } = {}) {
  const target = lesson.target;
  let index = 0;     // 已正确输入的字符数（即下一个待打位置）
  let errors = 0;    // 错误按键次数
  let combo = 0;
  let maxCombo = 0;
  let startTime = 0; // 首次按键开始计时
  let done = false;

  const elapsedMs = () => (startTime ? performance.now() - startTime : 0);

  function wpm() {
    const minutes = elapsedMs() / 60000;
    if (minutes <= 0) return 0;
    return Math.min(300, Math.round((index / 5) / minutes)); // 每 5 个字符算一个词，封顶 300
  }

  function acc() {
    const total = index + errors;
    return total === 0 ? 100 : Math.round((index / total) * 100);
  }

  function snapshot(lastWrong) {
    return {
      index, errors, combo, maxCombo,
      total: target.length,
      expected: target[index],
      wpm: wpm(), acc: acc(),
      lastWrong: !!lastWrong
    };
  }

  function finish() {
    const finalWpm = wpm();
    const finalAcc = acc();
    onComplete?.({
      lessonId: lesson.id,
      stars: computeStars(finalAcc, finalWpm, lesson.targetWpm),
      wpm: finalWpm,
      acc: finalAcc,
      chars: target.length,
      timeMs: Math.round(elapsedMs()),
      maxCombo
    });
  }

  function handleChar(ch) {
    if (done) return;
    if (!startTime) startTime = performance.now();

    if (ch === target[index]) {
      index++;
      combo++;
      if (combo > maxCombo) maxCombo = combo;
      if (index >= target.length) {
        done = true;
        onUpdate?.(snapshot(false));
        finish();
        return;
      }
      onUpdate?.(snapshot(false));
    } else {
      errors++;
      combo = 0;
      onUpdate?.(snapshot(true));
    }
  }

  return {
    handleChar,
    snapshot: () => snapshot(false),
    get expected() { return target[index]; },
    get isDone() { return done; }
  };
}
