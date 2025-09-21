import { useEffect, useMemo, useState } from 'react';
import { createOrganism, mutateTraits } from '../../entities/organism/lib/createOrganism';
import type { Organism } from '../../entities/organism/model/types';
import { createPredator } from '../../entities/predator/lib/createPredator';
import type { Predator } from '../../entities/predator/model/types';
import { createEnvironment, clampEnvironment } from '../../entities/environment/lib/createEnvironment';
import type { Environment } from '../../entities/environment/model/types';
import { createFoodEvent } from '../../entities/food/lib/createFood';
import type { FoodEvent, FoodType } from '../../entities/food/model/types';
import type { EncyclopediaEntry } from '../../entities/encyclopediaEntry/model/types';
import type { EvolutionEvent } from '../../widgets/evolutionHistory/model/types';
import { CANVAS_HEIGHT, CANVAS_WIDTH, FOOD_EFFECT, ENVIRONMENT_EFFECT } from '../constants/simulation';
import { chance, randomInRange, randomItem } from '../lib/random';
import { nanoid } from '../lib/nanoid';
import type { SimulationState, SimulationStore } from './types';

const STORAGE_KEY = 'petri-verse::simulation';

const baseDiscoveries: EncyclopediaEntry[] = [
  {
    id: 'baseline-environment',
    name: '標準環境',
    category: 'environment',
    description: '温度26℃、酸素0.8、水質pH7の標準的なペトリ環境。',
    discoveredAt: Date.now(),
    details: { temperature: '26℃', oxygen: '0.8', pH: 7 },
    conditions: '初期状態'
  }
];

const createInitialState = (): SimulationState => ({
  tick: 0,
  organisms: Array.from({ length: 18 }, () => createOrganism()),
  predators: [],
  foods: [],
  environment: createEnvironment(),
  encyclopedia: baseDiscoveries,
  evolutionLog: []
});

const loadState = (): SimulationState | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SimulationState;
    return {
      ...createInitialState(),
      ...parsed,
      environment: clampEnvironment(parsed.environment)
    };
  } catch (error) {
    console.warn('Failed to load state', error);
    return null;
  }
};

const persistState = (state: SimulationState) => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const bounce = (value: number, velocity: number, min: number, max: number) => {
  let nextValue = value + velocity;
  let nextVelocity = velocity;
  if (nextValue < min) {
    nextValue = min + (min - nextValue);
    nextVelocity = Math.abs(velocity);
  } else if (nextValue > max) {
    nextValue = max - (nextValue - max);
    nextVelocity = -Math.abs(velocity);
  }
  return { value: nextValue, velocity: nextVelocity };
};

const decayFood = (food: FoodEvent, delta: number): FoodEvent | null => {
  const nextAmount = food.amount * Math.pow(1 - food.decay, delta);
  if (nextAmount < 1) {
    return null;
  }
  return { ...food, amount: nextAmount };
};

const resolveFoodEnergy = (organism: Organism, foods: FoodEvent[], delta: number): number => {
  let energyShift = 0;
  foods.forEach((food) => {
    const modifier = FOOD_EFFECT[food.type];
    if (food.type === 'toxic') {
      energyShift += (organism.traits.preferredFood === 'toxic' ? modifier * 0.3 : modifier) * delta;
    } else {
      const affinity = organism.traits.preferredFood === food.type ? 1 : 0.4;
      energyShift += modifier * affinity * (food.amount / 60) * delta;
    }
  });
  return energyShift;
};

const environmentalPressure = (organism: Organism, environment: Environment, delta: number): number => {
  const { temperature, oxygen, acidity } = environment;
  const tempPenalty = Math.abs(temperature - ENVIRONMENT_EFFECT.temperature.optimal) / ENVIRONMENT_EFFECT.temperature.range;
  const oxygenPenalty = Math.abs(oxygen - ENVIRONMENT_EFFECT.oxygen.optimal) / ENVIRONMENT_EFFECT.oxygen.range;
  const acidityPenalty = Math.abs(acidity - ENVIRONMENT_EFFECT.acidity.optimal) / ENVIRONMENT_EFFECT.acidity.range;
  const resilience = organism.traits.resilience;
  return -(tempPenalty + oxygenPenalty + acidityPenalty) * 4 * (1 - resilience * 0.6) * delta;
};

