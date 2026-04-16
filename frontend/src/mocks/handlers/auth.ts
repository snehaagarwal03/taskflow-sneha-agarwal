import { http } from 'msw';
import { getUsers, saveUsers } from '../data';
import { generateToken } from '../utils';

const BASE_URL = 'http://localhost:4000';

interface RegisterBody {
  name?: string;
  email?: string;
  password?: string;
}

interface LoginBody {
  email?: string;
  password?: string;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const authHandlers = [
  // POST /auth/register
  http.post(`${BASE_URL}/auth/register`, async ({ request }) => {
    const body = (await request.json()) as RegisterBody;
    const { name, email, password } = body;

    // Validation
    const fields: Record<string, string> = {};
    if (!name || name.trim().length < 2) {
      fields.name = 'must be at least 2 characters';
    }
    if (!email || !isValidEmail(email)) {
      fields.email = 'must be a valid email address';
    }
    if (!password || password.length < 8) {
      fields.password = 'must be at least 8 characters';
    }

    if (Object.keys(fields).length > 0) {
      return new Response(
        JSON.stringify({ error: 'validation failed', fields }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Check for duplicate email
    const users = getUsers();
    if (users.some((u) => u.email === email!.toLowerCase())) {
      return new Response(
        JSON.stringify({ error: 'validation failed', fields: { email: 'already registered' } }),
        { status: 409, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Create user
    const newUser = {
      id: `user-${Date.now()}`,
      name: name!.trim(),
      email: email!.toLowerCase(),
      password: password!,
      created_at: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);

    const { password: _, ...userWithoutPassword } = newUser;
    const token = generateToken(newUser);

    return new Response(
      JSON.stringify({ token, user: userWithoutPassword }),
      { status: 201, headers: { 'Content-Type': 'application/json' } },
    );
  }),

  // POST /auth/login
  http.post(`${BASE_URL}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as LoginBody;
    const { email, password } = body;

    // Validation
    const fields: Record<string, string> = {};
    if (!email || !isValidEmail(email)) {
      fields.email = 'must be a valid email address';
    }
    if (!password || password.length < 8) {
      fields.password = 'must be at least 8 characters';
    }

    if (Object.keys(fields).length > 0) {
      return new Response(
        JSON.stringify({ error: 'validation failed', fields }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Check credentials
    const users = getUsers();
    const user = users.find(
      (u) => u.email === email!.toLowerCase() && u.password === password,
    );

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const { password: _, ...userWithoutPassword } = user;
    const token = generateToken(user);

    return new Response(
      JSON.stringify({ token, user: userWithoutPassword }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  }),
];
