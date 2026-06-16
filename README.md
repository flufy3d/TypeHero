# ⌨️ 打字英雄 · TypeHero

一个给小朋友练习 **英文键盘指法（QWERTY）** 的网页小游戏。中文界面、闯关收集、离线可玩、自动保存进度。

> 在线试玩：**https://flufy3d.github.io/TypeHero/**

## ✨ 特色

- **闯关地图**：8 个世界（基础指法 → 上排 → 下排 → 数字 → 大写符号 → 单词 → 句子 → 极速挑战），一关一关解锁。
- **有成就感**：每关 1~3 颗星、经验升级、徽章成就墙、连续打卡、个人最佳纪录、用星星解锁主题皮肤。
- **手把手指法**：屏幕键盘用 **颜色标出每个键该用哪根手指**，并高亮下一个要按的键，F/J 有定位凸点。
- **即时反馈**：打对/打错有音效，过关撒彩带，吉祥物会给你加油（音效合成，无需任何音频文件）。
- **离线优先（PWA）**：可"安装"到桌面/主屏；联网打开一次后，断网也能继续玩。
- **本地多档案**：每个孩子一个"小英雄"，进度各自保存在本机浏览器，**不上传任何数据**。
- **进度可备份**：设置里可导出/导入进度 JSON，换设备或清理浏览器也不怕丢。

## 🎮 怎么玩

1. 打开网页，创建一个"小英雄"（昵称 + 头像）。
2. 在地图上点亮的关卡里练习；**打对当前字母才会前进**，更利于养成准确度。
3. 又快又准就能拿三颗星 ⭐⭐⭐，解锁更多关卡、徽章和主题。

评星规则：完成 = 1 星；准确率 ≥ 90% = 2 星；准确率 ≥ 97% 且达到该关速度目标 = 3 星。

## 🛠 本地运行

需要用静态服务器打开（ES Modules + Service Worker 不能用 `file://` 直接打开）：

```bash
# 任选其一，在项目目录下执行
npx serve .
# 或
python -m http.server 8080
```

然后浏览器访问 `http://localhost:8080`（端口以工具提示为准）。

## 🚀 部署到 GitHub Pages

本项目是 **零构建** 的纯静态站点，直接推送即可发布：

```bash
git init -b main
git add -A
git commit -m "TypeHero"
gh repo create TypeHero --public --source=. --remote=origin --push
# 启用 Pages（从 main 分支根目录发布）
gh api --method POST repos/<你的用户名>/TypeHero/pages --input - <<'JSON'
{"source": {"branch": "main", "path": "/"}}
JSON
```

等待 1~2 分钟构建完成，访问 `https://<你的用户名>.github.io/TypeHero/`。

## 📁 结构

```
index.html              应用外壳
manifest.webmanifest    PWA 清单
sw.js                   Service Worker（离线缓存）
css/styles.css          样式与主题
js/
  app.js                入口
  data/lessons.js       课程内容（想加关卡/调难度改这里）
  state/store.js        档案与进度（localStorage）
  engine/typing.js      打字判定 / WPM / 准确率 / 连击
  engine/keyboard.js    屏幕键盘 + 手指配色
  ui/screens.js         各界面
  ui/effects.js         彩带与音效
  gamify/achievements.js 等级 / 徽章 / 主题解锁
```

## 🔒 隐私

公开的只是**应用代码**。孩子的昵称、成绩、星标等全部只保存在**本机浏览器的 localStorage** 里，不会上传，也不会出现在仓库中。
