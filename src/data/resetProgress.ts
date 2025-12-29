import { achievementStore } from './achievementStore';
import { courseStore } from './courseStore';
import { progressStore } from './progressStore';
import { userProfileStore } from './userProfileStore';

export function resetLocalProgress() {
  achievementStore.reset();
  progressStore.reset();
  courseStore.reset();
  userProfileStore.reset();
}
