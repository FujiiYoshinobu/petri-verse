export type FoodPreference = 'high' | 'low' | 'toxic';

export interface OrganismTraits {
  speed: number;
  fertility: number;
  resilience: number;
  preferredFood: FoodPreference;
  color: string;
  shape: 'circle' | 'amoeba' | 'spike';
}

export interface Organism {
  id: string;
  generation: number;
  age: number;
  lifespan: number;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  size: number;
  energy: number;
  traits: OrganismTraits;
  status: 'idle' | 'feeding' | 'evading' | 'mutating';
  discoveredAt: number;
}
