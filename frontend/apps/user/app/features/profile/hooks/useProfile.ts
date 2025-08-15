import { useState, useEffect } from 'react';
import { User, UpdateUserPayload } from '../types';
import { userApi } from '../api/userApi';

export function useProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchUser();
  }, []);
  
  const fetchUser = async () => {
    try {
      setIsLoading(true);
      const userData = await userApi.getCurrentUser();
      setUser(userData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user');
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateUser = async (updates: UpdateUserPayload) => {
    if (!user) return;
    
    try {
      const updatedUser = await userApi.updateUser(user.userId, updates);
      setUser(updatedUser);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
      return false;
    }
  };
  
  return {
    user,
    isLoading,
    error,
    updateUser,
    refetch: fetchUser,
  };
}