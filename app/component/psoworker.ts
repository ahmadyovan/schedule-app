import { PARTICLE_SWARM_OPTIMIZATION, Schedules, Parameter, OptimizedSchedule } from '@/app/component/pso';

self.onmessage = (event: MessageEvent) => {
    const { schedules, parameter }: { schedules: Schedules[], parameter: Parameter } = event.data;

    try {
        const result = PARTICLE_SWARM_OPTIMIZATION(schedules, parameter, {
            sendProgress: (data: any) => {
                self.postMessage({ type: 'progress', data });
            }
        });

        self.postMessage({ type: 'result', data: { message: 'Optimization complete', schedule: result } });
    } catch (error) {
        self.postMessage({ type: 'error', data: { message: 'Optimization failed', error: error } });
    }
};