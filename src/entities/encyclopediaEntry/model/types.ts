export type EncyclopediaCategory = 'organism' | 'predator' | 'event' | 'environment';

export interface EncyclopediaEntry {
  id: string;
  name: string;
  category: EncyclopediaCategory;
  description: string;
  discoveredAt: number;
  thumbnail?: string;
  details: Record<string, string | number>;
  favorite?: boolean;
  conditions?: string;
}
