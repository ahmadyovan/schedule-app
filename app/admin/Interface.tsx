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
    Schedule_Dosen_num: number;
    Schedule_Hari: string;
    Schedule_Waktu: string;
}

interface Parameter {
    num_iteration: number;
    num_particle: number;
    w: number;
    c1: number;
    c2: number;
    vmax: number
}

interface Result {
    message: string
    schedule: OptimizedSchedule[];
}

interface Pdrodi {
    prodi_id: number;
    prodi_name: string;
    created_at: string;
    check: number;
  }

const Interface = () => {
    const supabase = createClientSupabase();
    const [course, setCourse] = useState<Jadwal[]>();
    const [schedule, setSchedule] = useState<OptimizedSchedule[]>();
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [parameter, setParameter] = useState<Parameter>({
        num_iteration: 100,
        num_particle: 100,
        w: 0.9,
        c1: 1.5,
        c2: 1.5,
        vmax: 1.0
    });

    const [iteration, setIteration] = useState<number>(0)
    const [numIteration, setNumIteration] = useState<number>()
    const bestFitnessRef = useRef<number | null>(null);
    const previousFitnessRef = useRef<number | null>(null);
    const [elapsedTime, setElapsedTime] = useState<number>()
    const [formattedTime, setFormattedTime] = useState<string>();
    const [particleIndex, setparticleIndex]=useState<number>()
    const [fitness, setFitness]=useState<number>()
    const [isProcess, setIsProcess] = useState<boolean>()
    const [currentStage, setCurrentStage] = useState<string>()
    const [optimizationResult, setOptimizationResult] = useState<Result | null>(null);
    const [formParameter, setFormParameter] = useState<boolean>(false);
    const wsRef = useRef(null);

    const [penalti1, setpenalti1] = useState<number>(0)
    const [penalti2, setpenalti2] = useState<number>(0)
    const [penalti3, setpenalti3] = useState<number>(0)
    const [penalti4, setpenalti4] = useState<number>(0)
    const [penalti5, setpenalti5] = useState<number>(0)
    const [checkprodi, setCheckProdi] = useState<Pdrodi[]>([]);


    const fetchData = async () => {
        const { data, error } = await supabase
          .from('prodi')
          .select('*');
    
        if (error) {
          console.error('Error fetching data:', error);
        } else {
          // Filter data where 'check' is 1
          const filteredData = data.filter(item => item.check === 1);
          // Update state with filtered data
          setCheckProdi(filteredData);
          console.log('Filtered Data:', filteredData);
        }
      };
    
      useEffect(() => {
        fetchData();
      }, []);
      
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
                    previousFitnessRef.current = bestFitnessRef.current;
                    bestFitnessRef.current = data.data.gBestFitness;
                } else if (data.type === 'iterasi') {
                    setIteration(data.data.iterasi);
                } else if (data.type === 'finalFitness') {
                    setpenalti1(data.data.preferensiwaktu)
                    setpenalti2(data.data.totalsksconflik)
                    setpenalti3(data.data.tumpangtindih)
                    setpenalti4(data.data.prefensihari)
                    setpenalti5(data.data.penaltitimelimit)
                } else if (data.type === 'result') {
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
            .select(`*, course (*), user(*) `)
            // .in('check', checkprodi.map(item => (item.prodi_id)));


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
        bestFitnessRef.current = 0
        setCurrentStage('')
        setElapsedTime(0)
        setFitness(0)
        setFormattedTime('')
        setIteration(0)
        setNumIteration(parameter.num_iteration)
        setIsProcess(false);
        setpenalti1(0)
        setpenalti2(0)
        setpenalti3(0)
        setpenalti4(0)
        setpenalti5(0)
        
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
                c2: parseFloat(parameter.c2 as unknown  as string),
                vmax: parseFloat(parameter.vmax as unknown  as string)
            },
        };

        socket.send(JSON.stringify(requestBody));
        console.log(requestBody);
        
        setFormParameter(false);
    }, [course, parameter, socket]);

    const handleOptimizationComplete = useCallback(async (result: Result) => {
        await deleteAllData('schedule');
        
        // for (const schedule of result.schedule) {
        //     try {
        //         await insertSchedule(schedule);
        //         console.log('berhasil menyimpan jadwal');
        //     } catch (error) {
        //         console.error('Error inserting schedule:', error);
        //     }
        // }

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
            
            <div className="flex justify-center items-center flex-col gap-10  min-w-[50%] p-5 min-h-[70%] bg-slate-500">
                {(<div className="flex gap-3 " id="metrics">
                    <div>
                    <div>
                          <h1>jadwal prodi yang sudah siap di di optimasi</h1>
                          <ul>
                            {checkprodi.map(item => (
                              <li key={item.prodi_id}>
                                {item.prodi_name}
                              </li>
                            ))}
                          </ul>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-col gap-5" id="metrics">
                            <div className="flex flex-col">
                                <h1>Jumlah partikel yang di uji : {parameter.num_particle}</h1>
                                <h1>Jumlah iterasi yang di uji : {parameter.num_iteration}</h1>
                                <h1>nilai W yang di uji : {parameter.w}</h1>
                                <h1>nilai C1 yang di uji : {parameter.c1}</h1>
                                <h1>nilai C2 yang di uji : {parameter.c2}</h1>
                                <h1>nilai vmax yang di uji : {parameter.vmax}</h1>
                            </div>
                        <div className="flex flex-col">
                            <div className="flex gap-2">
                                {isProcess? (<h1>proses berlasung </h1>):(<h1>proses berhenti </h1>)}<h1>{formattedTime}</h1>
                            </div>
                            {!currentStage?.includes('Inisialisasi') && (<h1>{iteration}</h1>)}
                            <h1>Tahap: {currentStage}</h1>
                            <h1>Nilai Fitnes lama Dari Posisi terbaik (gBest) : <span id="bestFitness">{previousFitnessRef.current}</span></h1>
                            <h1>Nilai Fitnes baru Dari Posisi terbaik (gBest) : <span id="bestFitness">{bestFitnessRef.current}</span></h1>
                            <h1>Total Penalti: {penalti1 + penalti2 + penalti3 + penalti4 + penalti5}</h1>
                        </div> 
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div>Total Penalti preferensi waktu: {penalti1}</div>
                        <div>Total Penalti maksimal sks: {penalti2}</div>
                        <div>Total Penalti tumpang tindih: {penalti3}</div>
                        <div>Total Penalti prefensi hari: {penalti4}</div>
                        <div>Total Penalti penalti batas jadwal: {penalti5}</div>
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
                        <div>
                            <h1>Batas Kecepatan</h1>
                            <input 
                                className="bg-neutral-600 py-2 px-1 mt-2" 
                                type="number"
                                step="0.1" // Menambahkan step untuk memungkinkan input desimal
                                value={parameter.vmax || ''}
                                onChange={(e) => handleInputChange(e, 'vmax')}
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
