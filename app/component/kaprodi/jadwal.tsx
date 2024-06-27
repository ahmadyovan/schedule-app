import React, { useEffect, useState, useMemo } from "react";
import { onValue } from 'firebase/database';
import { db, ref, remove } from '@/app/libs/firebase/firebase'; 

interface FirebaseJadwal {
    [key: string]: JadwalItem;
  }
  
interface JadwalItem {
    programStudi: string;
    registeredCourses: RegisteredCourse[];
}
  
interface RegisteredCourse {
    dosen: string;
    dosenID: string;
    hari: string;
    key: string;
    kode: string;
    matakuliah: string;
    period: string;
    prodi: string;
    semester: string;
    waktu: string;
}

const dayOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

const CourseTable: React.FC<{ courses: RegisteredCourse[], timeFilter: string[] }> = React.memo(({ courses, timeFilter }) => {
    console.log(courses);
    
    const filteredCourses = useMemo(() => 
        courses.filter(course => {
            const [startTime] = course.waktu.split(' - ');
            return timeFilter.includes(startTime);
        })
        .sort((a, b) => dayOrder.indexOf(a.hari) - dayOrder.indexOf(b.hari)),
        [courses, timeFilter]
    );

    return (
        <div>
            <div className="w-full flex py-4 gap-2 px-10">
                <div className="w-[10%]">Hari</div>
                <div className="w-[10%]">Kode</div>
                <div className="w-[30%]">Mata Kuliah</div>
                <div className="w-[30%]">Dosen</div>
                <div className="w-[10%]">Waktu</div>
            </div>

            <div>
                {filteredCourses.map((course, index) => (
                    <div key={index} className={`flex gap-2 w-full ${index % 2 === 0 ? 'bg-neutral-700' : 'bg-neutral-600'} py-2 px-10`}>
                        <div className="w-[10%]">{course.hari}</div>
                        <div className="w-[10%]">{course.kode}</div>
                        <div className="w-[30%]">{course.matakuliah}</div>
                        <div className="w-[30%]">{course.dosen}</div>
                        <div className="w-[10%]">{course.waktu}</div>
                    </div>
                ))}
            </div>
        </div>
    );
});
CourseTable.displayName = 'CourseTable';

const SemesterSchedule: React.FC<{ courses: RegisteredCourse[], period: string }> = React.memo(({ courses, period }) => {
    const semesterCourses = useMemo(() => 
        courses.filter(course => course.period === period),
        [courses, period]
    );

    return (
        <div className="w-full overflow-auto flex flex-col px-10 gap-3">
            <h1 className="uppercase">{period}</h1>
            <div className="w-full flex gap-10 overflow-auto">
                <div className="w-full border-4">
                    <h1 className="text-center uppercase py-2">pagi</h1>
                    <CourseTable courses={semesterCourses} timeFilter={['08:00', '10:00']} />
                </div>
                <div className="w-full border-4">
                    <h1 className="text-center uppercase py-2">malam</h1>
                    <CourseTable courses={semesterCourses} timeFilter={['18:00', '20:00']} />
                </div>
            </div>
        </div>
    );
});

SemesterSchedule.displayName = 'SemesterSchedule';

interface JadwalProps {
    programStudi: string
}

const Jadwal = ({ programStudi }: JadwalProps) => {
    const [jadwal, setJadwal] = useState<JadwalItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    console.log(programStudi);
    

    useEffect(() => {
        const jadwalRef = ref(db, 'jadwal');
        const unsubscribe = onValue(jadwalRef, (snapshot) => {
            const data = snapshot.val() as FirebaseJadwal;
            console.log("Raw data from Firebase:", data);
            if (data) {
                console.log("Searching for program studi:", programStudi);
                const selectedJadwal = Object.values(data).find((item): item is JadwalItem => {
                    console.log("Checking item:", item.programStudi);
                    return item.programStudi === programStudi;
                });
                
                console.log("Selected jadwal:", selectedJadwal);
                if (selectedJadwal) {
                    setJadwal(selectedJadwal);
                    // Gunakan callback untuk logging setelah state diupdate
                    setJadwal(prevJadwal => {
                        console.log("Updated jadwal:", prevJadwal);
                        return prevJadwal;
                    });
                    setLoading(false);
                } else {
                    setError(`Tidak ada data jadwal untuk program studi: ${programStudi}`);
                    setLoading(false);
                }
            } else {
                setError('Tidak ada data jadwal atau terjadi kesalahan');
                setLoading(false);
            }
        });
    
        return () => unsubscribe();
    }, [programStudi]);

    if (loading) {
        return <div>Loading jadwal for {programStudi}...</div>;
    }
    
    if (error) {
        return <div>Error: {error}</div>;
    }
    
    if (!jadwal) {
        return <div>No jadwal found for program studi: {programStudi}</div>;
    }

    console.log(jadwal.registeredCourses);
    

    return (
        <div className="h-full w-full">
            <div className='h-full w-full flex flex-col bg-neutral-800'>
                <div className="h-full w-full overflow-auto pr-10">
                    <h1 className="text-center py-16">{programStudi}</h1>
                    <div className="w-[2400px] pb-10 flex gap-10 flex-col">
                        <div className="flex flex-col gap-4">
                            <h1 className="px-10">GASAL</h1>
                            <div className="w-full flex flex-col gap-7">
                                <SemesterSchedule courses={jadwal.registeredCourses} period="Semester 1" />
                                <SemesterSchedule courses={jadwal.registeredCourses} period="Semester 3" />
                                <SemesterSchedule courses={jadwal.registeredCourses} period="Semester 5" />
                                <SemesterSchedule courses={jadwal.registeredCourses} period="Semester 7" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-4">
                            <h1 className="px-10">GENAP</h1>
                            <div className="w-full flex flex-col gap-7">
                                <SemesterSchedule courses={jadwal.registeredCourses} period="Semester 2" />
                                <SemesterSchedule courses={jadwal.registeredCourses} period="Semester 4" />
                                <SemesterSchedule courses={jadwal.registeredCourses} period="Semester 6" />
                                <SemesterSchedule courses={jadwal.registeredCourses} period="Semester 8" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Jadwal;