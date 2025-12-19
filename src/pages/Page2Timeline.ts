import { careerData, type CareerNode } from '../data/careerData';
import { certificate } from '../components/Certificate';
import { progressStore } from '../data/progressStore';
import { courseStore } from '../data/courseStore';
import { userProfileStore } from '../data/userProfileStore';
import { achievementStore } from '../data/achievementStore';

export class Page2Timeline {
  private container: HTMLElement;
  private data: CareerNode[];
  private currentIndex: number = 0;
  private prevBtn: HTMLElement | null = null;
  private nextBtn: HTMLElement | null = null;
  private completeBtn: HTMLElement | null = null;
  private itemListeners: Map<Element, EventListener> = new Map();
  private unsubscribe?: () => void;
  private boundPrevHandler = this.handlePrev.bind(this);
  private boundNextHandler = this.handleNext.bind(this);
  private boundCompleteHandler = this.handleComplete.bind(this);

  constructor(container: HTMLElement) {
    this.container = container;
    this.data = careerData;
  }

  render() {
    if (!this.unsubscribe) {
      this.unsubscribe = progressStore.subscribe(() => this.render());
    }

    this.currentIndex = progressStore.getCurrentStage();
    const current = this.data[this.currentIndex];
    const stageProgress = progressStore.getStageProgress(current.id);
    const unlocked = progressStore.isStageUnlocked(current.id);
    const completed = progressStore.isStageCompleted(current.id);
    const progress = ((this.currentIndex + 1) / this.data.length) * 100;

    const totalItems = (current.details?.length || 0) + (current.certifications?.length || 0);
    const exploredItems = (stageProgress?.exploredSkills.size || 0) + (stageProgress?.exploredCertifications.size || 0);
    const explorationPct = progressStore.getExplorationPercentage(current.id);

    this.container.innerHTML = `
      <div class="page-timeline">
        <h1>Your Career Story</h1>
        <div class="timeline-progress">
          <div class="progress-bar" style="width: ${progress}%"></div>
        </div>
        <div class="timeline-content">
          <div class="chapter-number">Chapter ${this.currentIndex + 1}</div>
          <h2>${current.title}</h2>
          <p>${current.description}</p>

          <div class="exploration-progress">
            <span>Explored: ${exploredItems}/${totalItems} (${explorationPct}%)</span>
          </div>

          ${current.details ? `
            <div class="timeline-details">
              <h4>📚 Key Skills (Click to explore & earn XP):</h4>
              <ul class="expandable-list">
                ${current.details.map((detail, i) => {
                  const itemId = `skill-${i}`;
                  const isExpanded = stageProgress?.exploredSkills.has(itemId);
                  return `
                    <li class="expandable-bullet ${isExpanded ? 'expanded' : ''}" data-item-id="${itemId}" data-type="skill">
                      <span class="bullet-icon">${isExpanded ? '▼' : '▶'}</span>
                      <span class="bullet-text">${detail.split(':')[0]}</span>
                      ${isExpanded ? `<span class="xp-badge">+100 XP</span>` : ''}
                      ${isExpanded && detail.includes(':') ? `<div class="bullet-details">${detail.split(':')[1]}</div>` : ''}
                    </li>
                  `;
                }).join('')}
              </ul>
            </div>
          ` : ''}

          ${current.certifications ? `
            <div class="timeline-certs">
              <h4>📜 Required Certifications (Click to explore & earn XP):</h4>
              <ul class="expandable-list">
                ${current.certifications.map((cert, i) => {
                  const itemId = `cert-${i}`;
                  const isExpanded = stageProgress?.exploredCertifications.has(itemId);
                  return `
                    <li class="expandable-bullet ${isExpanded ? 'expanded' : ''}" data-item-id="${itemId}" data-type="cert">
                      <span class="bullet-icon">${isExpanded ? '▼' : '▶'}</span>
                      <span class="bullet-text">${cert}</span>
                      ${isExpanded ? `<span class="xp-badge">+200 XP</span>` : ''}
                    </li>
                  `;
                }).join('')}
              </ul>
            </div>
          ` : ''}

          <div class="timeline-actions">
            ${this.currentIndex > 0 ? '<button id="prev-btn">Previous</button>' : ''}
            ${!completed && unlocked ? '<button id="complete-btn">Complete Chapter</button>' : ''}
            ${this.currentIndex < this.data.length - 1 ? (completed ? '<button id="next-btn">Next</button>' : '<button id="next-btn" disabled>Next</button>') : ''}
          </div>
        </div>
        <div class="timeline-dots">
          ${this.data.map((node, i) => {
            const dotCompleted = progressStore.isStageCompleted(node.id);
            const dotUnlocked = progressStore.isStageUnlocked(node.id);
            return `<div class="dot ${i === this.currentIndex ? 'active' : dotCompleted ? 'completed' : ''} ${dotUnlocked ? '' : 'locked'}"></div>`;
          }).join('')}
        </div>
      </div>
    `;
    this.attachListeners();
  }

