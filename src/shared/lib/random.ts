export const randomInRange = (min: number, max: number): number => Math.random() * (max - min) + min;

export const randomItem = <T>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)];

export const chance = (probability: number): boolean => Math.random() < probability;
