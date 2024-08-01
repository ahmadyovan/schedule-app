import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Tables } from '@/app/component/types/supabase'

interface CourseState {
  registeredCourses: {
    course_id: number;
    course_semester: string | null;
    course_kode: string;
    course_name: string;
    course_sks:number | null;
    course_waktu: string;
    course_kelas: string;

  }[];
  addCourse: (course: { course_id: number; course_semester: string | null; course_kode:string; course_name: string; course_sks:number | null; course_waktu: string; course_kelas: string }) => void;
  removeCourse: (index: number) => void;
  clearCourses: () => void;
}

export const useCourseStore = create<CourseState>()(
  persist(
    (set) => ({
      registeredCourses: [],
      addCourse: (course) => set((state) => ({ 
        registeredCourses: [...state.registeredCourses, course] 
      })),
      removeCourse: (index) => set((state) => ({ 
        registeredCourses: state.registeredCourses.filter((_, i) => i !== index) 
      })),
      clearCourses: () => set({ registeredCourses: [] }),
    }),
    {
      name: 'course-storage',
    }
  )
)