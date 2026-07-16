const creatableStatusOptions = ['Chef de service', 'Chef de mission', 'Chef auditeur', 'Auditeur'] as const;

export const profileStatusOptions = [
  'Directeur',
  'Chef de département',
  'Chef de service',
  'Chef de mission',
  'Chef auditeur',
  'Auditeur',
] as const;

export const sessionStatusOptions = creatableStatusOptions;

type CreatableStatusOption = (typeof creatableStatusOptions)[number];

function normalizeText(value?: string): string {
  return (value ?? '')
    .trim()
    .normalize('NFD')
    .replaceAll(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function normalizeProfileStatus(value?: string): string {
  const normalizedValue = normalizeText(value);

  if (!normalizedValue) {
    return 'Chef de département';
  }

  if (normalizedValue === 'admin' || normalizedValue.includes('administrateur') || normalizedValue.includes('directeur')) {
    return 'Directeur';
  }

  if (normalizedValue.includes('chef') && normalizedValue.includes('service')) {
    return 'Chef de service';
  }

  if (normalizedValue.includes('chef') && normalizedValue.includes('departement')) {
    return 'Chef de département';
  }

  if (normalizedValue.includes('chef') && normalizedValue.includes('mission')) {
    return 'Chef de mission';
  }

  if (normalizedValue.includes('chef') && normalizedValue.includes('auditeur')) {
    return 'Chef auditeur';
  }

  if (normalizedValue === 'auditor' || normalizedValue.includes('auditeur')) {
    return 'Auditeur';
  }

  return 'Chef de département';
}

export function canAccessFullApplication(status?: string): boolean {
  const normalizedStatus = normalizeProfileStatus(status);

  return (
    normalizedStatus === 'Directeur' ||
    normalizedStatus === 'Chef de département' ||
    normalizedStatus === 'Chef de service'
  );
}

export function getCreatableStatusOptions(status?: string): readonly CreatableStatusOption[] {
  const normalizedStatus = normalizeProfileStatus(status);

  if (
    normalizedStatus === 'Directeur' ||
    normalizedStatus === 'Chef de département' ||
    normalizedStatus === 'Chef de service' ||
    normalizedStatus === 'Chef de mission'
  ) {
    return creatableStatusOptions;
  }

  if (normalizedStatus === 'Chef auditeur') {
    return ['Auditeur'];
  }

  return [];
}

export function getDefaultCreatableStatus(status?: string): CreatableStatusOption {
  const options = getCreatableStatusOptions(status);

  if (options.includes('Auditeur')) {
    return 'Auditeur';
  }

  return options[0] ?? 'Auditeur';
}

export function canManagePersonnel(status?: string): boolean {
  return getCreatableStatusOptions(status).length > 0;
}
