'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
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
    id: number;
    id_dosen: number;
    senin_pagi: boolean;
    senin_malam: boolean;
    selasa_pagi: boolean;
    selasa_malam: boolean;
    rabu_pagi: boolean;
    rabu_malam: boolean;
    kamis_pagi: boolean;
    kamis_malam: boolean;
    jumat_pagi: boolean;
    jumat_malam: boolean;
};

type ElapsedTime = {
    secs: number;
    nanos: number;
};

type OptimizationProgress = {
    iteration: number;
    elapsed_time: {
        secs: number;
        nanos: number;
    };
    best_fitness: number;
    all_best_fitness: number[] | null;
    current_run: number;
    total_runs: number | null;
    is_finished: boolean;
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
// const API_WS_URL = process.env.NEXT_PUBLIC_API_WS_URL;
// const API_URL = 'http://localhost:8000';

const Home = () => {
    const [preferenceData, setPreferenceData] = useState<PrefData[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [scheduleData, setScheduleData] = useState<ScheduleItem[]>([]);
    const [isFinished, setIsFinished] = useState<boolean>(false);
    const [statusModal, setStatusModal] = useState<boolean>();
    const [error, setError] = useState<string | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<string>('disconnected');
    const eventSourceRef = useRef<EventSource | null>(null);
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
        elapsed_time: { secs: 0, nanos: 0 },
        is_finished: false,
        iteration: 0,
        total_runs: null,
    });

    // Refs untuk optimization session
    const optimizationSocketRef = useRef<WebSocket | null>(null);
    const isOptimizingRef = useRef(false);
    const shouldStopRef = useRef(false);

    const fetchData = async () => {
        try {
            setError(null);
            const [{ data: jadwalData, error: jadwalError }, { data: prefData, error: prefError }] = await Promise.all([
                supabase.from('jadwal').select('id, id_matkul, id_dosen, id_waktu, id_kelas, semester, mata_kuliah:id_matkul(sks, prodi)'),
                supabase.from('prefWaktu').select('*')
            ]);

            if (jadwalError) throw jadwalError;
            if (prefError) throw prefError;
            if (!jadwalData || !prefData) throw new Error('No data received');

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
                    prodi: mataKuliah?.prodi ?? 0, // pakai 0 sebagai default prodi
                };
            });

            const cleanedPrefData: PrefData[] = prefData.map((item) => ({
                id: item.id,
                id_dosen: item.id_dosen ?? 0,
                senin_pagi: item.senin_pagi ?? false,
                senin_malam: item.senin_malam ?? false,
                selasa_pagi: item.selasa_pagi ?? false,
                selasa_malam: item.selasa_malam ?? false,
                rabu_pagi: item.rabu_pagi ?? false,
                rabu_malam: item.rabu_malam ?? false,
                kamis_pagi: item.kamis_pagi ?? false,
                kamis_malam: item.kamis_malam ?? false,
                jumat_pagi: item.jumat_pagi ?? false,
                jumat_malam: item.jumat_malam ?? false,
            }));
            

            setScheduleData(formattedJadwal);
            setPreferenceData(cleanedPrefData);
        } catch (err) {
            console.error('Gagal mengambil data:', err);
            setError('Gagal mengambil data dari database');
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
        ): Promise<void> => {
        for (const existingItem of scheduleData) {
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

    // Cleanup saat component unmount
    useEffect(() => {
        return () => {
            console.log('🧹 Component cleanup');
            shouldStopRef.current = true;
            isOptimizingRef.current = false;
            
            if (optimizationSocketRef.current) {
                optimizationSocketRef.current.close(1000, 'Component unmounting');
                optimizationSocketRef.current = null;
            }
        };
    }, []);

    const handleStop = useCallback(async () => {
        console.log('🛑 Stopping optimization...');
        shouldStopRef.current = true;
        isOptimizingRef.current = false;
        setIsRunning(false);

        // Stop via REST API
        try {
            const response = await fetch(`${API_URL}/stop`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (response.ok) {
                console.log('✅ Stop signal sent via REST API');
            }
        } catch (err) {
            console.error('❌ Failed to send stop via REST API:', err);
        }

        // Close SSE connection
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }

        setIsFinished(true);
        setConnectionStatus('disconnected');
    }, []);

    const runOptimization = useCallback(async () => {
        console.log('🚀 Starting optimization with SSE...');

        if (!scheduleData.length) {
            setError('Data jadwal kosong');
            return;
        }

        // Reset flags
        shouldStopRef.current = false;
        isOptimizingRef.current = true;
        setError(null);
        setIsRunning(true);
        setIsFinished(false);
        setConnectionStatus('connecting');

        setProgress({
            all_best_fitness: null,
            best_fitness: 0,
            current_run: 1,
            elapsed_time: { secs: 0, nanos: 0 },
            is_finished: false,
            iteration: 0,
            total_runs: params.num_runs || 1,
        });

        // Setup SSE
        console.log(`🌐 Connecting to SSE at ${API_URL}/status`);
        const es = new EventSource(`${API_URL}/status`);
        eventSourceRef.current = es;

        es.onopen = () => {
            console.log('✅ SSE connection established');
            setConnectionStatus('connected');
        };

        es.onerror = (err) => {
            console.error('❌ SSE connection error:', err);
            setError('Koneksi SSE gagal');
            es.close();
            setConnectionStatus('error');
            setIsRunning(false);
            isOptimizingRef.current = false;
        };

        es.addEventListener('status', (event) => {
            if (shouldStopRef.current) {
                console.log('🛑 Ignoring incoming SSE message (optimization stopped)');
                return;
            }

            console.log('📨 Received SSE message:', event.data);

            try {
                const data = JSON.parse(event.data);
                console.log('📊 Parsed SSE data:', data);

                setProgress((prev) => {
                    const updated = { ...prev, ...data };
                    return updated;
                });

                if (data.is_finished) {
                    console.log('🏁 Optimization reported as finished via SSE');
                    setIsRunning(false);
                    setIsFinished(true);
                    isOptimizingRef.current = false;

                    es.close();
                    setConnectionStatus('disconnected');
                }
            } catch (err) {
                console.error('❌ JSON.parse error on SSE data:', err, '\nRaw data:', event.data);
            }
        });

        // Start optimization via REST

        const startOptimizationRequest = async () => {
            const requestBody = {
                courses: scheduleData,
                time_preferences: preferenceData,
                parameters: {
                    swarm_size: params.swarm_size,
                    max_iterations: params.max_iterations,
                    cognitive_weight: params.cognitive_weight,
                    social_weight: params.social_weight,
                    inertia_weight: params.inertia_weight,
                    num_runs: params.num_runs,
                },
            };
            console.log('📤 Sending optimization request to REST API');
            setStatusModal(true);
            const response = await fetch(`${API_URL}/optimize`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            const result = await response.json();
            console.log('✅ Optimization started, waiting for updates...');
            updateScheduleData(result.schedule)
            insertConflictList(result.message)
            console.log('hasil optimasi', result);
            
            return result;
        };

        

        try {
            await startOptimizationRequest();
        } catch (err) {
            console.error('❌ Failed to start optimization:', err);
            setError('Gagal memulai optimasi');
            setIsRunning(false);
            es.close();
            setConnectionStatus('disconnected');
        }
    }, [scheduleData, preferenceData, params]);

    const getAverage = (arr: number[]): number => {
        if (arr.length === 0) return 0;
        const sum = arr.reduce((total, num) => total + num, 0);
        return sum / arr.length;
    };

    const formatElapsedTime = (time?: ElapsedTime | null): string => {
        if (!time) return 'Belum tersedia';
        const totalSeconds = time.secs + time.nanos / 1_000_000_000;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = (totalSeconds % 60).toFixed(2);
        return `${minutes} menit ${seconds} detik`;
    };

    const getConnectionStatusColor = () => {
        switch (connectionStatus) {
            case 'connected': return 'bg-green-500';
            case 'connecting': return 'bg-yellow-500';
            case 'error': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="h-screen w-screen flex flex-col bg-white text-black">
		    <div className="h-full flex flex-col gap-5 pt-10 items-center">
			    <h1 className="w-fit text-2xl">OPTIMASI JADWAL KULIAH</h1>
                
                {/* Connection Status Indicator */}
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getConnectionStatusColor()}`} />
                    <span className="text-sm">WebSocket: {connectionStatus}</span>
                </div>

                <div className="relative bg-green-300 w-1/2 rounded-lg px-8 py-10 flex flex-col justify-center items-center gap-5">
                    <div className="absolute top-0 w-full text-center h-7" id="notification-container" />
                    <div className="flex flex-col gap-2 items-center">
                        <p>jumlah percobaan</p>
                        <input 
                            className="bg-white outline-none shadow-[0_2px_2px_rgba(0,0,0,0.2)] px-4 py-2 rounded-md" 
                            type="number" 
                            value={params.num_runs} 
                            onChange={(e) => setParams({ ...params, num_runs: +e.target.value})} 
                            disabled={isRunning}
                        />
                    </div>
                    <div className="w-full flex pt-8 justify-center">
                        <button 
                            className="rounded-md border border-transparent px-4 py-2 text-base font-medium text-black bg-white transition-colors duration-200 shadow hover:border-blue-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed" 
                            onClick={() => setIsOpen(true)}
                            disabled={isRunning}
                        >
                            optimasi
                        </button>
                    </div>
                </div>
            </div>

            {isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-3xl">
                <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
                    <h2 className="text-lg font-semibold mb-4">Parameter</h2>
                    <div className="flex flex-col gap-3">
                        <p>Jumlah Partikel</p>
                        <input className="bg-gray-100 px-4 py-2 rounded-md" type="number" value={params.swarm_size} onChange={(e) => setParams({ ...params, swarm_size: +e.target.value })} disabled={isRunning} />
                        <p>Jumlah Iterasi</p>
                        <input className="bg-gray-100 px-4 py-2 rounded-md" type="number" value={params.max_iterations} onChange={(e) => setParams({ ...params, max_iterations: +e.target.value })} disabled={isRunning} />
                        <p>Inertia Weight</p>
                        <input className="bg-gray-100 px-4 py-2 rounded-md" type="number" step="0.1" value={params.inertia_weight} onChange={(e) => setParams({ ...params, inertia_weight: +e.target.value })} disabled={isRunning} />
                        <p>Cognitive Weight</p>
                        <input className="bg-gray-100 px-4 py-2 rounded-md" type="number" step="0.1" value={params.cognitive_weight} onChange={(e) => setParams({ ...params, cognitive_weight: +e.target.value })} disabled={isRunning} />
                        <p>Social Weight</p>
                        <input className="bg-gray-100 px-4 py-2 rounded-md" type="number" step="0.1" value={params.social_weight} onChange={(e) => setParams({ ...params, social_weight: +e.target.value })} disabled={isRunning} />
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <button 
                            className="rounded-md border border-transparent px-4 py-2 text-base font-medium text-black bg-green-200 transition-colors duration-200 shadow hover:border-blue-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed" 
                            onClick={() => {runOptimization(); setIsOpen(false)}}
                        >
                            Run Optimization
                        </button>
                        <button 
                            className="rounded-md border border-transparent px-4 py-2 text-base font-medium text-black bg-gray-200 transition-colors duration-200 shadow hover:border-blue-600 focus:outline-none" 
                            onClick={() => setIsOpen(false)}
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            </div>
            )}

            {statusModal && (
            <div className="fixed inset-0 z-50 w-full flex items-center justify-center bg-white/30 backdrop-blur-3xl">
                <div className="bg-white rounded-xl w-fit shadow-lg min-w-xl max-w-1/2 p-6">
                    <h2 className="text-lg text-center font-semibold mb-4">Proses Optimasi</h2>
                    
                    {/* Connection Status */}
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className={`w-3 h-3 rounded-full ${getConnectionStatusColor()}`} />
                        <span className="text-sm">WebSocket: {connectionStatus}</span>
                    </div>
                    
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}
                    
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
                                <p>{progress.current_run}</p>
                            </div>
                        </div>
                        <div>
                            <h3>Global best fitness pada setiap percobaan</h3>
                            <p>
                                {Array.isArray(progress.all_best_fitness)
                                ? progress.all_best_fitness.join(", ")
                                : progress.all_best_fitness ?? "Menunggu data..."}
                            </p>

                            <p>
                                Rata-rata:{" "}
                                {Array.isArray(progress.all_best_fitness)
                                ? getAverage(progress.all_best_fitness).toFixed(2)
                                : "-"}
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-10">
                        <button 
                            className="rounded-md border border-transparent px-4 py-2 text-base font-medium text-black bg-blue-200 transition-colors duration-200 shadow hover:border-blue-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed" 
                            disabled={!isFinished} 
                            onClick={() => {setIsOpen(true); setStatusModal(false)}}
                        >
                            mulai lagi
                        </button>
                        <button 
                            className="rounded-md border border-transparent px-4 py-2 text-base font-medium text-white bg-red-500 transition-colors duration-200 shadow hover:bg-red-600 focus:outline-none"
                            onClick={handleStop}
                        >
                            Berhenti
                        </button>
                        <button 
                            className="rounded-md border border-transparent px-4 py-2 text-base font-medium text-black bg-gray-200 transition-colors duration-200 shadow hover:border-blue-600 focus:outline-none" 
                            onClick={() => setStatusModal(false)}
                        >
                            kembali
                        </button>
                    </div>
                </div>
            </div>
            )}
        
        </div>
    );
};

export default Home;