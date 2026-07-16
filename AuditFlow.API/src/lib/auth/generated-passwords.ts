'use client';

const PASSWORD_CACHE_KEY = 'auditflow-generated-user-passwords';

type PasswordCache = Record<string, string>;

function readCache(): PasswordCache {
  if (globalThis.window === undefined) {
    return {};
  }

  const raw = localStorage.getItem(PASSWORD_CACHE_KEY);

  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as PasswordCache;
  } catch {
    localStorage.removeItem(PASSWORD_CACHE_KEY);
    return {};
  }
}

function writeCache(cache: PasswordCache): void {
  localStorage.setItem(PASSWORD_CACHE_KEY, JSON.stringify(cache));
}

export function getGeneratedPasswordForUser(userId: string): string | null {
  return readCache()[userId] ?? null;
}

export function saveGeneratedPasswordForUser(userId: string, password: string): void {
  const cache = readCache();
  cache[userId] = password;
  writeCache(cache);
}

export function removeGeneratedPasswordForUser(userId: string): void {
  const cache = readCache();
  delete cache[userId];
  writeCache(cache);
}
