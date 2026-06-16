/* =========================================================
   屏幕键盘：渲染 QWERTY + 手指配色 + 高亮下一个待按键
   ========================================================= */

// 每个键：[键值id, 显示标签, 手指类, 额外类]
// 手指类：f-lp 左小指 / f-lr 左无名 / f-lm 左中 / f-li 左食 /
//        f-ri 右食 / f-rm 右中 / f-rr 右无名 / f-rp 右小指 / f-th 拇指
const ROWS = [
  [
    ['`', '`', 'f-lp'], ['1', '1', 'f-lp'], ['2', '2', 'f-lr'], ['3', '3', 'f-lm'],
    ['4', '4', 'f-li'], ['5', '5', 'f-li'], ['6', '6', 'f-ri'], ['7', '7', 'f-ri'],
    ['8', '8', 'f-rm'], ['9', '9', 'f-rr'], ['0', '0', 'f-rp'], ['-', '-', 'f-rp'],
    ['=', '=', 'f-rp'], ['Backspace', '⌫', 'f-rp', 'wide']
  ],
  [
    ['Tab', 'Tab', 'f-lp', 'wide'], ['q', 'Q', 'f-lp'], ['w', 'W', 'f-lr'], ['e', 'E', 'f-lm'],
    ['r', 'R', 'f-li'], ['t', 'T', 'f-li'], ['y', 'Y', 'f-ri'], ['u', 'U', 'f-ri'],
    ['i', 'I', 'f-rm'], ['o', 'O', 'f-rr'], ['p', 'P', 'f-rp'], ['[', '[', 'f-rp'],
    [']', ']', 'f-rp'], ['\\', '\\', 'f-rp', 'wide']
  ],
  [
    ['Caps', 'Caps', 'f-lp', 'wide'], ['a', 'A', 'f-lp'], ['s', 'S', 'f-lr'], ['d', 'D', 'f-lm'],
    ['f', 'F', 'f-li', 'bump'], ['g', 'G', 'f-li'], ['h', 'H', 'f-ri'], ['j', 'J', 'f-ri', 'bump'],
    ['k', 'K', 'f-rm'], ['l', 'L', 'f-rr'], [';', ';', 'f-rp'], ["'", "'", 'f-rp'],
    ['Enter', '↵', 'f-rp', 'wide']
  ],
  [
    ['ShiftL', 'Shift', 'f-lp', 'wide'], ['z', 'Z', 'f-lp'], ['x', 'X', 'f-lr'], ['c', 'C', 'f-lm'],
    ['v', 'V', 'f-li'], ['b', 'B', 'f-li'], ['n', 'N', 'f-ri'], ['m', 'M', 'f-ri'],
    [',', ',', 'f-rm'], ['.', '.', 'f-rr'], ['/', '/', 'f-rp'], ['ShiftR', 'Shift', 'f-rp', 'wide']
  ],
  [
    ['Space', '', 'f-th', 'space']
  ]
];

// 上档符号（按住 Shift 后输出）→ 用于把字符映射回物理键 & 显示小角标
const SHIFTED = {
  '!': '1', '@': '2', '#': '3', '$': '4', '%': '5', '^': '6', '&': '7', '*': '8',
  '(': '9', ')': '0', '_': '-', '+': '=', '{': '[', '}': ']', '|': '\\',
  ':': ';', '"': "'", '<': ',', '>': '.', '?': '/', '~': '`'
};
// 反向：基础键 → 角标显示的上档符号
const SUP = Object.fromEntries(Object.entries(SHIFTED).map(([s, b]) => [b, s]));

const LEFT_FINGERS = new Set(['f-lp', 'f-lr', 'f-lm', 'f-li']);

// 把目标字符解析成 { 物理键id, 是否需要 Shift }
function keyInfo(ch) {
  if (ch === ' ') return { id: 'Space', shift: false };
  if (/[A-Z]/.test(ch)) return { id: ch.toLowerCase(), shift: true };
  if (SHIFTED[ch]) return { id: SHIFTED[ch], shift: true };
  return { id: ch, shift: false };
}

export function createKeyboard(container) {
  const els = new Map();      // id -> 键元素
  const fingerOf = new Map(); // id -> 手指类

  const kb = document.createElement('div');
  kb.className = 'keyboard';

  for (const row of ROWS) {
    const r = document.createElement('div');
    r.className = 'krow';
    for (const [id, label, finger, extra] of row) {
      const k = document.createElement('div');
      k.className = 'key ' + finger + (extra ? ' ' + extra : '');
      if (SUP[id]) {
        const sup = document.createElement('small');
        sup.textContent = SUP[id];
        k.appendChild(sup);
      }
      k.appendChild(document.createTextNode(label));
      if (extra === 'bump') {
        const b = document.createElement('i');
        b.className = 'bumpmark';
        k.appendChild(b);
      }
      r.appendChild(k);
      els.set(id, k);
      fingerOf.set(id, finger);
    }
    kb.appendChild(r);
  }
  container.appendChild(kb);

  let highlighted = [];

  function clear() {
    highlighted.forEach((el) => el.classList.remove('next'));
    highlighted = [];
  }

  function highlightNext(ch) {
    clear();
    if (ch == null) return;
    const info = keyInfo(ch);
    const baseEl = els.get(info.id);
    if (baseEl) { baseEl.classList.add('next'); highlighted.push(baseEl); }
    if (info.shift) {
      // 用「对面手」的 Shift：左手键→右 Shift，右手键→左 Shift
      const onLeft = LEFT_FINGERS.has(fingerOf.get(info.id));
      const shiftEl = els.get(onLeft ? 'ShiftR' : 'ShiftL');
      if (shiftEl) { shiftEl.classList.add('next'); highlighted.push(shiftEl); }
    }
  }

  function pressFeedback(ch) {
    const el = els.get(keyInfo(ch).id);
    if (!el) return;
    el.classList.remove('press');
    void el.offsetWidth; // 重启动画
    el.classList.add('press');
    setTimeout(() => el.classList.remove('press'), 160);
  }

  return { el: kb, highlightNext, pressFeedback, clear };
}
