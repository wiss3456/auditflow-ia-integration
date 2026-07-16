import type { User } from '@/types/user';

export interface AuditorAccount extends User {
  department: string;
  email: string;
  firstName: string;
  id: string;
  isDisabled?: boolean;
  lastName: string;
  password: string;
  phone?: string;
  role: string;
  team?: string;
  username: string;
}

export interface CreateAuditorAccountInput {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  phone?: string;
  role: string;
  team: string;
}

interface AuditorAccountOverride {
  isDisabled?: boolean;
  password?: string;
}

const CUSTOM_AUDITOR_ACCOUNTS_KEY = 'auditflow-custom-auditor-accounts';
const AUDITOR_ACCOUNT_OVERRIDES_KEY = 'auditflow-auditor-account-overrides';

const seededAuditorAccounts = [
  {
    id: 'ONCF-AUD-001',
    avatar: '/assets/avatar-1.png',
    department: 'Audit Interne ONCF',
    email: 'rimdiab20@gmail.com',
    firstName: 'Rim',
    lastName: 'Diab',
    password: 'admin7',
    role: 'Chef de service',
    team: '1',
    username: 'rimdiab20',
  },
  {
    id: 'ONCF-AUD-002',
    avatar: '/assets/avatar-2.png',
    department: 'Audit Interne ONCF',
    email: 'yassinesadiki20@gmail.com',
    firstName: 'Yassine',
    lastName: 'Sadiki',
    password: 'admin7',
    role: 'Auditeur',
    team: '2',
    username: 'yassinesadiki20',
  },
] satisfies AuditorAccount[];

function sanitizeUsername(value: string): string {
  return value
    .normalize('NFD')
    .replaceAll(/[\u0300-\u036F]/g, '')
    .toLowerCase()
    .replaceAll(/[^a-z0-9]/g, '');
}

function loadAuditorOverrides(): Record<string, AuditorAccountOverride> {
  if (globalThis.window === undefined) {
    return {};
  }

  const rawOverrides = globalThis.localStorage.getItem(AUDITOR_ACCOUNT_OVERRIDES_KEY);

  if (!rawOverrides) {
    return {};
  }

  try {
    return JSON.parse(rawOverrides) as Record<string, AuditorAccountOverride>;
  } catch {
    globalThis.localStorage.removeItem(AUDITOR_ACCOUNT_OVERRIDES_KEY);
    return {};
  }
}

function saveAuditorOverrides(overrides: Record<string, AuditorAccountOverride>): void {
  globalThis.localStorage.setItem(AUDITOR_ACCOUNT_OVERRIDES_KEY, JSON.stringify(overrides));
}

export function loadCustomAuditorAccounts(): AuditorAccount[] {
  if (globalThis.window === undefined) {
    return [];
  }

  const rawAccounts = globalThis.localStorage.getItem(CUSTOM_AUDITOR_ACCOUNTS_KEY);

  if (!rawAccounts) {
    return [];
  }

  try {
    return (JSON.parse(rawAccounts) as AuditorAccount[]).map((account) => ({ ...account, isDisabled: Boolean(account.isDisabled) }));
  } catch {
    globalThis.localStorage.removeItem(CUSTOM_AUDITOR_ACCOUNTS_KEY);
    return [];
  }
}

function saveCustomAuditorAccounts(accounts: AuditorAccount[]): void {
  globalThis.localStorage.setItem(CUSTOM_AUDITOR_ACCOUNTS_KEY, JSON.stringify(accounts));
}

function getSeededAccounts(): AuditorAccount[] {
  const overrides = loadAuditorOverrides();

  return seededAuditorAccounts.map((account) => ({
    ...account,
    ...overrides[account.id],
  }));
}

function getAllAuditorAccounts(): AuditorAccount[] {
  return [...getSeededAccounts(), ...loadCustomAuditorAccounts()];
}

export function loadAllAuditorAccounts(): AuditorAccount[] {
  return getAllAuditorAccounts();
}

export function isCustomAuditorAccount(userId: string): boolean {
  return loadCustomAuditorAccounts().some((account) => account.id === userId);
}

function createAuditorId(existingAccounts: AuditorAccount[]): string {
  const usedIndexes = existingAccounts
    .map((account) => account.id.match(/ONCF-AUD-(\d+)/)?.[1])
    .map(Number)
    .filter((value) => Number.isFinite(value));

  const nextIndex = (usedIndexes.length > 0 ? Math.max(...usedIndexes) : 0) + 1;
  return `ONCF-AUD-${String(nextIndex).padStart(3, '0')}`;
}

