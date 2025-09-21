import type { Environment } from '../model/types';

export const createEnvironment = (): Environment => ({
  temperature: 26,
  oxygen: 0.8,
  acidity: 7,
  mutationRate: 0.1
});

export const clampEnvironment = (environment: Environment): Environment => ({
  temperature: Math.min(40, Math.max(5, environment.temperature)),
  oxygen: Math.min(1, Math.max(0, environment.oxygen)),
  acidity: Math.min(14, Math.max(0, environment.acidity)),
  mutationRate: Math.min(0.5, Math.max(0.01, environment.mutationRate)),
  event: environment.event
});
