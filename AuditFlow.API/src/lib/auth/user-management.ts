'use client';

import { authClient, type BackendAuthResponse, type BackendUserResponse, mapBackendUserToFrontendUser } from '@/lib/auth/client';
import { apiRequest } from '@/lib/api/http';
import type { User } from '@/types/user';

export interface ManagedAccount extends User {
  accessRole?: string;
  isDisabled?: boolean;
}

export interface CreateManagedUserParams {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  phone?: string;
  statusLabel: string;
  team: string;
}

function mapStatusLabelToApiRole(statusLabel: string): 'Admin' | 'Auditor' | 'Manager' {
  const normalized = statusLabel.trim().toLowerCase();

  if (normalized.includes('directeur')) {
    return 'Admin';
  }

  if (normalized === 'auditeur') {
    return 'Auditor';
  }

  return 'Manager';
}

function mapUser(user: BackendUserResponse): ManagedAccount {
  return mapBackendUserToFrontendUser(user);
}

function getAuthHeaders(): HeadersInit {
  const token = authClient.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchManagedUsers(): Promise<ManagedAccount[]> {
  const response = await apiRequest<BackendUserResponse[]>('/api/users', {
    headers: getAuthHeaders(),
    method: 'GET',
  });

  return response.map((user) => mapUser(user));
}

export async function createManagedUser(params: CreateManagedUserParams): Promise<{ password: string; user: ManagedAccount }> {
  const response = await apiRequest<BackendAuthResponse>('/api/auth/register', {
    body: JSON.stringify({
      email: params.email,
      firstName: params.firstName,
      lastName: params.lastName,
      password: params.password,
      phone: params.phone ?? null,
      role: mapStatusLabelToApiRole(params.statusLabel),
      statusLabel: params.statusLabel,
      team: params.team,
    }),
    headers: getAuthHeaders(),
    method: 'POST',
  });

  return {
    password: params.password,
    user: mapUser(response.user),
  };
}

export async function setManagedUserDisabled(userId: string, isDisabled: boolean): Promise<ManagedAccount> {
  const response = await apiRequest<BackendUserResponse>(`/api/users/${userId}/disabled-state`, {
    body: JSON.stringify({ isDisabled }),
    headers: getAuthHeaders(),
    method: 'PATCH',
  });

  return mapUser(response);
}

export async function deleteManagedUser(userId: string): Promise<void> {
  await apiRequest<void>(`/api/users/${userId}`, {
    headers: getAuthHeaders(),
    method: 'DELETE',
  });
}
