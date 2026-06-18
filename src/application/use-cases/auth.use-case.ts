import type { IAuthService } from '@domain/repositories/interfaces';
import type { User } from '@domain/entities';
import { AuthSignInSchema, AuthSignUpSchema } from '../dto';

export class AuthUseCase {
  constructor(private readonly authService: IAuthService) {}

  async signIn(input: unknown): Promise<User> {
    const parsed = AuthSignInSchema.parse(input);
    return this.authService.signIn(parsed.email, parsed.password);
  }

  async signUp(input: unknown): Promise<User> {
    const parsed = AuthSignUpSchema.parse(input);
    return this.authService.signUp(parsed.email, parsed.password, parsed.name);
  }

  async signOut(): Promise<void> {
    return this.authService.signOut();
  }

  async getCurrentUser(): Promise<User | null> {
    return this.authService.getCurrentUser();
  }

  async resetPassword(email: string): Promise<void> {
    return this.authService.resetPassword(email);
  }
}
