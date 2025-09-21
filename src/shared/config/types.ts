import type { Organism } from '../../entities/organism/model/types';
import type { Predator } from '../../entities/predator/model/types';
import type { Environment } from '../../entities/environment/model/types';
import type { FoodEvent } from '../../entities/food/model/types';
import type { EncyclopediaEntry } from '../../entities/encyclopediaEntry/model/types';
import type { EvolutionEvent } from '../../widgets/evolutionHistory/model/types';

export interface SimulationState {
  tick: number;
  organisms: Organism[];
  predators: Predator[];
  foods: FoodEvent[];
  environment: Environment;
  encyclopedia: EncyclopediaEntry[];
  evolutionLog: EvolutionEvent[];
}

export interface SimulationActions {
  advance: (delta: number) => void;
  feed: (food: FoodEvent) => void;
  adjustEnvironment: (environment: Partial<Environment>) => void;
  registerDiscovery: (entry: EncyclopediaEntry) => void;
  toggleFavorite: (id: string) => void;
  reset: () => void;
}

export type SimulationStore = SimulationState & SimulationActions;
