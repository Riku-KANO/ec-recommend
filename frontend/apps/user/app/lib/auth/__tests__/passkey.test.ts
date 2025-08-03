import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { PasskeyService } from '../passkey';

vi.mock('@simplewebauthn/browser', () => ({
  startRegistration: vi.fn(),
  startAuthentication: vi.fn(),
  browserSupportsWebAuthn: vi.fn(() => true),
}));

describe('PasskeyService', () => {
  let passkeyService: PasskeyService;

  beforeEach(() => {
    passkeyService = new PasskeyService();
    vi.clearAllMocks();
  });

  describe('checkSupport', () => {
    it('should return true if WebAuthn is supported', () => {
      expect(passkeyService.checkSupport()).toBe(true);
    });
  });

  describe('createPasskey', () => {
    it('should create a new passkey successfully', async () => {
      const mockChallenge = 'test-challenge';
      const mockUserId = 'test-user-id';
      const mockUserName = 'test@example.com';
      const mockResponse = {
        id: 'credential-id',
        rawId: 'credential-raw-id',
        response: {
          publicKey: 'public-key-data',
          clientDataJSON: 'client-data',
          attestationObject: 'attestation-object',
        },
        type: 'public-key',
      };

      vi.mocked(startRegistration).mockResolvedValue(mockResponse as any);

      const result = await passkeyService.createPasskey(
        mockChallenge,
        mockUserId,
        mockUserName
      );

      expect(startRegistration).toHaveBeenCalledWith({
        challenge: mockChallenge,
        rp: {
          name: 'ECレコメンド',
          id: 'localhost',
        },
        user: {
          id: mockUserId,
          name: mockUserName,
          displayName: mockUserName,
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' },
          { alg: -257, type: 'public-key' },
        ],
        authenticatorSelection: {
          residentKey: 'preferred',
          userVerification: 'preferred',
        },
        timeout: 60000,
        attestation: 'none',
      });

      expect(result).toEqual(mockResponse);
    });

    it('should throw error if registration fails', async () => {
      vi.mocked(startRegistration).mockRejectedValue(new Error('Registration failed'));

      await expect(
        passkeyService.createPasskey('challenge', 'user-id', 'user@example.com')
      ).rejects.toThrow('Registration failed');
    });
  });

  describe('authenticateWithPasskey', () => {
    it('should authenticate with passkey successfully', async () => {
      const mockChallenge = 'test-challenge';
      const mockResponse = {
        id: 'credential-id',
        rawId: 'credential-raw-id',
        response: {
          authenticatorData: 'authenticator-data',
          clientDataJSON: 'client-data',
          signature: 'signature-data',
          userHandle: 'user-handle',
        },
        type: 'public-key',
      };

      vi.mocked(startAuthentication).mockResolvedValue(mockResponse as any);

      const result = await passkeyService.authenticateWithPasskey(mockChallenge);

      expect(startAuthentication).toHaveBeenCalledWith({
        challenge: mockChallenge,
        rpId: 'localhost',
        userVerification: 'preferred',
        timeout: 60000,
      });

      expect(result).toEqual(mockResponse);
    });

    it('should throw error if authentication fails', async () => {
      vi.mocked(startAuthentication).mockRejectedValue(new Error('Authentication failed'));

      await expect(
        passkeyService.authenticateWithPasskey('challenge')
      ).rejects.toThrow('Authentication failed');
    });
  });
});