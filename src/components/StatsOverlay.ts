import { achievementStore } from '../data/achievementStore';
import { resetLocalProgress } from '../data/resetProgress';
import { toast } from './Toast';

export class StatsOverlay {
  private overlay: HTMLElement;
  private isVisible: boolean = false;
  private showRecent: boolean = false;

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

    const recentAchievements = achievements.slice(-5).reverse();

    content.innerHTML = `
      <div class="stats-layout">
        <div class="stats-main">
          <div class="stats-grid">
            <div class="stat-box level-box">
              <div class="stat-icon">LVL</div>
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
              <div class="stat-icon">PH</div>
              <div class="stat-info">
                <div class="stat-value">${byType.phase.length}</div>
                <div class="stat-label">Phases Completed</div>
              </div>
            </div>

            <div class="stat-box">
              <div class="stat-icon">CERT</div>
              <div class="stat-info">
                <div class="stat-value">${byType.certification.length}</div>
                <div class="stat-label">Certifications</div>
              </div>
            </div>

            <div class="stat-box">
              <div class="stat-icon">SKILL</div>
              <div class="stat-info">
                <div class="stat-value">${byType.skill.length}</div>
                <div class="stat-label">Skills Mastered</div>
              </div>
            </div>

            <div class="stat-box">
              <div class="stat-icon">XP</div>
              <div class="stat-info">
                <div class="stat-value">${stats.totalXP.toLocaleString()}</div>
                <div class="stat-label">Total XP Earned</div>
              </div>
            </div>

            <div class="stat-box">
              <div class="stat-icon">ALL</div>
              <div class="stat-info">
                <div class="stat-value">A-${achievementStore.getMultiplier()}</div>
                <div class="stat-label">Total Completions</div>
              </div>
            </div>
          </div>

          <div class="stats-actions">
            <button class="reset-progress-btn" id="reset-progress-btn" type="button">Reset Progress</button>
            <p class="reset-progress-note">Clears local progress for testing so you can start at level 1 again.</p>
          </div>
        </div>

        <div class="stats-side">
          <div class="recent-achievements">
            <button class="recent-toggle" id="recent-toggle" type="button">
              <span class="recent-toggle-label">Recent Achievements</span>
              <span class="recent-toggle-caret ${this.showRecent ? 'open' : ''}" aria-hidden="true"></span>
            </button>
            <p class="recent-subtitle">Last 5 achievements earned.</p>
            ${this.showRecent ? `
              <div class="achievement-list">
                ${recentAchievements.map(a => `
                  <div class="achievement-item ${a.type}">
                    <span class="achievement-type-icon">${this.getTypeIcon(a.type)}</span>
                    <div class="achievement-info">
                      <div class="achievement-name">${a.name}</div>
                      <div class="achievement-xp">+${a.xp} XP</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;

    const recentToggle = content.querySelector<HTMLButtonElement>('#recent-toggle');
    if (recentToggle) {
      recentToggle.onclick = () => {
        this.showRecent = !this.showRecent;
        this.render();
      };
    }

    const resetButton = content.querySelector<HTMLButtonElement>('#reset-progress-btn');
    if (resetButton) {
      resetButton.onclick = () => {
        const confirmed = window.confirm('Reset all progress and achievements? This cannot be undone.');
        if (!confirmed) return;
        resetLocalProgress();
        toast.show('Progress reset. Starting at level 1 again.', 'success');
        this.render();
      };
    }
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
