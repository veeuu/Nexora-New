import { createContext, useContext, useState } from 'react';

const IndustryContext = createContext();

export const IndustryProvider = ({ children }) => {
  const [industryData, setIndustryData] = useState([]);
  const [technologyData, setTechnologyData] = useState({});
  const [availableRegions, setAvailableRegions] = useState([]);

  return (
    <IndustryContext.Provider value={{ 
      industryData, 
      setIndustryData,
      technologyData,
      setTechnologyData,
      availableRegions,
      setAvailableRegions
    }}>
      {children}
    </IndustryContext.Provider>
  );
};

export const useIndustry = () => {
  const context = useContext(IndustryContext);
  if (!context) {
    // Return default values if provider is not available
    return { 
      industryData: [], 
      setIndustryData: () => {},
      technologyData: {},
      setTechnologyData: () => {},
      availableRegions: [],
      setAvailableRegions: () => {}
    };
  }
  return context;
};
