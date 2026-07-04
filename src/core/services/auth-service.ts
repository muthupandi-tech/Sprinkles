import { User } from "../entities/user";

export interface AuthService {
  signUpWithEmail(
    email: string,
    password: string,
    name: string
  ): Promise<{ success: boolean; error?: string }>;
  signInWithEmail(email: string, password: string): Promise<{ success: boolean; error?: string }>;
  signInWithGoogle(): Promise<{ success: boolean; error?: string }>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
}
