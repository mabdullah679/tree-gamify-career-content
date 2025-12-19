import { achievementStore, type Achievement } from '../data/achievementStore';

export class Page4Achievements {
  private container: HTMLElement;
  private unsubscribe?: () => void;
  private openLane: 'certification' | 'skill' | 'phase' = 'certification';

  constructor(container: HTMLElement) {
    this.container = container;
  }

  render() {
    if (!this.unsubscribe) {
      this.unsubscribe = achievementStore.subscribe(() => this.renderContent());
    }
    this.renderContent();
  }

  private renderContent() {
    const achievements = achievementStore.getAchievements();
    const totalCount = achievementStore.getTotalCount();
    const multiplier = achievementStore.getMultiplier();

    const byType = {
      certification: achievements.filter(a => a.type === 'certification'),
      skill: achievements.filter(a => a.type === 'skill'),
      phase: achievements.filter(a => a.type === 'phase')
    };

    const lanes: Array<{ key: 'certification' | 'skill' | 'phase'; label: string; icon: string; data: Achievement[] }> = [
      { key: 'certification', label: 'Certifications', icon: '📜', data: byType.certification },
      { key: 'skill', label: 'Skills', icon: '⚡', data: byType.skill },
      { key: 'phase', label: 'Stages', icon: '🎯', data: byType.phase }
    ];

    // Auto-open the first lane that has data if current open lane is empty.
    if (lanes.find(l => l.key === this.openLane)?.data.length === 0) {
      const firstWithData = lanes.find(l => l.data.length > 0);
      if (firstWithData) {
        this.openLane = firstWithData.key;
      }
    }

    this.container.innerHTML = `
      <div class="page-achievement-roadmap">
        <div class="roadmap-header">
          <div>
            <div class="stage-kicker">Achievement Roadmap</div>
            <h1>Highway to Mastery</h1>
            <p class="stage-subtitle">Three lanes of progress: certifications, skills, and stages.</p>
          </div>
          <div class="achievement-stats compact">
            <div class="stat-card">
              <div class="stat-value">${totalCount}</div>
              <div class="stat-label">Unique Achievements</div>
            </div>
            <div class="stat-card multiplier">
              <div class="stat-value">×${multiplier}</div>
              <div class="stat-label">Total Completions</div>
            </div>
          </div>
        </div>

        <div class="roadway">
          ${lanes.map(lane => {
            const active = this.openLane === lane.key;
            return `
              <div class="road-lane ${active ? 'active' : ''}" data-lane="${lane.key}">
                <div class="lane-header">
                  <span class="lane-icon">${lane.icon}</span>
                  <div>
                    <div class="lane-label">${lane.label}</div>
                    <div class="lane-meta">${lane.data.length} earned</div>
                  </div>
                  <span class="lane-toggle">${active ? 'Collapse' : 'Expand'}</span>
                </div>
                ${active ? this.renderLaneDetails(lane.data) : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    const laneEls = this.container.querySelectorAll('.road-lane');
    laneEls.forEach(lane => {
      lane.addEventListener('click', () => {
        const key = (lane as HTMLElement).dataset.lane as 'certification' | 'skill' | 'phase';
        this.openLane = key;
        this.renderContent();
      });
    });
  }

  private renderLaneDetails(achievements: Achievement[]) {
    if (achievements.length === 0) {
      return `<div class="lane-empty">On-ramp ready. Earn your first milestone in this lane.</div>`;
    }

    return `
      <div class="lane-details">
        ${achievements.map(a => this.renderAchievement(a)).join('')}
      </div>
    `;
  }

  private renderAchievement(achievement: Achievement) {
    return `
      <div class="achievement-card">
        <div class="achievement-header">
          <h4>${achievement.name}</h4>
          ${achievement.earnedCount > 1 ? `<span class="achievement-count">×${achievement.earnedCount}</span>` : ''}
        </div>
        <div class="achievement-meta">First earned from: ${achievement.firstEarnedFrom}</div>
      </div>
    `;
  }

  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = undefined;
    }
  }
}
