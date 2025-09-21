import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { AppRouter } from './app/routes';
import { SimulationProvider } from './app/providers/SimulationProvider';
import './app/styles/global.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <SimulationProvider>
      <RouterProvider router={AppRouter} />
    </SimulationProvider>
  </React.StrictMode>
);
