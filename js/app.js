/* =========================================================
   打字英雄 —— 入口
   注册 Service Worker、初始化特效、挂载界面、决定首屏
   ========================================================= */
import { Store } from './state/store.js';
import { Screens } from './ui/screens.js';
import { initFx } from './ui/effects.js';

// 离线支持：注册 Service Worker（相对路径，兼容 /TypeHero/ 子目录）
if ('serviceWorker' in navigator) {
  // 发现新版本并接管后自动刷新一次，避免旧缓存让更新看不到
  const hadController = !!navigator.serviceWorker.controller;
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing || !hadController) return; // 首次安装不刷新，只有更新换代才刷新
    refreshing = true;
    window.location.reload();
  });
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((reg) => { reg.update(); })
      .catch((err) => console.warn('Service Worker 注册失败（仍可在线使用）：', err));
  });
}

// 全屏特效画布
initFx(document.getElementById('fx'));

// 简单路由
const router = {
  go(name, params) { Screens.show(name, params); }
};

Screens.mount(document.getElementById('app'), router);

// 首屏：有档案则进地图，否则进选英雄
router.go(Store.getActive() ? 'home' : 'profiles');
