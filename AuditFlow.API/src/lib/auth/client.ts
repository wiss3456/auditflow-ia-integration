'use client';

import type { User } from '@/types/user';
import { apiRequest, ApiError } from '@/lib/api/http';
import { mergeUserWithStoredProfile } from '@/lib/profile-storage';

const SESSION_TOKEN_KEY = 'custom-auth-token';
const SESSION_USER_KEY = 'custom-auth-user';

export interface SignUpParams {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
}

export interface SignInWithOAuthParams {
  provider: 'google' | 'discord';
}

export interface SignInWithPasswordParams {
  identifier: string;
  password: string;
}

export interface ResetPasswordParams {
  email: string;
}

export interface UpdatePasswordParams {
  password: string;
  userId: string;
}

export interface UpdateProfileParams {
  firstName: string;
  lastName: string;
  phone?: string;
  statusLabel?: string;
  team?: string;
}

export interface BackendUserResponse {
  email: string;
  firstName: string;
  id: string;
  isDisabled: boolean;
  lastName: string;
  phone?: string | null;
  role: string;
  statusLabel: string;
  team: string;
}

interface BackendAuthResponse {
  expiresAtUtc: string;
  token: string;
  user: BackendUserResponse;
}

function mapBackendUserToFrontendUser(user: BackendUserResponse): User {
  return {
    accessRole: user.role,
    department: 'Audit Interne ONCF',
    email: user.email,
    firstName: user.firstName,
    id: user.id,
    isDisabled: user.isDisabled,
    lastName: user.lastName,
    name: `${user.firstName} ${user.lastName}`.trim(),
    phone: user.phone ?? undefined,
    role: user.statusLabel,
    team: user.team,
    username: user.email,
  };
}

function persistSession(token: string, user: BackendUserResponse): void {
  localStorage.setItem(SESSION_TOKEN_KEY, token);
  localStorage.setItem(SESSION_USER_KEY, JSON.stringify(mapBackendUserToFrontendUser(user)));
}

function clearSession(): void {
  localStorage.removeItem(SESSION_TOKEN_KEY);
  localStorage.removeItem(SESSION_USER_KEY);
}

function readToken(): string | null {
  return localStorage.getItem(SESSION_TOKEN_KEY);
}

function getAuthorizationHeaders(): HeadersInit {
  const token = readToken();

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

class AuthClient {
  async signUp(_: SignUpParams): Promise<{ error?: string }> {
    return { error: "L'inscription libre n'est pas disponible." };
  }

  async signInWithOAuth(_: SignInWithOAuthParams): Promise<{ error?: string }> {
    return { error: 'Social authentication not implemented' };
  }

  async signInWithPassword(params: SignInWithPasswordParams): Promise<{ error?: string }> {
    try {
      const response = await apiRequest<BackendAuthResponse>('/api/auth/login', {
        body: JSON.stringify({
          email: params.identifier.trim(),
          password: params.password,
        }),
        method: 'POST',
      });

      persistSession(response.token, response.user);
      return {};
    } catch (error) {
      if (error instanceof ApiError) {
        return { error: error.message };
      }

      return { error: 'Connexion impossible au backend d’authentification.' };
    }
  }

  async resetPassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'La reinitialisation du mot de passe est reservee a l’administration.' };
  }

  async updatePassword(params: UpdatePasswordParams): Promise<{ error?: string }> {
    try {
      await apiRequest<void>('/api/users/me/password', {
        body: JSON.stringify({ password: params.password }),
        headers: getAuthorizationHeaders(),
        method: 'PUT',
      });

      return {};
    } catch (error) {
      if (error instanceof ApiError) {
        return { error: error.message };
      }

      return { error: 'Mise a jour du mot de passe impossible.' };
    }
  }

  async updateProfile(params: UpdateProfileParams): Promise<{ data?: User; error?: string }> {
    try {
      const response = await apiRequest<BackendUserResponse>('/api/users/me/profile', {
        body: JSON.stringify({
          firstName: params.firstName,
          lastName: params.lastName,
          phone: params.phone ?? null,
          statusLabel: params.statusLabel ?? null,
          team: params.team ?? null,
        }),
        headers: getAuthorizationHeaders(),
        method: 'PUT',
      });

      const nextUser = mapBackendUserToFrontendUser(response);
      localStorage.setItem(SESSION_USER_KEY, JSON.stringify(nextUser));
      return { data: mergeUserWithStoredProfile(nextUser) ?? nextUser };
    } catch (error) {
      if (error instanceof ApiError) {
        return { error: error.message };
      }

      return { error: 'Mise a jour du profil impossible.' };
    }
  }

  async getUser(): Promise<{ data?: User | null; error?: string }> {
    const token = readToken();

    if (!token) {
      return { data: null };
    }

    try {
      const response = await apiRequest<BackendUserResponse>('/api/auth/me', {
        headers: getAuthorizationHeaders(),
        method: 'GET',
      });
      const nextUser = mapBackendUserToFrontendUser(response);
      localStorage.setItem(SESSION_USER_KEY, JSON.stringify(nextUser));
      return { data: mergeUserWithStoredProfile(nextUser) };
    } catch (error) {
      clearSession();

      if (error instanceof ApiError && error.status === 401) {
        return { data: null };
      }

      return { error: 'Chargement utilisateur impossible.' };
    }
  }

  async signOut(): Promise<{ error?: string }> {
    clearSession();
    return {};
  }

  getToken(): string | null {
    return readToken();
  }
}

export const authClient = new AuthClient();
export { mapBackendUserToFrontendUser };
export type { BackendAuthResponse };
