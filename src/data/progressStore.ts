import { careerData } from './careerData';

interface ExplorationProgress {
  stageId: string;
  exploredSkills: Set<string>;
  exploredCertifications: Set<string>;
  awardedSkills: Set<string>;
  awardedCertifications: Set<string>;
  completed: boolean;
}

class ProgressStore {
  private currentStage: number = 0;
  private exploration: Map<string, ExplorationProgress> = new Map();
  private listeners: Set<() => void> = new Set();
  private readonly STORAGE_KEY = 'career-roadmap-progress';

  constructor() {
    careerData.forEach(node => {
      this.exploration.set(node.id, {
        stageId: node.id,
        exploredSkills: new Set(),
        exploredCertifications: new Set(),
        awardedSkills: new Set(),
        awardedCertifications: new Set(),
        completed: false
      });
    });
    this.load();
  }

  getCurrentStage(): number {
    return this.currentStage;
  }

  setCurrentStage(stage: number) {
    this.currentStage = stage;
    this.notifyListeners();
  }

  toggleItemExplored(stageId: string, itemId: string) {
    return this.toggleSkillExplored(stageId, itemId);
  }

  toggleSkillExplored(stageId: string, skillId: string): { explored: boolean; firstExplore: boolean } {
    const progress = this.exploration.get(stageId);
    if (!progress) return { explored: false, firstExplore: false };

    let explored = false;
    let firstExplore = false;

    if (progress.exploredSkills.has(skillId)) {
      progress.exploredSkills.delete(skillId);
    } else {
      progress.exploredSkills.add(skillId);
      explored = true;
      if (!progress.awardedSkills.has(skillId)) {
        progress.awardedSkills.add(skillId);
        firstExplore = true;
      }
    }

    this.notifyListeners();
    return { explored, firstExplore };
  }

  setSkillExplored(stageId: string, skillId: string, explored: boolean): { explored: boolean; firstExplore: boolean } {
    const progress = this.exploration.get(stageId);
    if (!progress) return { explored: false, firstExplore: false };

    const alreadyExplored = progress.exploredSkills.has(skillId);
    if (explored === alreadyExplored) {
      return { explored: alreadyExplored, firstExplore: false };
    }

    let firstExplore = false;
    if (explored) {
      progress.exploredSkills.add(skillId);
      if (!progress.awardedSkills.has(skillId)) {
        progress.awardedSkills.add(skillId);
        firstExplore = true;
      }
    } else {
      progress.exploredSkills.delete(skillId);
    }

    this.notifyListeners();
    return { explored, firstExplore };
  }

  toggleCertificationExplored(stageId: string, certId: string): { explored: boolean; firstExplore: boolean } {
    const progress = this.exploration.get(stageId);
    if (!progress) return { explored: false, firstExplore: false };

    let explored = false;
    let firstExplore = false;

    if (progress.exploredCertifications.has(certId)) {
      progress.exploredCertifications.delete(certId);
    } else {
      progress.exploredCertifications.add(certId);
      explored = true;
      if (!progress.awardedCertifications.has(certId)) {
        progress.awardedCertifications.add(certId);
        firstExplore = true;
      }
    }

    this.notifyListeners();
    return { explored, firstExplore };
  }

  setCertificationExplored(stageId: string, certId: string, explored: boolean): { explored: boolean; firstExplore: boolean } {
    const progress = this.exploration.get(stageId);
    if (!progress) return { explored: false, firstExplore: false };

    const alreadyExplored = progress.exploredCertifications.has(certId);
    if (explored === alreadyExplored) {
      return { explored: alreadyExplored, firstExplore: false };
    }

    let firstExplore = false;
    if (explored) {
      progress.exploredCertifications.add(certId);
      if (!progress.awardedCertifications.has(certId)) {
        progress.awardedCertifications.add(certId);
        firstExplore = true;
      }
    } else {
      progress.exploredCertifications.delete(certId);
    }

    this.notifyListeners();
    return { explored, firstExplore };
  }

  markCertExplored(stageId: string, certId: string) {
    this.setCertificationExplored(stageId, certId, true);
  }

  completeStage(stageId: string) {
    const progress = this.exploration.get(stageId);
    if (progress) {
      progress.completed = true;
      this.notifyListeners();
    }
  }

  isStageCompleted(stageId: string): boolean {
    return this.exploration.get(stageId)?.completed ?? false;
  }

  isStageUnlocked(stageId: string): boolean {
    const node = careerData.find(n => n.id === stageId);
    if (!node) return false;
    if (node.level === 1) return true;
    if (!node.prerequisites || node.prerequisites.length === 0) return true;

    return node.prerequisites.every(prereqId => this.isStageCompleted(prereqId));
  }

  getStageProgress(stageId: string): ExplorationProgress | undefined {
    return this.exploration.get(stageId);
  }

  getExplorationPercentage(stageId: string): number {
    const node = careerData.find(n => n.id === stageId);
    const progress = this.exploration.get(stageId);

    if (!node || !progress) return 0;

    const totalItems = (node.details?.length || 0) + (node.certifications?.length || 0);
    const exploredItems = progress.exploredSkills.size + progress.exploredCertifications.size;

    return totalItems > 0 ? Math.round((exploredItems / totalItems) * 100) : 0;
  }

  isFullyExplored(stageId: string): boolean {
    return this.getExplorationPercentage(stageId) === 100;
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  reset() {
    this.currentStage = 0;
    this.exploration.forEach((progress) => {
      progress.exploredSkills.clear();
      progress.exploredCertifications.clear();
      progress.awardedSkills.clear();
      progress.awardedCertifications.clear();
      progress.completed = false;
    });
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear progress:', error);
    }
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
    this.save();
  }

  private save() {
    try {
      const data = {
        currentStage: this.currentStage,
        exploration: Array.from(this.exploration.entries()).map(([key, value]) => ({
          key,
          stageId: value.stageId,
          exploredSkills: Array.from(value.exploredSkills),
          exploredCertifications: Array.from(value.exploredCertifications),
          awardedSkills: Array.from(value.awardedSkills),
          awardedCertifications: Array.from(value.awardedCertifications),
          completed: value.completed
        }))
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save progress:', error);
    }
  }

  private load() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return;

      const data = JSON.parse(stored);
      this.currentStage = data.currentStage || 0;

      if (data.exploration && Array.isArray(data.exploration)) {
        data.exploration.forEach((item: any) => {
          if (this.exploration.has(item.key)) {
            this.exploration.set(item.key, {
              stageId: item.stageId,
              exploredSkills: new Set(item.exploredSkills || item.expandedItems || []),
              exploredCertifications: new Set(item.exploredCertifications || []),
              awardedSkills: new Set(item.awardedSkills || item.exploredSkills || item.expandedItems || []),
              awardedCertifications: new Set(item.awardedCertifications || item.exploredCertifications || []),
              completed: item.completed || false
            });
          }
        });
      }
    } catch (error) {
      console.warn('Failed to load progress:', error);
    }
  }
}

export const progressStore = new ProgressStore();
