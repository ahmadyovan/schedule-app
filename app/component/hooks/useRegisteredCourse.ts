import { useState, useEffect } from 'react';
import { fetchRegisteredCourses } from '../functions';
import { Courses, RegisteredCourse } from '../types';

export const useRegisteredCourses = (programStudi: string) => {<Courses>({});
    const [registeredCourses, setRegisteredCourses] = useState<RegisteredCourse[]>([]);
    const [isLoading1, setIsLoading1] = useState(true);

    useEffect(() => {
        setIsLoading1(true);
        const unsubscribeRegisteredCourses = fetchRegisteredCourses(programStudi, (courses) => {
            setRegisteredCourses(courses);
            setIsLoading1(false);
        });

        return () => {
            unsubscribeRegisteredCourses();
        };
    }, [programStudi]);

    return { registeredCourses, setRegisteredCourses, isLoading1 };
};