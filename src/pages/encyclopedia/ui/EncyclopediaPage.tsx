import { ChangeEvent } from 'react';
import { EncyclopediaList } from '../../../features/encyclopedia/ui/EncyclopediaList';
import { useSimulation } from '../../../app/providers/SimulationProvider';
import type { EncyclopediaEntry } from '../../../entities/encyclopediaEntry/model/types';
import './encyclopedia-page.css';

const download = (entries: EncyclopediaEntry[]) => {
  const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `petri-verse-encyclopedia-${Date.now()}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const EncyclopediaPage = () => {
  const { encyclopedia, registerDiscovery } = useSimulation();

  const onImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      const parsed = JSON.parse(text) as EncyclopediaEntry[];
      parsed.forEach((entry) => {
        registerDiscovery({ ...entry, discoveredAt: entry.discoveredAt ?? Date.now() });
      });
    } catch (error) {
      console.error('Failed to import encyclopedia', error);
    }
  };

  return (
    <div className="encyclopedia-page">
      <header>
        <h2>PetriVerse 図鑑</h2>
        <p>観測済みの微生物・捕食者・環境イベントが自動登録されます。</p>
        <div className="encyclopedia-page__actions">
          <button type="button" onClick={() => download(encyclopedia)}>
            JSONとしてエクスポート
          </button>
          <label className="import-label">
            JSONをインポート
            <input type="file" accept="application/json" onChange={onImport} />
          </label>
        </div>
      </header>
      <EncyclopediaList />
    </div>
  );
};
