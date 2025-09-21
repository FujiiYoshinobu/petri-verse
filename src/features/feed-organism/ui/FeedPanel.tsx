import { useState } from 'react';
import { useSimulation } from '../../../app/providers/SimulationProvider';
import { feedWithType } from '../../../shared/config/store';
import type { FoodType } from '../../../entities/food/model/types';
import './feed-panel.css';

const foodLabels: Record<FoodType, string> = {
  high: '高栄養',
  low: '低栄養',
  toxic: '毒性'
};

export const FeedPanel = () => {
  const { feed } = useSimulation();
  const [amount, setAmount] = useState(45);
  const [type, setType] = useState<FoodType>('high');

  const handleFeed = () => {
    feed(feedWithType(type, amount));
  };

  return (
    <section className="feed-panel">
      <header>
        <h2>エサ散布</h2>
        <p>エサの種類と量を調整して生態系に影響を与えましょう。</p>
      </header>
      <div className="feed-panel__controls">
        <div className="feed-panel__types">
          {(Object.keys(foodLabels) as FoodType[]).map((key) => (
            <button
              key={key}
              type="button"
              className={key === type ? 'is-active' : ''}
              onClick={() => setType(key)}
            >
              {foodLabels[key]}
            </button>
          ))}
        </div>
        <label className="feed-panel__slider">
          <span>量: {amount.toFixed(0)}</span>
          <input
            type="range"
            min={10}
            max={120}
            step={5}
            value={amount}
            onChange={(event) => setAmount(Number.parseInt(event.target.value, 10))}
          />
        </label>
      </div>
      <button type="button" className="feed-panel__action" onClick={handleFeed}>
        散布する
      </button>
    </section>
  );
};
