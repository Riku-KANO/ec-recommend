import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { apiClient } from '@/lib/api';

import { usePasskey } from '../usePasskey';


// Mock PasskeyService
const mockPasskeyService = {
  checkSupport: vi.fn(() => true),
  createPasskey: vi.fn(),
  authenticateWithPasskey: vi.fn(),
};

vi.mock('@/lib/auth/passkey', () => ({
  PasskeyService: vi.fn(() => mockPasskeyService),
}));

// Mock API client
vi.mock('@/lib/api', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('usePasskey', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should check if WebAuthn is supported', () => {
    const { result } = renderHook(() => usePasskey());
    expect(result.current.isSupported).toBe(true);
  });

  describe('registerPasskey', () => {
    it('should register a new passkey successfully', async () => {
      const mockChallenge = { challenge: 'test-challenge' };
      const mockCredential = {
        id: 'credential-id',
        response: {
          publicKey: 'public-key',
          clientDataJSON: 'client-data',
          attestationObject: 'attestation',
        },
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockChallenge);
      vi.mocked(apiClient.post).mockResolvedValueOnce({ success: true });

      mockPasskeyService.createPasskey.mockResolvedValueOnce(mockCredential);

      const { result } = renderHook(() => usePasskey());

      await act(async () => {
        await result.current.registerPasskey('user-id', 'user@example.com');
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(apiClient.post).toHaveBeenCalledWith('/auth/passkey/register/begin', {
        userId: 'user-id',
        userName: 'user@example.com',
      });
      expect(apiClient.post).toHaveBeenCalledWith('/auth/passkey/register/complete', {
        userId: 'user-id',
        credential: mockCredential,
      });
    });

    it('should handle registration error', async () => {
      vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Registration failed'));

      const { result } = renderHook(() => usePasskey());

      await act(async () => {
        await result.current.registerPasskey('user-id', 'user@example.com');
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('パスキーの登録に失敗しました');
    });
  });

  describe('authenticateWithPasskey', () => {
    it('should authenticate with passkey successfully', async () => {
      const mockChallenge = { challenge: 'test-challenge' };
      const mockCredential = {
        id: 'credential-id',
        response: {
          authenticatorData: 'auth-data',
          clientDataJSON: 'client-data',
          signature: 'signature',
        },
      };
      const mockAuthResponse = {
        user: { id: 'user-id', email: 'user@example.com' },
        tokens: { idToken: 'id-token', accessToken: 'access-token' },
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockChallenge);
      vi.mocked(apiClient.post).mockResolvedValueOnce(mockAuthResponse);

      mockPasskeyService.authenticateWithPasskey.mockResolvedValueOnce(mockCredential);

      const { result } = renderHook(() => usePasskey());

      let authResult;
      await act(async () => {
        authResult = await result.current.authenticateWithPasskey();
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(authResult).toEqual(mockAuthResponse);
      expect(apiClient.post).toHaveBeenCalledWith('/auth/passkey/authenticate/begin', {});
      expect(apiClient.post).toHaveBeenCalledWith('/auth/passkey/authenticate/complete', {
        credential: mockCredential,
      });
    });

    it('should handle authentication error', async () => {
      vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Authentication failed'));

      const { result } = renderHook(() => usePasskey());

      await act(async () => {
        await result.current.authenticateWithPasskey();
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('パスキーでの認証に失敗しました');
    });
  });
});