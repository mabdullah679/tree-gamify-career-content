import { careerData, type CareerNode } from '../data/careerData';
import { achievementStore } from '../data/achievementStore';
import { progressStore } from '../data/progressStore';
import { toast } from '../components/Toast';
import { certificate } from '../components/Certificate';
import { courseStore } from '../data/courseStore';
import { userProfileStore } from '../data/userProfileStore';

export class Page1Roadmap {
  private container: HTMLElement;
  private data: CareerNode[];
  private unsubscribe?: () => void;

  constructor(container: HTMLElement) {
    this.container = container;
    this.data = careerData;
  }

  render() {
    const currentStageIndex = progressStore.getCurrentStage();
    const currentNode = this.data[currentStageIndex];
    const progress = progressStore.getStageProgress(currentNode.id);
    const explorationPct = progressStore.getExplorationPercentage(currentNode.id);

    this.container.innerHTML = `
      <div class="page-roadmap-v2">
        <div class="stage-header">
          <h1>Stage ${currentNode.level}: ${currentNode.title}</h1>
          <div class="stage-progress-ring">
            <svg width="120" height="120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="8"/>
              <circle cx="60" cy="60" r="54" fill="none" stroke="#646cff" stroke-width="8"
                stroke-dasharray="339.292" stroke-dashoffset="${339.292 * (1 - explorationPct/100)}"
                transform="rotate(-90 60 60)" stroke-linecap="round"/>
              <text x="60" y="70" text-anchor="middle" fill="#fff" font-size="24" font-weight="bold">${explorationPct}%</text>
            </svg>
          </div>
        </div>

        <p class="stage-description">${currentNode.description}</p>

        <div class="exploration-sections">
          ${this.renderSkillsSection(currentNode, progress)}
          ${this.renderCertificationsSection(currentNode, progress)}
        </div>

        <div class="stage-actions">
          <button class="complete-stage-btn ${explorationPct === 100 ? 'ready' : ''}" id="complete-btn">
            ${explorationPct === 100 ? '✓ Complete Stage' : 'Complete Stage (Explore More)'}
          </button>
          ${currentStageIndex < this.data.length - 1 ? '<div class="next-stage-preview">Next: ' + this.data[currentStageIndex + 1].title + '</div>' : ''}
        </div>

        <div class="stage-navigator">
          ${this.data.map((node, i) => `
            <div class="stage-dot ${i === currentStageIndex ? 'active' : i < currentStageIndex ? 'completed' : ''}"
                 data-stage="${i}" title="Stage ${node.level}: ${node.title}">
              ${i + 1}
            </div>
          `).join('')}
        </div>
      </div>
    `;

    this.attachListeners();
    this.unsubscribe = progressStore.subscribe(() => this.render());
  }

