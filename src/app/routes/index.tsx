import { createBrowserRouter } from 'react-router-dom';
import { MainPage } from '../../pages/main/ui/MainPage';
import { EncyclopediaPage } from '../../pages/encyclopedia/ui/EncyclopediaPage';
import { RankingPage } from '../../pages/ranking/ui/RankingPage';
import { Layout } from '../../shared/ui/Layout';

export const AppRouter = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <MainPage /> },
      { path: '/encyclopedia', element: <EncyclopediaPage /> },
      { path: '/ranking', element: <RankingPage /> }
    ]
  }
]);
