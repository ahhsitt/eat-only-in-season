// hooks/useLocalStorage.ts - Custom hook for localStorage management

import { useState, useEffect, useCallback } from 'react';
import type { UserPreference } from '../types';

const STORAGE_KEY = 'seasonal-recipe-preferences';

export function useLocalStorage() {
  const [preference, setPreference] = useState<UserPreference>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error reading from localStorage:', e);
    }
    return {
      cityName: undefined,
      preferenceText: undefined,
      updatedAt: new Date().toISOString(),
    };
  });

  // Save to localStorage whenever preference changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preference));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }, [preference]);

  const updateCityName = useCallback((cityName: string) => {
    setPreference((prev) => ({
      ...prev,
      cityName,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const updatePreferenceText = useCallback((preferenceText: string) => {
    setPreference((prev) => ({
      ...prev,
      preferenceText,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const clearPreferences = useCallback(() => {
    setPreference({
      cityName: undefined,
      preferenceText: undefined,
      updatedAt: new Date().toISOString(),
    });
  }, []);

  return {
    preference,
    updateCityName,
    updatePreferenceText,
    clearPreferences,
  };
}

export default useLocalStorage;