  private renderSkillsSection(node: CareerNode, progress: any) {
    if (!node.details || node.details.length === 0) return '';

    return `
      <div class="exploration-section">
        <h3>📚 Key Skills (${progress?.exploredSkills.size || 0}/${node.details.length})</h3>
        <div class="expandable-items">
          ${node.details.map((detail, i) => {
            const itemId = `skill-${i}`;
            const isExpanded = progress?.exploredSkills.has(itemId);
            return `
              <div class="expandable-item ${isExpanded ? 'expanded' : ''}" data-item-id="${itemId}">
                <div class="item-header">
                  <span class="item-icon">${isExpanded ? '▼' : '▶'}</span>
                  <span class="item-title">${detail.split(':')[0]}</span>
                  ${isExpanded ? '<span class="explored-badge">✓</span>' : ''}
                </div>
                ${isExpanded ? `<div class="item-content">${detail.split(':')[1] || detail}</div>` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  private renderCertificationsSection(node: CareerNode, progress: any) {
    if (!node.certifications || node.certifications.length === 0) return '';

    return `
      <div class="exploration-section">
        <h3>📜 Certifications (${progress?.exploredCertifications.size || 0}/${node.certifications.length})</h3>
        <div class="cert-list">
          ${node.certifications.map((cert, i) => {
            const certId = `cert-${i}`;
            const isExplored = progress?.exploredCertifications.has(certId);
            return `
              <div class="cert-item ${isExplored ? 'explored' : ''}" data-cert-id="${certId}">
                <span class="cert-icon">${isExplored ? '✅' : '📜'}</span>
                <span class="cert-name">${cert}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  private attachListeners() {
    const items = this.container.querySelectorAll('.expandable-item');
    items.forEach(item => {
      item.addEventListener('click', () => {
        const itemId = (item as HTMLElement).dataset.itemId!;
        const currentNode = this.data[progressStore.getCurrentStage()];
        progressStore.toggleSkillExplored(currentNode.id, itemId);
      });
    });

    const certs = this.container.querySelectorAll('.cert-item');
    certs.forEach(cert => {
      cert.addEventListener('click', () => {
        const certId = (cert as HTMLElement).dataset.certId!;
        const currentNode = this.data[progressStore.getCurrentStage()];
        progressStore.markCertExplored(currentNode.id, certId);
      });
    });

    const completeBtn = this.container.querySelector('#complete-btn');
    completeBtn?.addEventListener('click', () => this.handleComplete());

    const stageDots = this.container.querySelectorAll('.stage-dot');
    stageDots.forEach(dot => {
      dot.addEventListener('click', (e) => {
        const stage = parseInt((e.currentTarget as HTMLElement).dataset.stage!);
        if (stage <= progressStore.getCurrentStage() || progressStore.getStageProgress(this.data[progressStore.getCurrentStage()].id)?.completed) {
          progressStore.setCurrentStage(stage);
        }
      });
    });
  }

  private handleComplete() {
    try {
      const currentStageIndex = progressStore.getCurrentStage();
      const currentNode = this.data[currentStageIndex];

      if (!currentNode) {
        console.error('No current node found');
        return;
      }

      const explorationPct = progressStore.getExplorationPercentage(currentNode.id);
      const isFullyExplored = explorationPct === 100;

      progressStore.completeStage(currentNode.id);

      const batch: Array<{id: string, name: string, type: 'phase' | 'skill' | 'certification', source: string}> = [{id: `phase-${currentNode.id}`, name: currentNode.title, type: 'phase', source: 'Journey Map'}];

      currentNode.details?.forEach((detail, i) => {
        const itemId = `skill-${i}`;
        const progress = progressStore.getStageProgress(currentNode.id);
        if (progress?.exploredSkills.has(itemId)) {
          batch.push({id: `skill-${currentNode.id}-${i}`, name: detail, type: 'skill', source: 'Journey Map'});
        }
      });

      currentNode.certifications?.forEach((cert, i) => {
        const certId = `cert-${i}`;
        const progress = progressStore.getStageProgress(currentNode.id);
        if (progress?.exploredCertifications.has(certId)) {
          batch.push({id: `cert-${currentNode.id}-${i}`, name: cert, type: 'certification', source: 'Journey Map'});
        }
      });

      achievementStore.addBatch(batch);

      // Show certificate celebration!
      const course = courseStore.getCourse();
      const profile = userProfileStore.getProfile();
      const isFinalStage = currentStageIndex === this.data.length - 1;
      certificate.show({
        stageName: currentNode.title,
        courseName: course.courseName,
        careerPath: course.careerPath,
        fullName: profile.fullName,
        isCourseCompletion: isFinalStage
      });

      if (!isFullyExplored) {
        toast.show(`Stage completed! You explored ${explorationPct}% - consider exploring everything for maximum XP.`, 'warning', 5000);
      }

      if (currentStageIndex < this.data.length - 1) {
        setTimeout(() => {
          progressStore.setCurrentStage(currentStageIndex + 1);
        }, 2500);
      }
    } catch (error) {
      console.error('Error completing stage:', error);
      toast.show('An error occurred while completing the stage. Please try again.', 'warning');
    }
  }

  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}
