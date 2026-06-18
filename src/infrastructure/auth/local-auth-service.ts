import type { IAuthService } from '@domain/repositories/interfaces';
import type { User } from '@domain/entities';
import { generateId } from '@domain/value-objects';
import { getItem, setItem, removeItem } from '../storage/chrome-storage';

const AUTH_KEY = 'auth_session';

interface AuthSession {
  user: User;
  token: string;
}

export class LocalAuthService implements IAuthService {
  async signIn(email: string, password: string): Promise<User> {
    const stored = await getItem<AuthSession>(AUTH_KEY);
    if (stored && stored.user.email === email) {
      return stored.user;
    }

    const user: User = {
      id: generateId(),
      email,
      name: email.split('@')[0] ?? 'User',
      createdAt: new Date().toISOString(),
      onboardingCompleted: false,
    };

    const session: AuthSession = {
      user,
      token: btoa(`${email}:${password}:${Date.now()}`),
    };
    await setItem(AUTH_KEY, session);
    return user;
  }

  async signUp(email: string, _password: string, name: string): Promise<User> {
    const user: User = {
      id: generateId(),
      email,
      name,
      createdAt: new Date().toISOString(),
      onboardingCompleted: false,
    };

    const session: AuthSession = {
      user,
      token: btoa(`${email}:${_password}:${Date.now()}`),
    };
    await setItem(AUTH_KEY, session);
    return user;
  }

  async signOut(): Promise<void> {
    await removeItem(AUTH_KEY);
  }

  async getCurrentUser(): Promise<User | null> {
    const session = await getItem<AuthSession>(AUTH_KEY);
    return session?.user ?? null;
  }

  async resetPassword(_email: string): Promise<void> {
    // In production, integrate with backend auth service
  }
}
