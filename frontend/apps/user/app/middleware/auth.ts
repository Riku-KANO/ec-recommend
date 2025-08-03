import { NextRequest, NextResponse } from 'next/server';

// 認証が必要なパスのパターン
const PROTECTED_PATHS = [
  '/profile',
  '/cart',
  '/orders',
  '/checkout',
  '/settings',
];

// 公開パス（認証不要）
const PUBLIC_PATHS = [
  '/',
  '/auth/signin',
  '/auth/signup',
  '/auth/signin/passkey',
  '/products',
  '/categories',
  '/search',
  '/about',
  '/help',
  '/terms',
  '/privacy',
];

/**
 * パスが保護されているかチェック
 */
function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some(path => pathname.startsWith(path));
}

/**
 * パスが公開パスかチェック
 */
function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(path => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  });
}

/**
 * 認証ミドルウェア
 */
export async function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 開発モードで認証をスキップする場合
  const skipAuth = process.env.NEXT_PUBLIC_SKIP_AUTH === 'true';
  if (skipAuth) {
    return NextResponse.next();
  }

  // 公開パスは認証チェックをスキップ
  if (isPublicPath(pathname)) {
    return;
  }

  // 保護されたパスの場合は認証をチェック
  if (isProtectedPath(pathname)) {
    const token = getTokenFromRequest(request);

    if (!token) {
      return redirectToLogin(request, pathname);
    }

    // トークンの有効性をチェック
    const isValid = await validateToken(token);
    if (!isValid) {
      return redirectToLogin(request, pathname);
    }
  }

  // 認証OKまたは保護されていないパスの場合は処理を続行
  return NextResponse.next();
}

/**
 * リクエストからトークンを取得
 */
function getTokenFromRequest(request: NextRequest): string | null {
  // Authorizationヘッダーから取得
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Cookieから取得
  const tokenCookie = request.cookies.get('accessToken');
  if (tokenCookie) {
    return tokenCookie.value;
  }

  return null;
}

/**
 * トークンの有効性を検証
 */
async function validateToken(token: string): Promise<boolean> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Token validation failed:', error);
    return false;
  }
}

/**
 * ログインページへリダイレクト
 */
function redirectToLogin(request: NextRequest, originalPath: string) {
  const loginUrl = new URL('/auth/signin', request.url);
  loginUrl.searchParams.set('redirect', originalPath);
  return NextResponse.redirect(loginUrl);
}