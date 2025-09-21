import { ObservationScene } from '../../../widgets/observationScene/ui/ObservationScene';
import { FeedPanel } from '../../../features/feed-organism/ui/FeedPanel';
import { EnvironmentControl } from '../../../widgets/environmentControl/ui/EnvironmentControl';
import { EvolutionHistory } from '../../../widgets/evolutionHistory/ui/EvolutionHistory';
import './main-page.css';

export const MainPage = () => (
  <div className="main-page">
    <ObservationScene />
    <div className="main-page__grid">
      <FeedPanel />
      <EnvironmentControl />
      <EvolutionHistory />
    </div>
  </div>
);
