export const CANVAS_WIDTH = 640;
export const CANVAS_HEIGHT = 400;

export const FOOD_EFFECT = {
  high: 25,
  low: 12,
  toxic: -18
} as const;

export const ENVIRONMENT_EFFECT = {
  temperature: {
    optimal: 26,
    range: 15
  },
  oxygen: {
    optimal: 0.85,
    range: 0.6
  },
  acidity: {
    optimal: 7,
    range: 3
  }
} as const;
