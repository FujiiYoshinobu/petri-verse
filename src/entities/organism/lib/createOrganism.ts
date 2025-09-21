import { nanoid } from '../../../shared/lib/nanoid';
import { randomInRange, randomItem } from '../../../shared/lib/random';
import type { Organism, OrganismTraits } from '../model/types';

const shapes: OrganismTraits['shape'][] = ['circle', 'amoeba', 'spike'];
const colors = ['#7ef9c8', '#81d4fa', '#ff80ab', '#fff176', '#ce93d8'];
const foods: OrganismTraits['preferredFood'][] = ['high', 'low', 'toxic'];

export interface CreateOrganismParams {
  position?: { x: number; y: number };
  generation?: number;
  parentTraits?: OrganismTraits;
}

export const createOrganism = ({
  position,
  generation = 1,
  parentTraits
}: CreateOrganismParams = {}): Organism => {
  const traits: OrganismTraits = parentTraits
    ? mutateTraits(parentTraits)
    : {
        speed: randomInRange(10, 30),
        fertility: randomInRange(0.2, 0.6),
        resilience: randomInRange(0.2, 1),
        preferredFood: randomItem(foods),
        color: randomItem(colors),
        shape: randomItem(shapes)
      };

  return {
    id: nanoid(),
    generation,
    age: 0,
    lifespan: randomInRange(60, 200),
    position: position ?? { x: randomInRange(50, 550), y: randomInRange(50, 350) },
    velocity: { x: randomInRange(-traits.speed, traits.speed), y: randomInRange(-traits.speed, traits.speed) },
    size: randomInRange(8, 18),
    energy: randomInRange(50, 100),
    traits,
    status: 'idle',
    discoveredAt: Date.now()
  };
};

export const mutateTraits = (traits: OrganismTraits): OrganismTraits => {
  const mutationRate = 0.15;
  const mutateValue = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value + randomInRange(-mutationRate, mutationRate) * value));

  const maybeChangeFood = Math.random() < 0.25 ? randomItem(foods) : traits.preferredFood;
  const maybeChangeShape = Math.random() < 0.2 ? randomItem(shapes) : traits.shape;
  const maybeChangeColor = Math.random() < 0.2 ? randomItem(colors) : traits.color;

  return {
    speed: mutateValue(traits.speed, 5, 40),
    fertility: mutateValue(traits.fertility, 0.1, 0.9),
    resilience: mutateValue(traits.resilience, 0.1, 1.5),
    preferredFood: maybeChangeFood,
    shape: maybeChangeShape,
    color: maybeChangeColor
  };
};
