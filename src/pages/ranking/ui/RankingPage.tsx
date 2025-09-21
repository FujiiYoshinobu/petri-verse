import { useMemo } from 'react';
import { useSimulation } from '../../../app/providers/SimulationProvider';
import './ranking-page.css';

export const RankingPage = () => {
  const { organisms, evolutionLog, encyclopedia, tick } = useSimulation();

  const stats = useMemo(() => {
    const maxGeneration = organisms.reduce((max, item) => Math.max(max, item.generation), 0);
    const oldest = organisms.reduce((max, item) => Math.max(max, item.age), 0);
    const mutationCount = evolutionLog.filter((event) => event.tone === 'mutation').length;
    const predationCount = evolutionLog.filter((event) => event.tone === 'predation').length;
    const diversity = new Set(organisms.map((item) => item.traits.shape)).size;
    const favoriteCount = encyclopedia.filter((entry) => entry.favorite).length;

    return {
      maxGeneration,
      oldest,
      mutationCount,
      predationCount,
      diversity,
      favoriteCount
    };
  }, [encyclopedia, evolutionLog, organisms]);

  return (
    <div className="ranking-page">
      <header>
        <h2>ランキング &amp; 指標</h2>
        <p>現在のシミュレーションのハイライトを集計しています。（tick: {tick.toFixed(0)}）</p>
      </header>
      <div className="ranking-page__grid">
        <article>
          <h3>最長寿命系統</h3>
          <p>
            最も長生きしている個体は <strong>{stats.oldest.toFixed(1)} 秒</strong> 生存中。世代は{' '}
            <strong>{stats.maxGeneration}</strong> まで到達しています。
          </p>
        </article>
        <article>
          <h3>突然変異イベント</h3>
          <p>
            ログされた突然変異は <strong>{stats.mutationCount}</strong> 件。環境調整やエサの与え方でさらに誘発できます。
          </p>
        </article>
        <article>
          <h3>捕食者との攻防</h3>
          <p>
            捕食イベントは <strong>{stats.predationCount}</strong> 件発生。俊敏型・鈍重型への適応を観察しましょう。
          </p>
        </article>
        <article>
          <h3>形態多様性</h3>
          <p>
            現在観測されている形態タイプは <strong>{stats.diversity}</strong> 種類。突然変異でさらに多様化が期待できます。
          </p>
        </article>
        <article>
          <h3>図鑑お気に入り</h3>
          <p>
            図鑑でお気に入り登録された項目は <strong>{stats.favoriteCount}</strong> 件です。注目の種を共有しましょう。
          </p>
        </article>
      </div>
    </div>
  );
};
