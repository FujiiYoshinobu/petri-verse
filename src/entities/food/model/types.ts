export type FoodType = 'high' | 'low' | 'toxic';

export interface FoodEvent {
  id: string;
  type: FoodType;
  createdAt: number;
  amount: number;
  decay: number;
}
