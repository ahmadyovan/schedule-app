'use client'

import { createClientSupabase } from "@/utils/supabase/client";
import { useCallback, useEffect, useRef, useState } from "react";
import { deleteAllData, insertSchedule } from "../component/clientfunctions";
import { Schedules, Parameter, OptimizedSchedule } from '@/app/component/pso';


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
    course_prodi: number
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
    schedule:   [];
}

const Interface = () => {
    const supabase = createClientSupabase();
    const [course, setCourse] = useState<Jadwal[]>();
    const [schedule, setSchedule] = useState<OptimizedSchedule[]>();
    const [parameter, setParameter] = useState<Parameter>({
        num_iteration: 100,
        num_particle: 50,
        W: 0.7,
        c1: 1.4,
        c2: 1.5,
    });
    const workerRef = useRef<Worker | null>(null);
    const [iteration, setIteration] = useState<number>(0)
    const [numIteration, setNumIteration] = useState<number>()
    const [bestFitness, setGlobalFitness] = useState<number>()
    const [elapsedTime, setElapsedTime] = useState<number>(0);
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

  
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isProcess) {
          interval = setInterval(() => {
            setElapsedTime((prevTime) => prevTime + 1);
          }, 1000);
        } else {
        //   setElapsedTime(0);
        }
        return () => {
          if (interval) {
            clearInterval(interval);
          }
        };
    }, [isProcess]);
    

    const handleOptimize = useCallback(() => {
        if (!course || !parameter) return;
        
        const schedules: Schedules[] = course.map(s => ({
            schedule_jadwal_id: s.jadwal_id,
            schedule_sks: s.course.course_sks,
            schedule_prodi: s.course.course_prodi,
            schedule_semester: parseInt(s.course.course_semester.replace(/\D/g, ""), 10),
            schedule_dosen_num: s.user.user_num,
            schedule_hari: s.jadwal_hari.toString().replace(/[\[\]]/g, ''),
            schedule_waktu: s.jadwal_waktu,
            schedule_class: s.class
        }));
        
        const psoParams: Parameter = {
            num_iteration: parseFloat(parameter.num_iteration as unknown as string),
            num_particle: parseFloat(parameter.num_particle as unknown as string),
            W: parseFloat(parameter.W as unknown as string),
            c1: parseFloat(parameter.c1 as unknown  as string),
            c2: parseFloat(parameter.c2 as unknown  as string)
        };
        
        setGlobalFitness(0)
        setIsProcess(true);
        setCurrentStage("Memulai optimasi");
    
        // Jalankan PSO dalam worker untuk mencegah UI freezing
        workerRef.current = new Worker(new URL('@/app/component/psoworker.ts', import.meta.url));
        workerRef.current.postMessage({ schedules, parameter: psoParams });
        
        workerRef.current.onmessage = (event) => {
            const { type, data } = event.data;
            if (type === 'progress') {
                switch (data.type) {
                    case 'iteration':
                        setIteration(data.value);
                        break;
                    case 'stage':
                        setCurrentStage(data.value);
                        break;
                    case 'bestFitness':
                        setGlobalFitness(data.value);
                        break;
                }
            } else if (type === 'result') {
                handleOptimizationComplete(data);
                setIsProcess(false);
                if (workerRef.current) {
                    workerRef.current.terminate();
                    workerRef.current = null;
                }
            }
        };
        
        
        console.log("pbest",bestFitness);
        
    
        setFormParameter(false);
    }, [course, parameter]);

    const stopOptimization = useCallback(() => {
        if (workerRef.current) {
            workerRef.current.terminate();
            workerRef.current = null;
            setIsProcess(false);
            setCurrentStage("Optimasi dihentikan");
        }
    }, []);

    useEffect(() => {
        return () => {
            if (workerRef.current) {
                workerRef.current.terminate();
                workerRef.current = null;
            }
        };
    }, []);

    const handleOptimizationComplete = useCallback(async (result: Result) => {
        await deleteAllData('schedule');
        
        for (const schedule of result.schedule) {
            try {
                await insertSchedule(schedule);
                console.log('berhasil menyimpan jadwal');
            } catch (error) {
                console.error('Error inserting schedule:', error);
            }
        }

        fetchSchedule();
    }, [fetchSchedule]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, key: keyof Parameter) => {
        const value = e.target.value.replace(',', '.'); // Ganti koma dengan titik
        setParameter({ ...parameter, [key]: value });
        console.log("gggg",parameter);
        
    };

    const formatTime = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className='h-full w-full bg-neutral-500 flex flex-col justify-center items-center'>
            <div className="flex justify-center flex-col gap-10  min-w-[40%] p-5 min-h-[70%] bg-slate-500">
                {(<div className="flex flex-col " id="metrics">
                    <div className="flex flex-col gap-5" id="metrics">
                        <div className="flex flex-col">
                            <h1>Jumlah partikel yang di uji : {parameter.num_particle}</h1>
                            <h1>Jumlah iterasi yang di uji : {parameter.num_iteration}</h1>
                            <h1>nilai W yang di uji : {parameter.W}</h1>
                            <h1>nilai C1 yang di uji : {parameter.c1}</h1>
                            <h1>nilai C2 yang di uji : {parameter.c2}</h1>
                        </div>
                       <div className="flex flex-col">
                        <div className="flex gap-2">
                             {isProcess? (<h1>proses berlasung </h1>):(<h1>proses berhenti </h1>)}<h1>{formatTime(elapsedTime)}</h1>
                        </div>
                        {!currentStage?.includes('inisialisasi') && (<h1>{iteration}</h1>)}
                        <h1>Tahap: {currentStage}</h1>
                        <h1>Nilai Fitnes Dari Posisi terbaik (gBest) : <span id="bestFitness">{bestFitness}</span></h1>
                       </div>
                        
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
                            <input className="bg-neutral-600 py-2 px-1 mt-2" type="number" value={parameter.num_particle || ''}onChange={(e) => handleInputChange(e, 'num_particle')} 
                            />
                        </div>
                        <div>
                            <h1>Jumlah Iterasi</h1>
                            <input className="bg-neutral-600 py-2 px-1 mt-2" type="number" value={parameter.num_iteration || ''}onChange={(e) => handleInputChange(e, 'num_iteration')}
                            />
                        </div>
                        <div>
                            <h1>Bobot Inertia</h1>
                            <input className="bg-neutral-600 py-2 px-1 mt-2" type="number" step="0.1" value={parameter.W || ''}onChange={(e) => handleInputChange(e, 'W')}
                            />
                        </div>
                        <div>
                            <h1>Koefisien Pembelajaran Individu</h1>
                            <input className="bg-neutral-600 py-2 px-1 mt-2" type="number" step="0.1" value={parameter.c1 || ''}onChange={(e) => handleInputChange(e, 'c1')}
                            />
                        </div>
                        <div>
                            <h1>Koefisien Pembelajaran Sosial</h1>
                            <input className="bg-neutral-600 py-2 px-1 mt-2" type="number" step="0.1" value={parameter.c2 || ''}onChange={(e) => handleInputChange(e, 'c2')}
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
