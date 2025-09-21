import React, { createContext, useContext, useMemo } from 'react';
import { useLocalSimulationStore } from '../../shared/config/store';
import type { SimulationStore } from '../../shared/config/types';

const SimulationContext = createContext<SimulationStore | null>(null);

interface Props {
  children: React.ReactNode;
}

export const SimulationProvider: React.FC<Props> = ({ children }) => {
  const store = useLocalSimulationStore();
  const value = useMemo(() => store, [store]);

  return <SimulationContext.Provider value={value}>{children}</SimulationContext.Provider>;
};

export const useSimulation = (): SimulationStore => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within SimulationProvider');
  }
  return context;
};
