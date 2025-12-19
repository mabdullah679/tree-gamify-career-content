import { achievementStore } from './achievementStore';
import { progressStore } from './progressStore';

type AwardParams = {
  stageId: string;
  itemType: 'skill' | 'cert';
  itemId: string;
  title: string;
  source: string;
};

const awardedKey = (stageId: string, itemType: 'skill' | 'cert', itemId: string) =>
  `${stageId}-${itemType}-${itemId}`;

class XpService {
  awardExplorationOnce(params: AwardParams) {
    const { stageId, itemId, itemType, title, source } = params;
    const key = awardedKey(stageId, itemType, itemId);

    if (itemType === 'skill') {
      const result = progressStore.setSkillExplored(stageId, itemId, true);
      if (result.firstExplore) {
        achievementStore.addAchievement(`explore-${key}`, `Explored: ${title}`, 'skill', source);
      }
      return result.firstExplore;
    }

    const result = progressStore.setCertificationExplored(stageId, itemId, true);
    if (result.firstExplore) {
      achievementStore.addAchievement(`explore-${key}`, `Explored: ${title}`, 'certification', source);
    }
    return result.firstExplore;
  }

  awardStageCompletionOnce(stageId: string, stageTitle: string, source: string) {
    if (progressStore.isStageCompleted(stageId)) return false;
    progressStore.completeStage(stageId);
    achievementStore.addAchievement(`phase-${stageId}`, stageTitle, 'phase', source);
    return true;
  }
}

export const xpService = new XpService();
