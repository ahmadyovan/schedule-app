import React, { useEffect, useState, useMemo } from "react";
import { onValue } from 'firebase/database';
import { db, ref} from '@/app/libs/firebase/firebase'; 
import * as XLSX from 'xlsx';
import FileSaver from 'file-saver';

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
    sks: string;
    semester: string;
    waktu: string;
}

const dayOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

const CourseTable: React.FC<{ courses: RegisteredCourse[], timeRange: 'pagi' | 'malam' }> = React.memo(({ courses, timeRange }) => {
    const filteredAndSortedCourses = useMemo(() => 
        courses.filter(course => {
            const startTime = Array.isArray(course.waktu) ? course.waktu[0] : course.waktu.split(' - ')[0];
            const hour = parseInt(startTime.split(':')[0]);
            if (timeRange === 'pagi') {
                return hour >= 8 && hour < 12;
            } else {
                return hour >= 18 && hour < 22;
            }
        }).sort((a, b) => dayOrder.indexOf(a.hari) - dayOrder.indexOf(b.hari)),
        [courses, timeRange]
    );

    return (
        <div>
            <div className="w-full flex py-4 gap-2 px-10">
                <div className="w-[10%]">Hari</div>
                <div className="w-[10%]">Kode</div>
                <div className="w-[30%]">Mata Kuliah</div>
                <div className="w-[30%]">Dosen</div>
                <div className="w-[15%]">Waktu</div>
                <div className="w-[5%]">Sks</div>
            </div>

            <div>
                {filteredAndSortedCourses.map((course, index) => (
                    <div key={index} className={`flex gap-2 w-full ${index % 2 === 0 ? 'bg-neutral-700' : 'bg-neutral-600'} py-2 px-10`}>
                        <div className="w-[10%]">{course.hari}</div>
                        <div className="w-[10%]">{course.kode}</div>
                        <div className="w-[30%]">{course.matakuliah}</div>
                        <div className="w-[30%]">{course.dosen}</div>
                        <div className="w-[15%]">
                            {Array.isArray(course.waktu) 
                                ? `${course.waktu[0]} - ${course.waktu[1]}`
                                : course.waktu
                            }
                        </div>
                        <div className="w-[5%]">{course.sks}</div>
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
                    <CourseTable courses={semesterCourses} timeRange="pagi" />
                </div>
                <div className="w-full border-4">
                    <h1 className="text-center uppercase py-2">malam</h1>
                    <CourseTable courses={semesterCourses} timeRange="malam" />
                </div>
            </div>
        </div>
    );
});

SemesterSchedule.displayName = 'SemesterSchedule';

const exportToExcel = (jadwal: JadwalItem) => {
    const workbook = XLSX.utils.book_new();
    const periods = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'];
    const timeRanges = ['PAGI', 'MALAM'];
  
    const borderStyle = { style: "thin", color: { auto: 1 } };
    const defaultStyle = {
      border: {
        top: borderStyle,
        bottom: borderStyle,
        left: borderStyle,
        right: borderStyle
      }
    };
  
    periods.forEach(period => {
      const courses = jadwal.registeredCourses.filter(course => course.period === period);
      const worksheetData: any[] = [];
  
      // Add period title
      worksheetData.push([{
        v: period,
        s: {
          ...defaultStyle,
          font: { bold: true },
          fill: { fgColor: { rgb: "000000" } }
        }
      }, '', '', '', '', '']);
  
      timeRanges.forEach(timeRange => {
        // Add time range title
        worksheetData.push([{
          v: timeRange,
          s: {
            ...defaultStyle,
            font: { bold: true },
            fill: { fgColor: { rgb: "000000" } }
          }
        }, '', '', '', '', '']);
  
        // Add headers
        worksheetData.push(['Hari', 'Kode', 'Mata Kuliah', 'Dosen', 'Waktu', 'SKS'].map(header => ({
          v: header,
          s: {
            ...defaultStyle,
            font: { bold: true },
            fill: { fgColor: { rgb: "1F1F1F" } }
          }
        })));
  
        const filteredCourses = courses.filter(course => {
          const startTime = Array.isArray(course.waktu) ? course.waktu[0] : course.waktu.split(' - ')[0];
          const hour = parseInt(startTime.split(':')[0]);
          return timeRange === 'PAGI' ? (hour >= 8 && hour < 12) : (hour >= 18 && hour < 22);
        });
  
        if (filteredCourses.length > 0) {
          filteredCourses.forEach((course, index) => {
            const rowColor = index % 2 === 0 ? "2A2A2A" : "1F1F1F";
            worksheetData.push([
              course.hari,
              course.kode,
              course.matakuliah,
              course.dosen,
              Array.isArray(course.waktu) ? `${course.waktu[0]} - ${course.waktu[1]}` : course.waktu,
              course.sks
            ].map(cell => ({
              v: cell,
              s: {
                ...defaultStyle,
                fill: { fgColor: { rgb: rowColor } }
              }
            })));
          });
        } else {
          worksheetData.push(['', '', '', '', '', ''].map(() => ({
            v: '',
            s: defaultStyle
          })));
        }
  
        // Add empty row between PAGI and MALAM
        worksheetData.push(['', '', '', '', '', ''].map(() => ({ v: '', s: defaultStyle })));
      });
  
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  
      // Set column widths
      const colWidths = [
        { wch: 10 },  // Hari
        { wch: 10 },  // Kode
        { wch: 30 },  // Mata Kuliah
        { wch: 30 },  // Dosen
        { wch: 15 },  // Waktu
        { wch: 5 }    // SKS
      ];
      worksheet['!cols'] = colWidths;
  
      XLSX.utils.book_append_sheet(workbook, worksheet, period);
    });
  
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    FileSaver.saveAs(data, `Jadwal_${jadwal.programStudi}.xlsx`);
  };

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
                    {jadwal && (
            <button 
              onClick={() => exportToExcel(jadwal)}
              className="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Export to Excel
            </button>
          )}
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