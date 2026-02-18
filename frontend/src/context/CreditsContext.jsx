import { createContext, useState, useCallback } from 'react';

export const CreditsContext = createContext();

export const CreditsProvider = ({ children }) => {
  const [credits, setCredits] = useState(0);
  const [creditsUpdated, setCreditsUpdated] = useState(0);

  const incrementCredits = useCallback(() => {
    setCredits(prev => prev + 1);
    setCreditsUpdated(prev => prev + 1);
  }, []);

  const setCreditsValue = useCallback((value) => {
    setCredits(value);
  }, []);

  return (
    <CreditsContext.Provider value={{ credits, incrementCredits, setCreditsValue, creditsUpdated }}>
      {children}
    </CreditsContext.Provider>
  );
};
