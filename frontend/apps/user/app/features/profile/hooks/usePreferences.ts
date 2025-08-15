import { useState, useEffect } from 'react';
import { UserPreferences } from '../types';
import { userApi } from '../api/userApi';

export function usePreferences(userId?: string) {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (userId) {
      fetchPreferences();
    }
  }, [userId]);
  
  const fetchPreferences = async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      const prefs = await userApi.getUserPreferences(userId);
      setPreferences(prefs);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch preferences');
    } finally {
      setIsLoading(false);
    }
  };
  
  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!userId) return false;
    
    try {
      await userApi.updateUserPreferences(userId, updates);
      setPreferences(prev => prev ? { ...prev, ...updates } : null);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
      return false;
    }
  };
  
  return {
    preferences,
    isLoading,
    error,
    updatePreferences,
    refetch: fetchPreferences,
  };
}