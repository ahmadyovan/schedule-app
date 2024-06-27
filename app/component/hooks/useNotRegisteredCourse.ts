import { useState, useEffect } from 'react';
import { fetchNotRegisteredCourses } from '@/app/component/functions'

export interface MataKuliah {
    'KODE': string;
    'MATA KULIAH': string;
    'SKS': string;
}

export interface ExtendedMataKuliah extends MataKuliah {
    semester: string;
    periode: string;
}

const useNotRegisteredCourses = (prodi: string) => {
  const [notRegisteredCourses, setNotRegisteredCourses] = useState<ExtendedMataKuliah[]>([]);
  const [isLoading2, setIsLoading2] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading2(true);
    setError(null);
  
    let unsubscribe: (() => void) | undefined;
  
    try {
      unsubscribe = fetchNotRegisteredCourses(prodi, (courses) => {
        const validCourses = courses.map(course => ({
          ...course,
          'KODE': course['KODE'] || '',
          'MATA KULIAH': course['MATA KULIAH'] || '',
          'SKS': course['SKS'] || '',
          semester: course.semester || '',
          periode: course.periode || ''
        }));
        setNotRegisteredCourses(validCourses);
        setIsLoading2(false);
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
      setIsLoading2(false);
    }
  
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [prodi]);

  return { notRegisteredCourses, isLoading2, error };
};

export default useNotRegisteredCourses;