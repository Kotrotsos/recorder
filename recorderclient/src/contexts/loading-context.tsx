"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useUISettings } from './ui-settings-context';

interface LoadingContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  setIsLoading: () => {},
});

export const useLoading = () => useContext(LoadingContext);

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [appLoading, setAppLoading] = useState(false); // For app-initiated loading
  const { loading: uiSettingsLoading } = useUISettings();

  // Combine UI settings loading with app loading
  useEffect(() => {
    // If UI settings are still loading, or app has explicitly set loading, show loading state
    const shouldLoad = uiSettingsLoading || appLoading;
    setIsLoading(shouldLoad);
    
    // If UI settings have finished loading, remove loading after a small delay
    // This ensures styles are applied before showing content
    if (!uiSettingsLoading && !appLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 300); // Short delay to ensure styles are applied
      
      return () => clearTimeout(timer);
    }
  }, [uiSettingsLoading, appLoading]);
  
  // Provide a wrapper for setIsLoading that only affects appLoading
  const handleSetIsLoading = (loading: boolean) => {
    setAppLoading(loading);
  };

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading: handleSetIsLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}; 