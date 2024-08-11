    interface AdaptivePSOParams {
        W: number;
        C1: number;
        C2: number;
        VMAX: number;
        WMin: number;
        WMax: number;
        MaxIter: number;
    }


    interface ScheduleInfo {
        ID: number;
        StartTime: string;
        EndTime: string;
        SKS: number;
        Dosen: number;
        Prodi: number;
    }

    interface ScheduleContext {
        Schedules: Schedules[];
        DayPreferences: string[];
        TimePreferences: string[];
    }

    interface Particle {
        Position: [number, number][];
        Velocity: [number, number][];
        PBest: [number, number][];
        Fitness: number;
    }

    interface PSEOMetrics {
        iteration: number;
        particleIndex?: number;
        totalParticles?: number;
        numiteration: number;
        bestFitness: number;
        elapsedTime: number;
    }

    export interface Schedules {
        schedule_jadwal_id: number;
        schedule_prodi: number;
        schedule_semester: number;
        schedule_sks: number;
        schedule_dosen_num: number;
        schedule_hari: string;
        schedule_waktu: string;
        schedule_class: string;
    }

    export interface Parameter {
        num_iteration: number;
        num_particle: number;
        W: number;
        c1: number;
        c2: number;
    }

    export interface OptimizedSchedule {
        Schedule_Jadwal_id: number;
        Schedule_Prodi: number;
        Schedule_Semester: number;
        Schedule_Sks: number;
        Schedule_Dosen_num: number;
        Schedule_Hari: string;
        Schedule_Waktu: string;
    }

    interface InitializeCallbacks {
        sendProgress: (data: { stage: string }) => void;
    }

    // inisialisasi partikel
    function initializeParticles(
        numParticles: number,
        schedules: Schedules[],
        params: AdaptivePSOParams,
        callbacks: { sendProgress: (data: any) => void }): Particle[] {
        
        const ctx = NewScheduleContext(schedules);
        // console.log("num partikel", numParticles);
        
        const particles: Particle[] = new Array(numParticles);

        // console.log("array kosong",particles);
        
        for (let i = 0; i < particles.length; i++) {
            particles[i] = {
                Position: new Array(schedules.length),
                Velocity: new Array(schedules.length),
                PBest: new Array(schedules.length),
                Fitness: 0,
            };

            for (let j = 0; j < schedules.length; j++) {
                particles[i].Position[j] = [
                    Math.floor(Math.random() * 5) + 1,
                    Math.floor(Math.random() * 12) + 1,
                ];

                particles[i].Velocity[j] = [
                    Math.random() * 2 * params.VMAX - params.VMAX,
                    Math.random() * 2 * params.VMAX - params.VMAX,
                ];
            }

            particles[i].PBest = [...particles[i].Position];
            particles[i].Fitness = evaluateFitness(particles[i].Position, ctx);
            // console.log(i);
            
            // console.log("partikel best", particles[i].PBest);
            
            callbacks.sendProgress({
                type: 'stage',
                value: `inisialisasi partikel ke ${i + 1}`
            });
            // Kirim kemajuan setelah inisialisasi setiap partikel
        
        }
        // console.log(particles);
        
        return particles;
    }

    function updateParticleAdaptive(p: Particle, gBest: [number, number][], params: AdaptivePSOParams, iter: number): void {
        const w = params.WMax - ((params.WMax - params.WMin) * iter) / params.MaxIter;

        for (let i = 0; i < p.Position.length; i++) {
            for (let j = 0; j < 2; j++) {
                const r1 = Math.random();
                const r2 = Math.random();
                let newVelocity = w * p.Velocity[i][j] + params.C1 * r1 * (p.PBest[i][j] - p.Position[i][j]) + params.C2 * r2 * (gBest[i][j] - p.Position[i][j]);
                newVelocity = Math.max(-params.VMAX, Math.min(params.VMAX, newVelocity));

                let newPos = Math.round(p.Position[i][j] + newVelocity);

                if (j === 0) {
                    newPos = Math.max(1, Math.min(5, newPos));
                } else if (j === 1) {
                    newPos = Math.max(1, Math.min(12, newPos));
                }

                p.Position[i][j] = newPos;
                p.Velocity[i][j] = newVelocity;
            }
        }
    }

    function evaluateFitness(position: [number, number][], ctx: ScheduleContext): number {
        let fitness = 0;

        // Create data structures for schedule evaluation
        const dosenSchedules: { [key: number]: { [key: number]: ScheduleInfo[] } } = {};
        const groups: { [key: number]: { [key: number]: { [key: number]: { [key: number]: { [key: string]: ScheduleInfo[] } } } } } = {};

        // Build schedule structures
        position.forEach((pos, i) => buildScheduleStructures(i, pos, ctx, dosenSchedules, groups));

        // 1. Check Time Preferences 
        const [timePenalty] = checkTimePreference(position, ctx);
        fitness += timePenalty;

        // // 2. Check Total SKS
        // const [sksPenalty,] = checkTotalSKS(groups);
        // fitness += sksPenalty;

        // // // 3. Check Time Overlaps
        // const [overlapPenalty] = checkTimeOverlap(groups);
        // fitness += overlapPenalty;

        // // 4. Check Day Preferences 
        // const [dayPenalty] = checkDayPreference(position, ctx);
        // fitness += dayPenalty;

        // // // 5. Check Dosen Conflicts
        // const [dosenPenalty] = checkDosenConflicts(dosenSchedules);
        // fitness += dosenPenalty;
        
        return -fitness * 100;
    }

    export function PARTICLE_SWARM_OPTIMIZATION(
        schedules: Schedules[],
        para: Parameter,
        callbacks: { sendProgress: (data: any) => void } ): OptimizedSchedule[] {
            
        const params: AdaptivePSOParams = {
            W: para.W,
            C1: para.c1,
            C2: para.c2,
            VMAX: 2.0,
            WMin: 0.4,
            WMax: 0.9,
            MaxIter: para.num_iteration,
        };

        const ctx = NewScheduleContext(schedules);

        // Pass the callbacks to the initialization function
        const particles = initializeParticles(para.num_particle, schedules, params, {
            sendProgress: (data) => {
                callbacks.sendProgress(data);
            }
        });

        let gBest: [number, number][] = new Array(schedules.length);
        let gBestFitness = -Infinity;

        for (let iteration = 0; iteration < para.num_iteration; iteration++) {
            callbacks.sendProgress({
                type: 'iteration',
                value: `Iterasi ke ${iteration + 1}/${para.num_iteration}`
            });
            for (let i = 0; i < particles.length; i++) {
                callbacks.sendProgress({
                    type: 'stage',
                    value: `Mengevaluasi dan memperbarui partikel ke ${i + 1}`
                });
                
                const fitness = evaluateFitness(particles[i].Position, ctx);

                if (fitness > particles[i].Fitness) {
                    particles[i].Fitness = fitness;
                    particles[i].PBest = [...particles[i].Position];
                }

                if (fitness > gBestFitness) {
                    gBestFitness = fitness;
                    gBest = [...particles[i].Position];
                    
                    // console.log("gbest", gBestFitness);
                    
                }

                updateParticleAdaptive(particles[i], gBest, params, iteration);
                callbacks.sendProgress({
                    type: 'bestFitness',
                    value: gBestFitness
                });
                
                
                

            }
        }

        const [conflicts1, conflicts2, conflicts3, conflicts4, conflicts5] = getConflict(gBest, ctx);
        
        return gBestToSchedule(gBest, schedules);
    }

    interface ScheduleContext {
        Schedules: Schedules[];
        DayPreferences: string[];
        TimePreferences: string[];
    }

    function NewScheduleContext(schedules: Schedules[]): ScheduleContext {
        return {
            Schedules: schedules,
            DayPreferences: schedules.map(schedule => schedule.schedule_hari),
            TimePreferences: schedules.map(schedule => schedule.schedule_waktu),
        };
    }

    function gBestToSchedule(gBest: [number, number][], originalSchedules: Schedules[]): OptimizedSchedule[] {  
        return gBest.map((pos, i) => ({
            Schedule_Jadwal_id: originalSchedules[i].schedule_jadwal_id,
            Schedule_Prodi: originalSchedules[i].schedule_prodi,
            Schedule_Semester: originalSchedules[i].schedule_semester,
            Schedule_Sks: originalSchedules[i].schedule_sks,
            Schedule_Dosen_num: originalSchedules[i].schedule_dosen_num,
            Schedule_Hari: getDay(pos[0]),
            Schedule_Waktu: timeToSchedule(pos[1], originalSchedules[i].schedule_sks),
        }));
    }

    function calculateEndTime(startTime: string, sks: number): string {
        const start = new Date(`1970-01-01T${startTime}:00`);
        const end = new Date(start.getTime() + sks * 40 * 60000);
        return end.toTimeString().slice(0, 5);
    }

    interface ScheduleInfo {
        ID: number;
        StartTime: string;
        EndTime: string;
        SKS: number;
        Dosen: number;
        Prodi: number;
    }

    interface GroupScheduleInfo {
        TotalSKS: number;
    }

    function timeToSchedule(time: number, sks: number): string {
        const startTime = time <= 6 ? morningStartTimes[time] : eveningStartTimes[time];
        if (!startTime) return "Unknown";

        const startTimeInt = parseInt(startTime.replace(':', ''));
        const durationMinutes = sks * 40;
        let endTimeInt = startTimeInt + Math.floor(durationMinutes / 60) * 100 + (durationMinutes % 60);

        let endHour = Math.floor(endTimeInt / 100);
        let endMinute = endTimeInt % 100;
        if (endMinute >= 60) {
            endHour++;
            endMinute -= 60;
        }

        const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
        return `${startTime} - ${endTime}`;
    }

    const morningStartTimes: { [key: number]: string } = {
        1: "08:00", 2: "08:40", 3: "09:20", 4: "10:00", 5: "10:40", 6: "11:20",
    };

    const eveningStartTimes: { [key: number]: string } = {
        7: "18:00", 8: "18:40", 9: "19:20", 10: "20:00", 11: "20:40", 12: "21:20",
    };

    function getDay(encoded: number): string {
        const days: { [key: number]: string } = {
            1: "Senin", 2: "Selasa", 3: "Rabu", 4: "Kamis", 5: "Jumat",
        };
        return days[encoded] || "Unknown";
    }

    function getDayIndex(day: string): number {
        const days: { [key: string]: number } = {
            "Senin": 1, "Selasa": 2, "Rabu": 3, "Kamis": 4, "Jumat": 5,
        };
        return days[day] || -1;
    }

    function buildScheduleStructures(
        i: number,
        pos: [number, number],
        ctx: ScheduleContext,
        dosenSchedules: { [key: number]: { [key: number]: ScheduleInfo[] } },
        groups: { [key: number]: { [key: number]: { [key: number]: { [key: number]: { [key: string]: ScheduleInfo[] } } } } } ): void {

        const schedule = ctx.Schedules[i];
        const [day, timeIndex] = pos;
        const { schedule_prodi: prodi, schedule_semester: semester, schedule_dosen_num: dosen, schedule_class: scheduleClass } = schedule;
        const timeGroup = timeIndex > 6 ? 1 : 0;

        if (!dosenSchedules[day]) dosenSchedules[day] = {};
        if (!dosenSchedules[day][dosen]) dosenSchedules[day][dosen] = [];

        if (!groups[prodi]) groups[prodi] = {};
        if (!groups[prodi][semester]) groups[prodi][semester] = {};
        if (!groups[prodi][semester][day]) groups[prodi][semester][day] = {};
        if (!groups[prodi][semester][day][timeGroup]) groups[prodi][semester][day][timeGroup] = {};
        if (!groups[prodi][semester][day][timeGroup][scheduleClass]) groups[prodi][semester][day][timeGroup][scheduleClass] = [];

        const startTime = getStartTime(timeGroup, timeIndex);
        const endTime = calculateEndTime(startTime, schedule.schedule_sks);

        const scheduleInfo: ScheduleInfo = {
            ID: schedule.schedule_jadwal_id,
            StartTime: startTime,
            EndTime: endTime,
            SKS: schedule.schedule_sks,
            Dosen: dosen,
            Prodi: prodi,
        };

        groups[prodi][semester][day][timeGroup][scheduleClass].push(scheduleInfo);
        dosenSchedules[day][dosen].push(scheduleInfo);

        // console.log('.............................');
        // printGroupSchedules(groups);
        
    }

    function checkTimePreference(position: [number, number][], ctx: ScheduleContext): [number, number] {

        let penalty = 0;
        let conflicts = 0;
        position.forEach((pos, i) => {
            
            
            const timeGroup = pos[1] > 6 ? 1 : 0;
            if (ctx.TimePreferences[i] === "Pagi" && timeGroup !== 0) {
                penalty += 5000;
                console.log(penalty);
                conflicts++;
            }

            if ((ctx.TimePreferences[i] === "Malam" && timeGroup !== 1)) {
                penalty += 5000;
                console.log(penalty);
                conflicts++;
            }

            // console.log(pos, " ", ctx.TimePreferences[i]);
            // console.log("penalti ", penalty);
      
            
        });
        return [penalty, conflicts];
    }

    function checkTotalSKS(groups: { [key: number]: { [key: number]: { [key: number]: { [key: number]: { [key: string]: ScheduleInfo[] } } } } }): [number, number] {
        let penalty = 0;
        let conflicts = 0;
        Object.values(groups).forEach(semesters => {
            Object.values(semesters).forEach(days => {
                Object.values(days).forEach(timeGroups => {
                    Object.values(timeGroups).forEach(classes => {
                        Object.values(classes).forEach(schedules => {
                            const totalSKS = schedules.reduce((sum, schedule) => sum + schedule.SKS, 0);
                            // console.log(totalSKS);
                            
                            if (totalSKS > 6) {
                                // console.log(totalSKS);
                                penalty += 5000;
                                conflicts++;
                            }
                            
                        });
                    });
                });
            });
        });
        return [penalty, conflicts];
    }

    function printGroupSchedules(groups: { [key: number]: { [key: number]: { [key: number]: { [key: number]: { [key: string]: ScheduleInfo[] } } } } }) {
        Object.entries(groups).forEach(([prodiId, semesters]) => {
            console.log(`Prodi ID: ${prodiId}`);
            Object.entries(semesters).forEach(([semester, days]) => {
                console.log(`  Semester: ${semester}`);
                Object.entries(days).forEach(([day, timeGroups]) => {
                    console.log(`    Day: ${getDay(parseInt(day))}`);
                    Object.entries(timeGroups).forEach(([timeGroup, classes]) => {
                        console.log(`      Time Group: ${timeGroup === '0' ? 'Morning' : 'Evening'}`);
                        Object.entries(classes).forEach(([className, schedules]) => {
                            console.log(`        Class: ${className}`);
                            schedules.forEach(schedule => {
                                console.log(`          - ID: ${schedule.ID}, Course: ${schedule.ID}, Time: ${schedule.StartTime}-${schedule.EndTime}, SKS: ${schedule.SKS}, Dosen: ${schedule.Dosen}`);
                            });
                        });
                    });
                });
            });
        });
    }

    function checkTimeOverlap(groups: { [key: number]: { [key: number]: { [key: number]: { [key: number]: { [key: string]: ScheduleInfo[] } } } } }): [number, number] {
        let penalty = 0;
        let conflicts = 0;
        Object.values(groups).forEach(semesters => {
            Object.values(semesters).forEach(days => {
                Object.values(days).forEach(timeGroups => {
                    Object.entries(timeGroups).forEach(([timeGroup, classes]) => {
                        Object.values(classes).forEach(schedules => {
                            schedules.sort((a, b) => a.StartTime.localeCompare(b.StartTime));

                            const [groupStartLimit, groupEndLimit] = timeGroup === '0' ? ['08:00', '12:00'] : ['18:00', '22:00'];

                            schedules.forEach((schedule, i) => {
                                const startTime = new Date(`1970-01-01T${schedule.StartTime}`);
                                const endTime = new Date(`1970-01-01T${schedule.EndTime}`);
                                const groupStart = new Date(`1970-01-01T${groupStartLimit}`);
                                const groupEnd = new Date(`1970-01-01T${groupEndLimit}`);

                                if (startTime < groupStart || endTime > groupEnd) {
                                    penalty += 5000;
                                    conflicts++;
                                }

                                if (i > 0) {
                                    const prevEndTime = new Date(`1970-01-01T${schedules[i-1].EndTime}`);
                                    if (startTime < prevEndTime) {
                                        penalty += 5000;
                                        conflicts++;
                                    }
                                }
                            });
                        });
                    });
                });
            });
        });
        return [penalty, conflicts];
    }

    function parseDayPreferences(preferencesStr: string): string[] {
        return JSON.parse(`[${preferencesStr}]`);
    }

    function isDayInPreferences(day: string, preferences: string[]): boolean {
        return preferences.includes(day);
    }

    function checkDayPreference(position: [number, number][], ctx: ScheduleContext): [number, number] {
        let penalty = 0;
        let conflicts = 0;

        position.forEach((pos, i) => {
            const day = getDay(pos[0]);
            const dayPreferences = parseDayPreferences(ctx.DayPreferences[i]);

            if (!isDayInPreferences(day, dayPreferences)) {
                penalty += 5000;
                conflicts++;
            }
        });

        return [penalty, conflicts];
    }

    function checkDosenConflicts(dosenSchedules: { [key: number]: { [key: number]: ScheduleInfo[] } }): [number, number] {
        let penalty = 0;
        let conflicts = 0;

        Object.values(dosenSchedules).forEach(dosenMap => {
            Object.values(dosenMap).forEach(schedules => {
                schedules.sort((a, b) => a.StartTime.localeCompare(b.StartTime));

                for (let i = 0; i < schedules.length - 1; i++) {
                    const currentEndTime = new Date(`1970-01-01T${schedules[i].EndTime}`);
                    const nextStartTime = new Date(`1970-01-01T${schedules[i+1].StartTime}`);

                    if (nextStartTime <= currentEndTime) {
                        penalty += 5000;
                        conflicts++;
                    }
                }
            });
        });

        return [penalty, conflicts];
    }

    function getStartTime(timeGroup: number, timeIndex: number): string {
        return timeGroup === 0 ? morningStartTimes[timeIndex] : eveningStartTimes[timeIndex];
    }

    function getConflict(position: [number, number][], ctx: ScheduleContext): [number, number, number, number, number] {
        const dosenSchedules: { [key: number]: { [key: number]: ScheduleInfo[] } } = {};
        const groups: { [key: number]: { [key: number]: { [key: number]: { [key: number]: { [key: string]: ScheduleInfo[] } } } } } = {};

        position.forEach((pos, i) => buildScheduleStructures(i, pos, ctx, dosenSchedules, groups));

        const [, conflicts1] = checkTimePreference(position, ctx);
        const [, conflicts2] = checkTotalSKS(groups);
        const [, conflicts3] = checkTimeOverlap(groups);
        const [, conflicts4] = checkDayPreference(position, ctx);
        const [, conflicts5] = checkDosenConflicts(dosenSchedules);

        return [conflicts1, conflicts2, conflicts3, conflicts4, conflicts5];
    }