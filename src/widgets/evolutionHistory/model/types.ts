export interface EvolutionEvent {
  id: string;
  message: string;
  createdAt: number;
  generation: number;
  tone: 'mutation' | 'predation' | 'environment' | 'discovery';
}
