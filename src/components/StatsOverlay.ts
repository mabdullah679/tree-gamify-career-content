import { achievementStore } from '../data/achievementStore';

export class StatsOverlay {
  private overlay: HTMLElement;
  private isVisible: boolean = false;

  constructor() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'stats-overlay';
    this.overlay.innerHTML = `
      <div class="stats-panel">
        <button class="stats-close">×</button>
        <h2>Career Progress Dashboard</h2>
        <div class="stats-content" id="stats-content"></div>
      </div>
    `;
    document.body.appendChild(this.overlay);

    this.overlay.querySelector('.stats-close')?.addEventListener('click', () => this.hide());
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.hide();
    });

    achievementStore.subscribe(() => {
      if (this.isVisible) this.render();
    });
  }

  show() {
    this.isVisible = true;
    this.render();
    this.overlay.classList.add('visible');
  }

  hide() {
    this.isVisible = false;
    this.overlay.classList.remove('visible');
  }

  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  private render() {
    const stats = achievementStore.getUserStats();
    const achievements = achievementStore.getAchievements();
    const byType = {
      phase: achievements.filter(a => a.type === 'phase'),
      certification: achievements.filter(a => a.type === 'certification'),
      skill: achievements.filter(a => a.type === 'skill')
    };

    const content = this.overlay.querySelector('#stats-content');
    if (!content) return;

    const xpBarClass = stats.isMaxLevel ? 'xp-fill maxed' : 'xp-fill';
    const xpText = stats.isMaxLevel ? 'MAX LEVEL' : `${stats.totalXP} / ${stats.nextLevelXP} XP`;
    const xpWidth = stats.isMaxLevel ? 100 : stats.progress;

    content.innerHTML = `
      <div class="stats-grid">
        <div class="stat-box level-box">
          <div class="stat-icon">⭐</div>
          <div class="stat-info">
            <div class="stat-value">Level ${stats.level}</div>
            <div class="stat-label">Current Level</div>
            <div class="xp-bar">
              <div class="${xpBarClass}" style="width: ${xpWidth}%"></div>
            </div>
            <div class="xp-text">${xpText}</div>
          </div>
        </div>

        <div class="stat-box">
          <div class="stat-icon">🎯</div>
          <div class="stat-info">
            <div class="stat-value">${byType.phase.length}</div>
            <div class="stat-label">Phases Completed</div>
          </div>
        </div>

        <div class="stat-box">
          <div class="stat-icon">📜</div>
          <div class="stat-info">
            <div class="stat-value">${byType.certification.length}</div>
            <div class="stat-label">Certifications</div>
          </div>
        </div>

        <div class="stat-box">
          <div class="stat-icon">⚡</div>
          <div class="stat-info">
            <div class="stat-value">${byType.skill.length}</div>
            <div class="stat-label">Skills Mastered</div>
          </div>
        </div>

        <div class="stat-box">
          <div class="stat-icon">💰</div>
          <div class="stat-info">
            <div class="stat-value">${stats.totalXP.toLocaleString()}</div>
            <div class="stat-label">Total XP Earned</div>
          </div>
        </div>

        <div class="stat-box">
          <div class="stat-icon">🔥</div>
          <div class="stat-info">
            <div class="stat-value">×${achievementStore.getMultiplier()}</div>
            <div class="stat-label">Total Completions</div>
          </div>
        </div>
      </div>

      <div class="recent-achievements">
        <h3>Recent Achievements</h3>
        <div class="achievement-list">
          ${achievements.slice(-5).reverse().map(a => `
            <div class="achievement-item ${a.type}">
              <span class="achievement-type-icon">${this.getTypeIcon(a.type)}</span>
              <div class="achievement-info">
                <div class="achievement-name">${a.name}</div>
                <div class="achievement-xp">+${a.xp} XP</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  private getTypeIcon(type: string): string {
    switch(type) {
      case 'phase': return '🎯';
      case 'certification': return '📜';
      case 'skill': return '⚡';
      default: return '✨';
    }
  }
}

export const statsOverlay = new StatsOverlay();
