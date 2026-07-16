import type { User } from '@/types/user';
import { normalizeProfileStatus, profileStatusOptions } from '@/lib/auth/roles';

export interface StoredProfile {
  avatar: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  status: string;
  team: string;
  timezone: string;
}

export const PROFILE_STORAGE_KEY = 'auditflow-profile';
export const PROFILE_UPDATED_EVENT = 'auditflow-profile-updated';

const VALID_STATUSES = profileStatusOptions;
const VALID_TEAMS = ['1', '2', '3'] as const;

function getNameParts(user?: User | null): { firstName: string; lastName: string } {
  if (typeof user?.firstName === 'string' && typeof user?.lastName === 'string' && user.firstName && user.lastName) {
    return { firstName: user.firstName, lastName: user.lastName };
  }

  if (typeof user?.name === 'string' && user.name.trim()) {
    const [firstName = 'Utilisateur', ...rest] = user.name.trim().split(' ');

    return { firstName, lastName: rest.join(' ') || 'AuditFlow' };
  }

  return { firstName: 'Utilisateur', lastName: 'AuditFlow' };
}

function getProfileScope(user?: User | null): string {
  const scope = user?.id ?? user?.email ?? user?.username ?? 'anonymous';
  return scope.trim().toLowerCase();
}

function getScopedProfileStorageKey(user?: User | null): string {
  return `${PROFILE_STORAGE_KEY}:${getProfileScope(user)}`;
}

function normalizeIdentity(value?: string | null): string {
  return value?.trim().toLowerCase() ?? '';
}

function normalizeStatus(value?: string): string {
  const normalizedStatus = normalizeProfileStatus(value);

  return VALID_STATUSES.includes(normalizedStatus as (typeof VALID_STATUSES)[number]) ? normalizedStatus : 'Chef de département';
}

function normalizeTeam(value?: string): string {
  if (!value) {
    return '1';
  }

  const trimmedValue = value.trim();
  return VALID_TEAMS.includes(trimmedValue as (typeof VALID_TEAMS)[number]) ? trimmedValue : '1';
}

function sanitizeStoredProfile(rawProfile: Partial<StoredProfile & { city?: string; jobTitle?: string }>, defaultProfile: StoredProfile): StoredProfile {
  return {
    ...defaultProfile,
    ...rawProfile,
    email: typeof rawProfile.email === 'string' && rawProfile.email.trim() ? rawProfile.email : defaultProfile.email,
    firstName: typeof rawProfile.firstName === 'string' && rawProfile.firstName.trim() ? rawProfile.firstName : defaultProfile.firstName,
    lastName: typeof rawProfile.lastName === 'string' && rawProfile.lastName.trim() ? rawProfile.lastName : defaultProfile.lastName,
    phone: typeof rawProfile.phone === 'string' && rawProfile.phone.trim() ? rawProfile.phone : defaultProfile.phone,
    status: normalizeStatus(rawProfile.status ?? rawProfile.jobTitle ?? defaultProfile.status),
    team: normalizeTeam(rawProfile.team ?? rawProfile.city ?? defaultProfile.team),
  };
}

function readStoredProfileFromKey(key: string, defaultProfile: StoredProfile): StoredProfile | null {
  const rawProfile = globalThis.localStorage.getItem(key);

  if (!rawProfile) {
    return null;
  }

  try {
    return sanitizeStoredProfile(JSON.parse(rawProfile) as Partial<StoredProfile & { city?: string; jobTitle?: string }>, defaultProfile);
  } catch {
    globalThis.localStorage.removeItem(key);
    return null;
  }
}

export function createDefaultProfile(user?: User | null): StoredProfile {
  const { firstName, lastName } = getNameParts(user);

  return {
    avatar: typeof user?.avatar === 'string' ? user.avatar : '/assets/avatar.png',
    email: typeof user?.email === 'string' ? user.email : 'utilisateur@auditflow.local',
    firstName,
    lastName,
    phone: typeof user?.phone === 'string' && user.phone.trim() ? user.phone : '+212 600 000 000',
    status: normalizeStatus(typeof user?.role === 'string' ? user.role : undefined),
    team: normalizeTeam(typeof user?.team === 'string' ? user.team : undefined),
    timezone: 'GMT+1',
  };
}

function profileMatchesCurrentUser(profile: StoredProfile, user?: User | null): boolean {
  if (!user) {
    return true;
  }

  const currentEmail = normalizeIdentity(user.email);

  if (currentEmail) {
    return normalizeIdentity(profile.email) === currentEmail;
  }

  const currentFullName = normalizeIdentity([user.firstName, user.lastName].filter((value): value is string => typeof value === 'string' && value.trim().length > 0).join(' '));

  if (currentFullName) {
    return normalizeIdentity(`${profile.firstName} ${profile.lastName}`) === currentFullName;
  }

  return true;
}

export function loadStoredProfile(user?: User | null): StoredProfile {
  const defaultProfile = createDefaultProfile(user);

  if (globalThis.window === undefined) {
    return defaultProfile;
  }

  const scopedKey = getScopedProfileStorageKey(user);
  const scopedProfile = readStoredProfileFromKey(scopedKey, defaultProfile);

  if (scopedProfile && profileMatchesCurrentUser(scopedProfile, user)) {
    return scopedProfile;
  }

  if (scopedProfile && !profileMatchesCurrentUser(scopedProfile, user)) {
    globalThis.localStorage.removeItem(scopedKey);
  }

  const legacyProfile = readStoredProfileFromKey(PROFILE_STORAGE_KEY, defaultProfile);

  if (legacyProfile && profileMatchesCurrentUser(legacyProfile, user)) {
    globalThis.localStorage.setItem(scopedKey, JSON.stringify(legacyProfile));
    return legacyProfile;
  }

  return defaultProfile;
}

export function saveStoredProfile(profile: StoredProfile, user?: User | null): void {
  if (globalThis.window === undefined) {
    return;
  }

  const scopedKey = getScopedProfileStorageKey(user);
  globalThis.localStorage.setItem(scopedKey, JSON.stringify(profile));
  globalThis.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));
}

export function mergeUserWithStoredProfile(user?: User | null): User | null {
  if (!user) {
    return null;
  }

  const storedProfile = loadStoredProfile(user);
  const firstName = storedProfile.firstName.trim() || user.firstName || '';
  const lastName = storedProfile.lastName.trim() || user.lastName || '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();

  return {
    ...user,
    avatar: storedProfile.avatar,
    email: storedProfile.email || user.email,
    firstName,
    lastName,
    name: fullName || user.name,
    role: user.role || storedProfile.status,
  };
}
