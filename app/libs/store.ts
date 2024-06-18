import { create } from 'zustand';
import { createJSONStorage, persist, PersistStorage } from 'zustand/middleware';

interface CourseData {
    prodi: string;
    semester: string;
    period: string;
    course: string;
    day: string;
    time: string;
}

interface CoursesState {
  coursesData: CourseData[];
  addCourse: (course: CourseData) => void;
  removeCourse: (index: number) => void;
}

// Konfigurasi storage untuk mempersistensikan data
const useStorage: PersistStorage<CoursesState> = createJSONStorage(() => sessionStorage) as PersistStorage<CoursesState>;

export const useCoursesStore = create(
  persist<CoursesState>(
    (set, get) => ({
      coursesData: [],
      addCourse: (course) =>
        set((state) => ({ coursesData: [...state.coursesData, course] })),
      removeCourse: (index) =>
        set((state) => ({
          coursesData: state.coursesData.filter((_, i) => i !== index),
        })),
    }),
    {
      name: 'courses-storage',
      storage: useStorage,
    }
  )
);