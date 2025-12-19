import { careerData, type CareerNode } from '../data/careerData';
import { progressStore } from '../data/progressStore';
import { certificate } from '../components/Certificate';
import { courseStore } from '../data/courseStore';
import { userProfileStore } from '../data/userProfileStore';
import { achievementStore } from '../data/achievementStore';

type ListenerRecord = {
  element: Element;
  type: string;
  handler: EventListenerOrEventListenerObject;
};

type LeafItem = {
  id: string;
  type: 'skill' | 'cert';
  title: string;
  details?: string;
  xp: number;
  explored: boolean;
};

type LeafGroup = {
  id: string;
  items: LeafItem[];
  explored: number;
  total: number;
  hasItems: boolean;
};

export class Page3Tree {
  private container: HTMLElement;
  private data: CareerNode[];
  private listeners: ListenerRecord[] = [];
  private unsubscribe?: () => void;
  private completionTimeout?: number;
  private selectedLeafId: string | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.data = careerData;
  }

  render() {
    if (!this.unsubscribe) {
      this.unsubscribe = progressStore.subscribe(() => this.render());
    }

    const currentStageIndex = progressStore.getCurrentStage();
    const stage = this.data[currentStageIndex];
    const progress = progressStore.getStageProgress(stage.id);
    const stageUnlocked = progressStore.isStageUnlocked(stage.id);
    const completed = progress?.completed ?? false;

    const { leafGroups, coreReady, exploredPct, exploredSkills, exploredCerts, totalSkills, totalCerts } =
      this.buildLeafGroups(stage);

    if (!this.selectedLeafId && leafGroups.length > 0) {
      this.selectedLeafId = leafGroups[0].id;
    }

    const selectedGroup = leafGroups.find(g => g.id === this.selectedLeafId) || leafGroups[0];
    const nextStage = this.data[currentStageIndex + 1];
    const nextUnlocked = nextStage ? progressStore.isStageUnlocked(nextStage.id) : false;

    this.container.innerHTML = `
      <div class="page-tree-v3">
        <div class="tree-v3-header">
          <div>
            <div class="stage-kicker">Stage ${stage.level} of ${this.data.length}</div>
            <h1>${stage.title}</h1>
            <p class="stage-subtitle">${stage.description}</p>
          </div>
          <div class="stage-controls">
            <a class="nav-pill" id="tree-prev" ${currentStageIndex === 0 ? 'aria-disabled="true"' : ''}>← Prev</a>
            <div class="stage-dots">
              ${this.data.map((node, idx) => {
                const unlocked = progressStore.isStageUnlocked(node.id);
                const done = progressStore.isStageCompleted(node.id);
                const isActive = idx === currentStageIndex;
                const classes = [
                  'tree-stage-dot',
                  isActive ? 'active' : '',
                  done ? 'completed' : '',
                  unlocked ? '' : 'locked'
                ].filter(Boolean).join(' ');
                return `
                  <button class="${classes}" data-stage-index="${idx}" ${unlocked ? '' : 'disabled'}>
                    <span>${idx + 1}</span>
                  </button>
                `;
              }).join('')}
            </div>
            <a class="nav-pill" id="tree-next" ${!nextStage || !nextUnlocked ? 'aria-disabled="true"' : ''}>${nextStage ? 'Next →' : 'End'}</a>
          </div>
        </div>

        <div class="tree-canvas">
          ${this.renderTreeSvg(stage, leafGroups, coreReady, completed)}
        </div>

        <div class="leaf-panel">
          <div class="leaf-panel-header">
            <div>
              <div class="label">Leaf Cluster</div>
              <div class="leaf-panel-title">Details & XP</div>
            </div>
            <div class="leaf-panel-meta">${selectedGroup?.explored || 0}/${selectedGroup?.total || 0} explored</div>
          </div>
          <div class="leaf-chip-grid">
            ${selectedGroup?.items.map(item => {
              const explored = item.explored;
              return `
                <button class="leaf-chip ${explored ? 'explored' : ''}" data-leaf-item="${item.id}" data-leaf-type="${item.type}">
                  <span class="chip-icon">${item.type === 'skill' ? '🧠' : '📜'}</span>
                  <span class="chip-body">
                    <span class="chip-title">${item.title}</span>
                    ${item.details ? `<span class="chip-sub">${item.details}</span>` : ''}
                  </span>
                  <span class="chip-xp">+${item.xp} XP</span>
                </button>
              `;
            }).join('') || '<div class="leaf-empty">No items in this cluster.</div>'}
          </div>

          <div class="root-cta">
            <div>
              <div class="label">Stage Core</div>
              <div class="root-status-line">${completed ? 'Stage completed' : coreReady ? 'Core ready' : 'Core locked'}</div>
              <div class="root-req-row">
                <span class="root-pill ${exploredPct >= 50 ? 'met' : ''}">50% explored</span>
                <span class="root-pill ${(exploredCerts >= (totalCerts > 0 ? 1 : 0)) ? 'met' : ''}">Cert check</span>
              </div>
            </div>
            ${completed ? '<button class="core-btn" disabled>Completed</button>' : `<button class="core-btn" id="core-complete-btn" ${coreReady && stageUnlocked ? '' : 'disabled'}>Complete Stage</button>`}
          </div>
        </div>

        <div class="tree-stats-row">
          <div class="tree-stat">
            <div class="stat-label">Skills explored</div>
            <div class="stat-value">${exploredSkills}/${totalSkills}</div>
          </div>
          <div class="tree-stat">
            <div class="stat-label">Certs explored</div>
            <div class="stat-value">${exploredCerts}/${totalCerts}</div>
          </div>
          <div class="tree-stat">
            <div class="stat-label">Total explored</div>
            <div class="stat-value">${exploredPct}%</div>
          </div>
          <div class="tree-stat ${coreReady || completed ? 'ready' : 'locked'}">
            <div class="stat-label">Core status</div>
            <div class="stat-value">${completed ? 'Completed' : coreReady ? 'Ready' : 'Locked'}</div>
          </div>
        </div>
      </div>
    `;

    this.attachListeners(stage, {
      stageUnlocked,
      coreReady,
      completed,
      currentStageIndex,
      nextUnlocked,
      leafGroups
    });
  }

  private buildLeafGroups(stage: CareerNode) {
    const progress = progressStore.getStageProgress(stage.id);
    const skills = stage.details?.map((detail, i) => {
      const [title, extra] = detail.split(':').map(part => part.trim());
      const id = `skill-${i}`;
      return {
        id,
        type: 'skill' as const,
        title: title || detail,
        details: extra,
        xp: 100,
        explored: progress?.exploredSkills.has(id) ?? false
      };
    }) || [];

    const certs = stage.certifications?.map((cert, i) => {
      const id = `cert-${i}`;
      return {
        id,
        type: 'cert' as const,
        title: cert,
        xp: 200,
        explored: progress?.exploredCertifications.has(id) ?? false
      };
    }) || [];

    const items: LeafItem[] = [...skills, ...certs];
    const totalSkills = skills.length;
    const totalCerts = certs.length;
    const exploredSkills = skills.filter(s => s.explored).length;
    const exploredCerts = certs.filter(c => c.explored).length;

    const leafCount = Math.max(1, Math.min(items.length, 24));
    const groups: LeafGroup[] = Array.from({ length: leafCount }).map((_, idx) => ({
      id: `leaf-${idx}`,
      items: [],
      explored: 0,
      total: 0,
      hasItems: false
    }));

    items.forEach((item, idx) => {
      const group = groups[Math.min(idx % leafCount, groups.length - 1)];
      group.items.push(item);
    });

    groups.forEach(group => {
      group.total = group.items.length;
      group.explored = group.items.filter(i => i.explored).length;
      group.hasItems = group.total > 0;
    });

    const totalItems = items.length || 1;
    const exploredItems = exploredSkills + exploredCerts;
    const exploredPct = Math.round((exploredItems / totalItems) * 100);
    const certRequirement = totalCerts > 0 ? 1 : 0;
    const coreReady = exploredPct >= 50 && exploredCerts >= certRequirement;

    return { leafGroups: groups, coreReady, exploredPct, exploredSkills, exploredCerts, totalSkills, totalCerts };
  }

  private renderTreeSvg(stage: CareerNode, leafGroups: LeafGroup[], coreReady: boolean, completed: boolean) {
    const width = 960;
    const height = 480;
    const trunkHeight = 120 + stage.level * 14;
    const canopyRadius = 180 + stage.level * 10;
    const angleSpread = Math.PI * 1.4;
    const startAngle = -Math.PI / 2 - angleSpread / 2;

    const branches = leafGroups.map((group, idx) => {
      const angle = startAngle + (angleSpread / Math.max(1, leafGroups.length - 1)) * idx;
      const ring = canopyRadius * (0.55 + (idx % 3) * 0.08);
      const x = width / 2 + Math.cos(angle) * ring;
      const y = height - trunkHeight - Math.sin(angle) * ring - (idx % 4 === 0 ? 90 : 70);
      const fillRatio = group.total === 0 ? 0 : group.explored / group.total;
      const leafClass = fillRatio === 1 ? 'leaf-full' : fillRatio >= 0.5 ? 'leaf-mid' : 'leaf-none';
      return { x, y, angle, leafClass, id: group.id, explored: group.explored, total: group.total };
    });

    const branchPaths = branches.map((b, idx) => {
      const split = idx % 2 === 0 ? 40 : -40;
      const ctrl1x = width / 2 + split;
      const ctrl1y = height - trunkHeight - 30;
      const ctrl2x = width / 2 + split * 2;
      const ctrl2y = (height - trunkHeight - 120 + b.y) / 2;
      return `M ${width / 2} ${height - trunkHeight} C ${ctrl1x} ${ctrl1y}, ${ctrl2x} ${ctrl2y}, ${b.x} ${b.y}`;
    });

    const leafRadius = Math.min(24 + stage.level * 1.8, 40);

    return `
      <svg class="oak-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="trunkGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="#5b3b1a" />
            <stop offset="100%" stop-color="#3a2410" />
          </linearGradient>
          <linearGradient id="leafGradient" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stop-color="#9be15d"/>
            <stop offset="100%" stop-color="#00e3ae"/>
          </linearGradient>
        </defs>
        <g filter="url(#shadow)" />
        <g class="oak-trunk">
          <rect x="${width / 2 - 20}" y="${height - trunkHeight}" width="40" height="${trunkHeight}" fill="url(#trunkGradient)" rx="12" />
        </g>
        <g class="oak-branches">
          ${branchPaths.map(path => `<path d="${path}" stroke="#2f1c0e" stroke-width="10" fill="none" stroke-linecap="round" />`).join('')}
          ${branches.map(b => `
            <circle class="leaf-node ${b.leafClass}" ${leafGroups.find(g => g.id === b.id)?.hasItems ? `data-leaf-id="${b.id}"` : ''} cx="${b.x}" cy="${b.y}" r="${leafRadius}" />
            ${leafGroups.find(g => g.id === b.id)?.hasItems ? `<text x="${b.x}" y="${b.y + 6}" text-anchor="middle" class="leaf-count">${b.explored}/${b.total}</text>` : ''}
          `).join('')}
        </g>
        <g class="core-node">
          <circle cx="${width / 2}" cy="${height - trunkHeight - 80}" r="36" class="${completed ? 'core-complete' : coreReady ? 'core-ready' : 'core-locked'}" />
          <text x="${width / 2}" y="${height - trunkHeight - 74}" text-anchor="middle" class="core-label">${completed ? '✓' : coreReady ? 'GO' : '...'}</text>
        </g>
      </svg>
    `;
  }

  private attachListeners(stage: CareerNode, options: { stageUnlocked: boolean; coreReady: boolean; completed: boolean; currentStageIndex: number; nextUnlocked: boolean; leafGroups: LeafGroup[]; }) {
    this.removeListeners();

    const prevBtn = this.container.querySelector('#tree-prev');
    if (prevBtn) {
      const handler = (e: Event) => {
        e.preventDefault();
        if (options.currentStageIndex > 0) {
          progressStore.setCurrentStage(options.currentStageIndex - 1);
        }
      };
      prevBtn.addEventListener('click', handler);
      this.listeners.push({ element: prevBtn, type: 'click', handler });
    }

    const nextBtn = this.container.querySelector('#tree-next');
    if (nextBtn) {
      const handler = (e: Event) => {
        e.preventDefault();
        if (options.nextUnlocked && options.currentStageIndex < this.data.length - 1) {
          progressStore.setCurrentStage(options.currentStageIndex + 1);
        }
      };
      nextBtn.addEventListener('click', handler);
      this.listeners.push({ element: nextBtn, type: 'click', handler });
    }

    const stageDots = this.container.querySelectorAll('.tree-stage-dot');
    stageDots.forEach(dot => {
      const handler = () => {
        const target = (dot as HTMLElement).dataset.stageIndex;
        const index = parseInt(target || '0', 10);
        const node = this.data[index];
        if (node && progressStore.isStageUnlocked(node.id)) {
          progressStore.setCurrentStage(index);
        }
      };
      dot.addEventListener('click', handler);
      this.listeners.push({ element: dot, type: 'click', handler });
    });

    const leafNodes = this.container.querySelectorAll('.leaf-node');
    leafNodes.forEach(node => {
      const handler = () => {
        const id = (node as HTMLElement).dataset.leafId;
        if (id) {
          this.selectedLeafId = id;
          this.render();
        }
      };
      node.addEventListener('click', handler);
      this.listeners.push({ element: node, type: 'click', handler });
    });

    const chips = this.container.querySelectorAll('[data-leaf-item]');
    chips.forEach(chip => {
      const handler = () => {
        if (!options.stageUnlocked || options.completed) return;
        const itemId = (chip as HTMLElement).dataset.leafItem!;
        const itemType = (chip as HTMLElement).dataset.leafType as 'skill' | 'cert';
        const progress = progressStore.getStageProgress(stage.id);
        const isExplored =
          itemType === 'skill'
            ? progress?.exploredSkills.has(itemId)
            : progress?.exploredCertifications.has(itemId);
        const nextState = !isExplored;

        if (itemType === 'skill') {
          progressStore.setSkillExplored(stage.id, itemId, nextState);
        } else {
          progressStore.setCertificationExplored(stage.id, itemId, nextState);
        }

        this.render();
      };
      chip.addEventListener('click', handler);
      this.listeners.push({ element: chip, type: 'click', handler });
    });

    const completeBtn = this.container.querySelector('#core-complete-btn');
    if (completeBtn) {
      const handler = () => {
        if (!options.stageUnlocked || !options.coreReady || options.completed) return;
        this.handleStageCompletion(stage, options.currentStageIndex);
      };
      completeBtn.addEventListener('click', handler);
      this.listeners.push({ element: completeBtn, type: 'click', handler });
    }
  }

  private collectQueuedAchievements(stage: CareerNode) {
    const progress = progressStore.getStageProgress(stage.id);
    if (!progress) return [];

    const queued: Array<{ id: string; name: string; type: 'phase' | 'skill' | 'certification'; source: string }> = [
      { id: `phase-${stage.id}`, name: stage.title, type: 'phase', source: 'Exploration Tree' }
    ];

    stage.details?.forEach((detail, i) => {
      const itemId = `skill-${i}`;
      if (progress.exploredSkills.has(itemId)) {
        const [title] = detail.split(':').map(part => part.trim());
        queued.push({
          id: `skill-${stage.id}-${i}`,
          name: title || detail,
          type: 'skill',
          source: 'Exploration Tree'
        });
      }
    });

    stage.certifications?.forEach((cert, i) => {
      const certId = `cert-${i}`;
      if (progress.exploredCertifications.has(certId)) {
        queued.push({
          id: `cert-${stage.id}-${i}`,
          name: cert,
          type: 'certification',
          source: 'Exploration Tree'
        });
      }
    });

    return queued;
  }

  private handleStageCompletion(stage: CareerNode, currentStageIndex: number) {
    if (progressStore.isStageCompleted(stage.id)) return;

    progressStore.completeStage(stage.id);
    const achievements = this.collectQueuedAchievements(stage);
    achievementStore.addBatch(achievements);

    const isFinalStage = stage.id === this.data[this.data.length - 1].id;
    if (isFinalStage) {
      const course = courseStore.getCourse();
      const profile = userProfileStore.getProfile();
      certificate.show({
        stageName: stage.title,
        courseName: course.courseName,
        careerPath: course.careerPath,
        fullName: profile.fullName,
        isCourseCompletion: true
      });
    }

    const nextStage = this.data[currentStageIndex + 1];
    if (this.completionTimeout) {
      window.clearTimeout(this.completionTimeout);
    }

    if (nextStage && progressStore.isStageUnlocked(nextStage.id)) {
      this.completionTimeout = window.setTimeout(() => {
        progressStore.setCurrentStage(currentStageIndex + 1);
        this.completionTimeout = undefined;
      }, 600);
    } else {
      this.completionTimeout = undefined;
    }
  }

  private removeListeners() {
    this.listeners.forEach(({ element, type, handler }) => element.removeEventListener(type, handler as EventListener));
    this.listeners = [];
  }

  destroy() {
    this.removeListeners();
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = undefined;
    }
    if (this.completionTimeout) {
      window.clearTimeout(this.completionTimeout);
      this.completionTimeout = undefined;
    }
  }
}
