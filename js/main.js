/** 我的车库 · 门户逻辑：读取游戏清单 → 渲染卡片墙 → 弹层嵌入游戏 */
(function () {
  "use strict";

  const grid = document.getElementById("grid");
  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modal-title");
  const modalNewtab = document.getElementById("modal-newtab");
  const modalFullscreen = document.getElementById("modal-fullscreen");
  const modalClose = document.getElementById("modal-close");
  const gameFrame = document.getElementById("game-frame");

  /** 从游戏存档读取战绩摘要（同源，可直接读 localStorage） */
  function readSaveStats(saveKey) {
    try {
      const raw = localStorage.getItem(saveKey);
      if (!raw) return null;
      const save = JSON.parse(raw);
      const tiers = ["星尘碎屑", "陨铁微粒", "月长石", "火焰石英", "翡翠晶簇", "蓝晶核心",
        "紫电原核", "金辉圣尘", "翠光超星", "深空星核", "虚空星髓", "银河之心"];
      const score = typeof save.score === "number" ? save.score : 0;
      const best = typeof save.bestTier === "number" ? save.bestTier : 0;
      const bestName = tiers[Math.min(best, tiers.length - 1)] || "？？？";
      return `最高战绩：${bestName}（Lv${best + 1}） · 分数 ${score}`;
    } catch {
      return null;
    }
  }

  function cardHTML(game) {
    const stats = readSaveStats(game.saveKey);
    const statsHTML = stats
      ? stats
      : '<span class="dim">尚未开始 · 点击卡片进入</span>';
    const cover = game.cover
      ? `<div class="card-cover"><img src="${game.cover}" alt=""></div>`
      : `<div class="card-icon">${game.emoji}</div>`;
    return `
      <div class="card" style="--accent:${game.color}" data-path="${game.path}" data-title="${game.title}">
        ${cover}
        <h2 class="card-title">${game.title}</h2>
        <div class="card-en">${game.en || ""}</div>
        <span class="card-genre">${game.genre}</span>
        <p class="card-desc">${game.desc}</p>
        <div class="card-stats">${statsHTML}</div>
      </div>`;
  }

  function upcomingHTML(item) {
    return `
      <div class="card card-upcoming">
        <div class="card-icon">${item.emoji}</div>
        <h2 class="card-title">${item.title}</h2>
        <div class="card-en">COMING SOON</div>
        <p class="card-desc">${item.desc}</p>
        <div class="card-stats"><span class="dim">规划中</span></div>
      </div>`;
  }

  function openGame(path, title) {
    modalTitle.textContent = title;
    modalNewtab.href = path;
    gameFrame.src = path;
    modal.hidden = false;
  }

  function closeModal() {
    modal.hidden = true;
    gameFrame.src = "about:blank"; // 停止游戏循环，释放性能
  }

  fetch("games.json", { cache: "no-store" })
    .then((r) => r.json())
    .then((data) => {
      grid.innerHTML =
        data.games.map(cardHTML).join("") +
        (data.upcoming || []).map(upcomingHTML).join("");

      grid.addEventListener("click", (e) => {
        const card = e.target.closest(".card[data-path]");
        if (card) openGame(card.dataset.path, card.dataset.title);
      });
    })
    .catch(() => {
      grid.innerHTML =
        '<div class="card"><h2 class="card-title">清单加载失败</h2><p class="card-desc">请通过 server.mjs 启动本站后访问（直接双击 index.html 无法读取 games.json）。</p></div>';
    });

  modalClose.addEventListener("click", closeModal);
  modal.querySelector(".modal-backdrop").addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });
  modalFullscreen.addEventListener("click", () => {
    const body = document.querySelector(".modal-body");
    if (document.fullscreenElement) document.exitFullscreen();
    else body.requestFullscreen().catch(() => {});
  });
})();
