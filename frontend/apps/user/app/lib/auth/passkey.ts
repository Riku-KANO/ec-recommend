import {
  startRegistration,
  startAuthentication,
  browserSupportsWebAuthn,
} from '@simplewebauthn/browser';
import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from '@simplewebauthn/types';

export class PasskeyService {
  private rpId: string;
  private rpName: string;

  constructor() {
    // 開発環境と本番環境で適切なRPIDを設定
    this.rpId = process.env.NEXT_PUBLIC_PASSKEY_RP_ID || 'localhost';
    this.rpName = 'ECレコメンド';
  }

  /**
   * WebAuthnがサポートされているか確認
   */
  checkSupport(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }
    return browserSupportsWebAuthn();
  }

  /**
   * 新しいパスキーを作成
   */
  async createPasskey(
    challenge: string,
    userId: string,
    userName: string
  ): Promise<RegistrationResponseJSON> {
    const userIdBuffer = new TextEncoder().encode(userId);

    const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptionsJSON = {
      challenge,
      rp: {
        name: this.rpName,
        id: this.rpId,
      },
      user: {
        id: Array.from(userIdBuffer).map(b => String.fromCharCode(b)).join(''),
        name: userName,
        displayName: userName,
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' }, // ES256
        { alg: -257, type: 'public-key' }, // RS256
      ],
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
      },
      timeout: 60000,
      attestation: 'none',
    };

    try {
      const response = await startRegistration(publicKeyCredentialCreationOptions);
      return response;
    } catch (error) {
      console.error('Passkey registration failed:', error);
      throw error;
    }
  }

  /**
   * パスキーで認証
   */
  async authenticateWithPasskey(
    challenge: string,
    allowCredentials?: Array<{ id: string; type: 'public-key' }>
  ): Promise<AuthenticationResponseJSON> {
    const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptionsJSON = {
      challenge,
      rpId: this.rpId,
      userVerification: 'preferred',
      timeout: 60000,
    };

    if (allowCredentials && allowCredentials.length > 0) {
      publicKeyCredentialRequestOptions.allowCredentials = allowCredentials;
    }

    try {
      const response = await startAuthentication(publicKeyCredentialRequestOptions);
      return response;
    } catch (error) {
      console.error('Passkey authentication failed:', error);
      throw error;
    }
  }

  /**
   * バイナリデータをBase64URLエンコード
   */
  base64URLEncode(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let str = '';
    for (const byte of bytes) {
      str += String.fromCharCode(byte);
    }
    return btoa(str)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Base64URLデコード
   */
  base64URLDecode(str: string): ArrayBuffer {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
}