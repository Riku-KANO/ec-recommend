import { useState, useEffect } from 'react';
import { Address } from '../types';
import { userApi } from '../api/userApi';

export function useAddresses(userId?: string) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (userId) {
      fetchAddresses();
    }
  }, [userId]);
  
  const fetchAddresses = async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      const addressList = await userApi.getUserAddresses(userId);
      setAddresses(addressList);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch addresses');
    } finally {
      setIsLoading(false);
    }
  };
  
  const createAddress = async (address: Omit<Address, 'addressId' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!userId) return false;
    
    try {
      const newAddress = await userApi.createAddress(userId, address);
      setAddresses(prev => [...prev, newAddress]);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create address');
      return false;
    }
  };
  
  const updateAddress = async (addressId: string, updates: Partial<Address>) => {
    if (!userId) return false;
    
    try {
      await userApi.updateAddress(userId, addressId, updates);
      setAddresses(prev => 
        prev.map(addr => 
          addr.addressId === addressId ? { ...addr, ...updates } : addr
        )
      );
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update address');
      return false;
    }
  };
  
  const deleteAddress = async (addressId: string) => {
    if (!userId) return false;
    
    try {
      await userApi.deleteAddress(userId, addressId);
      setAddresses(prev => prev.filter(addr => addr.addressId !== addressId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete address');
      return false;
    }
  };
  
  return {
    addresses,
    isLoading,
    error,
    createAddress,
    updateAddress,
    deleteAddress,
    refetch: fetchAddresses,
  };
}