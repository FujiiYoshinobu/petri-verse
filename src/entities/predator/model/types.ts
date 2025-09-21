export type PredatorBehavior = 'agile' | 'lurker';

export interface Predator {
  id: string;
  behavior: PredatorBehavior;
  age: number;
  lifespan: number;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  size: number;
  spawnTime: number;
}
