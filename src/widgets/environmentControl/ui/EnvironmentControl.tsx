import { useSimulation } from '../../../app/providers/SimulationProvider';
import './environment-control.css';

export const EnvironmentControl = () => {
  const { environment, adjustEnvironment } = useSimulation();

  return (
    <section className="environment-control">
      <header>
        <h2>環境パラメータ</h2>
        <p>温度・酸素・水質・突然変異率を調整して適応のゆらぎを観察。</p>
      </header>
      <div className="environment-control__grid">
        <label>
          <span>温度 {environment.temperature.toFixed(1)}℃</span>
          <input
            type="range"
            min={10}
            max={40}
            step={0.5}
            value={environment.temperature}
            onChange={(event) => adjustEnvironment({ temperature: Number.parseFloat(event.target.value) })}
          />
        </label>
        <label>
          <span>酸素 {(environment.oxygen * 100).toFixed(0)}%</span>
          <input
            type="range"
            min={0.2}
            max={1}
            step={0.01}
            value={environment.oxygen}
            onChange={(event) => adjustEnvironment({ oxygen: Number.parseFloat(event.target.value) })}
          />
        </label>
        <label>
          <span>水質 pH {environment.acidity.toFixed(1)}</span>
          <input
            type="range"
            min={4}
            max={9}
            step={0.1}
            value={environment.acidity}
            onChange={(event) => adjustEnvironment({ acidity: Number.parseFloat(event.target.value) })}
          />
        </label>
        <label>
          <span>突然変異率 {(environment.mutationRate * 100).toFixed(1)}%</span>
          <input
            type="range"
            min={0.05}
            max={0.4}
            step={0.01}
            value={environment.mutationRate}
            onChange={(event) => adjustEnvironment({ mutationRate: Number.parseFloat(event.target.value) })}
          />
        </label>
      </div>
      {environment.event && (
        <div className="environment-control__event">
          <strong>{environment.event.name}</strong>
          <span>イベント継続中...</span>
        </div>
      )}
    </section>
  );
};
