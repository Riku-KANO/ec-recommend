import { useState } from 'react';

import { apiClient } from '@/lib/api';
import { PasskeyService } from '@/lib/auth/passkey';

interface PasskeyRegistrationBeginResponse {
  challenge: string;
  userId?: string;
}

interface PasskeyAuthenticationBeginResponse {
  challenge: string;
  allowCredentials?: Array<{ id: string; type: 'public-key' }>;
}

interface AuthenticationCompleteResponse {
  user: {
    id: string;
    email: string;
  };
  tokens: {
    idToken: string;
    accessToken: string;
  };
}

export function usePasskey() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const passkeyService = new PasskeyService();

  const isSupported = passkeyService.checkSupport();

  const registerPasskey = async (userId: string, userName: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. サーバーから登録チャレンジを取得
      const beginResponse = await apiClient.post<PasskeyRegistrationBeginResponse>(
        '/auth/passkey/register/begin',
        { userId, userName }
      );

      // 2. WebAuthnでパスキーを作成
      const credential = await passkeyService.createPasskey(
        beginResponse.challenge,
        userId,
        userName
      );

      // 3. サーバーに登録を完了
      await apiClient.post('/auth/passkey/register/complete', {
        userId,
        credential,
      });

      return true;
    } catch (err) {
      console.error('Passkey registration error:', err);
      setError('パスキーの登録に失敗しました');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const authenticateWithPasskey = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. サーバーから認証チャレンジを取得
      const beginResponse = await apiClient.post<PasskeyAuthenticationBeginResponse>(
        '/auth/passkey/authenticate/begin',
        {}
      );

      // 2. WebAuthnで認証
      const credential = await passkeyService.authenticateWithPasskey(
        beginResponse.challenge,
        beginResponse.allowCredentials
      );

      // 3. サーバーで認証を完了
      const authResponse = await apiClient.post<AuthenticationCompleteResponse>(
        '/auth/passkey/authenticate/complete',
        { credential }
      );

      return authResponse;
    } catch (err) {
      console.error('Passkey authentication error:', err);
      setError('パスキーでの認証に失敗しました');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deletePasskey = async (credentialId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await apiClient.delete(`/auth/passkey/${credentialId}`);
      return true;
    } catch (err) {
      console.error('Passkey deletion error:', err);
      setError('パスキーの削除に失敗しました');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isSupported,
    isLoading,
    error,
    registerPasskey,
    authenticateWithPasskey,
    deletePasskey,
  };
}