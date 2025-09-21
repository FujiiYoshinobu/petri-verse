export interface Environment {
  temperature: number;
  oxygen: number;
  acidity: number;
  mutationRate: number;
  event?: {
    name: string;
    expiresAt: number;
  };
}
