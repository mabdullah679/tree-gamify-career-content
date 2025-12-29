import './style.css';
import { achievementStore } from './data/achievementStore';
import { resetLocalProgress } from './data/resetProgress';
import { celebrationEffect } from './components/CelebrationEffect';
import { statsOverlay } from './components/StatsOverlay';
import { toast } from './components/Toast';

export type PageKey = 'timeline' | 'tree' | 'achievements';

export function renderShell(activePage: PageKey): { content: HTMLElement; destroy: () => void } {
  const container = document.querySelector<HTMLDivElement>('#app');
  if (!container) throw new Error('App root not found');

  container.innerHTML = `
    <div class="app-container">
      <header class="topbar">
        <nav class="nav">
          <a data-route-path="/timeline/" href="/timeline/" class="${activePage === 'timeline' ? 'active' : ''}">Story Timeline</a>
          <a data-route-path="/tree/" href="/tree/" class="${activePage === 'tree' ? 'active' : ''}">Exploration Tree</a>
          <a data-route-path="/achievements/" href="/achievements/" class="achievements-btn ${activePage === 'achievements' ? 'active' : ''}">
            Achievements <span class="achievement-badge" id="achievement-count">0</span>
          </a>
        </nav>
        <div class="user-hud">
          <button class="stats-btn" id="stats-btn">
          <span class="stats-icon">LVL</span>
            <div class="user-level">
              <div class="level-text">Level <span id="user-level">1</span></div>
              <div class="xp-bar-mini">
                <div class="xp-fill-mini" id="xp-fill"></div>
              </div>
            </div>
          </button>
          <button class="reset-hud-btn" id="reset-hud-btn" type="button">Reset Progress</button>
        </div>
      </header>
      <div id="page-content"></div>
    </div>
  `;

  const updateHUD = () => {
    const stats = achievementStore.getUserStats();
    const levelEl = document.getElementById('user-level');
    const xpFillEl = document.getElementById('xp-fill');
    const badge = document.getElementById('achievement-count');
    if (levelEl) levelEl.textContent = stats.level.toString();
    if (xpFillEl) {
      xpFillEl.style.width = `${stats.isMaxLevel ? 100 : stats.progress}%`;
      xpFillEl.classList.toggle('maxed', stats.isMaxLevel);
    }
    if (badge) badge.textContent = achievementStore.getTotalCount().toString();
  };

  const unsubAchievements = achievementStore.subscribe((showCelebration) => {
    updateHUD();
    if (showCelebration) {
      const stats = achievementStore.getUserStats();
      celebrationEffect.celebrate(stats.level > 1);
    }
  });

  updateHUD();

  const statsBtn = container.querySelector('#stats-btn');
  const statsHandler = () => statsOverlay.toggle();
  statsBtn?.addEventListener('click', statsHandler);

  const resetBtn = container.querySelector<HTMLButtonElement>('#reset-hud-btn');
  const resetHandler = () => {
    const confirmed = window.confirm('Reset all progress and achievements? This cannot be undone.');
    if (!confirmed) return;
    resetLocalProgress();
    toast.show('Progress reset. Starting at level 1 again.', 'success');
    updateHUD();
  };
  resetBtn?.addEventListener('click', resetHandler);

  const content = container.querySelector<HTMLDivElement>('#page-content');
  if (!content) throw new Error('Missing page-content container');

  return {
    content,
    destroy: () => {
      unsubAchievements();
      statsBtn?.removeEventListener('click', statsHandler);
      resetBtn?.removeEventListener('click', resetHandler);
    }
  };
}
