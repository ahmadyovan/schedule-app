'use client'

import { createClientSupabase } from "@/utils/supabase/client";
import { useCallback, useEffect, useRef, useState } from "react";
import { deleteAllData, insertSchedule } from "../component/clientfunctions";
import { PARTICLE_SWARM_OPTIMIZATION, Schedules, Parameter, OptimizedSchedule } from '@/app/component/pso';

interface Prodi {
    prodi_id: any
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


interface Result {
    message: string
    schedule: OptimizedSchedule[];
}

const Interface = () => {
    const supabase = createClientSupabase();
    const [course, setCourse] = useState<Jadwal[]>();
    const [schedule, setSchedule] = useState<OptimizedSchedule[]>();
    const [parameter, setParameter] = useState<Parameter>({
        num_iteration: 100,
        num_particle: 2000,
        W: 0.7,
        c1: 1.4,
        c2: 1.5,
    });

    const [iteration, setIteration] = useState<number>(0)
    const [numIteration, setNumIteration] = useState<number>()
    const [bestFitness, setBestFitness] = useState<number>()
    const [elapsedTime, setElapsedTime] = useState<number>()
    const [formattedTime, setFormattedTime] = useState<string>();
    const [particleIndex, setparticleIndex]=useState<number>()
    const [fitness, setFitness]=useState<number>()
    const [isProcess, setIsProcess] = useState<boolean>()
    const [currentStage, setCurrentStage] = useState<string>()
    const [optimizationResult, setOptimizationResult] = useState<Result | null>(null);
    const [formParameter, setFormParameter] = useState<boolean>(false);
    const wsRef = useRef(null);

    useEffect(() => {
        fetchJadwal();
    }, []);

    const fetchJadwal = useCallback(async () => {
        const { data, error } = await supabase
            .from('jadwal')
            .select(`*, course (*), user(*) `);

        if (data) {
            setCourse(data);
        }
        if (error) console.error('Error fetching jadwal:', error);
    }, [supabase]);

    const fetchSchedule = useCallback(async () => {
        const { data, error } = await supabase
            .from('schedule')
            .select(`*, prodi(*) `);

        if (data) {

            setSchedule(data);
        }
        if (error) console.error('Error fetching jadwal:', error);
    }, [supabase]);

    function stopOptimization() {
       
    }

    useEffect(() => {
        if (elapsedTime) {
          setFormattedTime(convertSeconds(elapsedTime));
        }
      }, [elapsedTime]);

      const handleOptimize = useCallback(() => {
        if (!course || !parameter) return;
        console.log("fffffffffffff",course);
        
        const schedules: Schedules[] = course.map(s => ({
            schedule_jadwal_id: s.jadwal_id,
            schedule_sks: s.course.course_sks,
            schedule_prodi: s.course.course_prodi.prodi_id ,
            schedule_semester: parseInt(s.course.course_semester.replace(/\D/g, ""), 10),
            schedule_dosen_num: s.user.user_num,
            schedule_hari: s.jadwal_hari.toString().replace(/[\[\]]/g, ''),
            schedule_waktu: s.jadwal_waktu,
            schedule_class: s.class
        }));
    
        const psoParams: Parameter = {
            num_iteration: parameter.num_iteration,
            num_particle: parameter.num_particle,
            W: parameter.W,
            c1: parameter.c1,
            c2: parameter.c2
        };
    
        setIsProcess(true);
        setCurrentStage("Memulai optimasi");
    
        // Jalankan PSO dalam worker untuk mencegah UI freezing
        const worker = new Worker(new URL('@/app/component/psoworker.ts', import.meta.url));
        worker.postMessage({ schedules, parameter: psoParams });
        console.log(schedules);
        
        worker.onmessage = (event) => {
            const { type, data } = event.data;
            switch (type) {
                case 'progress':
                    setCurrentStage(data.stage);
                    setBestFitness(data.bestFitness);
                    setIteration(data.iteration);
                    break;
                case 'result':
                    handleOptimizationComplete(data);
                    setIsProcess(false);
                    worker.terminate();
                    break;
            }
        };
    
        setFormParameter(false);
    }, [course, parameter]);

    const handleOptimizationComplete = useCallback(async (result: Result) => {
        await deleteAllData('schedule');

        console.log("optima");
        
        
        // for (const schedule of result.schedule) {
        //     try {
        //         await  (schedule);
        //         console.log('berhasil menyimpan jadwal');
        //     } catch (error) {
        //         console.error('Error inserting schedule:', error);
        //     }
        // }

        console.log("data from ",result);

        fetchSchedule();
    }, [fetchSchedule]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, key: keyof Parameter) => {
        const value = e.target.value.replace(',', '.'); // Ganti koma dengan titik
        setParameter({ ...parameter, [key]: value });
        console.log("gggg",parameter);
        
    };

    function convertSeconds(seconds: any) {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = (seconds % 60).toFixed(2);
        return `${hrs} jam, ${mins} menit, ${secs} detik`;
    }

    return (
        <div className='h-full w-full bg-neutral-500 flex flex-col justify-center items-center'>
            <div className="flex justify-center items-center flex-col gap-10">
                {isProcess && (<div className="flex justify-center items-center flex-col" id="metrics">
                    <div className="flex justify-center items-center flex-col" id="metrics">
                    <div>Jumlah partikel yang di uji : {parameter.num_particle}</div>
                    <div>Tahap: {currentStage}</div>
                    <div>Iterasi: {iteration} / {parameter.num_iteration}</div>
                    <p>Nilai Fitnes Dari Posisi terbaik (gBest): <span id="bestFitness">{bestFitness}</span></p>
            </div>
                </div>)}
                <div className="flex flex-col gap-5">
                    <button onClick={() => setFormParameter(true)}>OPTIMALISASI</button>
                    <button onClick={stopOptimization}>Stop Optimization</button>
                </div>
            </div>
            
            { formParameter && (
                <div className="fixed inset-0 bg-gray-600 flex items-center justify-center pb-60 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
                    <div className="relative top-20 mx-auto p-5 border w-fit flex flex-col gap-5 shadow-lg rounded-md bg-neutral-700">
                        <div className="text-center">parameter</div>
                        <div>
                            <h1>Jumlah Populasi</h1>
                            <input 
                                className="bg-neutral-600 py-2 px-1 mt-2" 
                                type="text"
                                value={parameter.num_particle || ''}
                                onChange={(e) => handleInputChange(e, 'num_particle')} 
                            />
                        </div>
                        <div>
                            <h1>Jumlah Iterasi</h1>
                            <input 
                                className="bg-neutral-600 py-2 px-1 mt-2" 
                                type="text" 
                                value={parameter.num_iteration || ''}
                                onChange={(e) => handleInputChange(e, 'num_iteration')}
                            />
                        </div>
                        <div>
                            <h1>Bobot Inertia</h1>
                            <input 
                                className="bg-neutral-600 py-2 px-1 mt-2" 
                                type="number"
                                step="0.1" // Menambahkan step untuk memungkinkan input desimal
                                value={parameter.W || ''}
                                onChange={(e) => handleInputChange(e, 'W')}
                            />
                        </div>
                        <div>
                            <h1>Koefisien Pembelajaran Individu</h1>
                            <input 
                                className="bg-neutral-600 py-2 px-1 mt-2" 
                                type="number"
                                step="0.1" // Menambahkan step untuk memungkinkan input desimal
                                value={parameter.c1 || ''}
                                onChange={(e) => handleInputChange(e, 'c1')}
                            />
                        </div>
                        <div>
                            <h1>Koefisien Pembelajaran Sosial</h1>
                            <input 
                                className="bg-neutral-600 py-2 px-1 mt-2" 
                                type="number"
                                step="0.1" // Menambahkan step untuk memungkinkan input desimal
                                value={parameter.c2 || ''}
                                onChange={(e) => handleInputChange(e, 'c2')}
                            />
                        </div>
                        <div className="flex flex-col items-center gap-3">
                            <button onClick={handleOptimize}>Mulai Optimalisasi</button>
                            <button onClick={() => setFormParameter(false)}>Batal</button>
                        </div>
                    </div>
                </div>
            )}
            
        </div>
    );
}

export default Interface;
