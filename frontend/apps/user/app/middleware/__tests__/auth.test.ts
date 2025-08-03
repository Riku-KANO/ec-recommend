import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch
global.fetch = vi.fn();

// Mock NextResponse
vi.mock('next/server', async () => {
  const actual = await vi.importActual('next/server');
  return {
    ...actual,
    NextResponse: {
      redirect: vi.fn(),
      next: vi.fn(),
    },
  };
});

// Import after mocks
const { authMiddleware } = await import('../auth');
const { NextResponse } = await import('next/server');

describe('authMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should redirect to login if no token is present', async () => {
    const request = new NextRequest('http://localhost:3001/profile');
    // No authorization header

    await authMiddleware(request);

    expect(NextResponse.redirect).toHaveBeenCalledWith(
      new URL('/auth/signin?redirect=/profile', request.url)
    );
  });

  it('should redirect to login if token is invalid', async () => {
    const request = new NextRequest('http://localhost:3001/profile', {
      headers: {
        authorization: 'Bearer invalid-token',
      },
    });

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 401,
    } as Response);

    await authMiddleware(request);

    expect(NextResponse.redirect).toHaveBeenCalledWith(
      new URL('/auth/signin?redirect=/profile', request.url)
    );
  });

  it('should allow access if token is valid', async () => {
    const request = new NextRequest('http://localhost:3001/profile', {
      headers: {
        authorization: 'Bearer valid-token',
      },
    });

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ valid: true }),
    } as Response);

    await authMiddleware(request);

    expect(NextResponse.next).toHaveBeenCalled();
  });

  it('should allow access to public routes without token', async () => {
    const request = new NextRequest('http://localhost:3001/');

    const result = await authMiddleware(request);

    expect(result).toBeUndefined(); // Should not redirect or block
  });

  it('should preserve redirect parameter', async () => {
    const request = new NextRequest('http://localhost:3001/cart');

    await authMiddleware(request);

    expect(NextResponse.redirect).toHaveBeenCalledWith(
      new URL('/auth/signin?redirect=/cart', request.url)
    );
  });
});