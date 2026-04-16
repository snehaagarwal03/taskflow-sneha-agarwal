import type { User } from '@/types';

const BASE_URL = 'http://localhost:4000';

/**
 * Generate a JWT-like token string.
 * Not cryptographically signed — this is a mock only.
 * The token encodes the user ID so verifyAuth can identify the user.
 */
export function generateToken(user: User): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ user_id: user.id, email: user.email }));
  const signature = btoa(`mock-signature-${user.id}`);
  return `${header}.${payload}.${signature}`;
}

/**
 * Extract user ID from a mock JWT token.
 */
function getUserIdFromToken(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1])) as { user_id?: string };
    return payload.user_id ?? null;
  } catch {
    return null;
  }
}

/**
 * Check the Authorization header and return the user ID if valid.
 * Returns null if missing or malformed.
 */
export function verifyAuth(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.slice(7);
  return getUserIdFromToken(token);
}

/**
 * Strip the base URL from a request path.
 * MSW matches full URLs, but we need the path for matching.
 */
export function getPath(url: string): string {
  return url.replace(BASE_URL, '');
}
