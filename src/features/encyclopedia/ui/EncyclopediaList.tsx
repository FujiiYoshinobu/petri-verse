import { useMemo } from 'react';
import type { EncyclopediaEntry } from '../../../entities/encyclopediaEntry/model/types';
import { useSimulation } from '../../../app/providers/SimulationProvider';
import './encyclopedia-list.css';

const categoryLabel: Record<EncyclopediaEntry['category'], string> = {
  organism: '微生物',
  predator: '捕食者',
  event: 'イベント',
  environment: '環境'
};

export const EncyclopediaList = () => {
  const { encyclopedia, toggleFavorite } = useSimulation();

  const grouped = useMemo(() => {
    const map = new Map<EncyclopediaEntry['category'], EncyclopediaEntry[]>();
    encyclopedia.forEach((entry) => {
      const list = map.get(entry.category) ?? [];
      list.push(entry);
      map.set(entry.category, list);
    });
    return Array.from(map.entries());
  }, [encyclopedia]);

  return (
    <div className="encyclopedia-list">
      {grouped.map(([category, entries]) => (
        <section key={category}>
          <header>
            <h3>{categoryLabel[category]}</h3>
            <span>{entries.length}件</span>
          </header>
          <ul>
            {entries.map((entry) => (
              <li key={entry.id}>
                <div className="encyclopedia-list__thumb" aria-hidden>{entry.thumbnail ?? '🔬'}</div>
                <div className="encyclopedia-list__info">
                  <div className="encyclopedia-list__title">
                    <h4>{entry.name}</h4>
                    <button type="button" onClick={() => toggleFavorite(entry.id)}>
                      {entry.favorite ? '★' : '☆'}
                    </button>
                  </div>
                  <p>{entry.description}</p>
                  <dl>
                    {Object.entries(entry.details).map(([key, value]) => (
                      <div key={key}>
                        <dt>{key}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                  </dl>
                  <footer>
                    <span>発見: {new Date(entry.discoveredAt).toLocaleString()}</span>
                    {entry.conditions && <span>条件: {entry.conditions}</span>}
                  </footer>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
      {!grouped.length && <p className="empty">まだ図鑑データがありません。</p>}
    </div>
  );
};
