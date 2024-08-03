import { PARTICLE_SWARM_OPTIMIZATION, Schedules, Parameter, OptimizedSchedule } from '@/app/component/pso';

self.onmessage = (event) => {
    const { schedules, parameter } = event.data;

    const result = PARTICLE_SWARM_OPTIMIZATION(schedules, parameter, {
        sendProgress: (data: any) => {
            self.postMessage({ type: 'progress', data });
        }
    });

    self.postMessage({ type: 'result', data: result });
};