const predatorPressure = (
  organism: Organism,
  predators: Predator[],
  delta: number
): { energy: number; status: Organism['status'] } => {
  if (!predators.length) {
    return { energy: 0, status: 'idle' };
  }
  let closest = Infinity;
  predators.forEach((predator) => {
    const dx = predator.position.x - organism.position.x;
    const dy = predator.position.y - organism.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < closest) {
      closest = distance;
    }
  });
  if (closest < 80) {
    return { energy: -8 * delta, status: 'evading' };
  }
  return { energy: 0, status: 'idle' };
};

const limitLog = (log: EvolutionEvent[]): EvolutionEvent[] => log.slice(0, 40);

const upsertDiscovery = (entries: EncyclopediaEntry[], entry: EncyclopediaEntry): EncyclopediaEntry[] => {
  if (entries.some((item) => item.id === entry.id)) {
    return entries;
  }
  return [entry, ...entries];
};

export const useLocalSimulationStore = (): SimulationStore => {
  const [state, setState] = useState<SimulationState>(() => loadState() ?? createInitialState());

  useEffect(() => {
    persistState(state);
  }, [state]);

  const addLog = (entry: EvolutionEvent) => {
    setState((prev) => ({
      ...prev,
      evolutionLog: limitLog([entry, ...prev.evolutionLog])
    }));
  };

  const advance = (delta: number) => {
    setState((prev) => {
      const nextTick = prev.tick + delta;
      const foods = prev.foods
        .map((food) => decayFood(food, delta))
        .filter((value): value is FoodEvent => value !== null);

      const predators: Predator[] = [];
      const predatorLog: EvolutionEvent[] = [];
      prev.predators.forEach((predator) => {
        const age = predator.age + delta;
        if (age > predator.lifespan) {
          predatorLog.push({
            id: nanoid(),
            createdAt: Date.now(),
            generation: 0,
            tone: 'predation',
            message: predator.behavior === 'agile' ? '俊敏な捕食者が嵐のように去っていった。' : '鈍重な捕食者が静かに姿を消した。'
          });
          return;
        }
        const { value: x, velocity: vx } = bounce(
          predator.position.x,
          predator.velocity.x * (delta * 0.4),
          30,
          CANVAS_WIDTH - 30
        );
        const { value: y, velocity: vy } = bounce(
          predator.position.y,
          predator.velocity.y * (delta * 0.4),
          30,
          CANVAS_HEIGHT - 30
        );
        predators.push({
          ...predator,
          age,
          position: { x, y },
          velocity: { x: vx, y: vy }
        });
      });

      const organismLog: EvolutionEvent[] = [...predatorLog];
      const newOrganisms: Organism[] = [];
      const offspring: Organism[] = [];
      let encyclopedia = prev.encyclopedia;

      prev.organisms.forEach((organism) => {
        let age = organism.age + delta;
        let energy = organism.energy - delta * 1.2 + resolveFoodEnergy(organism, foods, delta);
        energy += environmentalPressure(organism, prev.environment, delta);
        const predatorImpact = predatorPressure(organism, predators, delta);
        energy += predatorImpact.energy;
        const { value: x, velocity: vx } = bounce(
          organism.position.x,
          organism.velocity.x * (delta * 0.25 + organism.traits.speed * 0.008),
          20,
          CANVAS_WIDTH - 20
        );
        const { value: y, velocity: vy } = bounce(
          organism.position.y,
          organism.velocity.y * (delta * 0.25 + organism.traits.speed * 0.008),
          20,
          CANVAS_HEIGHT - 20
        );

        let status: Organism['status'] = predatorImpact.status;

        const predatorThreat = predators.find((predator) => {
          const dx = predator.position.x - x;
          const dy = predator.position.y - y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          return distance < predator.size * 0.5 + organism.size;
        });
        if (predatorThreat) {
          organismLog.unshift({
            id: nanoid(),
            tone: 'predation',
            createdAt: Date.now(),
            generation: organism.generation,
            message: `${organism.generation}世代の微生物が捕食者に捕食された。`
          });
          return;
        }

        if (age > organism.lifespan || energy < -20) {
          organismLog.unshift({
            id: nanoid(),
            tone: 'environment',
            createdAt: Date.now(),
            generation: organism.generation,
            message: `${organism.generation}世代の微生物が寿命を迎えた。`
          });
          return;
        }

        const reproductionChance = organism.traits.fertility * (1 + prev.environment.oxygen) * delta;
        if (energy > 120 && chance(Math.min(0.8, reproductionChance))) {
          const child = createOrganism({
            generation: organism.generation + 1,
            parentTraits: mutateTraits(organism.traits),
            position: { x: x + randomInRange(-25, 25), y: y + randomInRange(-25, 25) }
          });
          offspring.push(child);
          status = 'mutating';
          const discovery: EncyclopediaEntry = {
            id: `organism-gen-${child.generation}`,
            name: `${child.generation}世代種`,
            category: 'organism',
            description: '突然変異により生まれた新しい系統。',
            discoveredAt: Date.now(),
            details: {
              speed: child.traits.speed.toFixed(1),
              resilience: child.traits.resilience.toFixed(2),
              preference: child.traits.preferredFood
            },
            conditions: `${child.generation}世代を観測`
          };
          encyclopedia = upsertDiscovery(encyclopedia, discovery);
          organismLog.unshift({
            id: nanoid(),
            tone: 'mutation',
            createdAt: Date.now(),
            generation: child.generation,
            message: `突然変異が発生し、新たな第${child.generation}世代が誕生！`
          });
        }

        const mutationChance = prev.environment.mutationRate * delta;
        if (chance(mutationChance * 0.5)) {
          const mutatedTraits = mutateTraits(organism.traits);
          organismLog.unshift({
            id: nanoid(),
            tone: 'mutation',
            createdAt: Date.now(),
            generation: organism.generation,
            message: `微生物が環境に適応する形で特性を変化させた。`
          });
          const entry: EncyclopediaEntry = {
            id: `mutation-${nanoid()}`,
            name: '特性変異',
            category: 'event',
            description: '環境圧への適応で特性が再編された記録。',
            discoveredAt: Date.now(),
            details: {
              generation: organism.generation,
              speed: mutatedTraits.speed.toFixed(1),
              resilience: mutatedTraits.resilience.toFixed(2)
            },
            conditions: '突然変異イベント発生'
          };
          encyclopedia = upsertDiscovery(encyclopedia, entry);
          organism = {
            ...organism,
            traits: mutatedTraits,
            size: Math.max(6, Math.min(22, organism.size + randomInRange(-1.5, 1.5)))
          };
        }

        newOrganisms.push({
          ...organism,
          age,
          energy: Math.max(-40, Math.min(160, energy)),
          position: { x, y },
          velocity: { x: vx, y: vy },
          status
        });
      });

      let environment = prev.environment;
      if (!environment.event && chance(0.01 * delta)) {
        const events = [
          {
            name: '微隕石の飛来',
            effect: (env: Environment) => ({
              ...env,
              mutationRate: Math.min(0.4, env.mutationRate + 0.05)
            }),
            tone: 'environment',
            message: '微隕石が降り注ぎ、突然変異率が上昇した。'
          },
          {
            name: '外来種の侵入',
            effect: (env: Environment) => ({
              ...env,
              oxygen: Math.max(0.3, env.oxygen - 0.1)
            }),
            tone: 'predation',
            message: '外来種が侵入し、酸素濃度が低下した。'
          }
        ];
        const selected = randomItem(events);
        environment = {
          ...selected.effect(environment),
          event: { name: selected.name, expiresAt: Date.now() + 60_000 }
        };
        const entry: EncyclopediaEntry = {
          id: `event-${selected.name}`,
          name: selected.name,
          category: 'event',
          description: '環境が大きく揺らいだ記録。',
          discoveredAt: Date.now(),
          details: { mutationRate: environment.mutationRate.toFixed(2), oxygen: environment.oxygen.toFixed(2) },
          conditions: 'イベント発生'
        };
        encyclopedia = upsertDiscovery(encyclopedia, entry);
        organismLog.unshift({
          id: nanoid(),
          tone: selected.tone,
          createdAt: Date.now(),
          generation: 0,
          message: selected.message
        });
      } else if (environment.event && environment.event.expiresAt < Date.now()) {
        environment = { ...environment, event: undefined };
      }

      if (chance(0.02 * delta) && predators.length < 2) {
        const predator = createPredator();
        predators.push(predator);
        const entry: EncyclopediaEntry = {
          id: `predator-${predator.behavior}`,
          name: predator.behavior === 'agile' ? '俊敏捕食者' : '鈍重捕食者',
          category: 'predator',
          description: 'ペトリバースに出現する自然の捕食者。',
          discoveredAt: Date.now(),
          details: {
            lifespan: predator.lifespan.toFixed(0),
            behavior: predator.behavior,
            size: predator.size.toFixed(0)
          },
          conditions: '捕食者の出現'
        };
        encyclopedia = upsertDiscovery(encyclopedia, entry);
        organismLog.unshift({
          id: predator.id,
          tone: 'predation',
          createdAt: Date.now(),
          generation: 0,
          message: predator.behavior === 'agile' ? '俊敏型の捕食者が波紋とともに出現！' : '鈍重型の捕食者が影を落として現れた。'
        });
      }

      const combinedOrganisms = [...newOrganisms, ...offspring];

      const evolutionLog = limitLog([...organismLog, ...prev.evolutionLog]);

      return {
        tick: nextTick,
        organisms: combinedOrganisms,
        predators,
        foods,
        environment,
        encyclopedia,
        evolutionLog
      };
    });
  };

  const feed = (food: FoodEvent) => {
    setState((prev) => ({
      ...prev,
      foods: [food, ...prev.foods]
    }));
    addLog({
      id: food.id,
      createdAt: Date.now(),
      generation: 0,
      tone: food.type === 'toxic' ? 'environment' : 'mutation',
      message: `ユーザーが${food.type === 'high' ? '高栄養' : food.type === 'low' ? '低栄養' : '毒性'}エサを散布。`
    });
  };

  const adjustEnvironment = (partial: Partial<Environment>) => {
    setState((prev) => ({
      ...prev,
      environment: clampEnvironment({ ...prev.environment, ...partial })
    }));
  };

  const registerDiscovery = (entry: EncyclopediaEntry) => {
    setState((prev) => ({
      ...prev,
      encyclopedia: upsertDiscovery(prev.encyclopedia, entry)
    }));
    addLog({
      id: entry.id,
      createdAt: entry.discoveredAt,
      generation: 0,
      tone: 'discovery',
      message: `${entry.name} を図鑑に登録しました。`
    });
  };

  const toggleFavorite = (id: string) => {
    setState((prev) => ({
      ...prev,
      encyclopedia: prev.encyclopedia.map((item) => (item.id === id ? { ...item, favorite: !item.favorite } : item))
    }));
  };

  const reset = () => {
    const next = createInitialState();
    setState(next);
    persistState(next);
  };

  return useMemo(
    () => ({
      ...state,
      advance,
      feed,
      adjustEnvironment,
      registerDiscovery,
      toggleFavorite,
      reset
    }),
    [state]
  );
};

export const feedWithType = (type: FoodType, amount: number): FoodEvent => createFoodEvent(type, amount);
