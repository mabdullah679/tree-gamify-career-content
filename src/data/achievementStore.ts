export interface Achievement {
  id: string;
  name: string;
  type: 'certification' | 'skill' | 'phase';
  earnedCount: number;
  firstEarnedFrom?: string;
  xp: number;
}

export interface UserStats {
  totalXP: number;
  level: number;
  nextLevelXP: number;
  currentLevelXP: number;
  progress: number;
  isMaxLevel: boolean;
}

const BASE_XP_VALUES = {
  phase: 500,
  certification: 200,
  skill: 100
};

const LEVEL_CURVE = 1000; // XP needed for first level, scales up
const MAX_LEVEL = 4;

function getScaledXP(baseXP: number, userLevel: number): number {
  return Math.floor(baseXP * (1 + (userLevel - 1) * 0.15));
}

class AchievementStore {
  private achievements: Map<string, Achievement> = new Map();
  private listeners: Set<(showCelebration: boolean) => void> = new Set();
  private notifyTimeout: number | null = null;
  private totalXP: number = 0;
  private previousLevel: number = 1;
  private readonly STORAGE_KEY = 'career-roadmap-achievements';

  constructor() {
    this.load();
  }

  addAchievement(id: string, name: string, type: Achievement['type'], source: string) {
    const currentLevel = this.calculateLevel(this.totalXP);
    const baseXP = BASE_XP_VALUES[type];
    const xp = getScaledXP(baseXP, currentLevel);
    let isNew = false;

    if (this.achievements.has(id)) {
      const achievement = this.achievements.get(id)!;
      achievement.earnedCount++;
    } else {
      isNew = true;
      this.achievements.set(id, {
        id,
        name,
        type,
        earnedCount: 1,
        firstEarnedFrom: source,
        xp
      });
    }

    this.totalXP += xp;
    this.scheduleNotify(isNew);
  }

  addBatch(achievements: Array<{id: string, name: string, type: Achievement['type'], source: string}>) {
    let hasNew = false;
    const currentLevel = this.calculateLevel(this.totalXP);

    achievements.forEach(a => {
      const baseXP = BASE_XP_VALUES[a.type];
      const xp = getScaledXP(baseXP, currentLevel);

      if (this.achievements.has(a.id)) {
        const achievement = this.achievements.get(a.id)!;
        achievement.earnedCount++;
      } else {
        hasNew = true;
        this.achievements.set(a.id, {
          id: a.id,
          name: a.name,
          type: a.type,
          earnedCount: 1,
          firstEarnedFrom: a.source,
          xp
        });
      }
      this.totalXP += xp;
    });
    this.scheduleNotify(hasNew);
  }

  getAchievements(): Achievement[] {
    return Array.from(this.achievements.values());
  }

  getTotalCount(): number {
    return this.achievements.size;
  }

  getMultiplier(): number {
    return Array.from(this.achievements.values()).reduce((sum, a) => sum + a.earnedCount, 0);
  }

  getUserStats(): UserStats {
    const calculatedLevel = this.calculateLevel(this.totalXP);
    const level = Math.min(calculatedLevel, MAX_LEVEL);
    const isMaxLevel = level === MAX_LEVEL;
    const currentLevelXP = this.getLevelXP(level - 1);
    const nextLevelXP = isMaxLevel ? currentLevelXP : this.getLevelXP(level);
    const progress = isMaxLevel
      ? 100
      : ((this.totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

    return {
      totalXP: this.totalXP,
      level,
      nextLevelXP,
      currentLevelXP,
      progress,
      isMaxLevel
    };
  }

  private calculateLevel(xp: number): number {
    let level = 1;
    while (level < MAX_LEVEL && xp >= this.getLevelXP(level)) {
      level++;
    }
    return level;
  }

  private getLevelXP(level: number): number {
    return Math.floor(LEVEL_CURVE * level * (1 + level * 0.3));
  }

  checkLevelUp(): boolean {
    const currentLevel = this.calculateLevel(this.totalXP);
    const leveledUp = currentLevel > this.previousLevel;
    this.previousLevel = currentLevel;
    return leveledUp;
  }

  subscribe(listener: (showCelebration: boolean) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private scheduleNotify(hasNewAchievements: boolean) {
    if (this.notifyTimeout !== null) {
      clearTimeout(this.notifyTimeout);
    }
    this.notifyTimeout = window.setTimeout(() => {
      this.notifyTimeout = null;
      const leveledUp = this.checkLevelUp();
      this.notifyListeners(leveledUp || hasNewAchievements);
    }, 0);
  }

  private notifyListeners(showCelebration: boolean) {
    this.listeners.forEach(listener => listener(showCelebration));
    this.save();
  }

  private save() {
    try {
      const data = {
        achievements: Array.from(this.achievements.values()),
        totalXP: this.totalXP,
        previousLevel: this.previousLevel
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save achievements:', error);
    }
  }

  private load() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return;

      const data = JSON.parse(stored);
      this.totalXP = data.totalXP || 0;
      this.previousLevel = Math.min(data.previousLevel || 1, MAX_LEVEL);

      if (data.achievements && Array.isArray(data.achievements)) {
        data.achievements.forEach((achievement: Achievement) => {
          this.achievements.set(achievement.id, achievement);
        });
      }
    } catch (error) {
      console.warn('Failed to load achievements:', error);
    }
  }
}

export const achievementStore = new AchievementStore();
