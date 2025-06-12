'use client';
import { useState, useEffect, useRef } from 'react';
import { createClient } from "@/utils/supabase/client";
import { updateData } from '@/utils/functions';

const supabase = createClient();

type ScheduleItem = {
    id_jadwal: number;
    id_matkul: number;
    id_dosen: number;
    id_waktu: number;
    id_kelas: number;
    semester: number;
    sks: number;
    prodi: number;
};

type PrefData = {
    id_dosen: number,
    senin_pagi: boolean,
    senin_malam: boolean,
    selasa_pagi: boolean,
    selasa_malam: boolean,
    rabu_pagi: boolean,
    rabu_malam: boolean,
    kamis_pagi: boolean,
    kamis_malam: boolean,
    jumat_pagi: boolean,
    jumat_malam: boolean,
}

type ElapsedTime = {
	secs: number;
	nanos: number;
};

type OptimizationProgress = {
	all_best_fitness: number | null;
	best_fitness: number;
	current_run: number;
	elapsed_time: ElapsedTime;
	is_finished: boolean;
	iteration: number;
	total_runs: number | null;
};

type OptimizedSchedule = {
    id_jadwal: number;
    prodi: number;
    semester: number;
    mata_kuliah: number;
    sks: number;
    dosen: number;
    hari: number;
    jam_mulai: number;
    jam_akhir: number;
    kelas: number;
    ruangan: number;
};

type ScheduleConflict = {
  deskripsi: string;
  jadwal_a: number;
  jadwal_b: number;
};

type PreferenceConflict = {
  deskripsi: string;
  id_dosen: number;
  id_jadwal: number;
  hari: number;
  jam_mulai: number;
};

