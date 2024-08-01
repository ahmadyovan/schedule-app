import { useState, useCallback, useEffect } from "react";
import { createClientSupabase } from "@/utils/supabase/client";

interface Prodi {
    prodi_id: string;
    prodi_name: string;
}

interface Dosen {
    user_name: string
    user_num: string
}

interface Prodi {
    prodi_id: string
    prodi_name: string
}

interface Course {
    course_id: number;
    course_kode: string;
    course_name: string;
    course_sks: number;
    course_semester: string;
    course_prodi: Prodi
}

interface User {
    user_name: string;
    user_num: number
}

interface Jadwal {
    jadwal_id: number;
    jadwal_course_id: number;
    jadwal_dosen_id: string;
    jadwal_hari: string;
    jadwal_waktu: string;
    jadwal_jam: string;
    created_at: string;
    class: string;
    course: Course;
    user: User;
}

interface OptimizedSchedule {
    schedule_jadwal_id: number
    schedule_sks: number;
    schedule_prodi: number;
    schedule_dosen_num: number;
    schedule_hari: string;
    schedule_waktu: string;
    prodi: Prodi
    jadwal: Jadwal
}

import React from 'react';
import { useUser } from "../hooks/useUser";

interface ScheduleTableProps {
    courses: OptimizedSchedule[];
}

interface ScheduleTabsProps {
    morningCourses: OptimizedSchedule[];
    eveningCourses: OptimizedSchedule[];
    duplicateCourses: OptimizedSchedule[];
}

const ScheduleTabs: React.FC<ScheduleTabsProps> = ({ morningCourses, eveningCourses, duplicateCourses }) => {
    const [activeTab, setActiveTab] = useState<'morning' | 'evening'>('morning');

    const currentCourses = activeTab === 'morning' ? morningCourses : eveningCourses;
    const currentDuplicates = duplicateCourses.filter(course => 
        (activeTab === 'morning' && course.schedule_waktu >= '08:00' && course.schedule_waktu <= '12:00') ||
        (activeTab === 'evening' && course.schedule_waktu >= '18:00' && course.schedule_waktu <= '22:00')
    );

    return (
        <div>
            <div className="flex mb-4">
                <button
                    className={`px-4 py-2 mr-2 ${activeTab === 'morning' ? 'bg-blue-500' : 'bg-gray-700'}`}
                    onClick={() => setActiveTab('morning')}
                >
                    Pagi (08:00 - 12:00)
                </button>
                <button
                    className={`px-4 py-2 ${activeTab === 'evening' ? 'bg-blue-500' : 'bg-gray-700'}`}
                    onClick={() => setActiveTab('evening')}
                >
                    Malam (18:00 - 22:00)
                </button>
            </div>
            <ScheduleTable courses={currentCourses} />
            {currentDuplicates.length > 0 && (
                <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Mata Kuliah Duplikat</h3>
                    <ScheduleTable courses={currentDuplicates} />
                </div>
            )}
        </div>
    );
};

interface ScheduleTableProps {
    courses: OptimizedSchedule[];
}