  private attachListeners() {
    this.removeListeners();

    this.prevBtn = this.container.querySelector('#prev-btn');
    this.nextBtn = this.container.querySelector('#next-btn');
    this.completeBtn = this.container.querySelector('#complete-btn');

    this.prevBtn?.addEventListener('click', this.boundPrevHandler);
    this.nextBtn?.addEventListener('click', this.boundNextHandler);
    this.completeBtn?.addEventListener('click', this.boundCompleteHandler);

    // Add click handlers for expandable bullets
    const bullets = this.container.querySelectorAll('.expandable-bullet');
    bullets.forEach(bullet => {
      const handler = () => {
        const itemId = (bullet as HTMLElement).dataset.itemId!;
        const type = (bullet as HTMLElement).dataset.type!;
        const current = this.data[this.currentIndex];
        const stageProgress = progressStore.getStageProgress(current.id);
        const isExplored =
          type === 'skill'
            ? stageProgress?.exploredSkills.has(itemId)
            : stageProgress?.exploredCertifications.has(itemId);

        if (type === 'skill') {
          const nextState = !isExplored;
          progressStore.setSkillExplored(current.id, itemId, nextState);
        } else if (type === 'cert') {
          const nextState = !isExplored;
          progressStore.setCertificationExplored(current.id, itemId, nextState);
        }

        this.render();
      };

      bullet.addEventListener('click', handler);
      this.itemListeners.set(bullet, handler);
    });
  }

  private removeListeners() {
    this.prevBtn?.removeEventListener('click', this.boundPrevHandler);
    this.nextBtn?.removeEventListener('click', this.boundNextHandler);
    this.completeBtn?.removeEventListener('click', this.boundCompleteHandler);

    // Remove item listeners
    this.itemListeners.forEach((handler, element) => {
      element.removeEventListener('click', handler);
    });
    this.itemListeners.clear();
  }

  private handlePrev() {
    if (this.currentIndex > 0) {
      progressStore.setCurrentStage(this.currentIndex - 1);
      this.render();
    }
  }

  private handleNext() {
    const current = this.data[this.currentIndex];
    if (this.currentIndex < this.data.length - 1 && progressStore.isStageCompleted(current.id)) {
      progressStore.setCurrentStage(this.currentIndex + 1);
      this.render();
    }
  }

  private handleComplete() {
    const node = this.data[this.currentIndex];
    if (progressStore.isStageCompleted(node.id) || !progressStore.isStageUnlocked(node.id)) return;

    progressStore.completeStage(node.id);

    const achievements: Array<{ id: string; name: string; type: 'phase' | 'skill' | 'certification'; source: string }> = [
      { id: `phase-${node.id}`, name: node.title, type: 'phase', source: 'Story Timeline' }
    ];

    const stageProgress = progressStore.getStageProgress(node.id);
    node.details?.forEach((detail, i) => {
      const itemId = `skill-${i}`;
      if (stageProgress?.exploredSkills.has(itemId)) {
        achievements.push({
          id: `skill-${node.id}-${i}`,
          name: detail.split(':')[0] || detail,
          type: 'skill',
          source: 'Story Timeline'
        });
      }
    });

    node.certifications?.forEach((cert, i) => {
      const certId = `cert-${i}`;
      if (stageProgress?.exploredCertifications.has(certId)) {
        achievements.push({
          id: `cert-${node.id}-${i}`,
          name: cert,
          type: 'certification',
          source: 'Story Timeline'
        });
      }
    });

    achievementStore.addBatch(achievements);

    const isFinalStage = node.id === this.data[this.data.length - 1].id;
    if (isFinalStage) {
      const course = courseStore.getCourse();
      const profile = userProfileStore.getProfile();
      certificate.show({
        stageName: node.title,
        courseName: course.courseName,
        careerPath: course.careerPath,
        fullName: profile.fullName,
        isCourseCompletion: true
      });
    }

    if (this.currentIndex < this.data.length - 1 && progressStore.isStageUnlocked(this.data[this.currentIndex + 1].id)) {
      progressStore.setCurrentStage(this.currentIndex + 1);
    } else {
      this.render();
    }
  }

  destroy() {
    this.removeListeners();
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = undefined;
    }
  }
}
