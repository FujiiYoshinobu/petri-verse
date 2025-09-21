import { nanoid } from '../../../shared/lib/nanoid';
import type { FoodEvent, FoodType } from '../model/types';

export const createFoodEvent = (type: FoodType, amount: number): FoodEvent => ({
  id: nanoid(),
  type,
  createdAt: Date.now(),
  amount,
  decay: type === 'toxic' ? 0.05 : 0.02
});