const ScheduleTable: React.FC<ScheduleTableProps> = ({ courses }) => {
    return (
        <table className="w-full border-collapse">
            <thead>
                <tr className="bg-gray-800">
                    <th className="border border-gray-600 p-2">No</th>
                    <th className="border border-gray-600 p-2">Kode</th>
                    <th className="border border-gray-600 p-2">Mata Kuliah</th>
                    <th className="border border-gray-600 p-2">SKS</th>
                    <th className="border border-gray-600 p-2">Dosen</th>
                    <th className="border border-gray-600 p-2">Hari</th>
                    <th className="border border-gray-600 p-2">Waktu</th>
                </tr>
            </thead>
            <tbody>
                {courses.map((course, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700'}>
                        <td className="border border-gray-600 p-2">{index + 1}</td>
                        <td className="border border-gray-600 p-2">{course.jadwal.course.course_kode}</td>
                        <td className="border border-gray-600 p-2">{course.jadwal.course.course_name}</td>
                        <td className="border border-gray-600 p-2">{course.schedule_sks}</td>
                        <td className="border border-gray-600 p-2">{course.jadwal.user.user_name}</td>
                        <td className="border border-gray-600 p-2">{course.schedule_hari}</td>
                        <td className="border border-gray-600 p-2">{course.schedule_waktu}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

const DuplicateCoursesTable: React.FC<ScheduleTableProps> = ({ courses }) => {
    return (
        <div>
            <h3 className="text-lg font-semibold mb-2">Mata Kuliah Duplikat</h3>
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-gray-800">
                        <th className="border border-gray-600 p-2">No</th>
                        <th className="border border-gray-600 p-2">Kode</th>
                        <th className="border border-gray-600 p-2">Mata Kuliah</th>
                        <th className="border border-gray-600 p-2">SKS</th>
                        <th className="border border-gray-600 p-2">Dosen</th>
                        <th className="border border-gray-600 p-2">Hari</th>
                        <th className="border border-gray-600 p-2">Waktu</th>
                    </tr>
                </thead>
                <tbody>
                    {courses.map((course, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700'}>
                            <td className="border border-gray-600 p-2">{index + 1}</td>
                            <td className="border border-gray-600 p-2">{course.jadwal.course.course_kode}</td>
                            <td className="border border-gray-600 p-2">{course.jadwal.course.course_name}</td>
                            <td className="border border-gray-600 p-2">{course.schedule_sks}</td>
                            <td className="border border-gray-600 p-2">{course.jadwal.user.user_name}</td>
                            <td className="border border-gray-600 p-2">{course.schedule_hari}</td>
                            <td className="border border-gray-600 p-2">{course.schedule_waktu}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const Jadwal = () => {
    const supabase = createClientSupabase();
    const [courses, setCourses] = useState<OptimizedSchedule[]>([]);
    const {userData} = useUser()

    useEffect(() => {
        console.log( "data",userData);
        if(userData) {
            fetchSchedule();
        }
        
    }, [userData]);

    const fetchSchedule = useCallback(async () => {
        const { data, error } = await supabase
            .from('schedule')
            .select(`
                *,
                prodi (*),
                jadwal (
                    *,
                    course (*),
                    user (*)
                )
            `)
            .eq('schedule_prodi', userData?.user_prodi.prodi_id)
            .or('schedule_waktu.gte.08:00,schedule_waktu.lte.22:00')
            .order('course_semester', { foreignTable: 'jadwal.course', ascending: true })
            .order('schedule_waktu', { ascending: true });
            
        if (data) {
            setCourses(data);
        }
        if (error) console.error('Error fetching jadwal:', error);


        if (data) {
            console.log(data);

            setCourses(data);
        }
        if (error) console.error('Error fetching jadwal:', error);
    }, [userData, supabase]);

    const extractNumberFromSemester = (semesterString: string) => {
        const match = semesterString.match(/\d+/); // Mencari angka dalam string
        return match ? parseInt(match[0], 10) : null; // Mengembalikan angka sebagai integer
    };

    const groupedCourses = courses.reduce((acc, course) => {
        const semester = extractNumberFromSemester(course.jadwal.course.course_semester);
        const time = course.schedule_waktu;
        const timeSlot = time >= '08:00' && time <= '12:00' ? 'morning' : 'evening';
        const classGroup = course.jadwal.class;
    
        if (semester) {
            if (!acc[semester]) {
                acc[semester] = {};
            }
            if (!acc[semester][classGroup]) {
                acc[semester][classGroup] = { morning: [], evening: [], duplicates: [] };
            }
            
            const existingCourse = acc[semester][classGroup][timeSlot].find(c => c.jadwal.course.course_kode === course.jadwal.course.course_kode);
            
            if (existingCourse) {
                acc[semester][classGroup].duplicates.push(course);
            } else {
                acc[semester][classGroup][timeSlot].push(course);
            }
        }
        
        return acc;
    }, {} as Record<string, Record<string, { morning: OptimizedSchedule[], evening: OptimizedSchedule[], duplicates: OptimizedSchedule[] }>>);

    Object.keys(groupedCourses).forEach(semester => {
        groupedCourses[semester] = Object.fromEntries(
            Object.entries(groupedCourses[semester]).sort(([a], [b]) => a.localeCompare(b))
        );
    });

    return (
        <div className="h-full w-full p-10">
            <div className="h-full w-full text-white flex flex-col gap-5">
                <h1 className="text-2xl font-bold">Jadwal Kuliah</h1>
                <div className="h-full w-full overflow-hidden">
                    <div className="h-full overflow-y-auto">
                        <div className="h-full">
                        {Object.entries(groupedCourses).map(([semester, semesterClasses]) => (
                            <div key={semester} className="w-full mb-8">
                                <h2 className="text-xl font-semibold mb-4">Semester {semester}</h2>
                                {Object.entries(semesterClasses).map(([classGroup, classCourses]) => (
                                    <div key={`${semester}-${classGroup}`} className="mb-6">
                                        <h3 className="text-lg font-semibold mb-2">Kelas {classGroup}</h3>
                                        <ScheduleTabs 
                                            morningCourses={classCourses.morning} 
                                            eveningCourses={classCourses.evening} 
                                            duplicateCourses={classCourses.duplicates} 
                                        />
                                    </div>
                                ))}
                            </div>
                        ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default Jadwal;