type UserProfile = {
  fullName: string;
};

class UserProfileStore {
  private state: UserProfile = { fullName: 'Career Explorer' };
  private readonly STORAGE_KEY = 'career-roadmap-user';

  constructor() {
    this.load();
  }

  getProfile() {
    return this.state;
  }

  setProfile(partial: Partial<UserProfile>) {
    this.state = { ...this.state, ...partial };
    this.save();
  }

  private save() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
    } catch (error) {
      console.warn('Failed to save user profile', error);
    }
  }

  private load() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored);
      this.state = { ...this.state, ...parsed };
    } catch (error) {
      console.warn('Failed to load user profile', error);
    }
  }
}

export const userProfileStore = new UserProfileStore();