export function createGeneratedAuditorPassword(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  const randomBuffer = new Uint8Array(10);
  globalThis.crypto.getRandomValues(randomBuffer);

  return Array.from(randomBuffer, (value) => alphabet[value % alphabet.length]).join('');
}

export function createAuditorAccount(input: CreateAuditorAccountInput): AuditorAccount {
  const existingAccounts = getAllAuditorAccounts();
  const usernameBase = sanitizeUsername(`${input.firstName}.${input.lastName}`) || sanitizeUsername(input.email.split('@')[0] ?? 'auditeur');
  let username = usernameBase;
  let counter = 1;

  while (existingAccounts.some((account) => account.username.toLowerCase() === username.toLowerCase())) {
    username = `${usernameBase}${counter}`;
    counter += 1;
  }

  const nextAccount: AuditorAccount = {
    avatar: '/assets/avatar.png',
    department: 'Audit Interne ONCF',
    email: input.email.trim(),
    firstName: input.firstName.trim(),
    id: createAuditorId(existingAccounts),
    isDisabled: false,
    lastName: input.lastName.trim(),
    password: input.password,
    phone: input.phone?.trim(),
    role: input.role.trim() || 'Auditeur',
    team: input.team,
    username,
  };

  saveCustomAuditorAccounts([...loadCustomAuditorAccounts(), nextAccount]);
  return nextAccount;
}

export function updateAuditorPassword(userId: string, password: string): AuditorAccount | null {
  const customAccounts = loadCustomAuditorAccounts();
  const customIndex = customAccounts.findIndex((account) => account.id === userId);

  if (customIndex !== -1) {
    const nextAccount = { ...customAccounts[customIndex], password };
    const nextCustomAccounts = customAccounts.map((account, index) => (index === customIndex ? nextAccount : account));

    saveCustomAuditorAccounts(nextCustomAccounts);
    return nextAccount;
  }

  const seededAccount = seededAuditorAccounts.find((account) => account.id === userId);

  if (!seededAccount) {
    return null;
  }

  const overrides = loadAuditorOverrides();
  const nextOverrides = {
    ...overrides,
    [userId]: {
      ...overrides[userId],
      password,
    },
  };

  saveAuditorOverrides(nextOverrides);
  return { ...seededAccount, ...nextOverrides[userId] };
}

export function deleteCustomAuditorAccount(userId: string): boolean {
  const currentAccounts = loadCustomAuditorAccounts();
  const nextAccounts = currentAccounts.filter((account) => account.id !== userId);

  if (nextAccounts.length === currentAccounts.length) {
    return false;
  }

  saveCustomAuditorAccounts(nextAccounts);
  return true;
}

export function setAuditorAccountDisabled(userId: string, isDisabled: boolean): AuditorAccount | null {
  const currentAccounts = loadCustomAuditorAccounts();
  const accountIndex = currentAccounts.findIndex((account) => account.id === userId);

  if (accountIndex !== -1) {
    const nextAccount = { ...currentAccounts[accountIndex], isDisabled };
    const nextAccounts = currentAccounts.map((account, index) => (index === accountIndex ? nextAccount : account));

    saveCustomAuditorAccounts(nextAccounts);
    return nextAccount;
  }

  const seededAccount = seededAuditorAccounts.find((account) => account.id === userId);

  if (!seededAccount) {
    return null;
  }

  const overrides = loadAuditorOverrides();
  const nextOverrides = {
    ...overrides,
    [userId]: {
      ...overrides[userId],
      isDisabled,
    },
  };

  saveAuditorOverrides(nextOverrides);
  return { ...seededAccount, ...nextOverrides[userId] };
}

export function createStoredUser(account: AuditorAccount): User {
  return {
    avatar: account.avatar,
    department: account.department,
    email: account.email,
    firstName: account.firstName,
    id: account.id,
    lastName: account.lastName,
    name: `${account.firstName} ${account.lastName}`,
    phone: account.phone,
    role: account.role,
    team: account.team,
    username: account.username,
  };
}

export function findAuditorAccount(identifier: string): AuditorAccount | undefined {
  const normalizedIdentifier = identifier.trim().toLowerCase();

  return getAllAuditorAccounts().find((account) => {
    return account.email.toLowerCase() === normalizedIdentifier || account.username.toLowerCase() === normalizedIdentifier;
  });
}

export function findAuditorAccountById(userId: string): AuditorAccount | undefined {
  return getAllAuditorAccounts().find((account) => account.id === userId);
}
