type CourseState = {
  courseId: string;
  courseName: string;
  careerPath: string;
};

class CourseStore {
  private state: CourseState = {
    courseId: 'electrical-lineworker',
    courseName: 'Electrical Lineworker Mastery',
    careerPath: 'Electrical Lineworker'
  };
  private readonly STORAGE_KEY = 'career-roadmap-course';

  constructor() {
    this.load();
  }

  getCourse() {
    return this.state;
  }

  setCourse(partial: Partial<CourseState>) {
    this.state = { ...this.state, ...partial };
    this.save();
  }

  private save() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
    } catch (error) {
      console.warn('Failed to save course info', error);
    }
  }

  private load() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored);
      this.state = { ...this.state, ...parsed };
    } catch (error) {
      console.warn('Failed to load course info', error);
    }
  }
}

export const courseStore = new CourseStore();