type ConflictMessage = [ScheduleConflict[], PreferenceConflict[]];
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const Home = () => {

    // const [courseData, setCourseData] = useState("");
	const [preferenceData, setPreferenceData] = useState<PrefData[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [scheduleData, setScheduleData] = useState<ScheduleItem[]>([]);
    const [isFInished, setIsFinished] =useState<boolean>(false)
    const [params, setParams] = useState({
		swarm_size: 30,
		max_iterations: 100,
		cognitive_weight: 2.0,
		social_weight: 2.0,
		inertia_weight: 0.7,
		num_runs: 1,
	});
    const [progress, setProgress] = useState<OptimizationProgress>({
		all_best_fitness: null,
		best_fitness: 0,
		current_run: 1,
		elapsed_time: {
			secs: 0,
			nanos: 0,
		},
		is_finished: false,
		iteration: 0,
		total_runs: null,
	});

    
    const [loading, setLoading] = useState(false);

    const eventSourceRef = useRef<EventSource | null>(null);

    const fetchData = async () => {
        try {
            const [{ data: jadwalData, error: jadwalError }, { data: prefData, error: prefError }] = await Promise.all([
                supabase.from('jadwal').select('id, id_matkul, id_dosen, id_waktu, id_kelas, semester, mata_kuliah:id_matkul(sks, prodi)'),
                supabase.from('prefWaktu').select('*')
            ]);;
            

            if (jadwalError) throw jadwalError;
            if (prefError) throw prefError;
            if (!jadwalData || !prefData) return
    
            const formattedJadwal = jadwalData.map(item => {
                const mataKuliah = Array.isArray(item.mata_kuliah) ? item.mata_kuliah[0] : item.mata_kuliah;

                return {
                    id_jadwal: item.id,
                    id_matkul: item.id_matkul,
                    id_dosen: item.id_dosen,
                    id_waktu: item.id_waktu,
                    id_kelas: item.id_kelas,
                    semester: item.semester,
                    sks: mataKuliah?.sks ?? 0,
                    prodi: mataKuliah?.prodi ?? ''
                };
            });

            setScheduleData(formattedJadwal);
            setPreferenceData(prefData);
        } catch (err) {
            console.error('Gagal mengambil data:', err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const insertConflictList = async (message: ConflictMessage) => {
        const [scheduleConflicts, preferenceConflicts] = message;

        const conflictData = [
            ...scheduleConflicts.map((item) => ({
            deskripsi: item.deskripsi,
            jadwal_a: item.jadwal_a,
            jadwal_b: item.jadwal_b,
            id_dosen: null,
            id_jadwal: null,
            hari: null,
            })),
            ...preferenceConflicts.map((item) => ({
            deskripsi: item.deskripsi,
            jadwal_a: null,
            jadwal_b: null,
            id_dosen: item.id_dosen,
            id_jadwal: item.id_jadwal,
            hari: item.hari,
            })),
        ];

        await supabase
  .from('conflicts')
  .delete()
  .not('id', 'is', null);
        const { data, error } = await supabase.from('conflicts').insert(conflictData);

        if (error) {
            console.error('Gagal insert konflik:', error.message);
        } else {
            console.log('Berhasil insert konflik:', data);
        }
    };

    const updateScheduleData = async (
        optimizedSchedule: OptimizedSchedule[],
        existingSchedule: ScheduleItem[]
        ): Promise<void> => {
        for (const existingItem of existingSchedule) {
            const optimizedItem = optimizedSchedule.find((item) => item.id_jadwal === existingItem.id_jadwal);

            if (optimizedItem) {
                const result = await updateData({
                    table: 'jadwal',
                    payload: {
                        id_hari: optimizedItem.hari,
                        id_ruangan: optimizedItem.ruangan,
                        jam_mulai: optimizedItem.jam_mulai,
                        jam_akhir: optimizedItem.jam_akhir,
                    },
                    filters: [
                    {
                        column: 'id',
                        value: existingItem.id_jadwal,
                    },
                    ],
                });

                if (!result.success) {
                    console.error(`Gagal update jadwal untuk id ${existingItem.id_jadwal}`);
                }
            }
        }

        console.log("Semua data berhasil diperbarui!");
    };

    useEffect(() => {
        let eventSource: EventSource | null = null;
    
        if (loading) {
            eventSource = new EventSource(`${API_URL}/status`, { withCredentials: true });
    
            eventSource.addEventListener('status', (event) => {
                try {
                    const status: OptimizationProgress = JSON.parse(event.data);
                    console.log('SSE Update:', status);
            
                   setProgress(status)

                    if (isFInished) {
                        eventSource?.close();
                        setLoading(false);
                    }
                } catch (error) {
                    console.error("Error parsing SSE message:", error);
                }
            });
    
            eventSource.onerror = (error) => {
                console.error('SSE Error:', error);
                eventSource?.close();
                setLoading(false);
              
            };
        }
    
        return () => {
            eventSource?.close();
        };
    }, [isFInished, loading]);
    

    const handleStop = async () => {
        try {
            const response = await fetch(`${API_URL}/stop`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Gagal menghentikan optimisasi');
            }
    
            console.log('Optimisasi dihentikan');
            setLoading(false);
            setIsFinished(true);
            
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error('Error stopping optimization:', err);
        }
    };
    
    const runOptimization = async () => {
        setLoading(true);
        setIsRunning(true)
        setIsFinished(false)
        setProgress({
            all_best_fitness: null,
            best_fitness: 0,
            current_run: 1,
            elapsed_time: {
                secs: 0,
                nanos: 0,
            },
            is_finished: false,
            iteration: 0,
            total_runs: null,
        })
        // setError(null);
        // setIteration(0);
        // setConflicts(undefined);
        // setShowModal(false);

        eventSourceRef.current = new EventSource(`${API_URL}/status`, { withCredentials: true });
    
        eventSourceRef.current.addEventListener('status', (event) => {
            try {
                const status: OptimizationProgress = JSON.parse(event.data);
                console.log('SSE Update:', status);

                setProgress(status)
        
                if (status.is_finished) {
                    eventSourceRef.current?.close();
                    setLoading(false);
                }
            } catch (error) {
                console.error("Error parsing SSE message:", error);
            }
        });
        
        eventSourceRef.current.onerror = (error) => {
            console.error('SSE Error:', error);
            eventSourceRef.current?.close();
            setLoading(false);
            // setError("Koneksi real-time terputus");
        };
    
        try {
            if (!scheduleData.length) throw new Error('Data jadwal kosong');
    
            const response = await fetch(`${API_URL}/optimize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courses: scheduleData,
                    time_preferences: preferenceData,
                    parameters: {
                        swarm_size: params.swarm_size,
                        max_iterations: params.max_iterations,
                        cognitive_weight: params.cognitive_weight,
                        social_weight: params.social_weight,
                        inertia_weight: params.inertia_weight,
                        num_runs: params.num_runs
                    },
                }),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Terjadi kesalahan');
            }
    
            const result = await response.json();
            console.log(result);
            updateScheduleData(result.schedule, scheduleData)
            insertConflictList(result.message)
            // await updateScheduleData(result.schedule, scheduleData);
            
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error(err);
        } finally {
            setLoading(false);
            setIsFinished(true)
        }
    };

    function getAverage(arr: number[]): number {
		if (arr.length === 0) return 0;

		const sum = arr.reduce((total, num) => total + num, 0);
		return sum / arr.length;
	}

    function formatElapsedTime(time?: ElapsedTime | null): string {
		if (!time) return 'Belum tersedia';

		const totalSeconds = time.secs + time.nanos / 1_000_000_000;
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = (totalSeconds % 60).toFixed(2);

		return `${minutes} menit ${seconds} detik`;
	}

    return (
        <div className="h-screen w-screen flex flex-col bg-white text-black">
		    <div className="h-full flex flex-col gap-5 pt-10 items-center">
			    <h1 className="w-fit text-2xl">OPTIMASI JADWAL KULIAH</h1>
                <div className="relative bg-green-300 w-1/2 rounded-lg px-8 py-10 flex flex-col justify-center items-center gap-5">
                    <div className="absolute top-0 w-full text-center h-7" id="notification-container" />
                    <div className="flex flex-col gap-2 items-center">
                        <p>jumlah percobaan</p>
                        <input className="bg-white outline-none shadow-[0_2px_2px_rgba(0,0,0,0.2)] px-4 py-2 rounded-md" type="number" value={params.num_runs} onChange={(e) => setParams({ ...params, num_runs: +e.target.value})} />
                    </div>
                    <div className="w-full flex pt-8 justify-center">
                        <button className="rounded-md border border-transparent px-4 py-2 text-base font-medium text-black bg-white transition-colors duration-200 shadow hover:border-blue-600 focus:outline-none" onClick={() => setIsOpen(true)}>optimasi</button>
                    </div>
                </div>
            </div>

            {isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-3xl">
                <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
                    <h2 className="text-lg font-semibold mb-4">Parameter</h2>
                    <div className="flex flex-col gap-3">
                        <p>Jumlah Partikel</p>
                        <input className="bg-gray-100 px-4 py-2 rounded-md" type="number" value={params.swarm_size} onChange={(e) => setParams({ ...params, swarm_size: +e.target.value })} />
                        <p>Jumlah Iterasi</p>
                        <input className="bg-gray-100 px-4 py-2 rounded-md" type="number" value={params.max_iterations} onChange={(e) => setParams({ ...params, max_iterations: +e.target.value })} />
                        <p>Inertia Weight</p>
                        <input className="bg-gray-100 px-4 py-2 rounded-md" type="number" value={params.inertia_weight} onChange={(e) => setParams({ ...params, inertia_weight: +e.target.value })} />
                        <p>Cognitive Weight</p>
                        <input className="bg-gray-100 px-4 py-2 rounded-md" type="number" value={params.cognitive_weight} onChange={(e) => setParams({ ...params, cognitive_weight: +e.target.value })} />
                        <p>Social Weight</p>
                        <input className="bg-gray-100 px-4 py-2 rounded-md" type="number" value={params.social_weight} onChange={(e) => setParams({ ...params, social_weight: +e.target.value })} />
                    </div>
                    <div className="flex justify-end">
                        <button className="rounded-md border border-transparent px-4 py-2 text-base font-medium text-black bg-white transition-colors duration-200 shadow hover:border-blue-600 focus:outline-none" onClick={() => {runOptimization(); setIsOpen(false)}}>Run Optimization</button>
                        <button className="rounded-md border border-transparent px-4 py-2 text-base font-medium text-black bg-white transition-colors duration-200 shadow hover:border-blue-600 focus:outline-none" onClick={() => setIsOpen(false)}>Tutup</button>
                    </div>
                </div>
            </div>
            )}

            {isRunning && (
            <div className="fixed inset-0 z-50 w-full flex items-center justify-center bg-white/30 backdrop-blur-3xl">
                <div className="bg-white rounded-xl w-fit shadow-lg min-w-xl max-w-1/2  p-6">
                    <h2 className="text-lg text-center font-semibold mb-4">Proses</h2>
                    <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-[16fr_1fr_4fr] gap-3 w-fit">
                            <div className="flex flex-col items-start">
                                <h3>jumlah partikel</h3>
                                <h3>jumlah iterasi</h3>
                                <h3>inertia weight</h3>
                                <h3>cognitive weight</h3>
                                <h3>social weight</h3>
                            </div>
                            <div className="">
                                <p>:</p>
                                <p>:</p>
                                <p>:</p>
                                <p>:</p>
                                <p>:</p>
                            </div>
                            <div className="">
                                <p>{params.swarm_size}</p>
                                <p>{params.max_iterations}</p>
                                <p>{params.inertia_weight}</p>
                                <p>{params.cognitive_weight}</p>
                                <p>{params.social_weight}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-[8.5fr_1fr_10fr] gap-3 w-fit">
                            <div className="flex flex-col items-start">
                                <h3>iterasi saat ini</h3>
                                <h3>global best fitness</h3>
                                <h3>waktu</h3>
                                <h3>pengujian ke </h3>
                            </div>
                            <div className="">
                                <p>:</p>
                                <p>:</p>
                                <p>:</p>
                                <p>:</p>
                            </div>
                            <div className="flex flex-col items-start">
                                <p>{progress.iteration}</p>
                                <p>{progress.best_fitness}</p>
                                <p className="">{formatElapsedTime(progress.elapsed_time)}</p>
                                <p>{progress.current_run + 1}</p>
                            </div>
                        </div>
                        <div>
                            <h3>Global best fitness pada setiap percobaan</h3>
                            <p>
                                {Array.isArray(progress.all_best_fitness)
                                ? progress.all_best_fitness.join(", ")
                                : progress.all_best_fitness ?? ""}
                            </p>

                            <p>
                                Rata-rata:{" "}
                                {Array.isArray(progress.all_best_fitness)
                                ? getAverage(progress.all_best_fitness).toFixed(2)
                                : "-"}
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-end pt-10">
                        {/* <button onClick={() => onSaveClick(scheduleData)}>simpan</button> */}
                        <button className="rounded-md border border-transparent px-4 py-2 text-base font-medium text-black bg-white transition-colors duration-200 shadow hover:border-blue-600 focus:outline-none" disabled={!isFInished} onClick={() => {setIsOpen(true); setIsRunning(false)}}>mulai lagi</button>
                        <button onClick={() => handleStop()}>Berhenti</button>
                        <button className="rounded-md border border-transparent px-4 py-2 text-base font-medium text-black bg-white transition-colors duration-200 shadow hover:border-blue-600 focus:outline-none" onClick={() => setIsRunning(false)}>kembali</button>
                    </div>
                </div>
            </div>
            )}
        
        </div>
    );
};

export default Home;
