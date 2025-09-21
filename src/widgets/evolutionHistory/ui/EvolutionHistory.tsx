import { useMemo } from 'react';
import { useSimulation } from '../../../app/providers/SimulationProvider';
import './evolution-history.css';

const toneToClass: Record<string, string> = {
  mutation: 'tone-mutation',
  predation: 'tone-predation',
  environment: 'tone-environment',
  discovery: 'tone-discovery'
};

export const EvolutionHistory = () => {
  const { evolutionLog } = useSimulation();
  const events = useMemo(() => evolutionLog.slice(0, 12), [evolutionLog]);

  return (
    <section className="evolution-history">
      <header>
        <h2>進化ログ</h2>
        <p>世代交代や環境イベントの履歴。</p>
      </header>
      <ul>
        {events.map((event) => (
          <li key={event.id} className={toneToClass[event.tone]}>
            <span className="evolution-history__time">{new Date(event.createdAt).toLocaleTimeString()}</span>
            <p>{event.message}</p>
          </li>
        ))}
        {!events.length && <li className="empty">まだログがありません。</li>}
      </ul>
    </section>
  );
};
