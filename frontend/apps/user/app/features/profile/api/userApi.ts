import { User, UserPreferences, Address, UpdateUserPayload } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'http://localhost:8082/api/v1';

class UserApi {
  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem('accessToken');
    const userId = localStorage.getItem('userId');
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (userId) {
      headers['X-User-ID'] = userId;
    }
    
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'An error occurred');
    }
    
    if (response.status === 204) {
      return null;
    }
    
    return response.json();
  }
  
  async getCurrentUser(): Promise<User> {
    return this.fetchWithAuth('/users/me');
  }
  
  async getUser(userId: string): Promise<User> {
    return this.fetchWithAuth(`/users/${userId}`);
  }
  
  async updateUser(userId: string, updates: UpdateUserPayload): Promise<User> {
    return this.fetchWithAuth(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }
  
  async deleteUser(userId: string): Promise<void> {
    await this.fetchWithAuth(`/users/${userId}`, {
      method: 'DELETE',
    });
  }
  
  async getUserPreferences(userId: string): Promise<UserPreferences> {
    return this.fetchWithAuth(`/users/${userId}/preferences`);
  }
  
  async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<void> {
    await this.fetchWithAuth(`/users/${userId}/preferences`, {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }
  
  async createAddress(userId: string, address: Omit<Address, 'addressId' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Address> {
    return this.fetchWithAuth(`/users/${userId}/addresses`, {
      method: 'POST',
      body: JSON.stringify(address),
    });
  }
  
  async getUserAddresses(userId: string): Promise<Address[]> {
    return this.fetchWithAuth(`/users/${userId}/addresses`);
  }
  
  async updateAddress(userId: string, addressId: string, address: Partial<Address>): Promise<void> {
    await this.fetchWithAuth(`/users/${userId}/addresses/${addressId}`, {
      method: 'PUT',
      body: JSON.stringify(address),
    });
  }
  
  async deleteAddress(userId: string, addressId: string): Promise<void> {
    await this.fetchWithAuth(`/users/${userId}/addresses/${addressId}`, {
      method: 'DELETE',
    });
  }
}

export const userApi = new UserApi();