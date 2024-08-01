'use client'

import { createClientSupabase } from "@/utils/supabase/client";
import { useCallback, useEffect, useRef, useState } from "react";
import { deleteAllData, insertSchedule } from "../component/clientfunctions";
import { Console } from "console";

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
    Schedule_Jadwal_id: number
    Schedule_Sks: number;
    Schedule_Prodi: number;
    Schedule_Semester: number;
    Schedule_Dosen_num: string;
    Schedule_Hari: string;
    Schedule_Waktu: string;
}

interface Parameter {
    num_iteration: number;
    num_particle: number;
    w: number;
    c1: number;
    c2: number;
}

interface Result {
    message: string
    schedule: OptimizedSchedule[];
}

const Interface = () => {
    const supabase = createClientSupabase();
    const [course, setCourse] = useState<Jadwal[]>();
    const [schedule, setSchedule] = useState<OptimizedSchedule[]>();
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [parameter, setParameter] = useState<Parameter>({
        num_iteration: 100,
        num_particle: 2000,
        w: 0.7,
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

    useEffect(() => {
        const connectWebSocket = () => {
            const newSocket = new WebSocket('ws://localhost:8080/ws');

            newSocket.onopen = () => {
                console.log('WebSocket connection established');
            };

            newSocket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                setIsProcess(true)
                
        
                if (data.type === "timeUpdate") {
                    setElapsedTime(data.data.elapsedTime);
                    setFormattedTime(convertSeconds(elapsedTime));
                } else if (data.type === 'stage') {
                    setCurrentStage(data.data.stage);
                } else if (data.type === 'gBestFitness') {
                    setBestFitness(data.data.gBestFitness);
                } else if (data.type === 'finalFitness') {
                    console.log(data);
                } else if (data.type === 'result') 
                    {
                    setOptimizationResult(data.data);
                    handleOptimizationComplete(data.data);
                }
            };

            newSocket.onclose = (event) => {
                console.log('WebSocket connection closed', event.reason);
                setTimeout(connectWebSocket, 5000); // Attempt to reconnect after 5 seconds
            };

            newSocket.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            setSocket(newSocket);
        };

        connectWebSocket();

        return () => {
            if (socket) {
                socket.close();
            }
        };
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
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send("STOP");
        }
    }

    useEffect(() => {
        if (elapsedTime) {
          setFormattedTime(convertSeconds(elapsedTime));
        }
      }, [elapsedTime]);

    const handleOptimize = useCallback(() => {
        if (!course || !parameter || !socket) return;
        setBestFitness(0)
        setCurrentStage('')
        setElapsedTime(0)
        setFitness(0)
        setFormattedTime('')
        setIteration(0)
        setNumIteration(parameter.num_iteration)
        setIsProcess(false);
        
        const requestBody = {
            schedule: course.map(s => ({
                schedule_jadwal_id: s.jadwal_id,
                schedule_sks: s.course.course_sks,
                schedule_prodi: s.course.course_prodi,
                schedule_semester: parseInt(s.course.course_semester.replace(/\D/g, ""), 10),
                schedule_dosen_num: s.user.user_num,
                schedule_hari: s.jadwal_hari.toString().replace(/[\[\]]/g, ''),
                schedule_waktu: s.jadwal_waktu,
                class: s.class
            })),
            parameter: {
                num_iteration: parseFloat(parameter.num_iteration as unknown as string),
                num_particle: parseFloat(parameter.num_particle as unknown as string),
                w: parseFloat(parameter.w as unknown as string),
                c1: parseFloat(parameter.c1 as unknown  as string),
                c2: parseFloat(parameter.c2 as unknown  as string)
            },
        };

        socket.send(JSON.stringify(requestBody));
        console.log(requestBody);
        
        setFormParameter(false);
    }, [course, parameter, socket]);

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
                    <div>Jumlah partikel yang di uji : {parameter.num_particle}</div>
                    <div>Tahap {currentStage}</div>
                    <p>Waktu: <span id="elapsedTime">{formattedTime}</span></p>
                    <p>Nilai Fitnes Dari Posisi terbaik &#40;gBest&#41; : <span id="bestFitness">{bestFitness}</span></p>
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
                                value={parameter.w || ''}
                                onChange={(e) => handleInputChange(e, 'w')}
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
