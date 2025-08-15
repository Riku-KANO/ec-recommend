import { renderHook, waitFor } from '@testing-library/react';
import { useProfile } from './useProfile';
import { userApi } from '../api/userApi';

jest.mock('../api/userApi');

describe('useProfile', () => {
  const mockUser = {
    userId: 'user-123',
    email: 'test@example.com',
    username: 'testuser',
    displayName: 'Test User',
    language: 'ja',
    isActive: true,
    isVerified: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch user on mount', async () => {
    (userApi.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useProfile());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.user).toBe(null);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.error).toBe(null);
    expect(userApi.getCurrentUser).toHaveBeenCalledTimes(1);
  });

  it('should handle fetch error', async () => {
    const error = new Error('Failed to fetch user');
    (userApi.getCurrentUser as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useProfile());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBe(null);
    expect(result.current.error).toBe('Failed to fetch user');
  });

  it('should update user successfully', async () => {
    (userApi.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
    const updatedUser = { ...mockUser, displayName: 'Updated Name' };
    (userApi.updateUser as jest.Mock).mockResolvedValue(updatedUser);

    const { result } = renderHook(() => useProfile());

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });

    const success = await result.current.updateUser({ displayName: 'Updated Name' });

    expect(success).toBe(true);
    expect(result.current.user).toEqual(updatedUser);
    expect(userApi.updateUser).toHaveBeenCalledWith('user-123', { displayName: 'Updated Name' });
  });

  it('should handle update error', async () => {
    (userApi.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
    const error = new Error('Failed to update user');
    (userApi.updateUser as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useProfile());

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });

    const success = await result.current.updateUser({ displayName: 'Updated Name' });

    expect(success).toBe(false);
    expect(result.current.error).toBe('Failed to update user');
    expect(result.current.user).toEqual(mockUser); // User should not change on error
  });

  it('should not update if user is null', async () => {
    (userApi.getCurrentUser as jest.Mock).mockResolvedValue(null);

    const { result } = renderHook(() => useProfile());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const success = await result.current.updateUser({ displayName: 'Updated Name' });

    expect(success).toBe(undefined);
    expect(userApi.updateUser).not.toHaveBeenCalled();
  });
});