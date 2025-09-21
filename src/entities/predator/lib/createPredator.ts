import { nanoid } from '../../../shared/lib/nanoid';
import { randomInRange, randomItem } from '../../../shared/lib/random';
import type { Predator } from '../model/types';

export const createPredator = (): Predator => {
  const behavior = randomItem(['agile', 'lurker'] as const);
  const size = randomInRange(40, 65);
  const speed = behavior === 'agile' ? randomInRange(40, 70) : randomInRange(15, 35);
  return {
    id: nanoid(),
    behavior,
    age: 0,
    lifespan: behavior === 'agile' ? randomInRange(30, 60) : randomInRange(90, 140),
    position: { x: randomInRange(80, 520), y: randomInRange(60, 340) },
    velocity: { x: randomInRange(-speed, speed), y: randomInRange(-speed, speed) },
    size,
    spawnTime: Date.now()
  };
};
